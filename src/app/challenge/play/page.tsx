import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHoldingPrices } from "@/lib/leaguePrices";
import { CONTEST, contestStatus, formatContestDate } from "@/lib/challenge";
import HoldingsList, { type HoldingWithPrice } from "@/components/HoldingsList";
import AutoRefresh from "@/components/challenge/AutoRefresh";
import ReferralCard from "@/components/challenge/ReferralCard";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portfolio — Papyrus Challenge" };

const EMBERS = [
  { left: "12%",  bottom: "18%", color: "#e2c56a", delay: "0s",   dur: "2.6s" },
  { left: "22%",  bottom: "24%", color: "#c9a24e", delay: "0.4s", dur: "3.1s" },
  { left: "35%",  bottom: "15%", color: "#f59e0b", delay: "0.9s", dur: "2.4s" },
  { left: "50%",  bottom: "20%", color: "#e2c56a", delay: "1.3s", dur: "3.3s" },
  { left: "64%",  bottom: "28%", color: "#c9a24e", delay: "0.2s", dur: "2.9s" },
  { left: "78%",  bottom: "16%", color: "#f0d060", delay: "0.7s", dur: "2.7s" },
  { left: "88%",  bottom: "22%", color: "#e2c56a", delay: "1.6s", dur: "3.0s" },
  { left: "42%",  bottom: "10%", color: "#c9a24e", delay: "2.0s", dur: "2.5s" },
];

export default async function ChallengePlayPage() {
  const status = contestStatus();

  if (status === "upcoming") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 mb-8"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }} />
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--gold)" }}>
              Coming Soon
            </span>
          </div>
          <h1 className="font-display font-semibold text-3xl mb-4" style={{ color: "var(--text-1)" }}>
            Challenge Portfolio
          </h1>
          <p className="text-sm mb-2" style={{ color: "var(--text-2)" }}>
            Enrollment opens <span className="font-semibold" style={{ color: "var(--text-1)" }}>{formatContestDate(CONTEST.enrollOpensAt)}</span>.
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
            Trading begins <span className="font-semibold" style={{ color: "var(--text-1)" }}>{formatContestDate(CONTEST.startsAt)}</span>.
          </p>
          <Link
            href="/challenge"
            className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
          >
            Learn about the Challenge →
          </Link>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/challenge/enroll");

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: holdingsRaw } = await supabase
    .from("league_holdings")
    .select("symbol, asset_type, quantity, avg_buy_price")
    .eq("league_id", contest.id)
    .eq("user_id", user.id);

  const { data: referralStats } = await supabase.rpc("get_contest_referral_stats", {
    p_league_id: contest.id,
  });

  const { priceOf, coinIdBySymbol } = await getHoldingPrices(holdingsRaw ?? []);

  const holdings: HoldingWithPrice[] = (holdingsRaw ?? []).map((h) => {
    const currentPrice = priceOf(h) || Number(h.avg_buy_price);
    return {
      id: `${contest.id}-${h.symbol}`,
      symbol: h.symbol,
      asset_type: h.asset_type ?? "stock",
      coinId: h.asset_type === "crypto" ? coinIdBySymbol[h.symbol.toUpperCase()] : undefined,
      quantity: Number(h.quantity),
      avg_buy_price: Number(h.avg_buy_price),
      currentPrice,
      currentValue: currentPrice * Number(h.quantity),
    };
  });

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cashBalance    = Number(membership.league_cash_balance);
  const holdingsValue  = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalValue     = cashBalance + holdingsValue;
  const startBal       = Number(contest.starting_balance) || CONTEST.startingBalance;
  const totalReturn    = totalValue - startBal;
  const totalReturnPct = (totalReturn / startBal) * 100;
  const isGain         = totalReturn >= 0;

  const tradingOpen = status === "live";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {tradingOpen && <AutoRefresh seconds={60} />}

      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: "var(--text-3)" }}>
          Welcome back
        </p>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--text-1)" }}>
          {profile?.username}
        </h1>
      </div>

      {/* Hero card */}
      <div
        className="relative rounded-2xl p-8 mb-4 overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none animate-flame-breathe"
          style={{
            background: isGain
              ? "radial-gradient(ellipse 70% 80% at 60% 110%, rgba(201,162,78,0.12) 0%, transparent 65%)"
              : "radial-gradient(ellipse 70% 80% at 60% 110%, rgba(244,63,94,0.10) 0%, transparent 65%)",
          }}
        />
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="ember"
            style={{ left: e.left, bottom: e.bottom, background: isGain ? e.color : "#f43f5e", animationDelay: e.delay, animationDuration: e.dur, opacity: 0 }}
          />
        ))}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base leading-none">🏆</span>
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase" style={{ color: "var(--text-3)" }}>
              {contest.name} — Portfolio
            </p>
          </div>
          <p className="font-mono text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-gold-shimmer">
            ${fmt(totalValue)}
          </p>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-sm font-semibold"
              style={{
                background: isGain ? "var(--gain-bg)" : "var(--loss-bg)",
                border:     `1px solid ${isGain ? "var(--gain-border)" : "var(--loss-border)"}`,
                color:      isGain ? "var(--gain)" : "var(--loss)",
              }}
            >
              {isGain ? "▲" : "▼"}{" "}
              {`${isGain ? "+" : ""}$${fmt(Math.abs(totalReturn))} (${isGain ? "+" : ""}${totalReturnPct.toFixed(2)}%)`}
            </span>
            <span className="text-[10px] font-mono tracking-widest" style={{ color: "var(--text-3)" }}>
              FROM ${fmt(startBal)} START
            </span>
          </div>
        </div>
      </div>

      {/* Status notice */}
      {status === "ended" && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-sm"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--text-2)" }}
        >
          The Challenge has ended — trading is closed. Final standings are locked.
        </div>
      )}
      {status === "enrolling" && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-sm"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--text-2)" }}
        >
          Trading opens <span className="font-semibold" style={{ color: "var(--text-1)" }}>{formatContestDate(CONTEST.startsAt)}</span> — browse the market and get ready.
        </div>
      )}

      {/* Cash / Holdings breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: "var(--text-3)" }}>Challenge Cash</p>
          <p className="font-mono text-2xl font-bold text-gold-gradient">${fmt(cashBalance)}</p>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>Available to invest</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: "var(--text-3)" }}>Holdings Value</p>
          <p className="font-mono text-2xl font-bold" style={{ color: "var(--text-1)" }}>${fmt(holdingsValue)}</p>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>{holdings.length} open position{holdings.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Referral share card */}
      {referralStats?.success && referralStats.code && (
        <div className="mb-10">
          <ReferralCard code={referralStats.code} count={referralStats.count ?? 0} />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Open Positions</h2>
        <span className="font-mono text-[10px] tracking-widest" style={{ color: "var(--text-3)" }}>{holdings.length} ASSETS</span>
      </div>

      <HoldingsList
        holdings={holdings}
        leagueId={contest.id}
        leagueName={contest.name}
        marketHref="/challenge/market"
      />
    </div>
  );
}
