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
import { FONTS, PALETTE, PAPER } from "../theme";

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
  if (Math.abs(dx) < 1e-3 && Math.abs(dy) < 1e-3) return [cx, cy];
  const halfW = rect.width / 2;
  const halfH = rect.height / 2;
  const scaleX = Math.abs(dx) > 1e-3 ? halfW / Math.abs(dx) : Number.POSITIVE_INFINITY;
  const scaleY = Math.abs(dy) > 1e-3 ? halfH / Math.abs(dy) : Number.POSITIVE_INFINITY;
  const s = Math.min(scaleX, scaleY);
  return [cx + dx * s, cy + dy * s];
}

export interface FocusWindowSpec {
  zoomInStartSec: number;
  holdStartSec: number;
  holdEndSec: number;
  zoomOutEndSec: number;
  expandedRect?: { left: number; top: number; width: number; height: number };
}

/**
 * Physical Archival Print / Polaroid Card:
 * Warm ivory paper frame (#FFFCF0) with contact + ambient shadows and matte charcoal ink caption.
 * Keeps enlarged focusWindow bottom safely above KeywordCaptionBar.
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
  accentColor = PALETTE.tealAirport,
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
    frame: Math.max(0, frame - Math.round(appearAtSec * fps)),
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

  const framePad = Math.round(interpolate(zoomT, [0, 1], [8, 12]));
  const footerH = Math.round(interpolate(zoomT, [0, 1], [48, 62]));
  const photoW = Math.max(100, curW - framePad * 2);
  const photoH = Math.max(100, curH - framePad - footerH);

  const backdropOpacity = 0.74 * zoomT * entrySpring;
  const captionScale = interpolate(zoomT, [0, 1], [1, 1.24]);
  const isZooming = zoomT > 0.004;

  const kbScale = interpolate(progress, [0, 1], [1.02, 1.08]) + 0.025 * zoomT;
  const kbShiftX = interpolate(progress, [0, 1], [-1.0, 1.0]);
  const kbShiftY = interpolate(progress, [0, 1], [-0.7, 0.7]);

  const tetherVisibility = entrySpring * (1 - smoothstep(0.0, 0.24, zoomT));
  const dockedRect = { left, top, width, height };
  const [startX, startY] = anchorPoint ? closestBorderPoint(dockedRect, anchorPoint) : [left, top];
  const [endX, endY] = anchorPoint ?? [left, top];
  const lineLen = Math.hypot(endX - startX, endY - startY);

  const sp = photo.spotlight;
  const spCx = sp.cx * photoW;
  const spCy = sp.cy * photoH;
  const spRx = sp.rx * photoW;
  const spRy = sp.ry * photoH;
  const badgeCx = sp.badgePos[0] * photoW;
  const badgeCy = sp.badgePos[1] * photoH;
  const badgeW = 408;
  const badgeH = sp.sublabel ? 60 : 40;
  const badgeLeft = Math.max(16, Math.min(photoW - badgeW - 16, badgeCx - badgeW / 2));
  const badgeTop = Math.max(54, Math.min(photoH - badgeH - 22, badgeCy - badgeH / 2));
  const badgeBox = { left: badgeLeft, top: badgeTop, width: badgeW, height: badgeH };
  const [bLineX, bLineY] = closestBorderPoint(badgeBox, [spCx, spCy]);
  const angleToBadge = Math.atan2(bLineY - spCy, bLineX - spCx);
  const eLineX = spCx + Math.cos(angleToBadge) * spRx;
  const eLineY = spCy + Math.sin(angleToBadge) * spRy;
  const pulse = (frame % 36) / 36;

  if (entrySpring <= 0.002) return null;

  return (
    <>
      {backdropOpacity > 0.004 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(16, 15, 15, ${backdropOpacity.toFixed(3)})`,
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
            stroke="rgba(16, 15, 15, 0.85)"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <line
            x1={startX}
            y1={startY}
            x2={startX + (endX - startX) * entrySpring}
            y2={startY + (endY - startY) * entrySpring}
            stroke={accentColor}
            strokeWidth={2.4}
            strokeDasharray="7 5"
            strokeLinecap="round"
          />
          <circle cx={startX} cy={startY} r={5} fill={accentColor} stroke="#100F0F" strokeWidth={2} />
          {entrySpring > 0.75 && (
            <circle cx={endX} cy={endY} r={11} fill="none" stroke={accentColor} strokeWidth={2} opacity={0.85} />
          )}
        </svg>
      )}

      {/* Physical Archival Polaroid Frame */}
      <div
        style={{
          position: "absolute",
          left: curLeft,
          top: curTop,
          width: curW,
          height: curH,
          borderRadius: 6,
          backgroundColor: PAPER.sheet,
          border: "1px solid rgba(28, 27, 26, 0.16)",
          boxShadow: isZooming
            ? "0 34px 80px rgba(0, 0, 0, 0.65), 0 8px 20px rgba(0, 0, 0, 0.25)"
            : "0 18px 40px rgba(0, 0, 0, 0.28), 0 4px 10px rgba(0, 0, 0, 0.12)",
          padding: `${framePad}px ${framePad}px 0 ${framePad}px`,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          opacity: entrySpring,
          transform: isZooming ? undefined : `translateY(${(1 - entrySpring) * 14}px)`,
          zIndex: isZooming ? 50 : 20,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: photoH,
            borderRadius: 3,
            overflow: "hidden",
            backgroundColor: PALETTE.deepNavy,
            border: "1px solid rgba(28, 27, 26, 0.10)",
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

          {spotFade > 0.01 && (
            <svg width={photoW} height={photoH} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: spotFade }}>
              <defs>
                <radialGradient
                  id={`spot-grad-${uid}`}
                  gradientUnits="userSpaceOnUse"
                  cx={spCx}
                  cy={spCy}
                  r={Math.max(spRx, spRy) * 1.55}
                  gradientTransform={`translate(${spCx}, ${spCy}) scale(1, ${spRy / Math.max(1, spRx)}) translate(${-spCx}, ${-spCy})`}
                >
                  <stop offset="0%" stopColor="#100F0F" stopOpacity={0.0} />
                  <stop offset="58%" stopColor="#100F0F" stopOpacity={0.04} />
                  <stop offset="78%" stopColor="#100F0F" stopOpacity={0.34} />
                  <stop offset="100%" stopColor="#100F0F" stopOpacity={0.44} />
                </radialGradient>
              </defs>
              <rect x={0} y={0} width={photoW} height={photoH} fill={`url(#spot-grad-${uid})`} />
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
              <ellipse
                cx={spCx}
                cy={spCy}
                rx={spRx}
                ry={spRy}
                fill="none"
                stroke="rgba(16, 15, 15, 0.88)"
                strokeWidth={7.5}
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - spotDraw}
                strokeLinecap="round"
              />
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
              <ellipse
                cx={spCx}
                cy={spCy}
                rx={Math.max(8, spRx - 8)}
                ry={Math.max(8, spRy - 8)}
                fill="none"
                stroke="#FFFCF0"
                strokeWidth={1.3}
                strokeDasharray="7 6"
                opacity={0.72 * spotDraw}
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
              <circle cx={eLineX} cy={eLineY} r={4.5} fill="#FFFCF0" stroke={accentColor} strokeWidth={2} />
            </svg>
          )}

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
                borderRadius: 8,
                background: "rgba(22, 21, 19, 0.94)",
                border: `1px solid ${PALETTE.borderHairline}`,
                borderLeft: `4px solid ${accentColor}`,
                boxShadow: "0 12px 28px rgba(0, 0, 0, 0.72)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                opacity: spotFade,
                pointerEvents: "none",
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 700, color: accentColor, lineHeight: 1.2 }}>
                ⌖ {sp.label}
              </div>
              {sp.sublabel && (
                <div style={{ fontFamily: FONTS.display, fontSize: 13.5, fontWeight: 600, color: PALETTE.ivory, marginTop: 3, lineHeight: 1.2 }}>
                  {sp.sublabel}
                </div>
              )}
            </div>
          )}

          <div
            style={{
              position: "absolute",
              left: Math.round(10 * captionScale),
              top: Math.round(10 * captionScale),
              padding: `${Math.round(4 * captionScale)}px ${Math.round(10 * captionScale)}px`,
              borderRadius: 4,
              background: "rgba(16, 15, 15, 0.82)",
              border: "1px solid rgba(255, 252, 240, 0.18)",
              fontFamily: FONTS.mono,
              fontSize: Math.round(10.5 * captionScale),
              fontWeight: 700,
              color: PALETTE.ivory,
              letterSpacing: "0.05em",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: accentColor, display: "inline-block" }} />
            {photo.location_tag}
          </div>
        </div>

        {/* Bottom Archival Cream Caption Margin */}
        <div
          style={{
            height: footerH,
            display: "flex",
            alignItems: "center",
            padding: `0 ${Math.round(6 * captionScale)}px`,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: Math.round(15 * captionScale),
              fontWeight: 700,
              color: PAPER.ink,
              lineHeight: 1.25,
            }}
          >
            {photo.caption_vi}
          </div>
        </div>
      </div>
    </>
  );
};
