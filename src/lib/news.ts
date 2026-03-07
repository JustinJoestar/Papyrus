const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
};

export type NewsItem = {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  type: string;
  thumbnail?: {
    resolutions: Array<{ url: string; width: number; height: number; tag: string }>;
  };
  relatedTickers?: string[];
};

export async function fetchMarketNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v1/finance/search?q=stock+market+news&newsCount=40&enableFuzzyQuery=false&enableCb=false&enableNavLinks=false&enableEnhancedTrivialQuery=true",
      { headers: HEADERS, next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items: NewsItem[] = (data?.news ?? []).filter(
      (n: NewsItem) => n.type === "STORY" && n.title
    );
    return items;
  } catch {
    return [];
  }
}
