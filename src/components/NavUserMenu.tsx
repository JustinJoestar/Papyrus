"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  username: string | null;
  avatarUrl: string | null;
};

export default function NavUserMenu({ username, avatarUrl }: Props) {
  const pathname = usePathname();
  const active = pathname.startsWith("/dashboard/profile");
  const initials = (username ?? "?").slice(0, 2).toUpperCase();

  return (
    <Link
      href="/dashboard/profile"
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-150"
      style={
        active
          ? {
              background: "var(--gold-glow)",
              border: "1px solid var(--gold-border)",
            }
          : {
              border: "1px solid transparent",
            }
      }
      onMouseEnter={(e) => {
        if (!active)
          e.currentTarget.style.border = "1px solid var(--border-mid)";
      }}
      onMouseLeave={(e) => {
        if (!active)
          e.currentTarget.style.border = "1px solid transparent";
      }}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0"
        style={{
          background: avatarUrl ? "transparent" : "var(--gold-glow)",
          border: "1px solid var(--gold-border)",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username ?? "avatar"}
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
        style={{ color: active ? "var(--gold)" : "var(--text-3)" }}
      >
        {username ?? "Profile"}
      </span>
    </Link>
  );
}
