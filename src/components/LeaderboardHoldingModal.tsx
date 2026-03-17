"use client";

import { useEffect, useState } from "react";
import PriceChart from "./PriceChart";
import TradeModal, { type TradeCoin } from "./TradeModal";
import { createClient } from "@/lib/supabase/client";

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

type Props = {
  symbol: string;
  assetType: string;
  onClose: () => void;
};

export default function LeaderboardHoldingModal({ symbol, assetType, onClose }: Props) {
  const [detail, setDetail]         = useState<AssetDetail | null>(null);
  const [loading, setLoading]       = useState(true);
  const [cashBalance, setCashBalance] = useState<number | undefined>(undefined);
  const [buyOpen, setBuyOpen]       = useState(false);

  const chartUrl =
    assetType === "stock"
      ? `/api/stocks/chart?symbol=${symbol}`
      : assetType === "commodity"
      ? `/api/commodities/chart?symbol=${symbol}`
      : `/api/crypto/chart?coinId=${symbol}`;

  useEffect(() => {
    const params = new URLSearchParams({ type: assetType, symbol });
    fetch(`/api/asset-detail?${params}`)
      .then((r) => r.json())
      .then((d) => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [symbol, assetType]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("cash_balance")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setCashBalance(data.cash_balance);
        });
    });
  }, []);

  const isPositive = (detail?.change24h ?? 0) >= 0;

  const stats: { label: string; value: string }[] = detail
    ? assetType === "crypto"
      ? [
          { label: "Market Cap",         value: fmtLarge(detail.marketCap ?? 0) },
          { label: "24h Volume",         value: fmtLarge(detail.volume24h ?? 0) },
          { label: "Circulating Supply", value: detail.supply ? `${detail.supply.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${detail.symbol}` : "—" },
          { label: "All-Time High",      value: fmtPrice(detail.ath ?? 0) },
          { label: "All-Time Low",       value: fmtPrice(detail.atl ?? 0) },
          { label: "7d Change",          value: detail.change7d != null ? `${detail.change7d >= 0 ? "+" : ""}${detail.change7d.toFixed(2)}%` : "—" },
        ]
      : assetType === "stock"
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

  const tradeCoin: TradeCoin | null = detail
    ? { symbol: detail.symbol, name: detail.name, price: detail.price }
    : null;

  return (
    <>
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
                  <span className="font-mono text-xs font-bold" style={{ color: "var(--text-3)" }}>{symbol.slice(0, 3)}</span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
                  {detail?.name ?? symbol}
                </h2>
                <p className="font-mono text-sm" style={{ color: "var(--text-3)" }}>
                  {symbol}{detail?.exchange ? ` · ${detail.exchange}` : detail?.unit ? ` · ${detail.unit}` : ""}
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

            {/* Buy button */}
            <button
              onClick={() => setBuyOpen(true)}
              disabled={!detail}
              className="w-full py-3 rounded-xl font-mono font-bold text-sm tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                color: "#0a0800",
              }}
            >
              BUY {symbol}
            </button>
          </div>
        </div>
      </div>

      {buyOpen && tradeCoin && (
        <TradeModal
          mode="buy"
          coin={tradeCoin}
          assetType={assetType as "crypto" | "stock" | "commodity"}
          cashBalance={cashBalance}
          onClose={() => setBuyOpen(false)}
          onSuccess={() => { setBuyOpen(false); onClose(); }}
        />
      )}
    </>
  );
}
