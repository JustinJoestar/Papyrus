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

  const inputStyle = {
    background: "var(--elevated)",
    border: "1px solid var(--border-mid)",
    color: "var(--text-1)",
  };

  return (
    <div className="mb-8">
      {mode === "none" && (
        <div className="flex gap-3">
          <button
            onClick={() => switchMode("create")}
            className="text-sm font-bold font-mono tracking-[0.08em] px-5 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
              color: "#0a0800",
            }}
          >
            + Create League
          </button>
          <button
            onClick={() => switchMode("join")}
            className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
            style={{
              background: "var(--elevated)",
              border: "1px solid var(--border-mid)",
              color: "var(--text-2)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--gold-border)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-mid)")}
          >
            Join with Code
          </button>
        </div>
      )}

      {mode === "create" && (
        <div
          className="rounded-2xl p-6 max-w-sm"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-mid)",
          }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-1)" }}>
            Create a League
          </h3>

          {error && (
            <div
              className="text-sm rounded-xl px-4 py-3 mb-4"
              style={{
                background: "var(--loss-bg)",
                border: "1px solid var(--loss-border)",
                color: "var(--loss)",
              }}
            >
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
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all mb-4"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold-border)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-mid)")}
          />

          <div className="flex gap-3">
            <button
              onClick={() => switchMode("none")}
              className="flex-1 text-sm font-medium rounded-xl py-2.5 transition-all"
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border-mid)",
                color: "var(--text-2)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !createName.trim()}
              className="flex-1 text-sm font-bold font-mono rounded-xl py-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                color: "#0a0800",
              }}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {mode === "join" && (
        <div
          className="rounded-2xl p-6 max-w-sm"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-mid)",
          }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-1)" }}>
            Join a League
          </h3>

          {error && (
            <div
              className="text-sm rounded-xl px-4 py-3 mb-4"
              style={{
                background: "var(--loss-bg)",
                border: "1px solid var(--loss-border)",
                color: "var(--loss)",
              }}
            >
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
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all mb-4 font-mono tracking-widest uppercase"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold-border)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-mid)")}
          />

          <div className="flex gap-3">
            <button
              onClick={() => switchMode("none")}
              className="flex-1 text-sm font-medium rounded-xl py-2.5 transition-all"
              style={{
                background: "var(--elevated)",
                border: "1px solid var(--border-mid)",
                color: "var(--text-2)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={loading || !joinCode.trim()}
              className="flex-1 text-sm font-bold font-mono rounded-xl py-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                color: "#0a0800",
              }}
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
