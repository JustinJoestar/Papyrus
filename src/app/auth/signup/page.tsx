"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import HexBackground from "@/components/HexBackground";

export default function SignupPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
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
      style={{ background: "var(--void)" }}
    >
      <HexBackground />

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

      <div className="auth-scan-line" />

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

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 font-bold font-mono text-sm tracking-[0.1em] py-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                  color: "#0a0800",
                }}
              >
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
              </button>
            </form>

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
