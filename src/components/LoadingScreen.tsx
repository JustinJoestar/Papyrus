"use client";

import { Seal } from "@/components/PapyrusMark";

export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "var(--base)", zIndex: 9999 }}
    >
      {/* The seal, breathing */}
      <div className="loading-wordmark mb-5">
        <Seal size={52} />
      </div>

      {/* Wordmark */}
      <div
        className="font-display font-semibold tracking-[0.22em] text-sm loading-wordmark"
        style={{ color: "var(--gold)" }}
      >
        PAPYRUS
      </div>

      {/* Sweep line */}
      <div className="loading-sweep-wrap mt-8">
        <div className="loading-sweep-line" />
      </div>
    </div>
  );
}
