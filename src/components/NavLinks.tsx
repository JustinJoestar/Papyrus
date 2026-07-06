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

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop: horizontal links with engraved underline */}
      <div className="hidden md:flex items-center gap-1 h-full">
        {links.map(({ href, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="relative h-full flex items-center px-3 text-sm font-medium transition-colors duration-150"
              style={{ color: active ? "var(--gold)" : "var(--text-2)" }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--text-1)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--text-2)"; }}
            >
              {label}
              {/* Engraved underline for the active page */}
              {active && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
                  }}
                />
              )}
            </Link>
          );
        })}
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
          className="md:hidden fixed top-16 left-0 right-0 z-40 px-3 py-2 flex flex-col"
          style={{
            background: "var(--nav-bg)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(12px)",
          }}
        >
          {links.map(({ href, label }, i) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-all"
                style={{
                  color: active ? "var(--gold)" : "var(--text-2)",
                  borderTop: i > 0 ? "1px solid var(--border)" : "none",
                }}
              >
                {label}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }} />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
