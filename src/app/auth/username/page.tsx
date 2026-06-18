"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isProfane } from "@/lib/profanity";
import { ShimmerButton } from "@/components/ui/shimmer-button";

type Status = "idle" | "checking" | "available" | "taken" | "invalid";

function validate(value: string): { ok: boolean; message: string | null } {
  if (value.length === 0) return { ok: false, message: null };
  if (value.length < 3)   return { ok: false, message: "At least 3 characters" };
  if (value.length > 20)  return { ok: false, message: "20 characters max" };
  if (!/^[a-zA-Z0-9_]+$/.test(value))
    return { ok: false, message: "Letters, numbers, and underscores only" };
  if (isProfane(value))
    return { ok: false, message: "That username isn't allowed" };
  return { ok: true, message: null };
}

export default function UsernamePage() {
  const router   = useRouter();
  const supabase = createClient();

  const [value,    setValue]    = useState("");
  const [status,   setStatus]   = useState<Status>("idle");
  const [hint,     setHint]     = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    const { ok, message } = validate(trimmed);

    if (!ok) {
      setStatus(message ? "invalid" : "idle");
      setHint(message);
      return;
    }

    setStatus("checking");
    setHint(null);

    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase.rpc("get_email_by_username", { p_username: trimmed });
      setStatus(data ? "taken" : "available");
      setHint(data ? "Username is already taken" : null);
    }, 400);
  }, [value]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "available") return;

    setSaving(true);
    setSaveErr(null);

    const { data, error } = await supabase.rpc("update_username", { p_username: value.trim() });

    if (error || data?.success === false) {
      setSaveErr(error?.message ?? data?.error ?? "Failed to save username");
      setSaving(false);
    } else {
      router.push("/dashboard");
    }
  }

  const canSubmit = status === "available" && !saving;

  const statusColor =
    status === "available" ? "var(--gain)"   :
    status === "taken"     ? "var(--loss)"   :
    status === "invalid"   ? "var(--loss)"   :
    "transparent";

  const statusIcon =
    status === "available" ? "✓" :
    status === "taken"     ? "✗" :
    status === "invalid"   ? "✗" :
    status === "checking"  ? "…" :
    "";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      <div
        className="absolute pointer-events-none"
        style={{
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "640px",
          height: "320px",
          background: "radial-gradient(ellipse, rgba(201,168,76,0.10) 0%, transparent 65%)",
        }}
      />

      <div className="w-full max-w-[360px] relative" style={{ zIndex: 10 }}>

        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-[3px]">
              <div className="w-[3px] h-3      rounded-sm" style={{ background: "var(--gold)" }} />
              <div className="w-[3px] h-[18px] rounded-sm" style={{ background: "var(--gold)" }} />
              <div className="w-[3px] h-2      rounded-sm" style={{ background: "var(--gold-dim)" }} />
            </div>
            <span className="font-mono font-bold text-lg tracking-[0.16em]" style={{ color: "var(--text-1)" }}>
              PAPYRUS
            </span>
          </div>
          <p className="font-mono text-[10px] tracking-[0.28em] mt-2 pl-[22px]" style={{ color: "var(--text-3)" }}>
            PAPER TRADING TERMINAL
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(13,13,13,0.92)",
            border: "1px solid var(--border-mid)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,168,76,0.06)",
          }}
        >
          <div
            className="h-px"
            style={{
              background: "linear-gradient(90deg, transparent, var(--gold) 35%, var(--gold-bright) 50%, var(--gold) 65%, transparent)",
            }}
          />

          <div className="px-7 pb-7 pt-6">
            <h2 className="font-semibold mb-0.5" style={{ color: "var(--text-1)" }}>
              Choose your trading name
            </h2>
            <p className="text-xs font-mono mb-6" style={{ color: "var(--text-3)" }}>
              This is how you appear on the leaderboard
            </p>

            {saveErr && (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{ background: "var(--loss-bg)", border: "1px solid var(--loss-border)" }}
              >
                <span className="font-mono text-[10px] pt-0.5 shrink-0 tracking-wider" style={{ color: "var(--loss)" }}>
                  ERR
                </span>
                <span style={{ color: "var(--loss)" }}>{saveErr}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2"
                  style={{ color: "var(--text-3)" }}
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    maxLength={20}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm font-mono focus:outline-none transition-all"
                    style={{
                      background: "var(--elevated)",
                      border: "1px solid var(--border-mid)",
                      color: "var(--text-1)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold-border)")}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border-mid)")}
                    placeholder="tradingking99"
                  />
                  {statusIcon && (
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-sm font-bold"
                      style={{ color: statusColor }}
                    >
                      {statusIcon}
                    </span>
                  )}
                </div>
                <div className="mt-2 min-h-[16px]">
                  {hint ? (
                    <p className="font-mono text-[10px]" style={{ color: status === "available" ? "var(--gain)" : "var(--loss)" }}>
                      {hint}
                    </p>
                  ) : (
                    <p className="font-mono text-[10px]" style={{ color: "var(--text-3)" }}>
                      3–20 characters · letters, numbers, underscores
                    </p>
                  )}
                </div>
              </div>

              <ShimmerButton
                type="submit"
                disabled={!canSubmit}
                shimmerColor="rgba(255,255,255,0.45)"
                shimmerDuration="2.8s"
                background="linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)"
                borderRadius="12px"
                className="w-full mt-1 font-bold font-mono text-sm tracking-[0.1em] py-2.5 text-[#0a0800] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "SAVING..." : "CLAIM USERNAME →"}
              </ShimmerButton>
            </form>
          </div>
        </div>

        <p className="text-center font-mono text-[10px] tracking-widest mt-6 uppercase" style={{ color: "var(--text-3)" }}>
          You can change this once per week in settings
        </p>
      </div>
    </div>
  );
}
