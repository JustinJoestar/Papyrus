"use client";

import { useEffect } from "react";
import Guilloche from "@/components/Guilloche";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ color: "var(--text-1)" }}
    >
      {/* Engraved rosette backdrop */}
      <div
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <Guilloche size={640} />
      </div>

      <div className="relative z-10 text-center max-w-sm">
        <p className="label-ledger mb-4" style={{ letterSpacing: "0.3em" }}>
          Unexpected Error
        </p>
        <h1
          className="font-display font-semibold text-7xl mb-3"
          style={{
            background: "linear-gradient(135deg, #8b3a3a, #c05050, #e07070)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          500
        </h1>
        <p className="font-display italic text-xl mb-1" style={{ color: "var(--text-2)" }}>
          The ink smudged.
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
          An unexpected error occurred. Try again or go back to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-bronze text-sm px-6 py-2.5"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="btn-ghost text-sm px-6 py-2.5 font-mono"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
