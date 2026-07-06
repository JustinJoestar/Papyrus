import { createClient } from "@/lib/supabase/server";
import { getTopCoins } from "@/lib/market";
import CryptoList from "@/components/CryptoList";
import MarketTabs from "@/components/MarketTabs";
import LeagueSwitcher from "@/components/LeagueSwitcher";

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="rise mb-8" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="label-ledger mb-1.5">№ 02 — Markets</p>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-1)" }}>
          The Exchange
        </h1>
      </div>

      <div className="rise" style={{ "--i": 1 } as React.CSSProperties}>
        <MarketTabs />
      </div>

      <div className="rise flex items-center justify-between gap-3 flex-wrap mb-6" style={{ "--i": 2 } as React.CSSProperties}>
        <p className="font-mono text-xs" style={{ color: "var(--text-3)" }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full animate-blink-dot mr-2 align-middle" style={{ background: "var(--gold)" }} />
          Top 250 coins by market cap — prices update every 60s
        </p>
        <LeagueSwitcher />
      </div>

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
