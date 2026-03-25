"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Member = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  is_owner: boolean;
  league_cash_balance: number;
  joined_at: string;
};

type Props = {
  leagueId: string;
  members: Member[];
  isOwner: boolean;
  currentUserId: string;
};

function Avatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const initials = (username ?? "?").slice(0, 2).toUpperCase();
  return (
    <div
      className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0"
      style={{
        background: avatarUrl ? "transparent" : "var(--gold-glow)",
        border: "1px solid var(--gold-border)",
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
      ) : (
        <span className="font-mono font-bold text-[10px]" style={{ color: "var(--gold)" }}>
          {initials}
        </span>
      )}
    </div>
  );
}

export default function LeagueMembers({ leagueId, members, isOwner, currentUserId }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [kicking, setKicking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleKick(userId: string) {
    setKicking(userId);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("kick_league_member", {
      p_league_id: leagueId,
      p_user_id: userId,
    });
    setKicking(null);
    if (rpcError || data?.success === false) {
      setError(rpcError?.message ?? data?.error ?? "Failed to kick member");
    } else {
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-4">
        <p
          className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "var(--text-3)" }}
        >
          Members
        </p>
        <h2 className="text-base font-semibold" style={{ color: "var(--text-2)" }}>
          {members.length} {members.length === 1 ? "member" : "members"}
        </h2>
      </div>

      {error && (
        <div
          className="text-sm rounded-xl px-4 py-3 mb-4"
          style={{ background: "var(--loss-bg)", border: "1px solid var(--loss-border)", color: "var(--loss)" }}
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        {members.map((member) => {
          const isMe = member.user_id === currentUserId;
          return (
            <div
              key={member.user_id}
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                background: isMe ? "rgba(201,168,76,0.03)" : "var(--surface)",
                border: `1px solid ${isMe ? "rgba(201,168,76,0.2)" : "var(--border)"}`,
              }}
            >
              <Avatar username={member.username} avatarUrl={member.avatar_url} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isMe ? (
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                      {member.username}
                    </span>
                  ) : (
                    <Link
                      href={`/dashboard/profile/${encodeURIComponent(member.username)}`}
                      className="text-sm font-medium truncate hover:underline"
                      style={{ color: "var(--text-1)" }}
                    >
                      {member.username}
                    </Link>
                  )}
                  {member.is_owner && (
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded tracking-wider shrink-0"
                      style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
                    >
                      OWNER
                    </span>
                  )}
                  {isMe && !member.is_owner && (
                    <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--gold-dim)" }}>
                      you
                    </span>
                  )}
                </div>
                <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>
                  Joined {new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>

              {isOwner && !member.is_owner && (
                <button
                  onClick={() => handleKick(member.user_id)}
                  disabled={kicking === member.user_id}
                  className="font-mono text-[10px] tracking-wider px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40 shrink-0"
                  style={{ border: "1px solid var(--border-mid)", color: "var(--text-3)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--loss)";
                    e.currentTarget.style.borderColor = "var(--loss-border)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-3)";
                    e.currentTarget.style.borderColor = "var(--border-mid)";
                  }}
                >
                  {kicking === member.user_id ? "..." : "Kick"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
