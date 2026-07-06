import Link from "next/link";
import Guilloche from "@/components/Guilloche";

export default function NotFound() {
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
        <p className="rise label-ledger mb-4" style={{ "--i": 0, letterSpacing: "0.3em" } as React.CSSProperties}>
          Error 404
        </p>
        <h1
          className="rise font-display font-semibold text-7xl mb-3 text-gold-gradient"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          404
        </h1>
        <p className="rise font-display italic text-xl mb-1" style={{ "--i": 2, color: "var(--text-2)" } as React.CSSProperties}>
          This page is not on the ledger.
        </p>
        <p className="rise text-sm mb-8" style={{ "--i": 3, color: "var(--text-3)" } as React.CSSProperties}>
          It doesn&apos;t exist or was moved.
        </p>
        <div className="rise" style={{ "--i": 4 } as React.CSSProperties}>
          <Link
            href="/dashboard"
            className="btn-bronze inline-flex text-sm px-6 py-2.5"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
