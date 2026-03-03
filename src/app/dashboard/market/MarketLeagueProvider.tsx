"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type LeagueOption = {
  id: string;
  name: string;
  cashBalance: number;
};

type ContextValue = {
  leagues: LeagueOption[];
  activeLeague: LeagueOption | null;
  setActiveLeague: (l: LeagueOption | null) => void;
  refreshBalances: () => Promise<void>;
};

const MarketLeagueContext = createContext<ContextValue>({
  leagues: [],
  activeLeague: null,
  setActiveLeague: () => {},
  refreshBalances: async () => {},
});

export function useMarketLeague() {
  return useContext(MarketLeagueContext);
}

export function MarketLeagueProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [leagues, setLeagues] = useState<LeagueOption[]>([]);
  const [activeLeague, setActiveLeagueRaw] = useState<LeagueOption | null>(null);

  const fetchBalances = useCallback(async () => {
    const { data } = await supabase.rpc("get_my_league_balances");
    if (!data) return;
    const updated: LeagueOption[] = data.map((r: any) => ({
      id: r.league_id,
      name: r.league_name,
      cashBalance: r.cash_balance,
    }));
    setLeagues(updated);
    // Keep active league balance in sync
    setActiveLeagueRaw((prev) => {
      if (!prev) return null;
      const fresh = updated.find((l) => l.id === prev.id);
      return fresh ?? null;
    });
  }, []);

  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  function setActiveLeague(l: LeagueOption | null) {
    setActiveLeagueRaw(l);
  }

  return (
    <MarketLeagueContext.Provider value={{ leagues, activeLeague, setActiveLeague, refreshBalances: fetchBalances }}>
      {children}
    </MarketLeagueContext.Provider>
  );
}
