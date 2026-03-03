import Link from "next/link";
import AssetTicker from "@/components/AssetTicker";

const STATS = [
  { value: "250+",    label: "Coins"             },
  { value: "35+",     label: "Stocks"            },
  { value: "10",      label: "Commodities"       },
  { value: "$10,000", label: "Starting Balance"  },
  { value: "Weekly",  label: "Competition Reset" },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l4.5-4.5 4 4L16 8l5 5" />
      </svg>
    ),
    title: "Real Market Data",
    desc: "Live prices across crypto, stocks, and commodities. The same assets, the same volatility — zero real money at risk.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
    title: "Weekly Leagues",
    desc: "Every week starts fresh with $10,000. Climb the global leaderboard, join private leagues, and prove your edge.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
    title: "Portfolio Tracking",
    desc: "Watch your positions in real time. See your P&L, open positions, and full trade history all in one place.",
  },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen relative overflow-hidden bg-imac"
      style={{ color: "var(--text-1)" }}
    >
      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-[3px]">
            <div className="w-[3px] h-3      rounded-sm" style={{ background: "var(--gold)" }} />
            <div className="w-[3px] h-[18px] rounded-sm" style={{ background: "var(--gold)" }} />
            <div className="w-[3px] h-2      rounded-sm" style={{ background: "var(--gold-dim)" }} />
          </div>
          <span className="font-playfair font-bold text-xl tracking-wide" style={{ color: "var(--text-1)" }}>
            Papyrus
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/market"
            className="font-cormorant text-base italic px-3 py-1.5 transition-colors"
            style={{ color: "var(--text-3)" }}
          >
            Markets
          </Link>
          <Link
            href="/auth/login"
            className="font-mono text-xs px-4 py-2 rounded-xl transition-all"
            style={{ color: "var(--text-2)", border: "1px solid var(--border-mid)" }}
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="font-mono text-xs font-bold px-4 py-2 rounded-xl transition-all"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
              color: "#0a0800",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pt-20 pb-16 text-center">
        {/* Live badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-blink-dot" style={{ background: "var(--gold)" }} />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--gold)" }}>
            Live Markets · Zero Risk
          </span>
        </div>

        {/* Main headline — Playfair + glow */}
        <h1 className="font-playfair font-bold leading-[1.08] tracking-tight mb-4" style={{ fontSize: "clamp(2.8rem, 6vw, 4.5rem)" }}>
          Paper trade.{" "}
          <span className="font-playfair italic text-gold-glow">
            Real competition.
          </span>
        </h1>

        {/* Subheadline — Cormorant italic */}
        <p
          className="font-cormorant text-2xl italic mb-3 leading-relaxed"
          style={{ color: "var(--text-3)" }}
        >
          The trading arena where skill, not luck, determines the leaderboard.
        </p>

        <p className="font-mono text-sm max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-3)" }}>
          Get $10,000 in virtual cash. Trade crypto, stocks, and commodities
          with live prices. Compete weekly. Reset every Monday.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/auth/signup"
            className="font-bold font-mono text-sm tracking-[0.1em] px-8 py-3.5 rounded-xl transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
              color: "#0a0800",
              boxShadow: "0 0 30px rgba(201,168,76,0.25), 0 0 60px rgba(201,168,76,0.10)",
            }}
          >
            START TRADING FREE →
          </Link>
          <Link
            href="/dashboard/market"
            className="font-cormorant italic text-lg px-8 py-3 rounded-xl transition-all duration-200"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-mid)",
              color: "var(--text-2)",
            }}
          >
            Browse Markets
          </Link>
        </div>

        <p className="mt-5 font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--text-3)" }}>
          Virtual funds only · No real money at risk
        </p>
      </section>

      {/* ── Asset Ticker ─────────────────────────────────────── */}
      <div className="relative z-10">
        <AssetTicker />
      </div>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-16">
        <div
          className="rounded-2xl px-8 py-6 grid grid-cols-5 gap-4"
          style={{
            background: "rgba(13,13,13,0.75)",
            border: "1px solid var(--border-mid)",
            backdropFilter: "blur(16px)",
          }}
        >
          {STATS.map((s, i) => (
            <div key={s.label} className={`text-center px-4 ${i < STATS.length - 1 ? "border-r" : ""}`} style={{ borderColor: "var(--border)" }}>
              <p className="font-playfair font-bold text-2xl mb-1 text-gold-glow">
                {s.value}
              </p>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--text-3)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-24">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-center mb-3" style={{ color: "var(--text-3)" }}>
          Everything you need
        </p>
        <h2 className="font-playfair text-3xl font-bold text-center mb-2" style={{ color: "var(--text-1)" }}>
          Built for serious traders
        </h2>
        <p className="font-cormorant italic text-xl text-center mb-10" style={{ color: "var(--text-3)" }}>
          The tools professionals use, with nothing to lose.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: "rgba(13,13,13,0.75)",
                border: "1px solid var(--border-mid)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="font-playfair font-semibold text-lg mb-2" style={{ color: "var(--text-1)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-24 text-center">
        <div
          className="rounded-2xl p-12 relative overflow-hidden"
          style={{ background: "rgba(13,13,13,0.75)", border: "1px solid var(--border-mid)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(201,168,76,0.10) 0%, transparent 65%)" }}
          />
          <div
            className="h-px absolute top-0 inset-x-0"
            style={{ background: "linear-gradient(90deg, transparent, var(--gold) 35%, var(--gold-bright) 50%, var(--gold) 65%, transparent)" }}
          />

          <div className="relative z-10">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--text-3)" }}>
              Ready to compete?
            </p>
            <h2 className="font-playfair text-4xl font-bold italic mb-3 text-gold-glow">
              Start with $10,000 today
            </h2>
            <p className="font-cormorant italic text-xl mb-8" style={{ color: "var(--text-3)" }}>
              No credit card. No real money. Just strategy.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block font-bold font-mono text-sm tracking-[0.1em] px-10 py-3.5 rounded-xl transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                color: "#0a0800",
                boxShadow: "0 0 30px rgba(201,168,76,0.25)",
              }}
            >
              CREATE FREE ACCOUNT →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="relative z-10 border-t pb-10 pt-8 text-center" style={{ borderColor: "var(--border)" }}>
        <p className="font-cormorant italic text-base" style={{ color: "var(--text-3)" }}>
          Papyrus — Virtual funds only · No real money at risk
        </p>
      </footer>
    </div>
  );
}
