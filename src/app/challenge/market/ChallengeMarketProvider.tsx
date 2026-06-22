"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { MarketLeagueContext, type LeagueOption } from "@/app/dashboard/market/MarketLeagueProvider";

export function ChallengeMarketProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [activeLeague, setActiveLeague] = useState<LeagueOption | null>(null);

  const fetchBalance = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: contest } = await supabase
      .from("leagues")
      .select("id, name")
      .eq("is_contest", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!contest) return;

    const { data: membership } = await supabase
      .from("league_members")
      .select("league_cash_balance")
      .eq("league_id", contest.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!membership) return;

    setActiveLeague({
      id: contest.id,
      name: contest.name,
      cashBalance: Number(membership.league_cash_balance),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  return (
    <MarketLeagueContext.Provider value={{
      leagues: activeLeague ? [activeLeague] : [],
      activeLeague,
      setActiveLeague,
      refreshBalances: fetchBalance,
    }}>
      {children}
    </MarketLeagueContext.Provider>
  );
}
