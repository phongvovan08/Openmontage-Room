import React from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useHydrographicFonts } from "./fonts";
import { PALETTE } from "./theme";
import { Scene01Overview } from "./scenes/Scene01Overview";
import { Scene02Zoom } from "./scenes/Scene02Zoom";
import { Scene03FeederDetour } from "./scenes/Scene03FeederDetour";
import { Scene04PinLabel } from "./scenes/Scene04PinLabel";
import { Scene05RiverCrossSectionCard } from "./scenes/Scene05RiverCrossSectionCard";
import { Scene06Route } from "./scenes/Scene06Route";
import { Scene07Measure } from "./scenes/Scene07Measure";
import { Scene08BathymetricProfile } from "./scenes/Scene08BathymetricProfile";
import { Scene09StatusLedger } from "./scenes/Scene09StatusLedger";
import { KeywordCaptionBar } from "./scenes/KeywordCaptionBar";

export interface SceneWindow {
  id: string;
  start_seconds: number;
  end_seconds: number;
}

export interface SceneProps {
  fps?: number;
  width?: number;
  height?: number;
  totalDurationSeconds?: number;
  masterAudioFile?: string;
  scenes?: SceneWindow[];
}

export const DEFAULT_SCENES: SceneWindow[] = [
  { id: "scene_01", start_seconds: 0.0, end_seconds: 12.0 },
  { id: "scene_02", start_seconds: 12.0, end_seconds: 22.0 },
  { id: "scene_03", start_seconds: 22.0, end_seconds: 28.5 },
  { id: "scene_04", start_seconds: 28.5, end_seconds: 40.5 },
  { id: "scene_05", start_seconds: 40.5, end_seconds: 49.6 },
  { id: "scene_06", start_seconds: 49.6, end_seconds: 61.2 },
  { id: "scene_07", start_seconds: 61.2, end_seconds: 69.7 },
  { id: "scene_08", start_seconds: 69.7, end_seconds: 78.2 },
  { id: "scene_09", start_seconds: 78.2, end_seconds: 90.0 },
];

const SCENE_COMPONENTS: Record<string, React.FC> = {
  scene_01: Scene01Overview,
  scene_02: Scene02Zoom,
  scene_03: Scene03FeederDetour,
  scene_04: Scene04PinLabel,
  scene_05: Scene05RiverCrossSectionCard,
  scene_06: Scene06Route,
  scene_07: Scene07Measure,
  scene_08: Scene08BathymetricProfile,
  scene_09: Scene09StatusLedger,
};

const SceneEnvelope: React.FC<{ isFirst: boolean; isLast: boolean; children: React.ReactNode }> = ({
  isFirst,
  isLast,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const enterOpacity = isFirst
    ? 1
    : interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitOpacity = isLast
    ? interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [1, 0.96], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : interpolate(frame, [durationInFrames - 8, durationInFrames - 1], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  return <AbsoluteFill style={{ opacity: Math.min(enterOpacity, exitOpacity) }}>{children}</AbsoluteFill>;
};

export const Scene: React.FC<SceneProps> = (props) => {
  useHydrographicFonts();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scenes = props.scenes && props.scenes.length > 0 ? props.scenes : DEFAULT_SCENES;
  const audioFile = props.masterAudioFile || "audio/master_audio.mp3";
  const progressPct = (frame / Math.max(1, durationInFrames - 1)) * 100;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.deepSea }}>
      <Audio src={staticFile(audioFile)} />

      {scenes.map((sc, idx) => {
        const Comp = SCENE_COMPONENTS[sc.id];
        if (!Comp) return null;
        const from = Math.round(sc.start_seconds * fps);
        const endFrame = Math.round(sc.end_seconds * fps);
        const dur = Math.max(1, endFrame - from);

        return (
          <Sequence key={sc.id} from={from} durationInFrames={dur} name={sc.id}>
            <SceneEnvelope isFirst={idx === 0} isLast={idx === scenes.length - 1}>
              <Comp />
            </SceneEnvelope>
          </Sequence>
        );
      })}

      {/* Word-synced clean Vietnamese subtitle bar with highlighted metrics */}
      <KeywordCaptionBar />

      {/* Subtle 3px timeline progress hairline at bottom edge */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 3,
          width: `${progressPct}%`,
          background: `linear-gradient(90deg, ${PALETTE.coastStroke}, ${PALETTE.tealDeep})`,
          opacity: 0.75,
        }}
      />
    </AbsoluteFill>
  );
};

export const calculateMetadata: CalculateMetadataFunction<SceneProps> = async ({ props }) => {
  const fps = props.fps || 30;
  const totalSeconds = props.totalDurationSeconds || 90;
  return {
    durationInFrames: Math.round(totalSeconds * fps),
    fps,
    width: props.width || 1920,
    height: props.height || 1080,
  };
};
