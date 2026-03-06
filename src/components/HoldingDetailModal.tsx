"use client";

import { useEffect, useState } from "react";
import PriceChart from "./PriceChart";
import type { HoldingWithPrice } from "./HoldingsList";

type AssetDetail = {
  name: string;
  symbol: string;
  image?: string;
  icon?: string;
  unit?: string;
  exchange?: string;
  price: number;
  change24h: number;
  change7d?: number;
  marketCap?: number;
  volume24h?: number;
  supply?: number;
  ath?: number;
  atl?: number;
  weekHigh52?: number;
  weekLow52?: number;
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPrice(n: number) {
  if (!n) return "$0.00";
  if (n < 0.01) return `$${n.toFixed(6)}`;
  if (n < 1)    return `$${n.toFixed(4)}`;
  return `$${fmt(n)}`;
}
function fmtLarge(n: number) {
  if (!n) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${fmt(n)}`;
}

export default function HoldingDetailModal({
  holding,
  onClose,
  onSell,
}: {
  holding: HoldingWithPrice;
  onClose: () => void;
  onSell: (h: HoldingWithPrice) => void;
}) {
  const [detail, setDetail] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const chartUrl =
    holding.asset_type === "stock"
      ? `/api/stocks/chart?symbol=${holding.symbol}`
      : holding.asset_type === "commodity"
      ? `/api/commodities/chart?symbol=${holding.symbol}`
      : `/api/crypto/chart?coinId=${holding.coinId ?? holding.symbol}`;

  useEffect(() => {
    const params = new URLSearchParams({
      type:   holding.asset_type,
      symbol: holding.symbol,
      ...(holding.coinId ? { coinId: holding.coinId } : {}),
    });
    fetch(`/api/asset-detail?${params}`)
      .then((r) => r.json())
      .then((d) => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [holding]);

  const costBasis = holding.avg_buy_price * holding.quantity;
  const pnl       = holding.currentValue - costBasis;
  const pnlPct    = (pnl / costBasis) * 100;
  const isGain    = pnl >= 0;
  const isPositive = (detail?.change24h ?? 0) >= 0;

  // Stats to show depending on asset type
  const stats: { label: string; value: string }[] = detail
    ? holding.asset_type === "crypto"
      ? [
          { label: "Market Cap",         value: fmtLarge(detail.marketCap ?? 0) },
          { label: "24h Volume",         value: fmtLarge(detail.volume24h ?? 0) },
          { label: "Circulating Supply", value: detail.supply ? `${detail.supply.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${detail.symbol}` : "—" },
          { label: "All-Time High",      value: fmtPrice(detail.ath ?? 0) },
          { label: "All-Time Low",       value: fmtPrice(detail.atl ?? 0) },
          { label: "7d Change",          value: detail.change7d != null ? `${detail.change7d >= 0 ? "+" : ""}${detail.change7d.toFixed(2)}%` : "—" },
        ]
      : holding.asset_type === "stock"
      ? [
          { label: "24h Volume",   value: fmtLarge(detail.volume24h ?? 0) },
          { label: "52-Week High", value: fmtPrice(detail.weekHigh52 ?? 0) },
          { label: "52-Week Low",  value: fmtPrice(detail.weekLow52  ?? 0) },
          { label: "Exchange",     value: detail.exchange ?? "—" },
        ]
      : [
          { label: "24h Volume",   value: fmtLarge(detail.volume24h ?? 0) },
          { label: "52-Week High", value: fmtPrice(detail.weekHigh52 ?? 0) },
          { label: "52-Week Low",  value: fmtPrice(detail.weekLow52  ?? 0) },
          { label: "Unit",         value: detail.unit ?? "—" },
        ]
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-3)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.borderColor = "var(--border-bright)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border-mid)"; }}
        >
          ✕
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 pr-10">
            {detail?.image ? (
              <img src={detail.image} alt={detail.name} className="w-12 h-12 rounded-full" style={{ background: "var(--elevated)" }} />
            ) : detail?.icon ? (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}>
                {detail.icon}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}>
                <span className="font-mono text-xs font-bold" style={{ color: "var(--text-3)" }}>{holding.symbol.slice(0, 3)}</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
                {detail?.name ?? holding.symbol}
              </h2>
              <p className="font-mono text-sm" style={{ color: "var(--text-3)" }}>
                {holding.symbol}{detail?.exchange ? ` · ${detail.exchange}` : detail?.unit ? ` · ${detail.unit}` : ""}
              </p>
            </div>
          </div>

          {/* Price */}
          {detail && (
            <div className="mb-6">
              <p className="text-4xl font-bold font-mono" style={{ color: "var(--text-1)" }}>
                {fmtPrice(detail.price)}
              </p>
              <div className="flex gap-4 mt-2">
                <span className="text-sm font-semibold font-mono" style={{ color: isPositive ? "var(--gain)" : "var(--loss)" }}>
                  {isPositive ? "+" : ""}{detail.change24h.toFixed(2)}% 24h
                </span>
                {detail.change7d != null && (
                  <span className="text-sm font-semibold font-mono" style={{ color: detail.change7d >= 0 ? "var(--gain)" : "var(--loss)" }}>
                    {detail.change7d >= 0 ? "+" : ""}{detail.change7d.toFixed(2)}% 7d
                  </span>
                )}
              </div>
            </div>
          )}

          {loading && (
            <p className="font-mono text-xs mb-6" style={{ color: "var(--text-3)" }}>Loading...</p>
          )}

          {/* Chart */}
          <div className="rounded-2xl p-4 mb-6" style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}>
            <PriceChart chartBaseUrl={chartUrl} isPositive={isPositive} />
          </div>

          {/* Your position */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4" style={{ color: "var(--text-3)" }}>Your Position</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--text-3)" }}>Quantity</p>
                <p className="font-mono font-semibold" style={{ color: "var(--text-1)" }}>{holding.quantity.toFixed(6)}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--text-3)" }}>Avg Buy Price</p>
                <p className="font-mono font-semibold" style={{ color: "var(--text-1)" }}>{fmtPrice(holding.avg_buy_price)}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--text-3)" }}>Current Value</p>
                <p className="font-mono font-semibold" style={{ color: "var(--text-1)" }}>${fmt(holding.currentValue)}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--text-3)" }}>P&amp;L</p>
                <p className="font-mono font-semibold" style={{ color: isGain ? "var(--gain)" : "var(--loss)" }}>
                  {isGain ? "+" : ""}${fmt(Math.abs(pnl))} ({isGain ? "+" : ""}{pnlPct.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>

          {/* Market stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl p-4" style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1.5" style={{ color: "var(--text-3)" }}>{s.label}</p>
                  <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sell button */}
          <button
            onClick={() => onSell(holding)}
            className="w-full py-3 rounded-xl font-mono font-bold text-sm tracking-wider transition-all"
            style={{ background: "var(--loss-bg)", border: "1px solid var(--loss-border)", color: "var(--loss)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,63,94,0.15)"; e.currentTarget.style.borderColor = "var(--loss)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--loss-bg)"; e.currentTarget.style.borderColor = "var(--loss-border)"; }}
          >
            SELL POSITION
          </button>
        </div>
      </div>
    </div>
  );
}
