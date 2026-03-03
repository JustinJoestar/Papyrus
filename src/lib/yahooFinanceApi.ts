// Yahoo Finance v8 API — no API key needed, cached via Next.js fetch

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

export type YahooQuoteResult = {
  symbol: string;
  longName?: string;
  shortName?: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketVolume?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  fullExchangeName?: string;
};

async function fetchMeta(symbol: string): Promise<YahooQuoteResult | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m`,
      { headers: HEADERS, next: { revalidate: 60 } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || !meta.regularMarketPrice) return null;

    // Use Yahoo's own change % if available, otherwise calculate from previous close
    const changePercent =
      meta.regularMarketChangePercent != null
        ? meta.regularMarketChangePercent
        : meta.chartPreviousClose > 0
        ? ((meta.regularMarketPrice - meta.chartPreviousClose) /
            meta.chartPreviousClose) *
          100
        : 0;

    return {
      symbol: meta.symbol ?? symbol,
      longName: meta.longName,
      shortName: meta.shortName,
      regularMarketPrice: meta.regularMarketPrice,
      regularMarketChangePercent: changePercent,
      regularMarketVolume: meta.regularMarketVolume,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      fullExchangeName: meta.fullExchangeName,
    };
  } catch {
    return null;
  }
}

// Fetch quotes for multiple symbols in parallel (each cached independently)
export async function fetchQuotes(symbols: string[]): Promise<YahooQuoteResult[]> {
  const results = await Promise.all(symbols.map(fetchMeta));
  return results.filter((r): r is YahooQuoteResult => r !== null);
}

// Fetch a single quote
export async function fetchQuote(symbol: string): Promise<YahooQuoteResult | null> {
  return fetchMeta(symbol);
}

type RangeConfig = { range: string; interval: string };

function getRangeConfig(days: string): RangeConfig {
  switch (days) {
    case "1":   return { range: "1d",  interval: "5m"  };
    case "30":  return { range: "1mo", interval: "1d"  };
    case "365": return { range: "1y",  interval: "1wk" };
    default:    return { range: "5d",  interval: "1h"  };
  }
}

// Fetch historical price data normalized to { prices: [[timestamp, price], ...] }
export async function fetchStockChart(
  symbol: string,
  days: string
): Promise<{ prices: [number, number][] }> {
  try {
    const { range, interval } = getRangeConfig(days);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`,
      { headers: HEADERS, next: { revalidate: 60 } }
    );
    if (!res.ok) return { prices: [] };

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return { prices: [] };

    const timestamps: number[] = result.timestamp ?? [];
    const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];

    const prices = timestamps
      .map((ts, i): [number, number] => [ts * 1000, closes[i]])
      .filter(([, price]) => price != null && !isNaN(price));

    return { prices };
  } catch {
    return { prices: [] };
  }
}
