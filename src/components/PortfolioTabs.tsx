"use client";

import { useRouter, useSearchParams } from "next/navigation";

type League = { id: string; name: string };

export default function PortfolioTabs({ leagues }: { leagues: League[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const activeLeagueId = params.get("league");

  if (leagues.length === 0) return null;

  function go(leagueId: string | null) {
    router.push(leagueId ? `/dashboard?league=${leagueId}` : "/dashboard");
  }

  const tabs = [{ id: null as string | null, name: "Global" }, ...leagues];

  return (
    <div
      className="inline-flex items-center mb-8 flex-wrap rounded-xl overflow-hidden"
      style={{ border: "1px solid var(--border-mid)", background: "var(--card-bg)" }}
    >
      {tabs.map((tab, i) => {
        const active = tab.id === null ? !activeLeagueId : activeLeagueId === tab.id;
        return (
          <button
            key={tab.id ?? "global"}
            onClick={() => go(tab.id)}
            className="relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200"
            style={{
              background: active ? "var(--gold-glow)" : "transparent",
              color: active ? "var(--gold)" : "var(--text-3)",
              borderLeft: i > 0 ? "1px solid var(--border)" : "none",
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--text-1)"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--text-3)"; }}
          >
            <span className="font-mono text-xs">{tab.name}</span>
            {/* Engraved underline on the active drawer */}
            {active && (
              <span
                className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
