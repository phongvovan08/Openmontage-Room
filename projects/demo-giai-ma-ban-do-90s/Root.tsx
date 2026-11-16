import React from "react";
import { Composition } from "remotion";
import { calculateMetadata, DEFAULT_SCENES, Scene, SceneProps } from "./Composition";

export const Root: React.FC = () => (
  <Composition
    id="DemoGiaiMaBanDo90s"
    component={Scene}
    durationInFrames={90 * 30}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={
      {
        fps: 30,
        width: 1920,
        height: 1080,
        totalDurationSeconds: 90,
        masterAudioFile: "audio/master_audio.mp3",
        scenes: DEFAULT_SCENES,
      } as SceneProps
    }
    calculateMetadata={calculateMetadata}
  />
);
