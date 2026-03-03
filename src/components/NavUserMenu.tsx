import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NavUserMenu() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  const initials = (profile?.username ?? "?").slice(0, 2).toUpperCase();

  return (
    <Link
      href="/dashboard/profile"
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all group"
      style={{ border: "1px solid transparent" }}
      onMouseEnter={undefined}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0"
        style={{
          background: profile?.avatar_url ? "transparent" : "var(--gold-glow)",
          border: "1px solid var(--gold-border)",
        }}
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-mono font-bold text-[10px]" style={{ color: "var(--gold)" }}>
            {initials}
          </span>
        )}
      </div>

      {/* Label */}
      <span
        className="font-mono text-xs transition-colors"
        style={{ color: "var(--text-3)" }}
      >
        {profile?.username ?? "Profile"}
      </span>
    </Link>
  );
}
