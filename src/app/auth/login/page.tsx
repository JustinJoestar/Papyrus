"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-end gap-[3px]">
        <div className="w-[3px] h-3     rounded-sm" style={{ background: "var(--gold)" }} />
        <div className="w-[3px] h-[18px] rounded-sm" style={{ background: "var(--gold)" }} />
        <div className="w-[3px] h-2     rounded-sm" style={{ background: "var(--gold-dim)" }} />
      </div>
      <span
        className="font-mono font-bold text-lg tracking-[0.16em]"
        style={{ color: "var(--text-1)" }}
      >
        PAPYRUS
      </span>
    </div>
  );
}

export default function LoginPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
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
          background:
            "radial-gradient(ellipse, rgba(201,168,76,0.10) 0%, transparent 65%)",
        }}
      />

      {/* Card */}
      <div className="w-full max-w-[380px] relative" style={{ zIndex: 10 }}>
        <div className="mb-10">
          <Logo />
          <p
            className="font-mono text-[10px] tracking-[0.28em] mt-2 pl-[22px]"
            style={{ color: "var(--text-3)" }}
          >
            PAPER TRADING TERMINAL
          </p>
        </div>

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
              background:
                "linear-gradient(90deg, transparent, var(--gold) 35%, var(--gold-bright) 50%, var(--gold) 65%, transparent)",
            }}
          />

          <div className="px-7 pb-7 pt-6">
            <h2 className="font-semibold mb-0.5" style={{ color: "var(--text-1)" }}>
              Sign in
            </h2>
            <p className="text-xs font-mono mb-6" style={{ color: "var(--text-3)" }}>
              Access your trading terminal
            </p>

            {error && (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "var(--loss-bg)",
                  border: "1px solid var(--loss-border)",
                }}
              >
                <span
                  className="font-mono text-[10px] pt-0.5 shrink-0 tracking-wider"
                  style={{ color: "var(--loss)" }}
                >
                  ERR
                </span>
                <span style={{ color: "var(--loss)" }}>{error}</span>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border-mid)",
                color: "var(--text-1)",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.borderColor = "var(--gold-border)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-mid)";
              }}
            >
              {/* Google logo */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {loading ? "Redirecting..." : "Continue with Google"}
            </button>
          </div>
        </div>

        <p
          className="text-center font-mono text-[10px] tracking-widest mt-6 uppercase"
          style={{ color: "var(--text-3)" }}
        >
          Virtual funds only · No real money at risk
        </p>
      </div>
    </div>
  );
}
