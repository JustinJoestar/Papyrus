import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, GOLD_GRADIENT } from "./theme";
import { playfair, sans, mono } from "./fonts";

/* ── Background: obsidian + faint gold grid ─────────────────────── */
export const GridBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => (
  <AbsoluteFill
    style={{
      backgroundColor: C.base,
      backgroundImage: `linear-gradient(rgba(201,168,76,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,${opacity}) 1px, transparent 1px)`,
      backgroundSize: "46px 46px",
    }}
  />
);

/* ── Edge vignette to focus the centre ──────────────────────────── */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 35%, rgba(0,0,0,0.72) 100%)",
    }}
  />
);

/* ── Signature spectral light wave (from the hero) ──────────────── */
export const SpectralWave: React.FC<{
  baseY?: number;
  amp?: number;
  speed?: number;
  opacity?: number;
  blur?: number;
}> = ({ baseY = 760, amp = 70, speed = 0.025, opacity = 0.85, blur = 7 }) => {
  const frame = useCurrentFrame();
  const phase = frame * speed;
  const build = (off: number, a: number) => {
    const pts: string[] = [];
    for (let x = -40; x <= 1960; x += 24) {
      const y = baseY + Math.sin(x * 0.0036 + phase + off) * a;
      pts.push(`${x},${y.toFixed(1)}`);
    }
    return `M ${pts.join(" L ")}`;
  };
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={1920} height={1080} style={{ filter: `blur(${blur}px)` }}>
        <defs>
          <linearGradient id="spectral" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.28" stopColor="#ff6b6b" />
            <stop offset="0.5" stopColor="#46d27a" />
            <stop offset="0.72" stopColor="#4d7bff" />
            <stop offset="1" stopColor="#c9a84c" />
          </linearGradient>
        </defs>
        <path d={build(0, amp)} stroke="url(#spectral)" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={build(1.6, amp * 0.6)} stroke="url(#spectral)" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6} />
      </svg>
    </AbsoluteFill>
  );
};

/* ── Gold gradient text ─────────────────────────────────────────── */
export const GoldText: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <span
    style={{
      backgroundImage: GOLD_GRADIENT,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
      ...style,
    }}
  >
    {children}
  </span>
);

/* ── Mono kicker label ──────────────────────────────────────────── */
export const Kicker: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = C.gold,
}) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: 22,
      letterSpacing: "0.34em",
      textTransform: "uppercase",
      color,
    }}
  >
    {children}
  </div>
);

/* ── Spring fade-up wrapper ─────────────────────────────────────── */
export const FadeUp: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 46, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.7 } });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [y, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ── Scene wrapper: fade content in/out for smooth cuts ─────────── */
export const SceneWrap: React.FC<{ dur: number; children: React.ReactNode }> = ({
  dur,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, dur - 12, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity, fontFamily: sans }}>{children}</AbsoluteFill>;
};

/* ── Framed product screenshot with entrance + slow Ken Burns ───── */
export const Shot: React.FC<{
  src: string;
  delay?: number;
  width?: number;
  x?: number;
  y?: number;
  rotate?: number;
  zoom?: number;
}> = ({ src, delay = 0, width = 1480, x = 0, y = 0, rotate = 0, zoom = 0.06 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.9 } });
  const drift = interpolate(frame, [0, 220], [1 + zoom, 1], { extrapolateRight: "clamp" });
  const scale = drift * interpolate(enter, [0, 1], [0.94, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width,
        transform: `translate(-50%, -50%) translate(${x}px, ${interpolate(enter, [0, 1], [y + 70, y])}px) scale(${scale}) rotate(${rotate}deg)`,
        opacity: enter,
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(201,168,76,0.28)",
        boxShadow: "0 50px 130px rgba(0,0,0,0.85), 0 0 0 1px rgba(201,168,76,0.08)",
      }}
    >
      <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
    </div>
  );
};

/* ── Papyrus logo lockup ────────────────────────────────────────── */
export const Logo: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 * scale, transform: `scale(${scale})` }}>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
      <div style={{ width: 6, height: 22, borderRadius: 3, background: C.gold }} />
      <div style={{ width: 6, height: 34, borderRadius: 3, background: C.gold }} />
      <div style={{ width: 6, height: 15, borderRadius: 3, background: C.goldDim }} />
    </div>
    <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 34, letterSpacing: "0.16em", color: C.text1 }}>
      PAPYRUS
    </span>
  </div>
);

/* ── Small pill / chip ──────────────────────────────────────────── */
export const Chip: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <FadeUp delay={delay} y={20}>
    <div
      style={{
        fontFamily: mono,
        fontSize: 20,
        letterSpacing: "0.08em",
        color: C.gold,
        padding: "10px 20px",
        borderRadius: 999,
        background: C.goldGlow,
        border: `1px solid ${C.goldBorder}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  </FadeUp>
);

export { playfair, sans, mono };
