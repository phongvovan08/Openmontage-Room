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
import { Scene01ColdOpen } from "./scenes/Scene01ColdOpen";
import { Scene02Colonial1874Rail } from "./scenes/Scene02Colonial1874Rail";
import { Scene03VesselEvolutionScale } from "./scenes/Scene03VesselEvolutionScale";
import { Scene04EstuaryDive48km } from "./scenes/Scene04EstuaryDive48km";
import { Scene05SingaporeDetour } from "./scenes/Scene05SingaporeDetour";
import { Scene06SiltDossier1995 } from "./scenes/Scene06SiltDossier1995";
import { Scene07HaNamCanal1904 } from "./scenes/Scene07HaNamCanal1904";
import { Scene08UrbanBridgeAirDraft } from "./scenes/Scene08UrbanBridgeAirDraft";
import { Scene09RiverCutaway3D } from "./scenes/Scene09RiverCutaway3D";
import { Scene10AnnualSiltFunnel } from "./scenes/Scene10AnnualSiltFunnel";
import { Scene11SeaBridgeFlyover } from "./scenes/Scene11SeaBridgeFlyover";
import { Scene12SandDikeShield } from "./scenes/Scene12SandDikeShield";
import { Scene13SplitChannelRace } from "./scenes/Scene13SplitChannelRace";
import { Scene14BathymetricClash } from "./scenes/Scene14BathymetricClash";
import { Scene15SixBerthsMegaport } from "./scenes/Scene15SixBerthsMegaport";
import { Scene16DirectTranspacificRoutes } from "./scenes/Scene16DirectTranspacificRoutes";
import { Scene17Berths78NamDoSon1579 } from "./scenes/Scene17Berths78NamDoSon1579";
import { Scene18StandardGaugeRail1435 } from "./scenes/Scene18StandardGaugeRail1435";
import { Scene19GrandFinale150Years } from "./scenes/Scene19GrandFinale150Years";
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
  { id: "scene_01", start_seconds: 0.0, end_seconds: 25.6 },
  { id: "scene_02", start_seconds: 25.6, end_seconds: 62.79 },
  { id: "scene_03", start_seconds: 62.79, end_seconds: 93.35 },
  { id: "scene_04", start_seconds: 93.35, end_seconds: 118.4 },
  { id: "scene_05", start_seconds: 118.4, end_seconds: 152.32 },
  { id: "scene_06", start_seconds: 152.32, end_seconds: 180.34 },
  { id: "scene_07", start_seconds: 180.34, end_seconds: 212.82 },
  { id: "scene_08", start_seconds: 212.82, end_seconds: 244.09 },
  { id: "scene_09", start_seconds: 244.09, end_seconds: 275.15 },
  { id: "scene_10", start_seconds: 275.15, end_seconds: 311.67 },
  { id: "scene_11", start_seconds: 311.67, end_seconds: 340.81 },
  { id: "scene_12", start_seconds: 340.81, end_seconds: 373.02 },
  { id: "scene_13", start_seconds: 373.02, end_seconds: 404.97 },
  { id: "scene_14", start_seconds: 404.97, end_seconds: 437.85 },
  { id: "scene_15", start_seconds: 437.85, end_seconds: 472.99 },
  { id: "scene_16", start_seconds: 472.99, end_seconds: 500.85 },
  { id: "scene_17", start_seconds: 500.85, end_seconds: 532.4 },
  { id: "scene_18", start_seconds: 532.4, end_seconds: 562.13 },
  { id: "scene_19", start_seconds: 562.13, end_seconds: 590.44 },
];

const SCENE_COMPONENTS: Record<string, React.FC> = {
  scene_01: Scene01ColdOpen,
  scene_02: Scene02Colonial1874Rail,
  scene_03: Scene03VesselEvolutionScale,
  scene_04: Scene04EstuaryDive48km,
  scene_05: Scene05SingaporeDetour,
  scene_06: Scene06SiltDossier1995,
  scene_07: Scene07HaNamCanal1904,
  scene_08: Scene08UrbanBridgeAirDraft,
  scene_09: Scene09RiverCutaway3D,
  scene_10: Scene10AnnualSiltFunnel,
  scene_11: Scene11SeaBridgeFlyover,
  scene_12: Scene12SandDikeShield,
  scene_13: Scene13SplitChannelRace,
  scene_14: Scene14BathymetricClash,
  scene_15: Scene15SixBerthsMegaport,
  scene_16: Scene16DirectTranspacificRoutes,
  scene_17: Scene17Berths78NamDoSon1579,
  scene_18: Scene18StandardGaugeRail1435,
  scene_19: Scene19GrandFinale150Years,
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
    ? interpolate(frame, [durationInFrames - 14, durationInFrames - 1], [1, 0.94], {
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

      {/* Word-synced stationary Vietnamese subtitle bar */}
      <KeywordCaptionBar />

      {/* Subtle 3px progress hairline */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: `${progressPct.toFixed(2)}%`,
          height: 3,
          backgroundColor: PALETTE.tealDeep,
          opacity: 0.72,
          zIndex: 70,
        }}
      />
    </AbsoluteFill>
  );
};

export const calculateMetadata: CalculateMetadataFunction<SceneProps> = ({ props }) => {
  const fps = props.fps || 30;
  const durationSeconds = props.totalDurationSeconds || 590.44;
  return {
    durationInFrames: Math.max(1, Math.round(durationSeconds * fps)),
    fps,
    width: props.width || 1920,
    height: props.height || 1080,
  };
};

