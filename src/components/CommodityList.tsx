"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal from "./TradeModal";
import type { CommodityData } from "@/lib/commodities";

type Props = {
  commodities: CommodityData[];
  cashBalance: number;
};

export default function CommodityList({ commodities, cashBalance }: Props) {
  const router = useRouter();
  const [buyTarget, setBuyTarget] = useState<CommodityData | null>(null);
  const [search, setSearch] = useState("");

  const filtered = commodities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commodities..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No commodities match &quot;{search}&quot;
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.symbol}
              onClick={() => router.push(`/dashboard/market/commodities/${c.symbol}`)}
              className="bg-gray-900 rounded-2xl px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-800 transition"
            >
              {/* Icon badge */}
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-xl">
                {c.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-gray-400">{c.unit}</p>
              </div>

              <div className="text-right mr-4">
                <p className="font-semibold">
                  {c.price > 0 ? `$${fmt(c.price)}` : "—"}
                </p>
                <p
                  className={`text-sm ${
                    c.change24h >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {c.price > 0
                    ? `${c.change24h >= 0 ? "+" : ""}${c.change24h.toFixed(2)}%`
                    : "—"}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBuyTarget(c);
                }}
                disabled={c.price === 0}
                className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 text-sm font-medium px-4 py-1.5 rounded-lg transition shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
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
            symbol: buyTarget.symbol,
            name: buyTarget.name,
            price: buyTarget.price,
          }}
          assetType="commodity"
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
