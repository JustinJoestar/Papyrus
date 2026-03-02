"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal from "./TradeModal";
import StockLogo from "./StockLogo";
import { TOP_STOCKS, type StockData } from "@/lib/stocks";

type Props = {
  stocks: StockData[];
  cashBalance: number;
};

const logoMap = Object.fromEntries(TOP_STOCKS.map((s) => [s.symbol, s.logo]));

export default function StockList({ stocks, cashBalance }: Props) {
  const router = useRouter();
  const [buyTarget, setBuyTarget] = useState<StockData | null>(null);
  const [search, setSearch] = useState("");

  const filtered = stocks.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.symbol.toLowerCase().includes(search.toLowerCase())
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
          placeholder="Search by name or ticker..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No stocks match &quot;{search}&quot;
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => router.push(`/dashboard/market/stocks/${stock.symbol}`)}
              className="bg-gray-900 rounded-2xl px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-800 transition"
            >
              {/* Logo */}
              <StockLogo symbol={stock.symbol} logo={logoMap[stock.symbol]} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{stock.name}</p>
                <p className="text-sm text-gray-400">{stock.symbol}</p>
              </div>
              <div className="text-right mr-4">
                <p className="font-semibold">
                  {stock.price > 0 ? `$${fmt(stock.price)}` : "—"}
                </p>
                <p
                  className={`text-sm ${
                    stock.change24h >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stock.price > 0
                    ? `${stock.change24h >= 0 ? "+" : ""}${stock.change24h.toFixed(2)}%`
                    : "—"}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBuyTarget(stock);
                }}
                disabled={stock.price === 0}
                className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-sm font-medium px-4 py-1.5 rounded-lg transition shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
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
          assetType="stock"
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
