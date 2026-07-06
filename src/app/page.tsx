import Link from "next/link";
import AssetTicker from "@/components/AssetTicker";
import { DarkBackground } from "@/components/DarkBackground";
import NavThemeToggle from "@/components/NavThemeToggle";
import PulseSection from "@/components/PulseSection";
import Guilloche from "@/components/Guilloche";
import PapyrusMark, { Seal } from "@/components/PapyrusMark";
import { createClient } from "@/lib/supabase/server";
import { HeroGlobePanel, HeroTerminalPanel } from "@/components/HeroSidePanels";
import { GoldShimmerCta } from "@/components/GoldShimmerCta";

const FEATURES = [
  {
    no: "01",
    title: "Live market data",
    desc: "Prices pulled in real time from crypto, stock, and commodity markets. The exact same assets and volatility — no simulated numbers.",
  },
  {
    no: "02",
    title: "Weekly competition",
    desc: "Every Monday, the board resets. Compete globally or challenge friends in private leagues. Pure skill, no carryover advantage.",
  },
  {
    no: "03",
    title: "Full portfolio ledger",
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
      <DarkBackground />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 h-16 flex items-center px-6 sm:px-8 gap-4 backdrop-blur-md"
        style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--border)" }}
      >
        <Link href="/" className="shrink-0">
          <PapyrusMark sealSize={28} wordmarkSize={15} />
        </Link>
        <span
          className="font-mono text-[9px] tracking-[0.18em] px-1.5 py-0.5 rounded hidden sm:inline"
          style={{
            background: "var(--gold-glow)",
            border: "1px solid var(--gold-border)",
            color: "var(--gold)",
          }}
        >
          BETA
        </span>

        <div className="ml-auto flex items-center gap-3">
          <NavThemeToggle />
          {isLoggedIn ? (
            <GoldShimmerCta href="/dashboard" className="px-4 py-2 text-xs">
              Dashboard →
            </GoldShimmerCta>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm px-4 py-2 rounded-lg transition-colors hover:opacity-80"
                style={{ color: "var(--text-2)" }}
              >
                Sign in
              </Link>
              <GoldShimmerCta href="/auth/signup" className="px-4 py-2 text-xs">
                Get Started
              </GoldShimmerCta>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto px-6 sm:px-8 pt-24 sm:pt-32 pb-24" style={{ maxWidth: 1400 }}>

        {/* Guilloché rosette — the engraved certificate backdrop */}
        <div
          className="absolute left-1/2 pointer-events-none"
          style={{ top: "42%", transform: "translate(-50%, -50%)" }}
        >
          <Guilloche size={720} />
        </div>

        <div className="relative flex items-center justify-center">

          {/* Left — live order book terminal */}
          <div
            className="hidden xl:flex items-center justify-center absolute"
            style={{ left: 0, top: "50%", transform: "translateY(-50%)" }}
          >
            <HeroTerminalPanel />
          </div>

          {/* Center — copy */}
          <div className="text-center relative" style={{ maxWidth: 640 }}>
            {/* Status pill */}
            <div
              className="rise inline-flex items-center gap-2 rounded-full px-3.5 py-1 mb-9"
              style={{ "--i": 0, background: "var(--gold-glow)", border: "1px solid var(--gold-border)" } as React.CSSProperties}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-blink-dot" style={{ background: "var(--gold)" }} />
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--gold)" }}>
                Live markets · Zero risk
              </span>
            </div>

            <h1
              className="rise font-display font-semibold tracking-tight mb-7"
              style={{ "--i": 1, fontSize: "clamp(2.4rem, 2rem + 3.6vw, 5.2rem)", lineHeight: 1.04 } as React.CSSProperties}
            >
              Trade everything.
              <br />
              <em className="text-gold-glow" style={{ fontWeight: 500 }}>Risk nothing.</em>
            </h1>

            <p
              className="rise text-base leading-relaxed max-w-md mx-auto mb-10"
              style={{ "--i": 2, color: "var(--text-2)" } as React.CSSProperties}
            >
              Start with $10,000 in virtual cash. Trade real crypto, stocks, and
              commodities at live prices — compete weekly, reset every Monday.
            </p>

            <div className="rise" style={{ "--i": 3 } as React.CSSProperties}>
              <GoldShimmerCta href={ctaHref}>
                {isLoggedIn ? "Open Dashboard" : "Start for free"}
              </GoldShimmerCta>
            </div>

            {/* Inline stats — stamped ledger entries */}
            <div
              className="rise inline-flex items-stretch mt-12 rounded-xl overflow-hidden"
              style={{ "--i": 4, border: "1px solid var(--border-mid)", background: "var(--card-bg)" } as React.CSSProperties}
            >
              {[["250+", "cryptos"], ["35+", "stocks"], ["$10k", "to start"]].map(([val, lbl], i) => (
                <div
                  key={lbl}
                  className="px-4 sm:px-8 py-3 text-center"
                  style={i > 0 ? { borderLeft: "1px solid var(--border)" } : undefined}
                >
                  <div className="font-mono font-bold text-sm" style={{ color: "var(--gold)" }}>{val}</div>
                  <div className="font-mono text-[9px] tracking-widest uppercase mt-0.5" style={{ color: "var(--text-3)" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — globe */}
          <div
            className="hidden xl:flex items-center justify-center absolute"
            style={{ right: 0, top: "50%", transform: "translateY(-50%)" }}
          >
            <HeroGlobePanel />
          </div>

        </div>
      </section>

      {/* ── Ticker ──────────────────────────────────────────── */}
      <div className="relative z-10">
        <AssetTicker />
      </div>

      {/* ── Features — numbered ledger entries ─────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 pt-28 pb-28">
        <div className="grid md:grid-cols-[1fr_1.6fr] gap-10 md:gap-20">
          {/* Left — sticky heading */}
          <div>
            <p className="label-ledger mb-4">The Instrument</p>
            <h2 className="font-display text-4xl font-semibold leading-tight" style={{ color: "var(--text-1)" }}>
              Everything in{" "}
              <em style={{ color: "var(--gold-bright)" }}>one place</em>
            </h2>
            <p className="text-base mt-4 leading-relaxed" style={{ color: "var(--text-3)" }}>
              The infrastructure of a real trading desk, built for learning and competition.
            </p>
          </div>

          {/* Right — ruled entries */}
          <div>
            {FEATURES.map((f, i) => (
              <div
                key={f.no}
                className="group flex gap-6 py-8"
                style={{ borderTop: i === 0 ? "1px solid var(--border-mid)" : "1px solid var(--border)" }}
              >
                <span
                  className="font-display text-3xl shrink-0 leading-none pt-0.5 transition-colors duration-300"
                  style={{ color: "var(--gold-dim)", fontStyle: "italic" }}
                >
                  {f.no}
                </span>
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--text-1)" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border)" }} />
          </div>
        </div>
      </section>

      {/* ── Pulse Beams ─────────────────────────────────────── */}
      <PulseSection />

      {/* ── Bottom CTA — the certificate ─────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 pb-32 text-center">
        <div
          className="card-cert corner-frame rounded-2xl px-8 sm:px-16 py-16 sm:py-20 relative overflow-hidden"
        >
          {/* Top accent line */}
          <div className="rule-fade absolute top-0 inset-x-8" />
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 110%, var(--cta-radial) 0%, transparent 65%)" }}
          />
          {/* Faint rosette */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.5 }}>
            <Guilloche size={460} />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <Seal size={44} />
            <h2 className="font-display text-4xl sm:text-5xl font-semibold mt-6 mb-4" style={{ color: "var(--text-1)" }}>
              Ready to compete?
            </h2>
            <p className="text-base mb-10" style={{ color: "var(--text-3)" }}>
              No card required. Your $10,000 is waiting.
            </p>
            <GoldShimmerCta href={ctaHref} className="px-9">
              {isLoggedIn ? "Open Dashboard" : "Create free account"}
            </GoldShimmerCta>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase mt-8" style={{ color: "var(--text-3)" }}>
              Certificate № 000001 · Virtual funds only
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        className="relative z-10 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <PapyrusMark sealSize={24} wordmarkSize={13} showEst />
          <div className="flex items-center gap-6">
            <Link
              href="/tos"
              className="font-mono text-[10px] tracking-[0.18em] uppercase transition-opacity hover:opacity-70"
              style={{ color: "var(--text-3)" }}
            >
              Terms
            </Link>
            <a
              href="https://discord.gg/4tmwxCET2H"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] tracking-[0.18em] uppercase transition-opacity hover:opacity-70"
              style={{ color: "var(--text-3)" }}
            >
              Discord
            </a>
          </div>
        </div>
        <div className="footer-aurora py-4 text-center" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--text-3)" }}>
            Virtual funds only · No real money at risk
          </p>
        </div>
      </footer>
    </div>
  );
}
