"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Rocket, TrendingUp, Globe, Gem, Zap, Shield,
  Trophy, Crown, Lock, Flame, Sparkles, Medal,
} from "lucide-react";

// ─── Layout constants ────────────────────────────────────────────────────────
const CELL_W  = 214;   // horizontal spacing per column
const CELL_H  = 134;   // vertical spacing per row
const NODE_W  = 178;   // node card width
const NODE_H  = 86;    // node card height
const ICON_SZ = 54;    // icon box width
const PAD_X   = 80;
const PAD_Y   = 62;
const VP_H    = 560;   // viewport height

// ─── Types ───────────────────────────────────────────────────────────────────
type Rarity  = "common" | "uncommon" | "rare" | "epic";
type Status  = "unlocked" | "accessible" | "locked";

interface AchDef {
  id:       string;
  title:    string;
  desc:     string;   // shown when unlocked
  hint:     string;   // shown when locked
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon:     any;
  col:      number;
  row:      number;
  parents:  string[];
  rarity:   Rarity;
  section:  "trading" | "competition";
}

// ─── Achievement definitions ─────────────────────────────────────────────────
const ACH: AchDef[] = [
  // ── Trading tree ──────────────────────────────────────────────────────────
  {
    id: "first_trade", title: "The First Move",
    desc: "Executed your first trade. The market is now your battleground.",
    hint: "Make any trade to begin your journey.",
    Icon: Rocket,  col: 4, row: 0, parents: [], rarity: "common", section: "trading",
  },
  {
    id: "ten_trades", title: "Momentum",
    desc: "10 trades completed. You're building rhythm in the market.",
    hint: "Complete 10 total trades.",
    Icon: TrendingUp, col: 2, row: 2, parents: ["first_trade"], rarity: "uncommon", section: "trading",
  },
  {
    id: "diversified", title: "All Markets",
    desc: "Crypto, stocks, and a commodity — held simultaneously. Spread thin, never broke.",
    hint: "Hold all three asset types at once.",
    Icon: Globe, col: 4, row: 2, parents: ["first_trade"], rarity: "uncommon", section: "trading",
  },
  {
    id: "diamond_hands", title: "Iron Grip",
    desc: "Held a position for a full week without flinching. The market tested you — you held.",
    hint: "Hold any position for one full week.",
    Icon: Gem, col: 6, row: 2, parents: ["first_trade"], rarity: "uncommon", section: "trading",
  },
  {
    id: "hundred_trades", title: "Centurion",
    desc: "100 total trades. You don't visit the market — you live here.",
    hint: "Complete 100 total trades.",
    Icon: Flame, col: 1, row: 4, parents: ["ten_trades"], rarity: "rare", section: "trading",
  },
  {
    id: "day_trader", title: "The Blitz",
    desc: "5 trades in a single day. Speed is your sharpest edge.",
    hint: "Execute 5+ trades within 24 hours.",
    Icon: Zap, col: 3, row: 4, parents: ["ten_trades"], rarity: "rare", section: "trading",
  },
  {
    id: "comeback", title: "Phoenix",
    desc: "Down −20% and still came back to finish the week positive. Absolute legend.",
    hint: "Recover from −20% to finish the week positive.",
    Icon: Sparkles, col: 5, row: 4, parents: ["diversified"], rarity: "epic", section: "trading",
  },
  {
    id: "weekly_reset", title: "Battle-Hardened",
    desc: "Survived 4 weekly resets. Every phase of the market — and you kept going.",
    hint: "Survive 4 weekly resets.",
    Icon: Shield, col: 7, row: 4, parents: ["diamond_hands"], rarity: "rare", section: "trading",
  },
  // ── Competition tree ──────────────────────────────────────────────────────
  {
    id: "top_10", title: "The Elite Ten",
    desc: "Reached the global top 10. You are in rarified air.",
    hint: "Climb to the global top 10.",
    Icon: Trophy, col: 10, row: 0, parents: [], rarity: "rare", section: "competition",
  },
  {
    id: "top_3", title: "The Podium",
    desc: "Global top 3. The crowd has turned to watch you.",
    hint: "Break into the global top 3.",
    Icon: Medal, col: 10, row: 2, parents: ["top_10"], rarity: "epic", section: "competition",
  },
  {
    id: "league_winner", title: "League Tyrant",
    desc: "Finished #1 in a private league. Absolutely, undeniably dominant.",
    hint: "Win a private league outright.",
    Icon: Crown, col: 10, row: 4, parents: ["top_3"], rarity: "epic", section: "competition",
  },
];

const ACH_MAP = new Map(ACH.map(a => [a.id, a]));
const MAX_COL = Math.max(...ACH.map(a => a.col));
const MAX_ROW = Math.max(...ACH.map(a => a.row));
const CANVAS_W = PAD_X * 2 + (MAX_COL + 1) * CELL_W;
const CANVAS_H = PAD_Y * 2 + (MAX_ROW + 1) * CELL_H;

