import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTopCoins } from "@/lib/market";
import PriceChart from "@/components/PriceChart";
import CoinBuyButton from "@/components/CoinBuyButton";
import Link from "next/link";

export default async function CoinDetailPage({
  params,
}: {
  params: Promise<{ coinId: string }>;
}) {
  const { coinId } = await params;

  // Reuses the cached top-250 fetch — no extra API call
  const [coins, supabase] = await Promise.all([
    getTopCoins(),
    createClient(),
  ]);

  const coin = coins.find((c) => c.id === coinId);
  if (!coin) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("cash_balance")
    .eq("id", user!.id)
    .single();

  const isPositive = coin.price_change_percentage_24h >= 0;

  function fmtPrice(n: number) {
    if (!n) return "$0.00";
    if (n < 0.01) return `$${n.toFixed(6)}`;
    if (n < 1) return `$${n.toFixed(4)}`;
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function fmtLarge(n: number) {
    if (!n) return "—";
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/dashboard/market"
        className="text-sm text-gray-400 hover:text-white transition mb-8 inline-block"
      >
        ← Back to Market
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">{coin.name}</h1>
            <p className="text-gray-400 uppercase text-sm">{coin.symbol}</p>
          </div>
        </div>
        <CoinBuyButton
          coin={{
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
          }}
          cashBalance={profile?.cash_balance ?? 0}
        />
      </div>

      {/* Price */}
      <div className="mb-8">
        <p className="text-4xl font-bold">{fmtPrice(coin.current_price)}</p>
        <div className="flex gap-4 mt-2">
          <span className={`text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(2) ?? "0.00"}% 24h
          </span>
          {coin.price_change_percentage_7d_in_currency != null && (
            <span
              className={`text-sm font-medium ${
                coin.price_change_percentage_7d_in_currency >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {coin.price_change_percentage_7d_in_currency >= 0 ? "+" : ""}
              {coin.price_change_percentage_7d_in_currency?.toFixed(2)}% 7d
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-6">
        <PriceChart chartBaseUrl={`/api/crypto/chart?coinId=${coinId}`} isPositive={isPositive} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Market Cap", value: fmtLarge(coin.market_cap) },
          { label: "24h Volume", value: fmtLarge(coin.total_volume) },
          {
            label: "Circulating Supply",
            value: coin.circulating_supply
              ? `${coin.circulating_supply.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${coin.symbol.toUpperCase()}`
              : "—",
          },
          { label: "All-Time High", value: fmtPrice(coin.ath) },
          { label: "All-Time Low", value: fmtPrice(coin.atl) },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className="font-semibold text-sm">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
