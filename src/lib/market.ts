export type CoinData = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  ath: number;
  atl: number;
};

// Fetches top 250 coins by market cap — result is cached 60s and shared across all pages
export async function getTopCoins(): Promise<CoinData[]> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=7d",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Builds a SYMBOL → price map from coin data (e.g. { BTC: 67432, ETH: 3521 })
export function buildPriceMap(coins: CoinData[]): Record<string, number> {
  return Object.fromEntries(
    coins.map((c) => [c.symbol.toUpperCase(), c.current_price])
  );
}
