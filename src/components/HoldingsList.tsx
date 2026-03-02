"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal from "./TradeModal";

export type HoldingWithPrice = {
  id: string;
  symbol: string;
  asset_type: string;
  quantity: number;
  avg_buy_price: number;
  currentPrice: number;
  currentValue: number;
};

export default function HoldingsList({ holdings }: { holdings: HoldingWithPrice[] }) {
  const router = useRouter();
  const [sellTarget, setSellTarget] = useState<HoldingWithPrice | null>(null);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (holdings.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl p-8 text-center text-gray-500">
        No holdings yet.{" "}
        <a
          href="/dashboard/market"
          className="text-indigo-400 hover:text-indigo-300"
        >
          Go to Market
        </a>{" "}
        to buy assets.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {holdings.map((h) => {
          const costBasis = h.avg_buy_price * h.quantity;
          const pnl = h.currentValue - costBasis;
          const pnlPct = (pnl / costBasis) * 100;

          return (
            <div
              key={h.id}
              className="bg-gray-900 rounded-2xl px-6 py-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{h.symbol}</p>
                <p className="text-sm text-gray-400">
                  {h.quantity.toFixed(6)} coins · avg ${fmt(h.avg_buy_price)}
                </p>
              </div>
              <div className="text-right mr-4">
                <p className="font-semibold">${fmt(h.currentValue)}</p>
                <p
                  className={`text-sm ${
                    pnl >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {pnl >= 0 ? "+" : ""}
                  {pnlPct.toFixed(2)}%
                </p>
              </div>
              <button
                onClick={() => setSellTarget(h)}
                className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm font-medium px-4 py-1.5 rounded-lg transition shrink-0"
              >
                Sell
              </button>
            </div>
          );
        })}
      </div>

      {sellTarget && (
        <TradeModal
          mode="sell"
          coin={{
            symbol: sellTarget.symbol,
            name: sellTarget.symbol,
            price: sellTarget.currentPrice,
          }}
          assetType={sellTarget.asset_type as "crypto" | "stock" | "commodity"}
          maxQuantity={sellTarget.quantity}
          onClose={() => setSellTarget(null)}
          onSuccess={() => {
            setSellTarget(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
