"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Guilloche from "@/components/Guilloche";
import PapyrusMark from "@/components/PapyrusMark";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const supabase = createClient();
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResent(false);
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      {/* Guilloché backdrop */}
      <div
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <Guilloche size={760} opacity={0.8} />
      </div>

      <div className="w-full max-w-[390px] relative z-10">
        {/* Logo */}
        <div className="mb-10">
          <PapyrusMark sealSize={34} wordmarkSize={18} showEst />
        </div>

        {/* Card */}
        <div
          className="card-cert corner-frame rounded-2xl overflow-hidden"
          style={{
            backdropFilter: "blur(12px)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px var(--gold-glow)",
          }}
        >
          <div className="rule-fade" />

          <div className="px-8 pb-8 pt-7 text-center">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: "var(--gold-glow)",
                border: "1px solid var(--gold-border)",
              }}
            >
              <svg
                className="w-5 h-5"
                style={{ color: "var(--gold)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: "var(--text-1)" }}>
              Check your email
            </h2>
            <p className="text-xs font-mono mb-6" style={{ color: "var(--text-3)" }}>
              Confirmation link sent
            </p>

            <div
              className="rounded-xl px-4 py-3 mb-5 text-left"
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border-mid)",
              }}
            >
              <p className="label-ledger mb-1" style={{ letterSpacing: "0.2em" }}>
                Sent to
              </p>
              <p className="text-sm font-mono truncate" style={{ color: "var(--text-1)" }}>
                {email}
              </p>
            </div>

            <p className="text-xs mb-6 leading-relaxed" style={{ color: "var(--text-2)" }}>
              Click the link in the email to activate your account and start
              trading.
            </p>

            {resent && (
              <div
                className="mb-4 flex items-center gap-2 justify-center rounded-xl px-4 py-2.5 text-sm"
                style={{
                  background: "var(--gain-bg)",
                  border: "1px solid var(--gain-border)",
                  color: "var(--gain)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: "var(--gain)" }}
                />
                Link resent — check your inbox.
              </div>
            )}

            <button
              type="button"
              onClick={handleResend}
              className="text-xs font-mono transition-colors"
              style={{ color: "var(--text-3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
            >
              Resend link →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
