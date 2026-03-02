export type StockData = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
};

// Shared type for yahoo-finance2 quote results
export type YahooQuote = {
  longName?: string | null;
  shortName?: string | null;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  trailingPE?: number;
  averageDailyVolume3Month?: number;
  fullExchangeName?: string;
};

export const TOP_STOCKS = [
  // Tech
  { symbol: "AAPL",  name: "Apple",              logo: "apple.com" },
  { symbol: "MSFT",  name: "Microsoft",           logo: "microsoft.com" },
  { symbol: "NVDA",  name: "NVIDIA",              logo: "nvidia.com" },
  { symbol: "GOOGL", name: "Alphabet",            logo: "google.com" },
  { symbol: "AMZN",  name: "Amazon",              logo: "amazon.com" },
  { symbol: "META",  name: "Meta",                logo: "meta.com" },
  { symbol: "TSLA",  name: "Tesla",               logo: "tesla.com" },
  { symbol: "AMD",   name: "AMD",                 logo: "amd.com" },
  { symbol: "INTC",  name: "Intel",               logo: "intel.com" },
  { symbol: "ORCL",  name: "Oracle",              logo: "oracle.com" },
  { symbol: "ADBE",  name: "Adobe",               logo: "adobe.com" },
  { symbol: "CRM",   name: "Salesforce",          logo: "salesforce.com" },
  { symbol: "NFLX",  name: "Netflix",             logo: "netflix.com" },
  { symbol: "SHOP",  name: "Shopify",             logo: "shopify.com" },
  { symbol: "SPOT",  name: "Spotify",             logo: "spotify.com" },
  { symbol: "UBER",  name: "Uber",                logo: "uber.com" },
  { symbol: "PLTR",  name: "Palantir",            logo: "palantir.com" },
  // Finance
  { symbol: "JPM",   name: "JPMorgan Chase",      logo: "jpmorganchase.com" },
  { symbol: "BAC",   name: "Bank of America",     logo: "bankofamerica.com" },
  { symbol: "V",     name: "Visa",                logo: "visa.com" },
  { symbol: "MA",    name: "Mastercard",          logo: "mastercard.com" },
  { symbol: "GS",    name: "Goldman Sachs",       logo: "goldmansachs.com" },
  { symbol: "COIN",  name: "Coinbase",            logo: "coinbase.com" },
  // Consumer / Retail
  { symbol: "WMT",   name: "Walmart",             logo: "walmart.com" },
  { symbol: "TGT",   name: "Target",              logo: "target.com" },
  { symbol: "NKE",   name: "Nike",                logo: "nike.com" },
  { symbol: "DIS",   name: "Disney",              logo: "disney.com" },
  { symbol: "MCD",   name: "McDonald's",          logo: "mcdonalds.com" },
  { symbol: "SBUX",  name: "Starbucks",           logo: "starbucks.com" },
  { symbol: "KO",    name: "Coca-Cola",           logo: "coca-cola.com" },
  // Healthcare
  { symbol: "JNJ",   name: "Johnson & Johnson",   logo: "jnj.com" },
  { symbol: "PFE",   name: "Pfizer",              logo: "pfizer.com" },
  { symbol: "UNH",   name: "UnitedHealth",        logo: "unitedhealthgroup.com" },
  // ETFs
  { symbol: "SPY",   name: "S&P 500 ETF",         logo: "ssga.com" },
  { symbol: "QQQ",   name: "Nasdaq ETF",          logo: "invesco.com" },
  { symbol: "DIA",   name: "Dow Jones ETF",       logo: "ssga.com" },
];
