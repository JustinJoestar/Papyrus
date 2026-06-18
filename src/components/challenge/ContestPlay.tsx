"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TradeModal from "@/components/TradeModal";
import AutoRefresh from "@/components/challenge/AutoRefresh";
import { tradingWindow } from "@/lib/challenge";

type Holding = { symbol: string; quantity: number; avgBuyPrice: number; price: number; value: number };
type MarketItem = { symbol: string; name: string; price: number; change: number };

type Props = {
  contestName: string;
  leagueId: string;
  startsAt: string | null;
  endsAt: string | null;
  startingBalance: number;
  cash: number;
  holdings: Holding[];
  market: MarketItem[];
};

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ContestPlay({
  contestName, leagueId, startsAt, endsAt, startingBalance, cash, holdings, market,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"portfolio" | "market">(holdings.length > 0 ? "portfolio" : "market");
  const [buyTarget, setBuyTarget] = useState<MarketItem | null>(null);
  const [sellTarget, setSellTarget] = useState<Holding | null>(null);
  const [search, setSearch] = useState("");

  const { started, ended, open: tradingOpen } = tradingWindow(startsAt, endsAt);

  const holdingsValue = holdings.reduce((s, h) => s + h.value, 0);
  const totalValue = cash + holdingsValue;
  const totalReturn = totalValue - startingBalance;
  const returnPct = startingBalance > 0 ? (totalReturn / startingBalance) * 100 : 0;
  const isGain = totalReturn >= 0;

  const filtered = market.filter(
    (m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.symbol.toLowerCase().includes(search.toLowerCase())
  );

  function onSuccess() {
    setBuyTarget(null);
    setSellTarget(null);
    router.refresh();
  }

  const windowNotice = ended
    ? "The Challenge has ended — trading is closed. Final standings are locked."
    : !started
    ? "Trading hasn't opened yet. Browse the market and get your watchlist ready."
    : null;

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      {tradingOpen && <AutoRefresh seconds={60} />}
      {/* Header / value card */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: "var(--text-3)" }}>
          {contestName}
        </p>
        <h1 className="text-2xl font-bold mb-5" style={{ color: "var(--text-1)" }}>My Portfolio</h1>

        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-2" style={{ color: "var(--text-3)" }}>
            Total Value
          </p>
          <p className="font-mono text-4xl font-bold tracking-tight mb-3 text-gold-shimmer">${fmt(totalValue)}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-sm font-semibold"
              style={{
                background: isGain ? "var(--gain-bg)" : "var(--loss-bg)",
                border: `1px solid ${isGain ? "var(--gain-border)" : "var(--loss-border)"}`,
                color: isGain ? "var(--gain)" : "var(--loss)",
              }}
            >
              {isGain ? "▲" : "▼"} {isGain ? "+" : ""}${fmt(Math.abs(totalReturn))} ({isGain ? "+" : ""}{returnPct.toFixed(2)}%)
            </span>
            <span className="font-mono text-[10px] tracking-widest" style={{ color: "var(--text-3)" }}>
              CASH ${fmt(cash)}
            </span>
            <Link href="/challenge/leaderboard" className="ml-auto font-mono text-[10px] tracking-wider underline" style={{ color: "var(--gold)" }}>
              Leaderboard →
            </Link>
          </div>
        </div>
      </div>

      {windowNotice && (
        <div
          className="rounded-xl px-4 py-3 mb-6 text-sm"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--text-2)" }}
        >
          {windowNotice}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-full sm:w-fit" style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}>
        {(["portfolio", "market"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 sm:flex-none font-mono text-xs font-semibold py-2 px-6 rounded-lg transition-all capitalize"
            style={tab === t
              ? { background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold-bright)" }
              : { border: "1px solid transparent", color: "var(--text-3)" }}
          >
            {t === "portfolio" ? "Positions" : "Market"}
          </button>
        ))}
      </div>

      {/* Portfolio */}
      {tab === "portfolio" && (
        holdings.length === 0 ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
            <p className="text-sm mb-4" style={{ color: "var(--text-3)" }}>No positions yet.</p>
            <button onClick={() => setTab("market")} className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl" style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}>
              Browse the market →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {holdings.map((h) => {
              const pl = (h.price - h.avgBuyPrice) * h.quantity;
              const plPct = h.avgBuyPrice > 0 ? ((h.price - h.avgBuyPrice) / h.avgBuyPrice) * 100 : 0;
              const up = pl >= 0;
              return (
                <div key={h.symbol} className="rounded-2xl px-5 py-4 flex items-center gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold" style={{ color: "var(--text-1)" }}>{h.symbol}</p>
                    <p className="font-mono text-[11px]" style={{ color: "var(--text-3)" }}>
                      {h.quantity.toFixed(4)} @ ${fmt(h.avgBuyPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm" style={{ color: "var(--text-1)" }}>${fmt(h.value)}</p>
                    <p className="font-mono text-[11px]" style={{ color: up ? "var(--gain)" : "var(--loss)" }}>
                      {up ? "+" : ""}${fmt(Math.abs(pl))} ({up ? "+" : ""}{plPct.toFixed(2)}%)
                    </p>
                  </div>
                  <button
                    onClick={() => setSellTarget(h)}
                    disabled={!tradingOpen}
                    className="font-mono text-xs px-4 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "var(--loss-bg)", border: "1px solid var(--loss-border)", color: "var(--loss)" }}
                  >
                    Sell
                  </button>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Market */}
      {tab === "market" && (
        <>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ticker..."
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none mb-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border-mid)", color: "var(--text-1)" }}
          />
          <div className="space-y-2">
            {filtered.map((m) => {
              const up = m.change >= 0;
              return (
                <div key={m.symbol} className="rounded-2xl px-5 py-4 flex items-center gap-4" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold" style={{ color: "var(--text-1)" }}>{m.symbol}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{m.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm" style={{ color: "var(--text-1)" }}>${fmt(m.price)}</p>
                    <p className="font-mono text-[11px]" style={{ color: up ? "var(--gain)" : "var(--loss)" }}>
                      {up ? "+" : ""}{m.change.toFixed(2)}%
                    </p>
                  </div>
                  <button
                    onClick={() => setBuyTarget(m)}
                    disabled={!tradingOpen || m.price <= 0}
                    className="font-mono text-xs px-4 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
                  >
                    Buy
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Trade modals */}
      {buyTarget && (
        <TradeModal
          mode="buy"
          coin={{ symbol: buyTarget.symbol, name: buyTarget.name, price: buyTarget.price }}
          assetType="stock"
          cashBalance={cash}
          leagueId={leagueId}
          leagueName={contestName}
          onClose={() => setBuyTarget(null)}
          onSuccess={onSuccess}
        />
      )}
      {sellTarget && (
        <TradeModal
          mode="sell"
          coin={{ symbol: sellTarget.symbol, name: sellTarget.symbol, price: sellTarget.price }}
          assetType="stock"
          maxQuantity={sellTarget.quantity}
          leagueId={leagueId}
          leagueName={contestName}
          onClose={() => setSellTarget(null)}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
