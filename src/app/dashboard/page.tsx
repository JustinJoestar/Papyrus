import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";
import HoldingsList, { type HoldingWithPrice } from "@/components/HoldingsList";
import PortfolioTabs from "@/components/PortfolioTabs";

// Ember config
const EMBERS = [
  { left: "12%",  bottom: "18%", color: "#e2c56a", delay: "0s",    dur: "2.6s" },
  { left: "22%",  bottom: "24%", color: "#c9a84c", delay: "0.4s",  dur: "3.1s" },
  { left: "35%",  bottom: "15%", color: "#f59e0b", delay: "0.9s",  dur: "2.4s" },
  { left: "50%",  bottom: "20%", color: "#e2c56a", delay: "1.3s",  dur: "3.3s" },
  { left: "64%",  bottom: "28%", color: "#c9a84c", delay: "0.2s",  dur: "2.9s" },
  { left: "78%",  bottom: "16%", color: "#f0d060", delay: "0.7s",  dur: "2.7s" },
  { left: "88%",  bottom: "22%", color: "#e2c56a", delay: "1.6s",  dur: "3.0s" },
  { left: "42%",  bottom: "10%", color: "#c9a84c", delay: "2.0s",  dur: "2.5s" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const { league: leagueId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Always fetch the user's leagues for the tab row
  const { data: leagueMemberRows } = await supabase
    .from("league_members")
    .select("league_id, leagues!inner(id, name)")
    .eq("user_id", user.id);

  const userLeagues: { id: string; name: string }[] = (leagueMemberRows ?? []).map((r: any) => ({
    id: r.leagues.id,
    name: r.leagues.name,
  }));

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── League portfolio ────────────────────────────────────────
  if (leagueId) {
    const [
      { data: leagueInfo },
      { data: memberInfo },
      { data: rawHoldings },
      { data: profile },
    ] = await Promise.all([
      supabase.from("leagues").select("name, starting_balance").eq("id", leagueId).single(),
      supabase.from("league_members").select("league_cash_balance").eq("league_id", leagueId).eq("user_id", user.id).single(),
      supabase.from("league_holdings").select("*").eq("league_id", leagueId).eq("user_id", user.id),
      supabase.from("profiles").select("username").eq("id", user.id).single(),
    ]);

    // Not a member — fall back to global
    if (!memberInfo) redirect("/dashboard");

    let priceMap: Record<string, number> = {};
    if (rawHoldings && rawHoldings.length > 0) {
      const cryptoH    = rawHoldings.filter((h) => h.asset_type === "crypto");
      const stockH     = rawHoldings.filter((h) => h.asset_type === "stock");
      const commodityH = rawHoldings.filter((h) => h.asset_type === "commodity");
      const [coins, stockPrices, commodityPrices] = await Promise.all([
        cryptoH.length    > 0 ? getTopCoins()                                        : Promise.resolve([]),
        stockH.length     > 0 ? getStockPrices(stockH.map((h) => h.symbol))          : Promise.resolve({}),
        commodityH.length > 0 ? getCommodityPrices(commodityH.map((h) => h.symbol))  : Promise.resolve({}),
      ]);
      priceMap = { ...buildPriceMap(coins), ...stockPrices, ...commodityPrices };
    }

    const holdings: HoldingWithPrice[] = (rawHoldings ?? []).map((h) => {
      const currentPrice = priceMap[h.symbol] ?? h.avg_buy_price;
      return { ...h, id: `${h.league_id}-${h.symbol}`, currentPrice, currentValue: currentPrice * h.quantity };
    });

    const cashBalance    = memberInfo.league_cash_balance ?? 0;
    const holdingsValue  = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalValue     = cashBalance + holdingsValue;
    const startBal       = leagueInfo?.starting_balance ?? 10000;
    const totalReturn    = totalValue - startBal;
    const totalReturnPct = (totalReturn / startBal) * 100;
    const isGain         = totalReturn >= 0;

    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: "var(--text-3)" }}>
            Welcome back
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
            {profile?.username}
          </h1>
        </div>

        <Suspense>
          <PortfolioTabs leagues={userLeagues} />
        </Suspense>

        {/* League hero card */}
        <div
          className="relative rounded-2xl p-8 mb-4 overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none animate-flame-breathe"
            style={{
              background: isGain
                ? "radial-gradient(ellipse 70% 80% at 60% 110%, rgba(201,168,76,0.12) 0%, transparent 65%)"
                : "radial-gradient(ellipse 70% 80% at 60% 110%, rgba(244,63,94,0.10) 0%, transparent 65%)",
            }}
          />
          {EMBERS.map((e, i) => (
            <span key={i} className="ember" style={{ left: e.left, bottom: e.bottom, background: isGain ? e.color : "#f43f5e", animationDelay: e.delay, animationDuration: e.dur, opacity: 0 }} />
          ))}

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base leading-none">🏆</span>
              <p className="font-mono text-[10px] tracking-[0.28em] uppercase" style={{ color: "var(--text-3)" }}>
                {leagueInfo?.name} — Portfolio
              </p>
            </div>
            <p className="font-mono text-5xl font-bold tracking-tight mb-4 text-gold-shimmer">
              ${fmt(totalValue)}
            </p>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-sm font-semibold"
                style={{
                  background: isGain ? "var(--gain-bg)" : "var(--loss-bg)",
                  border:     `1px solid ${isGain ? "var(--gain-border)" : "var(--loss-border)"}`,
                  color:      isGain ? "var(--gain)" : "var(--loss)",
                }}
              >
                {isGain ? "▲" : "▼"}{" "}
                {`${isGain ? "+" : ""}$${fmt(Math.abs(totalReturn))} (${isGain ? "+" : ""}${totalReturnPct.toFixed(2)}%)`}
              </span>
              <span className="text-[10px] font-mono tracking-widest" style={{ color: "var(--text-3)" }}>
                FROM ${fmt(startBal)} START
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-10">
          <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: "var(--text-3)" }}>League Cash</p>
            <p className="font-mono text-2xl font-bold text-gold-gradient">${fmt(cashBalance)}</p>
            <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>Available to invest</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: "var(--text-3)" }}>Holdings Value</p>
            <p className="font-mono text-2xl font-bold" style={{ color: "var(--text-1)" }}>${fmt(holdingsValue)}</p>
            <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>{holdings.length} open position{holdings.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Open Positions</h2>
          <span className="font-mono text-[10px] tracking-widest" style={{ color: "var(--text-3)" }}>{holdings.length} ASSETS</span>
        </div>

        <HoldingsList holdings={holdings} leagueId={leagueId} leagueName={leagueInfo?.name} />
      </div>
    );
  }

  // ── Global portfolio ────────────────────────────────────────
  const [{ data: profile }, { data: holdings }] = await Promise.all([
    supabase.from("profiles").select("username, cash_balance").eq("id", user.id).single(),
    supabase.from("holdings").select("*").eq("user_id", user.id),
  ]);

  let priceMap: Record<string, number> = {};
  if (holdings && holdings.length > 0) {
    const cryptoH    = holdings.filter((h) => h.asset_type === "crypto");
    const stockH     = holdings.filter((h) => h.asset_type === "stock");
    const commodityH = holdings.filter((h) => h.asset_type === "commodity");
    const [coins, stockPrices, commodityPrices] = await Promise.all([
      cryptoH.length    > 0 ? getTopCoins()                                        : Promise.resolve([]),
      stockH.length     > 0 ? getStockPrices(stockH.map((h) => h.symbol))          : Promise.resolve({}),
      commodityH.length > 0 ? getCommodityPrices(commodityH.map((h) => h.symbol))  : Promise.resolve({}),
    ]);
    priceMap = { ...buildPriceMap(coins), ...stockPrices, ...commodityPrices };
  }

  const holdingsWithPrices: HoldingWithPrice[] = (holdings ?? []).map((h) => {
    const currentPrice = priceMap[h.symbol] ?? h.avg_buy_price;
    return { ...h, currentPrice, currentValue: currentPrice * h.quantity };
  });

  const portfolioValue  = holdingsWithPrices.reduce((s, h) => s + h.currentValue, 0);
  const cashBalance     = profile?.cash_balance ?? 0;
  const totalValue      = cashBalance + portfolioValue;
  const totalReturn     = totalValue - 10000;
  const totalReturnPct  = (totalReturn / 10000) * 100;
  const isGain          = totalReturn >= 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: "var(--text-3)" }}>
          Welcome back
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
          {profile?.username}
        </h1>
      </div>

      <Suspense>
        <PortfolioTabs leagues={userLeagues} />
      </Suspense>

      {/* Hero card */}
      <div
        className="relative rounded-2xl p-8 mb-4 overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none animate-flame-breathe"
          style={{
            background: isGain
              ? "radial-gradient(ellipse 70% 80% at 60% 110%, rgba(201,168,76,0.12) 0%, transparent 65%)"
              : "radial-gradient(ellipse 70% 80% at 60% 110%, rgba(244,63,94,0.10) 0%, transparent 65%)",
          }}
        />
        {EMBERS.map((e, i) => (
          <span key={i} className="ember" style={{ left: e.left, bottom: e.bottom, background: isGain ? e.color : "#f43f5e", animationDelay: e.delay, animationDuration: e.dur, opacity: 0 }} />
        ))}
        <div className="relative z-10">
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--text-3)" }}>
            Total Portfolio Value
          </p>
          <p className="font-mono text-5xl font-bold tracking-tight mb-4 text-gold-shimmer">
            ${fmt(totalValue)}
          </p>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-sm font-semibold"
              style={{
                background: isGain ? "var(--gain-bg)" : "var(--loss-bg)",
                border:     `1px solid ${isGain ? "var(--gain-border)" : "var(--loss-border)"}`,
                color:      isGain ? "var(--gain)" : "var(--loss)",
              }}
            >
              {isGain ? "▲" : "▼"}{" "}
              {`${isGain ? "+" : ""}$${fmt(Math.abs(totalReturn))} (${isGain ? "+" : ""}${totalReturnPct.toFixed(2)}%)`}
            </span>
            <span className="text-[10px] font-mono tracking-widest" style={{ color: "var(--text-3)" }}>ALL TIME</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-10">
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: "var(--text-3)" }}>Cash Balance</p>
          <p className="font-mono text-2xl font-bold text-gold-gradient">${fmt(cashBalance)}</p>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>Available to invest</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: "var(--text-3)" }}>Holdings Value</p>
          <p className="font-mono text-2xl font-bold" style={{ color: "var(--text-1)" }}>${fmt(portfolioValue)}</p>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>{holdingsWithPrices.length} open position{holdingsWithPrices.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Open Positions</h2>
        <span className="font-mono text-[10px] tracking-widest" style={{ color: "var(--text-3)" }}>{holdingsWithPrices.length} ASSETS</span>
      </div>

      <HoldingsList holdings={holdingsWithPrices} />
    </div>
  );
}
