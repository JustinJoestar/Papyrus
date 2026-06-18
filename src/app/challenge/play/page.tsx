import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchQuotes } from "@/lib/yahooFinanceApi";
import { TOP_STOCKS } from "@/lib/stocks";
import ContestPlay from "@/components/challenge/ContestPlay";
import { contestStatus, CONTEST, formatContestDate } from "@/lib/challenge";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Portfolio — Papyrus Summer Trading Challenge" };

export default async function PlayPage() {
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
          <h1 className="font-bold text-3xl mb-4" style={{ color: "var(--text-1)" }}>
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
    .select("id, name, starting_balance, starts_at, ends_at, is_contest")
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

  const { data: holdingsRaw } = await supabase
    .from("league_holdings")
    .select("symbol, quantity, avg_buy_price")
    .eq("league_id", contest.id)
    .eq("user_id", user.id);

  // Live quotes for the whole tradeable universe
  const quotes = await fetchQuotes(TOP_STOCKS.map((s) => s.symbol));
  const quoteBySymbol = new Map(quotes.map((q) => [q.symbol, q]));

  const market = TOP_STOCKS.map((s) => {
    const q = quoteBySymbol.get(s.symbol);
    return {
      symbol: s.symbol,
      name: q?.longName ?? q?.shortName ?? s.name,
      price: q?.regularMarketPrice ?? 0,
      change: q?.regularMarketChangePercent ?? 0,
    };
  });

  const holdings = (holdingsRaw ?? []).map((h) => {
    const price = quoteBySymbol.get(h.symbol)?.regularMarketPrice ?? Number(h.avg_buy_price);
    return {
      symbol: h.symbol,
      quantity: Number(h.quantity),
      avgBuyPrice: Number(h.avg_buy_price),
      price,
      value: price * Number(h.quantity),
    };
  });

  return (
    <ContestPlay
      contestName={contest.name}
      leagueId={contest.id}
      startsAt={contest.starts_at}
      endsAt={contest.ends_at}
      startingBalance={Number(contest.starting_balance)}
      cash={Number(membership.league_cash_balance)}
      holdings={holdings}
      market={market}
    />
  );
}
