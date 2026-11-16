import React from "react";
import { Composition } from "remotion";
import { calculateMetadata, DEFAULT_SCENES, Scene, SceneProps } from "./Composition";

export const Root: React.FC = () => (
  <Composition
    id="CangLachHuyenBanDai"
    component={Scene}
    durationInFrames={Math.round(590.44 * 30)}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={
      {
        fps: 30,
        width: 1920,
        height: 1080,
        totalDurationSeconds: 590.44,
        masterAudioFile: "audio/master_audio.mp3",
        scenes: DEFAULT_SCENES,
      } as SceneProps
    }
    calculateMetadata={calculateMetadata}
  />
);

