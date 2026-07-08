"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal from "./TradeModal";
import { useMarketLeague } from "@/app/dashboard/market/MarketLeagueProvider";
import type { CoinWithPrice } from "@/app/dashboard/market/page";

type Props = {
  coins: CoinWithPrice[];
  cashBalance: number;
  isAuthenticated?: boolean;
  detailBasePath?: string;
  loginHref?: string;
};

export default function CryptoList({
  coins, cashBalance, isAuthenticated = true,
  detailBasePath = "/dashboard/market", loginHref = "/auth/login",
}: Props) {
  const router   = useRouter();
  const { activeLeague, refreshBalances } = useMarketLeague();
  const [buyTarget, setBuyTarget] = useState<CoinWithPrice | null>(null);
  const [search, setSearch]       = useState("");

  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or symbol…"
          className="input-ledger py-3"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 font-display italic text-base" style={{ color: "var(--text-3)" }}>
          No coins match &quot;{search}&quot;
        </p>
      ) : (
        <div className="sheet">
          {filtered.map((coin, i) => {
            const up = coin.price_change_percentage_24h >= 0;
            return (
              <div
                key={coin.id}
                onClick={() => router.push(`${detailBasePath}/${coin.id}`)}
                className="row-ledger rise"
                style={{ "--i": Math.min(i, 10) } as React.CSSProperties}
              >
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--text-1)" }}>
                    {coin.name}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-3)" }}>
                    {coin.symbol.toUpperCase()}
                  </p>
                </div>
                <div className="text-right mr-3">
                  <p className="font-mono font-semibold text-sm tabular-nums" style={{ color: "var(--text-1)" }}>
                    ${fmt(coin.current_price)}
                  </p>
                  <p
                    className="text-xs font-mono mt-0.5 tabular-nums"
                    style={{ color: up ? "var(--gain)" : "var(--loss)" }}
                  >
                    {up ? "▲ +" : "▼ "}{coin.price_change_percentage_24h?.toFixed(2) ?? "0.00"}%
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); if (isAuthenticated) { setBuyTarget(coin); } else { router.push(loginHref); } }}
                  className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all duration-150 shrink-0"
                  style={{
                    background: "var(--gold-glow)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold-bright)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background  = "rgba(201,162,78,0.18)";
                    e.currentTarget.style.borderColor = "var(--gold)";
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
          coin={{ symbol: buyTarget.symbol.toUpperCase(), name: buyTarget.name, price: buyTarget.current_price }}
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
