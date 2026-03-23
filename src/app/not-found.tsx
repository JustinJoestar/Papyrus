import Link from "next/link";

export default function NotFound() {
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
          Error 404
        </p>
        <h1
          className="font-mono font-bold text-6xl mb-3"
          style={{
            background: "linear-gradient(135deg, var(--gold-dim), var(--gold), var(--gold-bright))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </h1>
        <p className="text-base mb-1" style={{ color: "var(--text-2)" }}>
          Page not found
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
          This page doesn&apos;t exist or was moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block font-mono font-bold text-sm tracking-[0.1em] px-6 py-2.5 rounded-xl transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
            color: "#0a0800",
          }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
