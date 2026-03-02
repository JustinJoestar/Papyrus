import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";

type LeaderboardEntry = {
  username: string;
  totalValue: number;
  rank: number;
  isCurrentUser: boolean;
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase.rpc("get_leaderboard_holdings");

  if (!rows || rows.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-gray-400 text-center">
        No users on the leaderboard yet.
      </div>
    );
  }

  // Get unique symbols split by asset type
  const allRows = rows as Array<{ user_id: string; username: string; cash_balance: number; symbol: string; quantity: number; asset_type?: string }>;
  const stockSymbols = [...new Set(allRows.filter((r) => r.asset_type === "stock" && r.symbol).map((r) => r.symbol))];

  const [coins, stockPrices] = await Promise.all([
    getTopCoins(),
    stockSymbols.length > 0 ? getStockPrices(stockSymbols) : Promise.resolve({}),
  ]);

  const priceMap: Record<string, number> = { ...buildPriceMap(coins), ...stockPrices };

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

  // Build ranked list
  const entries: LeaderboardEntry[] = Object.entries(userMap)
    .map(([userId, data]) => ({
      username: data.username,
      totalValue: data.cashBalance + data.holdingsValue,
      rank: 0,
      isCurrentUser: userId === user?.id,
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
      <h2 className="text-2xl font-bold mb-2">Global Leaderboard</h2>
      <p className="text-gray-400 mb-8">
        Ranked by total portfolio value — prices update every 60s
      </p>

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
