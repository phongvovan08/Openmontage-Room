import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MOCHI_EP01_WORDS } from "./beMochiEp01Captions";

export interface BeMochiEp01Props {
  orientation?: "16:9" | "9:16";
  visualMode?: "svg" | "crayon" | "omniflash";
  useOmniFlashClips?: boolean;
}

// Locked Audio Mix Config (saved per user approval):
// - YouTube 16:9 (1920x1080): Building 20 = 0.05, Veo 3 = 0.05, Narration = 1.0
// - Shorts 9:16  (1080x1920): Building 20 = 0.10, Veo 3 = 0.10, Narration = 1.0
export const MOCHI_AUDIO_MIX_CONFIG = {
  "16:9": { narration: 1.0, building20: 0.05, veo3: 0.05 },
  "9:16": { narration: 1.0, building20: 0.1, veo3: 0.1 },
} as const;

interface SceneSpec {
  index: number;
  tag: string;
  title: string;
  subtitle: string;
  keynoteStat?: { label: string; value: string; accent: string };
  mood:
    | "scrolling_130am"
    | "inner_bird"
    | "rebel_shield"
    | "daytime_drain"
    | "rainy_window"
    | "balance_scale"
    | "battery_siphon"
    | "loop_wheel"
    | "warm_bloom";
}

const SCENES: SceneSpec[] = [
  {
    index: 1,
    tag: "THÔNG BÁO MOCHI 01 · 01:30 SÁNG",
    title: "MẮT ĐÃ CAY XÈ NHƯNG VẪN CỐ LƯỚT",
    subtitle: "Cơ thể đòi nghỉ ngơi, nhưng ngón tay vẫn từ chối tắt màn hình.",
    keynoteStat: { label: "ĐỒNG HỒ ĐÊM", value: "01:30 AM", accent: "#38BDF8" },
    mood: "scrolling_130am",
  },
  {
    index: 2,
    tag: "THÔNG BÁO MOCHI 02 · TIẾNG NÓI THẦM",
    title: "“HÔM NAY CHƯA SỐNG CHO RIÊNG MÌNH”",
    subtitle: "Cảm giác nếu nhắm mắt ngủ ngay, ngày hôm nay coi như mất trắng.",
    keynoteStat: { label: "THỜI GIAN CHO MÌNH", value: "0 PHÚT", accent: "#FDE047" },
    mood: "inner_bird",
  },
  {
    index: 3,
    tag: "THÔNG BÁO MOCHI 03 · THUẬT NGỮ TÂM LÝ",
    title: "SỰ TRẢ THÙ GIỜ ĐI NGỦ",
    subtitle: "Revenge Bedtime Procrastination — thức khuya để đòi lại quyền tự chủ.",
    keynoteStat: {
      label: "TÊN GỌI KHOA HỌC",
      value: "Bedtime Procrastination",
      accent: "#4ADE80",
    },
    mood: "rebel_shield",
  },
  {
    index: 4,
    tag: "THÔNG BÁO MOCHI 04 · 12 TIẾNG BAN NGÀY",
    title: "BỊ CHIA NHỎ CHO DEADLINE & KỲ VỌNG",
    subtitle: "Công việc, tin nhắn sếp và những nụ cười xã giao rút cạn quyền kiểm soát.",
    keynoteStat: { label: "12 GIỜ BAN NGÀY", value: "100% BẬN RỘN", accent: "#FB7185" },
    mood: "daytime_drain",
  },
  {
    index: 5,
    tag: "THÔNG BÁO MOCHI 05 · KHOẢNG LẶNG ĐÊM",
    title: "KHOẢNH KHẮC DUY NHẤT KHÔNG AI ĐÒI HỎI",
    subtitle: "Khi cả thành phố chìm vào giấc ngủ, xiềng xích ban ngày mới tạm tan biến.",
    keynoteStat: { label: "ÁP LỰC XUNG QUANH", value: "TẠM DỪNG", accent: "#4ADE80" },
    mood: "rainy_window",
  },
  {
    index: 6,
    tag: "THÔNG BÁO MOCHI 06 · CÁI BẪY ĐÁNH ĐỔI",
    title: "ĐỔI GIẤC NGỦ LẤY TỰ DO ẢO QUA MÀN HÌNH",
    subtitle: "Bộ não kiệt sức chọn ánh sáng xanh làm phần thưởng bù đắp ngắn ngủi.",
    keynoteStat: { label: "CÁN CÂN ĐÁNH ĐỔI", value: "GIẤC NGỦ < MÀN HÌNH", accent: "#38BDF8" },
    mood: "balance_scale",
  },
  {
    index: 7,
    tag: "THÔNG BÁO MOCHI 07 · LÃI SUẤT CẮT CỔ",
    title: "VAY NỢ SỨC LỰC CỦA NGÀY MAI",
    subtitle: "Ánh sáng điện thoại lúc 2 giờ sáng không nạp lại pin — nó rút cạn mầm xanh.",
    keynoteStat: { label: "NĂNG LƯỢNG NGÀY MAI", value: "-68% PIN NÃO", accent: "#FB7185" },
    mood: "battery_siphon",
  },
  {
    index: 8,
    tag: "THÔNG BÁO MOCHI 08 · VÒNG LẶP MỆT MỎI",
    title: "SÁNG UỂ OẢI ➔ TỐI LẠI THỨC TRẢ THÙ",
    subtitle: "Dậy muộn, làm việc chậm hơn, mất buổi tối và lại thức khuya lặp lại.",
    keynoteStat: { label: "CHU KỲ LẶP", value: "NGÀY MỆT ⇄ ĐÊM THỨC", accent: "#F59E0B" },
    mood: "loop_wheel",
  },
  {
    index: 9,
    tag: "THÔNG BÁO MOCHI 09 · GIẢI PHÁP TỐI NAY",
    title: "15 PHÚT TỰ DO THẬT SỰ TRƯỚC KHI NGỦ",
    subtitle: "Đặt điện thoại ra xa, pha một cốc nước ấm và ngồi yên thở cùng chính mình.",
    keynoteStat: { label: "NGHI THỨC CHỮA LÀNH", value: "15 PHÚT ẤM ÁP 🌱", accent: "#4ADE80" },
    mood: "warm_bloom",
  },
];

