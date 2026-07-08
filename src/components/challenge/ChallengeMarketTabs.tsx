"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ChallengeMarketTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "Stocks", href: "/challenge/market" },
    { label: "Crypto", href: "/challenge/market/crypto" },
  ];

  return (
    <div
      className="inline-flex items-center mb-6 rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border-mid)", background: "var(--card-bg)" }}
    >
      {tabs.map((tab, i) => {
        const active =
          tab.href === "/challenge/market"
            ? !pathname.startsWith("/challenge/market/crypto")
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="relative px-4 sm:px-5 py-2 text-sm font-medium font-mono transition-all duration-200"
            style={{
              background: active ? "var(--gold-glow)" : "transparent",
              color: active ? "var(--gold)" : "var(--text-3)",
              borderLeft: i > 0 ? "1px solid var(--border)" : "none",
            }}
          >
            {tab.label}
            {active && (
              <span
                className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
