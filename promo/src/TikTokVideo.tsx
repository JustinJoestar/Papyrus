import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, GOLD_GRADIENT } from "./theme";
import { sans, mono } from "./fonts";

/* ============================================================
   Papyrus Challenge — 9:16 TikTok cut (1080×1920, 30fps, ~19s)

   Built for the feed, not the boardroom: 1-second hook, hard
   cuts on the beat, an odometer money slam, a live-feeling
   leaderboard, and a single unmissable CTA. Everything is
   deterministic (seeded pseudo-random) so renders are stable.
   Core content stays inside TikTok's safe zone (clear of the
   caption strip at the bottom and the action rail on the right).
   ============================================================ */

const W = 1080;
const H = 1920;

/* Deterministic pseudo-random from an index */
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* Decaying impact shake, triggered at `start` */
const useShake = (start: number, power = 14, decay = 10) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0 || t > decay + 6) return { x: 0, y: 0 };
  const falloff = Math.max(0, 1 - t / (decay + 6));
  return {
    x: Math.sin(t * 91.3) * power * falloff,
    y: Math.cos(t * 57.7) * power * falloff * 0.7,
  };
};

/* 2-frame white/gold flash at a cut point */
const Flash: React.FC<{ at: number; color?: string }> = ({ at, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at, at + 1, at + 4], [0, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity }} />;
};

/* Slight constant zoom drift so nothing ever sits still */
const Drift: React.FC<{ from?: number; to?: number; children: React.ReactNode }> = ({
  from = 1,
  to = 1.05,
  children,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 150], [from, to], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};

const Bg: React.FC<{ grid?: number }> = ({ grid = 0.06 }) => (
  <>
    <AbsoluteFill
      style={{
        backgroundColor: C.base,
        backgroundImage: `linear-gradient(rgba(201,168,76,${grid}) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,${grid}) 1px, transparent 1px)`,
        backgroundSize: "54px 54px",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 90% 55% at 50% 46%, transparent 30%, rgba(0,0,0,0.82) 100%)",
      }}
    />
  </>
);

const Gold: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
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

const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  y?: number;
}> = ({ delay = 0, children, style, y = 60 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 16, mass: 0.6, stiffness: 160 } });
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(p, [0, 1], [y, 0])}px) scale(${interpolate(p, [0, 1], [0.82, 1])})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ── S1 · HOOK — "$100,000" odometer slam (0–80) ───────────────── */
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shake = useShake(34, 22);
  const count = spring({ frame: frame - 16, fps, config: { damping: 30, stiffness: 90 }, durationInFrames: 26 });
  const dollars = Math.round(interpolate(count, [0, 1], [0, 100000]));
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Bg />
      <Drift>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 70px",
            transform: `translate(${shake.x}px, ${shake.y}px)`,
          }}
        >
          <Pop delay={2}>
            <div style={{ fontFamily: mono, fontSize: 34, letterSpacing: "0.4em", color: C.text3 }}>
              POV:
            </div>
          </Pop>
          <Pop delay={7}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 900,
                color: C.text1,
                textAlign: "center",
                lineHeight: 1.04,
                marginTop: 26,
                letterSpacing: "-0.02em",
              }}
            >
              you just got
            </div>
          </Pop>
          <Pop delay={16} y={90}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 168,
                fontWeight: 800,
                marginTop: 20,
                letterSpacing: "-0.03em",
                textShadow: "0 0 90px rgba(201,168,76,0.45)",
              }}
            >
              <Gold>${dollars.toLocaleString("en-US")}</Gold>
            </div>
          </Pop>
          <Pop delay={40}>
            <div style={{ fontSize: 46, color: C.text2, marginTop: 34, fontWeight: 600 }}>
              to trade stocks &amp; crypto. <span style={{ color: C.text3 }}>for free.</span>
            </div>
          </Pop>
        </AbsoluteFill>
      </Drift>
      <Flash at={34} color="rgba(232,198,106,0.9)" />
    </AbsoluteFill>
  );
};

/* ── S2 · MARKET — rising candles + ticker chips (80–170) ──────── */
const CANDLES = 26;
const TICKERS = [
  { s: "NVDA", p: "+3.4%" },
  { s: "BTC", p: "+5.2%" },
  { s: "TSLA", p: "+2.8%" },
  { s: "ETH", p: "+4.1%" },
  { s: "AAPL", p: "+1.6%" },
];

