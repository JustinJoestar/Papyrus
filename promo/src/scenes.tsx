import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "./theme";
import {
  GridBackground, Vignette, SpectralWave, GoldText, Kicker, FadeUp, SceneWrap, Shot, Logo, Chip,
  playfair, sans, mono,
} from "./components";

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 80, ...style }}>
    {children}
  </AbsoluteFill>
);

/* 1 — INTRO / LOGO ─────────────────────────────────────────────── */
export const SceneIntro: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  return (
    <SceneWrap dur={dur}>
      <SpectralWave baseY={540} amp={120} opacity={interpolate(frame, [0, 30, 70, 90], [0, 0.9, 0.9, 0])} blur={9} />
      <Center>
        <div style={{ transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`, opacity: s }}>
          <Logo scale={1.7} />
          <div style={{ height: 26 }} />
          <FadeUp delay={14}>
            <Kicker color={C.text3}>Paper Trading Terminal</Kicker>
          </FadeUp>
        </div>
      </Center>
    </SceneWrap>
  );
};

/* 2 — HOOK ─────────────────────────────────────────────────────── */
export const SceneHook: React.FC<{ dur: number }> = ({ dur }) => (
  <SceneWrap dur={dur}>
    <Center>
      <FadeUp delay={6}>
        <div style={{ fontFamily: sans, fontSize: 52, fontWeight: 500, color: C.text2 }}>
          What would you do with
        </div>
      </FadeUp>
      <FadeUp delay={22} y={60}>
        <div style={{ fontFamily: sans, fontSize: 230, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 10 }}>
          <GoldText>$100,000</GoldText>
        </div>
      </FadeUp>
      <FadeUp delay={70}>
        <div style={{ fontFamily: mono, fontSize: 40, letterSpacing: "0.12em", color: C.text1, marginTop: 30 }}>
          NO RISK · REAL MARKETS · ALL SKILL
        </div>
      </FadeUp>
    </Center>
  </SceneWrap>
);

/* 3 — TITLE REVEAL ─────────────────────────────────────────────── */
export const SceneTitle: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <SceneWrap dur={dur}>
      <SpectralWave baseY={690} amp={90} opacity={0.85} />
      <Center>
        <FadeUp delay={0}>
          <Kicker>Papyrus Presents</Kicker>
        </FadeUp>
        <FadeUp delay={10} y={70}>
          <div style={{ lineHeight: 0.95, marginTop: 18 }}>
            <span style={{ fontFamily: playfair, fontStyle: "italic", fontWeight: 500, fontSize: 200 }}>
              <GoldText>Summer</GoldText>
            </span>{" "}
            <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 200, letterSpacing: "-0.03em" }}>
              <GoldText>Challenge.</GoldText>
            </span>
          </div>
        </FadeUp>
        <FadeUp delay={34}>
          <div style={{ fontFamily: sans, fontSize: 40, color: C.text2, marginTop: 30, maxWidth: 1200 }}>
            A free six-week trading competition for high schoolers.
          </div>
        </FadeUp>
        <div style={{ opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), marginTop: 26 }}>
          <Kicker color={C.text3}>June 29 – August 7, 2026</Kicker>
        </div>
      </Center>
    </SceneWrap>
  );
};

/* 4 — COMPETE / LEADERBOARD ────────────────────────────────────── */
export const SceneLeaderboard: React.FC<{ dur: number }> = ({ dur }) => (
  <SceneWrap dur={dur}>
    <Shot src="shots/leaderboard.png" delay={6} width={1180} x={330} y={40} rotate={-1.5} zoom={0.08} />
    <AbsoluteFill style={{ flexDirection: "column", justifyContent: "center", paddingLeft: 120, gap: 22 }}>
      <FadeUp delay={0}><Kicker>Compete</Kicker></FadeUp>
      <FadeUp delay={10}>
        <div style={{ fontFamily: sans, fontSize: 96, fontWeight: 800, color: C.text1, lineHeight: 1.02, maxWidth: 820 }}>
          Climb the <GoldText>leaderboard.</GoldText>
        </div>
      </FadeUp>
      <FadeUp delay={26}>
        <div style={{ fontFamily: sans, fontSize: 40, color: C.text2, maxWidth: 720 }}>
          Live rankings, updated in real time. Beat your friends — beat everyone.
        </div>
      </FadeUp>
      <FadeUp delay={42}>
        <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
          <Chip delay={48}>● ENROLLMENT OPEN NOW</Chip>
        </div>
      </FadeUp>
    </AbsoluteFill>
  </SceneWrap>
);

/* 5 — HOW IT WORKS ─────────────────────────────────────────────── */
export const SceneHowItWorks: React.FC<{ dur: number }> = ({ dur }) => {
  const steps = [
    { t: "Start with $100,000 in virtual cash", at: 20 },
    { t: "Trade real stocks — Apple, Nvidia & more", at: 70 },
    { t: "Watch your rank move in real time", at: 120 },
  ];
  return (
    <SceneWrap dur={dur}>
      <Shot src="shots/portfolio.png" delay={6} width={1140} x={-360} y={30} rotate={1.5} zoom={0.08} />
      <AbsoluteFill style={{ flexDirection: "column", justifyContent: "center", alignItems: "flex-end", paddingRight: 110, gap: 28 }}>
        <FadeUp delay={0}><Kicker>How it works</Kicker></FadeUp>
        {steps.map((s, i) => (
          <FadeUp key={i} delay={s.at} y={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "flex-end" }}>
              <span style={{ fontFamily: mono, fontSize: 34, color: C.gold }}>{`0${i + 1}`}</span>
              <span style={{ fontFamily: sans, fontSize: 52, fontWeight: 700, color: C.text1, textAlign: "right", maxWidth: 760 }}>
                {s.t}
              </span>
            </div>
          </FadeUp>
        ))}
      </AbsoluteFill>
    </SceneWrap>
  );
};

/* 6 — THREE AWARDS ─────────────────────────────────────────────── */
const AwardCard: React.FC<{ emoji: string; title: string; sub: string; delay: number }> = ({ emoji, title, sub, delay }) => (
  <FadeUp delay={delay} y={50}>
    <div
      style={{
        width: 470,
        height: 360,
        borderRadius: 22,
        background: C.surface,
        border: `1px solid ${C.borderMid}`,
        padding: 40,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ fontSize: 78 }}>{emoji}</div>
      <div style={{ fontFamily: sans, fontSize: 46, fontWeight: 800, color: C.text1, marginTop: 18 }}>{title}</div>
      <div style={{ fontFamily: sans, fontSize: 30, color: C.text3, marginTop: 14, lineHeight: 1.35 }}>{sub}</div>
    </div>
  </FadeUp>
);

export const SceneAwards: React.FC<{ dur: number }> = ({ dur }) => (
  <SceneWrap dur={dur}>
    <Center>
      <FadeUp delay={0}><Kicker>Three ways to win</Kicker></FadeUp>
      <FadeUp delay={8}>
        <div style={{ fontFamily: sans, fontSize: 84, fontWeight: 800, color: C.text1, marginTop: 14, marginBottom: 48 }}>
          More than just the <GoldText>biggest number.</GoldText>
        </div>
      </FadeUp>
      <div style={{ display: "flex", gap: 28 }}>
        <AwardCard emoji="🏆" title="Top Trader" sub="Highest overall return." delay={24} />
        <AwardCard emoji="🧠" title="Smartest Investor" sub="Best risk-adjusted growth — skill over luck." delay={36} />
        <AwardCard emoji="🚀" title="Comeback" sub="The strongest finish from behind." delay={48} />
      </div>
    </Center>
  </SceneWrap>
);

/* 7 — FOR PARENTS / TRUST ──────────────────────────────────────── */
export const SceneParents: React.FC<{ dur: number }> = ({ dur }) => {
  const chips = ["No real money — ever", "Free · no payment info", "Ages 13+", "Genuinely educational"];
  return (
    <SceneWrap dur={dur}>
      <Shot src="shots/parents.png" delay={8} width={1080} x={340} y={40} rotate={1.5} zoom={0.06} />
      <AbsoluteFill style={{ flexDirection: "column", justifyContent: "center", paddingLeft: 120, gap: 26 }}>
        <FadeUp delay={0}><Kicker>For parents</Kicker></FadeUp>
        <FadeUp delay={10}>
          <div style={{ fontFamily: sans, fontSize: 92, fontWeight: 800, color: C.text1, lineHeight: 1.02, maxWidth: 840 }}>
            Free. No real money. <GoldText>Ever.</GoldText>
          </div>
        </FadeUp>
        <FadeUp delay={26}>
          <div style={{ fontFamily: sans, fontSize: 38, color: C.text2, maxWidth: 760 }}>
            A safe, structured way for your teen to learn how investing really works.
          </div>
        </FadeUp>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, maxWidth: 780, marginTop: 6 }}>
          {chips.map((c, i) => (
            <Chip key={c} delay={40 + i * 8}>{c}</Chip>
          ))}
        </div>
      </AbsoluteFill>
    </SceneWrap>
  );
};

/* 8 — CTA / CLOSE ──────────────────────────────────────────────── */
export const SceneCTA: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = spring({ frame: frame - 36, fps, config: { damping: 200 } });
  return (
    <SceneWrap dur={dur}>
      <SpectralWave baseY={820} amp={80} opacity={0.8} />
      <Center>
        <FadeUp delay={0}><Logo scale={1.1} /></FadeUp>
        <FadeUp delay={10} y={60}>
          <div style={{ fontFamily: sans, fontSize: 110, fontWeight: 900, color: C.text1, marginTop: 30, lineHeight: 1.02 }}>
            Enrollment is <GoldText>open now.</GoldText>
          </div>
        </FadeUp>
        <FadeUp delay={24}>
          <div style={{ fontFamily: mono, fontSize: 46, color: C.goldBright, marginTop: 18, letterSpacing: "0.04em" }}>
            papyrus-trade.com/challenge
          </div>
        </FadeUp>
        <div style={{ transform: `scale(${interpolate(btn, [0, 1], [0.9, 1])})`, opacity: btn, marginTop: 40 }}>
          <div
            style={{
              fontFamily: mono,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: "0.08em",
              color: "#0a0800",
              padding: "22px 52px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #8a6f35 0%, #c9a84c 50%, #e8c66a 100%)",
              boxShadow: "0 0 50px rgba(201,168,76,0.4)",
            }}
          >
            ENTER THE CHALLENGE →
          </div>
        </div>
        <FadeUp delay={54}>
          <div style={{ fontFamily: mono, fontSize: 26, color: C.text3, marginTop: 30, letterSpacing: "0.1em" }}>
            TRADING BEGINS JUNE 29 · FREE TO ENTER · AGES 13+
          </div>
        </FadeUp>
      </Center>
    </SceneWrap>
  );
};
