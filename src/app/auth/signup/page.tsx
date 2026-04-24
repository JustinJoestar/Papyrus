"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { isProfane } from "@/lib/profanity";

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignupPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [username,      setUsername]      = useState("");
  const [ageOk,         setAgeOk]         = useState(false);
  const [tosOk,         setTosOk]         = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    const trimmedEmail    = email.trim().toLowerCase();

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
      setError("Username must be 3–20 characters: letters, numbers, and underscores only.");
      return;
    }
    if (isProfane(trimmedUsername)) {
      setError("That username isn't allowed. Please choose a different one.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!ageOk) {
      setError("You must be 13 or older to create an account.");
      return;
    }
    if (!tosOk) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setLoading(true);

    // Check username availability using the existing RPC (works for anon users)
    const { data: takenEmail } = await supabase.rpc("get_email_by_username", { p_username: trimmedUsername });
    if (takenEmail) {
      setError("That username is already taken. Please choose a different one.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email:    trimmedEmail,
      password,
      options:  { data: { username: trimmedUsername } },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists")) {
        setError("An account with this email already exists. Sign in instead.");
      } else if (msg.includes("password")) {
        setError("Password must be at least 6 characters.");
      } else if (msg.includes("valid email") || msg.includes("invalid email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else if ((data.user?.identities?.length ?? 1) === 0) {
      // Supabase returns empty identities array for duplicate email when confirmation is on
      setError("An account with this email already exists. Sign in instead.");
      setLoading(false);
    } else {
      router.push(`/auth/verify?email=${encodeURIComponent(trimmedEmail)}`);
    }
  }

  const fields = [
    { label: "Username", type: "text",     val: username, set: setUsername, ph: "tradingking99" },
    { label: "Email",    type: "email",    val: email,    set: setEmail,    ph: "you@example.com" },
    { label: "Password", type: "password", val: password, set: setPassword, ph: "min. 6 characters", min: 6 },
  ] as const;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
    >

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

      <div className="w-full max-w-[380px] relative" style={{ zIndex: 10 }}>
        {/* Logo */}
        <div className="mb-8">
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
          <p
            className="font-mono text-[10px] tracking-[0.28em] mt-2 pl-[22px]"
            style={{ color: "var(--text-3)" }}
          >
            PAPER TRADING TERMINAL
          </p>
        </div>

        {/* Balance callout */}
        <div
          className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: "var(--gold-glow)",
            border: "1px solid var(--gold-border)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0 animate-blink-dot"
            style={{ background: "var(--gold)" }}
          />
          <p className="text-xs" style={{ color: "var(--text-2)" }}>
            Start with{" "}
            <span className="font-semibold font-mono" style={{ color: "var(--gold-bright)" }}>
              $10,000
            </span>{" "}
            virtual cash — compete weekly
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
          <div
            className="h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--gold) 35%, var(--gold-bright) 50%, var(--gold) 65%, transparent)",
            }}
          />

          <div className="px-7 pb-7 pt-6">
            <h2 className="font-semibold mb-0.5" style={{ color: "var(--text-1)" }}>
              Create account
            </h2>
            <p className="text-xs font-mono mb-6" style={{ color: "var(--text-3)" }}>
              Join the trading competition
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

            <form onSubmit={handleSignup} className="space-y-4">
              {fields.map(({ label, type, val, set, ph, ...rest }) => (
                <div key={label}>
                  <label
                    className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2"
                    style={{ color: "var(--text-3)" }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    required
                    minLength={"min" in rest ? (rest as { min: number }).min : undefined}
                    value={val}
                    onChange={(e) => (set as (v: string) => void)(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                    style={{
                      background: "var(--elevated)",
                      border: "1px solid var(--border-mid)",
                      color: "var(--text-1)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold-border)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border-mid)")}
                    placeholder={ph}
                  />
                </div>
              ))}

              {/* Age + ToS checkboxes */}
              <div className="space-y-2.5 pt-1">
                {[
                  { checked: ageOk, set: setAgeOk, label: "I am 13 years of age or older" },
                  { checked: tosOk, set: setTosOk, label: null },
                ].map(({ checked, set, label }, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all"
                      style={{
                        background: checked ? "var(--gold)" : "var(--elevated)",
                        border: `1px solid ${checked ? "var(--gold)" : "var(--border-mid)"}`,
                      }}
                    >
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="#0a0800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" checked={checked} onChange={() => set(!checked)} className="sr-only" />
                    <span className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
                      {label ?? (
                        <>
                          I agree to the{" "}
                          <a
                            href="/tos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline transition-colors"
                            style={{ color: "var(--gold)" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Terms of Service
                          </a>
                          . This is a simulation — no real money involved.
                        </>
                      )}
                    </span>
                  </label>
                ))}
              </div>

              <ShimmerButton
                type="submit"
                disabled={loading || !ageOk || !tosOk}
                shimmerColor="rgba(255,255,255,0.45)"
                shimmerDuration="2.8s"
                background="linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)"
                borderRadius="12px"
                className="w-full mt-1 font-bold font-mono text-sm tracking-[0.1em] py-2.5 text-[#0a0800] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
              </ShimmerButton>
            </form>

            {/* Divider */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--text-3)" }}>OR</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Google SSO — requires age + ToS checkboxes first */}
            <button
              type="button"
              disabled={!ageOk || !tosOk || googleLoading}
              onClick={handleGoogleSignup}
              className="mt-4 w-full flex items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border-mid)",
                color: "var(--text-1)",
              }}
              onMouseEnter={(e) => ageOk && tosOk && !googleLoading && (e.currentTarget.style.borderColor = "var(--gold-border)")}
              onMouseLeave={(e) => ageOk && tosOk && !googleLoading && (e.currentTarget.style.borderColor = "var(--border-mid)")}
            >
              {googleLoading ? (
                <span style={{ color: "var(--text-3)" }}>Redirecting…</span>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>
            {(!ageOk || !tosOk) && (
              <p className="mt-2 text-center font-mono text-[10px]" style={{ color: "var(--text-3)" }}>
                Check the boxes above to enable Google sign-up
              </p>
            )}

            <div
              className="mt-5 pt-5 text-center"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium transition-colors"
                  style={{ color: "var(--gold)" }}
                >
                  Sign in
                </Link>
              </p>
            </div>
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
