"use client";

import { useState, useRef, useEffect } from "react";
import { useMarketLeague, type LeagueOption } from "@/app/dashboard/market/MarketLeagueProvider";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LeagueSwitcher() {
  const { leagues, activeLeague, setActiveLeague } = useMarketLeague();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (leagues.length === 0) return null;

  const label = activeLeague ? activeLeague.name : "Global Portfolio";
  const balance = activeLeague ? activeLeague.cashBalance : null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-all"
        style={{
          background: activeLeague ? "var(--gold-glow)" : "var(--elevated)",
          border: `1px solid ${activeLeague ? "var(--gold-border)" : "var(--border-mid)"}`,
          color: activeLeague ? "var(--gold)" : "var(--text-2)",
        }}
      >
        <span className="text-base leading-none">{activeLeague ? "🏆" : "🌐"}</span>
        <span className="font-mono text-xs font-semibold tracking-wide">{label}</span>
        {balance !== null && (
          <span className="font-mono text-[10px]" style={{ color: "var(--gold-dim)" }}>
            ${fmt(balance)}
          </span>
        )}
        <span className="font-mono text-[10px] opacity-60">▾</span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1.5 w-64 rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.6)] z-50"
          style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        >
          {/* Global option */}
          <button
            onClick={() => { setActiveLeague(null); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left"
            style={{
              background: !activeLeague ? "var(--elevated)" : "transparent",
              borderBottom: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => { if (activeLeague) e.currentTarget.style.background = "var(--elevated)"; }}
            onMouseLeave={(e) => { if (activeLeague) e.currentTarget.style.background = "transparent"; }}
          >
            <span className="text-base leading-none shrink-0">🌐</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs" style={{ color: "var(--text-1)" }}>Global Portfolio</p>
              <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>Main competition</p>
            </div>
            {!activeLeague && (
              <span className="font-mono text-[10px] shrink-0" style={{ color: "var(--gold)" }}>✓</span>
            )}
          </button>

          {/* League options */}
          {leagues.map((league) => {
            const isActive = activeLeague?.id === league.id;
            return (
              <button
                key={league.id}
                onClick={() => { setActiveLeague(league); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left"
                style={{ background: isActive ? "var(--elevated)" : "transparent" }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--elevated)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span className="text-base leading-none shrink-0">🏆</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs truncate" style={{ color: "var(--text-1)" }}>{league.name}</p>
                  <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--gold-dim)" }}>
                    ${fmt(league.cashBalance)} available
                  </p>
                </div>
                {isActive && (
                  <span className="font-mono text-[10px] shrink-0" style={{ color: "var(--gold)" }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
