import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video as OffthreadVideo } from "@remotion/media";
import { CaptionOverlay, WordCaption } from "./components/CaptionOverlay";
import { resolveAsset } from "./lib/resolveAsset";
import { TextCard } from "./components/TextCard";
import { StatCard } from "./components/StatCard";
import { CalloutBox } from "./components/CalloutBox";
import { ComparisonCard } from "./components/ComparisonCard";
import { BarChart } from "./components/charts/BarChart";
import { LineChart } from "./components/charts/LineChart";
import { PieChart } from "./components/charts/PieChart";
import { KPIGrid } from "./components/charts/KPIGrid";
import { HeroTitle } from "./components/HeroTitle";
import { SectionTitle } from "./components/SectionTitle";
import { StatReveal } from "./components/StatReveal";

// ---------------------------------------------------------------------------
// Overlay types for talking-head video
// ---------------------------------------------------------------------------

export interface TalkingHeadOverlay {
  id?: string;
  type: string;
  in_seconds: number;
  out_seconds: number;
  position?:
    | "lower_third"
    | "upper_third"
    | "left_panel"
    | "right_panel"
    | "full_overlay";
  // Component-specific props (same as Explainer Cut)
  text?: string;
  stat?: string;
  subtitle?: string;
  callout_type?: "info" | "warning" | "tip" | "quote";
  title?: string;
  leftLabel?: string;
  rightLabel?: string;
  leftValue?: string;
  rightValue?: string;
  chartData?: any[];
  chartSeries?: any[];
  chartColors?: string[];
  chartAnimation?: string;
  donut?: boolean;
  centerLabel?: string;
  centerValue?: string;
  showGrid?: boolean;
  showValues?: boolean;
  showLegend?: boolean;
  showMarkers?: boolean;
  columns?: 2 | 3 | 4;
  // Styling
  backgroundColor?: string;
  color?: string;
  accentColor?: string;
  fontSize?: number;
}

// ---------------------------------------------------------------------------
// Position presets for 9:16 (1080x1920) frame
// ---------------------------------------------------------------------------

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  lower_third: {
    position: "absolute",
    bottom: 320, // Above caption area (~1600px)
    left: 40,
    right: 40,
    height: 480,
  },
  upper_third: {
    position: "absolute",
    top: 80,
    left: 40,
    right: 40,
    height: 480,
  },
  left_panel: {
    position: "absolute",
    top: 200,
    left: 40,
    width: 480,
    bottom: 400,
  },
  right_panel: {
    position: "absolute",
    top: 200,
    right: 40,
    width: 480,
    bottom: 400,
  },
  full_overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

// ---------------------------------------------------------------------------
// Overlay component dispatcher — maps overlay type to Remotion component
// ---------------------------------------------------------------------------

