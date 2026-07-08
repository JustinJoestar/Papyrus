import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTopCoins } from "@/lib/market";
import CryptoList from "@/components/CryptoList";
import ChallengeMarketTabs from "@/components/challenge/ChallengeMarketTabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Crypto Market — Papyrus Challenge" };

export default async function ChallengeCryptoMarketPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/challenge/enroll");

  const [coins, { data: membership }] = await Promise.all([
    getTopCoins(),
    supabase
      .from("league_members")
      .select("league_cash_balance")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle(),
  ]);

  const cashBalance = Number(membership?.league_cash_balance ?? 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: "var(--text-3)" }}>
          Challenge
        </p>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--text-1)" }}>Market</h1>
      </div>

      <ChallengeMarketTabs />

      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-xs" style={{ color: "var(--text-3)" }}>
          Top 250 coins by market cap — prices update every 60s
        </p>
        <span
          className="font-mono text-[10px] tracking-[0.18em] px-2 py-1 rounded"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
        >
          STOCKS + CRYPTO
        </span>
      </div>

      {coins.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Could not load market data. Try refreshing.
          </p>
        </div>
      ) : (
        <CryptoList
          coins={coins}
          cashBalance={cashBalance}
          isAuthenticated={!!user}
          detailBasePath="/challenge/market/crypto"
          loginHref="/challenge/enroll"
        />
      )}
    </div>
  );
}
