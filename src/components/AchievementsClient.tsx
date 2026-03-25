"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Rocket, TrendingUp, Globe, Gem, Zap, Shield,
  Trophy, Crown, Lock, Flame, Sparkles, Medal,
  Plus, Minus, Maximize2,
} from "lucide-react";

// ─── Layout constants ────────────────────────────────────────────────────────
const CELL_W  = 214;
const CELL_H  = 134;
const NODE_W  = 178;
const NODE_H  = 86;
const ICON_SZ = 54;
const PAD_X   = 80;
const PAD_Y   = 62;

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;

// ─── Types ───────────────────────────────────────────────────────────────────
type Rarity  = "common" | "uncommon" | "rare" | "epic";
type Status  = "unlocked" | "accessible" | "locked";

interface AchDef {
  id:       string;
  title:    string;
  desc:     string;
  hint:     string;
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
  {
    id: "first_trade", title: "The First Move",
    desc: "Executed your first trade. The market is now your battleground.",
    hint: "Make any trade to begin your journey.",
    Icon: Rocket, col: 4, row: 0, parents: [], rarity: "common", section: "trading",
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

const RARITY_CFG_LIGHT: Record<Rarity, { border: string; glow: string; text: string; label: string }> = {
  common:   { border: "#60a5fa", glow: "rgba(96,165,250,0.45)",  text: "#2563eb", label: "Common"   },
  uncommon: { border: "#3b82f6", glow: "rgba(59,130,246,0.50)",  text: "#1d4ed8", label: "Uncommon" },
  rare:     { border: "#2563eb", glow: "rgba(37,99,235,0.60)",   text: "#1e40af", label: "Rare"     },
  epic:     { border: "#1d4ed8", glow: "rgba(29,78,216,0.75)",   text: "#1e3a8a", label: "Epic"     },
};

function getRarity(rarity: Rarity, isLight: boolean) {
  return isLight ? RARITY_CFG_LIGHT[rarity] : RARITY_CFG[rarity];
}

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

function edgeColor(parentId: string, childId: string, unlocked: Set<string>, isLight: boolean): string {
  if (unlocked.has(parentId) && unlocked.has(childId)) return isLight ? "#2563eb" : "#c9a84c";
  if (unlocked.has(parentId)) return isLight ? "#93c5fd" : "#5a4020";
  return isLight ? "#cbd5e1" : "#2e2e2e";
}

function edgePath(parent: AchDef, child: AchDef): string {
  const p = nodeCenter(parent.col, parent.row);
  const c = nodeCenter(child.col, child.row);
  const py = p.y + NODE_H / 2 + 2;
  const cy = c.y - NODE_H / 2 - 2;
  const mid = (py + cy) / 2;
  return `M ${p.x} ${py} L ${p.x} ${mid} L ${c.x} ${mid} L ${c.x} ${cy}`;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

// ─── Achievement node ─────────────────────────────────────────────────────────
function AchNode({
  ach, status, onEnter, onLeave, isLight, isHovered,
}: {
  ach: AchDef;
  status: Status;
  onEnter: (id: string) => void;
  onLeave: () => void;
  isLight: boolean;
  isHovered: boolean;
}) {
  const { x, y } = nodeCenter(ach.col, ach.row);
  const r = getRarity(ach.rarity, isLight);
  const borderC = status === "unlocked"
    ? r.border
    : status === "accessible"
      ? `${r.border}99`
      : `${r.border}50`;
  const bg = isLight
    ? status === "unlocked" ? "#dbeafe" : status === "accessible" ? "#f8fbff" : "#f1f5f9"
    : status === "unlocked" ? "#2a1f06" : status === "accessible" ? "#161410" : "#0f0e0c";
  const opacity = status === "locked" ? 0.78 : 1;
  const glow = isHovered
    ? `0 0 32px ${r.glow}, 0 0 0 1.5px ${r.border}`
    : status === "unlocked"
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
        transform: isHovered ? "scale(1.08)" : "scale(1)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        zIndex: isHovered ? 10 : 1,
      }}
    >
      {(status === "unlocked" || status === "accessible") && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: status === "unlocked"
            ? `linear-gradient(90deg, transparent, ${r.border}99, transparent)`
            : `linear-gradient(90deg, transparent, ${r.border}55, transparent)`,
        }} />
      )}

      <div style={{ display: "flex", height: "100%", alignItems: "center" }}>
        <div style={{
          width: ICON_SZ, height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          background: status === "unlocked" ? `${r.border}28` : status === "accessible" ? `${r.border}14` : isLight ? "#e8e4da" : "#1a1815",
          borderRight: `1px solid ${borderC}`,
        }}>
          {status === "locked"
            ? <Lock size={17} color={`${r.border}90`} strokeWidth={1.5} />
            : <ach.Icon size={20} color={status === "unlocked" ? r.text : `${r.text}80`} strokeWidth={1.5} />
          }
        </div>

        <div style={{ flex: 1, padding: "8px 10px", overflow: "hidden" }}>
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
            color: isLight
              ? status === "unlocked" ? "#475569" : status === "accessible" ? "#64748b" : "#94a3b8"
              : status === "unlocked" ? "#9a8060" : status === "accessible" ? "#6a5a45" : "#4a3e30",
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

      {status !== "unlocked" && (
        <div style={{
          position: "absolute", bottom: 4, right: 5,
          opacity: status === "accessible" ? 0.5 : 0.35,
          pointerEvents: "none",
        }}>
          <Lock size={8} color={r.border} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface UnlockedRecord { achievement_id: string; unlocked_at: string; }

export default function AchievementsClient({
  unlockedAchievements,
  userId,
}: {
  unlockedAchievements: UnlockedRecord[];
  tradeCount: number;
  userId: string;
}) {
  const router = useRouter();
  const unlockedSet = new Set(unlockedAchievements.map(r => r.achievement_id));
  const totalUnlocked = unlockedAchievements.length;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLight, setIsLight] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.85 });

  // Theme detection
  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Real-time achievement refresh
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`ach:${userId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "user_achievements",
        filter: `user_id=eq.${userId}`,
      }, () => { router.refresh(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, router]);

  // ── Refs ────────────────────────────────────────────────────────────────────
  const vpRef          = useRef<HTMLDivElement>(null);
  const panning        = useRef(false);
  const panStart       = useRef({ mx: 0, my: 0, tx: 0, ty: 0 });
  const activePointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPinchDist  = useRef<number | null>(null);

  // ── Zoom helper ─────────────────────────────────────────────────────────────
  const applyZoom = useCallback((factor: number, cx: number, cy: number) => {
    setTransform(t => {
      const newScale = clamp(t.scale * factor, MIN_SCALE, MAX_SCALE);
      const ratio = newScale / t.scale;
      return { scale: newScale, x: cx - ratio * (cx - t.x), y: cy - ratio * (cy - t.y) };
    });
  }, []);

  // ── Reset / center view ─────────────────────────────────────────────────────
  const resetView = useCallback(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const { x: fx, y: fy } = nodeCenter(4, 0);
    const scale = 0.85;
    setTransform({
      scale,
      x: vp.clientWidth  / 2 - fx * scale,
      y: vp.clientHeight / 3 - fy * scale,
    });
  }, []);

  // Center on mount
  useEffect(() => { resetView(); }, [resetView]);

  // ── Scroll-to-zoom (non-passive so we can preventDefault) ───────────────────
  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      applyZoom(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - rect.left, e.clientY - rect.top);
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [applyZoom]);

  // ── Pointer events (drag + pinch) ───────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    vpRef.current!.setPointerCapture(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size === 1) {
      panning.current = true;
      setTransform(t => {
        panStart.current = { mx: e.clientX, my: e.clientY, tx: t.x, ty: t.y };
        return t;
      });
      vpRef.current!.style.cursor = "grabbing";
    } else {
      panning.current = false;
      const pts = [...activePointers.current.values()];
      lastPinchDist.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!activePointers.current.has(e.pointerId)) return;
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.current.size >= 2) {
      // Pinch zoom
      const pts = [...activePointers.current.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (lastPinchDist.current !== null && dist > 0) {
        const rect = vpRef.current!.getBoundingClientRect();
        const cx = (pts[0].x + pts[1].x) / 2 - rect.left;
        const cy = (pts[0].y + pts[1].y) / 2 - rect.top;
        applyZoom(dist / lastPinchDist.current, cx, cy);
      }
      lastPinchDist.current = dist;
    } else if (panning.current) {
      // Drag pan
      setTransform(t => ({
        ...t,
        x: panStart.current.tx + (e.clientX - panStart.current.mx),
        y: panStart.current.ty + (e.clientY - panStart.current.my),
      }));
    }
  }, [applyZoom]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);
    if (activePointers.current.size < 2) lastPinchDist.current = null;
    if (activePointers.current.size === 0) {
      panning.current = false;
      if (vpRef.current) vpRef.current.style.cursor = "grab";
    }
  }, []);

  // ── Build edges ─────────────────────────────────────────────────────────────
  const edges = ACH.flatMap(ach =>
    ach.parents.map(pid => {
      const parent = ACH_MAP.get(pid);
      if (!parent) return null;
      return {
        key:    `${pid}-${ach.id}`,
        path:   edgePath(parent, ach),
        color:  edgeColor(pid, ach.id, unlockedSet, isLight),
        dashed: !unlockedSet.has(pid),
      };
    }).filter(Boolean)
  ) as Array<{ key: string; path: string; color: string; dashed: boolean }>;

  const divX = PAD_X + 8.5 * CELL_W;

  const btnStyle: React.CSSProperties = {
    width: 32, height: 32,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 8,
    background: isLight ? "rgba(255,255,255,0.85)" : "rgba(20,18,12,0.85)",
    border: `1px solid ${isLight ? "#cbd5e1" : "#333"}`,
    color: isLight ? "#475569" : "#999",
    cursor: "pointer",
    backdropFilter: "blur(8px)",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 56px)" }}>

      {/* Viewport */}
      <div
        ref={vpRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: "grab",
          background: isLight ? "#eef4fb" : "#0e0d0a",
          backgroundImage: isLight
            ? "radial-gradient(rgba(37,99,235,0.12) 1px, transparent 1px)"
            : "radial-gradient(rgba(201,168,76,0.09) 1px, transparent 1px)",
          backgroundSize: `${22 * transform.scale}px ${22 * transform.scale}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`,
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {/* Canvas — moved via CSS transform */}
        <div style={{
          position: "absolute",
          width: CANVAS_W,
          height: CANVAS_H,
          transformOrigin: "0 0",
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          willChange: "transform",
        }}>
          <svg
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            width={CANVAS_W}
            height={CANVAS_H}
          >
            <line
              x1={divX} y1={PAD_Y / 2} x2={divX} y2={CANVAS_H - PAD_Y / 2}
              stroke={isLight ? "#bfdbfe" : "#333322"} strokeWidth={1} strokeDasharray="6 4"
            />
            <text x={PAD_X + 3.5 * CELL_W} y={PAD_Y / 2 - 4}
              textAnchor="middle" fontSize={9}
              style={{ fill: isLight ? "#64748b" : "#6a5a30" }}
              fontFamily="monospace" letterSpacing="3">
              TRADING MASTERY
            </text>
            <text x={PAD_X + 10 * CELL_W + CELL_W / 2} y={PAD_Y / 2 - 4}
              textAnchor="middle" fontSize={9}
              style={{ fill: isLight ? "#64748b" : "#6a5a30" }}
              fontFamily="monospace" letterSpacing="3">
              COMPETITION
            </text>
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
            {ACH.map(ach => {
              const st = getStatus(ach.id, unlockedSet);
              if (st !== "unlocked") return null;
              const { x, y } = nodeCenter(ach.col, ach.row);
              return (
                <circle key={`dot-${ach.id}`} cx={x} cy={y - NODE_H / 2 - 2} r={2.5}
                  fill={getRarity(ach.rarity, isLight).border} />
              );
            })}
          </svg>

          {ACH.map(ach => (
            <AchNode
              key={ach.id}
              ach={ach}
              status={getStatus(ach.id, unlockedSet)}
              onEnter={setHoveredId}
              onLeave={() => setHoveredId(null)}
              isLight={isLight}
              isHovered={hoveredId === ach.id}
            />
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div style={{
        position: "absolute", bottom: 20, right: 20, zIndex: 20,
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        <button style={btnStyle} onClick={() => {
          const vp = vpRef.current!;
          const rect = vp.getBoundingClientRect();
          applyZoom(1.25, rect.width / 2, rect.height / 2);
        }} title="Zoom in">
          <Plus size={14} />
        </button>
        <button style={btnStyle} onClick={resetView} title="Reset view">
          <Maximize2 size={13} />
        </button>
        <button style={btnStyle} onClick={() => {
          const vp = vpRef.current!;
          const rect = vp.getBoundingClientRect();
          applyZoom(1 / 1.25, rect.width / 2, rect.height / 2);
        }} title="Zoom out">
          <Minus size={14} />
        </button>
      </div>

      {/* Scale indicator */}
      <div style={{
        position: "absolute", bottom: 24, left: 20, zIndex: 20,
        fontFamily: "monospace", fontSize: 10,
        color: isLight ? "#94a3b8" : "#555",
        pointerEvents: "none",
      }}>
        {Math.round(transform.scale * 100)}% · {totalUnlocked}/{ACH.length} unlocked
      </div>
    </div>
  );
}
