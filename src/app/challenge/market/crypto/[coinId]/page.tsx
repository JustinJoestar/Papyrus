import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTopCoins } from "@/lib/market";
import PriceChart from "@/components/PriceChart";
import CoinBuyButton from "@/components/CoinBuyButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ChallengeCoinDetailPage({
  params,
}: {
  params: Promise<{ coinId: string }>;
}) {
  const { coinId } = await params;

  const [coins, supabase] = await Promise.all([getTopCoins(), createClient()]);

  const coin = coins.find((c) => c.id === coinId);
  if (!coin) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/challenge/enroll");

  const { data: membership } = await supabase
    .from("league_members")
    .select("league_cash_balance")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const cashBalance = Number(membership?.league_cash_balance ?? 0);
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

  const stats = [
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
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <Link
        href="/challenge/market/crypto"
        className="inline-flex items-center font-mono text-[10px] tracking-[0.2em] uppercase transition-colors mb-8 hover:opacity-70"
        style={{ color: "var(--text-3)" }}
      >
        ← Back to Market
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{ border: "1px dashed var(--gold-border)", padding: 3 }}
          >
            <img
              src={coin.image}
              alt={coin.name}
              className="w-full h-full rounded-full"
              style={{ background: "var(--elevated)" }}
            />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-1)" }}>
              {coin.name}
            </h1>
            <p className="font-mono text-sm uppercase" style={{ color: "var(--text-3)" }}>
              {coin.symbol}
            </p>
          </div>
        </div>
        <CoinBuyButton
          coin={{ symbol: coin.symbol.toUpperCase(), name: coin.name, price: coin.current_price }}
          cashBalance={cashBalance}
          assetType="crypto"
          isAuthenticated={!!user}
        />
      </div>

      {/* Price */}
      <div className="mb-8">
        <p className="text-5xl font-bold font-mono tabular-nums tracking-tight" style={{ color: "var(--text-1)" }}>
          {fmtPrice(coin.current_price)}
        </p>
        <div className="flex gap-3 mt-3">
          <span
            className="text-sm font-semibold font-mono px-2.5 py-0.5 rounded-lg tabular-nums"
            style={{
              color: isPositive ? "var(--gain)" : "var(--loss)",
              background: isPositive ? "var(--gain-bg)" : "var(--loss-bg)",
              border: `1px solid ${isPositive ? "var(--gain-border)" : "var(--loss-border)"}`,
            }}
          >
            {isPositive ? "▲ +" : "▼ "}{coin.price_change_percentage_24h?.toFixed(2) ?? "0.00"}% 24h
          </span>
          {coin.price_change_percentage_7d_in_currency != null && (
            <span
              className="text-sm font-semibold font-mono px-2.5 py-0.5 rounded-lg tabular-nums"
              style={{
                color: coin.price_change_percentage_7d_in_currency >= 0 ? "var(--gain)" : "var(--loss)",
                background: coin.price_change_percentage_7d_in_currency >= 0 ? "var(--gain-bg)" : "var(--loss-bg)",
                border: `1px solid ${coin.price_change_percentage_7d_in_currency >= 0 ? "var(--gain-border)" : "var(--loss-border)"}`,
              }}
            >
              {coin.price_change_percentage_7d_in_currency >= 0 ? "▲ +" : "▼ "}
              {coin.price_change_percentage_7d_in_currency?.toFixed(2)}% 7d
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="card-cert corner-frame rounded-2xl p-6 mb-6">
        <PriceChart chartBaseUrl={`/api/crypto/chart?coinId=${coinId}`} isPositive={isPositive} />
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--border-mid)", background: "var(--card-bg)" }}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="p-4" style={{ border: "0.5px solid var(--border)" }}>
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
