"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type League = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  is_owner: boolean;
  member_count: number;
  created_at: string;
};

type Props = {
  league: League;
  currentUserId: string;
};

export default function LeagueCard({ league, currentUserId }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleLeave() {
    setLoading(true);
    setError(null);
    const { error: dbError } = await supabase
      .from("league_members")
      .delete()
      .eq("league_id", league.id)
      .eq("user_id", currentUserId);
    setLoading(false);
    if (dbError) {
      setError(dbError.message);
    } else {
      router.refresh();
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(league.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="rounded-2xl px-6 py-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-mid)",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base" style={{ color: "var(--text-1)" }}>
              {league.name}
            </h3>
            {league.is_owner && (
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded tracking-wider"
                style={{
                  background: "var(--gold-glow)",
                  border: "1px solid var(--gold-border)",
                  color: "var(--gold)",
                }}
              >
                OWNER
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
            {league.member_count} {league.member_count === 1 ? "member" : "members"}
          </p>
        </div>

        <Link
          href={`/dashboard/leagues/${league.id}`}
          className="text-sm font-semibold px-4 py-2 rounded-xl transition-all shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 100%)",
            color: "#0a0800",
          }}
        >
          Leaderboard
        </Link>
      </div>

      {/* Invite code */}
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 mb-3"
        style={{
          background: "var(--elevated)",
          border: "1px solid var(--border-mid)",
        }}
      >
        <div className="flex-1">
          <p
            className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
            style={{ color: "var(--text-3)" }}
          >
            Invite Code
          </p>
          <code
            className="font-mono text-sm tracking-widest"
            style={{ color: "var(--text-1)" }}
          >
            {league.invite_code}
          </code>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs font-mono transition-colors shrink-0"
          style={{ color: copied ? "var(--gain)" : "var(--text-3)" }}
          onMouseEnter={(e) => {
            if (!copied) e.currentTarget.style.color = "var(--gold)";
          }}
          onMouseLeave={(e) => {
            if (!copied) e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {error && (
        <div
          className="mb-3 flex items-start gap-2 rounded-xl px-4 py-2.5 text-sm"
          style={{
            background: "var(--loss-bg)",
            border: "1px solid var(--loss-border)",
            color: "var(--loss)",
          }}
        >
          {error}
        </div>
      )}

      {!league.is_owner && (
        <button
          onClick={handleLeave}
          disabled={loading}
          className="text-xs font-mono transition-colors disabled:opacity-40"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--loss)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
        >
          {loading ? "Leaving..." : "Leave league"}
        </button>
      )}
    </div>
  );
}
