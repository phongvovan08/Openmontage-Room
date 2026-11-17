import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { useHydrographicFonts } from "../fonts";
import { CinemaMapGradeOverlay } from "../scenes/EditorialThemeKit";
import { PALETTE } from "../theme";
import { DemoKeywordCaptionBar } from "./DemoKeywordCaptionBar";
import { DemoScene1Runway365 } from "./DemoScene1Runway365";
import { DemoScene2NytCurve } from "./DemoScene2NytCurve";
import { DemoScene3DecisionBlueprint } from "./DemoScene3DecisionBlueprint";
import { DemoScene4LuminousRail } from "./DemoScene4LuminousRail";

export const DEMO_FPS = 30;
export const DEMO_DURATION_SEC = 57.40;
export const DEMO_TOTAL_FRAMES = Math.round(DEMO_DURATION_SEC * DEMO_FPS);

const DEMO_SCENES: Array<{ id: string; start: number; end: number; Component: React.FC }> = [
  { id: "demo_d1", start: 0.00, end: 11.45, Component: DemoScene1Runway365 },
  { id: "demo_d2", start: 11.45, end: 23.45, Component: DemoScene2NytCurve },
  { id: "demo_d3", start: 23.45, end: 38.65, Component: DemoScene3DecisionBlueprint },
  { id: "demo_d4", start: 38.65, end: 57.40, Component: DemoScene4LuminousRail },
];

export const DemoOpenMotionComposition: React.FC<{ masterAudioFile?: string }> = ({
  masterAudioFile = "audio/demo_skill_moi_zoom_master.mp3",
}) => {
  const ready = useHydrographicFonts();
  if (!ready) return <AbsoluteFill style={{ backgroundColor: PALETTE.abyss }} />;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.abyss }}>
      <Audio src={staticFile(masterAudioFile)} />
      {DEMO_SCENES.map((s) => {
        const from = Math.round(s.start * DEMO_FPS);
        const endF = Math.round(s.end * DEMO_FPS);
        const durationInFrames = Math.max(1, endF - from);
        const SceneComp = s.Component;
        return (
          <Sequence key={s.id} name={s.id} from={from} durationInFrames={durationInFrames}>
            <SceneComp />
          </Sequence>
        );
      })}
      <CinemaMapGradeOverlay />
      <DemoKeywordCaptionBar />
    </AbsoluteFill>
  );
};

