import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, PALETTE } from "../theme";
import { DEMO_CAPTION_CUES } from "./demoCaptionCues";

/**
 * Monochrome Stationary Broadcast Subtitle Bar for DemoOpenMotion57s:
 * - Zero color keyword tints, zero underlines (boxShadow: "none"), 0.00px layout shift.
 */
export const DemoKeywordCaptionBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const videoEndSec = durationInFrames / fps;
  const t = frame / fps;

  const cueIdx = DEMO_CAPTION_CUES.findIndex((c, idx) => {
    const nextStart = idx + 1 < DEMO_CAPTION_CUES.length ? DEMO_CAPTION_CUES[idx + 1].start : videoEndSec;
    const holdEnd = Math.min(c.end + 0.18, nextStart - 0.01);
    return t >= c.start - 0.03 && t <= holdEnd;
  });

  if (cueIdx < 0) return null;
  const cue = DEMO_CAPTION_CUES[cueIdx];
  const nextStart = cueIdx + 1 < DEMO_CAPTION_CUES.length ? DEMO_CAPTION_CUES[cueIdx + 1].start : videoEndSec;
  const holdEnd = Math.min(cue.end + 0.18, nextStart - 0.01);

  const enter = interpolate(t, [cue.start - 0.03, cue.start + 0.05], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(t, [holdEnd - 0.06, holdEnd], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barOpacity = Math.min(enter, exit);

  if (barOpacity <= 0.02) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 14,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 65,
        opacity: barOpacity,
      }}
    >
      <div
        style={{
          maxWidth: 1260,
          padding: "8px 22px",
          borderRadius: 10,
          background: "rgba(18, 17, 16, 0.93)",
          border: `1px solid ${PALETTE.borderHairline}`,
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255, 252, 240, 0.08)",
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "baseline",
          gap: 6,
          whiteSpace: "nowrap",
        }}
      >
        {cue.tokens.map((tok, i) => {
          const isSpoken = t >= tok.start - 0.02;
          return (
            <span
              key={`${cue.id}-${i}`}
              style={{
                fontFamily: FONTS.display,
                fontSize: 20.5,
                fontWeight: 700,
                color: isSpoken ? "#FFFCF0" : "rgba(206, 205, 195, 0.52)",
                boxShadow: "none",
                padding: "1px 0px",
                lineHeight: 1.28,
              }}
            >
              {tok.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

