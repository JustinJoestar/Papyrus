import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import NavUserMenu from "@/components/NavUserMenu";
import NavSettingsLink from "@/components/NavSettingsLink";
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
      style={{
        backgroundColor: "var(--base)",
        backgroundImage: "radial-gradient(rgba(201,168,76,0.15) 1.5px, transparent 1.5px)",
        backgroundSize: "28px 28px",
        color: "var(--text-1)",
      }}
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
          <NavSettingsLink />
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
    </div>
  );
}
