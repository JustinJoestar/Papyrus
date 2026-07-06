import { createClient } from "@/lib/supabase/server";
import { fetchCommodities } from "@/lib/commodities";
import { unstable_cache } from "next/cache";
import CommodityList from "@/components/CommodityList";
import MarketTabs from "@/components/MarketTabs";
import LeagueSwitcher from "@/components/LeagueSwitcher";

const getCommodities = unstable_cache(fetchCommodities, ["commodity-prices"], {
  revalidate: 60,
});

export default async function CommoditiesPage() {
  const [commodities, supabase] = await Promise.all([getCommodities(), createClient()]);

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
          {commodities.length} commodities — prices update every 60s
        </p>
        <LeagueSwitcher />
      </div>

      <CommodityList commodities={commodities} cashBalance={profile?.cash_balance ?? 0} isAuthenticated={!!user} />
    </div>
  );
}
