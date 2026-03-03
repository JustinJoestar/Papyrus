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

  const tabs = [{ id: null, name: "Global" }, ...leagues];

  return (
    <div className="flex items-center gap-1.5 mb-8 flex-wrap">
      {tabs.map((tab) => {
        const active = tab.id === null ? !activeLeagueId : activeLeagueId === tab.id;
        return (
          <button
            key={tab.id ?? "global"}
            onClick={() => go(tab.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={
              active
                ? {
                    background: "var(--gold-glow)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold)",
                  }
                : {
                    background: "var(--elevated)",
                    border: "1px solid var(--border-mid)",
                    color: "var(--text-3)",
                  }
            }
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "var(--text-2)"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--text-3)"; }}
          >
            <span className="text-xs leading-none">{tab.id === null ? "🌐" : "🏆"}</span>
            <span className="font-mono text-xs">{tab.name}</span>
          </button>
        );
      })}
    </div>
  );
}
