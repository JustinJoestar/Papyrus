"use client";

export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "#09090b", zIndex: 9999 }}
    >
      {/* Logo mark — three bars, equalizer animation */}
      <div className="flex items-end gap-[5px] mb-5" style={{ height: 36 }}>
        <div className="loading-bar loading-bar-1" />
        <div className="loading-bar loading-bar-2" />
        <div className="loading-bar loading-bar-3" />
      </div>

      {/* Wordmark */}
      <div
        className="font-mono font-bold tracking-[0.22em] text-sm loading-wordmark"
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
