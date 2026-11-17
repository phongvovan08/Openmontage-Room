import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { useHydrographicFonts } from "./fonts";
import { PALETTE } from "./theme";
import { CinemaMapGradeOverlay } from "./scenes/EditorialThemeKit";
import { KeywordCaptionBar } from "./scenes/KeywordCaptionBar";
import { Scene01 } from "./scenes/Scene01";
import { Scene02 } from "./scenes/Scene02";
import { Scene03 } from "./scenes/Scene03";
import { Scene04 } from "./scenes/Scene04";
import { Scene05 } from "./scenes/Scene05";
import { Scene06 } from "./scenes/Scene06";
import { Scene07 } from "./scenes/Scene07";
import { Scene08 } from "./scenes/Scene08";
import { Scene09 } from "./scenes/Scene09";
import { Scene10 } from "./scenes/Scene10";
import { Scene11 } from "./scenes/Scene11";
import { Scene12 } from "./scenes/Scene12";
import { Scene13 } from "./scenes/Scene13";
import { Scene14 } from "./scenes/Scene14";
import { Scene15 } from "./scenes/Scene15";
import { Scene16 } from "./scenes/Scene16";
import { Scene17 } from "./scenes/Scene17";
import { Scene18 } from "./scenes/Scene18";
import { Scene19 } from "./scenes/Scene19";
import { Scene20 } from "./scenes/Scene20";

export const TOTAL_DURATION_SEC = 668.27;
export const FPS = 30;
export const TOTAL_FRAMES = Math.round(TOTAL_DURATION_SEC * FPS);

const SCENE_SPECS: Array<{ id: string; start: number; end: number; Component: React.FC }> = [
  { id: "scene_01", start: 0.0, end: 30.67, Component: Scene01 },
  { id: "scene_02", start: 30.67, end: 63.93, Component: Scene02 },
  { id: "scene_03", start: 63.93, end: 95.24, Component: Scene03 },
  { id: "scene_04", start: 95.24, end: 127.06, Component: Scene04 },
  { id: "scene_05", start: 127.06, end: 158.53, Component: Scene05 },
  { id: "scene_06", start: 158.53, end: 187.93, Component: Scene06 },
  { id: "scene_07", start: 187.93, end: 220.08, Component: Scene07 },
  { id: "scene_08", start: 220.08, end: 253.9, Component: Scene08 },
  { id: "scene_09", start: 253.9, end: 288.79, Component: Scene09 },
  { id: "scene_10", start: 288.79, end: 322.04, Component: Scene10 },
  { id: "scene_11", start: 322.04, end: 355.93, Component: Scene11 },
  { id: "scene_12", start: 355.93, end: 389.96, Component: Scene12 },
  { id: "scene_13", start: 389.96, end: 424.77, Component: Scene13 },
  { id: "scene_14", start: 424.77, end: 459.77, Component: Scene14 },
  { id: "scene_15", start: 459.77, end: 494.49, Component: Scene15 },
  { id: "scene_16", start: 494.49, end: 531.43, Component: Scene16 },
  { id: "scene_17", start: 531.43, end: 563.89, Component: Scene17 },
  { id: "scene_18", start: 563.89, end: 597.75, Component: Scene18 },
  { id: "scene_19", start: 597.75, end: 631.76, Component: Scene19 },
  { id: "scene_20", start: 631.76, end: 668.27, Component: Scene20 },
];

export const SanBayLongThanh40kmComposition: React.FC<{ masterAudioFile?: string }> = ({
  masterAudioFile = "audio/master_audio.mp3",
}) => {
  const ready = useHydrographicFonts();
  if (!ready) return <AbsoluteFill style={{ backgroundColor: PALETTE.abyss }} />;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.abyss }}>
      <Audio src={staticFile(masterAudioFile)} />
      {SCENE_SPECS.map((s) => {
        const from = Math.round(s.start * FPS);
        const endF = Math.round(s.end * FPS);
        const durationInFrames = Math.max(1, endF - from);
        const SceneComp = s.Component;
        return (
          <Sequence key={s.id} name={s.id} from={from} durationInFrames={durationInFrames}>
            <SceneComp />
          </Sequence>
        );
      })}
      <CinemaMapGradeOverlay />
      <KeywordCaptionBar />
    </AbsoluteFill>
  );
};
