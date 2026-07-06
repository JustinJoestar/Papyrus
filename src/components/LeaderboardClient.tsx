"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import LeaderboardHoldingModal from "./LeaderboardHoldingModal";
import RankMedallion from "./RankMedallion";
import Guilloche from "./Guilloche";

const REFRESH_INTERVAL_MS = 60_000; // re-fetch prices every 60 s

type Holding = {
  symbol: string;
  quantity: number;
  assetType: string;
  value: number;
};

type Entry = {
  username: string;
  avatarUrl: string | null;
  totalValue: number;
  cashBalance: number;
  rank: number;
  isCurrentUser: boolean;
  holdings: Holding[];
};

function Avatar({ username, avatarUrl, size = 8 }: { username: string; avatarUrl: string | null; size?: number }) {
  const initials = (username ?? "?").slice(0, 2).toUpperCase();
  const dim = `${size * 4}px`;
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0"
      style={{
        width: dim,
        height: dim,
        background: avatarUrl ? "transparent" : "var(--gold-glow)",
        border: "1px solid var(--gold-border)",
      }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span className="font-mono font-bold" style={{ fontSize: `${size * 1.4}px`, color: "var(--gold)" }}>
          {initials}
        </span>
      )}
    </div>
  );
}

type SnapshotEntry = {
  username: string;
  final_value: number;
  rank: number;
};

const METAL_TEXT = {
  1: "var(--gold-bright)",
  2: "var(--metal-silver)",
  3: "var(--metal-bronze)",
} as const;

/* Progress toward the leader */
function ChaseBar({ pct, metal, index }: { pct: number; metal?: string; index: number }) {
  return (
    <div className="h-[3px] rounded-full overflow-hidden mt-2.5" style={{ background: "var(--border)" }}>
      <div
        className="bar-grow h-full rounded-full"
        style={{
          "--i": index,
          width: `${Math.max(2, Math.min(100, pct))}%`,
          background: metal ?? "var(--gold-dim)",
          opacity: 0.85,
        } as React.CSSProperties}
      />
    </div>
  );
}

