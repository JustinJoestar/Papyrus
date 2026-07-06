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
  starting_balance: number;
  duration_days: number;
  ends_at: string | null;
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hovered, setHovered] = useState(false);

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

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setLoading(true);
    setError(null);
    const { error: dbError } = await supabase
      .from("leagues")
      .delete()
      .eq("id", league.id);
    setLoading(false);
    if (dbError) {
      setError(dbError.message);
      setConfirmDelete(false);
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
      className="card-cert corner-frame rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,0.25), 0 0 0 1px var(--gold-border), inset 0 0 0 1px var(--base), inset 0 0 0 2px var(--border)"
          : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent */}
      <div className="rule-fade" />

      <div className="px-5 sm:px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-semibold text-xl" style={{ color: "var(--text-1)" }}>
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
            <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
              {league.member_count} {league.member_count === 1 ? "trader" : "traders"}
              {" · "}
              <span className="font-mono" style={{ color: "var(--gold-dim)" }}>
                ${league.starting_balance.toLocaleString()} start
              </span>
              {league.ends_at && (() => {
                const end = new Date(league.ends_at);
                const now = new Date();
                const ended = end < now;
                const label = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <>
                    {" · "}
                    <span className="font-mono" style={{ color: ended ? "var(--loss)" : "var(--text-3)" }}>
                      {ended ? `Settled ${label}` : `Settles ${label}`}
                    </span>
                  </>
                );
              })()}
            </p>
          </div>

          <Link
            href={`/dashboard/leagues/${league.id}`}
            className="btn-bronze text-sm px-4 py-2 shrink-0"
          >
            View Challenge →
          </Link>
        </div>

        {/* Invite code — the clipped coupon */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-3"
          style={{
            background: "var(--elevated)",
            border: "1px dashed var(--border-bright)",
          }}
        >
          <div className="flex-1">
            <p className="label-ledger mb-1" style={{ letterSpacing: "0.2em" }}>
              Invite Code
            </p>
            <code
              className="font-mono text-sm tracking-[0.25em]"
              style={{ color: "var(--text-1)" }}
            >
              {league.invite_code}
            </code>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs font-mono transition-all shrink-0 px-2.5 py-1 rounded-lg"
            style={{
              color: copied ? "var(--gain)" : "var(--text-3)",
              border: `1px solid ${copied ? "var(--gain-border)" : "transparent"}`,
              background: copied ? "var(--gain-bg)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!copied) e.currentTarget.style.color = "var(--gold)";
            }}
            onMouseLeave={(e) => {
              if (!copied) e.currentTarget.style.color = "var(--text-3)";
            }}
          >
            {copied ? "✓ Copied" : "Copy"}
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

        {league.is_owner ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-xs font-mono transition-colors disabled:opacity-40"
              style={{ color: confirmDelete ? "var(--loss)" : "var(--text-3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--loss)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = confirmDelete ? "var(--loss)" : "var(--text-3)")}
            >
              {loading ? "Deleting..." : confirmDelete ? "Tap again to confirm" : "Delete league"}
            </button>
            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs font-mono transition-colors"
                style={{ color: "var(--text-3)" }}
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
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
    </div>
  );
}
