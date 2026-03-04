"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  username: string | null;
  avatarUrl: string | null;
};

export default function NavUserMenu({ username, avatarUrl }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initials = (username ?? "?").slice(0, 2).toUpperCase();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
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
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.border = "1px solid var(--border-mid)";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.border = "1px solid transparent";
        }}
      >
        <div
          className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0"
          style={{
            background: avatarUrl ? "transparent" : "var(--gold-glow)",
            border: "1px solid var(--gold-border)",
          }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={username ?? "avatar"} className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono font-bold text-[10px]" style={{ color: "var(--gold)" }}>
              {initials}
            </span>
          )}
        </div>
        <span
          className="font-mono text-xs transition-colors"
          style={{ color: open ? "var(--gold)" : "var(--text-3)" }}
        >
          {username ?? "Profile"}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50 flex flex-col"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Profile */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 px-4 py-3 transition-colors"
            style={{ borderBottom: "1px solid var(--border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gold-glow)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0"
              style={{
                background: avatarUrl ? "transparent" : "var(--gold-glow)",
                border: "1px solid var(--gold-border)",
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={username ?? "avatar"} className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono font-bold text-[10px]" style={{ color: "var(--gold)" }}>
                  {initials}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold" style={{ color: "var(--text-1)" }}>
                {username ?? "Profile"}
              </span>
              <span className="font-mono text-[10px]" style={{ color: "var(--text-3)" }}>
                View profile
              </span>
            </div>
          </Link>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs transition-colors"
            style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--gold-glow)";
              e.currentTarget.style.color = "var(--gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-2)";
            }}
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
              e.currentTarget.style.background = "rgba(201,168,76,0.08)";
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
