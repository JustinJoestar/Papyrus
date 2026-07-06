import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOP_STOCKS } from "@/lib/stocks";
import { fetchQuote } from "@/lib/yahooFinanceApi";
import PriceChart from "@/components/PriceChart";
import CoinBuyButton from "@/components/CoinBuyButton";
import StockLogo from "@/components/StockLogo";
import Link from "next/link";

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  const stockMeta = TOP_STOCKS.find((s) => s.symbol === upperSymbol);
  if (!stockMeta) notFound();

  const [quote, supabase] = await Promise.all([
    fetchQuote(upperSymbol),
    createClient(),
  ]);

  if (!quote) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("cash_balance").eq("id", user.id).single()
    : { data: null };

  const price = quote.regularMarketPrice ?? 0;
  const change24h = quote.regularMarketChangePercent ?? 0;
  const isPositive = change24h >= 0;

  function fmtPrice(n: number) {
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function fmtLarge(n: number) {
    if (!n) return "—";
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    return fmtPrice(n);
  }

  const stats = [
    { label: "24h Volume",   value: fmtLarge(quote.regularMarketVolume ?? 0) },
    { label: "52-Week High", value: fmtPrice(quote.fiftyTwoWeekHigh ?? 0) },
    { label: "52-Week Low",  value: fmtPrice(quote.fiftyTwoWeekLow ?? 0) },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <Link
        href="/dashboard/market/stocks"
        className="rise inline-flex items-center font-mono text-[10px] tracking-[0.2em] uppercase transition-colors mb-8 hover:opacity-70"
        style={{ "--i": 0, color: "var(--text-3)" } as React.CSSProperties}
      >
        ← Back to Stocks
      </Link>

      {/* Header */}
      <div className="rise flex items-center justify-between mb-8 flex-wrap gap-4" style={{ "--i": 1 } as React.CSSProperties}>
        <div className="flex items-center gap-4">
          <div
            className="rounded-full shrink-0"
            style={{ border: "1px dashed var(--gold-border)", padding: 3 }}
          >
            <StockLogo symbol={upperSymbol} size={48} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-1)" }}>
              {quote.longName ?? stockMeta.name}
            </h1>
            <p className="font-mono text-sm" style={{ color: "var(--text-3)" }}>
              {upperSymbol} · {quote.fullExchangeName ?? "NYSE/NASDAQ"}
            </p>
          </div>
        </div>
        <CoinBuyButton
          coin={{ symbol: upperSymbol, name: quote.longName ?? stockMeta.name, price }}
          cashBalance={profile?.cash_balance ?? 0}
          assetType="stock"
          isAuthenticated={!!user}
        />
      </div>

      {/* Price */}
      <div className="rise mb-8" style={{ "--i": 2 } as React.CSSProperties}>
        <p className="text-5xl font-bold font-mono tabular-nums tracking-tight" style={{ color: "var(--text-1)" }}>
          {fmtPrice(price)}
        </p>
        <p
          className="inline-flex mt-3 text-sm font-semibold font-mono px-2.5 py-0.5 rounded-lg tabular-nums"
          style={{
            color: isPositive ? "var(--gain)" : "var(--loss)",
            background: isPositive ? "var(--gain-bg)" : "var(--loss-bg)",
            border: `1px solid ${isPositive ? "var(--gain-border)" : "var(--loss-border)"}`,
          }}
        >
          {isPositive ? "▲ +" : "▼ "}{change24h.toFixed(2)}% today
        </p>
      </div>

      {/* Chart */}
      <div className="rise card-cert corner-frame rounded-2xl p-6 mb-6" style={{ "--i": 3 } as React.CSSProperties}>
        <PriceChart
          chartBaseUrl={`/api/stocks/chart?symbol=${upperSymbol}`}
          isPositive={isPositive}
        />
      </div>

      {/* Stats — ruled ledger cells */}
      <div
        className="rise grid grid-cols-2 sm:grid-cols-3 rounded-2xl overflow-hidden"
        style={{ "--i": 4, border: "1px solid var(--border-mid)", background: "var(--card-bg)" } as React.CSSProperties}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4"
            style={{ border: "0.5px solid var(--border)" }}
          >
            <p className="label-ledger mb-1.5" style={{ letterSpacing: "0.2em" }}>
              {stat.label}
            </p>
            <p className="font-semibold text-sm font-mono tabular-nums" style={{ color: "var(--text-1)" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
