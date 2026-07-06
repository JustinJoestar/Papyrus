import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ACHIEVEMENTS = [
  { id: "first_trade",   icon: "🚀", title: "First Trade",      desc: "Complete your first buy or sell." },
  { id: "ten_trades",    icon: "📈", title: "10 Trades",        desc: "Complete 10 total transactions." },
  { id: "diversified",   icon: "🌐", title: "Diversified",      desc: "Hold crypto, stocks, and a commodity simultaneously." },
  { id: "top_10",        icon: "🏆", title: "Top 10",           desc: "Reach the top 10 on the global leaderboard." },
  { id: "league_winner", icon: "🥇", title: "League Champion",  desc: "Finish #1 in a private league." },
  { id: "diamond_hands", icon: "💎", title: "Diamond Hands",    desc: "Hold a position for a full week." },
  { id: "comeback",      icon: "⚡", title: "Comeback Kid",     desc: "Recover from -20% to finish positive." },
  { id: "weekly_reset",  icon: "🔄", title: "Veteran",          desc: "Survive 4 weekly resets." },
];

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Look up the profile by username
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, cash_balance, created_at")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  // If viewing own profile, redirect to the editable profile page
  if (profile.id === user.id) redirect("/dashboard/profile");

  const [
    { count: tradeCount },
    { data: unlockedData },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", profile.id),
  ]);

  const unlockedMap = new Map(
    (unlockedData ?? []).map((a) => [a.achievement_id, a.unlocked_at as string])
  );

  const achievements = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlocked_at: unlockedMap.get(a.id) ?? null,
  }));

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const initials = (profile.username ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Back */}
      <Link
        href="/dashboard/leagues"
        className="rise inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors mb-8 hover:opacity-70"
        style={{ "--i": 0, color: "var(--text-3)" } as React.CSSProperties}
      >
        ← Back
      </Link>

      {/* Header */}
      <div className="rise mb-8" style={{ "--i": 1 } as React.CSSProperties}>
        <p className="label-ledger mb-1.5">Trader Profile</p>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-1)" }}>
          {profile.username}
        </h1>
      </div>

      {/* Avatar + identity card */}
      <div
        className="rise card-cert corner-frame rounded-2xl p-6 sm:p-10 mb-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-12"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        {/* Avatar */}
        <div
          className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{
            background: profile.avatar_url ? "transparent" : "var(--gold-glow)",
            border: "2px solid var(--gold-border)",
          }}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="font-mono font-bold text-3xl"
              style={{ color: "var(--gold)" }}
            >
              {initials}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-5 text-center sm:text-left">
          <div>
            <p
              className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1"
              style={{ color: "var(--text-3)" }}
            >
              Username
            </p>
            <p className="text-xl font-semibold" style={{ color: "var(--text-1)" }}>
              {profile.username}
            </p>
          </div>

          <div>
            <p
              className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1"
              style={{ color: "var(--text-3)" }}
            >
              Member Since
            </p>
            <p className="text-base" style={{ color: "var(--text-2)" }}>
              {memberSince}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="rise sheet grid grid-cols-2 mb-8" style={{ "--i": 3 } as React.CSSProperties}>
        {[
          { label: "Total Trades",  value: tradeCount ?? 0 },
          { label: "Achievements",  value: `${unlockedCount} / ${ACHIEVEMENTS.length}` },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="px-3 py-5 sm:px-6 sm:py-7 text-center"
            style={{ borderTop: "none", borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}
          >
            <p className="font-mono font-bold text-3xl text-gold-gradient mb-2 tabular-nums">
              {stat.value}
            </p>
            <p className="label-ledger" style={{ letterSpacing: "0.18em" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="rise" style={{ "--i": 4 } as React.CSSProperties}>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text-1)" }}>
            Achievements
          </h2>
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--text-3)" }}>
            {unlockedCount === 0
              ? "None unlocked yet"
              : `${unlockedCount} of ${ACHIEVEMENTS.length} unlocked`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl px-6 py-5 flex items-start gap-4 transition-all"
              style={{
                background: "var(--card-bg)",
                border: a.unlocked ? "1px solid var(--gold-border)" : "1px solid var(--border)",
                opacity: a.unlocked ? 1 : 0.45,
                boxShadow: a.unlocked ? "0 0 24px var(--gold-glow)" : "none",
              }}
            >
              <span className="text-3xl shrink-0">{a.icon}</span>
              <div className="min-w-0">
                <p
                  className="font-semibold text-base truncate"
                  style={{ color: a.unlocked ? "var(--gold)" : "var(--text-3)" }}
                >
                  {a.title}
                </p>
                <p className="text-sm leading-snug mt-1" style={{ color: "var(--text-3)" }}>
                  {a.desc}
                </p>
                {a.unlocked && a.unlocked_at && (
                  <p className="font-mono text-[10px] mt-1.5" style={{ color: "var(--gold-dim)" }}>
                    Unlocked{" "}
                    {new Date(a.unlocked_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
