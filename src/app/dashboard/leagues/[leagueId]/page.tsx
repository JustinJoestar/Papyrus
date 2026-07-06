import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";
import LeagueMembers from "@/components/LeagueMembers";
import RankMedallion from "@/components/RankMedallion";
import Guilloche from "@/components/Guilloche";

type LeaderboardEntry = {
  username: string;
  avatarUrl: string | null;
  totalValue: number;
  rank: number;
  isCurrentUser: boolean;
};

const METAL_TEXT = {
  1: "var(--gold-bright)",
  2: "var(--metal-silver)",
  3: "var(--metal-bronze)",
} as const;

function Avatar({ username, avatarUrl, size = 8 }: { username: string; avatarUrl: string | null; size?: number }) {
  const initials = (username ?? "?").slice(0, 2).toUpperCase();
  const dim = `${size * 4}px`;
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0"
      style={{ width: dim, height: dim, background: avatarUrl ? "transparent" : "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span className="font-mono font-bold" style={{ fontSize: `${size * 1.4}px`, color: "var(--gold)" }}>
          {initials}
        </span>
      )}
    </div>
  );
}

/* Progress toward the leader — the heart of the challenge */
function ChaseBar({ pct, metal, index }: { pct: number; metal?: string; index: number }) {
  return (
    <div
      className="h-[3px] rounded-full overflow-hidden mt-2.5"
      style={{ background: "var(--border)" }}
    >
      <div
        className="bar-grow h-full rounded-full"
        style={{
          "--i": index,
          width: `${Math.max(2, Math.min(100, pct))}%`,
          background: metal ?? "var(--gold-dim)",
          opacity: 0.85,
        } as React.CSSProperties}
      />
    </div>
  );
}

