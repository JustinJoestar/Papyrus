"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavSettingsLink() {
  const pathname = usePathname();
  const active = pathname.startsWith("/dashboard/settings");

  return (
    <Link
      href="/dashboard/settings"
      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
      style={
        active
          ? {
              color: "var(--gold)",
              background: "var(--gold-glow)",
              border: "1px solid var(--gold-border)",
            }
          : {
              color: "var(--text-3)",
              border: "1px solid transparent",
            }
      }
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-2)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = "var(--text-3)";
      }}
    >
      Settings
    </Link>
  );
}
