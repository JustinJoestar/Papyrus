"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard",             label: "Portfolio"    },
  { href: "/dashboard/market",      label: "Market"       },
  { href: "/dashboard/leaderboard", label: "Leaderboard"  },
  { href: "/dashboard/leagues",     label: "Leagues"      },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5">
      {links.map(({ href, label }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
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
              if (!active)
                e.currentTarget.style.color = "var(--text-2)";
            }}
            onMouseLeave={(e) => {
              if (!active)
                e.currentTarget.style.color = "var(--text-3)";
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
