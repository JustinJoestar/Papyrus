import Link from "next/link";
import AssetTicker from "@/components/AssetTicker";
import { BeamsBackground } from "@/components/BeamsBackground";
import NavThemeToggle from "@/components/NavThemeToggle";
import NavLinks from "@/components/NavLinks";
import PulseSection from "@/components/PulseSection";
import { createClient } from "@/lib/supabase/server";

const STATS = [
  { value: "250+",    label: "Coins",              rot: -2.5, dy: 8   },
  { value: "35+",     label: "Stocks",             rot: 1.5,  dy: -10 },
  { value: "10",      label: "Commodities",        rot: -1,   dy: 4   },
  { value: "$10,000", label: "Starting Balance",   rot: 2.5,  dy: -6  },
  { value: "Weekly",  label: "Competition Reset",  rot: -2,   dy: 10  },
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

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div
      className="min-h-screen relative overflow-hidden landing-bg"
      style={{ color: "var(--text-1)" }}
    >
      <BeamsBackground />

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 h-14 flex items-center px-6 gap-4 backdrop-blur-md"
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
        <NavLinks />

        <div className="ml-auto flex items-center gap-3">
          <NavThemeToggle />
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="font-mono text-xs font-bold px-4 py-2 rounded-xl transition-all"
              style={{
                background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                color: "var(--surface)",
              }}
            >
              Dashboard →
            </Link>
          ) : (
            <>
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
                  color: "var(--surface)",
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pt-20 pb-16">
        {/* Dark backdrop for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 100% at 50% 40%, rgba(0,0,0,0.55) 0%, transparent 70%)" }}
        />

        {/* Left tilted card */}
        <div
          className="absolute left-0 top-20 hidden lg:block pointer-events-none"
          style={{ transform: "rotate(-5deg)", width: 168 }}
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(13,13,13,0.82)",
              border: "1px solid var(--gold-border)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="font-cormorant italic text-base font-semibold leading-snug" style={{ color: "var(--text-1)" }}>
              "$10,000 in virtual cash — real market prices."
            </p>
            <p className="font-mono text-[9px] tracking-widest uppercase mt-2" style={{ color: "var(--gold-dim)" }}>
              Zero risk
            </p>
          </div>
        </div>

        {/* Right tilted card */}
        <div
          className="absolute right-0 top-28 hidden lg:block pointer-events-none"
          style={{ transform: "rotate(4deg)", width: 155 }}
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(13,13,13,0.82)",
              border: "1px solid var(--border-mid)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="font-mono text-[10px] tracking-wide leading-relaxed" style={{ color: "var(--text-2)" }}>
              Reset every<br />Monday.<br />Compete fresh.
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-blink-dot" style={{ background: "var(--gold)" }} />
              <span className="font-mono text-[8px] tracking-[0.2em] uppercase" style={{ color: "var(--gold-dim)" }}>
                Live Markets
              </span>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative text-center max-w-2xl mx-auto">
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

          <h1
            className="font-playfair font-bold leading-[1.06] tracking-tight mb-5"
            style={{
              fontSize: "clamp(3rem, 7vw, 5rem)",
              textShadow: "0 2px 24px rgba(0,0,0,0.9)",
            }}
          >
            Paper trade.{" "}
            <span className="font-playfair italic text-gold-glow">
              Real competition.
            </span>
          </h1>

          <p
            className="font-cormorant italic text-2xl font-semibold mb-10 leading-relaxed"
            style={{
              color: "rgba(255,255,255,0.92)",
              textShadow: "0 1px 12px rgba(0,0,0,0.95)",
            }}
          >
            The trading arena where{" "}
            <span style={{ color: "var(--gold)" }}>skill, not luck,</span>
            {" "}determines the leaderboard.
          </p>

          <Link
            href={isLoggedIn ? "/dashboard" : "/auth/signup"}
            className="inline-block font-bold font-mono text-sm tracking-[0.12em] px-10 py-4 rounded-xl transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
              color: "var(--surface)",
              boxShadow: "var(--primary-glow)",
            }}
          >
            {isLoggedIn ? "GO TO DASHBOARD →" : "START TRADING FREE →"}
          </Link>

          <p className="mt-5 font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--text-3)" }}>
            Virtual funds only · No real money at risk
          </p>
        </div>
      </section>

      {/* ── Asset Ticker ─────────────────────────────────────── */}
      <div className="relative z-10">
        <AssetTicker />
      </div>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="relative z-10 w-full py-16 overflow-hidden">
        {/* Left vertical text */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg) translateY(50%)" }}
        >
          <p className="font-cormorant italic text-lg font-semibold tracking-wide" style={{ color: "var(--text-3)", opacity: 0.5 }}>
            No margin calls. No blown accounts.
          </p>
        </div>

        {/* Right vertical text */}
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block"
          style={{ writingMode: "vertical-rl", transform: "translateY(-50%)" }}
        >
          <p className="font-cormorant italic text-lg font-semibold tracking-wide" style={{ color: "var(--text-3)", opacity: 0.5 }}>
            Just pure strategy.
          </p>
        </div>

        {/* Stat cards */}
        <div className="flex items-center justify-center gap-4 px-24 flex-wrap">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl px-6 py-5 text-center shrink-0"
              style={{
                transform: `rotate(${s.rot}deg) translateY(${s.dy}px)`,
                background: "rgba(13,13,13,0.80)",
                border: "1px solid var(--gold-border)",
                backdropFilter: "blur(16px)",
                minWidth: 110,
              }}
            >
              <p
                className="font-cormorant italic font-semibold mb-1"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  color: "var(--gold)",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p className="font-mono text-[9px] tracking-[0.22em] uppercase" style={{ color: "var(--text-3)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-24">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-center mb-3" style={{ color: "var(--text-2)" }}>
          Everything you need
        </p>
        <h2 className="font-playfair text-3xl font-bold text-center mb-2" style={{ color: "var(--text-1)" }}>
          Built for serious traders
        </h2>
        <p className="font-cormorant italic text-xl font-semibold text-center mb-10" style={{ color: "var(--text-2)", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
          The tools professionals use, with nothing to lose.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: "var(--card-bg)",
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
                <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--text-2)" }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pulse Beams ──────────────────────────────────────── */}
      <PulseSection />

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-24 text-center">
        <div
          className="rounded-2xl p-12 relative overflow-hidden"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-mid)", backdropFilter: "blur(16px)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 80% at 50% 120%, var(--cta-radial) 0%, transparent 65%)` }}
          />
          <div
            className="h-px absolute top-0 inset-x-0"
            style={{ background: "linear-gradient(90deg, transparent, var(--gold) 35%, var(--gold-bright) 50%, var(--gold) 65%, transparent)" }}
          />

          <div className="relative z-10">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--text-2)" }}>
              Ready to compete?
            </p>
            <h2 className="font-playfair text-4xl font-bold mb-3 text-gold-glow">
              Start with $10,000 today
            </h2>
            <p className="font-cormorant italic text-xl font-semibold mb-8" style={{ color: "var(--text-2)" }}>
              No credit card. No real money. Just strategy.
            </p>
            <Link
              href={isLoggedIn ? "/dashboard" : "/auth/signup"}
              className="inline-block font-bold font-mono text-sm tracking-[0.1em] px-10 py-3.5 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                color: "var(--surface)",
                boxShadow: "var(--primary-glow)",
              }}
            >
              {isLoggedIn ? "GO TO DASHBOARD →" : "CREATE FREE ACCOUNT →"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="relative z-10 border-t pb-10 pt-8 text-center" style={{ borderColor: "var(--border)" }}>
        <p className="font-cormorant italic text-base font-semibold" style={{ color: "var(--text-2)" }}>
          Papyrus — Virtual funds only · No real money at risk
        </p>
      </footer>
    </div>
  );
}
