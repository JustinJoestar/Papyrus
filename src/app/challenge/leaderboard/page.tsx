import Link from "next/link";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getHoldingPrices } from "@/lib/leaguePrices";
import { CONTEST, contestStatus, formatContestDate } from "@/lib/challenge";
import AutoRefresh from "@/components/challenge/AutoRefresh";
import RankMedallion from "@/components/RankMedallion";
import Guilloche from "@/components/Guilloche";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leaderboard — Papyrus Summer Trading Challenge" };

type Row = { rank: number; name: string; returnPct: number; value: number };
type ReferralRow = { rank: number; name: string; count: number };
type Standings = { contestName: string; started: boolean; rows: Row[]; referralRows: ReferralRow[] };

const fmtMoney = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

const METAL_TEXT = {
  1: "var(--gold-bright)",
  2: "var(--metal-silver)",
  3: "var(--metal-bronze)",
} as const;
const METAL_BAR = {
  1: "var(--gold)",
  2: "var(--metal-silver)",
  3: "var(--metal-bronze)",
} as const;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const raw = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return raw.toUpperCase();
}

/* Initials medallion — the challenge board stores names, not avatars. */
function Avatar({ name, size = 10 }: { name: string; size?: number }) {
  const dim = `${size * 4}px`;
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: dim, height: dim, background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
    >
      <span className="font-mono font-bold" style={{ fontSize: `${size * 1.4}px`, color: "var(--gold)" }}>
        {initialsOf(name)}
      </span>
    </div>
  );
}

