import { fetchQuotes } from "@/lib/yahooFinanceApi";

// Fetches current prices for a specific set of stock symbols
// Used server-side by dashboard and leaderboard
export async function getStockPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  const quotes = await fetchQuotes(symbols);
  return Object.fromEntries(
    quotes.map((q) => [q.symbol, q.regularMarketPrice ?? 0])
  );
}
