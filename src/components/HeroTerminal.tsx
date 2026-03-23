"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Asset definitions (alternating crypto / stock) ─────────────────────────
const ASSETS = [
  {
    symbol: "BTC/USD", unit: "BTC", type: "crypto",
    asks: [
      { price: 97842.50, size: 0.412 },
      { price: 97839.00, size: 1.058 },
      { price: 97835.75, size: 0.284 },
      { price: 97831.25, size: 2.190 },
      { price: 97828.00, size: 0.776 },
    ],
    bids: [
      { price: 97822.50, size: 1.330 },
      { price: 97819.00, size: 0.592 },
      { price: 97815.50, size: 3.045 },
      { price: 97811.75, size: 0.888 },
      { price: 97807.00, size: 1.421 },
    ],
    midPrice: 97824.50,
    change: "+2.14",
    spark: [38, 42, 39, 45, 41, 48, 44, 52, 49, 58, 54, 61, 57, 63, 59, 68, 65, 71, 69, 74],
  },
  {
    symbol: "AAPL", unit: "shares", type: "stock",
    asks: [
      { price: 213.85, size: 142 },
      { price: 213.78, size: 305 },
      { price: 213.72, size: 88  },
      { price: 213.65, size: 520 },
      { price: 213.60, size: 211 },
    ],
    bids: [
      { price: 213.50, size: 390 },
      { price: 213.44, size: 175 },
      { price: 213.38, size: 640 },
      { price: 213.31, size: 260 },
      { price: 213.25, size: 418 },
    ],
    midPrice: 213.52,
    change: "+0.87",
    spark: [55, 58, 54, 60, 57, 62, 59, 65, 61, 67, 64, 69, 66, 71, 68, 73, 70, 75, 72, 77],
  },
  {
    symbol: "ETH/USD", unit: "ETH", type: "crypto",
    asks: [
      { price: 3284.40, size: 1.820 },
      { price: 3282.10, size: 4.305 },
      { price: 3280.75, size: 0.940 },
      { price: 3278.50, size: 7.210 },
      { price: 3276.20, size: 2.650 },
    ],
    bids: [
      { price: 3272.80, size: 3.440 },
      { price: 3270.50, size: 1.815 },
      { price: 3268.10, size: 8.920 },
      { price: 3265.80, size: 2.340 },
      { price: 3263.40, size: 5.180 },
    ],
    midPrice: 3273.60,
    change: "+3.41",
    spark: [30, 35, 32, 38, 34, 41, 37, 44, 40, 48, 44, 51, 47, 54, 50, 57, 53, 60, 56, 63],
  },
  {
    symbol: "NVDA", unit: "shares", type: "stock",
    asks: [
      { price: 875.60, size: 68  },
      { price: 875.20, size: 184 },
      { price: 874.85, size: 42  },
      { price: 874.40, size: 310 },
      { price: 874.05, size: 127 },
    ],
    bids: [
      { price: 873.60, size: 230 },
      { price: 873.20, size: 95  },
      { price: 872.80, size: 450 },
      { price: 872.35, size: 162 },
      { price: 871.90, size: 285 },
    ],
    midPrice: 873.90,
    change: "+1.56",
    spark: [40, 44, 41, 47, 43, 50, 46, 53, 49, 56, 52, 59, 55, 62, 58, 65, 61, 68, 64, 71],
  },
  {
    symbol: "SOL/USD", unit: "SOL", type: "crypto",
    asks: [
      { price: 172.45, size: 28.40 },
      { price: 172.28, size: 61.80 },
      { price: 172.12, size: 14.20 },
      { price: 171.95, size: 95.60 },
      { price: 171.80, size: 37.40 },
    ],
    bids: [
      { price: 171.60, size: 52.10 },
      { price: 171.44, size: 23.80 },
      { price: 171.28, size: 118.40 },
      { price: 171.12, size: 41.20 },
      { price: 170.95, size: 68.60 },
    ],
    midPrice: 171.70,
    change: "+5.28",
    spark: [20, 25, 22, 30, 26, 35, 30, 40, 35, 46, 40, 52, 46, 58, 52, 62, 56, 66, 60, 70],
  },
  {
    symbol: "AMZN", unit: "shares", type: "stock",
    asks: [
      { price: 192.40, size: 210 },
      { price: 192.28, size: 485 },
      { price: 192.15, size: 130 },
      { price: 192.02, size: 720 },
      { price: 191.90, size: 295 },
    ],
    bids: [
      { price: 191.72, size: 550 },
      { price: 191.60, size: 240 },
      { price: 191.48, size: 810 },
      { price: 191.35, size: 370 },
      { price: 191.22, size: 490 },
    ],
    midPrice: 191.80,
    change: "+1.12",
    spark: [48, 51, 49, 54, 51, 57, 53, 59, 55, 62, 58, 65, 61, 68, 64, 70, 66, 73, 69, 75],
  },
];

