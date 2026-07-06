import { ChallengeMarketProvider } from "./ChallengeMarketProvider";

export default function ChallengeMarketLayout({ children }: { children: React.ReactNode }) {
  return <ChallengeMarketProvider>{children}</ChallengeMarketProvider>;
}