function ProfileDetail({ entry, onBack }: { entry: Entry; onBack: () => void }) {
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const holdingsValue = entry.totalValue - entry.cashBalance;
  const isPodium = entry.rank <= 3;
  const metalText = isPodium ? METAL_TEXT[entry.rank as 1 | 2 | 3] : "var(--text-1)";
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

  return (
    <div>
      <button
        onClick={onBack}
        className="rise flex items-center gap-2 mb-6 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ "--i": 0, color: "var(--text-2)" } as React.CSSProperties}
      >
        <ArrowLeft size={16} />
        Back to Leaderboard
      </button>

      {/* Trader certificate */}
      <div
        className="rise card-cert corner-frame relative rounded-2xl px-6 sm:px-8 py-7 mb-6 overflow-hidden"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <div
          className="absolute pointer-events-none hidden sm:block"
          style={{ right: -90, top: "50%", transform: "translateY(-50%)", opacity: 0.7 }}
        >
          <Guilloche size={260} />
        </div>
        <div className="relative z-10 flex items-center gap-5 sm:gap-6">
          <Avatar username={entry.username} avatarUrl={entry.avatarUrl} size={18} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-display text-2xl font-semibold truncate" style={{ color: "var(--text-1)" }}>
                {entry.username}
              </h1>
              {entry.isCurrentUser && (
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}
                >
                  YOU
                </span>
              )}
            </div>
            <p className="font-mono text-sm" style={{ color: "var(--text-3)" }}>
              Rank #{entry.rank}
              {entry.rank === 1 ? " · Champion" : entry.rank === 2 ? " · Silver" : entry.rank === 3 ? " · Bronze" : ""}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono font-bold text-2xl tabular-nums" style={{ color: metalText }}>
              ${fmt(entry.totalValue)}
            </p>
            <p className="font-mono text-sm mt-0.5" style={{ color: "var(--text-3)" }}>total value</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="rise sheet grid grid-cols-2 mb-8"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <div className="px-5 py-4" style={{ borderTop: "none" }}>
          <p className="label-ledger mb-1" style={{ letterSpacing: "0.2em" }}>Cash</p>
          <p className="font-mono font-semibold text-lg tabular-nums" style={{ color: "var(--text-1)" }}>${fmt(entry.cashBalance)}</p>
        </div>
        <div className="px-5 py-4" style={{ borderTop: "none", borderLeft: "1px solid var(--border)" }}>
          <p className="label-ledger mb-1" style={{ letterSpacing: "0.2em" }}>Invested</p>
          <p className="font-mono font-semibold text-lg tabular-nums" style={{ color: "var(--text-1)" }}>${fmt(holdingsValue)}</p>
        </div>
      </div>

      {/* Portfolio */}
      <div className="rise mb-4 flex items-baseline justify-between" style={{ "--i": 3 } as React.CSSProperties}>
        <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text-1)" }}>Holdings</h2>
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--text-3)" }}>
          {entry.holdings.length} positions
        </span>
      </div>

      {entry.holdings.length === 0 ? (
        <div
          className="rise rounded-xl px-6 py-10 text-center"
          style={{ "--i": 4, background: "var(--card-bg)", border: "1px dashed var(--border-bright)" } as React.CSSProperties}
        >
          <p className="font-display italic text-base" style={{ color: "var(--text-3)" }}>All cash — waiting for the moment.</p>
        </div>
      ) : (
        <div className="rise sheet" style={{ "--i": 4 } as React.CSSProperties}>
          {entry.holdings.map((h) => (
            <button
              key={h.symbol}
              onClick={() => setSelectedHolding(h)}
              className="row-ledger w-full text-left"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)" }}
              >
                <span className="font-mono font-bold text-xs" style={{ color: "var(--gold-bright)" }}>
                  {h.symbol.slice(0, 3)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-semibold text-sm" style={{ color: "var(--text-1)" }}>{h.symbol}</p>
                <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                  {h.quantity.toLocaleString("en-US", { maximumFractionDigits: 6 })} units · {h.assetType}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono font-semibold text-sm tabular-nums" style={{ color: "var(--text-2)" }}>${fmt(h.value)}</p>
                <p className="font-mono text-xs mt-0.5 tabular-nums" style={{ color: "var(--text-3)" }}>
                  {entry.totalValue > 0 ? ((h.value / entry.totalValue) * 100).toFixed(1) : "0.0"}%
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedHolding && (
        <LeaderboardHoldingModal
          symbol={selectedHolding.symbol}
          assetType={selectedHolding.assetType}
          onClose={() => setSelectedHolding(null)}
        />
      )}
    </div>
  );
}

export default function LeaderboardClient({
  entries,
  lastWeekTop3,
  lastWeekDate,
}: {
  entries: Entry[];
  lastWeekTop3: SnapshotEntry[];
  lastWeekDate: string | null;
}) {
  const router = useRouter();
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState<Entry | null>(null);
  const [secondsAgo,   setSecondsAgo]   = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    router.refresh();
    // Give the server a moment to respond, then clear the spinner
    setTimeout(() => { setIsRefreshing(false); setSecondsAgo(0); }, 1500);
  }, [router]);

  // Auto-refresh every 60 s
  useEffect(() => {
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // Tick the "X s ago" counter every second
  useEffect(() => {
    const tick = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (selected) {
    return <ProfileDetail entry={selected} onBack={() => setSelected(null)} />;
  }

  const filtered = search.trim()
    ? entries.filter((e) => e.username.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const podium = search.trim() ? [] : filtered.slice(0, 3);
  const rest   = search.trim() ? filtered : filtered.slice(3);
  const leaderValue = entries[0]?.totalValue || 1;

  return (
    <>
      {/* Live status bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full animate-blink-dot"
            style={{ background: "var(--gold)" }}
          />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--text-3)" }}>
            Live · updates every 60s
          </span>
          {secondsAgo > 0 && (
            <span className="font-mono text-[10px]" style={{ color: "var(--text-3)", opacity: 0.6 }}>
              · last updated {secondsAgo}s ago
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono"
        >
          <RefreshCw
            size={11}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username…"
          className="input-ledger py-3"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-16 font-display italic text-base" style={{ color: "var(--text-3)" }}>
          No traders found matching &quot;{search}&quot;
        </p>
      ) : (
        <>
          {/* Podium — Top 3 (hidden during search) */}
          {podium.length > 0 && (
            <div className="space-y-3 mb-3">
              {podium.map((entry, idx) => {
                const isMe   = entry.isCurrentUser;
                const first  = entry.rank === 1;
                const metalText = METAL_TEXT[entry.rank as 1 | 2 | 3] ?? "var(--text-1)";
                const behind = leaderValue - entry.totalValue;
                return (
                  <button
                    key={entry.username}
                    onClick={() => setSelected(entry)}
                    className={`rise w-full text-left relative rounded-2xl px-5 sm:px-7 overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-[2px] ${first ? "card-cert corner-frame animate-rank1-aura py-6" : "py-5"}`}
                    style={{
                      "--i": idx,
                      background: first ? undefined : isMe ? "var(--gold-glow)" : "var(--card-bg)",
                      border: first ? undefined : `1px solid ${isMe ? "var(--gold-border)" : "var(--border-mid)"}`,
                    } as React.CSSProperties}
                  >
                    {first && <div className="banner-sheen" />}
                    <div className="relative z-10 flex items-center gap-4 sm:gap-6">
                      <RankMedallion
                        rank={entry.rank}
                        size={first ? 62 : 48}
                        label={entry.rank === 1 ? "GOLD" : entry.rank === 2 ? "SILVER" : "BRONZE"}
                      />
                      <div className="flex-1 min-w-0">
                        {first && (
                          <p className="label-ledger mb-1 crown-float inline-block" style={{ color: "var(--gold)", letterSpacing: "0.24em" }}>
                            ♛ Champion
                          </p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap min-w-0">
                          <Avatar username={entry.username} avatarUrl={entry.avatarUrl} size={first ? 12 : 10} />
                          <p className={`font-display font-semibold truncate ${first ? "text-xl sm:text-2xl" : "text-lg"}`} style={{ color: "var(--text-1)" }}>
                            {entry.username}
                          </p>
                          {isMe && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}>YOU</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-mono font-bold tabular-nums ${first ? "text-xl sm:text-2xl text-gold-shimmer" : "text-lg"}`} style={first ? undefined : { color: metalText }}>
                          ${fmt(entry.totalValue)}
                        </p>
                        <p className="font-mono text-[10px] tracking-wide mt-1 tabular-nums" style={{ color: "var(--text-3)" }}>
                          {first ? `$${fmt(entry.cashBalance)} cash` : `−$${fmt(behind)} to №1`}
                        </p>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <ChaseBar
                        pct={(entry.totalValue / leaderValue) * 100}
                        metal={entry.rank === 1 ? "var(--gold)" : entry.rank === 2 ? "var(--metal-silver)" : "var(--metal-bronze)"}
                        index={idx}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Remaining */}
          {rest.length > 0 && (
            <div className="sheet mb-12">
              {rest.map((entry, idx) => (
                <button
                  key={entry.username}
                  onClick={() => setSelected(entry)}
                  className="w-full text-left px-5 py-4 cursor-pointer transition-colors duration-150"
                  style={{ background: entry.isCurrentUser ? "var(--gold-glow)" : "transparent" }}
                  onMouseEnter={(e) => { if (!entry.isCurrentUser) e.currentTarget.style.background = "var(--gold-glow)"; }}
                  onMouseLeave={(e) => { if (!entry.isCurrentUser) e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm w-10 shrink-0 tabular-nums" style={{ color: "var(--text-3)" }}>
                      #{entry.rank}
                    </span>
                    <Avatar username={entry.username} avatarUrl={entry.avatarUrl} size={9} />
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-2)" }}>{entry.username}</p>
                      {entry.isCurrentUser && <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--gold-dim)" }}>you</span>}
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-sm tabular-nums" style={{ color: entry.isCurrentUser ? "var(--gold)" : "var(--text-2)" }}>${fmt(entry.totalValue)}</p>
                      <p className="font-mono text-xs tabular-nums" style={{ color: "var(--text-3)" }}>${fmt(entry.cashBalance)} cash</p>
                    </div>
                  </div>
                  {!search.trim() && (
                    <ChaseBar pct={(entry.totalValue / leaderValue) * 100} index={Math.min(idx + 3, 10)} />
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Last week's champions */}
      {lastWeekTop3.length > 0 && !search.trim() && (
        <div>
          <div className="mb-4">
            <p className="label-ledger mb-1">Previous Week</p>
            <h2 className="font-display text-lg font-semibold" style={{ color: "var(--text-1)" }}>
              Hall of Champions — {lastWeekDate}
            </h2>
          </div>
          <div className="sheet">
            {lastWeekTop3.map((entry) => (
              <div
                key={entry.username}
                className="px-5 py-3.5 flex items-center gap-4"
              >
                <RankMedallion rank={entry.rank} size={34} />
                <p className="flex-1 text-sm truncate" style={{ color: "var(--text-2)" }}>{entry.username}</p>
                <p className="font-mono font-semibold text-sm tabular-nums" style={{ color: "var(--text-3)" }}>${fmt(entry.final_value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
