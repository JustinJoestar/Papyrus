"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { PulseBeams } from "@/components/ui/pulse-beams";

// Each beam connects an outer asset node → the central hub
const BEAMS = [
  // Crypto — far left, mid-height → center-left
  {
    path: "M269 220.5H16.5C10.9772 220.5 6.5 224.977 6.5 230.5V398.5",
    gradientConfig: {
      initial:  { x1: "0%",   x2: "0%",   y1: "80%",  y2: "100%" },
      animate:  { x1: ["0%", "0%", "200%"], x2: ["0%", "0%", "180%"], y1: ["80%", "0%", "0%"], y2: ["100%", "20%", "20%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 2, delay: 0.2 },
    },
    connectionPoints: [
      { cx: 6.5,  cy: 398.5, r: 6   },
      { cx: 269,  cy: 220.5, r: 6   },
    ],
  },
  // Stocks — far right top → center-right
  {
    path: "M568 200H841C846.523 200 851 195.523 851 190V40",
    gradientConfig: {
      initial:  { x1: "0%",  x2: "0%",  y1: "80%",  y2: "100%" },
      animate:  { x1: ["20%", "100%", "100%"], x2: ["0%", "90%", "90%"], y1: ["80%", "80%", "-20%"], y2: ["100%", "100%", "0%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 2, delay: 0.6 },
    },
    connectionPoints: [
      { cx: 851,  cy: 34,    r: 6.5 },
      { cx: 568,  cy: 200,   r: 6   },
    ],
  },
  // Portfolio — bottom-left
  {
    path: "M425.5 274V333C425.5 338.523 421.023 343 415.5 343H152C146.477 343 142 347.477 142 353V426.5",
    gradientConfig: {
      initial:  { x1: "0%",  x2: "0%",  y1: "80%",  y2: "100%" },
      animate:  { x1: ["20%", "100%", "100%"], x2: ["0%", "90%", "90%"], y1: ["80%", "80%", "-20%"], y2: ["100%", "100%", "0%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 2, delay: 1.0 },
    },
    connectionPoints: [
      { cx: 142,  cy: 427,   r: 6.5 },
      { cx: 425.5, cy: 274,  r: 6   },
    ],
  },
  // Commodities — bottom-right
  {
    path: "M493 274V333.226C493 338.749 497.477 343.226 503 343.226H760C765.523 343.226 770 347.703 770 353.226V427",
    gradientConfig: {
      initial:  { x1: "40%", x2: "50%", y1: "160%", y2: "180%" },
      animate:  { x1: "0%",  x2: "10%", y1: "-40%", y2: "-20%" },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 2, delay: 1.4 },
    },
    connectionPoints: [
      { cx: 770,  cy: 427,   r: 6.5 },
      { cx: 493,  cy: 274,   r: 6   },
    ],
  },
  // Leagues — top center
  {
    path: "M380 168V17C380 11.4772 384.477 7 390 7H414",
    gradientConfig: {
      initial:  { x1: "-40%", x2: "-10%", y1: "0%",  y2: "20%" },
      animate:  { x1: ["40%", "0%", "0%"], x2: ["10%", "0%", "0%"], y1: ["0%", "0%", "180%"], y2: ["20%", "20%", "200%"] },
      transition: { duration: 2, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 2, delay: 1.8 },
    },
    connectionPoints: [
      { cx: 420.5, cy: 6.5,  r: 6   },
      { cx: 380,   cy: 168,  r: 6   },
    ],
  },
];

const GRADIENT_COLORS_DARK  = { start: "#c9a84c", middle: "#e8c66a", end: "#8a6f35" };
const GRADIENT_COLORS_LIGHT = { start: "#2563eb", middle: "#60a5fa", end: "#1d4ed8" };

// Labels mapped to approximate SVG endpoint positions (as % of 858×434 viewbox)
const NODE_LABELS = [
  { label: "CRYPTO",      sub: "250+ coins",     top: "76%",  left: "-2%",  align: "left"   },
  { label: "STOCKS",      sub: "35+ symbols",    top: "-4%",  left: "91%",  align: "right"  },
  { label: "PORTFOLIO",   sub: "Real-time P&L",  top: "104%", left: "10%",  align: "left"   },
  { label: "COMMODITIES", sub: "10 markets",     top: "104%", left: "80%",  align: "right"  },
  { label: "LEAGUES",     sub: "Weekly resets",  top: "-12%", left: "45%",  align: "center" },
];

export default function PulseSection() {
  const { resolvedTheme } = useTheme();
  const gradientColors = resolvedTheme === "light" ? GRADIENT_COLORS_LIGHT : GRADIENT_COLORS_DARK;

  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-8 pb-24">
      {/* Section header */}
      <div className="text-center mb-2">
        <p
          className="font-mono text-[10px] tracking-[0.28em] uppercase mb-3"
          style={{ color: "var(--text-2)" }}
        >
          One platform
        </p>
        <h2 className="font-playfair text-3xl font-bold mb-2" style={{ color: "var(--text-1)" }}>
          Every market.{" "}
          <span className="text-gold-glow">All connected.</span>
        </h2>
        <p
          className="font-cormorant text-xl font-medium max-w-lg mx-auto"
          style={{ color: "var(--text-2)" }}
        >
          Live data flows from every market straight into your paper portfolio.
        </p>
      </div>

      {/* Pulse beams canvas */}
      <div className="relative mt-6">
        <PulseBeams
          beams={BEAMS}
          gradientColors={gradientColors}
          width={858}
          height={434}
          baseColor="var(--border-mid)"
          accentColor="var(--border-bright)"
          className="h-[434px]"
        >
          {/* Central hub button */}
          <Link
            href="/auth/signup"
            className="relative group cursor-pointer inline-flex"
          >
            <div
              className="relative z-10 flex flex-col items-center justify-center w-[160px] h-[80px] rounded-2xl transition-all duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--surface) 0%, var(--elevated) 100%)",
                border: "1px solid var(--gold-border)",
                boxShadow: "var(--primary-glow), inset 0 1px 0 rgba(201,168,76,0.1)",
              }}
            >
              {/* Top shimmer line */}
              <div
                className="absolute top-0 inset-x-4 h-px rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent, var(--gold) 40%, var(--gold-bright) 60%, transparent)",
                }}
              />
              <div className="flex items-end gap-[3px] mb-1.5">
                <div className="w-[3px] h-3      rounded-sm" style={{ background: "var(--gold)" }} />
                <div className="w-[3px] h-[16px] rounded-sm" style={{ background: "var(--gold)" }} />
                <div className="w-[3px] h-2      rounded-sm" style={{ background: "var(--gold-dim)" }} />
              </div>
              <span
                className="font-mono font-bold text-[11px] tracking-[0.2em]"
                style={{ color: "var(--gold)" }}
              >
                PAPYRUS
              </span>
              <span
                className="font-mono text-[9px] tracking-[0.12em] mt-0.5"
                style={{ color: "var(--text-2)" }}
              >
                START TRADING →
              </span>
            </div>
            {/* Glow halo */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 80% 80% at 50% 50%, var(--gold-glow) 0%, transparent 70%)",
                transform: "scale(1.6)",
              }}
            />
          </Link>
        </PulseBeams>

        {/* Floating node labels */}
        {NODE_LABELS.map((node) => (
          <div
            key={node.label}
            className="absolute pointer-events-none"
            style={{
              top: node.top,
              left: node.left,
              textAlign: node.align as React.CSSProperties["textAlign"],
            }}
          >
            <p
              className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase"
              style={{ color: "var(--gold)" }}
            >
              {node.label}
            </p>
            <p
              className="font-mono text-[8px] tracking-wide"
              style={{ color: "var(--text-2)" }}
            >
              {node.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
