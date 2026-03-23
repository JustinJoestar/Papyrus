"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/dashboard",               label: "Portfolio"    },
  { href: "/dashboard/market",        label: "Market"       },
  { href: "/dashboard/leaderboard",   label: "Leaderboard"  },
  { href: "/dashboard/news",          label: "News"         },
  { href: "/dashboard/leagues",       label: "Leagues"      },
  { href: "/dashboard/achievements",  label: "Achievements" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  function linkStyle(active: boolean) {
    return active
      ? { color: "var(--gold)", background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }
      : { color: "var(--text-2)", border: "1px solid transparent" };
  }

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop: horizontal links */}
      <div className="hidden md:flex items-center gap-0.5">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={linkStyle(isActive(href))}
            onMouseEnter={(e) => { if (!isActive(href)) e.currentTarget.style.color = "var(--text-1)"; }}
            onMouseLeave={(e) => { if (!isActive(href)) e.currentTarget.style.color = "var(--text-2)"; }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Mobile: hamburger button */}
      <button
        className="md:hidden p-2 rounded-lg transition-all"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        style={{ color: "var(--text-2)" }}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile: dropdown */}
      {open && (
        <div
          className="md:hidden fixed top-14 left-0 right-0 z-40 px-3 py-2 flex flex-col gap-1"
          style={{
            background: "var(--nav-bg)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(12px)",
          }}
        >
          {links.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={active
                  ? { color: "var(--gold)", background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }
                  : { color: "var(--text-2)", border: "1px solid transparent" }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
