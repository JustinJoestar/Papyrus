"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import LeaderboardHoldingModal from "./LeaderboardHoldingModal";

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

const PODIUM = {
  1: { border: "rgba(201,168,76,0.35)",  badgeBg: "rgba(201,168,76,0.12)",  badgeColor: "var(--gold-bright)", valueColor: "var(--gold-bright)", label: "GOLD"   },
  2: { border: "rgba(180,190,210,0.25)", badgeBg: "rgba(180,190,210,0.08)", badgeColor: "#b0bccc",            valueColor: "#b0bccc",            label: "SILVER" },
  3: { border: "rgba(180,110,60,0.28)",  badgeBg: "rgba(180,110,60,0.08)",  badgeColor: "#c07040",            valueColor: "#c07040",            label: "BRONZE" },
} as const;

function ProfileDetail({ entry, onBack }: { entry: Entry; onBack: () => void }) {
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const holdingsValue = entry.totalValue - entry.cashBalance;
  const podiumStyle = PODIUM[entry.rank as 1 | 2 | 3] ?? null;
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-base font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--text-2)" }}
      >
        <ArrowLeft size={16} />
        Back to Leaderboard
      </button>

      {/* Profile card */}
      <div
        className="rounded-2xl px-8 py-8 mb-6 flex items-center gap-6"
        style={{
          background: "var(--surface)",
          border: `1px solid ${podiumStyle ? podiumStyle.border : "var(--border-mid)"}`,
        }}
      >
        <Avatar username={entry.username} avatarUrl={entry.avatarUrl} size={20} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold truncate" style={{ color: "var(--text-1)" }}>
              {entry.username}
            </h1>
            {entry.isCurrentUser && (
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "var(--gold)" }}
              >
                YOU
              </span>
            )}
          </div>
          <p className="font-mono text-sm" style={{ color: "var(--text-3)" }}>
            Rank #{entry.rank}
            {podiumStyle ? ` · ${podiumStyle.label}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className="font-mono font-bold text-2xl"
            style={{ color: podiumStyle ? podiumStyle.valueColor : "var(--text-1)" }}
          >
            ${fmt(entry.totalValue)}
          </p>
          <p className="font-mono text-sm mt-0.5" style={{ color: "var(--text-3)" }}>total value</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className="rounded-xl px-5 py-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--text-3)" }}>Cash</p>
          <p className="font-mono font-semibold text-lg" style={{ color: "var(--text-1)" }}>${fmt(entry.cashBalance)}</p>
        </div>
        <div
          className="rounded-xl px-5 py-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--text-3)" }}>Invested</p>
          <p className="font-mono font-semibold text-lg" style={{ color: "var(--text-1)" }}>${fmt(holdingsValue)}</p>
        </div>
      </div>

      {/* Portfolio */}
      <div className="mb-2">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: "var(--text-3)" }}>Portfolio</p>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-2)" }}>Holdings</h2>
      </div>

      {entry.holdings.length === 0 ? (
        <div
          className="rounded-xl px-6 py-10 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="font-mono text-sm" style={{ color: "var(--text-3)" }}>No holdings — all cash</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entry.holdings.map((h) => (
            <button
              key={h.symbol}
              onClick={() => setSelectedHolding(h)}
              className="w-full text-left rounded-xl px-5 py-4 flex items-center gap-4 transition-opacity hover:opacity-75 cursor-pointer"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
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
                <p className="font-mono font-semibold text-sm" style={{ color: "var(--text-2)" }}>${fmt(h.value)}</p>
                <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
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
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Entry | null>(null);

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

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username..."
          className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-mid)",
            color: "var(--text-1)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold-border)")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border-mid)")}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-16 font-mono text-sm" style={{ color: "var(--text-3)" }}>
          No traders found matching &quot;{search}&quot;
        </p>
      ) : (
        <>
          {/* Podium — Top 3 (hidden during search) */}
          {podium.length > 0 && (
            <div className="space-y-3 mb-3">
              {podium.map((entry) => {
                const s    = PODIUM[entry.rank as 1 | 2 | 3] ?? PODIUM[3];
                const isMe = entry.isCurrentUser;
                return (
                  <button
                    key={entry.username}
                    onClick={() => setSelected(entry)}
                    className="w-full text-left relative rounded-2xl px-8 py-7 flex items-center gap-6 transition-opacity hover:opacity-80 cursor-pointer"
                    style={{
                      background: "var(--surface)",
                      border: `1px solid ${s.border}`,
                      ...(entry.rank === 1 ? { animation: "rank1-aura 2.8s ease-in-out infinite" } : {}),
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0"
                      style={{
                        background: isMe ? "rgba(201,168,76,0.12)" : s.badgeBg,
                        border: `1px solid ${isMe ? "rgba(201,168,76,0.3)" : s.border}`,
                      }}
                    >
                      <span className="font-mono font-bold text-2xl leading-none" style={{ color: isMe ? "var(--gold-bright)" : s.badgeColor }}>
                        {entry.rank}
                      </span>
                      <span className="font-mono text-[10px] tracking-wider mt-1" style={{ color: isMe ? "var(--gold-dim)" : s.badgeColor, opacity: 0.7 }}>
                        {s.label}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <Avatar username={entry.username} avatarUrl={entry.avatarUrl} size={14} />
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <p className="font-semibold text-xl truncate" style={{ color: "var(--text-1)" }}>{entry.username}</p>
                        {isMe && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "var(--gold)" }}>YOU</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-2xl" style={{ color: isMe ? "var(--gold-bright)" : s.valueColor }}>${fmt(entry.totalValue)}</p>
                      <p className="font-mono text-sm tracking-wide mt-1" style={{ color: "var(--text-3)" }}>${fmt(entry.cashBalance)} cash</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Remaining */}
          {rest.length > 0 && (
            <div className="space-y-1.5 mb-12">
              {rest.map((entry) => (
                <button
                  key={entry.username}
                  onClick={() => setSelected(entry)}
                  className="w-full text-left rounded-xl px-6 py-5 flex items-center gap-5 transition-opacity hover:opacity-80 cursor-pointer"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span className="font-mono text-base w-10 shrink-0 tabular-nums" style={{ color: "var(--text-3)" }}>
                    #{entry.rank}
                  </span>
                  <Avatar username={entry.username} avatarUrl={entry.avatarUrl} size={10} />
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <p className="text-base font-medium truncate" style={{ color: "var(--text-2)" }}>{entry.username}</p>
                    {entry.isCurrentUser && <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--gold-dim)" }}>you</span>}
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-base" style={{ color: entry.isCurrentUser ? "var(--gold)" : "var(--text-2)" }}>${fmt(entry.totalValue)}</p>
                    <p className="font-mono text-xs" style={{ color: "var(--text-3)" }}>${fmt(entry.cashBalance)} cash</p>
                  </div>
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
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: "var(--text-3)" }}>Previous Week</p>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-2)" }}>Champions — {lastWeekDate}</h2>
          </div>
          <div className="space-y-2">
            {lastWeekTop3.map((entry) => (
              <div
                key={entry.username}
                className="rounded-xl px-5 py-3.5 flex items-center gap-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <span className="text-base w-8 text-center shrink-0">
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                </span>
                <p className="flex-1 text-sm truncate" style={{ color: "var(--text-3)" }}>{entry.username}</p>
                <p className="font-mono font-semibold text-sm" style={{ color: "var(--text-3)" }}>${fmt(entry.final_value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