// ─── Rarity config ────────────────────────────────────────────────────────────
const RARITY_CFG: Record<Rarity, { border: string; glow: string; text: string; label: string }> = {
  common:   { border: "#6a541e", glow: "rgba(106,84,30,0.5)",   text: "#b09040", label: "Common"   },
  uncommon: { border: "#a87c28", glow: "rgba(168,124,40,0.55)", text: "#d4aa58", label: "Uncommon" },
  rare:     { border: "#c9a84c", glow: "rgba(201,168,76,0.65)", text: "#f0cc70", label: "Rare"     },
  epic:     { border: "#e8c66a", glow: "rgba(232,198,106,0.8)", text: "#fff8b0", label: "Epic"     },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nodeCenter(col: number, row: number) {
  return {
    x: PAD_X + col * CELL_W + CELL_W / 2,
    y: PAD_Y + row * CELL_H + CELL_H / 2,
  };
}

function getStatus(id: string, unlocked: Set<string>): Status {
  if (unlocked.has(id)) return "unlocked";
  const ach = ACH_MAP.get(id);
  if (!ach || ach.parents.every(p => unlocked.has(p))) return "accessible";
  return "locked";
}

function edgeColor(parentId: string, childId: string, unlocked: Set<string>): string {
  if (unlocked.has(parentId) && unlocked.has(childId)) return "#c9a84c";
  if (unlocked.has(parentId)) return "#5a4020";
  return "#2e2e2e";
}

function edgePath(parent: AchDef, child: AchDef): string {
  const p = nodeCenter(parent.col, parent.row);
  const c = nodeCenter(child.col, child.row);
  const py = p.y + NODE_H / 2 + 2;
  const cy = c.y - NODE_H / 2 - 2;
  const mid = (py + cy) / 2;
  return `M ${p.x} ${py} L ${p.x} ${mid} L ${c.x} ${mid} L ${c.x} ${cy}`;
}

// ─── Achievement node ─────────────────────────────────────────────────────────
function AchNode({
  ach, status, onEnter, onLeave,
}: {
  ach: AchDef;
  status: Status;
  onEnter: (id: string) => void;
  onLeave: () => void;
}) {
  const { x, y } = nodeCenter(ach.col, ach.row);
  const r = RARITY_CFG[ach.rarity];
  const borderC = status === "unlocked"
    ? r.border
    : status === "accessible"
      ? `${r.border}99`
      : `${r.border}50`;
  const bg      = status === "unlocked" ? "#1c1808" : status === "accessible" ? "#161410" : "#131210";
  const opacity = status === "locked" ? 0.78 : 1;
  const glow    = status === "unlocked"
    ? `0 0 24px ${r.glow}, 0 0 0 1px ${r.border}50`
    : status === "accessible"
      ? `0 0 12px ${r.border}30, 0 0 0 1px ${r.border}28`
      : `0 0 6px ${r.border}18`;

  return (
    <div
      onMouseEnter={() => onEnter(ach.id)}
      onMouseLeave={onLeave}
      style={{
        position: "absolute",
        left: x - NODE_W / 2,
        top:  y - NODE_H / 2,
        width: NODE_W,
        height: NODE_H,
        background: bg,
        border: `1px solid ${borderC}`,
        borderRadius: 8,
        opacity,
        boxShadow: glow,
        overflow: "hidden",
        cursor: "default",
        userSelect: "none",
      }}
    >
      {/* Top shimmer line */}
      {(status === "unlocked" || status === "accessible") && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: status === "unlocked"
            ? `linear-gradient(90deg, transparent, ${r.border}99, transparent)`
            : `linear-gradient(90deg, transparent, ${r.border}55, transparent)`,
        }} />
      )}

      <div style={{ display: "flex", height: "100%", alignItems: "center" }}>
        {/* Icon */}
        <div style={{
          width: ICON_SZ, height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          background: status === "unlocked" ? `${r.border}28` : status === "accessible" ? `${r.border}14` : "#1a1815",
          borderRight: `1px solid ${borderC}`,
        }}>
          {status === "locked"
            ? <Lock size={17} color={`${r.border}90`} strokeWidth={1.5} />
            : <ach.Icon size={20} color={status === "unlocked" ? r.text : `${r.text}80`} strokeWidth={1.5} />
          }
        </div>

        {/* Text */}
        <div style={{ flex: 1, padding: "8px 10px 8px 10px", overflow: "hidden" }}>
          <div style={{
            fontFamily: "var(--font-geist-mono)",
            fontWeight: 700,
            fontSize: 10.5,
            letterSpacing: "0.05em",
            lineHeight: 1.2,
            marginBottom: 4,
            color: status === "unlocked" ? r.text : status === "accessible" ? `${r.text}90` : `${r.text}60`,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {ach.title}
          </div>
          <div style={{
            fontSize: 9.5,
            lineHeight: 1.35,
            color: status === "unlocked" ? "#9a8060" : status === "accessible" ? "#6a5a45" : "#4a3e30",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            fontFamily: "var(--font-geist-sans)",
          }}>
            {status === "unlocked" ? ach.desc : ach.hint}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface UnlockedRecord { achievement_id: string; unlocked_at: string; }

export default function AchievementsClient({
  unlockedAchievements,
}: {
  unlockedAchievements: UnlockedRecord[];
  tradeCount: number;
}) {
  const unlockedSet = new Set(unlockedAchievements.map(r => r.achievement_id));
  const unlockedMap = new Map(unlockedAchievements.map(r => [r.achievement_id, r.unlocked_at]));
  const totalUnlocked = unlockedAchievements.length;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredAch = hoveredId ? ACH_MAP.get(hoveredId) : null;

  // Drag-to-pan
  const vpRef    = useRef<HTMLDivElement>(null);
  const panning  = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, sl: 0, st: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    panning.current = true;
    panStart.current = { mx: e.clientX, my: e.clientY, sl: vpRef.current!.scrollLeft, st: vpRef.current!.scrollTop };
    vpRef.current!.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!panning.current || !vpRef.current) return;
    vpRef.current.scrollLeft = panStart.current.sl - (e.clientX - panStart.current.mx);
    vpRef.current.scrollTop  = panStart.current.st - (e.clientY - panStart.current.my);
  }, []);

  const onPointerUp = useCallback(() => { panning.current = false; }, []);

  // Center on first_trade on mount
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const { x, y } = nodeCenter(4, 0);
    vp.scrollLeft = x - vp.clientWidth / 2;
    vp.scrollTop  = Math.max(0, y - VP_H / 3);
  }, []);

  // Build edges
  const edges = ACH.flatMap(ach =>
    ach.parents.map(pid => {
      const parent = ACH_MAP.get(pid);
      if (!parent) return null;
      return {
        key:    `${pid}-${ach.id}`,
        path:   edgePath(parent, ach),
        color:  edgeColor(pid, ach.id, unlockedSet),
        dashed: !unlockedSet.has(pid),
      };
    }).filter(Boolean)
  ) as Array<{ key: string; path: string; color: string; dashed: boolean }>;

  // Divider x between trading (max col 7) and competition (col 10)
  const divX = PAD_X + 8.5 * CELL_W;

  // Detail panel content
  const detailStatus  = hoveredAch ? getStatus(hoveredAch.id, unlockedSet) : null;
  const detailUnlockedAt = hoveredId ? unlockedMap.get(hoveredId) : undefined;
  const detailRarity  = hoveredAch ? RARITY_CFG[hoveredAch.rarity] : null;

  return (
    <div className="max-w-full px-3 sm:px-6 py-8 sm:py-10">

      {/* ── Panel header ────────────────────────────────────── */}
      <div
        className="max-w-3xl mx-auto mb-6 rounded-2xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border-mid)" }}
      >
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--gold-dim) 20%, var(--gold) 50%, var(--gold-dim) 80%, transparent)" }} />
        <div className="px-8 py-5 flex items-center gap-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid var(--gold-border)" }}
          >
            <Trophy size={24} style={{ color: "var(--gold)" }} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] tracking-[0.28em] uppercase mb-0.5" style={{ color: "var(--text-3)" }}>Hall of Records</p>
            <h1 className="font-playfair text-2xl font-bold text-gold-glow mb-2">Achievements</h1>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(totalUnlocked / ACH.length) * 100}%`,
                    background: "linear-gradient(90deg, var(--gold-dim), var(--gold), var(--gold-bright))",
                  }}
                />
              </div>
              <span className="font-mono text-xs shrink-0" style={{ color: "var(--gold)" }}>
                {totalUnlocked} / {ACH.length}
              </span>
            </div>
          </div>
        </div>
        <div className="px-8 pb-4">
          <p className="font-mono text-[10px]" style={{ color: "var(--text-3)", opacity: 0.6 }}>
            ← Drag to explore the tree · Hover an achievement for details
          </p>
        </div>
      </div>

      {/* ── Tree viewport ────────────────────────────────────── */}
      <div
        ref={vpRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          width: "100%",
          height: VP_H,
          overflow: "hidden",
          cursor: panning.current ? "grabbing" : "grab",
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "#0e0d0a",
          backgroundImage: "radial-gradient(rgba(201,168,76,0.09) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H }}>

          {/* SVG: edges + labels + divider */}
          <svg
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            width={CANVAS_W}
            height={CANVAS_H}
          >
            {/* Divider line */}
            <line
              x1={divX} y1={PAD_Y / 2} x2={divX} y2={CANVAS_H - PAD_Y / 2}
              stroke="#333322" strokeWidth={1} strokeDasharray="6 4"
            />

            {/* Section labels */}
            <text x={PAD_X + 3.5 * CELL_W} y={PAD_Y / 2 - 4}
              textAnchor="middle" fill="#6a5a30" fontSize={9}
              fontFamily="monospace" letterSpacing="3">
              TRADING MASTERY
            </text>
            <text x={PAD_X + 10 * CELL_W + CELL_W / 2} y={PAD_Y / 2 - 4}
              textAnchor="middle" fill="#6a5a30" fontSize={9}
              fontFamily="monospace" letterSpacing="3">
              COMPETITION
            </text>

            {/* Edges */}
            {edges.map(e => (
              <path
                key={e.key}
                d={e.path}
                stroke={e.color}
                strokeWidth={e.dashed ? 1 : 1.5}
                strokeDasharray={e.dashed ? "5 4" : undefined}
                fill="none"
                strokeLinecap="square"
              />
            ))}

            {/* Gold dot on unlocked node centers */}
            {ACH.map(ach => {
              const st = getStatus(ach.id, unlockedSet);
              if (st !== "unlocked") return null;
              const { x, y } = nodeCenter(ach.col, ach.row);
              return (
                <circle key={`dot-${ach.id}`} cx={x} cy={y - NODE_H / 2 - 2} r={2.5}
                  fill={RARITY_CFG[ach.rarity].border} />
              );
            })}
          </svg>

          {/* Achievement nodes */}
          {ACH.map(ach => (
            <AchNode
              key={ach.id}
              ach={ach}
              status={getStatus(ach.id, unlockedSet)}
              onEnter={setHoveredId}
              onLeave={() => setHoveredId(null)}
            />
          ))}
        </div>
      </div>

      {/* ── Detail panel ─────────────────────────────────────── */}
      <div
        className="max-w-3xl mx-auto mt-4 rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: "var(--surface)",
          border: hoveredAch
            ? `1px solid ${detailRarity!.border}55`
            : "1px solid var(--border)",
          minHeight: 90,
        }}
      >
        {hoveredAch && detailStatus ? (
          <div className="flex items-center gap-5 px-6 py-5">
            {/* Large icon */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: detailStatus === "unlocked" ? `${detailRarity!.border}18` : "var(--elevated)",
                border: `1px solid ${detailStatus === "unlocked" ? detailRarity!.border : "var(--border-mid)"}55`,
              }}
            >
              {detailStatus === "locked"
                ? <Lock size={22} style={{ color: "var(--text-3)" }} strokeWidth={1.5} />
                : <hoveredAch.Icon size={24} color={detailStatus === "unlocked" ? detailRarity!.text : "var(--text-3)"} strokeWidth={1.5} />
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono font-bold text-sm" style={{ color: detailStatus === "unlocked" ? detailRarity!.text : "var(--text-2)" }}>
                  {hoveredAch.title}
                </span>
                {detailStatus === "unlocked" && (
                  <span
                    className="font-mono text-[9px] tracking-[0.18em] uppercase px-1.5 py-0.5 rounded"
                    style={{
                      background: `${detailRarity!.border}18`,
                      border: `1px solid ${detailRarity!.border}44`,
                      color: detailRarity!.text,
                    }}
                  >
                    {detailRarity!.label}
                  </span>
                )}
                {detailStatus === "accessible" && (
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase px-1.5 py-0.5 rounded"
                    style={{ background: "var(--elevated)", border: "1px solid var(--border-mid)", color: "var(--text-3)" }}>
                    Available
                  </span>
                )}
                {detailStatus === "locked" && (
                  <span className="font-mono text-[9px] tracking-[0.18em] uppercase px-1.5 py-0.5 rounded"
                    style={{ background: "var(--elevated)", border: "1px solid var(--border)", color: "var(--text-3)" }}>
                    Locked
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                {detailStatus === "unlocked" ? hoveredAch.desc : hoveredAch.hint}
              </p>
              {detailStatus === "unlocked" && detailUnlockedAt && (
                <p className="font-mono text-[10px] mt-1.5" style={{ color: "var(--text-3)", opacity: 0.6 }}>
                  Unlocked {new Date(detailUnlockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
              {detailStatus !== "unlocked" && hoveredAch.parents.length > 0 && (
                <p className="font-mono text-[10px] mt-1.5" style={{ color: "var(--text-3)", opacity: 0.6 }}>
                  Requires: {hoveredAch.parents.map(pid => ACH_MAP.get(pid)?.title).filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 py-7 text-center">
            <p className="font-mono text-xs" style={{ color: "var(--text-3)", opacity: 0.5 }}>
              Hover an achievement to see its details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
