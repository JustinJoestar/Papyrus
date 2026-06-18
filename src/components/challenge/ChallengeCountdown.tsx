"use client";

import { useState, useEffect } from "react";

type Unit = { label: string; value: number };

function diff(targetIso: string): Unit[] {
  const ms = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  const secs = Math.floor((ms % 60_000) / 1000);
  return [
    { label: "DAYS", value: days },
    { label: "HRS", value: hours },
    { label: "MIN", value: mins },
    { label: "SEC", value: secs },
  ];
}

export default function ChallengeCountdown({
  label,
  targetIso,
}: {
  label: string;
  targetIso: string;
}) {
  const [units, setUnits] = useState<Unit[] | null>(null);

  useEffect(() => {
    setUnits(diff(targetIso));
    const id = setInterval(() => setUnits(diff(targetIso)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return (
    <div className="flex flex-col items-center">
      <p
        className="font-mono text-[10px] tracking-[0.28em] uppercase mb-3"
        style={{ color: "var(--text-3)" }}
      >
        {label}
      </p>
      <div className="flex items-start gap-3 sm:gap-4">
        {(units ?? [
          { label: "DAYS", value: 0 },
          { label: "HRS", value: 0 },
          { label: "MIN", value: 0 },
          { label: "SEC", value: 0 },
        ]).map((u) => (
          <div key={u.label} className="flex flex-col items-center">
            <div
              className="rounded-xl px-3 sm:px-4 py-2 sm:py-3 min-w-[58px] sm:min-w-[68px] text-center"
              style={{
                background: "rgba(13,13,13,0.85)",
                border: "1px solid var(--gold-border)",
                boxShadow: "0 0 24px rgba(201,168,76,0.08)",
              }}
            >
              <span
                className="font-mono font-bold text-2xl sm:text-3xl tabular-nums text-gold-gradient"
                suppressHydrationWarning
              >
                {String(u.value).padStart(2, "0")}
              </span>
            </div>
            <span
              className="font-mono text-[9px] tracking-[0.2em] mt-1.5"
              style={{ color: "var(--text-3)" }}
            >
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
