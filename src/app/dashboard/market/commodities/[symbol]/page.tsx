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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("cash_balance")
    .eq("id", user!.id)
    .single();

  const { price, change24h } = commodity;
  const isPositive = change24h >= 0;

  function fmtPrice(n: number) {
    return `$${n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/dashboard/market/commodities"
        className="text-sm text-gray-400 hover:text-white transition mb-8 inline-block"
      >
        ← Back to Commodities
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl">
            {meta.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{meta.name}</h1>
            <p className="text-gray-400 text-sm">
              {upperSymbol} · {meta.unit}
            </p>
          </div>
        </div>
        <CoinBuyButton
          coin={{ symbol: upperSymbol, name: meta.name, price }}
          cashBalance={profile?.cash_balance ?? 0}
          assetType="commodity"
        />
      </div>

      {/* Price */}
      <div className="mb-8">
        <p className="text-4xl font-bold">{fmtPrice(price)}</p>
        <p
          className={`mt-2 text-sm font-medium ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {isPositive ? "+" : ""}
          {change24h.toFixed(2)}% today
        </p>
      </div>

      {/* Chart */}
      <div className="bg-gray-900 rounded-2xl p-6">
        <PriceChart
          chartBaseUrl={`/api/commodities/chart?symbol=${upperSymbol}`}
          isPositive={isPositive}
        />
      </div>
    </div>
  );
}
