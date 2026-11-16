// Channel avatar for "Bí Ẩn Sử Việt" (TikTok / YouTube), not tied to any episode: a Đông Sơn bronze drum face (the
// central star, concentric bands with ticks, Lạc birds flying round) with a magnifying glass over the star for "bí ẩn".
// 1080 x 1080, everything inside the centre circle so the platforms' round crop keeps it whole. No text.
import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { Pen, bodyFront, Outfit, SKIN } from "./toon";

const S = 1080, C = S / 2, INK = "#2a1a10";
/** the channel narrator: today's curious explorer of the past (blue jacket reads on the bronze) */
const NARRATOR: Outfit = { jacket: "#2f6f9a", pants: "#2b2f36", boots: "#4a3426", hat: "hair", hair: "#2a201a", buttons: "#f1e3c6", skin: SKIN };

const star = (g: CanvasRenderingContext2D, cx: number, cy: number, rIn: number, rOut: number, n: number, fill: string) => {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? rIn : rOut; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
};

/** a Lạc bird (long beak, crest, spread wings, long tail) flying along the drum ring, heading counter-clockwise */
const lacBird = (g: CanvasRenderingContext2D, a: number, r: number) => {
  g.save();
  g.translate(C + Math.cos(a) * r, C + Math.sin(a) * r); g.rotate(a - Math.PI / 2);
  g.fillStyle = "#6b3b17"; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath();
  g.moveTo(-70, 0); g.lineTo(-30, -6); g.lineTo(-10, -34); g.lineTo(6, -8); g.lineTo(40, -4); g.lineTo(78, -16); g.lineTo(46, 4);
  g.lineTo(10, 10); g.lineTo(-6, 34); g.lineTo(-22, 10); g.lineTo(-58, 12); g.lineTo(-92, 28); g.closePath();
  g.fill(); g.stroke();
  g.beginPath(); g.moveTo(40, -4); g.lineTo(52, -26); g.stroke(); // crest
  g.restore();
};

export const ChannelAvatar: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender("channel avatar"));
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    // bronze disc
    const bg = g.createRadialGradient(C * 0.85, C * 0.8, 40, C, C, C);
    bg.addColorStop(0, "#f6d58a"); bg.addColorStop(0.5, "#d99a45"); bg.addColorStop(1, "#8a501f");
    g.fillStyle = bg; g.fillRect(0, 0, S, S);
    // drum bands with radial ticks
    g.strokeStyle = "rgba(90,48,16,0.55)";
    for (const r of [185, 250, 420, 500]) {
      g.lineWidth = 7; g.beginPath(); g.arc(C, C, r, 0, Math.PI * 2); g.stroke();
      const n = Math.round(r / 8);
      g.lineWidth = 4;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, r0 = r + 12, r1 = r + 30;
        g.beginPath(); g.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0); g.lineTo(C + Math.cos(a) * r1, C + Math.sin(a) * r1); g.stroke();
      }
    }
    // Lạc birds in the wide band
    for (let k = 0; k < 6; k++) lacBird(g, (k / 6) * Math.PI * 2 + 0.3, 335);
    // the channel's narrator: a young modern explorer (not an episode character), bust at lower left, right hand
    // raised (toon.ts "wave" arm) holding the magnifying glass up to the drum's star
    const k = 1.7, tx = 400 - 300 * k, ty = 700 - 309 * k; // design (300, 309) = head centre -> canvas (400, 700)
    g.setTransform(k, 0, 0, k, tx, ty);
    bodyFront(new Pen(g), NARRATOR, { mode: "stand", expr: "grin", look: 1, wave: 1, seed: 2 });
    g.setTransform(1, 0, 0, 1, 0, 0);
    // magnifying glass: the lens shows the drum's 14-point star, magnified
    const lx = 760, ly = 410, lr = 168, hand: [number, number] = [691, 709];
    g.save(); g.beginPath(); g.arc(lx, ly, lr, 0, Math.PI * 2); g.clip();
    const lens = g.createRadialGradient(lx - 40, ly - 50, 10, lx, ly, lr);
    lens.addColorStop(0, "#fff6d6"); lens.addColorStop(1, "#f1c46e");
    g.fillStyle = lens; g.fillRect(lx - lr, ly - lr, 2 * lr, 2 * lr);
    star(g, lx, ly, 62, 150, 14, "#ffd76a");
    g.beginPath(); g.arc(lx, ly, 46, 0, Math.PI * 2); g.fillStyle = "#fff1c2"; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.45)"; g.beginPath(); g.ellipse(lx - 70, ly - 80, 56, 22, -0.7, 0, Math.PI * 2); g.fill(); // glint
    g.restore();
    const dx = hand[0] - lx, dy = hand[1] - ly, dl = Math.hypot(dx, dy), ex = lx + (dx / dl) * lr, ey = ly + (dy / dl) * lr;
    g.lineCap = "round";
    g.strokeStyle = INK; g.lineWidth = 50; g.beginPath(); g.moveTo(ex, ey); g.lineTo(hand[0] - (dx / dl) * -36, hand[1] + (dy / dl) * 36); g.stroke();
    g.strokeStyle = "#5a3418"; g.lineWidth = 32; g.beginPath(); g.moveTo(ex, ey); g.lineTo(hand[0] - (dx / dl) * -32, hand[1] + (dy / dl) * 32); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 40; g.beginPath(); g.arc(lx, ly, lr, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "#3b2414"; g.lineWidth = 24; g.beginPath(); g.arc(lx, ly, lr, 0, Math.PI * 2); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(hand[0], hand[1], 26, 0, Math.PI * 2); g.fill(); // the gripping hand (ink dot, as in toon.ts)
    continueRender(handle);
  }, [handle]);
  return (
    <AbsoluteFill>
      <canvas ref={ref} width={S} height={S} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
