import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";
import ResetCountdown from "@/components/ResetCountdown";
import LeaderboardClient from "@/components/LeaderboardClient";

type LeaderboardEntry = {
  username: string;
  totalValue: number;
  cashBalance: number;
  rank: number;
  isCurrentUser: boolean;
};

type SnapshotEntry = {
  username: string;
  final_value: number;
  rank: number;
};

const PODIUM = {
  1: {
    border:     "rgba(201,168,76,0.35)",
    badgeBg:    "rgba(201,168,76,0.12)",
    badgeColor: "var(--gold-bright)",
    valueColor: "var(--gold-bright)",
    label:      "GOLD",
  },
  2: {
    border:     "rgba(180,190,210,0.25)",
    badgeBg:    "rgba(180,190,210,0.08)",
    badgeColor: "#b0bccc",
    valueColor: "#b0bccc",
    label:      "SILVER",
  },
  3: {
    border:     "rgba(180,110,60,0.28)",
    badgeBg:    "rgba(180,110,60,0.08)",
    badgeColor: "#c07040",
    valueColor: "#c07040",
    label:      "BRONZE",
  },
} as const;

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
    const userMap: Record<string, { username: string; cashBalance: number; holdingsValue: number }> = {};

    for (const row of allRows) {
      if (!userMap[row.user_id]) {
        userMap[row.user_id] = { username: row.username, cashBalance: row.cash_balance, holdingsValue: 0 };
      }
      if (row.symbol && row.quantity) {
        userMap[row.user_id].holdingsValue += (priceMap[row.symbol] ?? 0) * row.quantity;
      }
    }

    entries = Object.entries(userMap)
      .map(([userId, data]) => ({
        username: data.username,
        totalValue: data.cashBalance + data.holdingsValue,
        cashBalance: data.cashBalance,
        rank: 0,
        isCurrentUser: userId === user?.id,
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
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p
          className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "var(--text-3)" }}
        >
          Competition
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          Global Leaderboard
        </h1>
      </div>

      {/* Reset countdown */}
      <div
        className="rounded-2xl px-6 py-5 mb-8 flex items-center justify-between"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-mid)",
        }}
      >
        <div>
          <p
            className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1.5"
            style={{ color: "var(--text-3)" }}
          >
            Weekly Reset
          </p>
          <ResetCountdown />
        </div>
        <div className="text-right">
          <p
            className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1.5"
            style={{ color: "var(--text-3)" }}
          >
            Starting Balance
          </p>
          <p className="font-mono text-xl font-bold text-gold-gradient">$10,000</p>
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
