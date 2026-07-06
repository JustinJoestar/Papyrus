/**
 * Guilloche — the engraved rosette from banknotes and stock certificates.
 * Deterministic SVG: rings of offset circles create the interference pattern.
 * Two layers counter-rotate imperceptibly slowly (CSS, ~4 min/rev).
 * Server-safe: pure math, no hooks.
 */

function ring(count: number, orbit: number, radius: number, key: string) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const cx = 200 + orbit * Math.cos(angle);
    const cy = 200 + orbit * Math.sin(angle);
    return (
      <circle
        key={`${key}-${i}`}
        cx={cx.toFixed(2)}
        cy={cy.toFixed(2)}
        r={radius}
        fill="none"
        stroke="var(--engrave)"
        strokeWidth="0.5"
      />
    );
  });
}

export default function Guilloche({
  size = 560,
  opacity = 1,
  className = "",
  style = {},
}: {
  size?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      className={className}
      style={{ pointerEvents: "none", opacity, ...style }}
    >
      {/* Layer A — fine inner rosette */}
      <g className="rosette-a">
        {ring(18, 52, 96, "a1")}
        {ring(24, 96, 60, "a2")}
      </g>
      {/* Layer B — wide outer weave, counter-rotating */}
      <g className="rosette-b">
        {ring(30, 140, 46, "b1")}
        {ring(12, 30, 150, "b2")}
      </g>
      {/* Anchor rings */}
      <circle cx="200" cy="200" r="196" stroke="var(--engrave)" strokeWidth="0.5" />
      <circle cx="200" cy="200" r="188" stroke="var(--engrave)" strokeWidth="0.5" strokeDasharray="1 3" />
      <circle cx="200" cy="200" r="12" stroke="var(--engrave)" strokeWidth="0.5" />
    </svg>
  );
}