const SceneMarket: React.FC = () => {
  const frame = useCurrentFrame();
  // deterministic upward random walk
  const candles = Array.from({ length: CANDLES }, (_, i) => {
    const drift = i * 26;
    const wob = (rnd(i) - 0.35) * 120;
    const open = 1350 - drift - wob;
    const close = open - (30 + rnd(i + 50) * 90) * (rnd(i + 99) > 0.24 ? 1 : -0.6);
    return { open, close, up: close < open };
  });
  const shown = interpolate(frame, [6, 56], [0, CANDLES], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Bg />
      <Drift from={1.04} to={1}>
        {/* chart */}
        <svg width={W} height={H} style={{ position: "absolute" }}>
          {candles.slice(0, Math.ceil(shown)).map((c, i) => {
            const x = 60 + i * 38;
            const top = Math.min(c.open, c.close);
            const h = Math.max(14, Math.abs(c.open - c.close));
            const appear = Math.min(1, Math.max(0, shown - i));
            return (
              <g key={i} opacity={appear}>
                <rect
                  x={x + 10}
                  y={top - 26 * rnd(i + 7)}
                  width={4}
                  height={h + 52 * rnd(i + 7)}
                  fill={c.up ? "rgba(34,197,94,0.5)" : "rgba(244,63,94,0.5)"}
                />
                <rect
                  x={x}
                  y={top}
                  width={24}
                  height={h}
                  rx={3}
                  fill={c.up ? C.gain : "#f43f5e"}
                  opacity={c.up ? 0.95 : 0.8}
                />
              </g>
            );
          })}
        </svg>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 70px" }}>
          <Pop delay={4}>
            <div
              style={{
                fontSize: 92,
                fontWeight: 900,
                color: C.text1,
                textAlign: "center",
                lineHeight: 1.05,
                textShadow: "0 10px 60px rgba(0,0,0,0.9)",
              }}
            >
              the <Gold>REAL</Gold> market.
              <br />
              real live prices.
            </div>
          </Pop>
          <div style={{ display: "flex", gap: 16, marginTop: 56, flexWrap: "wrap", justifyContent: "center" }}>
            {TICKERS.map((t, i) => (
              <Pop key={t.s} delay={22 + i * 6} y={40}>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 30,
                    fontWeight: 700,
                    padding: "14px 24px",
                    borderRadius: 14,
                    background: "rgba(13,13,13,0.9)",
                    border: `1px solid ${C.borderMid}`,
                    color: C.text1,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                  }}
                >
                  {t.s} <span style={{ color: C.gain }}>{t.p}</span>
                </div>
              </Pop>
            ))}
          </div>
        </AbsoluteFill>
      </Drift>
      <Flash at={0} />
    </AbsoluteFill>
  );
};

/* ── S3 · LEADERBOARD — climb it (170–275) ─────────────────────── */
const BOARD = [
  { name: "Maya R.", ret: "+14.2%", you: false },
  { name: "Ethan K.", ret: "+11.8%", you: false },
  { name: "YOU", ret: "", you: true },
  { name: "Jordan P.", ret: "+9.7%", you: false },
  { name: "Ava T.", ret: "+8.1%", you: false },
];

const ROW_H = 104;
const ROW_GAP = 20;
const STRIDE = ROW_H + ROW_GAP;

const SceneBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // "YOU" row surges from #3 into #1 near the end of the scene
  const swap = spring({ frame: frame - 62, fps, config: { damping: 19, stiffness: 110 } });
  const shake = useShake(70, 12);
  const youRet = interpolate(swap, [0, 1], [11.4, 15.1]);
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Bg />
      <Drift>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 80px",
            transform: `translate(${shake.x}px, ${shake.y}px)`,
          }}
        >
          <Pop delay={2}>
            <div style={{ fontSize: 84, fontWeight: 900, color: C.text1, textAlign: "center", lineHeight: 1.05 }}>
              every teen is
              <br />
              on <Gold>one leaderboard</Gold>
            </div>
          </Pop>
          <div style={{ width: "100%", maxWidth: 860, marginTop: 60 }}>
            {BOARD.map((r, i) => {
              const isYou = r.you;
              // YOU (row 3) rises exactly two rows; rows 1–2 each drop one
              const lift = isYou ? -2 * STRIDE * swap : i < 2 ? STRIDE * swap : 0;
              const rank = isYou
                ? Math.round(interpolate(swap, [0, 1], [3, 1]))
                : i < 2
                ? i + 1 + Math.round(swap)
                : i + 1;
              const ret = isYou ? `+${youRet.toFixed(1)}%` : r.ret;
              return (
                <Pop key={r.name} delay={14 + i * 5} y={50}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 26,
                      height: ROW_H,
                      padding: "0 34px",
                      marginBottom: ROW_GAP,
                      borderRadius: 20,
                      background: isYou ? "rgba(20,17,8,0.97)" : "rgba(13,13,13,0.92)",
                      border: `2px solid ${isYou ? C.gold : C.borderMid}`,
                      transform: `translateY(${lift}px) scale(${isYou ? 1 + swap * 0.05 : 1})`,
                      boxShadow: isYou
                        ? `0 24px 70px rgba(201,168,76,${0.15 + swap * 0.3})`
                        : "0 18px 50px rgba(0,0,0,0.55)",
                      zIndex: isYou ? 10 : 1,
                      position: "relative",
                    }}
                  >
                    <span style={{ fontFamily: mono, fontSize: 40, fontWeight: 800, width: 70, color: isYou ? C.goldBright : C.text3 }}>
                      {isYou && swap > 0.55 ? "👑" : `${rank}`}
                    </span>
                    <span style={{ fontSize: 42, fontWeight: 800, flex: 1, color: isYou ? C.goldBright : C.text1 }}>
                      {r.name}
                    </span>
                    <span style={{ fontFamily: mono, fontSize: 38, fontWeight: 700, color: C.gain }}>
                      {ret}
                    </span>
                  </div>
                </Pop>
              );
            })}
          </div>
        </AbsoluteFill>
      </Drift>
      <Flash at={0} />
      <Flash at={70} color="rgba(232,198,106,0.7)" />
    </AbsoluteFill>
  );
};

