import DashboardNav from "@/components/DashboardNav";
import NotificationToast from "@/components/NotificationToast";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <div
      className="min-h-screen relative"
      style={{ color: "var(--text-1)" }}
    >
      <DashboardNav
        userId={user?.id ?? null}
        username={profile?.username ?? null}
        avatarUrl={profile?.avatar_url ?? null}
      />

      <main className="relative" style={{ zIndex: 1 }}>
        {children}
      </main>

      {/* Toast layer — renders above everything */}
      <NotificationToast userId={user?.id ?? null} />
    </div>
  );
}