export default async function LeagueLeaderboardPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: league }, { data: rows }, { data: memberRows }] = await Promise.all([
    supabase
      .from("leagues")
      .select("name, invite_code, owner_id, starting_balance")
      .eq("id", leagueId)
      .single(),
    supabase.rpc("get_league_leaderboard_holdings", { p_league_id: leagueId }),
    supabase.rpc("get_league_members", { p_league_id: leagueId }),
  ]);

  if (!league) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="label-ledger mb-4">Not Found</p>
        <Link href="/dashboard/leagues" className="text-sm font-mono" style={{ color: "var(--text-3)" }}>
          ← Back to My Leagues
        </Link>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    redirect("/dashboard/leagues");
  }

  type HoldingRow = {
    user_id: string; username: string; cash_balance: number;
    symbol: string; quantity: number; asset_type: string;
  };
  const allRows = rows as HoldingRow[];

  const stockSymbols = [...new Set(allRows.filter((r) => r.asset_type === "stock" && r.symbol).map((r) => r.symbol))];
  const commoditySymbols = [...new Set(allRows.filter((r) => r.asset_type === "commodity" && r.symbol).map((r) => r.symbol))];

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

  // Fetch avatars for all members
  const userIds = Object.keys(userMap);
  const { data: avatarRows } = await supabase
    .from("profiles")
    .select("id, avatar_url")
    .in("id", userIds);
  const avatarMap = Object.fromEntries((avatarRows ?? []).map((r) => [r.id, r.avatar_url as string | null]));

  const entries: LeaderboardEntry[] = Object.entries(userMap)
    .map(([userId, data]) => ({
      username: data.username,
      avatarUrl: avatarMap[userId] ?? null,
      totalValue: data.cashBalance + data.holdingsValue,
      rank: 0,
      isCurrentUser: userId === user.id,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const champion    = entries[0];
  const challengers = entries.slice(1, 3);
  const rest        = entries.slice(3);
  const leaderValue = champion?.totalValue || 1;
  const isOwner     = league.owner_id === user.id;

  const startBal = league.starting_balance ?? 10000;
  const champReturnPct = ((champion.totalValue - startBal) / startBal) * 100;
  const champUp = champReturnPct >= 0;

  type MemberRow = {
    user_id: string; username: string; avatar_url: string | null;
    is_owner: boolean; league_cash_balance: number; joined_at: string;
  };
  const members = (memberRows ?? []) as MemberRow[];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Back */}
      <Link
        href="/dashboard/leagues"
        className="rise inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors mb-8 hover:opacity-70"
        style={{ "--i": 0, color: "var(--text-3)" } as React.CSSProperties}
      >
        ← My Leagues
      </Link>

      {/* Header */}
      <div className="rise mb-6" style={{ "--i": 1 } as React.CSSProperties}>
        <p className="label-ledger mb-1.5">№ 05 — The Challenge</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: "var(--text-1)" }}>
          {league.name}
        </h1>
      </div>

      {/* Meta stamps: invite code + starting balance + field size */}
      <div
        className="rise inline-flex items-stretch rounded-xl overflow-hidden mb-10 flex-wrap"
        style={{ "--i": 2, border: "1px solid var(--border-mid)", background: "var(--card-bg)" } as React.CSSProperties}
      >
        <div className="px-4 py-2.5">
          <p className="label-ledger mb-0.5" style={{ letterSpacing: "0.2em", fontSize: 9 }}>Code</p>
          <code className="font-mono text-sm tracking-[0.2em]" style={{ color: "var(--gold)" }}>
            {league.invite_code}
          </code>
        </div>
        <div className="px-4 py-2.5" style={{ borderLeft: "1px solid var(--border)" }}>
          <p className="label-ledger mb-0.5" style={{ letterSpacing: "0.2em", fontSize: 9 }}>Start</p>
          <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: "var(--gold-dim)" }}>
            ${startBal.toLocaleString()}
          </span>
        </div>
        <div className="px-4 py-2.5" style={{ borderLeft: "1px solid var(--border)" }}>
          <p className="label-ledger mb-0.5" style={{ letterSpacing: "0.2em", fontSize: 9 }}>Field</p>
          <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: "var(--text-2)" }}>
            {entries.length} trader{entries.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Champion banner — rank 1 ─────────────────────────── */}
      {champion && (
        <div
          className="rise card-cert corner-frame animate-rank1-aura relative rounded-2xl px-6 sm:px-8 py-6 sm:py-7 mb-3 overflow-hidden"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          {/* Sheen pass */}
          <div className="banner-sheen" />
          {/* Rosette backdrop */}
          <div
            className="absolute pointer-events-none hidden sm:block"
            style={{ right: -90, top: "50%", transform: "translateY(-50%)", opacity: 0.7 }}
          >
            <Guilloche size={260} />
          </div>

          <div className="relative z-10 flex items-center gap-4 sm:gap-6">
            <RankMedallion rank={1} size={62} label="GOLD" />

            <div className="flex-1 min-w-0">
              <p className="label-ledger mb-1 crown-float inline-block" style={{ color: "var(--gold)", letterSpacing: "0.24em" }}>
                ♛ League Champion
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Avatar username={champion.username} avatarUrl={champion.avatarUrl} size={10} />
                {champion.isCurrentUser ? (
                  <p className="font-display font-semibold text-xl sm:text-2xl truncate" style={{ color: "var(--text-1)" }}>
                    {champion.username}
                  </p>
                ) : (
                  <Link
                    href={`/dashboard/profile/${encodeURIComponent(champion.username)}`}
                    className="font-display font-semibold text-xl sm:text-2xl truncate hover:underline"
                    style={{ color: "var(--text-1)" }}
                  >
                    {champion.username}
                  </Link>
                )}
                {champion.isCurrentUser && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}>
                    YOU
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="font-mono font-bold text-xl sm:text-2xl text-gold-shimmer tabular-nums">
                ${fmt(champion.totalValue)}
              </p>
              <p className="font-mono text-xs mt-1 tabular-nums" style={{ color: champUp ? "var(--gain)" : "var(--loss)" }}>
                {champUp ? "▲ +" : "▼ "}{champReturnPct.toFixed(2)}% return
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <ChaseBar pct={100} metal="var(--gold)" index={0} />
          </div>
        </div>
      )}

      {/* ── Challengers — ranks 2 & 3 ────────────────────────── */}
      {challengers.length > 0 && (
        <div className="space-y-3 mb-3">
          {challengers.map((entry, idx) => {
            const isMe = entry.isCurrentUser;
            const metalText = METAL_TEXT[entry.rank as 2 | 3];
            const behind = leaderValue - entry.totalValue;
            return (
              <div
                key={entry.username}
                className="rise relative rounded-2xl px-5 sm:px-6 py-4 sm:py-5 overflow-hidden"
                style={{
                  "--i": 4 + idx,
                  background: isMe ? "var(--gold-glow)" : "var(--card-bg)",
                  border: `1px solid ${isMe ? "var(--gold-border)" : "var(--border-mid)"}`,
                } as React.CSSProperties}
              >
                <div className="flex items-center gap-4">
                  <RankMedallion rank={entry.rank} size={46} label={entry.rank === 2 ? "SILVER" : "BRONZE"} />
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <Avatar username={entry.username} avatarUrl={entry.avatarUrl} size={9} />
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {isMe ? (
                        <p className="font-semibold truncate" style={{ color: "var(--text-1)" }}>{entry.username}</p>
                      ) : (
                        <Link
                          href={`/dashboard/profile/${encodeURIComponent(entry.username)}`}
                          className="font-semibold truncate hover:underline"
                          style={{ color: "var(--text-1)" }}
                        >
                          {entry.username}
                        </Link>
                      )}
                      {isMe && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}>
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-lg tabular-nums" style={{ color: metalText }}>
                      ${fmt(entry.totalValue)}
                    </p>
                    <p className="font-mono text-[10px] mt-0.5 tabular-nums" style={{ color: "var(--text-3)" }}>
                      −${fmt(behind)} to №1
                    </p>
                  </div>
                </div>
                <ChaseBar
                  pct={(entry.totalValue / leaderValue) * 100}
                  metal={entry.rank === 2 ? "var(--metal-silver)" : "var(--metal-bronze)"}
                  index={idx + 1}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ── The field — everyone else ────────────────────────── */}
      {rest.length > 0 && (
        <div className="rise sheet mb-12" style={{ "--i": 6 } as React.CSSProperties}>
          {rest.map((entry, idx) => (
            <div
              key={entry.username}
              className="px-5 py-3.5"
              style={{ background: entry.isCurrentUser ? "var(--gold-glow)" : "transparent" }}
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs w-8 shrink-0 tabular-nums" style={{ color: "var(--text-3)" }}>
                  #{entry.rank}
                </span>
                <Avatar username={entry.username} avatarUrl={entry.avatarUrl} size={7} />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  {entry.isCurrentUser ? (
                    <p className="text-sm truncate" style={{ color: "var(--text-1)" }}>{entry.username}</p>
                  ) : (
                    <Link
                      href={`/dashboard/profile/${encodeURIComponent(entry.username)}`}
                      className="text-sm truncate hover:underline"
                      style={{ color: "var(--text-2)" }}
                    >
                      {entry.username}
                    </Link>
                  )}
                  {entry.isCurrentUser && <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--gold-dim)" }}>you</span>}
                </div>
                <p className="font-mono font-semibold text-sm tabular-nums" style={{ color: entry.isCurrentUser ? "var(--gold)" : "var(--text-2)" }}>
                  ${fmt(entry.totalValue)}
                </p>
              </div>
              <ChaseBar pct={(entry.totalValue / leaderValue) * 100} index={Math.min(idx + 3, 10)} />
            </div>
          ))}
        </div>
      )}

      {/* Members section */}
      {members.length > 0 && (
        <LeagueMembers
          leagueId={leagueId}
          members={members}
          isOwner={isOwner}
          currentUserId={user.id}
        />
      )}
    </div>
  );
}