// ---------------------------------------------------------------------------
// Kinematic 30fps 2D Rig: Bé Mochi Mầm Xanh (Glossy White Mochi + Yellow Scarf + Morphing Sprout)
// ---------------------------------------------------------------------------
const AnimatedMochiStage: React.FC<{
  mood: SceneSpec["mood"];
  compact?: boolean;
}> = ({ mood, compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 110 } });

  // Natural breathing squash & stretch
  const breathSpeed = mood === "daytime_drain" ? 5.5 : mood === "warm_bloom" ? 1.8 : 2.6;
  const breath = Math.sin(t * breathSpeed);
  const squashX = mood === "battery_siphon" ? 1 + Math.min(0.14, t * 0.018) : 1 + breath * 0.025;
  const squashY = mood === "battery_siphon" ? 1 - Math.min(0.16, t * 0.02) : 1 - breath * 0.025;
  const bobY =
    mood === "loop_wheel"
      ? Math.abs(Math.sin(t * 5.2)) * -12
      : Math.sin(t * breathSpeed) * 5;

  // Periodic natural blink
  const blinkCycle = frame % 95;
  const isBlinking = blinkCycle >= 88 && blinkCycle <= 93;

  // Sprout color & bloom state
  const isWilted =
    mood === "daytime_drain" || mood === "battery_siphon" || mood === "loop_wheel";
  const isSparking = mood === "rebel_shield";
  const isBlooming = mood === "warm_bloom";
  const leafColor =
    mood === "battery_siphon"
      ? "#EAB308"
      : isWilted
        ? "#84CC16"
        : "#4ADE80";
  const sproutSway =
    Math.sin(t * (isSparking ? 8 : 2.4)) * (isWilted ? 6 : 11) +
    (isWilted ? 22 : 0);

  const bloomScale = isBlooming
    ? spring({
        frame: Math.max(0, frame - 24),
        fps,
        config: { damping: 11, stiffness: 120 },
      })
    : 0;

  const stageWarmGlow =
    mood === "warm_bloom"
      ? "radial-gradient(circle at 50% 55%, rgba(253, 224, 71, 0.24), rgba(74, 222, 128, 0.08) 45%, rgba(7, 11, 20, 0) 72%)"
      : mood === "scrolling_130am" || mood === "balance_scale" || mood === "battery_siphon"
        ? "radial-gradient(circle at 50% 55%, rgba(56, 189, 248, 0.22), rgba(7, 11, 20, 0) 70%)"
        : "radial-gradient(circle at 50% 55%, rgba(74, 222, 128, 0.15), rgba(7, 11, 20, 0) 70%)";

  const scaleFactor = compact ? 0.92 : 1.05;

  return (
    <div
      style={{
        width: 780,
        height: 780,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${interpolate(enter, [0, 1], [0.88, 1]) * scaleFactor})`,
        opacity: enter,
      }}
    >
      {/* Ambient Stage Aura */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: stageWarmGlow,
          borderRadius: "50%",
        }}
      />

      <svg width="760" height="760" viewBox="0 0 760 760">
        <defs>
          <filter id="emeraldGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="phoneGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ---------------- BACKGROUND SCENE PROPS ---------------- */}

        {/* Scene 1: Digital Wall Clock 01:30 AM & Night Stars */}
        {mood === "scrolling_130am" && (
          <g>
            <rect
              x="95"
              y="110"
              width="190"
              height="74"
              rx="16"
              fill="#0F172A"
              stroke="#38BDF8"
              strokeWidth="3"
              opacity={0.85}
            />
            <text
              x="190"
              y="159"
              textAnchor="middle"
              fill="#38BDF8"
              fontSize="36"
              fontWeight="900"
              fontFamily="monospace"
            >
              {frame % 30 < 15 ? "01:30" : "01 30"}
            </text>
            {/* Floating Zzz dissolving away */}
            {[0, 1, 2].map((i) => {
              const p = ((t * 0.5 + i * 0.33) % 1);
              return (
                <text
                  key={i}
                  x={560 + i * 28}
                  y={240 - p * 90}
                  fill="#94A3B8"
                  fontSize={28 - i * 4}
                  fontWeight="800"
                  opacity={(1 - p) * 0.5}
                >
                  z
                </text>
              );
            })}
          </g>
        )}

        {/* Scene 3: Giant Swinging Sleepy Crescent Moon Pendulum */}
        {mood === "rebel_shield" && (
          <g transform={`translate(380, 40) rotate(${Math.sin(t * 2.4) * 18})`}>
            <line x1="0" y1="0" x2="0" y2="155" stroke="#64748B" strokeWidth="5" />
            <path
              d="M -35 140 A 52 52 0 1 0 45 195 A 40 40 0 1 1 -35 140 Z"
              fill="#FDE047"
              stroke="#1E293B"
              strokeWidth="5"
              filter="url(#emeraldGlow)"
            />
          </g>
        )}

        {/* Scene 4: Spinning 12-Hour Office Clock & Floating Red Notification Bubbles */}
        {mood === "daytime_drain" && (
          <g>
            <g transform="translate(380, 220)">
              <circle
                r="155"
                fill="#0F172A"
                stroke="#334155"
                strokeWidth="6"
                opacity="0.7"
              />
              <line
                x1="0"
                y1="0"
                x2={Math.cos(t * 6) * 110}
                y2={Math.sin(t * 6) * 110}
                stroke="#FB7185"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <line
                x1="0"
                y1="0"
                x2={Math.cos(t * 1.5) * 75}
                y2={Math.sin(t * 1.5) * 75}
                stroke="#FDE047"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </g>
            {[
              { x: 135, y: 210, txt: "DEADLINE!" },
              { x: 615, y: 200, txt: "TIN NHẮN SẾP" },
              { x: 145, y: 360, txt: "KPI THÁNG" },
              { x: 615, y: 365, txt: "XÃ GIAO" },
            ].map((b, idx) => (
              <g
                key={idx}
                transform={`translate(${b.x}, ${b.y + Math.sin(t * 5 + idx) * 10})`}
              >
                <rect
                  x="-78"
                  y="-24"
                  width="156"
                  height="48"
                  rx="24"
                  fill="#BE123C"
                  stroke="#FDA4AF"
                  strokeWidth="3"
                />
                <text
                  x="0"
                  y="7"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="18"
                  fontWeight="800"
                >
                  {b.txt}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Scene 5: Rainy Midnight Window with Bokeh Lights & Dissolving Chains */}
        {mood === "rainy_window" && (
          <g>
            <rect
              x="140"
              y="75"
              width="480"
              height="330"
              rx="20"
              fill="#0B132B"
              stroke="#334155"
              strokeWidth="8"
            />
            <line x1="380" y1="75" x2="380" y2="405" stroke="#334155" strokeWidth="8" />
            <line x1="140" y1="240" x2="620" y2="240" stroke="#334155" strokeWidth="8" />
            {/* City bokeh circles */}
            {[
              { cx: 210, cy: 180, r: 22, c: "#FDE047" },
              { cx: 280, cy: 150, r: 16, c: "#38BDF8" },
              { cx: 490, cy: 170, r: 26, c: "#F59E0B" },
              { cx: 555, cy: 210, r: 18, c: "#4ADE80" },
            ].map((bk, idx) => (
              <circle
                key={idx}
                cx={bk.cx}
                cy={bk.cy}
                r={bk.r}
                fill={bk.c}
                opacity={0.22 + 0.1 * Math.sin(t * 2 + idx)}
              />
            ))}
            {/* Animated Rain Streaks */}
            {Array.from({ length: 14 }).map((_, rIdx) => {
              const rx = 165 + (rIdx * 33) % 430;
              const ry = 85 + ((t * 240 + rIdx * 47) % 290);
              return (
                <line
                  key={rIdx}
                  x1={rx}
                  y1={ry}
                  x2={rx - 6}
                  y2={ry + 24}
                  stroke="#7DD3FC"
                  strokeWidth="2.5"
                  opacity="0.45"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        )}

        {/* Scene 6: Brass Balance Scale Trading Golden Sleep Cloud vs Neon Phone */}
        {mood === "balance_scale" && (
          <g transform="translate(380, 175)">
            <g transform={`rotate(${10 + Math.sin(t * 2.2) * 5})`}>
              <line
                x1="-210"
                y1="0"
                x2="210"
                y2="0"
                stroke="#FBBF24"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Left Pan: Fluffy Sleep Cloud */}
              <g transform="translate(-195, 0)">
                <line x1="0" y1="0" x2="-35" y2="75" stroke="#94A3B8" strokeWidth="3" />
                <line x1="0" y1="0" x2="35" y2="75" stroke="#94A3B8" strokeWidth="3" />
                <path
                  d="M -52 75 Q 0 92 52 75"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="6"
                />
                <circle cx="-18" cy="52" r="22" fill="#FEF08A" />
                <circle cx="12" cy="48" r="26" fill="#FDE047" />
                <circle cx="32" cy="58" r="18" fill="#FEF08A" />
              </g>
              {/* Right Pan: Glowing Blue Smartphone */}
              <g transform="translate(195, 0)">
                <line x1="0" y1="0" x2="-35" y2="75" stroke="#94A3B8" strokeWidth="3" />
                <line x1="0" y1="0" x2="35" y2="75" stroke="#94A3B8" strokeWidth="3" />
                <path
                  d="M -52 75 Q 0 92 52 75"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="6"
                />
                <rect
                  x="-24"
                  y="15"
                  width="48"
                  height="78"
                  rx="10"
                  fill="#0284C7"
                  stroke="#38BDF8"
                  strokeWidth="4"
                  filter="url(#phoneGlow)"
                />
              </g>
            </g>
            <circle cx="0" cy="0" r="14" fill="#F59E0B" stroke="#1E293B" strokeWidth="4" />
          </g>
        )}

        {/* Scene 7: Draining Red Battery Gauge Above Mochi */}
        {mood === "battery_siphon" && (
          <g transform="translate(275, 115)">
            <rect
              x="0"
              y="0"
              width="210"
              height="68"
              rx="16"
              fill="#0F172A"
              stroke="#FB7185"
              strokeWidth="5"
            />
            <rect x="214" y="20" width="12" height="28" rx="4" fill="#FB7185" />
            <rect
              x="10"
              y="10"
              width={Math.max(18, 175 * (1 - Math.min(0.9, t * 0.095)))}
              height="48"
              rx="10"
              fill={t > 3 ? "#EF4444" : "#F59E0B"}
            />
            <text
              x="105"
              y="43"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="26"
              fontWeight="900"
            >
              {`${Math.max(4, Math.round(48 - t * 4.6))}%`}
            </text>
          </g>
        )}

        {/* Scene 8: Spinning Day-to-Night Loop Wheel */}
        {mood === "loop_wheel" && (
          <g transform={`translate(380, 390) rotate(${t * 28})`}>
            <circle
              r="285"
              fill="none"
              stroke="#334155"
              strokeWidth="12"
              strokeDasharray="34 22"
            />
            <circle cx="0" cy="-285" r="26" fill="#FACC15" />
            <circle cx="0" cy="285" r="24" fill="#38BDF8" />
          </g>
        )}

        {/* Scene 9: Warm Cozy Amber Lamp & Turned-Off Phone on Distant Shelf */}
        {mood === "warm_bloom" && (
          <g>
            {/* Distant shelf with turned-off phone */}
            <rect x="90" y="210" width="150" height="12" rx="6" fill="#78350F" />
            <rect
              x="130"
              y="194"
              width="66"
              height="16"
              rx="5"
              fill="#1E293B"
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Warm bedside lamp on right */}
            <rect x="575" y="480" width="80" height="14" rx="7" fill="#92400E" />
            <line x1="615" y1="320" x2="615" y2="480" stroke="#B45309" strokeWidth="10" />
            <polygon
              points="565,325 665,325 645,255 585,255"
              fill="#FDE047"
              stroke="#78350F"
              strokeWidth="5"
              filter="url(#emeraldGlow)"
            />
          </g>
        )}

        {/* ---------------- MAIN CHARACTER: BÉ MOCHI MẦM XANH ---------------- */}
        <g
          transform={`translate(380, ${495 + bobY}) scale(${squashX}, ${squashY})`}
        >
          {/* Soft Ground Shadow */}
          <ellipse cx="0" cy="145" rx="145" ry="24" fill="rgba(0,0,0,0.42)" />

          {/* Signature 2-Leaf Sprout on Top of Head */}
          <g transform={`translate(0, -148) rotate(${sproutSway})`}>
            {/* Stem */}
            <path
              d="M 0 8 Q -3 -26 0 -54"
              fill="none"
              stroke="#22C55E"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Left Leaf */}
            <path
              d="M -2 -38 C -38 -72, -88 -54, -74 -16 C -60 12, -16 -8, -2 -34 Z"
              fill={leafColor}
              stroke="#14532D"
              strokeWidth="5"
              filter="url(#emeraldGlow)"
            />
            {/* Right Leaf */}
            <path
              d="M 2 -38 C 38 -72, 88 -54, 74 -16 C 60 12, 16 -8, 2 -34 Z"
              fill={leafColor}
              stroke="#14532D"
              strokeWidth="5"
              filter="url(#emeraldGlow)"
            />

            {/* Scene 3: Defiant Cyan Sparks on Sprout */}
            {isSparking && (
              <g opacity={0.6 + 0.4 * Math.sin(t * 18)}>
                <polygon
                  points="0,-95 -10,-70 4,-70 -6,-48 16,-76 2,-76"
                  fill="#38BDF8"
                />
              </g>
            )}

            {/* Scene 9: Blooming 5-Petal Golden Star-Flower! */}
            {isBlooming && (
              <g transform={`translate(0, -72) scale(${bloomScale})`}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="0"
                    cy="-18"
                    rx="13"
                    ry="20"
                    fill="#FDE047"
                    stroke="#B45309"
                    strokeWidth="3.5"
                    transform={`rotate(${deg + t * 12})`}
                    filter="url(#emeraldGlow)"
                  />
                ))}
                <circle cx="0" cy="0" r="11" fill="#F59E0B" />
              </g>
            )}
          </g>

          {/* Chubby Glossy White Mochi Body */}
          <path
            d="M -148 35 C -156 -88, -98 -155, 0 -155 C 98 -155, 156 -88, 148 35 C 144 118, 96 142, 0 142 C -96 142, -144 118, -148 35 Z"
            fill="#F8FAFC"
            stroke="#1E293B"
            strokeWidth="8"
          />
          {/* Glossy Top-Left Marshmallow Highlight */}
          <ellipse
            cx="-68"
            cy="-96"
            rx="34"
            ry="15"
            fill="#FFFFFF"
            transform="rotate(-28 -68 -96)"
          />

          {/* Screen Blue Reflection on Mochi's Face in Phone Scenes */}
          {(mood === "scrolling_130am" ||
            mood === "balance_scale" ||
            mood === "battery_siphon") && (
            <ellipse
              cx="15"
              cy="-15"
              rx="115"
              ry="95"
              fill="#38BDF8"
              opacity={0.14 + 0.06 * Math.sin(t * 7)}
            />
          )}

          {/* Rosy Pink Cheeks */}
          <ellipse cx="-82" cy="-14" rx="28" ry="17" fill="#FB7185" opacity="0.72" />
          <ellipse cx="82" cy="-14" rx="28" ry="17" fill="#FB7185" opacity="0.72" />

          {/* Expressive Eyes */}
          {mood === "warm_bloom" ? (
            /* Serene Happy Closed Arcs */
            <g fill="none" stroke="#3B2314" strokeWidth="7" strokeLinecap="round">
              <path d="M -64 -38 Q -48 -56 -32 -38" />
              <path d="M 32 -38 Q 48 -56 64 -38" />
            </g>
          ) : isBlinking ? (
            <g stroke="#3B2314" strokeWidth="6" strokeLinecap="round">
              <line x1="-62" y1="-40" x2="-34" y2="-40" />
              <line x1="34" y1="-40" x2="62" y2="-40" />
            </g>
          ) : (
            <g>
              <circle cx="-48" cy="-42" r="14" fill="#3B2314" />
              <circle cx="-52" cy="-47" r="5" fill="#FFFFFF" />
              <circle cx="48" cy="-42" r="14" fill="#3B2314" />
              <circle cx="44" cy="-47" r="5" fill="#FFFFFF" />
              {/* Tired half-droopy eyelids on late-night/exhausted scenes */}
              {(mood === "scrolling_130am" ||
                mood === "battery_siphon" ||
                mood === "loop_wheel") && (
                <g>
                  <path d="M -65 -46 Q -48 -40 -31 -46 L -31 -58 L -65 -58 Z" fill="#E2E8F0" />
                  <path d="M 31 -46 Q 48 -40 65 -46 L 65 -58 L 31 -58 Z" fill="#E2E8F0" />
                  {/* Cute tired under-eye lines */}
                  <path
                    d="M -60 -23 Q -48 -18 -36 -23"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="3"
                  />
                  <path
                    d="M 36 -23 Q 48 -18 60 -23"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="3"
                  />
                </g>
              )}
            </g>
          )}

          {/* Cute Tiny Mouth */}
          {mood === "warm_bloom" || mood === "rainy_window" ? (
            <path
              d="M -14 -22 Q 0 -10 14 -22"
              fill="none"
              stroke="#3B2314"
              strokeWidth="6"
              strokeLinecap="round"
            />
          ) : mood === "daytime_drain" || mood === "battery_siphon" ? (
            <path
              d="M -14 -14 Q 0 -24 14 -14"
              fill="none"
              stroke="#3B2314"
              strokeWidth="6"
              strokeLinecap="round"
            />
          ) : (
            <ellipse cx="0" cy="-24" rx="10" ry="7" fill="#451A03" />
          )}

          {/* Signature Cozy Warm-Yellow Knitted Scarf (#FDE047) */}
          <g transform="translate(0, 22)">
            <path
              d="M -146 -6 Q 0 34 146 -6 Q 152 24 138 34 Q 0 68 -138 34 Q -152 24 -146 -6 Z"
              fill="#FACC15"
              stroke="#78350F"
              strokeWidth="6"
            />
            {/* Scarf Hanging Knot & Swaying Fringed Tail */}
            <g transform={`translate(56, 22) rotate(${Math.sin(t * 2.5) * 5})`}>
              <rect
                x="-22"
                y="-8"
                width="46"
                height="78"
                rx="16"
                fill="#FDE047"
                stroke="#78350F"
                strokeWidth="6"
              />
              {/* Fringes */}
              {[-12, -2, 8, 18].map((fx, idx) => (
                <rect
                  key={idx}
                  x={fx - 4}
                  y="66"
                  width="8"
                  height="15"
                  rx="4"
                  fill="#F59E0B"
                  stroke="#78350F"
                  strokeWidth="3"
                />
              ))}
            </g>
          </g>

          {/* Scene 2: Glowing Golden Bird Fluttering Inside Mochi's Heart */}
          {mood === "inner_bird" && (
            <g
              transform={`translate(0, 75 + ${Math.sin(t * 6) * 6}) scale(${
                0.95 + 0.08 * Math.sin(t * 8)
              })`}
              filter="url(#emeraldGlow)"
            >
              <circle cx="0" cy="75" r="36" fill="rgba(253, 224, 71, 0.22)" />
              <path
                d={`M 0 75 Q -28 ${52 + Math.sin(t * 14) * 16} -42 72 Q -18 82 0 75 Q 18 82 42 72 Q 28 ${
                  52 + Math.sin(t * 14) * 16
                } 0 75 Z`}
                fill="#FDE047"
              />
            </g>
          )}

          {/* Stubby Little Arms & Foreground Action Props */}
          {mood === "scrolling_130am" && (
            <g>
              {/* Blanket over lower body */}
              <path
                d="M -165 95 Q 0 65 165 95 L 175 155 L -175 155 Z"
                fill="#1E3A8A"
                stroke="#0F172A"
                strokeWidth="6"
              />
              {/* Glowing Smartphone + Flicking Stubby Thumb */}
              <g transform={`translate(28, 52) rotate(-12)`}>
                <rect
                  x="-32"
                  y="-54"
                  width="64"
                  height="104"
                  rx="12"
                  fill="#0284C7"
                  stroke="#7DD3FC"
                  strokeWidth="4"
                  filter="url(#phoneGlow)"
                />
                {/* Scrolling feed cards inside phone */}
                {[0, 1, 2].map((cIdx) => {
                  const cy = 35 - (((t * 75 + cIdx * 34) % 90));
                  return (
                    <rect
                      key={cIdx}
                      x="-22"
                      y={cy}
                      width="44"
                      height="22"
                      rx="5"
                      fill="#E0F2FE"
                      opacity="0.85"
                    />
                  );
                })}
              </g>
              {/* Flicking stubby arm */}
              <ellipse
                cx="68"
                cy={72 - Math.abs(Math.sin(t * 4.5)) * 22}
                rx="26"
                ry="18"
                fill="#F8FAFC"
                stroke="#1E293B"
                strokeWidth="6"
                transform="rotate(-25 68 72)"
              />
            </g>
          )}

          {mood === "rebel_shield" && (
            <g transform={`translate(-85, 35) rotate(${Math.sin(t * 3) * 8})`}>
              <circle
                cx="0"
                cy="0"
                r="46"
                fill="#D97706"
                stroke="#451A03"
                strokeWidth="6"
              />
              <circle cx="0" cy="0" r="16" fill="#FDE047" />
            </g>
          )}

          {mood === "warm_bloom" && (
            /* Holding Warm Steaming Ceramic Mug with Both Stubby Hands */
            <g transform="translate(0, 88)">
              <rect
                x="-34"
                y="-26"
                width="68"
                height="58"
                rx="12"
                fill="#FEF3C7"
                stroke="#78350F"
                strokeWidth="5"
              />
              <path
                d="M 34 -14 C 54 -14, 54 18, 34 18"
                fill="none"
                stroke="#78350F"
                strokeWidth="5"
              />
              {/* Rising warm steam wisps */}
              {[-14, 2, 16].map((sx, sIdx) => {
                const sp = (t * 0.65 + sIdx * 0.33) % 1;
                return (
                  <path
                    key={sIdx}
                    d={`M ${sx} ${-34 - sp * 48} Q ${sx + 8} ${-48 - sp * 48} ${sx} ${
                      -62 - sp * 48
                    }`}
                    fill="none"
                    stroke="#FDE047"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity={(1 - sp) * 0.75}
                  />
                );
              })}
              <ellipse
                cx="-38"
                cy="4"
                rx="22"
                ry="16"
                fill="#F8FAFC"
                stroke="#1E293B"
                strokeWidth="5"
              />
              <ellipse
                cx="38"
                cy="4"
                rx="22"
                ry="16"
                fill="#F8FAFC"
                stroke="#1E293B"
                strokeWidth="5"
              />
            </g>
          )}
        </g>

        {/* Floating Cozy Golden Fireflies (Always gentle, abundant in Scene 9) */}
        {Array.from({ length: mood === "warm_bloom" ? 16 : 6 }).map((_, fIdx) => {
          const fx = 95 + ((fIdx * 97 + Math.sin(t * 1.2 + fIdx) * 35) % 570);
          const fy = 110 + ((fIdx * 83 + Math.cos(t * 1.1 + fIdx) * 40) % 540);
          const op = 0.35 + 0.55 * Math.abs(Math.sin(t * 2.2 + fIdx));
          return (
            <circle
              key={fIdx}
              cx={fx}
              cy={fy}
              r={mood === "warm_bloom" ? 5.5 : 3.5}
              fill="#FDE047"
              opacity={op}
              filter="url(#emeraldGlow)"
            />
          );
        })}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Karaoke Active Word Caption Strip
// ---------------------------------------------------------------------------
const MochiKaraokeBar: React.FC<{ isHorizontal: boolean }> = ({
  isHorizontal,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  // Group into chunks of 7 words for clean scannability
  const CHUNK_SIZE = isHorizontal ? 8 : 6;
  const activeIdx = MOCHI_EP01_WORDS.findIndex(
    (w, idx) =>
      currentSec >= w.start &&
      (currentSec <= w.end + 0.25 ||
        (idx < MOCHI_EP01_WORDS.length - 1 &&
          currentSec < MOCHI_EP01_WORDS[idx + 1].start))
  );

  if (activeIdx === -1 || currentSec > 87.2) return null;

  const chunkStart = Math.floor(activeIdx / CHUNK_SIZE) * CHUNK_SIZE;
  const chunk = MOCHI_EP01_WORDS.slice(chunkStart, chunkStart + CHUNK_SIZE);

  return (
    <div
      style={{
        padding: isHorizontal ? "18px 28px" : "20px 30px",
        borderRadius: 24,
        backgroundColor: "rgba(15, 23, 42, 0.90)",
        border: "2.5px solid rgba(74, 222, 128, 0.50)",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.55)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: isHorizontal ? "flex-start" : "center",
        gap: "8px 12px",
      }}
    >
      {chunk.map((w, i) => {
        const globalIdx = chunkStart + i;
        const isCurrent = globalIdx === activeIdx;
        const isPast = globalIdx < activeIdx;
        return (
          <span
            key={globalIdx}
            style={{
              fontSize: isHorizontal ? 34 : 40,
              fontWeight: 900,
              color: isCurrent
                ? "#4ADE80"
                : isPast
                  ? "#FFFFFF"
                  : "rgba(255,255,255,0.48)",
              transform: isCurrent ? "scale(1.08)" : "scale(1)",
              textShadow: isCurrent
                ? "0 0 18px rgba(74, 222, 128, 0.75)"
                : "none",
              display: "inline-block",
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Finale Progressive Takeaway Box (79.45s -> 90.0s)
// ---------------------------------------------------------------------------
const FinaleTakeawayCard: React.FC<{ isHorizontal: boolean }> = ({
  isHorizontal,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const globalSec = 79.4 + frame / fps;
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const finaleWords = MOCHI_EP01_WORDS.filter((w) => w.start >= 79.4);

  return (
    <div
      style={{
        padding: isHorizontal ? "26px 32px" : "28px 32px",
        borderRadius: 26,
        backgroundColor: "rgba(10, 18, 32, 0.94)",
        border: "3px solid #FDE047",
        boxShadow: "0 20px 50px rgba(0,0,0,0.65)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: isHorizontal ? "flex-start" : "center",
        gap: "7px 10px",
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
      }}
    >
      {finaleWords.map((w, idx) => {
        const isLit = globalSec >= w.start;
        const isCurrent = globalSec >= w.start && globalSec <= w.end + 0.18;
        return (
          <span
            key={idx}
            style={{
              fontSize: isHorizontal ? 28 : 32,
              fontWeight: 800,
              color: isCurrent
                ? "#FDE047"
                : isLit
                  ? "#FFFFFF"
                  : "rgba(255,255,255,0.28)",
              textShadow: isCurrent
                ? "0 0 14px rgba(253, 224, 71, 0.85)"
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

// ---------------------------------------------------------------------------
// Warm Crayon / Storybook Illustrated Stage (Ken Burns + Live 30fps Particle VFX)
// ---------------------------------------------------------------------------
const MOCHI_STATE_BADGE_BY_SCENE: Record<
  number,
  { label: string; color: string }
> = {
  1: { label: "🫠 MẮT CAY XÈ · 01:30 AM", color: "#38BDF8" },
  2: { label: "🌧️ OVERTHINKING · MÂY MƯA", color: "#38BDF8" },
  3: { label: "🔥 PHẢN ỨNG · NỔI LOẠN", color: "#FB7185" },
  4: { label: "🌧️ QUÁ TẢI DEADLINE", color: "#FB7185" },
  5: { label: "🌱 BÌNH YÊN ĐÊM MƯA", color: "#4ADE80" },
  6: { label: "🌱 TÒ MÒ · ĐÁNH ĐỔI", color: "#38BDF8" },
  7: { label: "🫠 KIỆT SỨC TAN CHẢY", color: "#EAB308" },
  8: { label: "🫠 VÒNG LẶP CẠN PIN", color: "#F59E0B" },
  9: { label: "🌼 NGỘ RA & NỞ HOA VÀNG", color: "#FDE047" },
};

const CrayonIllustratedStage: React.FC<{
  scene: SceneSpec;
  imageSrc: string;
  size: number;
}> = ({ scene, imageSrc, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 115 },
  });

  // Smooth Ken Burns camera push/pan across 300 frames (10.0s)
  const isEven = scene.index % 2 === 0;
  const kbScale = isEven
    ? interpolate(frame, [0, 300], [1.11, 1.02], { extrapolateRight: "clamp" })
    : interpolate(frame, [0, 300], [1.02, 1.12], { extrapolateRight: "clamp" });
  const kbX = isEven
    ? interpolate(frame, [0, 300], [10, -10], { extrapolateRight: "clamp" })
    : interpolate(frame, [0, 300], [-10, 10], { extrapolateRight: "clamp" });
  const kbY = interpolate(frame, [0, 300], [6, -8], {
    extrapolateRight: "clamp",
  });

  const accent = scene.keynoteStat?.accent ?? "#4ADE80";
  const badge = MOCHI_STATE_BADGE_BY_SCENE[scene.index];

  const isRainScene =
    scene.mood === "inner_bird" ||
    scene.mood === "rainy_window" ||
    scene.mood === "daytime_drain";
  const isFireScene = scene.mood === "rebel_shield";
  const isPhoneGlowScene =
    scene.mood === "scrolling_130am" ||
    scene.mood === "balance_scale" ||
    scene.mood === "battery_siphon";
  const isBloomScene = scene.mood === "warm_bloom";

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        borderRadius: 38,
        overflow: "hidden",
        border: `3px solid ${accent}88`,
        boxShadow: `0 24px 60px rgba(0, 0, 0, 0.65), 0 0 42px ${accent}26`,
        transform: `scale(${interpolate(enter, [0, 1], [0.92, 1])})`,
        opacity: enter,
        backgroundColor: "#070B14",
      }}
    >
      {/* Ken Burns Illustrated Painting */}
      <Img
        src={staticFile(imageSrc)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${kbScale}) translate(${kbX}px, ${kbY}px)`,
        }}
      />

      {/* Live 30fps Atmospheric VFX Overlay */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 800 800"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {/* Rain streaks for rainy/overthinking scenes */}
        {isRainScene &&
          Array.from({ length: 18 }).map((_, i) => {
            const rx = (i * 53 + 40) % 780;
            const ry = ((frame * 11 + i * 67) % 860) - 40;
            return (
              <line
                key={i}
                x1={rx}
                y1={ry}
                x2={rx - 12}
                y2={ry + 34}
                stroke="#7DD3FC"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity={0.32}
              />
            );
          })}

        {/* Rising warm fire sparks for State 02 rebel_shield */}
        {isFireScene &&
          Array.from({ length: 14 }).map((_, i) => {
            const sx = 180 + ((i * 39 + Math.sin(t * 2 + i) * 28) % 440);
            const sy = 760 - ((frame * 4.2 + i * 58) % 740);
            return (
              <circle
                key={i}
                cx={sx}
                cy={sy}
                r={i % 2 === 0 ? 4.5 : 6.5}
                fill={i % 2 === 0 ? "#FDE047" : "#FB7185"}
                opacity={0.75 * (sy / 760)}
              />
            );
          })}

        {/* Subtle flickering blue screen pulse */}
        {isPhoneGlowScene && (
          <rect
            x="0"
            y="0"
            width="800"
            height="800"
            fill="#38BDF8"
            opacity={0.04 + 0.04 * Math.abs(Math.sin(t * 5.2))}
          />
        )}

        {/* Floating warm fireflies (extra rich in Scene 09 Bloom!) */}
        {Array.from({ length: isBloomScene ? 20 : 7 }).map((_, i) => {
          const fx = 70 + ((i * 89 + Math.sin(t * 1.1 + i) * 34) % 660);
          const fy = 80 + ((i * 73 + Math.cos(t * 1.0 + i) * 38) % 640);
          const op =
            (isBloomScene ? 0.45 : 0.22) +
            0.45 * Math.abs(Math.sin(t * 2.3 + i));
          return (
            <circle
              key={i}
              cx={fx}
              cy={fy}
              r={isBloomScene ? 5.5 : 3.5}
              fill={isBloomScene || i % 2 === 0 ? "#FDE047" : "#4ADE80"}
              opacity={op}
            />
          );
        })}
      </svg>

      {/* Subtle Bottom Vignette + Emotion State Pill */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(7,11,20,0.08) 0%, rgba(7,11,20,0) 65%, rgba(7,11,20,0.62) 100%)",
          pointerEvents: "none",
        }}
      />
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 20,
            padding: "8px 18px",
            borderRadius: 999,
            backgroundColor: "rgba(10, 18, 32, 0.86)",
            border: `1.5px solid ${badge.color}99`,
            color: badge.color,
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: 0.6,
          }}
        >
          {badge.label}
        </div>
      )}
    </div>
  );
};

