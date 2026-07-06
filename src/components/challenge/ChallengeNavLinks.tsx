"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/challenge/play",        label: "Portfolio" },
  { href: "/challenge/market",      label: "Market" },
  { href: "/challenge/leaderboard", label: "Leaderboard" },
];

export default function ChallengeNavLinks() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex items-center gap-0.5">
      {links.map(({ href, label }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap"
            style={
              active
                ? { color: "var(--gold)", background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }
                : { color: "var(--text-2)", border: "1px solid transparent" }
            }
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--text-1)"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--text-2)"; }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
