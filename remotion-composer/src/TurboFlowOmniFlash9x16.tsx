import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HAITRIEU_WORDS } from "./haitrieuCaptions";

export interface TurboFlowOmniFlash9x16Props {
  durationSeconds?: number;
}

const CLIPS = [
  {
    src: "episodes/turboflow-mode-a/001.mp4",
    title: "BẪY PHẢN ỨNG TỨC THÌ",
    tag: "CLIP 01 · OMNI FLASH 10S",
  },
  {
    src: "episodes/turboflow-mode-a/002.mp4",
    title: "HỐ SÂU SUY DIỄN & PHÁN XÉT",
    tag: "CLIP 02 · OMNI FLASH 10S",
  },
  {
    src: "episodes/turboflow-mode-a/003.mp4",
    title: "HIỆU ỨNG DOMINO CẢM XÚC",
    tag: "CLIP 03 · OMNI FLASH 10S",
  },
  {
    src: "episodes/turboflow-mode-a/004.mp4",
    title: "CẮT ĐỨT DÂY GIẬT CẢM XÚC",
    tag: "CLIP 04 · OMNI FLASH 10S",
  },
  {
    src: "episodes/turboflow-mode-a/005.mp4",
    title: "VẼ CÂY CẦU LÀM CHỦ (10% / 90%)",
    tag: "CLIP 05 · OMNI FLASH 10S",
  },
  {
    src: "episodes/turboflow-mode-a/006.mp4",
    title: "GIỮ VỮNG TAY LÁI GIỮA BÃO",
    tag: "CLIP 06 · OMNI FLASH 10S",
  },
  {
    src: "episodes/turboflow-mode-a/007.mp4",
    title: "GẠT CÔNG TẮC LÝ TRÍ",
    tag: "CLIP 07 · OMNI FLASH 10S",
  },
  {
    src: "episodes/turboflow-mode-a/008.mp4",
    title: "KHOẢNG DỪNG TỰ DO 3 GIÂY",
    tag: "CLIP 08 · OMNI FLASH 10S",
  },
  {
    src: "episodes/turboflow-mode-a/009.mp4",
    title: "LÀM CHỦ CẢM XÚC · LÀM CHỦ CUỘC ĐỜI",
    tag: "CLIP 09 · OMNI FLASH 10S",
  },
];

const TopClipBadge: React.FC<{ tag: string; title: string }> = ({
  tag,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 140 } });
  const fadeOut = interpolate(frame, [260, 295], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: enter * fadeOut,
        transform: `translateY(${interpolate(enter, [0, 1], [-30, 0])}px)`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "7px 20px",
          borderRadius: 999,
          backgroundColor: "rgba(15, 23, 42, 0.82)",
          border: "2.5px solid rgba(0, 229, 255, 0.75)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "#EF4444",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 1.4,
            color: "#00E5FF",
          }}
        >
          {tag}
        </span>
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 900,
          color: "#FFFFFF",
          textAlign: "center",
          padding: "10px 26px",
          borderRadius: 18,
          backgroundColor: "rgba(15, 23, 42, 0.82)",
          border: "2.5px solid rgba(255, 255, 255, 0.22)",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
        }}
      >
        {title}
      </div>
    </div>
  );
};

const FinaleProgressiveQuoteOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const globalSec = 82.3 + frame / fps;
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const finaleWords = HAITRIEU_WORDS.filter((w) => w.start >= 82.2);

  return (
    <div
      style={{
        position: "absolute",
        top: 360,
        left: 56,
        right: 56,
        padding: "30px 34px",
        borderRadius: 28,
        backgroundColor: "rgba(9, 11, 16, 0.82)",
        border: "3px solid #FACC15",
        boxShadow: "0 20px 48px rgba(0,0,0,0.65)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px 11px",
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
        pointerEvents: "none",
      }}
    >
      {finaleWords.map((w, idx) => {
        const isLit = globalSec >= w.start;
        const isCurrent = globalSec >= w.start && globalSec <= w.end + 0.15;
        return (
          <span
            key={`f-word-${idx}`}
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: isCurrent
                ? "#FACC15"
                : isLit
                  ? "#FFFFFF"
                  : "rgba(255, 255, 255, 0.28)",
              textShadow: isCurrent
                ? "0 0 16px rgba(250, 204, 21, 0.85)"
                : "none",
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};

const OmniFlashKaraokeSubtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  const chunkSize = 6;
  const activeIdx = HAITRIEU_WORDS.findIndex(
    (w, i) =>
      currentSec >= w.start &&
      (currentSec <= w.end ||
        (HAITRIEU_WORDS[i + 1] && currentSec < HAITRIEU_WORDS[i + 1].start))
  );

  if (activeIdx === -1) return null;
  const chunkStart = Math.floor(activeIdx / chunkSize) * chunkSize;
  const chunk = HAITRIEU_WORDS.slice(chunkStart, chunkStart + chunkSize);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 125,
        left: 44,
        right: 44,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(9, 11, 16, 0.88)",
          border: "3.5px solid #FACC15",
          borderRadius: 26,
          padding: "18px 30px",
          boxShadow: "0 14px 36px rgba(0,0,0,0.55)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px 12px",
          maxWidth: 960,
        }}
      >
        {chunk.map((word, idx) => {
          const globalWordIdx = chunkStart + idx;
          const isCurrent = globalWordIdx === activeIdx;
          const isPast = globalWordIdx < activeIdx;
          return (
            <span
              key={`${word.start}-${idx}`}
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: isCurrent
                  ? "#FACC15"
                  : isPast
                    ? "#FFFFFF"
                    : "rgba(255,255,255,0.45)",
                textShadow: isCurrent
                  ? "0 0 18px rgba(250, 204, 21, 0.75)"
                  : "0 2px 6px rgba(0,0,0,0.8)",
                transform: isCurrent ? "scale(1.08)" : "scale(1)",
                display: "inline-block",
              }}
            >
              {word.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const TurboFlowOmniFlash9x16: React.FC<
  TurboFlowOmniFlash9x16Props
> = () => {
  const { fps } = useVideoConfig();
  const clipFrames = 10 * fps; // 300 frames (10.0s) per clip

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#090B10",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Master Vietnamese Voiceover (Haitrieu 90s) + Music */}
      <Audio
        src={staticFile("episodes/reactive-mind/master_mix_haitrieu_90s.wav")}
        volume={1.0}
      />

      {/* 9 Google Flow Omni Flash 10s Clips (001.mp4 .. 009.mp4) */}
      {CLIPS.map((clip, idx) => (
        <Sequence
          key={clip.src}
          from={idx * clipFrames}
          durationInFrames={clipFrames}
        >
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile(clip.src)}
              volume={0.22}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <TopClipBadge tag={clip.tag} title={clip.title} />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Finale Progressive Quote Pill Box (82.3s - 90.0s) */}
      <Sequence
        from={Math.round(82.3 * fps)}
        durationInFrames={Math.round(7.7 * fps)}
      >
        <FinaleProgressiveQuoteOverlay />
      </Sequence>

      {/* Word-by-Word Karaoke Subtitles */}
      <OmniFlashKaraokeSubtitles />
    </AbsoluteFill>
  );
};

