import { createClient } from "@/lib/supabase/server";
import { getTopCoins, buildPriceMap } from "@/lib/market";
import { getStockPrices } from "@/lib/stockPrices";

type LeaderboardEntry = {
  username: string;
  totalValue: number;
  rank: number;
  isCurrentUser: boolean;
};

type SnapshotEntry = {
  username: string;
  final_value: number;
  rank: number;
};

function getResetCountdown(): { daysLeft: number; hoursLeft: number } {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun … 6=Sat
  // Days until next Monday: Mon=7, Sun=1, Sat=2, Fri=3, ...
  const daysUntil = day === 1 ? 7 : (1 - day + 7) % 7 || 7;
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntil);
  nextMonday.setUTCHours(0, 0, 0, 0);
  const msLeft = nextMonday.getTime() - now.getTime();
  return {
    daysLeft: Math.floor(msLeft / (1000 * 60 * 60 * 24)),
    hoursLeft: Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
  };
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Current leaderboard holdings + last week's snapshot
  const [{ data: rows }, { data: snapRows }] = await Promise.all([
    supabase.rpc("get_leaderboard_holdings"),
    supabase
      .from("weekly_snapshots")
      .select("username, final_value, rank, week_end")
      .order("week_end", { ascending: false })
      .order("rank", { ascending: true })
      .limit(50),
  ]);

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

  const { daysLeft, hoursLeft } = getResetCountdown();
  const resetLabel =
    daysLeft > 0 ? `${daysLeft}d ${hoursLeft}h` : `${hoursLeft}h`;

  // ── Current leaderboard ──────────────────────────────────────
  let entries: LeaderboardEntry[] = [];

  if (rows && rows.length > 0) {
    const allRows = rows as Array<{
      user_id: string;
      username: string;
      cash_balance: number;
      symbol: string;
      quantity: number;
      asset_type?: string;
    }>;

    const stockSymbols = [
      ...new Set(
        allRows
          .filter((r) => r.asset_type === "stock" && r.symbol)
          .map((r) => r.symbol)
      ),
    ];

    const [coins, stockPrices] = await Promise.all([
      getTopCoins(),
      stockSymbols.length > 0
        ? getStockPrices(stockSymbols)
        : Promise.resolve({}),
    ]);

    const priceMap: Record<string, number> = {
      ...buildPriceMap(coins),
      ...stockPrices,
    };

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

    entries = Object.entries(userMap)
      .map(([userId, data]) => ({
        username: data.username,
        totalValue: data.cashBalance + data.holdingsValue,
        rank: 0,
        isCurrentUser: userId === user?.id,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));
  }

  // ── Last week's snapshot (top 3 from most recent week_end) ───
  let lastWeekTop3: SnapshotEntry[] = [];
  let lastWeekDate: string | null = null;

  if (snapRows && snapRows.length > 0) {
    const latestWeekEnd = snapRows[0].week_end;
    lastWeekDate = new Date(latestWeekEnd).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    lastWeekTop3 = (snapRows as SnapshotEntry[])
      .filter((r: any) => r.week_end === latestWeekEnd)
      .slice(0, 3);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-2">Global Leaderboard</h2>
      <p className="text-gray-400 mb-6">
        Ranked by total portfolio value — prices update every 60s
      </p>

      {/* Reset countdown banner */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Week resets in</p>
          <p className="text-xl font-bold text-indigo-400">{resetLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Starting balance</p>
          <p className="text-xl font-bold text-white">$10,000</p>
        </div>
      </div>

      {/* Current leaderboard */}
      {entries.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No users on the leaderboard yet.
        </p>
      ) : (
        <div className="space-y-3 mb-12">
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
      )}

      {/* Last week's winners */}
      {lastWeekTop3.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-1">Last Week&apos;s Winners</h3>
          <p className="text-sm text-gray-500 mb-4">Week ending {lastWeekDate}</p>
          <div className="space-y-3">
            {lastWeekTop3.map((entry) => (
              <div
                key={entry.username}
                className="bg-gray-900 rounded-2xl px-6 py-4 flex items-center gap-4"
              >
                <span className="text-xl w-10 text-center shrink-0">
                  {medal(entry.rank)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{entry.username}</p>
                </div>
                <p className="font-bold text-lg text-gray-300">
                  ${fmt(entry.final_value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