const OverlayContent: React.FC<{ overlay: TalkingHeadOverlay }> = ({
  overlay,
}) => {
  const bgColor = overlay.backgroundColor || "#0F172A";

  if (overlay.type === "text_card" && overlay.text) {
    return (
      <TextCard
        text={overlay.text}
        fontSize={overlay.fontSize}
        color={overlay.color}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "stat_card" && overlay.stat) {
    return (
      <StatCard
        stat={overlay.stat}
        subtitle={overlay.subtitle}
        accentColor={overlay.accentColor}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "callout" && overlay.text) {
    return (
      <CalloutBox
        text={overlay.text}
        type={overlay.callout_type}
        title={overlay.title}
        borderColor={overlay.accentColor}
        backgroundColor={overlay.backgroundColor}
        textColor={overlay.color}
        containerBackgroundColor={bgColor}
      />
    );
  }
  if (
    overlay.type === "comparison" &&
    overlay.leftLabel &&
    overlay.rightLabel
  ) {
    return (
      <ComparisonCard
        leftLabel={overlay.leftLabel}
        rightLabel={overlay.rightLabel}
        leftValue={overlay.leftValue || ""}
        rightValue={overlay.rightValue || ""}
        title={overlay.title}
        backgroundColor={bgColor}
        textColor={overlay.color}
      />
    );
  }
  if (overlay.type === "bar_chart" && overlay.chartData) {
    return (
      <BarChart
        data={overlay.chartData}
        title={overlay.title}
        colors={overlay.chartColors}
        animationStyle={(overlay.chartAnimation as any) || "grow-up"}
        showValues={overlay.showValues}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "line_chart" && overlay.chartSeries) {
    return (
      <LineChart
        series={overlay.chartSeries}
        title={overlay.title}
        colors={overlay.chartColors}
        animationStyle={(overlay.chartAnimation as any) || "draw"}
        showGrid={overlay.showGrid}
        showMarkers={overlay.showMarkers}
        showLegend={overlay.showLegend}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "pie_chart" && overlay.chartData) {
    return (
      <PieChart
        data={overlay.chartData}
        title={overlay.title}
        colors={overlay.chartColors}
        animationStyle={(overlay.chartAnimation as any) || "expand"}
        donut={overlay.donut}
        centerLabel={overlay.centerLabel}
        centerValue={overlay.centerValue}
        showLegend={overlay.showLegend}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "kpi_grid" && overlay.chartData) {
    return (
      <KPIGrid
        metrics={overlay.chartData}
        title={overlay.title}
        columns={overlay.columns}
        colors={overlay.chartColors}
        animationStyle={(overlay.chartAnimation as any) || "count-up"}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "hero_title" && overlay.text) {
    return <HeroTitle title={overlay.text} subtitle={overlay.subtitle} />;
  }
  if (overlay.type === "section_title" && overlay.text) {
    return (
      <SectionTitle
        title={overlay.text}
        subtitle={overlay.subtitle}
        accentColor={overlay.accentColor}
        position="top-left"
      />
    );
  }
  if (overlay.type === "stat_reveal" && overlay.text) {
    return (
      <StatReveal
        stat={overlay.text}
        label={overlay.subtitle}
        accentColor={overlay.accentColor}
        position="bottom-right"
      />
    );
  }
  return null;
};

// ---------------------------------------------------------------------------
// Positioned overlay wrapper — handles position + fade in/out
// ---------------------------------------------------------------------------

const PositionedOverlay: React.FC<{ overlay: TalkingHeadOverlay }> = ({
  overlay,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade in over 8 frames (~0.27s), fade out over 8 frames
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = fadeIn * fadeOut;

  const position = overlay.position || "lower_third";
  const posStyle = POSITION_STYLES[position] || POSITION_STYLES.lower_third;
  const isFullOverlay = position === "full_overlay";

  return (
    <div
      style={{
        ...posStyle,
        opacity,
        overflow: "hidden",
        borderRadius: isFullOverlay ? 0 : 16,
        boxShadow: isFullOverlay
          ? "none"
          : "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      {isFullOverlay && (
        <AbsoluteFill style={{ background: "rgba(0, 0, 0, 0.7)" }} />
      )}
      <OverlayContent overlay={overlay} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main TalkingHead composition
// ---------------------------------------------------------------------------

export interface TalkingHeadClip {
  src: string;
  in_seconds: number;
  out_seconds: number;
  trimBeforeSeconds?: number;
  label?: string;
}

export interface TalkingHeadProps {
  [key: string]: unknown;
  durationSeconds?: number;
  videoSrc: string;
  clips?: TalkingHeadClip[];
  topBannerTitle?: string;
  topBannerSubtitle?: string;
  audio?: {
    narration?: { src: string; volume?: number };
    music?: {
      src: string;
      volume?: number;
      fadeInSeconds?: number;
      fadeOutSeconds?: number;
    };
  };
  captions: WordCaption[];
  overlays?: TalkingHeadOverlay[];
  wordsPerPage?: number;
  fontSize?: number;
  highlightColor?: string;
  captionColor?: string;
  captionBackgroundColor?: string;
  captionFontFamily?: string;
  // Pass "" for CJK captions (no inter-word spacing); defaults to " ".
  captionWordSeparator?: string;
}

export const calculateTalkingHeadMetadata: CalculateMetadataFunction<
  TalkingHeadProps
> = async ({ props }) => {
  if (props.durationSeconds && props.durationSeconds > 0) {
    return { durationInFrames: Math.ceil(props.durationSeconds * 30) };
  }
  const clipMax =
    props.clips && props.clips.length > 0
      ? Math.max(...props.clips.map((c) => c.out_seconds))
      : 0;
  const capMax =
    props.captions && props.captions.length > 0
      ? Math.max(...props.captions.map((w) => w.endMs / 1000))
      : 0;
  const dur = Math.max(clipMax, capMax, 30);
  return { durationInFrames: Math.ceil((dur + 0.5) * 30) };
};

export const TalkingHead: React.FC<TalkingHeadProps> = ({
  videoSrc,
  clips,
  topBannerTitle,
  topBannerSubtitle,
  audio,
  captions,
  overlays,
  wordsPerPage = 4,
  fontSize = 52,
  highlightColor = "#22D3EE",
  captionColor = "#FFFFFF",
  captionBackgroundColor = "rgba(0, 0, 0, 0.65)",
  captionFontFamily,
  captionWordSeparator,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;
  const activeClip = clips?.find(
    (c) => currentSec >= c.in_seconds && currentSec < c.out_seconds
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#050811" }}>
      {/* Audio Tracks */}
      {audio?.narration?.src && (
        <Audio
          src={resolveAsset(audio.narration.src)}
          volume={audio.narration.volume ?? 1.0}
        />
      )}
      {audio?.music?.src && (
        <Audio
          src={resolveAsset(audio.music.src)}
          volume={audio.music.volume ?? 0.28}
        />
      )}

      {/* Layer 1: Multi-clip 9:16 B-roll sequence or single videoSrc */}
      {clips && clips.length > 0 ? (
        clips.map((clip, idx) => {
          const from = Math.round(clip.in_seconds * fps);
          const dur = Math.max(
            1,
            Math.round((clip.out_seconds - clip.in_seconds) * fps)
          );
          const trimBefore = clip.trimBeforeSeconds
            ? Math.round(clip.trimBeforeSeconds * fps)
            : 0;
          return (
            <Sequence key={`clip-${idx}`} from={from} durationInFrames={dur}>
              <AbsoluteFill>
                <OffthreadVideo
                  muted
                  src={resolveAsset(clip.src)}
                  trimBefore={trimBefore}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "contrast(1.06) saturate(0.95) brightness(0.86)",
                  }}
                />
                <AbsoluteFill
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(5,8,17,0.72) 0%, rgba(5,8,17,0.12) 28%, rgba(5,8,17,0.18) 68%, rgba(5,8,17,0.88) 100%)",
                  }}
                />
              </AbsoluteFill>
            </Sequence>
          );
        })
      ) : (
        <OffthreadVideo
          src={resolveAsset(videoSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {/* Top Vertical Header Pill (TikTok / Reels / Shorts Header) */}
      {(topBannerTitle || activeClip?.label) && (
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 44,
            right: 44,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {activeClip?.label && (
            <div
              style={{
                background: "rgba(250, 204, 21, 0.16)",
                border: "1.5px solid rgba(250, 204, 21, 0.65)",
                color: "#FACC15",
                padding: "8px 24px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 2.2,
                marginBottom: 14,
                backdropFilter: "blur(8px)",
              }}
            >
              {activeClip.label}
            </div>
          )}
          {topBannerTitle && (
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: "#F8FAFC",
                letterSpacing: 0.5,
                textShadow: "0 4px 18px rgba(0,0,0,0.85)",
              }}
            >
              {topBannerTitle}
            </div>
          )}
          {topBannerSubtitle && (
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                color: "#CBD5E1",
                marginTop: 6,
                maxWidth: 920,
                textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              }}
            >
              {topBannerSubtitle}
            </div>
          )}
        </div>
      )}

      {/* Layer 2: Overlays (charts, stats, callouts, etc.) */}
      {overlays?.map((overlay, i) => {
        const from = Math.round(overlay.in_seconds * fps);
        const duration = Math.round(
          (overlay.out_seconds - overlay.in_seconds) * fps
        );
        return (
          <Sequence
            key={overlay.id || `overlay-${i}`}
            from={from}
            durationInFrames={duration}
          >
            <PositionedOverlay overlay={overlay} />
          </Sequence>
        );
      })}

      {/* Layer 3: Captions (topmost — always visible above overlays) */}
      <CaptionOverlay
        words={captions}
        wordsPerPage={wordsPerPage}
        fontSize={fontSize}
        highlightColor={highlightColor}
        backgroundColor={captionBackgroundColor}
        color={captionColor}
        {...(captionFontFamily ? { fontFamily: captionFontFamily } : {})}
        {...(captionWordSeparator !== undefined ? { wordSeparator: captionWordSeparator } : {})}
      />
    </AbsoluteFill>
  );
};
