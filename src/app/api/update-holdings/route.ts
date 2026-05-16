import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { fetchCommodities } from "@/lib/commodities";

// Runs every 5 minutes to refresh live prices.
// Warms Next.js data cache so leaderboard/dashboard serve fresh prices.
// Does NOT reset portfolios.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const secret = process.env.CRON_SECRET;
  const validSecret = secret && auth === `Bearer ${secret}`;
  if (!isVercelCron && !validSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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

  const stockSymbols = [
    ...new Set(
      allRows
        .filter((r) => r.asset_type === "stock" && r.symbol)
        .map((r) => r.symbol)
    ),
  ];

  const [coins, stockPrices, commodities] = await Promise.all([
    getTopCoins(),
    stockSymbols.length > 0 ? getStockPrices(stockSymbols) : Promise.resolve({}),
    fetchCommodities(),
  ]);

  const priceMap: Record<string, number> = {
    ...buildPriceMap(coins),
    ...stockPrices,
    ...Object.fromEntries(commodities.map((c) => [c.symbol, c.price])),
  };

  const userCount = new Set(allRows.map((r) => r.user_id)).size;
  const symbolCount = Object.keys(priceMap).length;

  return NextResponse.json({
    success: true,
    usersTracked: userCount,
    pricesFetched: symbolCount,
    updatedAt: new Date().toISOString(),
  });
}
