"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  TrendingUp,
  Globe,
  Trophy,
  Crown,
  Gem,
  Zap,
  Shield,
  Lock,
  Star,
} from "lucide-react";

// ─── Achievement definitions ───────────────────────────────────────────────

type Rarity = "common" | "uncommon" | "rare" | "epic";

interface AchievementDef {
  id: string;
  title: string;
  hint: string;         // shown when locked
  desc: string;         // shown when unlocked
  Icon: React.ElementType;
  rarity: Rarity;
  category: string;
}

const CATEGORIES = ["Origins", "The Arena", "Legends"] as const;

const ACHIEVEMENTS: AchievementDef[] = [
  // ─ Origins ───────────────────────────────────────────────
  {
    id: "first_trade",
    title: "First Trade",
    hint: "Make your first move.",
    desc: "You executed your first buy. The journey begins.",
    Icon: Rocket,
    rarity: "common",
    category: "Origins",
  },
  {
    id: "ten_trades",
    title: "Volume Trader",
    hint: "Keep trading to unlock.",
    desc: "10 total transactions completed. You're building momentum.",
    Icon: TrendingUp,
    rarity: "uncommon",
    category: "Origins",
  },
  {
    id: "diversified",
    title: "Diversified",
    hint: "Spread across every market.",
    desc: "Holding crypto, stocks, and a commodity at the same time.",
    Icon: Globe,
    rarity: "rare",
    category: "Origins",
  },
  // ─ The Arena ─────────────────────────────────────────────
  {
    id: "top_10",
    title: "Top 10",
    hint: "Climb the global leaderboard.",
    desc: "Reached the top 10 on the global leaderboard. Elite territory.",
    Icon: Trophy,
    rarity: "rare",
    category: "The Arena",
  },
  {
    id: "league_winner",
    title: "League Champion",
    hint: "Win a private league.",
    desc: "Finished #1 in a private league. Undisputed.",
    Icon: Crown,
    rarity: "epic",
    category: "The Arena",
  },
  // ─ Legends ───────────────────────────────────────────────
  {
    id: "diamond_hands",
    title: "Diamond Hands",
    hint: "Hold on through the storm.",
    desc: "Held a position for a full week without selling. Unshakeable.",
    Icon: Gem,
    rarity: "uncommon",
    category: "Legends",
  },
  {
    id: "comeback",
    title: "Comeback Kid",
    hint: "Rise from the ashes.",
    desc: "Recovered from −20% to finish the week positive. Legendary.",
    Icon: Zap,
    rarity: "epic",
    category: "Legends",
  },
  {
    id: "weekly_reset",
    title: "Veteran",
    hint: "Survive the long game.",
    desc: "Lived through 4 weekly resets. Seasoned and battle-hardened.",
    Icon: Shield,
    rarity: "rare",
    category: "Legends",
  },
];

// ─── Rarity config ─────────────────────────────────────────────────────────

const RARITY_CONFIG: Record<
  Rarity,
  { label: string; borderColor: string; glowColor: string; iconBg: string; badgeClass: string }
> = {
  common: {
    label: "Common",
    borderColor: "var(--gold-dim)",
    glowColor: "rgba(138, 111, 53, 0.25)",
    iconBg: "rgba(138, 111, 53, 0.15)",
    badgeClass: "text-[var(--gold-dim)]",
  },
  uncommon: {
    label: "Uncommon",
    borderColor: "var(--gold)",
    glowColor: "rgba(201, 168, 76, 0.3)",
    iconBg: "rgba(201, 168, 76, 0.15)",
    badgeClass: "text-[var(--gold)]",
  },
  rare: {
    label: "Rare",
    borderColor: "var(--gold-bright)",
    glowColor: "rgba(232, 198, 106, 0.35)",
    iconBg: "rgba(232, 198, 106, 0.18)",
    badgeClass: "text-[var(--gold-bright)]",
  },
  epic: {
    label: "Epic",
    borderColor: "#e8c66a",
    glowColor: "rgba(232, 198, 106, 0.5)",
    iconBg: "rgba(232, 198, 106, 0.22)",
    badgeClass: "text-[#e8c66a]",
  },
};

// ─── Sparkle burst ─────────────────────────────────────────────────────────

