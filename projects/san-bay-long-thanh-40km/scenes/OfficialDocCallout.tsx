import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, PALETTE } from "../theme";

export interface OfficialDocCalloutProps {
  docCode: string;
  issuer: string;
  leadText: string;
  highlightText: string;
  trailText?: string;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  width: number;
  appearAtSec: number;
  disappearAtSec: number;
  accentColor?: string;
}

export const OfficialDocCallout: React.FC<OfficialDocCalloutProps> = ({
  docCode,
  issuer,
  leadText,
  highlightText,
  trailText,
  left,
  right,
  top,
  bottom,
  width,
  appearAtSec,
  disappearAtSec,
  accentColor = PALETTE.goldCaution,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  if (sec < appearAtSec - 0.05 || sec > disappearAtSec + 0.05) {
    return null;
  }

  const enter = spring({
    frame: Math.max(0, frame - Math.round(appearAtSec * fps)),
    fps,
    config: { damping: 19, stiffness: 145 },
  });

  const exit = interpolate(sec, [disappearAtSec - 0.35, disappearAtSec], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const visibility = Math.min(enter, exit);

  const sweepProgress = interpolate(
    sec,
    [appearAtSec + 0.32, appearAtSec + 0.88],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
      <div
        style={{
          position: "absolute",
          left,
          right,
          top,
          bottom,
          width,
          borderRadius: 8,
          overflow: "hidden",
          background: PALETTE.dossierPaper,
          border: "1px solid rgba(28, 27, 26, 0.22)",
          borderTop: `4px solid ${accentColor}`,
          boxShadow: "0 20px 44px rgba(0, 0, 0, 0.52)",
          opacity: visibility,
          transform: `translateY(${(1 - enter) * 18}px) scale(${0.97 + 0.03 * enter})`,
          zIndex: 18,
        }}
      >
      {/* Archival Legal Dossier Header Strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          background: PALETTE.surfaceNavy,
          borderBottom: `2px solid ${accentColor}`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 13.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: accentColor,
          }}
        >
          {docCode}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: PALETTE.mist,
            textTransform: "uppercase",
          }}
        >
          {issuer}
        </div>
      </div>

      {/* Cream Paper Quote Body */}
      <div
        style={{
          padding: "14px 18px 16px",
          background: `linear-gradient(180deg, ${PALETTE.dossierCream} 0%, ${PALETTE.dossierPaper} 100%)`,
          fontFamily: FONTS.display,
          fontSize: 18.5,
          lineHeight: 1.5,
          color: PALETTE.dossierInk,
        }}
      >
        <span>{leadText} </span>
        <span
          style={{
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 4,
            backgroundImage: `linear-gradient(90deg, rgba(229, 175, 40, 0.44) 0%, rgba(229, 175, 40, 0.44) 100%)`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${(sweepProgress * 100).toFixed(1)}% 100%`,
            boxDecorationBreak: "clone",
          }}
        >
          {highlightText}
        </span>
        {trailText ? <span> {trailText}</span> : null}
      </div>
    </div>
  );
};
