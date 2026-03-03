import { createClient } from "@/lib/supabase/server";
import { getTopCoins } from "@/lib/market";
import CryptoList from "@/components/CryptoList";
import MarketTabs from "@/components/MarketTabs";

export type CoinWithPrice = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
};

export default async function MarketPage() {
  const [coins, supabase] = await Promise.all([getTopCoins(), createClient()]);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile }  = user
    ? await supabase.from("profiles").select("cash_balance").eq("id", user.id).single()
    : { data: null };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
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

      <p className="font-mono text-xs mb-6" style={{ color: "var(--text-3)" }}>
        Top 250 coins by market cap — prices update every 60s
      </p>

      {coins.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Could not load market data. Try refreshing.
          </p>
        </div>
      ) : (
        <CryptoList coins={coins} cashBalance={profile?.cash_balance ?? 0} isAuthenticated={!!user} />
      )}
    </div>
  );
}