function jitter(n: number, pct = 0.002) {
  return +(n * (1 + (Math.random() - 0.5) * pct)).toFixed(n > 100 ? 2 : 3);
}

function fmtPrice(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtSize(n: number, unit: string) {
  if (unit === "shares") return Math.round(n).toString();
  return n.toFixed(unit === "SOL" ? 2 : 3);
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 80, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x},${y}`;
  });
  const color = positive ? "#22c55e" : "#f43f5e";
  const fill = `${pts.join(" ")} ${w},${h} 0,${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={`sf-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#sf-${positive})`} />
      <polyline points={pts.join(" ")} stroke={color} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function HeroTerminal() {
  const [idx, setIdx]             = useState(0);
  const [asks, setAsks]           = useState(ASSETS[0].asks.map(r => ({ ...r })));
  const [bids, setBids]           = useState(ASSETS[0].bids.map(r => ({ ...r })));
  const [spark, setSpark]         = useState([...ASSETS[0].spark]);
  const [lastPrice, setLastPrice] = useState(ASSETS[0].midPrice);
  const [lastSide, setLastSide]   = useState<"buy" | "sell">("buy");
  const [flash, setFlash]         = useState(false);
  const tickRef   = useRef(0);
  const autoRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((next: number) => {
    const a = ASSETS[next];
    setIdx(next);
    setAsks(a.asks.map(r => ({ ...r })));
    setBids(a.bids.map(r => ({ ...r })));
    setSpark([...a.spark]);
    setLastPrice(a.midPrice);
    setLastSide("buy");
    tickRef.current = 0;
  }, []);

  // Auto-advance every 10 seconds
  useEffect(() => {
    autoRef.current = setInterval(() => {
      setIdx(i => {
        const next = (i + 1) % ASSETS.length;
        goTo(next);
        return next;
      });
    }, 10000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [goTo]);

  // Reset auto-timer on manual navigation
  const navigate = useCallback((dir: 1 | -1) => {
    if (autoRef.current) clearInterval(autoRef.current);
    setIdx(i => {
      const next = (i + dir + ASSETS.length) % ASSETS.length;
      goTo(next);
      autoRef.current = setInterval(() => {
        setIdx(i2 => {
          const n2 = (i2 + 1) % ASSETS.length;
          goTo(n2);
          return n2;
        });
      }, 10000);
      return next;
    });
  }, [goTo]);

  // Live price jitter
  useEffect(() => {
    const asset = ASSETS[idx];
    const id = setInterval(() => {
      tickRef.current += 1;
      setAsks(prev => prev.map((r, i) => ({ ...r, size: jitter(asset.asks[i].size, 0.06) })));
      setBids(prev => prev.map((r, i) => ({ ...r, size: jitter(asset.bids[i].size, 0.06) })));
      const side = Math.random() > 0.5 ? "buy" : "sell";
      setLastSide(side);
      setLastPrice(+(asset.midPrice + (Math.random() - 0.5) * asset.midPrice * 0.0003).toFixed(2));
      setSpark(prev => [...prev.slice(1), prev[prev.length - 1] + (Math.random() - 0.4) * 2]);
      if (tickRef.current % 3 === 0) { setFlash(true); setTimeout(() => setFlash(false), 160); }
    }, 900);
    return () => clearInterval(id);
  }, [idx]);

  const asset    = ASSETS[idx];
  const maxSize  = Math.max(...asks.map(r => r.size), ...bids.map(r => r.size));
  const pos      = parseFloat(asset.change) >= 0;
  const isCrypto = asset.type === "crypto";

  const ArrowBtn = ({ dir }: { dir: 1 | -1 }) => (
    <button
      onClick={() => navigate(dir)}
      className="absolute flex items-center justify-center rounded-md transition-all duration-150"
      style={{
        top: "50%", transform: "translateY(-50%)",
        [dir === -1 ? "left" : "right"]: -18,
        width: 16, height: 28,
        background: "rgba(0,0,0,0.7)",
        border: "1px solid var(--border-mid)",
        color: "var(--text-3)",
        zIndex: 10,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = "var(--gold)";
        e.currentTarget.style.borderColor = "var(--gold-border)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = "var(--text-3)";
        e.currentTarget.style.borderColor = "var(--border-mid)";
      }}
    >
      <svg width="7" height="10" viewBox="0 0 7 10" fill="none">
        {dir === -1
          ? <path d="M5 1L1.5 5 5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M2 1l3.5 4L2 9"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        }
      </svg>
    </button>
  );

  return (
    <div className="relative select-none" style={{ width: 240 }}>
      <ArrowBtn dir={-1} />
      <ArrowBtn dir={1} />

      <div
        className="rounded-2xl overflow-hidden"
        style={{
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
            <span className="font-mono font-bold text-sm" style={{ color: "var(--text-1)" }}>{asset.symbol}</span>
            <span
              className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={isCrypto
                ? { background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }
                : { background: "rgba(37,99,235,0.10)", border: "1px solid rgba(37,99,235,0.25)", color: "#60a5fa" }
              }
            >
              {isCrypto ? "SPOT" : "STOCK"}
            </span>
          </div>
          <Sparkline data={spark} positive={pos} />
        </div>

        {/* Mid price */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <div
              className="font-mono font-bold text-lg leading-none transition-colors duration-150"
              style={{ color: flash ? "#e8c66a" : lastSide === "buy" ? "#22c55e" : "#f43f5e" }}
            >
              ${fmtPrice(lastPrice)}
            </div>
            <div className="font-mono text-[9px] mt-0.5" style={{ color: "var(--text-3)" }}>
              LAST TRADE · {lastSide.toUpperCase()}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs font-semibold" style={{ color: pos ? "#22c55e" : "#f43f5e" }}>
              {pos ? "+" : ""}{asset.change}%
            </div>
            <div className="font-mono text-[9px]" style={{ color: "var(--text-3)" }}>24H</div>
          </div>
        </div>

        {/* Order book header */}
        <div className="px-4 pt-2.5 pb-1 grid grid-cols-2 gap-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <span className="font-mono text-[9px] tracking-widest" style={{ color: "var(--text-3)" }}>PRICE (USD)</span>
          <span className="font-mono text-[9px] tracking-widest text-right" style={{ color: "var(--text-3)" }}>SIZE ({asset.unit.toUpperCase()})</span>
        </div>

        {/* Asks */}
        <div className="px-4 pt-1 space-y-[2px]">
          {asks.slice().reverse().map((row, i) => (
            <div key={i} className="relative flex items-center justify-between py-[2px]">
              <div className="absolute right-0 top-0 bottom-0 opacity-20 rounded-sm"
                style={{ width: `${(row.size / maxSize) * 65}%`, background: "#f43f5e" }} />
              <span className="font-mono text-[11px] relative z-10" style={{ color: "#f87171" }}>{fmtPrice(row.price)}</span>
              <span className="font-mono text-[11px] relative z-10" style={{ color: "var(--text-3)" }}>{fmtSize(row.size, asset.unit)}</span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="px-4 py-1.5 flex items-center gap-2" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <span className="font-mono text-[9px]" style={{ color: "var(--text-3)" }}>SPREAD</span>
          <span className="font-mono text-[10px]" style={{ color: "var(--gold)" }}>
            ${(asset.asks[0].price - asset.bids[0].price).toFixed(2)}
          </span>
          <span className="font-mono text-[9px] ml-auto" style={{ color: "var(--text-3)" }}>
            {(((asset.asks[0].price - asset.bids[0].price) / asset.bids[0].price) * 100).toFixed(3)}%
          </span>
        </div>

        {/* Bids */}
        <div className="px-4 pb-3 pt-1 space-y-[2px]">
          {bids.map((row, i) => (
            <div key={i} className="relative flex items-center justify-between py-[2px]">
              <div className="absolute right-0 top-0 bottom-0 opacity-20 rounded-sm"
                style={{ width: `${(row.size / maxSize) * 65}%`, background: "#22c55e" }} />
              <span className="font-mono text-[11px] relative z-10" style={{ color: "#4ade80" }}>{fmtPrice(row.price)}</span>
              <span className="font-mono text-[11px] relative z-10" style={{ color: "var(--text-3)" }}>{fmtSize(row.size, asset.unit)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