const OmniFlashVideoStage: React.FC<{
  scene: SceneSpec;
  clipSrc: string;
  width: number;
  height: number;
  veoVolume?: number;
}> = ({ scene, clipSrc, width, height, veoVolume = 0.05 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 115 },
  });
  const accent = scene.keynoteStat?.accent ?? "#4ADE80";
  const badge = MOCHI_STATE_BADGE_BY_SCENE[scene.index];

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        borderRadius: 38,
        overflow: "hidden",
        border: `3px solid ${accent}88`,
        boxShadow: `0 24px 60px rgba(0, 0, 0, 0.65), 0 0 42px ${accent}26`,
        transform: `scale(${interpolate(enter, [0, 1], [0.93, 1])})`,
        opacity: enter,
        backgroundColor: "#070B14",
      }}
    >
      <OffthreadVideo
        src={staticFile(clipSrc)}
        volume={veoVolume}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(7,11,20,0.06) 0%, rgba(7,11,20,0) 68%, rgba(7,11,20,0.58) 100%)",
          pointerEvents: "none",
        }}
      />
      {badge && (
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 20,
            padding: "8px 18px",
            borderRadius: 999,
            backgroundColor: "rgba(10, 18, 32, 0.86)",
            border: `1.5px solid ${badge.color}99`,
            color: badge.color,
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: 0.6,
          }}
        >
          {badge.label}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Master Episode Component (Supports both 16:9 YouTube & 9:16 Shorts/TikTok)
