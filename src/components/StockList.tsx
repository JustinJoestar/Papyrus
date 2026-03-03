"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal from "./TradeModal";
import StockLogo from "./StockLogo";
import type { StockData } from "@/lib/stocks";

type Props = { stocks: StockData[]; cashBalance: number; isAuthenticated?: boolean };

export default function StockList({ stocks, cashBalance, isAuthenticated = true }: Props) {
  const router = useRouter();
  const [buyTarget, setBuyTarget] = useState<StockData | null>(null);
  const [search, setSearch]       = useState("");

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
          className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-mid)",
            color: "var(--text-1)",
          }}
          onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--gold-border)")}
          onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--border-mid)")}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 font-mono text-sm" style={{ color: "var(--text-3)" }}>
          No stocks match &quot;{search}&quot;
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((stock) => {
            const up = stock.change24h >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => router.push(`/dashboard/market/stocks/${stock.symbol}`)}
                className="rounded-2xl px-5 py-4 flex items-center gap-4 cursor-pointer transition-all duration-150"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-mid)";
                  e.currentTarget.style.background  = "var(--elevated)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background  = "var(--surface)";
                }}
              >
                <StockLogo symbol={stock.symbol} />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>
                    {stock.name}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-3)" }}>
                    {stock.symbol}
                  </p>
                </div>

                <div className="text-right mr-3">
                  <p className="font-mono font-semibold text-sm" style={{ color: "var(--text-1)" }}>
                    {stock.price > 0 ? `$${fmt(stock.price)}` : "—"}
                  </p>
                  <p
                    className="text-xs font-mono mt-0.5"
                    style={{ color: up ? "var(--gain)" : "var(--loss)" }}
                  >
                    {stock.price > 0
                      ? `${up ? "+" : ""}${stock.change24h.toFixed(2)}%`
                      : "—"}
                  </p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); isAuthenticated ? setBuyTarget(stock) : router.push("/auth/login"); }}
                  disabled={stock.price === 0}
                  className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all duration-150 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--gold-glow)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold-bright)",
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background  = "rgba(201,168,76,0.18)";
                      e.currentTarget.style.borderColor = "var(--gold)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background  = "var(--gold-glow)";
                    e.currentTarget.style.borderColor = "var(--gold-border)";
                  }}
                >
                  BUY
                </button>
              </div>
            );
          })}
        </div>
      )}

      {buyTarget && (
        <TradeModal
          mode="buy"
          coin={{ symbol: buyTarget.symbol, name: buyTarget.name, price: buyTarget.price }}
          assetType="stock"
          cashBalance={cashBalance}
          onClose={() => setBuyTarget(null)}
          onSuccess={() => { setBuyTarget(null); router.refresh(); }}
        />
      )}
    </>
  );
}
