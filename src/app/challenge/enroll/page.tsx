"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { CONTEST, formatContestDate } from "@/lib/challenge";

type Contest = {
  id: string;
  name: string;
  ends_at: string | null;
};

type UserInfo = {
  email: string;
  avatarUrl: string | null;
  initials: string;
};

const GRADES = ["9th grade", "10th grade", "11th grade", "12th grade", "Other"];
const HEARD_OPTIONS = ["A friend", "School or teacher", "Social media", "News", "Other"];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

const fieldStyle = {
  background: "var(--elevated)",
  border: "1px solid var(--border-mid)",
  color: "var(--text-1)",
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(13,13,13,0.92)", border: "1px solid var(--border-mid)", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
        >
          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--gold) 35%, var(--gold-bright) 50%, var(--gold) 65%, transparent)" }} />
          <div className="px-7 py-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function EnrollPage() {
  const supabase = createClient();

  const [phase, setPhase] = useState<"loading" | "signedOut" | "form" | "noContest" | "closed" | "done">("loading");
  const [contest, setContest] = useState<Contest | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // email sign-in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // enrollment form fields
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [heardFrom, setHeardFrom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initPage = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setPhase("signedOut"); return; }

    // Prefill name from metadata
    const meta = user.user_metadata ?? {};
    setFullName((meta.full_name as string) ?? (meta.name as string) ?? "");

    // Build user info for the account visual
    const avatarUrl = (meta.avatar_url as string) ?? (meta.picture as string) ?? null;
    const emailStr  = user.email ?? "";
    const initials  = emailStr.slice(0, 2).toUpperCase();
    setUserInfo({ email: emailStr, avatarUrl, initials });

    const { data: c } = await supabase
      .from("leagues")
      .select("id, name, ends_at")
      .eq("is_contest", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!c) { setPhase("noContest"); return; }
    if (c.ends_at && new Date(c.ends_at).getTime() < Date.now()) { setPhase("closed"); return; }

    setContest(c as Contest);
    setPhase("form");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { initPage(); }, [initPage]);

  async function handleGoogle() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/challenge/enroll` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setEmailLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setEmailLoading(false);
    } else {
      await initPage();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contest) return;
    if (fullName.trim().length < 2) { setError("Please enter your full name."); return; }

    setSubmitting(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("enroll_in_contest", {
      p_league_id:    contest.id,
      p_full_name:    fullName.trim(),
      p_parent_email: null,
      p_school:       school.trim() || null,
      p_grade:        grade || null,
      p_heard_from:   heardFrom || null,
    });

    if (rpcError || data?.success === false) {
      setError(rpcError?.message ?? data?.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    } else {
      setPhase("done");
    }
  }

  // ── States ────────────────────────────────────────────────
  if (phase === "loading") {
    return <Card><p className="text-center font-mono text-sm" style={{ color: "var(--text-3)" }}>Loading…</p></Card>;
  }

  if (phase === "signedOut") {
    return (
      <Card>
        <h1 className="font-bold text-xl mb-1" style={{ color: "var(--text-1)" }}>Enter the Challenge</h1>
        <p className="text-xs font-mono mb-6" style={{ color: "var(--text-3)" }}>Sign in to claim your spot — free, 30 seconds</p>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: "var(--loss-bg)", border: "1px solid var(--loss-border)" }}>
            <span className="font-mono text-[10px] pt-0.5 shrink-0 tracking-wider" style={{ color: "var(--loss)" }}>ERR</span>
            <span style={{ color: "var(--loss)" }}>{error}</span>
          </div>
        )}

        <button
          type="button"
          disabled={googleLoading}
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-40"
          style={fieldStyle}
        >
          {googleLoading ? <span style={{ color: "var(--text-3)" }}>Redirecting…</span> : <><GoogleIcon /> Continue with Google</>}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--text-3)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: "var(--text-3)" }}>
          Sign in with your Papyrus account
        </p>
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={fieldStyle}
          />
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={fieldStyle}
          />
          <button
            type="submit" disabled={emailLoading}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-mono font-medium tracking-wider transition-all disabled:opacity-40"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
          >
            {emailLoading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] leading-relaxed" style={{ color: "var(--text-3)" }}>
          By entering you agree to the{" "}
          <Link href="/challenge/rules" target="_blank" className="underline" style={{ color: "var(--text-2)" }}>rules</Link>.
          Ages {CONTEST.minAge}+. No real money is involved.
        </p>
      </Card>
    );
  }

  if (phase === "noContest" || phase === "closed") {
    const closed = phase === "closed";
    return (
      <Card>
        <h1 className="font-bold text-xl mb-2" style={{ color: "var(--text-1)" }}>
          {closed ? "Enrollment has closed" : "Enrollment isn't open yet"}
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
          {closed
            ? "This contest has ended. Thanks for your interest — keep an eye out for the next one."
            : "Sign-ups aren't quite ready yet — check back very soon to claim your spot."}
        </p>
        <Link href="/challenge" className="inline-block font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl" style={fieldStyle}>
          ← Back to Challenge
        </Link>
      </Card>
    );
  }

  if (phase === "done") {
    return (
      <Card>
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h1 className="font-bold text-xl mb-2" style={{ color: "var(--text-1)" }}>You&apos;re in, {fullName.split(" ")[0]}!</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-2)" }}>
            You&apos;re enrolled in the {CONTEST.name}. Trading opens {formatContestDate(CONTEST.startsAt)} — we&apos;ll
            email you when it&apos;s go time.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link href="/challenge/rules" className="font-mono text-xs tracking-wider px-5 py-2.5 rounded-xl" style={fieldStyle}>
              Read the rules
            </Link>
            <Link href="/challenge" className="font-mono text-[11px] tracking-wider" style={{ color: "var(--text-3)" }}>
              ← Back to Challenge home
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // ── Enrollment form ───────────────────────────────────────
  return (
    <Card>
      <h1 className="font-bold text-xl mb-1" style={{ color: "var(--text-1)" }}>Almost in</h1>
      <p className="text-xs font-mono mb-5" style={{ color: "var(--text-3)" }}>A few quick details and you&apos;re competing</p>

      {/* Account visual */}
      {userInfo && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6"
          style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}
        >
          <div
            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
          >
            {userInfo.avatarUrl ? (
              <img src={userInfo.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-mono font-bold text-[10px]" style={{ color: "var(--gold)" }}>
                {userInfo.initials}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "var(--text-1)" }}>{userInfo.email}</p>
            <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>Papyrus account</p>
          </div>
          <span
            className="font-mono text-[9px] tracking-[0.15em] px-1.5 py-0.5 rounded shrink-0"
            style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
          >
            ✓ CONNECTED
          </span>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: "var(--loss-bg)", border: "1px solid var(--loss-border)" }}>
          <span className="font-mono text-[10px] pt-0.5 shrink-0 tracking-wider" style={{ color: "var(--loss)" }}>ERR</span>
          <span style={{ color: "var(--loss)" }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>
            Full name <span style={{ color: "var(--loss)" }}>*</span>
          </label>
          <input
            type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={fieldStyle} placeholder="Alex Rivera"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>School</label>
            <input
              type="text" value={school} onChange={(e) => setSchool(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none" style={fieldStyle} placeholder="optional"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>Grade</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={fieldStyle}>
              <option value="">—</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--text-3)" }}>How did you hear about us?</label>
          <select value={heardFrom} onChange={(e) => setHeardFrom(e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={fieldStyle}>
            <option value="">—</option>
            {HEARD_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>

        <ShimmerButton
          type="submit"
          disabled={submitting}
          shimmerColor="rgba(255,255,255,0.45)"
          background="linear-gradient(135deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)"
          borderRadius="12px"
          className="w-full mt-1 font-bold font-mono text-sm tracking-[0.1em] py-2.5 text-[#0a0800] disabled:opacity-40"
        >
          {submitting ? "ENROLLING..." : "CLAIM MY SPOT →"}
        </ShimmerButton>
      </form>
    </Card>
  );
}
