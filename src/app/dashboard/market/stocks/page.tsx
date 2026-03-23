import { createClient } from "@/lib/supabase/server";
import { TOP_STOCKS } from "@/lib/stocks";
import { fetchQuotes } from "@/lib/yahooFinanceApi";
import { unstable_cache } from "next/cache";
import StockList from "@/components/StockList";
import MarketTabs from "@/components/MarketTabs";
import LeagueSwitcher from "@/components/LeagueSwitcher";

const fetchStocks = unstable_cache(
  async () => {
    const symbols = TOP_STOCKS.map((s) => s.symbol);
    const quotes  = await fetchQuotes(symbols);
    return TOP_STOCKS.map(({ symbol, name }) => {
      const q = quotes.find((r) => r.symbol === symbol);
      return {
        symbol,
        name:     q?.longName ?? q?.shortName ?? name,
        price:    q?.regularMarketPrice ?? 0,
        change24h: q?.regularMarketChangePercent ?? 0,
      };
    });
  },
  ["stock-prices"],
  { revalidate: 60 }
);

export default async function StocksPage() {
  const [stocks, supabase] = await Promise.all([fetchStocks(), createClient()]);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile }  = user
    ? await supabase.from("profiles").select("cash_balance").eq("id", user.id).single()
    : { data: null };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p
          className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "var(--text-3)" }}
        >
          Markets
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          Market
        </h1>
      </div>

      <MarketTabs />

      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-xs" style={{ color: "var(--text-3)" }}>
          {stocks.length} stocks — prices update every 60s
        </p>
        <LeagueSwitcher />
      </div>

      <StockList stocks={stocks} cashBalance={profile?.cash_balance ?? 0} isAuthenticated={!!user} />
    </div>
  );
}
