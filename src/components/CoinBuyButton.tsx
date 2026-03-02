"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal, { type TradeCoin } from "./TradeModal";

export default function CoinBuyButton({
  coin,
  cashBalance,
  assetType = "crypto",
}: {
  coin: TradeCoin;
  cashBalance: number;
  assetType?: "crypto" | "stock" | "commodity";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition"
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
