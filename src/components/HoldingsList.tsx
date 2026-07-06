"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TradeModal from "./TradeModal";
import HoldingDetailModal from "./HoldingDetailModal";

export type HoldingWithPrice = {
  id: string;
  symbol: string;
  asset_type: string;
  quantity: number;
  avg_buy_price: number;
  currentPrice: number;
  currentValue: number;
  coinId?: string;
};

export default function HoldingsList({
  holdings,
  leagueId,
  leagueName,
  marketHref = "/dashboard/market",
}: {
  holdings: HoldingWithPrice[];
  leagueId?: string | null;
  leagueName?: string | null;
  marketHref?: string;
}) {
  const router = useRouter();
  const [sellTarget, setSellTarget] = useState<HoldingWithPrice | null>(null);
  const [detailTarget, setDetailTarget] = useState<HoldingWithPrice | null>(null);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (holdings.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center"
        style={{
          background: "var(--card-bg)",
          border: "1px dashed var(--border-bright)",
        }}
      >
        <p className="font-display italic text-lg mb-2" style={{ color: "var(--text-3)" }}>
          The ledger is empty.
        </p>
        <Link
          href={marketHref}
          className="text-sm font-medium transition-opacity hover:opacity-75"
          style={{ color: "var(--gold)" }}
        >
          Browse the market →
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* One ledger sheet, ruled rows */}
      <div className="sheet">
        {holdings.map((h, i) => {
          const costBasis = h.avg_buy_price * h.quantity;
          const pnl       = h.currentValue - costBasis;
          const pnlPct    = (pnl / costBasis) * 100;
          const isGain    = pnl >= 0;

          return (
            <div
              key={h.id}
              className="row-ledger group rise"
              style={{ "--i": i } as React.CSSProperties}
              onClick={() => setDetailTarget(h)}
            >
              {/* Asset icon */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150"
                style={{
                  background: "var(--elevated)",
                  border: "1px solid var(--border-mid)",
                }}
              >
                <span
                  className="font-mono text-[9px] font-bold"
                  style={{ color: "var(--gold-dim)" }}
                >
                  {h.symbol.slice(0, 3).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>
                  {h.symbol}
                </p>
                <p className="text-xs font-mono mt-0.5 tabular-nums" style={{ color: "var(--text-3)" }}>
                  {h.quantity.toFixed(6)} · avg ${fmt(h.avg_buy_price)}
                </p>
              </div>

              <div className="text-right mr-2">
                <p className="font-mono font-semibold text-sm tabular-nums" style={{ color: "var(--text-1)" }}>
                  ${fmt(h.currentValue)}
                </p>
                <p
                  className="text-xs font-mono font-medium mt-0.5 tabular-nums"
                  style={{ color: isGain ? "var(--gain)" : "var(--loss)" }}
                >
                  {isGain ? "▲ +" : "▼ "}{pnlPct.toFixed(2)}%
                </p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setSellTarget(h); }}
                className="btn-danger shrink-0 px-3 py-1.5 text-xs font-mono font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150"
              >
                SELL
              </button>
            </div>
          );
        })}
      </div>

      {detailTarget && (
        <HoldingDetailModal
          holding={detailTarget}
          onClose={() => setDetailTarget(null)}
          onSell={(h) => { setDetailTarget(null); setSellTarget(h); }}
        />
      )}

      {sellTarget && (
        <TradeModal
          mode="sell"
          coin={{ symbol: sellTarget.symbol, name: sellTarget.symbol, price: sellTarget.currentPrice }}
          assetType={sellTarget.asset_type as "crypto" | "stock" | "commodity"}
          maxQuantity={sellTarget.quantity}
          leagueId={leagueId ?? null}
          leagueName={leagueName ?? null}
          onClose={() => setSellTarget(null)}
          onSuccess={() => { setSellTarget(null); router.refresh(); }}
        />
      )}
    </>
  );
}
