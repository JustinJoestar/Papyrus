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
    <div className="flex gap-2 mb-8">
      {tabs.map((tab) => {
        const active =
          tab.href === "/dashboard/market"
            ? pathname === "/dashboard/market"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-1.5 rounded-lg text-sm font-medium font-mono transition-all duration-150"
            style={
              active
                ? {
                    background: "var(--gold-glow)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold-bright)",
                  }
                : {
                    background: "var(--elevated)",
                    border: "1px solid var(--border-mid)",
                    color: "var(--text-3)",
                  }
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
