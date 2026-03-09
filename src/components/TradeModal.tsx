"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type TradeCoin = { symbol: string; name: string; price: number };

type Props = {
  mode: "buy" | "sell";
  coin: TradeCoin;
  assetType?: "crypto" | "stock" | "commodity";
  cashBalance?: number;
  maxQuantity?: number;
  leagueId?: string | null;
  leagueName?: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

const SELL_PRESETS = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5  },
  { label: "75%", value: 0.75 },
  { label: "MAX", value: 1    },
];

export default function TradeModal({
  mode, coin, assetType = "crypto", cashBalance, maxQuantity,
  leagueId, leagueName, onClose, onSuccess,
}: Props) {
  const supabase = createClient();
  const [amount,  setAmount]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [buyIn,   setBuyIn]   = useState<"usd" | "coin">("usd");

  const parsed   = parseFloat(amount) || 0;
  const rawQty   = mode === "sell" ? parsed : buyIn === "usd" ? parsed / coin.price : parsed;
  const quantity = mode === "sell" && maxQuantity !== undefined ? Math.min(rawQty, maxQuantity) : rawQty;
  const usdValue = mode === "sell" ? parsed * coin.price : buyIn === "usd" ? parsed : parsed * coin.price;
  const sliderPct = maxQuantity && maxQuantity > 0 ? (parsed / maxQuantity) * 100 : 0;

  function setPercent(pct: number) {
    if (!maxQuantity) return;
    setAmount(pct === 1 ? String(maxQuantity) : (maxQuantity * pct).toFixed(6));
  }
  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    if (!maxQuantity) return;
    const pct = parseFloat(e.target.value) / 100;
    setAmount(pct >= 1 ? String(maxQuantity) : (maxQuantity * pct).toFixed(6));
  }

  async function handleTrade() {
    if (quantity <= 0) return;
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = leagueId
      ? await supabase.rpc("execute_league_trade", {
          p_league_id: leagueId, p_symbol: coin.symbol, p_asset_type: assetType,
          p_type: mode, p_quantity: quantity, p_price: coin.price,
        })
      : await supabase.rpc("execute_trade", {
          p_symbol: coin.symbol, p_asset_type: assetType,
          p_type: mode, p_quantity: quantity, p_price: coin.price,
        });
    if (rpcError || data?.success === false) {
      setError(rpcError?.message ?? data?.error ?? "Trade failed");
      setLoading(false);
    } else {
      // Check achievements in background after every global trade
      if (!leagueId) supabase.rpc("check_trade_achievements");
      onSuccess();
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isBuy = mode === "buy";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(5,6,8,0.80)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_48px_96px_rgba(0,0,0,0.8)]"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-mid)",
        }}
      >
        {/* Header accent */}
        <div
          className="h-px"
          style={{
            background: isBuy
              ? "linear-gradient(90deg, transparent, var(--gold) 40%, var(--gold-bright) 50%, var(--gold) 60%, transparent)"
              : "linear-gradient(90deg, transparent, var(--loss) 50%, transparent)",
          }}
        />

        <div className="p-7">
          {/* Title */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-bold text-lg" style={{ color: "var(--text-1)" }}>
                {isBuy ? "Buy" : "Sell"} {coin.name}
              </h2>
              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-3)" }}>
                Current price:{" "}
                <span style={{ color: "var(--gold-bright)" }}>${fmt(coin.price)}</span>
              </p>
              {leagueName && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-xs">🏆</span>
                  <span
                    className="font-mono text-[10px] tracking-wide px-2 py-0.5 rounded-md"
                    style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
                  >
                    {leagueName}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-lg leading-none transition-colors"
              style={{ color: "var(--text-3)", border: "1px solid var(--border-mid)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
            >
              ×
            </button>
          </div>

          {error && (
            <div
              className="mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
              style={{ background: "var(--loss-bg)", border: "1px solid var(--loss-border)" }}
            >
              <span className="font-mono text-[10px] shrink-0 pt-0.5" style={{ color: "var(--loss)" }}>ERR</span>
              <span style={{ color: "var(--loss)" }}>{error}</span>
            </div>
          )}

          {/* Buy mode toggle */}
          {isBuy && (
            <div
              className="flex rounded-xl p-1 mb-4 gap-1"
              style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}
            >
              {(["usd", "coin"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setBuyIn(opt); setAmount(""); }}
                  className="flex-1 text-xs font-mono font-semibold py-1.5 rounded-lg transition-all duration-150"
                  style={
                    buyIn === opt
                      ? { background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold-bright)" }
                      : { border: "1px solid transparent", color: "var(--text-3)" }
                  }
                >
                  {opt === "usd" ? "USD ($)" : coin.symbol}
                </button>
              ))}
            </div>
          )}

          {/* Amount input */}
          <div className="mb-4">
            <label
              className="block font-mono text-[10px] tracking-[0.2em] uppercase mb-2"
              style={{ color: "var(--text-3)" }}
            >
              {mode === "sell"
                ? `Quantity (${coin.symbol})`
                : buyIn === "usd"
                ? "Amount (USD)"
                : `Amount (${coin.symbol})`}
            </label>
            <input
              type="number"
              min="0"
              step={mode === "buy" && buyIn === "usd" ? "1" : "0.000001"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none transition-all"
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border-mid)",
                color: "var(--text-1)",
              }}
              onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--gold-border)")}
              onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--border-mid)")}
              placeholder={mode === "sell" ? "0.001" : buyIn === "usd" ? "100" : `0.001`}
              autoFocus
            />
          </div>

          {/* Sell presets + slider */}
          {mode === "sell" && maxQuantity !== undefined && (
            <div className="mb-4 space-y-3">
              <div className="grid grid-cols-4 gap-1.5">
                {SELL_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setPercent(p.value)}
                    className="text-xs font-mono py-1.5 rounded-lg transition-all duration-150"
                    style={{
                      background: "var(--elevated)",
                      border: "1px solid var(--border-mid)",
                      color: "var(--text-2)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--gold-border)";
                      e.currentTarget.style.color       = "var(--gold-bright)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-mid)";
                      e.currentTarget.style.color       = "var(--text-2)";
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div>
                <input
                  type="range" min="0" max="100" step="0.01"
                  value={sliderPct} onChange={handleSlider}
                  className="w-full cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-xs font-mono mt-1" style={{ color: "var(--text-3)" }}>
                  <span>0%</span>
                  <span style={{ color: "var(--loss)" }}>{sliderPct.toFixed(1)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div
            className="rounded-xl px-4 py-3 mb-5 text-sm space-y-1.5"
            style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}
          >
            {isBuy ? (
              <>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-3)" }}>
                    {buyIn === "usd" ? "You'll receive" : "You'll spend"}
                  </span>
                  <span className="font-mono font-medium" style={{ color: "var(--text-1)" }}>
                    {buyIn === "usd"
                      ? `${quantity.toFixed(6)} ${coin.symbol}`
                      : `$${fmt(usdValue)}`}
                  </span>
                </div>
                {cashBalance !== undefined && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-3)" }}>Available</span>
                    <span className="font-mono" style={{ color: "var(--gold)" }}>${fmt(cashBalance)}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-3)" }}>You'll receive</span>
                  <span className="font-mono font-medium" style={{ color: "var(--gain)" }}>${fmt(usdValue)}</span>
                </div>
                {maxQuantity !== undefined && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-3)" }}>You hold</span>
                    <span className="font-mono" style={{ color: "var(--text-2)" }}>
                      {maxQuantity.toFixed(6)} {coin.symbol}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 font-medium text-sm py-2.5 rounded-xl transition-all duration-150"
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border-mid)",
                color: "var(--text-2)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleTrade}
              disabled={loading || quantity <= 0}
              className="flex-1 font-bold font-mono text-sm tracking-wide py-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={
                isBuy
                  ? {
                      background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                      color: "#0a0800",
                    }
                  : {
                      background: "var(--loss-bg)",
                      border: "1px solid var(--loss-border)",
                      color: "var(--loss)",
                    }
              }
            >
              {loading
                ? "Processing..."
                : isBuy
                ? "CONFIRM BUY"
                : "CONFIRM SELL"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
