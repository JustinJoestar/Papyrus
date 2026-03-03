"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal, { type TradeCoin } from "./TradeModal";
import { useMarketLeague } from "@/app/dashboard/market/MarketLeagueProvider";

export default function CoinBuyButton({
  coin,
  cashBalance,
  assetType = "crypto",
  isAuthenticated = true,
}: {
  coin: TradeCoin;
  cashBalance: number;
  assetType?: "crypto" | "stock" | "commodity";
  isAuthenticated?: boolean;
}) {
  const router = useRouter();
  const { activeLeague, refreshBalances } = useMarketLeague();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => isAuthenticated ? setOpen(true) : router.push("/auth/login")}
        className="font-bold font-mono text-sm tracking-[0.08em] px-6 py-2.5 rounded-xl transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
          color: "#0a0800",
        }}
      >
        Buy {coin.symbol}
        {activeLeague && (
          <span className="ml-2 font-mono text-[10px] opacity-70">({activeLeague.name})</span>
        )}
      </button>

      {open && (
        <TradeModal
          mode="buy"
          coin={coin}
          assetType={assetType}
          cashBalance={activeLeague?.cashBalance ?? cashBalance}
          leagueId={activeLeague?.id ?? null}
          leagueName={activeLeague?.name ?? null}
          onClose={() => setOpen(false)}
          onSuccess={async () => {
            setOpen(false);
            await refreshBalances();
            router.refresh();
          }}
        />
      )}
    </>
  );
}
