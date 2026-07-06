import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AvatarUpload from "@/components/AvatarUpload";
import UsernameForm from "@/components/UsernameForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [
    { data: profile },
    { count: tradeCount },
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
  ]);

  if (!profile) redirect("/auth/login");

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="rise mb-8" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="label-ledger mb-1.5">№ 07 — Account</p>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-1)" }}>
          Profile
        </h1>
      </div>

      {/* Avatar + identity card */}
      <div
        className="rise card-cert corner-frame rounded-2xl p-6 sm:p-10 mb-6 flex flex-col sm:flex-row items-center gap-6 sm:gap-12"
        style={{ "--i": 1 } as React.CSSProperties}
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
      <div
        className="rise sheet grid grid-cols-2"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        {[
          { label: "Total Trades",  value: tradeCount ?? 0 },
          { label: "Cash Balance",  value: `$${Number(profile.cash_balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
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
    </div>
  );
}
