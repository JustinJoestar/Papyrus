"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal from "./TradeModal";
import { useMarketLeague } from "@/app/dashboard/market/MarketLeagueProvider";
import type { CommodityData } from "@/lib/commodities";

type Props = { commodities: CommodityData[]; cashBalance: number; isAuthenticated?: boolean };

export default function CommodityList({ commodities, cashBalance, isAuthenticated = true }: Props) {
  const router = useRouter();
  const { activeLeague, refreshBalances } = useMarketLeague();
  const [buyTarget, setBuyTarget] = useState<CommodityData | null>(null);
  const [search, setSearch]       = useState("");

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
          placeholder="Search commodities…"
          className="input-ledger py-3"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 font-display italic text-base" style={{ color: "var(--text-3)" }}>
          No commodities match &quot;{search}&quot;
        </p>
      ) : (
        <div className="sheet">
          {filtered.map((c, i) => {
            const up = c.change24h >= 0;
            return (
              <div
                key={c.symbol}
                onClick={() => router.push(`/dashboard/market/commodities/${c.symbol}`)}
                className="row-ledger rise"
                style={{ "--i": Math.min(i, 10) } as React.CSSProperties}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg"
                  style={{
                    background: "var(--gold-glow)",
                    border: "1px solid var(--gold-border)",
                  }}
                >
                  {c.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--text-1)" }}>
                    {c.name}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-3)" }}>
                    {c.unit}
                  </p>
                </div>

                <div className="text-right mr-3">
                  <p className="font-mono font-semibold text-sm tabular-nums" style={{ color: "var(--text-1)" }}>
                    {c.price > 0 ? `$${fmt(c.price)}` : "—"}
                  </p>
                  <p
                    className="text-xs font-mono mt-0.5 tabular-nums"
                    style={{ color: up ? "var(--gain)" : "var(--loss)" }}
                  >
                    {c.price > 0
                      ? `${up ? "▲ +" : "▼ "}${c.change24h.toFixed(2)}%`
                      : "—"}
                  </p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); if (isAuthenticated) { setBuyTarget(c); } else { router.push("/auth/login"); } }}
                  disabled={c.price === 0}
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
          assetType="commodity"
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
