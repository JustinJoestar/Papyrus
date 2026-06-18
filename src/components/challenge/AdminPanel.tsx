"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CONTEST } from "@/lib/challenge";

export type ContestRow = {
  id: string;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  starting_balance: number;
  prize_description: string | null;
};

export type EnrollmentRow = {
  full_name: string;
  parent_email: string | null;
  school: string | null;
  grade: string | null;
  heard_from: string | null;
  enrolled_at: string;
};

type Props = {
  contest: ContestRow | null;
  enrollments: EnrollmentRow[];
  memberCount: number;
};

// ISO → value for <input type="datetime-local"> in the admin's local tz
function toInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const fieldStyle = { background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-1)" };

export default function AdminPanel({ contest, enrollments, memberCount }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(contest?.name ?? CONTEST.name);
  const [startsAt, setStartsAt] = useState(toInput(contest?.starts_at ?? CONTEST.startsAt));
  const [endsAt, setEndsAt] = useState(toInput(contest?.ends_at ?? CONTEST.endsAt));
  const [startingBalance, setStartingBalance] = useState(String(contest?.starting_balance ?? CONTEST.startingBalance));
  const [prize, setPrize] = useState(contest?.prize_description ?? CONTEST.prize);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const args = {
      p_name: name.trim(),
      p_starts_at: new Date(startsAt).toISOString(),
      p_ends_at: new Date(endsAt).toISOString(),
      p_starting_balance: Number(startingBalance),
      p_prize: prize.trim(),
    };

    const { data, error } = contest
      ? await supabase.rpc("update_contest", { p_league_id: contest.id, ...args })
      : await supabase.rpc("create_contest", args);

    setSaving(false);
    if (error || data?.success === false) {
      setMsg({ kind: "err", text: error?.message ?? data?.error ?? "Save failed" });
    } else {
      setMsg({ kind: "ok", text: contest ? "Contest updated." : "Contest created." });
      router.refresh();
    }
  }

  function exportCsv() {
    const header = ["full_name", "parent_email", "school", "grade", "heard_from", "enrolled_at"];
    const escape = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const rows = enrollments.map((e) =>
      [e.full_name, e.parent_email, e.school, e.grade, e.heard_from, e.enrolled_at].map(escape).join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "challenge-enrollments.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const withParent = enrollments.filter((e) => e.parent_email).length;

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
      <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: "var(--text-3)" }}>Admin</p>
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--text-1)" }}>Contest Control</h1>

      {/* Config form */}
      <form onSubmit={save} className="rounded-2xl p-6 mb-8 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: "var(--text-1)" }}>{contest ? "Edit contest" : "Create contest"}</h2>
          {contest && <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 rounded" style={{ background: "var(--gold-glow)", color: "var(--gold)" }}>LIVE ROW</span>}
        </div>

        {msg && (
          <p className="text-sm" style={{ color: msg.kind === "ok" ? "var(--gain)" : "var(--loss)" }}>{msg.text}</p>
        )}

        <div>
          <label className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={fieldStyle} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>Starts (your local time)</label>
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={fieldStyle} />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>Ends (your local time)</label>
            <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={fieldStyle} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>Starting balance ($)</label>
            <input type="number" min="1000" value={startingBalance} onChange={(e) => setStartingBalance(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={fieldStyle} />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>Prize</label>
            <input type="text" value={prize} onChange={(e) => setPrize(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={fieldStyle} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="font-bold font-mono text-sm tracking-[0.1em] px-6 py-2.5 rounded-xl text-[#0a0800] disabled:opacity-40" style={{ background: "linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)" }}>
          {saving ? "SAVING..." : contest ? "SAVE CHANGES" : "CREATE CONTEST"}
        </button>
      </form>

      {/* Enrollments */}
      <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold" style={{ color: "var(--text-1)" }}>Enrollments</h2>
            <p className="font-mono text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
              {memberCount} participant{memberCount !== 1 ? "s" : ""} · {withParent} with parent email
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/challenge/leaderboard" className="font-mono text-[11px] tracking-wider px-4 py-2 rounded-lg" style={{ border: "1px solid var(--border-mid)", color: "var(--text-2)" }}>Standings →</Link>
            <button onClick={exportCsv} disabled={enrollments.length === 0} className="font-mono text-[11px] tracking-wider px-4 py-2 rounded-lg disabled:opacity-40" style={{ border: "1px solid var(--gold-border)", color: "var(--gold)" }}>Export CSV</button>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <p className="text-sm py-6 text-center" style={{ color: "var(--text-3)" }}>No enrollments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="font-mono text-[10px] tracking-wider uppercase" style={{ color: "var(--text-3)" }}>
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Grade</th>
                  <th className="text-left py-2 pr-4">School</th>
                  <th className="text-left py-2 pr-4">Parent email</th>
                  <th className="text-left py-2 pr-4">Heard from</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="py-2 pr-4" style={{ color: "var(--text-1)" }}>{e.full_name}</td>
                    <td className="py-2 pr-4" style={{ color: "var(--text-2)" }}>{e.grade ?? "—"}</td>
                    <td className="py-2 pr-4" style={{ color: "var(--text-2)" }}>{e.school ?? "—"}</td>
                    <td className="py-2 pr-4" style={{ color: "var(--text-2)" }}>{e.parent_email ?? "—"}</td>
                    <td className="py-2 pr-4" style={{ color: "var(--text-2)" }}>{e.heard_from ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
