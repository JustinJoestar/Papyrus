import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AvatarUpload from "@/components/AvatarUpload";
import UsernameForm from "@/components/UsernameForm";

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

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [
    { data: profile },
    { count: tradeCount },
    { data: unlockedData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, avatar_url, cash_balance, created_at, username_changed_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", user.id),
  ]);

  if (!profile) redirect("/auth/login");

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

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p
          className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
          style={{ color: "var(--text-3)" }}
        >
          Account
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          Profile
        </h1>
      </div>

      {/* Avatar + identity card */}
      <div
        className="rounded-2xl p-10 mb-6 flex items-center gap-12"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
      >
        <AvatarUpload
          userId={user.id}
          username={profile.username}
          avatarUrl={profile.avatar_url}
        />

        <div className="flex-1 min-w-0 space-y-7">
          <UsernameForm
            currentUsername={profile.username}
            usernameChangedAt={profile.username_changed_at ?? null}
          />

          <div>
            <p
              className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1"
              style={{ color: "var(--text-3)" }}
            >
              Email
            </p>
            <p className="text-base" style={{ color: "var(--text-2)" }}>
              {user.email}
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
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Trades",  value: tradeCount ?? 0 },
          { label: "Cash Balance",  value: `$${Number(profile.cash_balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: "Achievements",  value: `${unlockedCount} / ${ACHIEVEMENTS.length}` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl px-6 py-7 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="font-mono font-bold text-3xl text-gold-gradient mb-2">
              {stat.value}
            </p>
            <p
              className="font-mono text-xs tracking-[0.18em] uppercase"
              style={{ color: "var(--text-3)" }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <div className="mb-4">
          <p
            className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
            style={{ color: "var(--text-3)" }}
          >
            Achievements
          </p>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-2)" }}>
            {unlockedCount === 0
              ? "Make your first trade to earn achievements"
              : `${unlockedCount} of ${ACHIEVEMENTS.length} unlocked`}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {achievements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl px-6 py-5 flex items-start gap-4 transition-all"
              style={{
                background: a.unlocked ? "var(--surface)" : "var(--surface)",
                border: a.unlocked
                  ? "1px solid var(--gold-border)"
                  : "1px solid var(--border)",
                opacity: a.unlocked ? 1 : 0.45,
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
                <p
                  className="text-sm leading-snug mt-1"
                  style={{ color: "var(--text-3)" }}
                >
                  {a.desc}
                </p>
                {a.unlocked && a.unlocked_at && (
                  <p
                    className="font-mono text-[10px] mt-1.5"
                    style={{ color: "var(--gold-dim)" }}
                  >
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
