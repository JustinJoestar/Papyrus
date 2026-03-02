import { createClient } from "@/lib/supabase/server";
import { fetchCommodities } from "@/lib/commodities";
import { unstable_cache } from "next/cache";
import CommodityList from "@/components/CommodityList";
import MarketTabs from "@/components/MarketTabs";

const getCommodities = unstable_cache(fetchCommodities, ["commodity-prices"], {
  revalidate: 60,
});

export default async function CommoditiesPage() {
  const [commodities, supabase] = await Promise.all([
    getCommodities(),
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
        {commodities.length} commodities — prices update every 60s
      </p>
      <CommodityList
        commodities={commodities}
        cashBalance={profile?.cash_balance ?? 0}
      />
    </div>
  );
}
