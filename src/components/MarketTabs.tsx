"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MarketTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "Crypto",      href: "/dashboard/market" },
    { label: "Stocks",      href: "/dashboard/market/stocks" },
    { label: "Commodities", href: "/dashboard/market/commodities" },
  ];

  return (
    <div
      className="inline-flex items-center mb-8 rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border-mid)", background: "var(--card-bg)" }}
    >
      {tabs.map((tab, i) => {
        const active =
          tab.href === "/dashboard/market"
            ? pathname === "/dashboard/market"
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