function Sparkles() {
  const sparks = [
    { x: -18, y: -18, delay: 0 },
    { x: 18,  y: -18, delay: 0.15 },
    { x: -18, y: 18,  delay: 0.3 },
    { x: 18,  y: 18,  delay: 0.45 },
    { x: 0,   y: -22, delay: 0.1 },
    { x: 0,   y: 22,  delay: 0.35 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full"
          style={{ background: "var(--gold-bright)", translateX: "-50%", translateY: "-50%" }}
          animate={{
            x: [0, s.x * 2.5],
            y: [0, s.y * 2.5],
            opacity: [0, 1, 0],
            scale: [0, 1.4, 0],
          }}
          transition={{
            duration: 1.2,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Single achievement tile ────────────────────────────────────────────────

interface TileProps {
  def: AchievementDef;
  unlocked: boolean;
  unlockedAt: string | null;
  index: number;
}

function AchievementTile({ def, unlocked, unlockedAt, index }: TileProps) {
  const r = RARITY_CONFIG[def.rarity];
  const isNew =
    unlocked && unlockedAt
      ? Date.now() - new Date(unlockedAt).getTime() < 7 * 24 * 60 * 60 * 1000
      : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: "easeOut" }}
      whileHover={unlocked ? { scale: 1.025, y: -2 } : { scale: 1.01 }}
      className="relative rounded-xl overflow-hidden cursor-default"
      style={{
        background: unlocked
          ? `linear-gradient(135deg, var(--surface) 0%, var(--elevated) 100%)`
          : "var(--surface)",
        border: `1px solid ${unlocked ? r.borderColor : "var(--border)"}`,
        boxShadow: unlocked
          ? `0 0 20px ${r.glowColor}, inset 0 1px 0 rgba(255,255,255,0.04)`
          : "none",
        opacity: unlocked ? 1 : 0.45,
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* Shimmer sweep on unlocked */}
      {unlocked && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 35%, rgba(232,198,106,0.08) 50%, transparent 65%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
        />
      )}

      {/* Top accent line */}
      {unlocked && (
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${r.borderColor} 40%, ${r.borderColor} 60%, transparent)`,
            opacity: 0.7,
          }}
        />
      )}

      <div className="relative flex items-center gap-4 px-5 py-4">
        {/* Icon box */}
        <div
          className="relative shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            background: unlocked ? r.iconBg : "var(--elevated)",
            border: `1px solid ${unlocked ? r.borderColor : "var(--border)"}`,
          }}
        >
          {unlocked ? (
            <>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(() => { const I = def.Icon as any; return <I size={24} style={{ color: r.borderColor }} strokeWidth={1.5} />; })()}
              {isNew && <Sparkles />}
            </>
          ) : (
            <Lock size={20} style={{ color: "var(--text-3)" }} strokeWidth={1.5} />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p
              className="font-mono font-bold text-sm tracking-wide"
              style={{ color: unlocked ? r.borderColor : "var(--text-3)" }}
            >
              {def.title}
            </p>
            {unlocked && (
              <span
                className={`font-mono text-[9px] tracking-[0.18em] uppercase px-1.5 py-0.5 rounded-md ${r.badgeClass}`}
                style={{ background: r.iconBg, border: `1px solid ${r.borderColor}`, opacity: 0.9 }}
              >
                {r.label}
              </span>
            )}
            {isNew && (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="font-mono text-[9px] tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-md"
                style={{
                  background: "rgba(201,168,76,0.2)",
                  border: "1px solid var(--gold)",
                  color: "var(--gold)",
                }}
              >
                NEW
              </motion.span>
            )}
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
            {unlocked ? def.desc : def.hint}
          </p>

          {unlocked && unlockedAt && (
            <p className="font-mono text-[10px] mt-1.5" style={{ color: "var(--text-3)" }}>
              Unlocked{" "}
              {new Date(unlockedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Epic glow orb */}
        {unlocked && def.rarity === "epic" && (
          <motion.div
            className="absolute -right-6 -top-6 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(232,198,106,0.12) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ─── Category header ────────────────────────────────────────────────────────

function CategoryHeader({ label, total, unlocked }: { label: string; total: number; unlocked: number }) {
  const pct = total > 0 ? (unlocked / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="h-px flex-1" style={{ background: "var(--border-mid)" }} />
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="font-mono text-[10px] tracking-[0.28em] uppercase"
          style={{ color: "var(--text-3)" }}
        >
          {label}
        </span>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-16 h-1 rounded-full overflow-hidden"
            style={{ background: "var(--border-mid)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--gold-dim), var(--gold))" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            />
          </div>
          <span className="font-mono text-[9px]" style={{ color: "var(--text-3)" }}>
            {unlocked}/{total}
          </span>
        </div>
      </div>
      <div className="h-px flex-1" style={{ background: "var(--border-mid)" }} />
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

interface UnlockedRecord {
  achievement_id: string;
  unlocked_at: string;
}

interface Props {
  unlockedAchievements: UnlockedRecord[];
  tradeCount: number;
}

export default function AchievementsClient({ unlockedAchievements }: Props) {
  const unlockedMap = new Map(
    unlockedAchievements.map((a) => [a.achievement_id, a.unlocked_at])
  );

  const enriched = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) ?? null,
  }));

  const totalUnlocked = enriched.filter((a) => a.unlocked).length;
  const totalCount = ACHIEVEMENTS.length;
  const pct = Math.round((totalUnlocked / totalCount) * 100);

  let tileIndex = 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* ── Panel header (Minecraft-style title bar) ───────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl mb-8 overflow-hidden"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-mid)",
        }}
      >
        {/* Top gold accent line */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--gold-dim) 20%, var(--gold) 40%, var(--gold-bright) 50%, var(--gold) 60%, var(--gold-dim) 80%, transparent)",
          }}
        />

        <div className="px-8 py-6 flex items-center gap-6">
          {/* Icon */}
          <div
            className="relative w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(201,168,76,0.12)",
              border: "1px solid var(--gold-border)",
            }}
          >
            <Star size={28} style={{ color: "var(--gold)" }} strokeWidth={1.5} />
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(201,168,76,0.2) 0%, transparent 70%)",
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Title + progress */}
          <div className="flex-1 min-w-0">
            <p
              className="font-mono text-[10px] tracking-[0.28em] uppercase mb-1"
              style={{ color: "var(--text-3)" }}
            >
              Hall of Records
            </p>
            <h1
              className="font-playfair text-2xl font-bold mb-3 text-gold-glow"
            >
              Achievements
            </h1>

            {/* Master progress bar */}
            <div className="flex items-center gap-3">
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--gold-dim) 0%, var(--gold) 50%, var(--gold-bright) 100%)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                />
              </div>
              <span className="font-mono text-xs shrink-0" style={{ color: "var(--gold)" }}>
                {totalUnlocked} / {totalCount}
              </span>
              <span
                className="font-mono text-[10px] shrink-0"
                style={{ color: "var(--text-3)" }}
              >
                {pct}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom gold accent line */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--border-mid) 30%, var(--border-mid) 70%, transparent)",
          }}
        />
      </motion.div>

      {/* ── Achievement categories ─────────────────────────────────── */}
      <div className="space-y-10">
        {CATEGORIES.map((cat) => {
          const catAchievements = enriched.filter((a) => a.category === cat);
          const catUnlocked = catAchievements.filter((a) => a.unlocked).length;

          return (
            <div key={cat}>
              <CategoryHeader
                label={cat}
                total={catAchievements.length}
                unlocked={catUnlocked}
              />

              <div className="space-y-3">
                {catAchievements.map((a) => {
                  const idx = tileIndex++;
                  return (
                    <AchievementTile
                      key={a.id}
                      def={a}
                      unlocked={a.unlocked}
                      unlockedAt={a.unlockedAt ?? null}
                      index={idx}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Completion banner ─────────────────────────────────────── */}
      {totalUnlocked === totalCount && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 rounded-2xl p-8 text-center relative overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--gold-border)",
            boxShadow: "0 0 40px rgba(201,168,76,0.25)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(201,168,76,0.1) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <p className="text-3xl mb-2">🏆</p>
            <p className="font-playfair text-xl font-bold text-gold-glow mb-1">
              Complete!
            </p>
            <p className="font-cormorant text-base" style={{ color: "var(--text-2)" }}>
              All achievements unlocked. You are a Papyrus legend.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
