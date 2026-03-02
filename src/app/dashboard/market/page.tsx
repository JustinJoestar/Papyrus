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
  const [coins, supabase] = await Promise.all([
    getTopCoins(),
    createClient(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("cash_balance")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-6">Market</h2>
      <MarketTabs />
      <p className="text-gray-400 mb-6">
        Top 250 coins by market cap — prices update every 60s
      </p>

      {coins.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-8 text-center text-gray-500">
          Could not load market data. Try refreshing.
        </div>
      ) : (
        <CryptoList coins={coins} cashBalance={profile?.cash_balance ?? 0} />
      )}
    </div>
  );
}
