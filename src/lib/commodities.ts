import { fetchQuotes } from "@/lib/yahooFinanceApi";

export type CommodityMeta = {
  symbol: string;      // URL-safe: GOLD, SILVER, OIL
  yahooSymbol: string; // Yahoo Finance futures: GC=F, SI=F, CL=F
  name: string;
  unit: string;        // "per troy oz", "per barrel", etc.
  icon: string;        // emoji for display
};

export type CommodityData = {
  symbol: string;
  name: string;
  unit: string;
  icon: string;
  price: number;
  change24h: number;
};

export const TOP_COMMODITIES: CommodityMeta[] = [
  { symbol: "GOLD",   yahooSymbol: "GC=F",  name: "Gold",        unit: "per troy oz", icon: "🥇" },
  { symbol: "SILVER", yahooSymbol: "SI=F",  name: "Silver",      unit: "per troy oz", icon: "🥈" },
  { symbol: "OIL",    yahooSymbol: "CL=F",  name: "Crude Oil",   unit: "per barrel",  icon: "🛢️" },
  { symbol: "NATGAS", yahooSymbol: "NG=F",  name: "Natural Gas", unit: "per MMBtu",   icon: "🔥" },
  { symbol: "COPPER", yahooSymbol: "HG=F",  name: "Copper",      unit: "per lb",      icon: "🪙" },
  { symbol: "PLAT",   yahooSymbol: "PL=F",  name: "Platinum",    unit: "per troy oz", icon: "💎" },
  { symbol: "CORN",   yahooSymbol: "ZC=F",  name: "Corn",        unit: "per bushel",  icon: "🌽" },
  { symbol: "WHEAT",  yahooSymbol: "ZW=F",  name: "Wheat",       unit: "per bushel",  icon: "🌾" },
  { symbol: "COFFEE", yahooSymbol: "KC=F",  name: "Coffee",      unit: "per lb",      icon: "☕" },
  { symbol: "SUGAR",  yahooSymbol: "SB=F",  name: "Sugar",       unit: "per lb",      icon: "🍬" },
];

// Map clean symbol → Yahoo Finance symbol
export const YAHOO_SYMBOL_MAP = Object.fromEntries(
  TOP_COMMODITIES.map((c) => [c.symbol, c.yahooSymbol])
);

// Map clean symbol → meta (for lookups)
export const COMMODITY_META_MAP = Object.fromEntries(
  TOP_COMMODITIES.map((c) => [c.symbol, c])
);

// Fetch current prices for all commodities
export async function getCommodityPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  const yahooSymbols = symbols.map((s) => YAHOO_SYMBOL_MAP[s] ?? s);
  const quotes = await fetchQuotes(yahooSymbols);

  // Map back from Yahoo symbol → clean symbol
  const reverseMap = Object.fromEntries(
    TOP_COMMODITIES.map((c) => [c.yahooSymbol, c.symbol])
  );

  return Object.fromEntries(
    quotes.map((q) => [reverseMap[q.symbol] ?? q.symbol, q.regularMarketPrice ?? 0])
  );
}

// Fetch all commodity market data for the listing page
export async function fetchCommodities(): Promise<CommodityData[]> {
  const yahooSymbols = TOP_COMMODITIES.map((c) => c.yahooSymbol);
  const quotes = await fetchQuotes(yahooSymbols);

  const quoteByYahoo = Object.fromEntries(quotes.map((q) => [q.symbol, q]));

  return TOP_COMMODITIES.map((c) => {
    const q = quoteByYahoo[c.yahooSymbol];
    return {
      symbol: c.symbol,
      name: c.name,
      unit: c.unit,
      icon: c.icon,
      price: q?.regularMarketPrice ?? 0,
      change24h: q?.regularMarketChangePercent ?? 0,
    };
  });
}
