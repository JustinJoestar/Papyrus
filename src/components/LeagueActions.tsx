"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "none" | "create" | "join";

const BALANCE_PRESETS = [1000, 5000, 10000, 50000, 100000];

function fmtPreset(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

const DURATION_PRESETS = [
  { label: "1 week",   days: 7   },
  { label: "2 weeks",  days: 14  },
  { label: "1 month",  days: 30  },
  { label: "3 months", days: 90  },
];

export default function LeagueActions() {
  const supabase = createClient();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("none");
  const [createName, setCreateName] = useState("");
  const [startingBalance, setStartingBalance] = useState(10000);
  const [customBalance, setCustomBalance] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [customDuration, setCustomDuration] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setCreateName("");
    setStartingBalance(10000);
    setCustomBalance("");
    setDurationDays(7);
    setCustomDuration("");
    setJoinCode("");
  }

  function handlePreset(val: number) {
    setStartingBalance(val);
    setCustomBalance("");
  }

  function handleCustomBalance(raw: string) {
    setCustomBalance(raw);
    const parsed = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed)) setStartingBalance(parsed);
  }

  function handleCustomDuration(raw: string) {
    setCustomDuration(raw);
    const parsed = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) setDurationDays(parsed);
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("create_league", {
      p_name: createName.trim(),
      p_starting_balance: startingBalance,
      p_duration_days: durationDays,
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
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => switchMode("create")}
            className="btn-bronze text-sm px-5 py-2.5"
          >
            + Issue a Challenge
          </button>
          <button
            onClick={() => switchMode("join")}
            className="btn-ghost text-sm font-semibold px-5 py-2.5"
          >
            Join with Code
          </button>
        </div>
      )}

      {mode === "create" && (
        <div
          className="rise card-cert corner-frame rounded-2xl p-6 max-w-sm"
          style={{ "--i": 0 } as React.CSSProperties}
        >
          <p className="label-ledger mb-1" style={{ letterSpacing: "0.22em", color: "var(--gold)" }}>
            New Challenge
          </p>
          <h3 className="font-display font-semibold text-lg mb-4" style={{ color: "var(--text-1)" }}>
            Create a League
          </h3>

          {error && (
            <div
              className="text-sm rounded-xl px-4 py-3 mb-4"
              style={{ background: "var(--loss-bg)", border: "1px solid var(--loss-border)", color: "var(--loss)" }}
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
            className="input-ledger mb-4"
          />

          {/* Starting balance */}
          <div className="mb-4">
            <p className="label-ledger mb-2" style={{ letterSpacing: "0.2em" }}>
              The Stake — Starting Balance
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {BALANCE_PRESETS.map((val) => {
                const active = startingBalance === val && !customBalance;
                return (
                  <button
                    key={val}
                    onClick={() => handlePreset(val)}
                    className="font-mono text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: active ? "var(--gold-glow)" : "var(--elevated)",
                      border: `1px solid ${active ? "var(--gold-border)" : "var(--border-mid)"}`,
                      color: active ? "var(--gold)" : "var(--text-3)",
                    }}
                  >
                    {fmtPreset(val)}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customBalance}
              onChange={(e) => handleCustomBalance(e.target.value)}
              placeholder="Custom amount"
              className="input-ledger font-mono py-2"
            />
          </div>

          {/* Duration */}
          <div className="mb-4">
            <p className="label-ledger mb-2" style={{ letterSpacing: "0.2em" }}>
              The Term — Duration
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {DURATION_PRESETS.map(({ label, days }) => {
                const active = durationDays === days && !customDuration;
                return (
                  <button
                    key={days}
                    onClick={() => { setDurationDays(days); setCustomDuration(""); }}
                    className="font-mono text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: active ? "var(--gold-glow)" : "var(--elevated)",
                      border: `1px solid ${active ? "var(--gold-border)" : "var(--border-mid)"}`,
                      color: active ? "var(--gold)" : "var(--text-3)",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customDuration}
              onChange={(e) => handleCustomDuration(e.target.value)}
              placeholder="Custom days (e.g. 21)"
              className="input-ledger font-mono py-2"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => switchMode("none")}
              className="btn-ghost flex-1 text-sm font-medium py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !createName.trim()}
              className="btn-bronze flex-1 text-sm py-2.5"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      {mode === "join" && (
        <div
          className="rise card-cert corner-frame rounded-2xl p-6 max-w-sm"
          style={{ "--i": 0 } as React.CSSProperties}
        >
          <p className="label-ledger mb-1" style={{ letterSpacing: "0.22em", color: "var(--gold)" }}>
            Answer a Challenge
          </p>
          <h3 className="font-display font-semibold text-lg mb-4" style={{ color: "var(--text-1)" }}>
            Join a League
          </h3>

          {error && (
            <div
              className="text-sm rounded-xl px-4 py-3 mb-4"
              style={{ background: "var(--loss-bg)", border: "1px solid var(--loss-border)", color: "var(--loss)" }}
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
            className="input-ledger mb-4 font-mono tracking-[0.25em] uppercase"
          />

          <div className="flex gap-3">
            <button
              onClick={() => switchMode("none")}
              className="btn-ghost flex-1 text-sm font-medium py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={loading || !joinCode.trim()}
              className="btn-bronze flex-1 text-sm py-2.5"
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
