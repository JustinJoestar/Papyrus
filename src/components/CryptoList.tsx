"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TradeModal from "./TradeModal";
import type { CoinWithPrice } from "@/app/dashboard/market/page";

type Props = { coins: CoinWithPrice[]; cashBalance: number; isAuthenticated?: boolean };

export default function CryptoList({ coins, cashBalance, isAuthenticated = true }: Props) {
  const router   = useRouter();
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
          placeholder="Search by name or symbol..."
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
          No coins match &quot;{search}&quot;
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((coin) => {
            const up = coin.price_change_percentage_24h >= 0;
            return (
              <div
                key={coin.id}
                onClick={() => router.push(`/dashboard/market/${coin.id}`)}
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
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>
                    {coin.name}
                  </p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-3)" }}>
                    {coin.symbol.toUpperCase()}
                  </p>
                </div>
                <div className="text-right mr-3">
                  <p className="font-mono font-semibold text-sm" style={{ color: "var(--text-1)" }}>
                    ${fmt(coin.current_price)}
                  </p>
                  <p
                    className="text-xs font-mono mt-0.5"
                    style={{ color: up ? "var(--gain)" : "var(--loss)" }}
                  >
                    {up ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(2) ?? "0.00"}%
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); isAuthenticated ? setBuyTarget(coin) : router.push("/auth/login"); }}
                  className="px-4 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all duration-150 shrink-0"
                  style={{
                    background: "var(--gold-glow)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold-bright)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background  = "rgba(201,168,76,0.18)";
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
          coin={{
            symbol: buyTarget.symbol.toUpperCase(),
            name:   buyTarget.name,
            price:  buyTarget.current_price,
          }}
          cashBalance={cashBalance}
          onClose={() => setBuyTarget(null)}
          onSuccess={() => { setBuyTarget(null); router.refresh(); }}
        />
      )}
    </>
  );
}
