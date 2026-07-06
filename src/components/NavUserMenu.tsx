"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  username: string | null;
  avatarUrl: string | null;
  profileHref?: string;
  settingsHref?: string;
  showChallengeBadge?: boolean;
  signOutRedirect?: string;
};

export default function NavUserMenu({
  username,
  avatarUrl,
  profileHref = "/dashboard/profile",
  settingsHref = "/dashboard/settings",
  showChallengeBadge = false,
  signOutRedirect = "/auth/login",
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = (username ?? "?").slice(0, 2).toUpperCase();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(signOutRedirect);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-150"
        style={{
          background: open ? "var(--gold-glow)" : "transparent",
          border: open ? "1px solid var(--gold-border)" : "1px solid transparent",
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.border = "1px solid var(--border-mid)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.border = "1px solid transparent"; }}
      >
        <div
          className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: avatarUrl ? "transparent" : "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={username ?? "avatar"} className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono font-bold text-[10px]" style={{ color: "var(--gold)" }}>{initials}</span>
          )}
        </div>
        <span className="font-mono text-xs transition-colors" style={{ color: open ? "var(--gold)" : "var(--text-3)" }}>
          {username ?? "Profile"}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 transition-transform duration-200"
          style={{ color: open ? "var(--gold)" : "var(--text-3)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50 flex flex-col"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          {/* Profile */}
          <Link
            href={profileHref}
            className="flex items-center gap-3 px-4 py-3 transition-colors"
            style={{ borderBottom: "1px solid var(--border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gold-glow)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0"
              style={{ background: avatarUrl ? "transparent" : "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={username ?? "avatar"} className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono font-bold text-[10px]" style={{ color: "var(--gold)" }}>{initials}</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-xs font-bold" style={{ color: "var(--text-1)" }}>
                {username ?? "Profile"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px]" style={{ color: "var(--text-3)" }}>View profile</span>
                {showChallengeBadge && (
                  <span
                    className="font-mono text-[8px] tracking-[0.15em] px-1 py-px rounded"
                    style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
                  >
                    CHALLENGE
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Settings */}
          <Link
            href={settingsHref}
            className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs transition-colors"
            style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold-glow)"; e.currentTarget.style.color = "var(--gold)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}
          >
            Settings
          </Link>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs transition-colors w-full text-left"
            style={{
              color: "var(--text-3)",
              borderTop: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(201,162,78,0.08)";
              e.currentTarget.style.color = "var(--gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-3)";
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
