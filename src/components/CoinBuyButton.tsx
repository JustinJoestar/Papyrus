"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal, { type TradeCoin } from "./TradeModal";

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
      </button>

      {open && (
        <TradeModal
          mode="buy"
          coin={coin}
          assetType={assetType}
          cashBalance={cashBalance}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
