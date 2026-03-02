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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("cash_balance")
    .eq("id", user!.id)
    .single();

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
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/dashboard/market/stocks"
        className="text-sm text-gray-400 hover:text-white transition mb-8 inline-block"
      >
        ← Back to Stocks
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <StockLogo symbol={upperSymbol} logo={stockMeta.logo} size={48} />
          <div>
            <h1 className="text-2xl font-bold">
              {quote.longName ?? stockMeta.name}
            </h1>
            <p className="text-gray-400 text-sm">
              {upperSymbol} · {quote.fullExchangeName ?? "NYSE/NASDAQ"}
            </p>
          </div>
        </div>
        <CoinBuyButton
          coin={{ symbol: upperSymbol, name: quote.longName ?? stockMeta.name, price }}
          cashBalance={profile?.cash_balance ?? 0}
          assetType="stock"
        />
      </div>

      {/* Price */}
      <div className="mb-8">
        <p className="text-4xl font-bold">{fmtPrice(price)}</p>
        <p className={`mt-2 text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {isPositive ? "+" : ""}{change24h.toFixed(2)}% today
        </p>
      </div>

      {/* Chart */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-6">
        <PriceChart
          chartBaseUrl={`/api/stocks/chart?symbol=${upperSymbol}`}
          isPositive={isPositive}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className="font-semibold text-sm">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
