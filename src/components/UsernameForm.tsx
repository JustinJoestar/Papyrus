"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  currentUsername: string;
  usernameChangedAt: string | null;
};

export default function UsernameForm({ currentUsername, usernameChangedAt }: Props) {
  const canChange = !usernameChangedAt ||
    new Date(usernameChangedAt).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000;

  const nextChangeDate = usernameChangedAt
    ? new Date(new Date(usernameChangedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
        .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;
  const supabase = createClient();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function startEdit() {
    setValue(currentUsername);
    setError(null);
    setSuccess(false);
    setEditing(true);
  }

  function cancel() {
    setValue(currentUsername);
    setError(null);
    setEditing(false);
  }

  async function handleSave() {
    if (value === currentUsername) { setEditing(false); return; }
    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc("update_username", {
      p_username: value,
    });

    setLoading(false);

    if (rpcError || data?.success === false) {
      setError(rpcError?.message ?? data?.error ?? "Failed to update username");
    } else {
      setSuccess(true);
      setEditing(false);
      router.refresh();
    }
  }

  return (
    <div>
      <p
        className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2"
        style={{ color: "var(--text-3)" }}
      >
        Username
      </p>

      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") cancel(); }}
            maxLength={20}
            autoFocus
            className="rounded-xl px-4 py-2 text-sm font-mono focus:outline-none transition-all"
            style={{
              background: "var(--elevated)",
              border: "1px solid var(--gold-border)",
              color: "var(--text-1)",
              width: "200px",
            }}
          />
          <button
            onClick={handleSave}
            disabled={loading || !value.trim()}
            className="font-mono text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 100%)",
              color: "#0a0800",
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={cancel}
            className="font-mono text-xs px-3 py-2 rounded-xl transition-all"
            style={{
              background: "var(--elevated)",
              border: "1px solid var(--border-mid)",
              color: "var(--text-3)",
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg" style={{ color: "var(--text-1)" }}>
            {currentUsername}
          </span>
          {canChange ? (
            <button
              onClick={startEdit}
              className="font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-lg transition-all"
              style={{ border: "1px solid var(--border-mid)", color: "var(--text-3)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--gold)";
                e.currentTarget.style.borderColor = "var(--gold-border)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-3)";
                e.currentTarget.style.borderColor = "var(--border-mid)";
              }}
            >
              EDIT
            </button>
          ) : (
            <span className="font-mono text-[10px] tracking-wider" style={{ color: "var(--text-3)" }}>
              Available {nextChangeDate}
            </span>
          )}
          {success && (
            <span className="font-mono text-[10px] tracking-wider" style={{ color: "var(--gain)" }}>
              SAVED
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs font-mono" style={{ color: "var(--loss)" }}>
          {error}
        </p>
      )}

      <p className="mt-1.5 font-mono text-[10px]" style={{ color: "var(--text-3)" }}>
        Letters, numbers, underscores only · 3–20 characters
      </p>
    </div>
  );
}
