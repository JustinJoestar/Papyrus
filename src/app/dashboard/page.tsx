import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";
import HoldingsList, { type HoldingWithPrice } from "@/components/HoldingsList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: profile }, { data: holdings }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, cash_balance")
      .eq("id", user.id)
      .single(),
    supabase.from("holdings").select("*").eq("user_id", user.id),
  ]);

  // Fetch current prices for all held assets (crypto + stocks + commodities)
  let priceMap: Record<string, number> = {};
  if (holdings && holdings.length > 0) {
    const cryptoHoldings = holdings.filter((h) => h.asset_type === "crypto");
    const stockHoldings = holdings.filter((h) => h.asset_type === "stock");
    const commodityHoldings = holdings.filter((h) => h.asset_type === "commodity");

    const [coins, stockPrices, commodityPrices] = await Promise.all([
      cryptoHoldings.length > 0 ? getTopCoins() : Promise.resolve([]),
      stockHoldings.length > 0
        ? getStockPrices(stockHoldings.map((h) => h.symbol))
        : Promise.resolve({}),
      commodityHoldings.length > 0
        ? getCommodityPrices(commodityHoldings.map((h) => h.symbol))
        : Promise.resolve({}),
    ]);

    priceMap = { ...buildPriceMap(coins), ...stockPrices, ...commodityPrices };
  }

  const holdingsWithPrices: HoldingWithPrice[] = (holdings ?? []).map((h) => {
    const currentPrice = priceMap[h.symbol] ?? h.avg_buy_price;
    return {
      ...h,
      currentPrice,
      currentValue: currentPrice * h.quantity,
    };
  });

  const portfolioValue = holdingsWithPrices.reduce(
    (sum, h) => sum + h.currentValue,
    0
  );
  const cashBalance = profile?.cash_balance ?? 0;
  const totalValue = cashBalance + portfolioValue;
  const totalReturn = totalValue - 10000;
  const totalReturnPct = (totalReturn / 10000) * 100;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-2">
        Welcome back, {profile?.username} 👋
      </h2>
      <p className="text-gray-400 mb-6">Here&apos;s your portfolio overview.</p>

      {/* Total portfolio value hero */}
      <div className="bg-gray-900 rounded-2xl p-8 mb-6 text-center">
        <p className="text-sm text-gray-400 mb-2">Total Portfolio Value</p>
        <p className="text-5xl font-bold tracking-tight">${fmt(totalValue)}</p>
        <p
          className={`mt-3 text-lg font-medium ${
            totalReturn >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {totalReturn >= 0 ? "+" : ""}${fmt(Math.abs(totalReturn))} (
          {totalReturn >= 0 ? "+" : ""}
          {totalReturnPct.toFixed(2)}%) all time
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-1">Cash Balance</p>
          <p className="text-2xl font-bold text-green-400">
            ${fmt(cashBalance)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-1">Holdings Value</p>
          <p className="text-2xl font-bold">${fmt(portfolioValue)}</p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-4">Your Holdings</h3>
      <HoldingsList holdings={holdingsWithPrices} />
    </div>
  );
}