// ---------------------------------------------------------------------------
export const BeMochiEp01Master: React.FC<BeMochiEp01Props> = ({
  orientation = "16:9",
  visualMode,
  useOmniFlashClips = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isHorizontal = orientation === "16:9";
  const audioMix = MOCHI_AUDIO_MIX_CONFIG[orientation];
  const resolvedMode: "svg" | "crayon" | "omniflash" =
    visualMode ?? (useOmniFlashClips ? "omniflash" : "svg");
  const progressPct = Math.min(100, (frame / (90 * fps)) * 100);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070B14",
        fontFamily: "'Segoe UI', 'Inter', Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Master 90s Audio Mix (Haitrieu Voiceover + Night Rain + Glass Chimes) */}
      <Audio src={staticFile("episodes/mochi-ep01/master_mix_mochi_ep01_90s.wav")} volume={audioMix.narration} />

      {/* Background Music: Building 20 – NewPulse Harmony (59s, looped) */}
      {/* First play: 0s–59s */}
      <Audio
        src={staticFile("episodes/mochi-ep01/audio/building_20.wav")}
        volume={(f) => {
          const fadeInEnd = 2 * fps;   // 2s fade in
          if (f < fadeInEnd) return interpolate(f, [0, fadeInEnd], [0, audioMix.building20]);
          return audioMix.building20;
        }}
      />
      {/* Second play (loop): 59s–90s with fade-out at end */}
      <Sequence from={Math.round(59.19 * fps)} durationInFrames={Math.round(90 * fps) - Math.round(59.19 * fps)}>
        <Audio
          src={staticFile("episodes/mochi-ep01/audio/building_20.wav")}
          volume={(f) => {
            const remainFrames = Math.round(90 * fps) - Math.round(59.19 * fps);
            const fadeOutStart = remainFrames - 3 * fps; // 3s fade out
            if (f >= fadeOutStart) return interpolate(f, [fadeOutStart, remainFrames], [audioMix.building20, 0], { extrapolateRight: "clamp" });
            return audioMix.building20;
          }}
        />
      </Sequence>

      {/* 9 Chapter Sequences (10.0s = 300 frames each = 2700 frames / 90.0s total) */}
      {SCENES.map((scene, idx) => {
        const clipNum = String(scene.index).padStart(3, "0");
        const imgNum = String(scene.index).padStart(2, "0");
        return (
          <Sequence key={scene.index} from={idx * 300} durationInFrames={300}>
            <SceneLayout
              scene={scene}
              isHorizontal={isHorizontal}
              visualMode={resolvedMode}
              clipSrc={`episodes/mochi-ep01/${clipNum}.mp4`}
              crayonSrc={`episodes/mochi-ep01/crayon/scene_${imgNum}.png`}
            />
          </Sequence>
        );
      })}

      {/* Finale Progressive Quote Overlay (79.4s -> 90.0s = frame 2382 -> 2700) */}
      <Sequence from={2382} durationInFrames={318}>
        <div
          style={{
            position: "absolute",
            ...(isHorizontal
              ? { bottom: 54, left: 68, width: 910 }
              : { bottom: 84, left: 40, right: 40 }),
          }}
        >
          <FinaleTakeawayCard isHorizontal={isHorizontal} />
        </div>
      </Sequence>

      {/* Live Karaoke Bar (Hidden once Finale Card appears at 79.4s) */}
      {frame < 2382 && (
        <div
          style={{
            position: "absolute",
            ...(isHorizontal
              ? { bottom: 54, left: 64, width: 880 }
              : { bottom: 72, left: 38, right: 38 }),
          }}
        >
          <MochiKaraokeBar isHorizontal={isHorizontal} />
        </div>
      )}

      {/* Subtle Brand Watermark Pill & Bottom Progress Bar */}
      <div
        style={{
          position: "absolute",
          top: isHorizontal ? 30 : 38,
          right: isHorizontal ? 56 : 40,
          padding: "8px 18px",
          borderRadius: 999,
          backgroundColor: "rgba(15, 23, 42, 0.78)",
          border: "1.5px solid rgba(74, 222, 128, 0.45)",
          color: "#E2E8F0",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 0.6,
        }}
      >
        🌱 BÉ MOCHI MẦM XANH
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 7,
          width: `${progressPct}%`,
          background: "linear-gradient(90deg, #4ADE80, #FDE047)",
        }}
      />
    </AbsoluteFill>
  );
};

