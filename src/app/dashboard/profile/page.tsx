import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AvatarUpload from "@/components/AvatarUpload";
import UsernameForm from "@/components/UsernameForm";

const ACHIEVEMENTS = [
  { id: "first_trade",    icon: "🚀", title: "First Trade",       desc: "Complete your first buy or sell.",         unlocked: false },
  { id: "ten_trades",     icon: "📈", title: "10 Trades",         desc: "Complete 10 total transactions.",           unlocked: false },
  { id: "top_10",         icon: "🏆", title: "Top 10",            desc: "Reach the top 10 on the global leaderboard.", unlocked: false },
  { id: "league_winner",  icon: "🥇", title: "League Champion",   desc: "Finish #1 in a private league.",           unlocked: false },
  { id: "diamond_hands",  icon: "💎", title: "Diamond Hands",     desc: "Hold a position for a full week.",         unlocked: false },
  { id: "diversified",    icon: "🌐", title: "Diversified",       desc: "Hold crypto, stocks, and a commodity simultaneously.", unlocked: false },
  { id: "comeback",       icon: "⚡", title: "Comeback Kid",      desc: "Recover from -20% to finish positive.",    unlocked: false },
  { id: "weekly_reset",   icon: "🔄", title: "Veteran",           desc: "Survive 4 weekly resets.",                 unlocked: false },
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [{ data: profile }, { count: tradeCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, avatar_url, cash_balance, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  if (!profile) redirect("/auth/login");

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
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
        className="rounded-2xl p-6 mb-6 flex items-center gap-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
      >
        <AvatarUpload
          userId={user.id}
          username={profile.username}
          avatarUrl={profile.avatar_url}
        />

        <div className="flex-1 min-w-0 space-y-5">
          <UsernameForm currentUsername={profile.username} />

          <div>
            <p
              className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1"
              style={{ color: "var(--text-3)" }}
            >
              Email
            </p>
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
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
            <p className="text-sm" style={{ color: "var(--text-2)" }}>
              {memberSince}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total Trades",     value: tradeCount ?? 0 },
          { label: "Cash Balance",     value: `$${Number(profile.cash_balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: "Achievements",     value: `0 / ${ACHIEVEMENTS.length}` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl px-4 py-4 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <p className="font-mono font-bold text-xl text-gold-gradient mb-1">
              {stat.value}
            </p>
            <p
              className="font-mono text-[10px] tracking-[0.18em] uppercase"
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
            Coming soon
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.id}
              className="rounded-xl px-4 py-4 flex items-start gap-3"
              style={{
                background: "var(--surface)",
                border: `1px solid var(--border)`,
                opacity: a.unlocked ? 1 : 0.45,
              }}
            >
              <span className="text-2xl shrink-0">{a.icon}</span>
              <div className="min-w-0">
                <p
                  className="font-semibold text-sm truncate"
                  style={{ color: a.unlocked ? "var(--text-1)" : "var(--text-3)" }}
                >
                  {a.title}
                </p>
                <p
                  className="text-xs leading-snug mt-0.5"
                  style={{ color: "var(--text-3)" }}
                >
                  {a.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
