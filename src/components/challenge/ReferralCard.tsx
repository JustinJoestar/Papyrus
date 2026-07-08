"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Share card for a participant's contest referral code.
 * Rendered on the enroll success screen and the challenge portfolio.
 */
export default function ReferralCard({ code, count }: { code: string; count: number }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/challenge/enroll?ref=${code}`
      : `/challenge/enroll?ref=${code}`;

  async function copy(kind: "code" | "link") {
    try {
      await navigator.clipboard.writeText(kind === "code" ? code : shareLink);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // clipboard unavailable (permissions / http) — nothing to do
    }
  }

  return (
    <div
      className="rounded-2xl px-5 py-5 text-left"
      style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: "var(--gold)" }}>
          🤝 Recruit your friends
        </p>
        <span className="font-mono text-[10px] tracking-wider" style={{ color: "var(--text-3)" }}>
          {count} {count === 1 ? "friend" : "friends"} joined
        </span>
      </div>
      <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--text-3)" }}>
        Every friend who enrolls with your code counts toward the{" "}
        <Link href="/challenge/leaderboard?view=referrals" className="underline" style={{ color: "var(--text-2)" }}>
          referral leaderboard
        </Link>
        .
      </p>

      <div className="flex items-stretch gap-2 mb-2">
        <div
          className="flex-1 rounded-xl px-4 py-2.5 flex items-center justify-center"
          style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}
        >
          <span className="font-mono font-bold text-lg tracking-[0.3em]" style={{ color: "var(--gold)" }}>
            {code}
          </span>
        </div>
        <button
          type="button"
          onClick={() => copy("code")}
          className="rounded-xl px-4 font-mono text-[10px] tracking-wider transition-all"
          style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-2)" }}
        >
          {copied === "code" ? "COPIED ✓" : "COPY"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => copy("link")}
        className="w-full rounded-xl px-4 py-2.5 font-mono text-xs tracking-wider transition-all"
        style={{ background: "var(--gold)", color: "#0a0800" }}
      >
        {copied === "link" ? "LINK COPIED ✓" : "COPY INVITE LINK →"}
      </button>
    </div>
  );
}