/* Progress toward the leader */
function ChaseBar({ pct, metal, index }: { pct: number; metal?: string; index: number }) {
  return (
    <div className="h-[3px] rounded-full overflow-hidden mt-2.5" style={{ background: "var(--border)" }}>
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

async function loadStandings(): Promise<Standings | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const admin = createServiceClient(url, key);

  const { data: contest } = await admin
    .from("leagues")
    .select("id, name, starting_balance, starts_at")
    .eq("is_contest", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!contest) return null;

  const started = !contest.starts_at || Date.now() >= new Date(contest.starts_at).getTime();

  const [{ data: members }, { data: holdings }, { data: enrollments }] = await Promise.all([
    admin.from("league_members").select("user_id, league_cash_balance").eq("league_id", contest.id),
    admin.from("league_holdings").select("user_id, symbol, asset_type, quantity").eq("league_id", contest.id),
    admin.from("contest_enrollments").select("user_id, full_name, enrolled_at, referred_by").eq("league_id", contest.id),
  ]);

  const memberRows = members ?? [];
  if (memberRows.length === 0) return { contestName: contest.name, started, rows: [], referralRows: [] };

  const enrolledAtById = new Map<string, string>();
  const fullNameById = new Map<string, string>();
  for (const e of enrollments ?? []) {
    fullNameById.set(e.user_id, e.full_name);
    enrolledAtById.set(e.user_id, e.enrolled_at);
  }
  // Challenge leaderboard shows the enrollment FULL NAME (not Papyrus username).
  const nameById = new Map<string, string>(fullNameById);
  // Fall back to username only if a member somehow has no full name on file.
  const missing = memberRows.filter((m) => !nameById.has(m.user_id)).map((m) => m.user_id);
  if (missing.length > 0) {
    const { data: profs } = await admin.from("profiles").select("id, username").in("id", missing);
    for (const p of profs ?? []) {
      if (p.username) nameById.set(p.id, p.username);
    }
  }

  const { priceOf } = await getHoldingPrices(holdings ?? []);

  const holdingsValueByUser = new Map<string, number>();
  for (const h of holdings ?? []) {
    holdingsValueByUser.set(h.user_id, (holdingsValueByUser.get(h.user_id) ?? 0) + priceOf(h) * Number(h.quantity));
  }

  const start = Number(contest.starting_balance) || CONTEST.startingBalance;
  const base = memberRows.map((m) => {
    const value = Number(m.league_cash_balance) + (holdingsValueByUser.get(m.user_id) ?? 0);
    return {
      name: nameById.get(m.user_id) ?? "Trader",
      value,
      returnPct: ((value - start) / start) * 100,
      enrolledAt: enrolledAtById.get(m.user_id) ?? "",
    };
  });

  // Before trading: waitlist order (who joined first). After: rank by return.
  base.sort((a, b) =>
    started ? b.value - a.value : (a.enrolledAt || "").localeCompare(b.enrolledAt || "")
  );

  const rows: Row[] = base.map((r, i) => ({ rank: i + 1, name: r.name, returnPct: r.returnPct, value: r.value }));

  // Referral standings: how many entrants each participant brought in.
  const referralCounts = new Map<string, number>();
  for (const e of enrollments ?? []) {
    if (e.referred_by) referralCounts.set(e.referred_by, (referralCounts.get(e.referred_by) ?? 0) + 1);
  }
  const referralRows: ReferralRow[] = [...referralCounts.entries()]
    .map(([userId, count]) => ({
      name: nameById.get(userId) ?? "Trader",
      count,
      enrolledAt: enrolledAtById.get(userId) ?? "",
    }))
    // Ties go to whoever enrolled first.
    .sort((a, b) => b.count - a.count || (a.enrolledAt || "").localeCompare(b.enrolledAt || ""))
    .map((r, i) => ({ rank: i + 1, name: r.name, count: r.count }));

  return { contestName: contest.name, started, rows, referralRows };
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const referralView = view === "referrals";
  const data = await loadStandings();
  const status = contestStatus();
  const started = data?.started ?? (status === "live" || status === "ended");
  const entrants = data?.rows.length ?? 0;

  const leaderValue = data?.rows[0]?.value || 1;
  const topReferrals = data?.referralRows[0]?.count || 1;
  // Podium only makes sense once the board is ranked (trading live) or on the referral board.
  const showPodium = referralView || started;
  const tradingPodium = showPodium ? (data?.rows ?? []).slice(0, 3) : [];
  const tradingRest = showPodium ? (data?.rows ?? []).slice(3) : (data?.rows ?? []);
  const referralPodium = (data?.referralRows ?? []).slice(0, 3);
  const referralRest = (data?.referralRows ?? []).slice(3);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14">
      <AutoRefresh seconds={60} />

      <div className="rise flex items-center justify-between mb-2" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="label-ledger" style={{ letterSpacing: "0.24em" }}>
          {referralView ? "Referral Standings" : started ? "Live Leaderboard" : "The Waitlist"}
        </p>
        {status === "live" ? (
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider" style={{ color: "var(--gain)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-blink-dot" style={{ background: "var(--gain)" }} /> LIVE · UPDATES EVERY 60S
          </span>
        ) : !started ? (
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider" style={{ color: "var(--gold)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-blink-dot" style={{ background: "var(--gold)" }} /> PRE-LAUNCH
          </span>
        ) : null}
      </div>
      <h1 className="rise font-display font-semibold text-3xl sm:text-4xl mb-3" style={{ "--i": 1, color: "var(--text-1)" } as React.CSSProperties}>
        {data?.contestName ?? CONTEST.name}
      </h1>
      <p className="rise text-sm mb-6" style={{ "--i": 2, color: "var(--text-3)" } as React.CSSProperties}>
        {referralView
          ? "Ranked by friends recruited — every entrant who joins with your referral code counts."
          : started
          ? "Ranked by total return. Updates automatically every minute."
          : "Entrants in the order they joined. Everyone starts even when trading opens."}
      </p>

      {/* Stat banner — mirrors the global leaderboard's certificate header */}
      <div
        className="rise card-cert corner-frame rounded-2xl px-5 sm:px-7 py-4 sm:py-5 mb-6 flex flex-wrap items-center justify-between gap-4"
        style={{ "--i": 3 } as React.CSSProperties}
      >
        <div>
          <p className="label-ledger mb-1.5" style={{ letterSpacing: "0.22em" }}>
            {referralView ? "Recruiters" : "Entrants"}
          </p>
          <p className="font-mono text-xl font-bold tabular-nums" style={{ color: "var(--text-1)" }}>
            {referralView ? (data?.referralRows.length ?? 0) : entrants}
          </p>
        </div>
        <div className="text-right">
          <p className="label-ledger mb-1.5" style={{ letterSpacing: "0.22em" }}>
            Starting Balance
          </p>
          <p className="font-mono text-xl font-bold text-gold-gradient tabular-nums">{fmtMoney(CONTEST.startingBalance)}</p>
        </div>
      </div>

      {/* View tabs */}
      <div className="rise flex gap-2 mb-6" style={{ "--i": 4 } as React.CSSProperties}>
        {[
          { href: "/challenge/leaderboard", label: "📈 Trading", active: !referralView },
          { href: "/challenge/leaderboard?view=referrals", label: "🤝 Referrals", active: referralView },
        ].map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="font-mono text-[11px] tracking-wider px-4 py-2 rounded-xl transition-all"
            style={
              t.active
                ? { background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }
                : { background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-3)" }
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {!started && !referralView && (
        <div
          className="rise rounded-2xl px-5 py-4 mb-6 flex items-center gap-3 flex-wrap"
          style={{ "--i": 5, background: "var(--gold-glow)", border: "1px solid var(--gold-border)" } as React.CSSProperties}
        >
          <span className="text-lg">🏁</span>
          <p className="text-sm flex-1" style={{ color: "var(--text-2)" }}>
            Trading begins <span className="font-semibold" style={{ color: "var(--text-1)" }}>{formatContestDate(CONTEST.startsAt)}</span>.
            {entrants > 0 ? ` ${entrants} ${entrants === 1 ? "trader is" : "traders are"} locked in.` : " Be the first to claim a spot."}
          </p>
          <Link href="/challenge/enroll" className="font-mono text-[10px] tracking-wider px-4 py-2 rounded-lg" style={{ background: "var(--gold)", color: "#0a0800" }}>
            Get on the board →
          </Link>
        </div>
      )}

      {!data || data.rows.length === 0 ? (
        <div className="rise rounded-2xl p-10 text-center" style={{ "--i": 6, background: "var(--surface)", border: "1px solid var(--border-mid)" } as React.CSSProperties}>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            {!data ? "Standings will appear once the contest is set up." : "No one has entered yet — be the first on the board."}
          </p>
          <Link
            href="/challenge/enroll"
            className="inline-block mt-5 font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
          >
            Enter the Challenge →
          </Link>
        </div>
      ) : referralView ? (
        data.referralRows.length === 0 ? (
          <div className="rise rounded-2xl p-10 text-center" style={{ "--i": 6, background: "var(--surface)", border: "1px solid var(--border-mid)" } as React.CSSProperties}>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              No referrals yet — share your code and be the first on this board.
            </p>
            <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>
              Your code and invite link are on your portfolio page.
            </p>
            <Link
              href="/challenge/play"
              className="inline-block mt-5 font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl"
              style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
            >
              Get my invite link →
            </Link>
          </div>
        ) : (
          <>
            {/* Podium — top 3 recruiters */}
            <div className="space-y-3 mb-3">
              {referralPodium.map((r, idx) => {
                const first = r.rank === 1;
                const metalText = METAL_TEXT[r.rank as 1 | 2 | 3] ?? "var(--text-1)";
                return (
                  <div
                    key={r.rank}
                    className={`rise relative rounded-2xl px-5 sm:px-7 overflow-hidden ${first ? "card-cert corner-frame animate-rank1-aura py-6" : "py-5"}`}
                    style={{
                      "--i": idx,
                      background: first ? undefined : "var(--card-bg)",
                      border: first ? undefined : "1px solid var(--border-mid)",
                    } as React.CSSProperties}
                  >
                    {first && <div className="banner-sheen" />}
                    {first && (
                      <div className="absolute pointer-events-none hidden sm:block" style={{ right: -90, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }}>
                        <Guilloche size={220} />
                      </div>
                    )}
                    <div className="relative z-10 flex items-center gap-4 sm:gap-6">
                      <RankMedallion rank={r.rank} size={first ? 58 : 46} label={first ? "TOP RECRUITER" : undefined} />
                      <div className="flex-1 min-w-0">
                        {first && (
                          <p className="label-ledger mb-1 crown-float inline-block" style={{ color: "var(--gold)", letterSpacing: "0.24em" }}>
                            🤝 Most Referrals
                          </p>
                        )}
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={r.name} size={first ? 12 : 10} />
                          <p className={`font-display font-semibold truncate ${first ? "text-xl sm:text-2xl" : "text-lg"}`} style={{ color: "var(--text-1)" }}>
                            {r.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-mono font-bold tabular-nums ${first ? "text-xl sm:text-2xl text-gold-shimmer" : "text-lg"}`} style={first ? undefined : { color: metalText }}>
                          {r.count}
                        </p>
                        <p className="font-mono text-[10px] tracking-wide mt-1" style={{ color: "var(--text-3)" }}>
                          {r.count === 1 ? "recruit" : "recruits"}
                        </p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <ChaseBar pct={(r.count / topReferrals) * 100} metal={METAL_BAR[r.rank as 1 | 2 | 3]} index={idx} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Remaining recruiters */}
            {referralRest.length > 0 && (
              <div className="sheet">
                {referralRest.map((r, idx) => (
                  <div key={r.rank} className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm w-10 shrink-0 tabular-nums" style={{ color: "var(--text-3)" }}>#{r.rank}</span>
                      <Avatar name={r.name} size={9} />
                      <p className="flex-1 min-w-0 text-sm font-medium truncate" style={{ color: "var(--text-2)" }}>{r.name}</p>
                      <span
                        className="font-mono text-xs font-semibold tabular-nums px-2.5 py-1 rounded-md shrink-0"
                        style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
                      >
                        {r.count} {r.count === 1 ? "recruit" : "recruits"}
                      </span>
                    </div>
                    <ChaseBar pct={(r.count / topReferrals) * 100} index={Math.min(idx + 3, 10)} />
                  </div>
                ))}
              </div>
            )}
          </>
        )
      ) : (
        <>
          {/* Podium — top 3 traders (only once trading is live) */}
          {tradingPodium.length > 0 && (
            <div className="space-y-3 mb-3">
              {tradingPodium.map((r, idx) => {
                const first = r.rank === 1;
                const isGain = r.returnPct >= 0;
                const metalText = METAL_TEXT[r.rank as 1 | 2 | 3] ?? "var(--text-1)";
                return (
                  <div
                    key={r.rank}
                    className={`rise relative rounded-2xl px-5 sm:px-7 overflow-hidden ${first ? "card-cert corner-frame animate-rank1-aura py-6" : "py-5"}`}
                    style={{
                      "--i": idx,
                      background: first ? undefined : "var(--card-bg)",
                      border: first ? undefined : "1px solid var(--border-mid)",
                    } as React.CSSProperties}
                  >
                    {first && <div className="banner-sheen" />}
                    {first && (
                      <div className="absolute pointer-events-none hidden sm:block" style={{ right: -90, top: "50%", transform: "translateY(-50%)", opacity: 0.6 }}>
                        <Guilloche size={220} />
                      </div>
                    )}
                    <div className="relative z-10 flex items-center gap-4 sm:gap-6">
                      <RankMedallion rank={r.rank} size={first ? 58 : 46} label={r.rank === 1 ? "GOLD" : r.rank === 2 ? "SILVER" : "BRONZE"} />
                      <div className="flex-1 min-w-0">
                        {first && (
                          <p className="label-ledger mb-1 crown-float inline-block" style={{ color: "var(--gold)", letterSpacing: "0.24em" }}>
                            ♛ Top Trader
                          </p>
                        )}
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={r.name} size={first ? 12 : 10} />
                          <p className={`font-display font-semibold truncate ${first ? "text-xl sm:text-2xl" : "text-lg"}`} style={{ color: "var(--text-1)" }}>
                            {r.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-mono font-bold tabular-nums ${first ? "text-xl sm:text-2xl text-gold-shimmer" : "text-lg"}`} style={first ? undefined : { color: metalText }}>
                          {fmtMoney(r.value)}
                        </p>
                        <p className="font-mono text-xs tracking-wide mt-1 tabular-nums font-semibold" style={{ color: isGain ? "var(--gain)" : "var(--loss)" }}>
                          {fmtPct(r.returnPct)}
                        </p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <ChaseBar pct={(r.value / leaderValue) * 100} metal={METAL_BAR[r.rank as 1 | 2 | 3]} index={idx} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Remaining traders / full waitlist */}
          {tradingRest.length > 0 && (
            <div className="sheet">
              {tradingRest.map((r, idx) => {
                const isGain = r.returnPct >= 0;
                return (
                  <div key={r.rank} className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm w-10 shrink-0 tabular-nums" style={{ color: "var(--text-3)" }}>#{r.rank}</span>
                      <Avatar name={r.name} size={9} />
                      <p className="flex-1 min-w-0 text-sm font-medium truncate" style={{ color: "var(--text-2)" }}>{r.name}</p>
                      {started ? (
                        <div className="text-right shrink-0">
                          <p className="font-mono font-semibold text-sm tabular-nums" style={{ color: "var(--text-2)" }}>{fmtMoney(r.value)}</p>
                          <p className="font-mono text-xs tabular-nums font-semibold" style={{ color: isGain ? "var(--gain)" : "var(--loss)" }}>{fmtPct(r.returnPct)}</p>
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-md shrink-0" style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}>
                          READY
                        </span>
                      )}
                    </div>
                    {started && <ChaseBar pct={(r.value / leaderValue) * 100} index={Math.min(idx + 3, 10)} />}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3 pt-8">
        <Link href="/challenge" className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl" style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}>
          ← Back to Challenge
        </Link>
        <Link href="/challenge/play" className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl" style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}>
          Go to my portfolio →
        </Link>
      </div>
    </div>
  );
}
