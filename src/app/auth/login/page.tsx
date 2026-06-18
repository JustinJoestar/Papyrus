"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient gold crown glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "640px",
          height: "320px",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.10) 0%, transparent 65%)",
        }}
      />

      <div className="w-full max-w-[360px] relative" style={{ zIndex: 10 }}>

        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-[3px]">
              <div className="w-[3px] h-3      rounded-sm" style={{ background: "var(--gold)" }} />
              <div className="w-[3px] h-[18px] rounded-sm" style={{ background: "var(--gold)" }} />
              <div className="w-[3px] h-2      rounded-sm" style={{ background: "var(--gold-dim)" }} />
            </div>
            <span className="font-mono font-bold text-lg tracking-[0.16em]" style={{ color: "var(--text-1)" }}>
              PAPYRUS
            </span>
          </div>
          <p className="font-mono text-[10px] tracking-[0.28em] mt-2 pl-[22px]" style={{ color: "var(--text-3)" }}>
            PAPER TRADING TERMINAL
          </p>
        </div>

        {/* Value callout */}
        <div
          className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full shrink-0 animate-blink-dot" style={{ background: "var(--gold)" }} />
          <p className="text-xs" style={{ color: "var(--text-2)" }}>
            Start with{" "}
            <span className="font-semibold font-mono" style={{ color: "var(--gold-bright)" }}>$10,000</span>
            {" "}virtual cash — compete weekly
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(13,13,13,0.92)",
            border: "1px solid var(--border-mid)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,76,0.06)",
          }}
        >
          {/* Gold top accent */}
          <div
            className="h-px"
            style={{
              background: "linear-gradient(90deg, transparent, var(--gold) 35%, var(--gold-bright) 50%, var(--gold) 65%, transparent)",
            }}
          />

          <div className="px-7 pb-7 pt-6">
            <h2 className="font-semibold mb-0.5" style={{ color: "var(--text-1)" }}>
              Sign in
            </h2>
            <p className="text-xs font-mono mb-6" style={{ color: "var(--text-3)" }}>
              New or returning — Google handles it
            </p>

            {error && (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{ background: "var(--loss-bg)", border: "1px solid var(--loss-border)" }}
              >
                <span className="font-mono text-[10px] pt-0.5 shrink-0 tracking-wider" style={{ color: "var(--loss)" }}>
                  ERR
                </span>
                <span style={{ color: "var(--loss)" }}>{error}</span>
              </div>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border-mid)",
                color: "var(--text-1)",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.borderColor = "var(--gold-border)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-mid)"; }}
            >
              {loading ? (
                <span style={{ color: "var(--text-3)" }}>Redirecting to Google…</span>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="mt-5 text-center text-[11px] leading-relaxed" style={{ color: "var(--text-3)" }}>
              By signing in you agree to our{" "}
              <a href="/tos" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--text-2)" }}>
                Terms of Service
              </a>
              . Must be 13+ to play. No real money involved.
            </p>
          </div>
        </div>

        <p className="text-center font-mono text-[10px] tracking-widest mt-6 uppercase" style={{ color: "var(--text-3)" }}>
          Virtual funds only · No real money at risk
        </p>
      </div>
    </div>
  );
}
