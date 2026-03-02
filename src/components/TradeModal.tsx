"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type TradeCoin = {
  symbol: string;
  name: string;
  price: number;
};

type Props = {
  mode: "buy" | "sell";
  coin: TradeCoin;
  assetType?: "crypto" | "stock" | "commodity";
  cashBalance?: number;
  maxQuantity?: number;
  onClose: () => void;
  onSuccess: () => void;
};

const SELL_PRESETS = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

export default function TradeModal({
  mode,
  coin,
  assetType = "crypto",
  cashBalance,
  maxQuantity,
  onClose,
  onSuccess,
}: Props) {
  const supabase = createClient();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyIn, setBuyIn] = useState<"usd" | "coin">("usd"); // buy mode only

  const parsed = parseFloat(amount) || 0;

  // Quantity and USD value depend on buy input mode
  const quantity =
    mode === "sell"
      ? parsed
      : buyIn === "usd"
      ? parsed / coin.price
      : parsed;

  const usdValue =
    mode === "sell"
      ? parsed * coin.price
      : buyIn === "usd"
      ? parsed
      : parsed * coin.price;

  // Slider percentage (sell mode only)
  const sliderPct =
    maxQuantity && maxQuantity > 0 ? (parsed / maxQuantity) * 100 : 0;

  function setPercent(pct: number) {
    if (!maxQuantity) return;
    setAmount((maxQuantity * pct).toFixed(6));
  }

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    if (!maxQuantity) return;
    const pct = parseFloat(e.target.value) / 100;
    setAmount((maxQuantity * pct).toFixed(6));
  }

  async function handleTrade() {
    if (quantity <= 0) return;
    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("execute_trade", {
      p_symbol: coin.symbol,
      p_asset_type: assetType,
      p_type: mode,
      p_quantity: quantity,
      p_price: coin.price,
    });

    if (rpcError || data?.success === false) {
      setError(rpcError?.message ?? data?.error ?? "Trade failed");
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <h2 className="text-xl font-bold mb-1">
          {mode === "buy" ? "Buy" : "Sell"} {coin.name}
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Current price: ${fmt(coin.price)}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Buy mode toggle: USD vs coin quantity */}
        {mode === "buy" && (
          <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
            <button
              onClick={() => { setBuyIn("usd"); setAmount(""); }}
              className={`flex-1 text-sm font-medium rounded-md py-1.5 transition ${
                buyIn === "usd"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => { setBuyIn("coin"); setAmount(""); }}
              className={`flex-1 text-sm font-medium rounded-md py-1.5 transition ${
                buyIn === "coin"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {coin.symbol}
            </button>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {mode === "sell"
              ? `Quantity to sell (${coin.symbol})`
              : buyIn === "usd"
              ? "Amount to spend (USD)"
              : `Amount to buy (${coin.symbol})`}
          </label>
          <input
            type="number"
            min="0"
            step={mode === "buy" && buyIn === "usd" ? "1" : "0.000001"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
            placeholder={
              mode === "sell"
                ? "0.001"
                : buyIn === "usd"
                ? "100"
                : `0.001 ${coin.symbol}`
            }
            autoFocus
          />
        </div>

        {/* Sell-only: percentage presets + slider */}
        {mode === "sell" && maxQuantity !== undefined && (
          <div className="mb-4 space-y-3">
            {/* Percentage buttons */}
            <div className="grid grid-cols-4 gap-2">
              {SELL_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPercent(p.value)}
                  className="bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 hover:text-white rounded-lg py-1.5 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Slider */}
            <div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.01"
                value={sliderPct}
                onChange={handleSlider}
                className="w-full accent-red-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>{sliderPct.toFixed(1)}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg px-4 py-3 mb-6 text-sm text-gray-400 space-y-1">
          {mode === "buy" ? (
            <>
              <div>
                {buyIn === "usd" ? "You'll receive" : "You'll spend"}:{" "}
                <span className="text-white font-medium">
                  {buyIn === "usd"
                    ? `${quantity.toFixed(6)} ${coin.symbol}`
                    : `$${fmt(usdValue)}`}
                </span>
              </div>
              {cashBalance !== undefined && (
                <div>
                  Available:{" "}
                  <span className="text-white">${fmt(cashBalance)}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                You&apos;ll receive:{" "}
                <span className="text-white font-medium">${fmt(usdValue)}</span>
              </div>
              {maxQuantity !== undefined && (
                <div>
                  You hold:{" "}
                  <span className="text-white">
                    {maxQuantity.toFixed(6)} {coin.symbol}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg py-2.5 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleTrade}
            disabled={loading || quantity <= 0}
            className={`flex-1 font-semibold rounded-lg py-2.5 transition disabled:opacity-50 ${
              mode === "buy"
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {loading
              ? "Processing..."
              : mode === "buy"
              ? "Confirm Buy"
              : "Confirm Sell"}
          </button>
        </div>
      </div>
    </div>
  );
}
