"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: "var(--void)",
        backgroundImage: "radial-gradient(rgba(201,168,76,0.12) 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px",
        color: "var(--text-1)",
      }}
    >
      <div className="text-center max-w-sm">
        <p
          className="font-mono text-[10px] tracking-[0.3em] uppercase mb-4"
          style={{ color: "var(--text-3)" }}
        >
          Unexpected Error
        </p>
        <h1
          className="font-mono font-bold text-5xl mb-3"
          style={{
            background: "linear-gradient(135deg, #8b3a3a, #c05050, #e07070)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          500
        </h1>
        <p className="text-base mb-1" style={{ color: "var(--text-2)" }}>
          Something went wrong
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
          An unexpected error occurred. Try again or go back to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="font-mono font-bold text-sm tracking-[0.1em] px-6 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
              color: "#0a0800",
            }}
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="font-mono text-sm px-6 py-2.5 rounded-xl transition-all"
            style={{
              background: "var(--elevated)",
              border: "1px solid var(--border-mid)",
              color: "var(--text-2)",
            }}
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
