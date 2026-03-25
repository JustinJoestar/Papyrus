"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShimmerButton } from "@/components/ui/shimmer-button";

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
  const router   = useRouter();
  const supabase = createClient();

  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [error,      setError]      = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let email = identifier.trim();
    if (!email.includes("@")) {
      const { data, error: rpcError } = await supabase.rpc(
        "get_email_by_username",
        { p_username: email }
      );
      if (rpcError || !data) {
        setError("No account found with that username.");
        setLoading(false);
        return;
      }
      email = data;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("wrong password")) {
        setError("Incorrect password. Please try again.");
      } else if (msg.includes("not confirmed") || msg.includes("email not confirmed")) {
        setError("Please verify your email before signing in. Check your inbox for a confirmation link.");
      } else if (msg.includes("too many") || msg.includes("rate limit")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
    >

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

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2"
                  style={{ color: "var(--text-3)" }}
                >
                  Email or Username
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  style={{
                    background: "var(--elevated)",
                    border: "1px solid var(--border-mid)",
                    color: "var(--text-1)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold-border)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border-mid)")}
                  placeholder="you@example.com or tradingking99"
                />
              </div>

              <div>
                <label
                  className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2"
                  style={{ color: "var(--text-3)" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  style={{
                    background: "var(--elevated)",
                    border: "1px solid var(--border-mid)",
                    color: "var(--text-1)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold-border)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border-mid)")}
                  placeholder="••••••••"
                />
              </div>

              <ShimmerButton
                type="submit"
                disabled={loading}
                shimmerColor="rgba(255,255,255,0.45)"
                shimmerDuration="2.8s"
                background="linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)"
                borderRadius="12px"
                className="w-full mt-1 font-bold font-mono text-sm tracking-[0.1em] py-2.5 text-[#0a0800] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "AUTHENTICATING..." : "SIGN IN →"}
              </ShimmerButton>
            </form>

            <div
              className="mt-5 pt-5 text-center"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                No account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium transition-colors"
                  style={{ color: "var(--gold)" }}
                >
                  Create one
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
