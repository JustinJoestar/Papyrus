/**
 * RankMedallion — a struck coin for a competitor's rank.
 * Milled outer ring, engraved inner ring, rank numeral in Fraunces.
 * Rank 1 gets a slowly rotating halo. Pure CSS, server-safe.
 */

const METALS = {
  gold:   { color: "var(--gold-bright)",  border: "var(--gold-border)",         bg: "var(--gold-glow)" },
  silver: { color: "var(--metal-silver)", border: "var(--metal-silver-border)", bg: "rgba(150,160,175,0.08)" },
  bronze: { color: "var(--metal-bronze)", border: "var(--metal-bronze-border)", bg: "rgba(192,128,80,0.08)" },
  plain:  { color: "var(--text-3)",       border: "var(--border-mid)",          bg: "var(--elevated)" },
} as const;

export type Metal = keyof typeof METALS;

export function metalForRank(rank: number): Metal {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "plain";
}

export default function RankMedallion({
  rank,
  size = 52,
  label,
}: {
  rank: number;
  size?: number;
  label?: string;
}) {
  const metal = METALS[metalForRank(rank)];
  const isChampion = rank === 1;

  return (
    <div
      className="relative flex flex-col items-center justify-center shrink-0 rounded-full select-none"
      style={{
        width: size,
        height: size,
        background: metal.bg,
        border: `1.5px solid ${metal.border}`,
        color: metal.color,
      }}
    >
      {/* Milled inner ring */}
      <div
        aria-hidden
        className={`absolute rounded-full ${isChampion ? "medallion-halo" : ""}`}
        style={{
          inset: 3,
          border: `1px dashed ${metal.border}`,
        }}
      />
      <span
        className="font-display font-semibold leading-none"
        style={{ fontSize: size * 0.36 }}
      >
        {rank}
      </span>
      {label && (
        <span
          className="font-mono leading-none mt-[3px]"
          style={{ fontSize: Math.max(6.5, size * 0.13), letterSpacing: "0.12em", opacity: 0.75 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