const SceneLayout: React.FC<{
  scene: SceneSpec;
  isHorizontal: boolean;
  visualMode: "svg" | "crayon" | "omniflash";
  clipSrc: string;
  crayonSrc: string;
}> = ({ scene, isHorizontal, visualMode, clipSrc, crayonSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardEnter = spring({ frame, fps, config: { damping: 16, stiffness: 130 } });

  if (isHorizontal) {
    // 16:9 YOUTUBE WIDESCREEN LAYOUT (1920x1080)
    const isOmni = visualMode === "omniflash";
    return (
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isOmni ? "40px 52px 32px 64px" : "64px 72px 128px 72px",
        }}
      >
        {/* Left Column: iOS Notification + Keynote Insight Card */}
        <div
          style={{
            width: isOmni ? 850 : 880,
            paddingBottom: isOmni ? 96 : 0,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            opacity: cardEnter,
            transform: `translateY(${interpolate(cardEnter, [0, 1], [28, 0])}px)`,
          }}
        >
          {/* iOS Frosted Pill */}
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 12,
              padding: "10px 22px",
              borderRadius: 999,
              backgroundColor: "rgba(15, 23, 42, 0.88)",
              border: "2px solid #4ADE80",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#4ADE80",
              }}
            />
            <span
              style={{
                color: "#4ADE80",
                fontSize: 21,
                fontWeight: 800,
                letterSpacing: 1.2,
              }}
            >
              {scene.tag}
            </span>
          </div>

          {/* Main Chapter Headline */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 1.18,
              color: "#FFFFFF",
            }}
          >
            {scene.title}
          </div>

          {/* Subtitle Explanation */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              lineHeight: 1.45,
              color: "#CBD5E1",
            }}
          >
            {scene.subtitle}
          </div>

          {/* Apple Keynote Stat / Metric Card */}
          {scene.keynoteStat && (
            <div
              style={{
                marginTop: 8,
                padding: "22px 28px",
                borderRadius: 24,
                backgroundColor: "rgba(248, 250, 252, 0.96)",
                boxShadow: "0 18px 42px rgba(0,0,0,0.45)",
                display: "inline-flex",
                flexDirection: "column",
                alignSelf: "flex-start",
                minWidth: 440,
                borderLeft: `10px solid ${scene.keynoteStat.accent}`,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#475569",
                  letterSpacing: 1.2,
                }}
              >
                {scene.keynoteStat.label}
              </span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#0F172A",
                  marginTop: 4,
                }}
              >
                {scene.keynoteStat.value}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Animated Bé Mochi Mầm Xanh Stage */}
        <div
          style={{
            width: isOmni ? 900 : 790,
            height: isOmni ? 950 : 790,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: isOmni ? 42 : 28,
          }}
        >
          {visualMode === "omniflash" ? (
            <OmniFlashVideoStage
              scene={scene}
              clipSrc={clipSrc}
              width={890}
              height={940}
              veoVolume={MOCHI_AUDIO_MIX_CONFIG["16:9"].veo3}
            />
          ) : visualMode === "crayon" ? (
            <CrayonIllustratedStage
              scene={scene}
              imageSrc={crayonSrc}
              size={770}
            />
          ) : (
            <AnimatedMochiStage mood={scene.mood} />
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // 9:16 VERTICAL SHORTS / TIKTOK / REELS LAYOUT (1080x1920)
  const isOmniVertical = visualMode === "omniflash";
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: isOmniVertical ? "86px 36px 222px 36px" : "108px 48px 360px 48px",
      }}
    >
      {/* Top iOS Notification + Headline */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: cardEnter,
          transform: `translateY(${interpolate(cardEnter, [0, 1], [-24, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 22px",
            borderRadius: 999,
            backgroundColor: "rgba(15, 23, 42, 0.90)",
            border: "2px solid #4ADE80",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#4ADE80",
            }}
          />
          <span
            style={{
              color: "#4ADE80",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 1.1,
            }}
          >
            {scene.tag}
          </span>
        </div>

        <div
          style={{
            fontSize: 40,
            fontWeight: 900,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {scene.title}
        </div>

        {scene.keynoteStat && (
          <div
            style={{
              padding: "11px 24px",
              borderRadius: 18,
              backgroundColor: "rgba(248, 250, 252, 0.96)",
              borderLeft: `8px solid ${scene.keynoteStat.accent}`,
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 12px 28px rgba(0,0,0,0.4)",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 800, color: "#475569" }}>
              {scene.keynoteStat.label}:
            </span>
            <span style={{ fontSize: 24, fontWeight: 900, color: "#0F172A" }}>
              {scene.keynoteStat.value}
            </span>
          </div>
        )}
      </div>

      {/* Center Animated Mochi Stage */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: isOmniVertical ? 14 : 18,
        }}
      >
        {visualMode === "omniflash" ? (
          <OmniFlashVideoStage
            scene={scene}
            clipSrc={clipSrc}
            width={1004}
            height={1300}
            veoVolume={MOCHI_AUDIO_MIX_CONFIG["9:16"].veo3}
          />
        ) : visualMode === "crayon" ? (
          <CrayonIllustratedStage
            scene={scene}
            imageSrc={crayonSrc}
            size={840}
          />
        ) : (
          <AnimatedMochiStage mood={scene.mood} compact />
        )}
      </div>
    </AbsoluteFill>
  );
};

