"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal from "./TradeModal";
import StockLogo from "./StockLogo";
import { useMarketLeague } from "@/app/dashboard/market/MarketLeagueProvider";
import type { StockData } from "@/lib/stocks";

type Props = { stocks: StockData[]; cashBalance: number; isAuthenticated?: boolean };

export default function StockList({ stocks, cashBalance, isAuthenticated = true }: Props) {
  const router = useRouter();
  const { activeLeague, refreshBalances } = useMarketLeague();
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
          placeholder="Search by name or ticker…"
          className="input-ledger py-3"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 font-display italic text-base" style={{ color: "var(--text-3)" }}>
          No stocks match &quot;{search}&quot;
        </p>
      ) : (
        <div className="sheet">
          {filtered.map((stock, i) => {
            const up = stock.change24h >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => router.push(`/dashboard/market/stocks/${stock.symbol}`)}
                className="row-ledger rise"
                style={{ "--i": Math.min(i, 10) } as React.CSSProperties}
              >
                <StockLogo symbol={stock.symbol} size={34} />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--text-1)" }}>
                    {stock.name}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-3)" }}>
                    {stock.symbol}
                  </p>
                </div>

                <div className="text-right mr-3">
                  <p className="font-mono font-semibold text-sm tabular-nums" style={{ color: "var(--text-1)" }}>
                    {stock.price > 0 ? `$${fmt(stock.price)}` : "—"}
                  </p>
                  <p
                    className="text-xs font-mono mt-0.5 tabular-nums"
                    style={{ color: up ? "var(--gain)" : "var(--loss)" }}
                  >
                    {stock.price > 0
                      ? `${up ? "▲ +" : "▼ "}${stock.change24h.toFixed(2)}%`
                      : "—"}
                  </p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); if (isAuthenticated) { setBuyTarget(stock); } else { router.push("/auth/login"); } }}
                  disabled={stock.price === 0}
                  className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all duration-150 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--gold-glow)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold-bright)",
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.background  = "rgba(201,162,78,0.18)";
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
          cashBalance={activeLeague?.cashBalance ?? cashBalance}
          leagueId={activeLeague?.id ?? null}
          leagueName={activeLeague?.name ?? null}
          onClose={() => setBuyTarget(null)}
          onSuccess={async () => { setBuyTarget(null); await refreshBalances(); router.refresh(); }}
        />
      )}
    </>
  );
}
