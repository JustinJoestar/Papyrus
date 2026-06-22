import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStockPrices } from "@/lib/stockPrices";
import { CONTEST, contestStatus, formatContestDate } from "@/lib/challenge";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Challenge Profile — Papyrus" };

const fmtMoney = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export default async function ChallengeProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/challenge/enroll");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: contest } = await supabase
    .from("leagues")
    .select("id, name, starting_balance, starts_at, ends_at")
    .eq("is_contest", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!contest) redirect("/challenge");

  const { data: membership } = await supabase
    .from("league_members")
    .select("league_cash_balance")
    .eq("league_id", contest.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) redirect("/challenge/enroll");

  const { data: holdings } = await supabase
    .from("league_holdings")
    .select("symbol, quantity, avg_buy_price")
    .eq("league_id", contest.id)
    .eq("user_id", user.id);

  const { data: enrollment } = await supabase
    .from("contest_enrollments")
    .select("full_name, enrolled_at, school, grade")
    .eq("league_id", contest.id)
    .eq("user_id", user.id)
    .maybeSingle();

  const symbols = (holdings ?? []).map((h) => h.symbol);
  const prices = symbols.length > 0 ? await getStockPrices(symbols) : {};

  const holdingsWithValue = (holdings ?? []).map((h) => ({
    symbol: h.symbol,
    quantity: Number(h.quantity),
    avgBuyPrice: Number(h.avg_buy_price),
    price: prices[h.symbol] ?? Number(h.avg_buy_price),
    value: (prices[h.symbol] ?? Number(h.avg_buy_price)) * Number(h.quantity),
  }));

  const cash = Number(membership.league_cash_balance);
  const portfolioValue = holdingsWithValue.reduce((sum, h) => sum + h.value, 0);
  const totalValue = cash + portfolioValue;
  const startingBalance = Number(contest.starting_balance) || CONTEST.startingBalance;
  const returnPct = ((totalValue - startingBalance) / startingBalance) * 100;
  const isGain = returnPct >= 0;

  const status = contestStatus();
  const started = status === "live" || status === "ended";

  const initials = (profile?.username ?? "?").slice(0, 2).toUpperCase();
  const avatarUrl = profile?.avatar_url;
  const displayName = enrollment?.full_name ?? profile?.username ?? "Trader";

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-12">
      {/* Profile header */}
      <div className="flex items-center gap-5 mb-8">
        <div
          className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{
            background: avatarUrl ? "transparent" : "var(--gold-glow)",
            border: "2px solid var(--gold-border)",
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono font-bold text-lg" style={{ color: "var(--gold)" }}>
              {initials}
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="font-bold text-2xl" style={{ color: "var(--text-1)" }}>{displayName}</h1>
            <span
              className="font-mono text-[9px] tracking-[0.18em] px-1.5 py-0.5 rounded"
              style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
            >
              CHALLENGE
            </span>
          </div>
          {profile?.username && enrollment?.full_name && (
            <p className="font-mono text-xs" style={{ color: "var(--text-3)" }}>@{profile.username}</p>
          )}
          {enrollment?.enrolled_at && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
              Enrolled {formatContestDate(enrollment.enrolled_at)}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        >
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>
            Total Value
          </p>
          <p className="font-mono font-bold text-xl" style={{ color: "var(--text-1)" }}>
            {fmtMoney(totalValue)}
          </p>
          {started && (
            <p className="font-mono text-xs mt-1 font-semibold" style={{ color: isGain ? "var(--gain)" : "var(--loss)" }}>
              {fmtPct(returnPct)}
            </p>
          )}
        </div>

        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        >
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>
            Cash
          </p>
          <p className="font-mono font-bold text-xl" style={{ color: "var(--text-1)" }}>
            {fmtMoney(cash)}
          </p>
        </div>

        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        >
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>
            Positions
          </p>
          <p className="font-mono font-bold text-xl" style={{ color: "var(--text-1)" }}>
            {holdingsWithValue.length}
          </p>
        </div>

        <div
          className="rounded-2xl px-5 py-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        >
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>
            Invested
          </p>
          <p className="font-mono font-bold text-xl" style={{ color: "var(--text-1)" }}>
            {fmtMoney(portfolioValue)}
          </p>
        </div>
      </div>

      {/* Info */}
      {(enrollment?.school || enrollment?.grade) && (
        <div
          className="rounded-2xl px-5 py-4 mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        >
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: "var(--text-3)" }}>
            Details
          </p>
          <div className="space-y-1.5 text-sm" style={{ color: "var(--text-2)" }}>
            {enrollment?.school && <p>School: <span style={{ color: "var(--text-1)" }}>{enrollment.school}</span></p>}
            {enrollment?.grade && <p>Grade: <span style={{ color: "var(--text-1)" }}>{enrollment.grade}</span></p>}
          </div>
        </div>
      )}

      {/* Contest info */}
      <div
        className="rounded-2xl px-5 py-4 mb-8 flex items-center gap-3"
        style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
      >
        <div className="flex-1">
          <p className="font-mono text-[10px] tracking-wider uppercase mb-0.5" style={{ color: "var(--gold)" }}>
            {contest.name}
          </p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            {formatContestDate(contest.starts_at)} – {formatContestDate(contest.ends_at)}
          </p>
        </div>
        <span
          className="font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-lg"
          style={{ background: status === "live" ? "var(--gain-bg)" : "var(--elevated)", color: status === "live" ? "var(--gain)" : "var(--text-3)", border: `1px solid ${status === "live" ? "var(--gain-border)" : "var(--border)"}` }}
        >
          {status === "live" ? "● LIVE" : status === "ended" ? "ENDED" : "UPCOMING"}
        </span>
      </div>

      <div className="flex gap-3">
        <Link
          href="/challenge/play"
          className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl"
          style={{ background: "var(--gold)", color: "#0a0800" }}
        >
          My Portfolio →
        </Link>
        <Link
          href="/challenge/leaderboard"
          className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl"
          style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}
        >
          Leaderboard
        </Link>
      </div>
    </div>
  );
}
