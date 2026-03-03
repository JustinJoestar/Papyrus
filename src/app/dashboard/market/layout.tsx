import { MarketLeagueProvider } from "./MarketLeagueProvider";

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <MarketLeagueProvider>{children}</MarketLeagueProvider>;
}
