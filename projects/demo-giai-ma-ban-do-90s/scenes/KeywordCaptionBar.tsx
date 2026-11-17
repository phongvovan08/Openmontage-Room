import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTION_CUES } from "../data/captionCues";
import { FONTS, PALETTE } from "../theme";

/**
 * Stationary broadcast subtitle bar (Monochrome Editorial Ivory):
 * - Zero translateY / scale bounce on cue transitions.
 * - Zero keyword color tints, zero underlines, and zero layout shift while reading.
 */
export const KeywordCaptionBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const cueIdx = CAPTION_CUES.findIndex((c, idx) => {
    const nextStart = idx + 1 < CAPTION_CUES.length ? CAPTION_CUES[idx + 1].start : 90.0;
    const holdEnd = Math.min(c.end + 0.18, nextStart - 0.01);
    return t >= c.start - 0.03 && t <= holdEnd;
  });

  if (cueIdx < 0) return null;
  const cue = CAPTION_CUES[cueIdx];
  const nextStart = cueIdx + 1 < CAPTION_CUES.length ? CAPTION_CUES[cueIdx + 1].start : 90.0;
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
        bottom: 12,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 65,
        opacity: barOpacity,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          padding: "8px 22px",
          borderRadius: 10,
          background: "rgba(18, 17, 16, 0.93)",
          border: `1px solid ${PALETTE.borderSubtle}`,
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
                fontFamily: FONTS.sans,
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
