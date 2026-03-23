"use client";

import { useEffect, useRef, useState } from "react";

// ── Fake order book data ──────────────────────────────────────────────────────
const ASKS_BASE = [
  { price: 97842.50, size: 0.412 },
  { price: 97839.00, size: 1.058 },
  { price: 97835.75, size: 0.284 },
  { price: 97831.25, size: 2.190 },
  { price: 97828.00, size: 0.776 },
];

const BIDS_BASE = [
  { price: 97822.50, size: 1.330 },
  { price: 97819.00, size: 0.592 },
  { price: 97815.50, size: 3.045 },
  { price: 97811.75, size: 0.888 },
  { price: 97807.00, size: 1.421 },
];

const SPARK = [38, 42, 39, 45, 41, 48, 44, 52, 49, 58, 54, 61, 57, 63, 59, 68, 65, 71, 69, 74];

function jitter(n: number, range = 0.3) {
  return +(n + (Math.random() - 0.5) * range).toFixed(3);
}

function fmtPrice(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Sparkline SVG
function Sparkline({ data }: { data: number[] }) {
  const w = 120, h = 34;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const fill = `${pts.join(" ")} ${w},${h} 0,${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#spark-fill)" />
      <polyline points={polyline} stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function HeroTerminal() {
  const [asks, setAsks] = useState(ASKS_BASE);
  const [bids, setBids] = useState(BIDS_BASE);
  const [spark, setSpark] = useState(SPARK);
  const [lastTrade, setLastTrade] = useState({ price: 97824.50, side: "buy" as "buy" | "sell" });
  const [flash, setFlash] = useState(false);
  const tickRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;

      setAsks(prev => prev.map(r => ({ ...r, size: jitter(r.size, 0.18) })));
      setBids(prev => prev.map(r => ({ ...r, size: jitter(r.size, 0.18) })));

      const side = Math.random() > 0.5 ? "buy" : "sell";
      const base = side === "buy" ? BIDS_BASE[0].price : ASKS_BASE[0].price;
      setLastTrade({ price: +(base + (Math.random() - 0.5) * 4).toFixed(2), side });

      setSpark(prev => {
        const next = [...prev.slice(1), prev[prev.length - 1] + (Math.random() - 0.4) * 3];
        return next;
      });

      if (tickRef.current % 3 === 0) {
        setFlash(true);
        setTimeout(() => setFlash(false), 180);
      }
    }, 900);
    return () => clearInterval(id);
  }, []);

  const maxSize = Math.max(...asks.map(r => r.size), ...bids.map(r => r.size));

  return (
    <div
      className="rounded-2xl overflow-hidden select-none"
      style={{
        width: 240,
        background: "#000000",
        border: "1px solid var(--border-mid)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,76,0.08)",
      }}
    >
      {/* Top accent */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--gold-dim) 30%, var(--gold) 50%, var(--gold-dim) 70%, transparent)" }} />

      {/* Header */}
      <div className="px-4 pt-3.5 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm" style={{ color: "var(--text-1)" }}>BTC/USD</span>
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
          >
            SPOT
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkline data={spark} />
        </div>
      </div>

      {/* Mid price */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <div
            className="font-mono font-bold text-lg leading-none transition-colors duration-150"
            style={{ color: flash ? "#e8c66a" : lastTrade.side === "buy" ? "#22c55e" : "#f43f5e" }}
          >
            ${fmtPrice(lastTrade.price)}
          </div>
          <div className="font-mono text-[9px] mt-0.5" style={{ color: "var(--text-3)" }}>
            LAST TRADE · {lastTrade.side.toUpperCase()}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs font-semibold" style={{ color: "#22c55e" }}>+2.14%</div>
          <div className="font-mono text-[9px]" style={{ color: "var(--text-3)" }}>24H</div>
        </div>
      </div>

      {/* Order book header */}
      <div className="px-4 pt-2.5 pb-1 grid grid-cols-2 gap-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="font-mono text-[9px] tracking-widest" style={{ color: "var(--text-3)" }}>PRICE (USD)</span>
        <span className="font-mono text-[9px] tracking-widest text-right" style={{ color: "var(--text-3)" }}>SIZE (BTC)</span>
      </div>

      {/* Asks */}
      <div className="px-4 pt-1 space-y-[2px]">
        {asks.slice().reverse().map((row, i) => (
          <div key={i} className="relative flex items-center justify-between py-[2px]">
            <div
              className="absolute right-0 top-0 bottom-0 opacity-20 rounded-sm"
              style={{ width: `${(row.size / maxSize) * 65}%`, background: "#f43f5e" }}
            />
            <span className="font-mono text-[11px] relative z-10" style={{ color: "#f87171" }}>
              {fmtPrice(row.price)}
            </span>
            <span className="font-mono text-[11px] relative z-10" style={{ color: "var(--text-3)" }}>
              {row.size.toFixed(3)}
            </span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="px-4 py-1.5 flex items-center gap-2" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <span className="font-mono text-[9px]" style={{ color: "var(--text-3)" }}>SPREAD</span>
        <span className="font-mono text-[10px]" style={{ color: "var(--gold)" }}>
          ${(ASKS_BASE[ASKS_BASE.length - 1].price - BIDS_BASE[0].price).toFixed(2)}
        </span>
        <span className="font-mono text-[9px] ml-auto" style={{ color: "var(--text-3)" }}>
          {(((ASKS_BASE[ASKS_BASE.length - 1].price - BIDS_BASE[0].price) / BIDS_BASE[0].price) * 100).toFixed(4)}%
        </span>
      </div>

      {/* Bids */}
      <div className="px-4 pb-3 pt-1 space-y-[2px]">
        {bids.map((row, i) => (
          <div key={i} className="relative flex items-center justify-between py-[2px]">
            <div
              className="absolute right-0 top-0 bottom-0 opacity-20 rounded-sm"
              style={{ width: `${(row.size / maxSize) * 65}%`, background: "#22c55e" }}
            />
            <span className="font-mono text-[11px] relative z-10" style={{ color: "#4ade80" }}>
              {fmtPrice(row.price)}
            </span>
            <span className="font-mono text-[11px] relative z-10" style={{ color: "var(--text-3)" }}>
              {row.size.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
