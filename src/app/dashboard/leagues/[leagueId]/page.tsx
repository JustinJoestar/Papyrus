import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";

type LeaderboardEntry = {
  username: string;
  totalValue: number;
  rank: number;
  isCurrentUser: boolean;
};

const PODIUM = {
  1: {
    border:     "rgba(201,168,76,0.35)",
    badgeBg:    "rgba(201,168,76,0.12)",
    badgeColor: "var(--gold-bright)",
    label:      "GOLD",
  },
  2: {
    border:     "rgba(180,190,210,0.25)",
    badgeBg:    "rgba(180,190,210,0.08)",
    badgeColor: "#b0bccc",
    label:      "SILVER",
  },
  3: {
    border:     "rgba(180,110,60,0.28)",
    badgeBg:    "rgba(180,110,60,0.08)",
    badgeColor: "#c07040",
    label:      "BRONZE",
  },
} as const;

export default async function LeagueLeaderboardPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: league }, { data: rows }] = await Promise.all([
    supabase
      .from("leagues")
      .select("name, invite_code, owner_id")
      .eq("id", leagueId)
      .single(),
    supabase.rpc("get_league_leaderboard_holdings", {
      p_league_id: leagueId,
    }),
  ]);

  if (!league) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p
          className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4"
          style={{ color: "var(--text-3)" }}
        >
          Not Found
        </p>
        <Link
          href="/dashboard/leagues"
          className="text-sm font-mono transition-colors"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={undefined}
        >
          ← Back to My Leagues
        </Link>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    redirect("/dashboard/leagues");
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
      allRows.filter((r) => r.asset_type === "stock" && r.symbol).map((r) => r.symbol)
    ),
  ];
  const commoditySymbols = [
    ...new Set(
      allRows.filter((r) => r.asset_type === "commodity" && r.symbol).map((r) => r.symbol)
    ),
  ];

  const [coins, stockPrices, commodityPrices] = await Promise.all([
    getTopCoins(),
    stockSymbols.length > 0 ? getStockPrices(stockSymbols) : Promise.resolve({}),
    commoditySymbols.length > 0 ? getCommodityPrices(commoditySymbols) : Promise.resolve({}),
  ]);

  const priceMap: Record<string, number> = {
    ...buildPriceMap(coins),
    ...stockPrices,
    ...commodityPrices,
  };

  const userMap: Record<string, { username: string; cashBalance: number; holdingsValue: number }> = {};

  for (const row of allRows) {
    if (!userMap[row.user_id]) {
      userMap[row.user_id] = { username: row.username, cashBalance: row.cash_balance, holdingsValue: 0 };
    }
    if (row.symbol && row.quantity) {
      userMap[row.user_id].holdingsValue += (priceMap[row.symbol] ?? 0) * row.quantity;
    }
  }

  const entries: LeaderboardEntry[] = Object.entries(userMap)
    .map(([userId, data]) => ({
      username: data.username,
      totalValue: data.cashBalance + data.holdingsValue,
      rank: 0,
      isCurrentUser: userId === user.id,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const podium = entries.slice(0, 3);
  const rest   = entries.slice(3);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Back link */}
      <Link
        href="/dashboard/leagues"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors mb-8"
        style={{ color: "var(--text-3)" }}
      >
        ← My Leagues
      </Link>

      {/* Header */}
      <div className="mb-6">
        <p
          className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "var(--text-3)" }}
        >
          Private League
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          {league.name}
        </h1>
      </div>

      {/* Invite code */}
      <div
        className="inline-flex items-center gap-3 rounded-xl px-4 py-2.5 mb-8"
        style={{
          background: "var(--elevated)",
          border: "1px solid var(--border-mid)",
        }}
      >
        <span
          className="font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ color: "var(--text-3)" }}
        >
          Code
        </span>
        <code
          className="font-mono text-sm tracking-widest"
          style={{ color: "var(--gold)" }}
        >
          {league.invite_code}
        </code>
      </div>

      {/* Podium — top 3 */}
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
                  background: isMe ? "rgba(201,168,76,0.04)" : "var(--surface)",
                  border: `1px solid ${isMe ? "rgba(201,168,76,0.35)" : style.border}`,
                  ...(entry.rank === 1 ? { animation: "rank1-aura 2.8s ease-in-out infinite" } : {}),
                }}
              >
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

                <p
                  className="font-mono font-bold text-lg"
                  style={{ color: isMe ? "var(--gold-bright)" : style.badgeColor }}
                >
                  ${fmt(entry.totalValue)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <div className="space-y-1.5">
          {rest.map((entry) => (
            <div
              key={entry.username}
              className="rounded-xl px-5 py-3.5 flex items-center gap-4"
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
                  <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--gold-dim)" }}>
                    you
                  </span>
                )}
              </div>
              <p
                className="font-mono font-semibold text-sm"
                style={{ color: entry.isCurrentUser ? "var(--gold)" : "var(--text-2)" }}
              >
                ${fmt(entry.totalValue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
