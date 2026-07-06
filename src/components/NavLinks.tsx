"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/dashboard",              challengeHref: "/challenge/play",        label: "Portfolio",    challengeHide: false },
  { href: "/dashboard/market",       challengeHref: "/dashboard/market",      label: "Market",       challengeHide: false },
  { href: "/dashboard/leaderboard",  challengeHref: "/challenge/leaderboard", label: "Leaderboard",  challengeHide: false },
  { href: "/dashboard/news",         challengeHref: "/dashboard/news",        label: "News",         challengeHide: false },
  { href: "/dashboard/leagues",      challengeHref: "/dashboard/leagues",     label: "Leagues",      challengeHide: true  },
  { href: "/dashboard/achievements", challengeHref: "/dashboard/achievements",label: "Achievements", challengeHide: true  },
];

export default function NavLinks({ challengeMode = false }: { challengeMode?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close menu on route change (sync UI to the current route)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false); }, [pathname]);

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop: horizontal links with engraved underline */}
      <div className="hidden md:flex items-center gap-0.5 h-full">
        {links.map(({ href, challengeHref, label, challengeHide }) => {
          const hidden = challengeMode && challengeHide;
          const resolvedHref = challengeMode ? challengeHref : href;
          const active = isActive(href);
          return (
            <div
              key={href}
              className="overflow-hidden h-full"
              style={{
                maxWidth: hidden ? "0px" : "160px",
                opacity: hidden ? 0 : 1,
                transition: "max-width 0.35s ease, opacity 0.25s ease",
              }}
            >
              <Link
                href={resolvedHref}
                className="relative h-full flex items-center px-3 text-sm font-medium transition-colors duration-150 whitespace-nowrap"
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
            </div>
          );
        })}
        <Link
          href="/challenge"
          className="ml-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap"
          style={{ color: "var(--gold)", background: "var(--gold-glow)", border: "1px solid var(--gold-border)" }}
        >
          ☀ Challenge
        </Link>
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
          {links.map(({ href, challengeHref, label, challengeHide }, i) => {
            if (challengeMode && challengeHide) return null;
            const resolvedHref = challengeMode ? challengeHref : href;
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={resolvedHref}
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
          <Link
            href="/challenge"
            className="flex items-center px-4 py-3.5 text-sm font-medium transition-all"
            style={{ color: "var(--gold)", borderTop: "1px solid var(--border)" }}
          >
            ☀ Challenge
          </Link>
        </div>
      )}
    </>
  );
}
