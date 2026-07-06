import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOP_STOCKS } from "@/lib/stocks";
import { fetchQuotes } from "@/lib/yahooFinanceApi";
import { unstable_cache } from "next/cache";
import StockList from "@/components/StockList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Market — Papyrus Challenge" };

const fetchChallengeStocks = unstable_cache(
  async () => {
    const symbols = TOP_STOCKS.map((s) => s.symbol);
    const quotes  = await fetchQuotes(symbols);
    return TOP_STOCKS.map(({ symbol, name }) => {
      const q = quotes.find((r) => r.symbol === symbol);
      return {
        symbol,
        name:      q?.longName ?? q?.shortName ?? name,
        price:     q?.regularMarketPrice ?? 0,
        change24h: q?.regularMarketChangePercent ?? 0,
      };
    });
  },
  ["challenge-stock-prices"],
  { revalidate: 60 }
);

export default async function ChallengeMarketPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/challenge/enroll");

  const { data: membership } = await supabase
    .from("league_members")
    .select("league_cash_balance")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const stocks = await fetchChallengeStocks();
  const cashBalance = Number(membership?.league_cash_balance ?? 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: "var(--text-3)" }}>
          Challenge
        </p>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--text-1)" }}>Market</h1>
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-xs" style={{ color: "var(--text-3)" }}>
          {stocks.length} stocks — prices update every 60s
        </p>
        <span
          className="font-mono text-[10px] tracking-[0.18em] px-2 py-1 rounded"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
        >
          STOCKS ONLY
        </span>
      </div>

      <StockList stocks={stocks} cashBalance={cashBalance} isAuthenticated={!!user} detailBasePath="/challenge/market" loginHref="/challenge/enroll" />
    </div>
  );
}
