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
  accentColor = "#F59E0B",
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
        borderRadius: 12,
        overflow: "hidden",
        background: "#FAF8F1",
        border: `2px solid ${accentColor}`,
        boxShadow: "0 20px 44px rgba(0, 0, 0, 0.62)",
        opacity: visibility,
        transform: `translateY(${(1 - enter) * 18}px) scale(${0.97 + 0.03 * enter})`,
        zIndex: 18,
      }}
    >
      {/* Archival Header Strip */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          background: PALETTE.panelBgSolid,
          borderBottom: `1.5px solid ${accentColor}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: FONTS.mono,
            fontSize: 12.5,
            fontWeight: 700,
            color: "#FDE047",
            letterSpacing: "0.05em",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#FACC15",
            }}
          />
          <span>TRÍCH LỤC VĂN BẢN GỐC</span>
        </div>
        <div
          style={{
            padding: "2px 9px",
            borderRadius: 5,
            background: "rgba(250, 204, 21, 0.18)",
            border: "1px solid rgba(250, 204, 21, 0.55)",
            fontFamily: FONTS.mono,
            fontSize: 12.5,
            fontWeight: 700,
            color: "#FEF08A",
          }}
        >
          {docCode}
        </div>
      </div>

      {/* Document Excerpt Body */}
      <div style={{ padding: "12px 18px 14px 18px" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 12.5,
            fontWeight: 700,
            color: "#475569",
            marginBottom: 6,
          }}
        >
          {issuer}
        </div>
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: 17.5,
            fontWeight: 600,
            color: "#0F172A",
            lineHeight: 1.48,
          }}
        >
          &ldquo;{leadText}
          <span
            style={{
              position: "relative",
              display: "inline",
              padding: "1px 5px",
              borderRadius: 4,
              fontWeight: 700,
              color: "#090D16",
              backgroundImage: "linear-gradient(90deg, rgba(250, 204, 21, 0.92), rgba(253, 224, 71, 0.95))",
              backgroundRepeat: "no-repeat",
              backgroundSize: `${(sweepProgress * 100).toFixed(1)}% 92%`,
              backgroundPosition: "0 82%",
            }}
          >
            {highlightText}
          </span>
          {trailText || ""}&rdquo;
        </div>
      </div>
    </div>
  );
};
