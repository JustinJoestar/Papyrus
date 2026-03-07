import { unstable_cache } from "next/cache";
import { fetchMarketNews } from "@/lib/news";
import NewsClient from "@/components/NewsClient";

const getNews = unstable_cache(fetchMarketNews, ["market-news"], { revalidate: 300 });

export default async function NewsPage() {
  const news = await getNews();
  return <NewsClient news={news} />;
}
