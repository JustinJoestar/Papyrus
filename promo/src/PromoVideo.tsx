import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { C } from "./theme";
import { GridBackground, Vignette, SpectralWave } from "./components";
import {
  SceneIntro, SceneHook, SceneTitle, SceneLeaderboard,
  SceneHowItWorks, SceneAwards, SceneParents, SceneCTA,
} from "./scenes";

// Scene durations @ 30fps (sum = 1500 = 50s)
const D = {
  intro: 90, hook: 180, title: 150, leaderboard: 240,
  how: 240, awards: 210, parents: 210, cta: 180,
};

export const PromoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* Persistent brand backdrop */}
      <GridBackground />
      <AbsoluteFill style={{ opacity: 0.35 }}>
        <SpectralWave baseY={1000} amp={45} speed={0.018} opacity={0.5} blur={11} />
      </AbsoluteFill>
      <Vignette />

      {/* Scenes */}
      <Series>
        <Series.Sequence durationInFrames={D.intro}><SceneIntro dur={D.intro} /></Series.Sequence>
        <Series.Sequence durationInFrames={D.hook}><SceneHook dur={D.hook} /></Series.Sequence>
        <Series.Sequence durationInFrames={D.title}><SceneTitle dur={D.title} /></Series.Sequence>
        <Series.Sequence durationInFrames={D.leaderboard}><SceneLeaderboard dur={D.leaderboard} /></Series.Sequence>
        <Series.Sequence durationInFrames={D.how}><SceneHowItWorks dur={D.how} /></Series.Sequence>
        <Series.Sequence durationInFrames={D.awards}><SceneAwards dur={D.awards} /></Series.Sequence>
        <Series.Sequence durationInFrames={D.parents}><SceneParents dur={D.parents} /></Series.Sequence>
        <Series.Sequence durationInFrames={D.cta}><SceneCTA dur={D.cta} /></Series.Sequence>
      </Series>

      {/*
        MUSIC (optional): drop a track at promo/public/music.mp3, then
        uncomment the two lines below and re-render.
        import { Audio, staticFile } from "remotion";
        <Audio src={staticFile("music.mp3")} volume={0.65} />
      */}
    </AbsoluteFill>
  );
};
