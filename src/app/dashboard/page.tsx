import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";
import HoldingsList, { type HoldingWithPrice } from "@/components/HoldingsList";
import PortfolioTabs from "@/components/PortfolioTabs";
import Guilloche from "@/components/Guilloche";

// Ember config — sparks drifting off the folio
const EMBERS = [
  { left: "12%",  bottom: "18%", color: "#e3c878", delay: "0s",    dur: "2.6s" },
  { left: "22%",  bottom: "24%", color: "#c9a24e", delay: "0.4s",  dur: "3.1s" },
  { left: "35%",  bottom: "15%", color: "#f0b95a", delay: "0.9s",  dur: "2.4s" },
  { left: "50%",  bottom: "20%", color: "#e3c878", delay: "1.3s",  dur: "3.3s" },
  { left: "64%",  bottom: "28%", color: "#c9a24e", delay: "0.2s",  dur: "2.9s" },
  { left: "78%",  bottom: "16%", color: "#edd080", delay: "0.7s",  dur: "2.7s" },
  { left: "88%",  bottom: "22%", color: "#e3c878", delay: "1.6s",  dur: "3.0s" },
  { left: "42%",  bottom: "10%", color: "#c9a24e", delay: "2.0s",  dur: "2.5s" },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── Shared portfolio view — one folio, two data sources ───── */
function PortfolioView({
  username,
  userLeagues,
  folioLabel,
  totalValue,
  totalReturn,
  totalReturnPct,
  startBal,
  cashBalance,
  cashLabel,
  holdingsValue,
  holdings,
  leagueId,
  leagueName,
}: {
  username: string | null | undefined;
  userLeagues: { id: string; name: string }[];
  folioLabel: string;
  totalValue: number;
  totalReturn: number;
  totalReturnPct: number;
  startBal: number;
  cashBalance: number;
  cashLabel: string;
  holdingsValue: number;
  holdings: HoldingWithPrice[];
  leagueId?: string;
  leagueName?: string | null;
}) {
  const isGain = totalReturn >= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="rise mb-8" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="label-ledger mb-1.5">№ 01 — Welcome back</p>
        <h1 className="font-display text-3xl font-semibold" style={{ color: "var(--text-1)" }}>
          {username}
        </h1>
      </div>

      <div className="rise" style={{ "--i": 1 } as React.CSSProperties}>
        <Suspense>
          <PortfolioTabs leagues={userLeagues} />
        </Suspense>
      </div>

      {/* Hero folio card */}
      <div
        className="rise card-cert corner-frame relative rounded-2xl p-8 sm:p-9 mb-4 overflow-hidden"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        {/* Breathing glow */}
        <div
          className="absolute inset-0 pointer-events-none animate-flame-breathe"
          style={{
            background: isGain
              ? "radial-gradient(ellipse 70% 80% at 60% 110%, rgba(201,162,78,0.13) 0%, transparent 65%)"
              : "radial-gradient(ellipse 70% 80% at 60% 110%, rgba(229,72,77,0.10) 0%, transparent 65%)",
          }}
        />
        {/* Guilloché in the corner — the certificate's engraving */}
        <div
          className="absolute pointer-events-none hidden sm:block"
          style={{ right: -110, top: "50%", transform: "translateY(-50%)", opacity: 0.9 }}
        >
          <Guilloche size={320} />
        </div>
        {/* Embers */}
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="ember"
            style={{
              left: e.left, bottom: e.bottom,
              background: isGain ? e.color : "var(--loss)",
              animationDelay: e.delay, animationDuration: e.dur, opacity: 0,
            }}
          />
        ))}

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="label-ledger">{folioLabel}</p>
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase hidden sm:block" style={{ color: "var(--text-3)", opacity: 0.7 }}>
              Folio № {String(Math.abs(totalValue | 0)).padStart(6, "0")}
            </p>
          </div>
          <p className="font-mono text-5xl sm:text-6xl font-bold tracking-tight mb-5 text-gold-shimmer tabular-nums">
            ${fmt(totalValue)}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-sm font-semibold tabular-nums"
              style={{
                background: isGain ? "var(--gain-bg)" : "var(--loss-bg)",
                border:     `1px solid ${isGain ? "var(--gain-border)" : "var(--loss-border)"}`,
                color:      isGain ? "var(--gain)" : "var(--loss)",
              }}
            >
              {isGain ? "▲" : "▼"}{" "}
              {`${isGain ? "+" : ""}$${fmt(Math.abs(totalReturn))} (${isGain ? "+" : ""}${totalReturnPct.toFixed(2)}%)`}
            </span>
            <span className="font-mono text-[10px] tracking-widest" style={{ color: "var(--text-3)" }}>
              FROM ${fmt(startBal)} START
            </span>
          </div>
        </div>
      </div>

      {/* Balance sheet — two ruled cells */}
      <div
        className="rise sheet grid grid-cols-1 sm:grid-cols-2 mb-10"
        style={{ "--i": 3 } as React.CSSProperties}
      >
        <div className="p-6" style={{ borderTop: "none" }}>
          <p className="label-ledger mb-3" style={{ letterSpacing: "0.22em" }}>{cashLabel}</p>
          <p className="font-mono text-2xl font-bold text-gold-gradient tabular-nums">${fmt(cashBalance)}</p>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>Available to invest</p>
        </div>
        <div
          className="p-6 sm:!border-t-0"
          style={{ borderLeft: "1px solid var(--border)" }}
        >
          <p className="label-ledger mb-3" style={{ letterSpacing: "0.22em" }}>Holdings Value</p>
          <p className="font-mono text-2xl font-bold tabular-nums" style={{ color: "var(--text-1)" }}>${fmt(holdingsValue)}</p>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-3)" }}>
            {holdings.length} open position{holdings.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Open positions */}
      <div className="rise" style={{ "--i": 4 } as React.CSSProperties}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text-1)" }}>
            Open Positions
          </h2>
          <span className="font-mono text-[10px] tracking-widest" style={{ color: "var(--text-3)" }}>
            {holdings.length} ASSETS
          </span>
        </div>

        <HoldingsList holdings={holdings} leagueId={leagueId} leagueName={leagueName} />
      </div>
    </div>
  );
}

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userLeagues: { id: string; name: string }[] = (leagueMemberRows ?? []).map((r: any) => ({
    id: r.leagues.id,
    name: r.leagues.name,
  }));

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
    const symbolToCoinId: Record<string, string> = {};
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
      for (const c of coins) symbolToCoinId[c.symbol.toUpperCase()] = c.id;
    }

    const holdings: HoldingWithPrice[] = (rawHoldings ?? []).map((h) => {
      const currentPrice = priceMap[h.symbol] ?? h.avg_buy_price;
      return {
        ...h,
        id: `${h.league_id}-${h.symbol}`,
        currentPrice,
        currentValue: currentPrice * h.quantity,
        coinId: h.asset_type === "crypto" ? symbolToCoinId[h.symbol.toUpperCase()] : undefined,
      };
    });

    const cashBalance    = memberInfo.league_cash_balance ?? 0;
    const holdingsValue  = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalValue     = cashBalance + holdingsValue;
    const startBal       = leagueInfo?.starting_balance ?? 10000;
    const totalReturn    = totalValue - startBal;
    const totalReturnPct = (totalReturn / startBal) * 100;

    return (
      <PortfolioView
        username={profile?.username}
        userLeagues={userLeagues}
        folioLabel={`${leagueInfo?.name ?? "League"} — Portfolio`}
        totalValue={totalValue}
        totalReturn={totalReturn}
        totalReturnPct={totalReturnPct}
        startBal={startBal}
        cashBalance={cashBalance}
        cashLabel="League Cash"
        holdingsValue={holdingsValue}
        holdings={holdings}
        leagueId={leagueId}
        leagueName={leagueInfo?.name}
      />
    );
  }

  // ── Global portfolio ────────────────────────────────────────
  const [{ data: profile }, { data: holdings }] = await Promise.all([
    supabase.from("profiles").select("username, cash_balance").eq("id", user.id).single(),
    supabase.from("holdings").select("*").eq("user_id", user.id),
  ]);

  let priceMap: Record<string, number> = {};
  const symbolToCoinId: Record<string, string> = {};
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
    for (const c of coins) symbolToCoinId[c.symbol.toUpperCase()] = c.id;
  }

  const holdingsWithPrices: HoldingWithPrice[] = (holdings ?? []).map((h) => {
    const currentPrice = priceMap[h.symbol] ?? h.avg_buy_price;
    return {
      ...h,
      currentPrice,
      currentValue: currentPrice * h.quantity,
      coinId: h.asset_type === "crypto" ? symbolToCoinId[h.symbol.toUpperCase()] : undefined,
    };
  });

  const portfolioValue  = holdingsWithPrices.reduce((s, h) => s + h.currentValue, 0);
  const cashBalance     = profile?.cash_balance ?? 0;
  const totalValue      = cashBalance + portfolioValue;
  const totalReturn     = totalValue - 10000;
  const totalReturnPct  = (totalReturn / 10000) * 100;

  return (
    <PortfolioView
      username={profile?.username}
      userLeagues={userLeagues}
      folioLabel="Total Portfolio Value"
      totalValue={totalValue}
      totalReturn={totalReturn}
      totalReturnPct={totalReturnPct}
      startBal={10000}
      cashBalance={cashBalance}
      cashLabel="Cash Balance"
      holdingsValue={portfolioValue}
      holdings={holdingsWithPrices}
    />
  );
}
