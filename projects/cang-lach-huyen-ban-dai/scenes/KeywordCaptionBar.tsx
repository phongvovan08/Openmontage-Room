import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTION_CUES, HighlightTone } from "../data/captionCues";
import { FONTS, PALETTE } from "../theme";

function toneColor(tone: HighlightTone, isSpoken: boolean): string {
  if (!isSpoken) return "rgba(203, 213, 225, 0.58)";
  if (tone === "teal") return PALETTE.tealDeep;
  if (tone === "gold") return "#FACC15";
  if (tone === "coral") return "#FB7185";
  return "#FFFFFF";
}

function toneUnderline(tone: HighlightTone, isSpoken: boolean): string {
  if (!tone || !isSpoken) return "none";
  if (tone === "teal") return `inset 0 -2px 0 ${PALETTE.tealDeep}`;
  if (tone === "gold") return "inset 0 -2px 0 #FACC15";
  return "inset 0 -2px 0 #FB7185";
}

/**
 * Stationary broadcast subtitle bar:
 * - Zero translateY / scale bounce on cue transitions.
 * - Zero padding / fontWeight / border width changes when words become spoken/active,
 *   guaranteeing 0.00px horizontal layout shift ("không thụt ra thụt vào") while reading.
 */
export const KeywordCaptionBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const videoEndSec = durationInFrames / fps;
  const t = frame / fps;

  const cueIdx = CAPTION_CUES.findIndex((c, idx) => {
    const nextStart = idx + 1 < CAPTION_CUES.length ? CAPTION_CUES[idx + 1].start : videoEndSec;
    const holdEnd = Math.min(c.end + 0.18, nextStart - 0.01);
    return t >= c.start - 0.03 && t <= holdEnd;
  });

  if (cueIdx < 0) return null;
  const cue = CAPTION_CUES[cueIdx];
  const nextStart = cueIdx + 1 < CAPTION_CUES.length ? CAPTION_CUES[cueIdx + 1].start : videoEndSec;
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
          borderRadius: 12,
          background: "rgba(4, 11, 22, 0.92)",
          border: "1.5px solid rgba(56, 189, 248, 0.28)",
          boxShadow: "0 10px 26px rgba(0, 0, 0, 0.68)",
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
                color: toneColor(tok.highlight, isSpoken),
                boxShadow: toneUnderline(tok.highlight, isSpoken),
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
