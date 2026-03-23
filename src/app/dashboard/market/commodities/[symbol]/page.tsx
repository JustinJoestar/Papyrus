import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TOP_COMMODITIES, fetchCommodities } from "@/lib/commodities";
import PriceChart from "@/components/PriceChart";
import CoinBuyButton from "@/components/CoinBuyButton";
import Link from "next/link";

export default async function CommodityDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  const meta = TOP_COMMODITIES.find((c) => c.symbol === upperSymbol);
  if (!meta) notFound();

  const [commodities, supabase] = await Promise.all([
    fetchCommodities(),
    createClient(),
  ]);

  const commodity = commodities.find((c) => c.symbol === upperSymbol);
  if (!commodity || commodity.price === 0) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("cash_balance").eq("id", user.id).single()
    : { data: null };

  const { price, change24h } = commodity;
  const isPositive = change24h >= 0;

  // Fetch full quote for additional stats
  const { fetchQuote } = await import("@/lib/yahooFinanceApi");
  const quote = await fetchQuote(meta.yahooSymbol);

  function fmtPrice(n: number) {
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function fmtLarge(n: number) {
    if (!n) return "—";
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(2)}M`;
    return fmtPrice(n);
  }

  const stats = [
    { label: "24h Volume",   value: fmtLarge(quote?.regularMarketVolume ?? 0) },
    { label: "52-Week High", value: quote?.fiftyTwoWeekHigh ? fmtPrice(quote.fiftyTwoWeekHigh) : "—" },
    { label: "52-Week Low",  value: quote?.fiftyTwoWeekLow  ? fmtPrice(quote.fiftyTwoWeekLow)  : "—" },
    { label: "Unit",         value: meta.unit },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <Link
        href="/dashboard/market/commodities"
        className="inline-flex items-center font-mono text-[10px] tracking-[0.2em] uppercase transition-colors mb-8"
        style={{ color: "var(--text-3)" }}
      >
        ← Back to Commodities
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
          >
            {meta.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>{meta.name}</h1>
            <p className="font-mono text-sm" style={{ color: "var(--text-3)" }}>{upperSymbol} · {meta.unit}</p>
          </div>
        </div>
        <CoinBuyButton
          coin={{ symbol: upperSymbol, name: meta.name, price }}
          cashBalance={profile?.cash_balance ?? 0}
          assetType="commodity"
          isAuthenticated={!!user}
        />
      </div>

      {/* Price */}
      <div className="mb-8">
        <p className="text-4xl font-bold font-mono" style={{ color: "var(--text-1)" }}>{fmtPrice(price)}</p>
        <p className="mt-2 text-sm font-semibold font-mono" style={{ color: isPositive ? "var(--gain)" : "var(--loss)" }}>
          {isPositive ? "+" : ""}{change24h.toFixed(2)}% today
        </p>
      </div>

      {/* Chart */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
        <PriceChart chartBaseUrl={`/api/commodities/chart?symbol=${upperSymbol}`} isPositive={isPositive} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--text-3)" }}>{stat.label}</p>
            <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
