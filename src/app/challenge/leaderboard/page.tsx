import Link from "next/link";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getStockPrices } from "@/lib/stockPrices";
import { CONTEST, contestStatus, formatContestDate } from "@/lib/challenge";
import AutoRefresh from "@/components/challenge/AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leaderboard — Papyrus Summer Trading Challenge" };

type Row = { rank: number; name: string; returnPct: number; value: number };
type Standings = { contestName: string; started: boolean; rows: Row[] };

const fmtMoney = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

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
    admin.from("league_holdings").select("user_id, symbol, quantity").eq("league_id", contest.id),
    admin.from("contest_enrollments").select("user_id, full_name, enrolled_at").eq("league_id", contest.id),
  ]);

  const memberRows = members ?? [];
  if (memberRows.length === 0) return { contestName: contest.name, started, rows: [] };

  const enrolledAtById = new Map<string, string>();
  const fullNameById = new Map<string, string>();
  for (const e of enrollments ?? []) {
    fullNameById.set(e.user_id, e.full_name);
    enrolledAtById.set(e.user_id, e.enrolled_at);
  }
  // Prefer Papyrus username from profiles; fall back to enrollment full_name
  const nameById = new Map<string, string>();
  const allUserIds = memberRows.map((m) => m.user_id);
  if (allUserIds.length > 0) {
    const { data: profs } = await admin.from("profiles").select("id, username").in("id", allUserIds);
    for (const p of profs ?? []) {
      if (p.username) nameById.set(p.id, p.username);
    }
  }
  for (const [userId, fullName] of fullNameById) {
    if (!nameById.has(userId)) nameById.set(userId, fullName);
  }

  const symbols = [...new Set((holdings ?? []).map((h) => h.symbol))];
  const prices = symbols.length > 0 ? await getStockPrices(symbols) : {};

  const holdingsValueByUser = new Map<string, number>();
  for (const h of holdings ?? []) {
    const price = prices[h.symbol] ?? 0;
    holdingsValueByUser.set(h.user_id, (holdingsValueByUser.get(h.user_id) ?? 0) + price * Number(h.quantity));
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
  return { contestName: contest.name, started, rows };
}

const RANK_ACCENT = ["#e8c66a", "#c0c0c0", "#cd7f32"]; // gold / silver / bronze

export default async function LeaderboardPage() {
  const data = await loadStandings();
  const status = contestStatus();
  const started = data?.started ?? (status === "live" || status === "ended");
  const entrants = data?.rows.length ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14">
      <AutoRefresh seconds={60} />

      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase" style={{ color: "var(--text-3)" }}>
          {started ? "Leaderboard" : "Waitlist"}
        </p>
        {status === "live" ? (
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider" style={{ color: "var(--gain)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-blink-dot" style={{ background: "var(--gain)" }} /> LIVE
          </span>
        ) : !started ? (
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider" style={{ color: "var(--gold)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }} /> PRE-LAUNCH
          </span>
        ) : null}
      </div>
      <h1 className="font-bold text-3xl sm:text-4xl mb-3" style={{ color: "var(--text-1)" }}>
        {data?.contestName ?? CONTEST.name}
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
        {started
          ? "Ranked by total return. Updates automatically every minute."
          : "Entrants in the order they joined. Everyone starts even when trading opens."}
      </p>

      {!started && (
        <div
          className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-3 flex-wrap"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
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
        <div className="rounded-2xl p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
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
      ) : (
        <div className="space-y-2">
          {data.rows.map((r) => {
            const isGain = r.returnPct >= 0;
            const accent = started && r.rank <= 3 ? RANK_ACCENT[r.rank - 1] : null;
            return (
              <div
                key={r.rank}
                className="rounded-2xl px-5 py-4 flex items-center gap-4"
                style={{ background: "var(--surface)", border: `1px solid ${accent ? "var(--gold-border)" : "var(--border-mid)"}` }}
              >
                <span className="font-mono font-bold text-lg w-8 text-center shrink-0" style={{ color: accent ?? "var(--text-3)" }}>
                  {r.rank}
                </span>
                <span className="flex-1 font-medium truncate" style={{ color: "var(--text-1)" }}>
                  {r.name}
                </span>
                {started ? (
                  <>
                    <span className="font-mono text-sm tabular-nums" style={{ color: "var(--text-3)" }}>{fmtMoney(r.value)}</span>
                    <span className="font-mono text-sm font-semibold tabular-nums w-24 text-right" style={{ color: isGain ? "var(--gain)" : "var(--loss)" }}>
                      {fmtPct(r.returnPct)}
                    </span>
                  </>
                ) : (
                  <span className="font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-md" style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}>
                    READY
                  </span>
                )}
              </div>
            );
          })}
        </div>
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
