import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";
import { getCommodityPrices } from "@/lib/commodities";

type LeaderboardEntry = {
  username: string;
  totalValue: number;
  rank: number;
  isCurrentUser: boolean;
};

export default async function LeagueLeaderboardPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch league info and holdings in parallel
  const [{ data: league }, { data: rows }] = await Promise.all([
    supabase
      .from("leagues")
      .select("name, invite_code, owner_id")
      .eq("id", leagueId)
      .single(),
    supabase.rpc("get_league_leaderboard_holdings", {
      p_league_id: leagueId,
    }),
  ]);

  // League doesn't exist
  if (!league) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center text-gray-400">
        <p className="text-4xl mb-4">🔒</p>
        <p className="font-medium mb-4">League not found</p>
        <Link
          href="/dashboard/leagues"
          className="text-indigo-400 hover:text-indigo-300 text-sm transition"
        >
          ← Back to My Leagues
        </Link>
      </div>
    );
  }

  // User is not a member (RPC returned no rows for this user's league)
  if (!rows || rows.length === 0) {
    redirect("/dashboard/leagues");
  }

  type HoldingRow = {
    user_id: string;
    username: string;
    cash_balance: number;
    symbol: string;
    quantity: number;
    asset_type: string;
  };
  const allRows = rows as HoldingRow[];

  // Collect unique symbols per asset type
  const stockSymbols = [
    ...new Set(
      allRows
        .filter((r) => r.asset_type === "stock" && r.symbol)
        .map((r) => r.symbol)
    ),
  ];
  const commoditySymbols = [
    ...new Set(
      allRows
        .filter((r) => r.asset_type === "commodity" && r.symbol)
        .map((r) => r.symbol)
    ),
  ];

  const [coins, stockPrices, commodityPrices] = await Promise.all([
    getTopCoins(),
    stockSymbols.length > 0
      ? getStockPrices(stockSymbols)
      : Promise.resolve({}),
    commoditySymbols.length > 0
      ? getCommodityPrices(commoditySymbols)
      : Promise.resolve({}),
  ]);

  const priceMap: Record<string, number> = {
    ...buildPriceMap(coins),
    ...stockPrices,
    ...commodityPrices,
  };

  // Aggregate total value per user
  const userMap: Record<
    string,
    { username: string; cashBalance: number; holdingsValue: number }
  > = {};

  for (const row of allRows) {
    if (!userMap[row.user_id]) {
      userMap[row.user_id] = {
        username: row.username,
        cashBalance: row.cash_balance,
        holdingsValue: 0,
      };
    }
    if (row.symbol && row.quantity) {
      const price = priceMap[row.symbol] ?? 0;
      userMap[row.user_id].holdingsValue += price * row.quantity;
    }
  }

  const entries: LeaderboardEntry[] = Object.entries(userMap)
    .map(([userId, data]) => ({
      username: data.username,
      totalValue: data.cashBalance + data.holdingsValue,
      rank: 0,
      isCurrentUser: userId === user.id,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const medal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/dashboard/leagues"
        className="text-sm text-gray-400 hover:text-white transition mb-8 inline-block"
      >
        ← My Leagues
      </Link>

      <h2 className="text-2xl font-bold mb-1">{league.name}</h2>

      {/* Invite code */}
      <div className="flex items-center gap-3 mb-8">
        <p className="text-sm text-gray-400">Invite code:</p>
        <code className="font-mono text-sm tracking-widest bg-gray-800 px-3 py-1 rounded-lg text-white">
          {league.invite_code}
        </code>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.username}
            className={`rounded-2xl px-6 py-4 flex items-center gap-4 ${
              entry.isCurrentUser
                ? "bg-indigo-600/20 border border-indigo-500/40"
                : "bg-gray-900"
            }`}
          >
            <span className="text-xl w-10 text-center shrink-0">
              {medal(entry.rank)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {entry.username}
                {entry.isCurrentUser && (
                  <span className="ml-2 text-xs text-indigo-400 font-normal">
                    you
                  </span>
                )}
              </p>
            </div>
            <p className="font-bold text-lg">${fmt(entry.totalValue)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
