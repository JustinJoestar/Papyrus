import Link from "next/link";
import AssetTicker from "@/components/AssetTicker";
import { BeamsBackground } from "@/components/BeamsBackground";
import NavThemeToggle from "@/components/NavThemeToggle";
import PulseSection from "@/components/PulseSection";
import { createClient } from "@/lib/supabase/server";

const STATS = [
  { value: "250+",    label: "Cryptocurrencies" },
  { value: "35+",     label: "Stocks"           },
  { value: "10",      label: "Commodities"      },
  { value: "$10,000", label: "Starting balance" },
];

const FEATURES = [
  {
    title: "Live market data",
    desc: "Prices pulled in real time from crypto, stock, and commodity markets. The exact same assets and volatility — no simulated numbers.",
  },
  {
    title: "Weekly competition",
    desc: "Every Monday, the board resets. Compete globally or challenge friends in private leagues. Pure skill, no carryover advantage.",
  },
  {
    title: "Full portfolio view",
    desc: "Track open positions, P&L, and trade history in one place. Know exactly where you stand at every moment.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  const ctaHref = isLoggedIn ? "/dashboard" : "/auth/signup";

  return (
    <div className="min-h-screen relative overflow-hidden landing-bg" style={{ color: "var(--text-1)" }}>
      <BeamsBackground />

      {/* Readability veil — sits between beams and content */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 h-14 flex items-center px-8 gap-4 backdrop-blur-md"
        style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-end gap-[3px]">
            <div className="w-[3px] h-3      rounded-sm" style={{ background: "var(--gold)" }} />
            <div className="w-[3px] h-[16px] rounded-sm" style={{ background: "var(--gold)" }} />
            <div className="w-[3px] h-2      rounded-sm" style={{ background: "var(--gold-dim)" }} />
          </div>
          <span className="font-mono font-bold text-sm tracking-[0.15em]" style={{ color: "var(--text-1)" }}>
            PAPYRUS
          </span>
        </Link>

        <div className="w-px h-4 shrink-0" style={{ background: "var(--border-mid)" }} />

        <div className="ml-auto flex items-center gap-3">
          <NavThemeToggle />
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="font-mono text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              style={{
                background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 60%, var(--gold-bright) 100%)",
                color: "#0a0800",
              }}
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ color: "var(--text-2)" }}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="font-mono text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 60%, var(--gold-bright) 100%)",
                  color: "#0a0800",
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 pt-24 pb-20 text-center">
        {/* Status pill */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 mb-10"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-blink-dot" style={{ background: "var(--gold)" }} />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--gold)" }}>
            Live markets · Zero risk
          </span>
        </div>

        <h1
          className="font-playfair font-bold tracking-tight mb-6"
          style={{ fontSize: "clamp(3rem, 6.5vw, 5rem)", lineHeight: 1.06 }}
        >
          Trade everything.{" "}
          <span className="text-gold-glow">Risk nothing.</span>
        </h1>

        <p
          className="text-lg leading-relaxed max-w-xl mx-auto mb-10"
          style={{ color: "var(--text-2)" }}
        >
          Start with $10,000 in virtual cash and trade real crypto, stocks, and commodities
          at live prices. Compete on a global leaderboard that resets every week.
        </p>

        <div className="flex items-center justify-center">
          <Link
            href={ctaHref}
            className="font-mono font-semibold text-sm tracking-wide px-7 py-3 rounded-lg transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 60%, var(--gold-bright) 100%)",
              color: "#0a0800",
              boxShadow: "var(--primary-glow)",
            }}
          >
            {isLoggedIn ? "Open Dashboard" : "Start for free"}
          </Link>
        </div>
      </section>

      {/* ── Ticker ──────────────────────────────────────────── */}
      <div className="relative z-10">
        <AssetTicker />
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 py-16">
        <div
          className="grid grid-cols-4 divide-x rounded-2xl overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-mid)",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="px-6 py-5 text-center"
              style={{ borderRight: i < STATS.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <p className="font-playfair font-bold text-2xl mb-1 text-gold-glow">{s.value}</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 pb-24">
        <div className="mb-10 text-center">
          <h2 className="font-playfair text-3xl font-bold mb-3" style={{ color: "var(--text-1)" }}>
            Everything in one place
          </h2>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            The infrastructure of a real trading desk, built for learning and competition.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-mid)",
              }}
            >
              <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-1)" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pulse Beams ─────────────────────────────────────── */}
      <PulseSection />

      {/* ── Bottom CTA ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 pb-24 text-center">
        <div
          className="rounded-2xl px-12 py-14 relative overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-mid)",
          }}
        >
          {/* Top accent line */}
          <div
            className="h-px absolute top-0 inset-x-0"
            style={{ background: "linear-gradient(90deg, transparent, var(--gold) 35%, var(--gold-bright) 50%, var(--gold) 65%, transparent)" }}
          />
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 110%, var(--cta-radial) 0%, transparent 65%)" }}
          />

          <div className="relative z-10">
            <h2 className="font-playfair text-3xl font-bold mb-3" style={{ color: "var(--text-1)" }}>
              Ready to compete?
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
              No card required. Your $10,000 is waiting.
            </p>
            <Link
              href={ctaHref}
              className="inline-block font-mono font-semibold text-sm tracking-wide px-9 py-3 rounded-lg transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 60%, var(--gold-bright) 100%)",
                color: "#0a0800",
                boxShadow: "var(--primary-glow)",
              }}
            >
              {isLoggedIn ? "Open Dashboard" : "Create free account"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        className="relative z-10 border-t py-8 text-center"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          Papyrus — virtual funds only, no real money at risk
        </p>
      </footer>
    </div>
  );
}
