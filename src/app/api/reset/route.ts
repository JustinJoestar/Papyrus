import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { fetchCommodities } from "@/lib/commodities";

// Vercel Cron Jobs send GET requests.
// Also callable manually: GET /api/reset  (Authorization: Bearer <CRON_SECRET>)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const secret = process.env.CRON_SECRET;
  const validSecret = secret && auth === `Bearer ${secret}`;
  if (!isVercelCron && !validSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service role key so we can read all users and bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Fetch all current holdings for every user
  const { data: rows, error: fetchError } = await supabase.rpc(
    "get_leaderboard_holdings"
  );
  if (fetchError || !rows) {
    return NextResponse.json(
      { error: fetchError?.message ?? "Failed to fetch holdings" },
      { status: 500 }
    );
  }

  type HoldingRow = {
    user_id: string;
    username: string;
    cash_balance: number;
    symbol: string;
    quantity: number;
    asset_type: string;
  };
  const allRows = rows as HoldingRow[];

  // 2. Collect unique symbols per asset type for price lookup
  const stockSymbols = [
    ...new Set(
      allRows
        .filter((r) => r.asset_type === "stock" && r.symbol)
        .map((r) => r.symbol)
    ),
  ];

  const [coins, stockPrices, commodities] = await Promise.all([
    getTopCoins(),
    stockSymbols.length > 0
      ? getStockPrices(stockSymbols)
      : Promise.resolve({}),
    fetchCommodities(),
  ]);

  const priceMap: Record<string, number> = {
    ...buildPriceMap(coins),
    ...stockPrices,
    ...Object.fromEntries(commodities.map((c) => [c.symbol, c.price])),
  };

  // 3. Compute total portfolio value per user
  const userMap: Record<
    string,
    { username: string; cashBalance: number; holdingsValue: number }
  > = {};

  for (const row of allRows) {
    if (!userMap[row.user_id]) {
      userMap[row.user_id] = {
        username: row.username,
        cashBalance: row.cash_balance,
        holdingsValue: 0,
      };
    }
    if (row.symbol && row.quantity) {
      const price = priceMap[row.symbol] ?? 0;
      userMap[row.user_id].holdingsValue += price * row.quantity;
    }
  }

  // 4. Rank users and build snapshot rows
  const weekEnd = new Date().toISOString();
  const snapshots = Object.values(userMap)
    .map((u) => ({
      username: u.username,
      final_value: Number((u.cashBalance + u.holdingsValue).toFixed(2)),
    }))
    .sort((a, b) => b.final_value - a.final_value)
    .map((u, i) => ({ ...u, rank: i + 1, week_end: weekEnd }));

  // 5. Save leaderboard snapshot
  if (snapshots.length > 0) {
    const { error: snapError } = await supabase
      .from("weekly_snapshots")
      .insert(snapshots);
    if (snapError) {
      return NextResponse.json(
        { error: `Snapshot failed: ${snapError.message}` },
        { status: 500 }
      );
    }
  }

  // 6. Reset all portfolios
  const { error: resetError } = await supabase.rpc("perform_weekly_reset");
  if (resetError) {
    return NextResponse.json(
      { error: `Reset failed: ${resetError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, usersReset: snapshots.length });
}