/* ── S4 · PRIZE — $50 + certificate, gold burst (275–360) ──────── */
const ScenePrize: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = useShake(14, 18);
  const sparks = Array.from({ length: 30 }, (_, i) => {
    const a = rnd(i) * Math.PI * 2;
    const speed = 7 + rnd(i + 31) * 13;
    const t = Math.max(0, frame - 14);
    return {
      x: Math.cos(a) * speed * t,
      y: Math.sin(a) * speed * t + t * t * 0.12,
      o: Math.max(0, 1 - t / 46),
      s: 8 + rnd(i + 77) * 14,
    };
  });
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Bg />
      <Drift>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 80px",
            transform: `translate(${shake.x}px, ${shake.y}px)`,
          }}
        >
          <Pop delay={0}>
            <div style={{ fontSize: 72, fontWeight: 900, color: C.text2 }}>and #1 takes…</div>
          </Pop>
          <Pop delay={12} y={100}>
            <div
              style={{
                fontFamily: mono,
                fontSize: 200,
                fontWeight: 800,
                marginTop: 14,
                letterSpacing: "-0.03em",
                textShadow: "0 0 110px rgba(201,168,76,0.5)",
              }}
            >
              <Gold>$50</Gold>
            </div>
          </Pop>
          <Pop delay={22}>
            <div style={{ fontSize: 56, fontWeight: 800, color: C.text1, marginTop: 6 }}>
              gift card
            </div>
          </Pop>
          <Pop delay={32}>
            <div
              style={{
                marginTop: 44,
                fontFamily: mono,
                fontSize: 32,
                letterSpacing: "0.1em",
                color: C.gold,
                padding: "20px 38px",
                borderRadius: 16,
                background: C.goldGlow,
                border: `1.5px solid ${C.goldBorder}`,
              }}
            >
              🏆 + OFFICIAL WINNER&apos;S CERTIFICATE
            </div>
          </Pop>
          <Pop delay={44}>
            <div style={{ fontSize: 38, color: C.text3, marginTop: 40, fontWeight: 600 }}>
              (yes, the certificate goes on the college app)
            </div>
          </Pop>
        </AbsoluteFill>
        {/* gold burst */}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
          {sparks.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: p.s,
                height: p.s,
                borderRadius: 3,
                background: i % 3 === 0 ? C.goldBright : C.gold,
                transform: `translate(${p.x}px, ${p.y - 160}px) rotate(${p.x * 2}deg)`,
                opacity: p.o,
              }}
            />
          ))}
        </AbsoluteFill>
      </Drift>
      <Flash at={14} color="rgba(232,198,106,0.9)" />
    </AbsoluteFill>
  );
};

/* ── S5 · TRUST — rapid-fire chips (360–435) ───────────────────── */
const FLAGS = ["100% FREE", "NO REAL MONEY", "AGES 13+", "SIX WEEKS", "STOCKS + CRYPTO"];

