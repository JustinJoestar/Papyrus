import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";
import ResetCountdown from "@/components/ResetCountdown";
import LeaderboardClient from "@/components/LeaderboardClient";

type Holding = {
  symbol: string;
  quantity: number;
  assetType: string;
  value: number;
};

type LeaderboardEntry = {
  username: string;
  avatarUrl: string | null;
  totalValue: number;
  cashBalance: number;
  rank: number;
  isCurrentUser: boolean;
  holdings: Holding[];
};

type SnapshotEntry = {
  username: string;
  final_value: number;
  rank: number;
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: rows }, { data: snapRows }] = await Promise.all([
    supabase.rpc("get_leaderboard_holdings"),
    supabase
      .from("weekly_snapshots")
      .select("username, final_value, rank, week_end")
      .order("week_end", { ascending: false })
      .order("rank",     { ascending: true })
      .limit(50),
  ]);


  // ── Current leaderboard ─────────────────────────────────
  let entries: LeaderboardEntry[] = [];

  if (rows && rows.length > 0) {
    const allRows = rows as Array<{
      user_id: string; username: string; cash_balance: number;
      symbol: string; quantity: number; asset_type?: string;
    }>;

    const stockSymbols = [
      ...new Set(allRows.filter((r) => r.asset_type === "stock" && r.symbol).map((r) => r.symbol)),
    ];
    const commoditySymbols = [
      ...new Set(allRows.filter((r) => r.asset_type === "commodity" && r.symbol).map((r) => r.symbol)),
    ];

    const [coins, stockPrices, commodityPrices] = await Promise.all([
      getTopCoins(),
      stockSymbols.length > 0 ? getStockPrices(stockSymbols) : Promise.resolve({}),
      commoditySymbols.length > 0 ? getCommodityPrices(commoditySymbols) : Promise.resolve({}),
    ]);

    const priceMap: Record<string, number> = { ...buildPriceMap(coins), ...stockPrices, ...commodityPrices };
    const userMap: Record<string, { username: string; cashBalance: number; holdingsValue: number; holdings: Holding[] }> = {};

    for (const row of allRows) {
      if (!userMap[row.user_id]) {
        userMap[row.user_id] = { username: row.username, cashBalance: row.cash_balance, holdingsValue: 0, holdings: [] };
      }
      if (row.symbol && row.quantity) {
        const price = priceMap[row.symbol] ?? 0;
        const value = price * row.quantity;
        userMap[row.user_id].holdingsValue += value;
        userMap[row.user_id].holdings.push({
          symbol: row.symbol,
          quantity: row.quantity,
          assetType: row.asset_type ?? "crypto",
          value,
        });
      }
    }

    const userIds = Object.keys(userMap);
    const { data: avatarRows } = await supabase
      .from("profiles")
      .select("id, avatar_url")
      .in("id", userIds);
    const avatarMap = Object.fromEntries((avatarRows ?? []).map((r) => [r.id, r.avatar_url as string | null]));

    entries = Object.entries(userMap)
      .map(([userId, data]) => ({
        username: data.username,
        avatarUrl: avatarMap[userId] ?? null,
        totalValue: data.cashBalance + data.holdingsValue,
        cashBalance: data.cashBalance,
        rank: 0,
        isCurrentUser: userId === user?.id,
        holdings: data.holdings.sort((a, b) => b.value - a.value),
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));
  }

  // ── Last week snapshot ──────────────────────────────────
  let lastWeekTop3: SnapshotEntry[] = [];
  let lastWeekDate: string | null = null;

  if (snapRows && snapRows.length > 0) {
    const latestWeekEnd = snapRows[0].week_end;
    lastWeekDate = new Date(latestWeekEnd).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
    lastWeekTop3 = (snapRows as SnapshotEntry[])
      .filter((r: any) => r.week_end === latestWeekEnd)
      .slice(0, 3);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="rise mb-8" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="label-ledger mb-1.5">№ 03 — Competition</p>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-1)" }}>
          Global Leaderboard
        </h1>
      </div>

      {/* Reset countdown */}
      <div
        className="rise card-cert corner-frame rounded-2xl px-5 sm:px-7 py-4 sm:py-5 mb-8 flex flex-wrap items-center justify-between gap-4"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <div>
          <p className="label-ledger mb-1.5" style={{ letterSpacing: "0.22em" }}>
            Weekly Reset
          </p>
          <ResetCountdown />
        </div>
        <div className="text-right">
          <p className="label-ledger mb-1.5" style={{ letterSpacing: "0.22em" }}>
            Starting Balance
          </p>
          <p className="font-mono text-xl font-bold text-gold-gradient tabular-nums">$10,000</p>
        </div>
      </div>

      <LeaderboardClient
        entries={entries}
        lastWeekTop3={lastWeekTop3}
        lastWeekDate={lastWeekDate}
      />
    </div>
  );
}
