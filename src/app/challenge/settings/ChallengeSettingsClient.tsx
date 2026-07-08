"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Two independent widgets for the settings page. Kept as separate
// components (not one mode-switched component) so each one's hooks are
// called unconditionally on every render.

export function ChallengeSignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/challenge");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs font-mono px-3 py-1.5 rounded-lg transition-all duration-150"
      style={{ color: "var(--text-3)", border: "1px solid var(--border-mid)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.borderColor = "var(--gold-border)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border-mid)"; }}
    >
      Sign out
    </button>
  );
}

export function ChallengeParentEmailForm({
  leagueId,
  currentParentEmail,
}: {
  leagueId: string;
  currentParentEmail: string;
}) {
  const supabase = createClient();
  const [email, setEmail] = useState(currentParentEmail);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not signed in."); setSaving(false); return; }

    const { error: dbError } = await supabase
      .from("contest_enrollments")
      .update({ parent_email: email.trim() || null })
      .eq("league_id", leagueId)
      .eq("user_id", user.id);

    if (dbError) {
      setError(dbError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="parent@example.com"
        className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
        style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-1)" }}
        onFocus={(e)  => (e.currentTarget.style.borderColor = "var(--gold-border)")}
        onBlur={(e)   => (e.currentTarget.style.borderColor = "var(--border-mid)")}
      />
      <button
        type="submit"
        disabled={saving}
        className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-mono font-medium tracking-wider transition-all disabled:opacity-40"
        style={{
          background: saved ? "var(--gain-bg)" : "var(--gold-glow)",
          border: `1px solid ${saved ? "var(--gain-border)" : "var(--gold-border)"}`,
          color: saved ? "var(--gain)" : "var(--gold)",
        }}
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
      </button>
      {error && <p className="text-xs mt-2 w-full" style={{ color: "var(--loss)" }}>{error}</p>}
    </form>
  );
}
