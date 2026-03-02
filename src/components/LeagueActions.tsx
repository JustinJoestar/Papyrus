"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "none" | "create" | "join";

export default function LeagueActions() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("none");
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setCreateName("");
    setJoinCode("");
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("create_league", {
      p_name: createName.trim(),
    });
    setLoading(false);
    if (rpcError || data?.success === false) {
      setError(rpcError?.message ?? data?.error ?? "Failed to create league");
    } else {
      switchMode("none");
      router.refresh();
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("join_league", {
      p_invite_code: joinCode.trim(),
    });
    setLoading(false);
    if (rpcError || data?.success === false) {
      setError(rpcError?.message ?? data?.error ?? "Failed to join league");
    } else {
      switchMode("none");
      router.refresh();
    }
  }

  return (
    <div className="mb-8">
      {mode === "none" && (
        <div className="flex gap-3">
          <button
            onClick={() => switchMode("create")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            + Create League
          </button>
          <button
            onClick={() => switchMode("join")}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            Join with Code
          </button>
        </div>
      )}

      {mode === "create" && (
        <div className="bg-gray-900 rounded-2xl p-6 max-w-sm">
          <h3 className="font-semibold mb-4">Create a League</h3>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}
          <input
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="League name"
            maxLength={40}
            autoFocus
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => switchMode("none")}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg py-2.5 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !createName.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg py-2.5 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {mode === "join" && (
        <div className="bg-gray-900 rounded-2xl p-6 max-w-sm">
          <h3 className="font-semibold mb-4">Join a League</h3>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="Enter invite code"
            maxLength={8}
            autoFocus
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition mb-4 font-mono tracking-widest uppercase"
          />
          <div className="flex gap-3">
            <button
              onClick={() => switchMode("none")}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg py-2.5 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={loading || !joinCode.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg py-2.5 transition disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
