import React from "react";
import { Composition } from "remotion";
import { FPS, SanBayLongThanh40kmComposition, TOTAL_FRAMES } from "./Composition";
import { DEMO_FPS, DEMO_TOTAL_FRAMES, DemoOpenMotionComposition } from "./demo_openmotion/DemoOpenMotionComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SanBayLongThanh40km"
        component={SanBayLongThanh40kmComposition}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          masterAudioFile: "audio/master_audio.mp3",
        }}
      />
      <Composition
        id="DemoOpenMotion57s"
        component={DemoOpenMotionComposition}
        durationInFrames={DEMO_TOTAL_FRAMES}
        fps={DEMO_FPS}
        width={1920}
        height={1080}
        defaultProps={{
          masterAudioFile: "audio/demo_skill_moi_zoom_master.mp3",
        }}
      />
    </>
  );
};
