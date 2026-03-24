import Link from "next/link";
import AssetTicker from "@/components/AssetTicker";
import { DarkBackground } from "@/components/DarkBackground";
import NavThemeToggle from "@/components/NavThemeToggle";
import PulseSection from "@/components/PulseSection";
import { createClient } from "@/lib/supabase/server";
import { HeroGlobePanel, HeroTerminalPanel } from "@/components/HeroSidePanels";
import { GoldShimmerCta } from "@/components/GoldShimmerCta";


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
      <DarkBackground />

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
            <GoldShimmerCta href="/dashboard" className="px-4 py-2 text-xs">
              Dashboard →
            </GoldShimmerCta>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm px-4 py-2 rounded-lg transition-colors"
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
      <section className="relative z-10 mx-auto px-8 pt-32 pb-24" style={{ maxWidth: 1400 }}>
        <div className="relative flex items-center justify-center">

          {/* Left — live order book terminal (absolute, doesn't affect center) */}
          <div
            className="hidden xl:flex items-center justify-center absolute"
            style={{ left: 0, top: "50%", transform: "translateY(-50%)" }}
          >
            <HeroTerminalPanel />
          </div>

          {/* Center — copy */}
          <div className="text-center" style={{ maxWidth: 620 }}>
            {/* Status pill */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 mb-8"
              style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-blink-dot" style={{ background: "var(--gold)" }} />
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--gold)" }}>
                Live markets · Zero risk
              </span>
            </div>

            <h1
              className="font-playfair font-bold tracking-tight mb-6"
              style={{ fontSize: "clamp(2.8rem, 5vw, 4.8rem)", lineHeight: 1.06 }}
            >
              Trade everything.{" "}
              <span className="text-gold-glow">Risk nothing.</span>
            </h1>

            <p
              className="text-base leading-relaxed max-w-md mx-auto mb-10"
              style={{ color: "var(--text-2)" }}
            >
              Start with $10,000 in virtual cash. Trade real crypto, stocks, and
              commodities at live prices — compete weekly, reset every Monday.
            </p>

            <GoldShimmerCta href={ctaHref}>
              {isLoggedIn ? "Open Dashboard" : "Start for free"}
            </GoldShimmerCta>

            {/* Inline stats */}
            <div className="flex items-center justify-center gap-6 mt-8">
              {[["250+", "cryptos"], ["35+", "stocks"], ["$10k", "to start"]].map(([val, lbl]) => (
                <div key={lbl} className="text-center">
                  <div className="font-mono font-bold text-sm" style={{ color: "var(--gold)" }}>{val}</div>
                  <div className="font-mono text-[9px] tracking-widest uppercase mt-0.5" style={{ color: "var(--text-3)" }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — globe (absolute, doesn't affect center) */}
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

      {/* ── Features ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-10 pt-28 pb-32">
        <div className="mb-14 text-center">
          <h2 className="font-playfair text-4xl font-bold mb-4" style={{ color: "var(--text-1)" }}>
            Everything in one place
          </h2>
          <p className="text-base" style={{ color: "var(--text-2)" }}>
            The infrastructure of a real trading desk, built for learning and competition.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-7"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-mid)",
              }}
            >
              <h3 className="font-semibold text-base mb-3" style={{ color: "var(--text-1)" }}>
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
      <section className="relative z-10 max-w-4xl mx-auto px-10 pb-32 text-center">
        <div
          className="rounded-2xl px-16 py-20 relative overflow-hidden"
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
            <h2 className="font-playfair text-4xl font-bold mb-4" style={{ color: "var(--text-1)" }}>
              Ready to compete?
            </h2>
            <p className="text-base mb-10" style={{ color: "var(--text-3)" }}>
              No card required. Your $10,000 is waiting.
            </p>
            <GoldShimmerCta href={ctaHref} className="px-9">
              {isLoggedIn ? "Open Dashboard" : "Create free account"}
            </GoldShimmerCta>
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
