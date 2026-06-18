import { getTopCoins } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";

export type AssetType = "crypto" | "stock" | "commodity";

/**
 * Returns the authoritative current price for a symbol, fetched server-side
 * from the same cached feeds the UI reads. This is the price trades execute
 * at — the client never gets to choose it.
 *
 * Returns null if the price feed is unavailable or the symbol is unknown,
 * in which case the caller should refuse the trade rather than guess.
 */
export async function getVerifiedPrice(
  symbol: string,
  assetType: AssetType
): Promise<number | null> {
  const sym = symbol.toUpperCase();

  if (assetType === "crypto") {
    const coins = await getTopCoins();
    const match = coins.find((c) => c.symbol.toUpperCase() === sym);
    return match?.current_price ?? null;
  }

  if (assetType === "stock") {
    const prices = await getStockPrices([sym]);
    return prices[sym] ?? null;
  }

  if (assetType === "commodity") {
    const prices = await getCommodityPrices([sym]);
    return prices[sym] ?? null;
  }

  return null;
}
