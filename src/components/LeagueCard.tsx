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
    <div className="bg-gray-900 rounded-2xl px-6 py-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{league.name}</h3>
            {league.is_owner && (
              <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Owner
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {league.member_count} {league.member_count === 1 ? "member" : "members"}
          </p>
        </div>
        <Link
          href={`/dashboard/leagues/${league.id}`}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shrink-0"
        >
          Leaderboard
        </Link>
      </div>

      {/* Invite code */}
      <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3 mb-3">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-0.5">Invite Code</p>
          <code className="font-mono text-sm tracking-widest text-white">
            {league.invite_code}
          </code>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition shrink-0"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-2">{error}</p>
      )}

      {!league.is_owner && (
        <button
          onClick={handleLeave}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-red-400 transition disabled:opacity-50"
        >
          {loading ? "Leaving..." : "Leave league"}
        </button>
      )}
    </div>
  );
}
