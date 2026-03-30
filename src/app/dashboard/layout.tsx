import Link from "next/link";
import NavLinks from "@/components/NavLinks"; // v2
import NavUserMenu from "@/components/NavUserMenu";
import NavNotifications from "@/components/NavNotifications";
import NavThemeToggle from "@/components/NavThemeToggle";
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

      <nav
        className="sticky top-0 z-50 h-14 flex items-center px-6 gap-4 backdrop-blur-md"
        style={{
          background: "var(--nav-bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-end gap-[3px]">
            <div className="w-[3px] h-3     rounded-sm" style={{ background: "var(--gold)" }} />
            <div className="w-[3px] h-[16px] rounded-sm" style={{ background: "var(--gold)" }} />
            <div className="w-[3px] h-2     rounded-sm" style={{ background: "var(--gold-dim)" }} />
          </div>
          <span
            className="font-mono font-bold text-sm tracking-[0.15em]"
            style={{ color: "var(--text-1)" }}
          >
            PAPYRUS
          </span>
        </Link>

        <div className="w-px h-4 shrink-0" style={{ background: "var(--border-mid)" }} />

        <NavLinks />

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://discord.gg/4tmwxCET2H"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join our Discord"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: "var(--text-3)", border: "1px solid transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#5865F2";
              e.currentTarget.style.borderColor = "rgba(88,101,242,0.35)";
              e.currentTarget.style.background = "rgba(88,101,242,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-3)";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Discord logo SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
          <NavThemeToggle />
          <NavNotifications userId={user?.id ?? null} />
          <div className="w-px h-4 shrink-0" style={{ background: "var(--border-mid)" }} />
          <NavUserMenu
            username={profile?.username ?? null}
            avatarUrl={profile?.avatar_url ?? null}
          />
        </div>
      </nav>

      <main className="relative" style={{ zIndex: 1 }}>
        {children}
      </main>

      {/* Toast layer — renders above everything */}
      <NotificationToast userId={user?.id ?? null} />
    </div>
  );
}
