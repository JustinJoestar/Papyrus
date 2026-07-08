import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";

type HoldingRef = { symbol: string; asset_type: string | null };

/**
 * Prices a mixed bag of league holdings (stocks, crypto, commodities) using
 * the same cached feeds trades execute against. Prices are looked up per
 * holding by its own asset_type — crypto and stock tickers can collide
 * (e.g. a coin named "AMP"), so plain symbols aren't a safe key.
 * Also exposes SYMBOL → CoinGecko id for crypto chart/detail links.
 */
export async function getHoldingPrices(holdings: HoldingRef[]): Promise<{
  priceOf: (h: HoldingRef) => number;
  coinIdBySymbol: Record<string, string>;
}> {
  const bySymbol = (type: string) =>
    [...new Set(holdings.filter((h) => (h.asset_type ?? "stock") === type).map((h) => h.symbol.toUpperCase()))];

  const stockSymbols     = bySymbol("stock");
  const cryptoSymbols    = bySymbol("crypto");
  const commoditySymbols = bySymbol("commodity");

  const [stockPrices, coins, commodityPrices] = await Promise.all([
    stockSymbols.length > 0 ? getStockPrices(stockSymbols) : Promise.resolve({} as Record<string, number>),
    cryptoSymbols.length > 0 ? getTopCoins() : Promise.resolve([]),
    commoditySymbols.length > 0 ? getCommodityPrices(commoditySymbols) : Promise.resolve({} as Record<string, number>),
  ]);
  const cryptoPrices = buildPriceMap(coins);
  const coinIdBySymbol = Object.fromEntries(coins.map((c) => [c.symbol.toUpperCase(), c.id]));

  const priceOf = (h: HoldingRef) => {
    const sym = h.symbol.toUpperCase();
    switch (h.asset_type ?? "stock") {
      case "crypto":    return cryptoPrices[sym] ?? 0;
      case "commodity": return commodityPrices[sym] ?? 0;
      default:          return stockPrices[sym] ?? 0;
    }
  };

  return { priceOf, coinIdBySymbol };
}
