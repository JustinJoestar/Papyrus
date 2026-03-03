import { createClient } from "@/lib/supabase/server";
import { fetchCommodities } from "@/lib/commodities";
import { unstable_cache } from "next/cache";
import CommodityList from "@/components/CommodityList";
import MarketTabs from "@/components/MarketTabs";

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
        {commodities.length} commodities — prices update every 60s
      </p>

      <CommodityList commodities={commodities} cashBalance={profile?.cash_balance ?? 0} isAuthenticated={!!user} />
    </div>
  );
}
