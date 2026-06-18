import Link from "next/link";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getStockPrices } from "@/lib/stockPrices";
import { CONTEST, contestStatus } from "@/lib/challenge";
import AutoRefresh from "@/components/challenge/AutoRefresh";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leaderboard — Papyrus Summer Trading Challenge" };

type Row = { rank: number; name: string; returnPct: number; value: number };

const fmtMoney = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

async function loadStandings(): Promise<{ contestName: string; rows: Row[] } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const admin = createServiceClient(url, key);

  const { data: contest } = await admin
    .from("leagues")
    .select("id, name, starting_balance")
    .eq("is_contest", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!contest) return null;

  const [{ data: members }, { data: holdings }, { data: enrollments }] = await Promise.all([
    admin.from("league_members").select("user_id, league_cash_balance").eq("league_id", contest.id),
    admin.from("league_holdings").select("user_id, symbol, quantity").eq("league_id", contest.id),
    admin.from("contest_enrollments").select("user_id, full_name").eq("league_id", contest.id),
  ]);

  const memberRows = members ?? [];
  if (memberRows.length === 0) return { contestName: contest.name, rows: [] };

  // Names: prefer enrollment full name, fall back to username
  const nameById = new Map<string, string>();
  for (const e of enrollments ?? []) nameById.set(e.user_id, e.full_name);
  const missing = memberRows.filter((m) => !nameById.has(m.user_id)).map((m) => m.user_id);
  if (missing.length > 0) {
    const { data: profs } = await admin.from("profiles").select("id, username").in("id", missing);
    for (const p of profs ?? []) nameById.set(p.id, p.username);
  }

  // Live prices for held symbols
  const symbols = [...new Set((holdings ?? []).map((h) => h.symbol))];
  const prices = symbols.length > 0 ? await getStockPrices(symbols) : {};

  const holdingsValueByUser = new Map<string, number>();
  for (const h of holdings ?? []) {
    const price = prices[h.symbol] ?? 0;
    holdingsValueByUser.set(h.user_id, (holdingsValueByUser.get(h.user_id) ?? 0) + price * Number(h.quantity));
  }

  const start = Number(contest.starting_balance) || CONTEST.startingBalance;
  const rows: Row[] = memberRows
    .map((m) => {
      const value = Number(m.league_cash_balance) + (holdingsValueByUser.get(m.user_id) ?? 0);
      return { name: nameById.get(m.user_id) ?? "Trader", value, returnPct: ((value - start) / start) * 100, rank: 0 };
    })
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return { contestName: contest.name, rows };
}

const RANK_ACCENT = ["#e8c66a", "#c0c0c0", "#cd7f32"]; // gold / silver / bronze

export default async function LeaderboardPage() {
  const data = await loadStandings();
  const status = contestStatus();

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14">
      <AutoRefresh seconds={60} />

      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase" style={{ color: "var(--text-3)" }}>
          Leaderboard
        </p>
        {status === "live" && (
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider" style={{ color: "var(--gain)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-blink-dot" style={{ background: "var(--gain)" }} /> LIVE
          </span>
        )}
      </div>
      <h1 className="font-bold text-3xl sm:text-4xl mb-3" style={{ color: "var(--text-1)" }}>
        {data?.contestName ?? CONTEST.name}
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--text-3)" }}>
        Ranked by total return. Updates automatically every minute.
      </p>

      {!data || data.rows.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            {!data ? "Standings will appear once the contest is live." : "No one has entered yet — be the first on the board."}
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
            const accent = r.rank <= 3 ? RANK_ACCENT[r.rank - 1] : null;
            return (
              <div
                key={r.rank}
                className="rounded-2xl px-5 py-4 flex items-center gap-4"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${accent ? "var(--gold-border)" : "var(--border-mid)"}`,
                }}
              >
                <span
                  className="font-mono font-bold text-lg w-8 text-center shrink-0"
                  style={{ color: accent ?? "var(--text-3)" }}
                >
                  {r.rank}
                </span>
                <span className="flex-1 font-medium truncate" style={{ color: "var(--text-1)" }}>
                  {r.name}
                </span>
                <span className="font-mono text-sm tabular-nums" style={{ color: "var(--text-3)" }}>
                  {fmtMoney(r.value)}
                </span>
                <span
                  className="font-mono text-sm font-semibold tabular-nums w-24 text-right"
                  style={{ color: isGain ? "var(--gain)" : "var(--loss)" }}
                >
                  {fmtPct(r.returnPct)}
                </span>
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
