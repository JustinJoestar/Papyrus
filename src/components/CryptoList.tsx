"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal from "./TradeModal";
import type { CoinWithPrice } from "@/app/dashboard/market/page";

type Props = {
  coins: CoinWithPrice[];
  cashBalance: number;
};

export default function CryptoList({ coins, cashBalance }: Props) {
  const router = useRouter();
  const [buyTarget, setBuyTarget] = useState<CoinWithPrice | null>(null);
  const [search, setSearch] = useState("");

  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <>
      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or symbol..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No coins match &quot;{search}&quot;
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((coin) => (
            <div
              key={coin.id}
              onClick={() => router.push(`/dashboard/market/${coin.id}`)}
              className="bg-gray-900 rounded-2xl px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-800 transition"
            >
              <img
                src={coin.image}
                alt={coin.name}
                className="w-8 h-8 rounded-full shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{coin.name}</p>
                <p className="text-sm text-gray-400 uppercase">{coin.symbol}</p>
              </div>
              <div className="text-right mr-4">
                <p className="font-semibold">${fmt(coin.current_price)}</p>
                <p
                  className={`text-sm ${
                    coin.price_change_percentage_24h >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                  {coin.price_change_percentage_24h?.toFixed(2) ?? "0.00"}%
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setBuyTarget(coin); }}
                className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-sm font-medium px-4 py-1.5 rounded-lg transition shrink-0"
              >
                Buy
              </button>
            </div>
          ))}
        </div>
      )}

      {buyTarget && (
        <TradeModal
          mode="buy"
          coin={{
            symbol: buyTarget.symbol.toUpperCase(),
            name: buyTarget.name,
            price: buyTarget.current_price,
          }}
          cashBalance={cashBalance}
          onClose={() => setBuyTarget(null)}
          onSuccess={() => {
            setBuyTarget(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
