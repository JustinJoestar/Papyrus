import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";
import ResetCountdown from "@/components/ResetCountdown";

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

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

  const podium = entries.slice(0, 3);
  const rest   = entries.slice(3);

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

      {entries.length === 0 ? (
        <p className="text-center py-16 font-mono text-sm" style={{ color: "var(--text-3)" }}>
          No traders on the leaderboard yet.
        </p>
      ) : (
        <>
          {/* ── Podium — Top 3 ─────────────────────────────── */}
          {podium.length > 0 && (
            <div className="space-y-3 mb-3">
              {podium.map((entry) => {
                const style = PODIUM[entry.rank as 1 | 2 | 3] ?? PODIUM[3];
                const isMe  = entry.isCurrentUser;

                return (
                  <div
                    key={entry.username}
                    className="relative rounded-2xl px-6 py-5 flex items-center gap-4"
                    style={{
                      background: isMe
                        ? "rgba(201,168,76,0.04)"
                        : "var(--surface)",
                      border: `1px solid ${isMe ? "rgba(201,168,76,0.35)" : style.border}`,
                      ...(entry.rank === 1 ? { animation: "rank1-aura 2.8s ease-in-out infinite" } : {}),
                    }}
                  >
                    {/* Rank badge */}
                    <div
                      className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0"
                      style={{
                        background: isMe ? "rgba(201,168,76,0.12)" : style.badgeBg,
                        border: `1px solid ${isMe ? "rgba(201,168,76,0.3)" : style.border}`,
                      }}
                    >
                      <span
                        className="font-mono font-bold text-base leading-none"
                        style={{ color: isMe ? "var(--gold-bright)" : style.badgeColor }}
                      >
                        {entry.rank}
                      </span>
                      <span
                        className="font-mono text-[8px] tracking-wider mt-0.5"
                        style={{ color: isMe ? "var(--gold-dim)" : style.badgeColor, opacity: 0.7 }}
                      >
                        {style.label}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate" style={{ color: "var(--text-1)" }}>
                          {entry.username}
                        </p>
                        {isMe && (
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                            style={{
                              background: "rgba(201,168,76,0.12)",
                              border: "1px solid rgba(201,168,76,0.25)",
                              color: "var(--gold)",
                            }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className="font-mono font-bold text-lg"
                        style={{ color: isMe ? "var(--gold-bright)" : style.valueColor }}
                      >
                        ${fmt(entry.totalValue)}
                      </p>
                      <p
                        className="font-mono text-[10px] tracking-wide"
                        style={{ color: "var(--text-3)" }}
                      >
                        ${fmt(entry.cashBalance)} cash
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Remaining rankings ──────────────────────────── */}
          {rest.length > 0 && (
            <div className="space-y-1.5 mb-12">
              {rest.map((entry) => (
                <div
                  key={entry.username}
                  className="rounded-xl px-5 py-3.5 flex items-center gap-4 transition-colors"
                  style={{
                    background: entry.isCurrentUser ? "rgba(201,168,76,0.03)" : "var(--surface)",
                    border: `1px solid ${entry.isCurrentUser ? "rgba(201,168,76,0.2)" : "var(--border)"}`,
                  }}
                >
                  <span
                    className="font-mono text-xs w-8 shrink-0 tabular-nums"
                    style={{ color: "var(--text-3)" }}
                  >
                    #{entry.rank}
                  </span>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <p className="text-sm truncate" style={{ color: "var(--text-2)" }}>
                      {entry.username}
                    </p>
                    {entry.isCurrentUser && (
                      <span
                        className="text-[10px] font-mono shrink-0"
                        style={{ color: "var(--gold-dim)" }}
                      >
                        you
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className="font-mono font-semibold text-sm"
                      style={{
                        color: entry.isCurrentUser ? "var(--gold)" : "var(--text-2)",
                      }}
                    >
                      ${fmt(entry.totalValue)}
                    </p>
                    <p
                      className="font-mono text-[10px]"
                      style={{ color: "var(--text-3)" }}
                    >
                      ${fmt(entry.cashBalance)} cash
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Last week's champions ───────────────────────────── */}
      {lastWeekTop3.length > 0 && (
        <div>
          <div className="mb-4">
            <p
              className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
              style={{ color: "var(--text-3)" }}
            >
              Previous Week
            </p>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-2)" }}>
              Champions — {lastWeekDate}
            </h2>
          </div>

          <div className="space-y-2">
            {lastWeekTop3.map((entry) => (
              <div
                key={entry.username}
                className="rounded-xl px-5 py-3.5 flex items-center gap-4"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <span className="text-base w-8 text-center shrink-0">
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                </span>
                <p className="flex-1 text-sm truncate" style={{ color: "var(--text-3)" }}>
                  {entry.username}
                </p>
                <p className="font-mono font-semibold text-sm" style={{ color: "var(--text-3)" }}>
                  ${fmt(entry.final_value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
