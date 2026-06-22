import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/ThemeToggle";
import ChallengeSettingsClient from "./ChallengeSettingsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings — Papyrus Challenge" };

export default async function ChallengeSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/challenge/enroll");

  const { data: contest } = await supabase
    .from("leagues")
    .select("id, name")
    .eq("is_contest", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: enrollment } = contest
    ? await supabase
        .from("contest_enrollments")
        .select("full_name, parent_email, school, grade, heard_from")
        .eq("league_id", contest.id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase" style={{ color: "var(--text-3)" }}>
            Preferences
          </p>
          <span
            className="font-mono text-[9px] tracking-[0.18em] px-1.5 py-0.5 rounded"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
          >
            CHALLENGE
          </span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>Settings</h1>
      </div>

      {/* Account */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
      >
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4" style={{ color: "var(--text-3)" }}>
          Account
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>Signed in as</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{user.email}</p>
          </div>
          <ChallengeSettingsClient mode="signout" />
        </div>
      </div>

      {/* Appearance */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
      >
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-4" style={{ color: "var(--text-3)" }}>
          Appearance
        </p>
        <ThemeToggle />
      </div>

      {/* Challenge enrollment */}
      {enrollment && (
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        >
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-5" style={{ color: "var(--text-3)" }}>
            Challenge Enrollment
          </p>

          <div className="space-y-4 mb-6">
            <InfoRow label="Full name"    value={enrollment.full_name} />
            <InfoRow label="School"       value={enrollment.school}    />
            <InfoRow label="Grade"        value={enrollment.grade}     />
            <InfoRow label="Heard from"   value={enrollment.heard_from} />
          </div>

          {/* Parent email */}
          <div className="pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1" style={{ color: "var(--text-3)" }}>
              Parent / Guardian Email
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--text-3)" }}>
              Optional — we&apos;ll send occasional updates and final standings.
            </p>
            <ChallengeSettingsClient
              mode="parentEmail"
              leagueId={contest?.id ?? ""}
              currentParentEmail={enrollment.parent_email ?? ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: "var(--text-3)" }}>{label}</span>
      <span className="text-sm" style={{ color: "var(--text-1)" }}>{value}</span>
    </div>
  );
}
