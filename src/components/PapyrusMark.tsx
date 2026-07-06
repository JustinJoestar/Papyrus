/**
 * PapyrusMark — the brand seal + wordmark.
 * A milled bronze seal (like the embossed stamp on a stock certificate)
 * with a Fraunces "P", next to the PAPYRUS wordmark.
 * Server-safe: no hooks, pure SVG + CSS variables.
 */

export function Seal({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Outer engraved ring */}
      <circle cx="20" cy="20" r="19" stroke="var(--gold)" strokeWidth="1.25" />
      {/* Milled edge — coin ridging */}
      <circle
        cx="20" cy="20" r="16.5"
        stroke="var(--gold-dim)"
        strokeWidth="1.5"
        strokeDasharray="1.1 2.2"
        opacity="0.9"
      />
      {/* Inner hairline */}
      <circle cx="20" cy="20" r="13.5" stroke="var(--gold-border)" strokeWidth="0.75" />
      {/* The P — engraved serif glyph */}
      <text
        x="20.2"
        y="21.2"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display), Georgia, serif"
        fontStyle="italic"
        fontWeight={600}
        fontSize="17"
        fill="var(--gold)"
      >
        P
      </text>
    </svg>
  );
}

export default function PapyrusMark({
  sealSize = 26,
  wordmarkSize = 15,
  showEst = false,
}: {
  sealSize?: number;
  wordmarkSize?: number;
  showEst?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <Seal size={sealSize} />
      <span className="flex flex-col leading-none">
        <span
          className="font-display font-semibold"
          style={{
            fontSize: wordmarkSize,
            letterSpacing: "0.14em",
            color: "var(--text-1)",
          }}
        >
          PAPYRUS
        </span>
        {showEst && (
          <span
            className="font-mono"
            style={{
              fontSize: 7.5,
              letterSpacing: "0.34em",
              color: "var(--text-3)",
              marginTop: 3,
            }}
          >
            PAPER TRADING
          </span>
        )}
      </span>
    </span>
  );
}
