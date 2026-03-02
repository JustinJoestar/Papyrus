"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MarketTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "Crypto",       href: "/dashboard/market" },
    { label: "Stocks",       href: "/dashboard/market/stocks" },
    { label: "Commodities",  href: "/dashboard/market/commodities" },
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
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
              active
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
