import React from "react";
import { Composition } from "remotion";
import { PromoVideo } from "./PromoVideo";
import { TikTokVideo } from "./TikTokVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PapyrusPromo"
        component={PromoVideo}
        durationInFrames={1500}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* 9:16 TikTok / Reels / Shorts cut */}
      <Composition
        id="TikTokChallenge"
        component={TikTokVideo}
        durationInFrames={570}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
