import { unstable_cache } from "next/cache";
import { fetchQuotes } from "@/lib/yahooFinanceApi";
import { TOP_STOCKS, type StockData } from "@/lib/stocks";

const fetchStocks = unstable_cache(
  async (): Promise<StockData[]> => {
    const symbols = TOP_STOCKS.map((s) => s.symbol);
    const quotes = await fetchQuotes(symbols);

    return TOP_STOCKS.map(({ symbol, name }) => {
      const q = quotes.find((r) => r.symbol === symbol);
      return {
        symbol,
        name: q?.longName ?? q?.shortName ?? name,
        price: q?.regularMarketPrice ?? 0,
        change24h: q?.regularMarketChangePercent ?? 0,
      };
    });
  },
  ["stock-prices"],
  { revalidate: 60 }
);

export async function GET() {
  const stocks = await fetchStocks();
  return Response.json(stocks);
}
