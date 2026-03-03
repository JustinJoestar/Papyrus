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
          placeholder="Search commodities..."
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
          No commodities match &quot;{search}&quot;
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const up = c.change24h >= 0;
            return (
              <div
                key={c.symbol}
                onClick={() => router.push(`/dashboard/market/commodities/${c.symbol}`)}
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
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl"
                  style={{
                    background: "var(--gold-glow)",
                    border: "1px solid var(--gold-border)",
                  }}
                >
                  {c.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>
                    {c.name}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-3)" }}>
                    {c.unit}
                  </p>
                </div>

                <div className="text-right mr-3">
                  <p className="font-mono font-semibold text-sm" style={{ color: "var(--text-1)" }}>
                    {c.price > 0 ? `$${fmt(c.price)}` : "—"}
                  </p>
                  <p
                    className="text-xs font-mono mt-0.5"
                    style={{ color: up ? "var(--gain)" : "var(--loss)" }}
                  >
                    {c.price > 0
                      ? `${up ? "+" : ""}${c.change24h.toFixed(2)}%`
                      : "—"}
                  </p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); isAuthenticated ? setBuyTarget(c) : router.push("/auth/login"); }}
                  disabled={c.price === 0}
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