const SceneTrust: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: sans }}>
    <Bg />
    <Drift>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px" }}>
        <Pop delay={2}>
          <div style={{ fontSize: 96, fontWeight: 900, color: C.text1, textAlign: "center", lineHeight: 1.06 }}>
            zero risk.
            <br />
            <Gold>all bragging rights.</Gold>
          </div>
        </Pop>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "center",
            marginTop: 70,
            maxWidth: 820,
          }}
        >
          {FLAGS.map((f, i) => (
            <Pop key={f} delay={16 + i * 6} y={44}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: C.text1,
                  padding: "20px 32px",
                  borderRadius: 999,
                  background: "rgba(13,13,13,0.92)",
                  border: `1.5px solid ${C.goldBorder}`,
                }}
              >
                ✓ {f}
              </div>
            </Pop>
          ))}
        </div>
      </AbsoluteFill>
    </Drift>
    <Flash at={0} />
  </AbsoluteFill>
);

/* ── S6 · CTA — enroll now (435–570) ───────────────────────────── */
const SceneCta: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 7) * 0.03;
  const marquee = (frame * 6) % 2400;
  const TAPE = "PAPYRUS SUMMER TRADING CHALLENGE · $100K VIRTUAL · LIVE NOW · ";
  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      <Bg grid={0.09} />
      <Drift>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 70px" }}>
          {/* logo */}
          <Pop delay={0}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5 }}>
                <div style={{ width: 8, height: 30, borderRadius: 4, background: C.gold }} />
                <div style={{ width: 8, height: 46, borderRadius: 4, background: C.gold }} />
                <div style={{ width: 8, height: 20, borderRadius: 4, background: C.goldDim }} />
              </div>
              <span style={{ fontFamily: mono, fontWeight: 700, fontSize: 44, letterSpacing: "0.18em", color: C.text1 }}>
                PAPYRUS
              </span>
            </div>
          </Pop>
          <Pop delay={8}>
            <div
              style={{
                fontSize: 100,
                fontWeight: 900,
                color: C.text1,
                textAlign: "center",
                lineHeight: 1.04,
                marginTop: 46,
              }}
            >
              claim your
              <br />
              <Gold>$100,000</Gold>
            </div>
          </Pop>
          <Pop delay={20}>
            <div style={{ fontSize: 42, color: C.text2, marginTop: 30, fontWeight: 600 }}>
              trading is <span style={{ color: C.gain, fontWeight: 800 }}>LIVE</span> right now
            </div>
          </Pop>
          <Pop delay={30} y={70}>
            <div
              style={{
                marginTop: 56,
                transform: `scale(${pulse})`,
                fontFamily: mono,
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "#0a0800",
                padding: "30px 64px",
                borderRadius: 22,
                backgroundImage: GOLD_GRADIENT,
                boxShadow: "0 0 90px rgba(201,168,76,0.5), 0 30px 70px rgba(0,0,0,0.6)",
              }}
            >
              ENROLL FREE →
            </div>
          </Pop>
          <Pop delay={40}>
            <div style={{ fontFamily: mono, fontSize: 34, color: C.gold, marginTop: 44, letterSpacing: "0.12em" }}>
              papyrus-trade.com/challenge
            </div>
          </Pop>
          <Pop delay={48}>
            <div style={{ fontFamily: mono, fontSize: 28, color: C.text3, marginTop: 18, letterSpacing: "0.3em" }}>
              ⬆ LINK IN BIO ⬆
            </div>
          </Pop>
        </AbsoluteFill>
      </Drift>
      {/* marquee tape — kept above TikTok's caption zone */}
      <div
        style={{
          position: "absolute",
          bottom: 380,
          left: 0,
          right: 0,
          overflow: "hidden",
          borderTop: `1px solid ${C.goldBorder}`,
          borderBottom: `1px solid ${C.goldBorder}`,
          background: "rgba(0,0,0,0.75)",
          padding: "16px 0",
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 26,
            letterSpacing: "0.22em",
            color: C.gold,
            whiteSpace: "nowrap",
            transform: `translateX(${-marquee}px)`,
          }}
        >
          {TAPE.repeat(8)}
        </div>
      </div>
      <Flash at={0} color="rgba(232,198,106,0.8)" />
    </AbsoluteFill>
  );
};

/* ── Assembly ──────────────────────────────────────────────────── */
export const TikTokVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence durationInFrames={80}>
      <SceneHook />
    </Sequence>
    <Sequence from={80} durationInFrames={90}>
      <SceneMarket />
    </Sequence>
    <Sequence from={170} durationInFrames={105}>
      <SceneBoard />
    </Sequence>
    <Sequence from={275} durationInFrames={85}>
      <ScenePrize />
    </Sequence>
    <Sequence from={360} durationInFrames={75}>
      <SceneTrust />
    </Sequence>
    <Sequence from={435} durationInFrames={135}>
      <SceneCta />
    </Sequence>
  </AbsoluteFill>
);
