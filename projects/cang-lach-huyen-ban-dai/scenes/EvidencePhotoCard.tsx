import React, { useEffect, useId, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { RealPhotoSpec } from "../data/realPhotosManifest";
import { FONTS, PALETTE } from "../theme";

/** Ensure headless Chromium decodes the local JPEG before Remotion captures any frame. */
function useDecodedPhoto(photo: RealPhotoSpec): void {
  const [handle] = useState(() =>
    delayRender(`decode-photo:${photo.id}`, { timeoutInMilliseconds: 45000 })
  );

  useEffect(() => {
    let active = true;
    const img = new Image();
    img.src = staticFile(photo.href);
    img
      .decode()
      .then(() => {
        if (active) continueRender(handle);
      })
      .catch((err) => cancelRender(err));
    return () => {
      active = false;
    };
  }, [handle, photo.href]);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(1e-6, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function closestBorderPoint(
  rect: { left: number; top: number; width: number; height: number },
  target: readonly [number, number]
): [number, number] {
  const [tx, ty] = target;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (Math.abs(dx) < 1e-3 && Math.abs(dy) < 1e-3) {
    return [cx, cy];
  }
  const halfW = rect.width / 2;
  const halfH = rect.height / 2;
  const scaleX = Math.abs(dx) > 1e-3 ? halfW / Math.abs(dx) : Number.POSITIVE_INFINITY;
  const scaleY = Math.abs(dy) > 1e-3 ? halfH / Math.abs(dy) : Number.POSITIVE_INFINITY;
  const s = Math.min(scaleX, scaleY);
  return [cx + dx * s, cy + dy * s];
}

export interface FocusWindowSpec {
  /** Local seconds in the scene when the small card begins zooming up */
  zoomInStartSec: number;
  /** Local seconds when the card reaches full enlarged theater size */
  holdStartSec: number;
  /** Local seconds when the spoken phrase finishes and the card starts zooming back down */
  holdEndSec: number;
  /** Local seconds when the card settles back into its small docked slot */
  zoomOutEndSec: number;
  /** Optional custom enlarged rectangle on the 1920x1080 canvas */
  expandedRect?: { left: number; top: number; width: number; height: number };
}

/**
 * Documentary Evidence Photo Card:
 * 1. Starts docked small in its safe-zone / column slot (with optional GPS tether line).
 * 2. Smoothly zooms up to center stage right when the narrator speaks about that landmark.
 * 3. Draws an animated hydrographic spotlight ring + callout badge circling the key detail!
 * 4. Smoothly zooms back down into its small docked slot as soon as the phrase ends.
 */
export const EvidencePhotoCard: React.FC<{
  photo: RealPhotoSpec;
  left: number;
  top: number;
  width: number;
  height: number;
  accentColor?: string;
  anchorPoint?: readonly [number, number];
  appearAtSec?: number;
  focusWindow?: FocusWindowSpec;
}> = ({
  photo,
  left,
  top,
  width,
  height,
  accentColor = PALETTE.tealDeep,
  anchorPoint,
  appearAtSec = 0,
  focusWindow,
}) => {
  useDecodedPhoto(photo);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width: canvasW, height: canvasH } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);
  const localSec = frame / fps;

  const entrySpring = spring({
    frame: frame - Math.round(appearAtSec * fps),
    fps,
    config: { damping: 20, stiffness: 140 },
  });

  let zoomT = 0;
  let spotDraw = 0;
  let spotFade = 0;
  if (focusWindow) {
    const { zoomInStartSec, holdStartSec, holdEndSec, zoomOutEndSec } = focusWindow;
    if (localSec > zoomInStartSec && localSec < holdStartSec) {
      zoomT = interpolate(localSec, [zoomInStartSec, holdStartSec], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });
    } else if (localSec >= holdStartSec && localSec <= holdEndSec) {
      zoomT = 1;
    } else if (localSec > holdEndSec && localSec < zoomOutEndSec) {
      zoomT = interpolate(localSec, [holdEndSec, zoomOutEndSec], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      });
    }

    const spotIn = interpolate(localSec, [holdStartSec - 0.06, holdStartSec + 0.36], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const spotOut = interpolate(localSec, [holdEndSec - 0.14, holdEndSec + 0.06], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    spotDraw = spotIn;
    spotFade = Math.min(spotIn, spotOut) * smoothstep(0.76, 0.98, zoomT);
  }

  // Place enlarged card slightly above vertical center (top=186 -> bottom=828)
  // leaving 198px of clean space above KeywordCaptionBar at bottom=10!
  const defaultExpandedRect = {
    left: Math.round((canvasW - 1140) / 2),
    top: 186,
    width: 1140,
    height: 642,
  };
  const expRect = focusWindow?.expandedRect ?? defaultExpandedRect;

  const curLeft = interpolate(zoomT, [0, 1], [left, expRect.left]);
  const curTop = interpolate(zoomT, [0, 1], [top, expRect.top]);
  const curW = interpolate(zoomT, [0, 1], [width, expRect.width]);
  const curH = interpolate(zoomT, [0, 1], [height, expRect.height]);

  const backdropOpacity = 0.68 * zoomT * entrySpring;
  const captionScale = interpolate(zoomT, [0, 1], [1, 1.32]);
  const isZooming = zoomT > 0.004;

  // Continuous slow documentary Ken Burns motion + extra subtle push during enlarged hold
  const kbScale = interpolate(progress, [0, 1], [1.02, 1.08]) + 0.025 * zoomT;
  const kbShiftX = interpolate(progress, [0, 1], [-1.1, 1.1]);
  const kbShiftY = interpolate(progress, [0, 1], [-0.8, 0.8]);

  // Coordinate tether is shown when docked small and retracts smoothly while zoomed up
  const tetherVisibility = entrySpring * (1 - smoothstep(0.0, 0.24, zoomT));
  const dockedRect = { left, top, width, height };
  const [startX, startY] = anchorPoint
    ? closestBorderPoint(dockedRect, anchorPoint)
    : [left, top];
  const [endX, endY] = anchorPoint ?? [left, top];
  const lineLen = Math.hypot(endX - startX, endY - startY);

  // Spotlight geometry on curW x curH card
  const sp = photo.spotlight;
  const spCx = sp.cx * curW;
  const spCy = sp.cy * curH;
  const spRx = sp.rx * curW;
  const spRy = sp.ry * curH;
  const badgeCx = sp.badgePos[0] * curW;
  const badgeCy = sp.badgePos[1] * curH;
  const badgeW = 408;
  const badgeH = sp.sublabel ? 60 : 40;
  const badgeLeft = Math.max(18, Math.min(curW - badgeW - 18, badgeCx - badgeW / 2));
  const badgeTop = Math.max(58, Math.min(curH - badgeH - 118, badgeCy - badgeH / 2));
  const badgeBox = { left: badgeLeft, top: badgeTop, width: badgeW, height: badgeH };
  const [bLineX, bLineY] = closestBorderPoint(badgeBox, [spCx, spCy]);
  const angleToBadge = Math.atan2(bLineY - spCy, bLineX - spCx);
  const eLineX = spCx + Math.cos(angleToBadge) * spRx;
  const eLineY = spCy + Math.sin(angleToBadge) * spRy;
  const pulse = ((frame % 36) / 36);

  if (entrySpring <= 0.002) {
    return null;
  }

  return (
    <>
      {backdropOpacity > 0.004 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(4, 11, 20, ${backdropOpacity.toFixed(3)})`,
            pointerEvents: "none",
            zIndex: 48,
          }}
        />
      )}

      {anchorPoint && tetherVisibility > 0.01 && lineLen > 8 && (
        <svg
          width={canvasW}
          height={canvasH}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: tetherVisibility,
            zIndex: 18,
          }}
        >
          <line
            x1={startX}
            y1={startY}
            x2={startX + (endX - startX) * entrySpring}
            y2={startY + (endY - startY) * entrySpring}
            stroke="rgba(5, 13, 24, 0.85)"
            strokeWidth={5.5}
            strokeLinecap="round"
          />
          <line
            x1={startX}
            y1={startY}
            x2={startX + (endX - startX) * entrySpring}
            y2={startY + (endY - startY) * entrySpring}
            stroke={accentColor}
            strokeWidth={2.6}
            strokeDasharray="7 5"
            strokeLinecap="round"
          />
          <circle
            cx={startX}
            cy={startY}
            r={5}
            fill={accentColor}
            stroke="#071320"
            strokeWidth={2}
          />
          {entrySpring > 0.75 && (
            <circle
              cx={endX}
              cy={endY}
              r={11}
              fill="none"
              stroke={accentColor}
              strokeWidth={2}
              opacity={0.85}
            />
          )}
        </svg>
      )}

      <div
        style={{
          position: "absolute",
          left: curLeft,
          top: curTop,
          width: curW,
          height: curH,
          borderRadius: interpolate(zoomT, [0, 1], [14, 18]),
          border: `${interpolate(zoomT, [0, 1], [2, 3])}px solid ${accentColor}`,
          backgroundColor: PALETTE.panelBgSolid,
          boxShadow: isZooming
            ? "0 32px 78px rgba(0, 0, 0, 0.84)"
            : "0 18px 42px rgba(0, 0, 0, 0.56)",
          overflow: "hidden",
          opacity: entrySpring,
          transform: isZooming ? undefined : `translateY(${(1 - entrySpring) * 14}px)`,
          zIndex: isZooming ? 50 : 20,
        }}
      >
        <img
          src={staticFile(photo.href)}
          alt={photo.caption_vi}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: photo.objectPosition ?? "center center",
            transform: `scale(${kbScale}) translate(${kbShiftX}%, ${kbShiftY}%)`,
          }}
        />

        {/* Animated Spotlight Cutout + Target Ring + Callout Badge when Zoomed In */}
        {spotFade > 0.01 && (
          <svg
            width={curW}
            height={curH}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: spotFade,
            }}
          >
            <defs>
              {/* Zero-blur radial cutout gradient: crisp bright center, softly dimmed periphery */}
              <radialGradient
                id={`spot-grad-${uid}`}
                gradientUnits="userSpaceOnUse"
                cx={spCx}
                cy={spCy}
                r={Math.max(spRx, spRy) * 1.55}
                gradientTransform={`translate(${spCx}, ${spCy}) scale(1, ${
                  spRy / Math.max(1, spRx)
                }) translate(${-spCx}, ${-spCy})`}
              >
                <stop offset="0%" stopColor="#040B14" stopOpacity={0.0} />
                <stop offset="58%" stopColor="#040B14" stopOpacity={0.04} />
                <stop offset="78%" stopColor="#040B14" stopOpacity={0.34} />
                <stop offset="100%" stopColor="#040B14" stopOpacity={0.44} />
              </radialGradient>
            </defs>

            {/* Dim surroundings so circled subject pops */}
            <rect x={0} y={0} width={curW} height={curH} fill={`url(#spot-grad-${uid})`} />

            {/* Subtle expanding radar ripple */}
            <ellipse
              cx={spCx}
              cy={spCy}
              rx={spRx * (1 + 0.18 * pulse)}
              ry={spRy * (1 + 0.18 * pulse)}
              fill="none"
              stroke={accentColor}
              strokeWidth={2}
              opacity={(1 - pulse) * 0.55}
            />

            {/* Dark outer halo under target ring for 100% contrast on bright sky/water */}
            <ellipse
              cx={spCx}
              cy={spCy}
              rx={spRx}
              ry={spRy}
              fill="none"
              stroke="rgba(5, 13, 24, 0.85)"
              strokeWidth={7.5}
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - spotDraw}
              strokeLinecap="round"
            />

            {/* Primary glowing target ellipse */}
            <ellipse
              cx={spCx}
              cy={spCy}
              rx={spRx}
              ry={spRy}
              fill="none"
              stroke={accentColor}
              strokeWidth={3.6}
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - spotDraw}
              strokeLinecap="round"
            />

            {/* Inner survey dashed ring */}
            <ellipse
              cx={spCx}
              cy={spCy}
              rx={Math.max(8, spRx - 8)}
              ry={Math.max(8, spRy - 8)}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={1.3}
              strokeDasharray="7 6"
              opacity={0.72 * spotDraw}
            />

            {/* 4 Cardinal survey ticks */}
            {spotDraw > 0.65 && (
              <g stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round">
                <line x1={spCx} y1={spCy - spRy - 7} x2={spCx} y2={spCy - spRy + 6} />
                <line x1={spCx} y1={spCy + spRy - 6} x2={spCx} y2={spCy + spRy + 7} />
                <line x1={spCx - spRx - 7} y1={spCy} x2={spCx - spRx + 6} y2={spCy} />
                <line x1={spCx + spRx - 6} y1={spCy} x2={spCx + spRx + 7} y2={spCy} />
              </g>
            )}

            {/* Leader line to Spotlight Callout Badge */}
            <line
              x1={eLineX}
              y1={eLineY}
              x2={eLineX + (bLineX - eLineX) * spotDraw}
              y2={eLineY + (bLineY - eLineY) * spotDraw}
              stroke="rgba(5, 13, 24, 0.9)"
              strokeWidth={5.5}
              strokeLinecap="round"
            />
            <line
              x1={eLineX}
              y1={eLineY}
              x2={eLineX + (bLineX - eLineX) * spotDraw}
              y2={eLineY + (bLineY - eLineY) * spotDraw}
              stroke={accentColor}
              strokeWidth={2.6}
              strokeLinecap="round"
            />
            <circle cx={eLineX} cy={eLineY} r={4.5} fill="#FFFFFF" stroke={accentColor} strokeWidth={2} />
          </svg>
        )}

        {/* Spotlight Callout Badge (HTML crisp text) */}
        {spotFade > 0.08 && (
          <div
            style={{
              position: "absolute",
              left: badgeLeft,
              top: badgeTop,
              width: badgeW,
              minHeight: badgeH,
              boxSizing: "border-box",
              padding: "8px 14px",
              borderRadius: 10,
              background: "rgba(6, 16, 29, 0.92)",
              border: `1.8px solid ${accentColor}`,
              borderLeft: `5px solid ${accentColor}`,
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.72)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              opacity: spotFade,
              transform: `scale(${0.92 + 0.08 * spotDraw})`,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13.5,
                fontWeight: 700,
                color: accentColor,
                letterSpacing: "0.03em",
                lineHeight: 1.2,
              }}
            >
              ⌖ {sp.label}
            </div>
            {sp.sublabel && (
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: PALETTE.textPrimary,
                  marginTop: 3,
                  lineHeight: 1.2,
                }}
              >
                {sp.sublabel}
              </div>
            )}
          </div>
        )}

        {/* Top-left documentary location tag */}
        <div
          style={{
            position: "absolute",
            left: Math.round(12 * captionScale),
            top: Math.round(12 * captionScale),
            padding: `${Math.round(4 * captionScale)}px ${Math.round(10 * captionScale)}px`,
            borderRadius: 6,
            background: "rgba(7, 19, 32, 0.88)",
            border: `1px solid ${accentColor}`,
            fontFamily: FONTS.mono,
            fontSize: Math.round(11 * captionScale),
            fontWeight: 700,
            color: accentColor,
            letterSpacing: "0.04em",
          }}
        >
          ● {photo.location_tag}
        </div>

        {/* Bottom documentary caption (clean broadcast look, no source/search metadata clutter) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: `${Math.round(26 * captionScale)}px ${Math.round(16 * captionScale)}px ${Math.round(12 * captionScale)}px ${Math.round(16 * captionScale)}px`,
            background:
              "linear-gradient(180deg, rgba(5, 13, 24, 0.0) 0%, rgba(5, 13, 24, 0.82) 52%, rgba(5, 13, 24, 0.95) 100%)",
          }}
        >
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: Math.round(16 * captionScale),
              fontWeight: 700,
              color: PALETTE.textPrimary,
              lineHeight: 1.28,
              textShadow: "0 2px 6px rgba(0,0,0,0.85)",
            }}
          >
            {photo.caption_vi}
          </div>
        </div>
      </div>
    </>
  );
};
