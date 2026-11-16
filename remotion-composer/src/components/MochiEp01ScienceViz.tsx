import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface ScienceVizProps {
  shotNumber: number;
  shotDurationFrames: number;
  accent: string;
}

const CARD_STYLE: React.CSSProperties = {
  width: "100%",
  height: 224,
  borderRadius: 22,
  background:
    "linear-gradient(145deg, rgba(13, 22, 39, 0.95) 0%, rgba(8, 14, 26, 0.98) 100%)",
  border: "1.5px solid rgba(148, 163, 184, 0.22)",
  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.52), inset 0 1px 0 rgba(255,255,255,0.06)",
  position: "relative",
  overflow: "hidden",
  padding: "16px 22px",
  boxSizing: "border-box",
};

export const MochiEp01ScienceViz: React.FC<ScienceVizProps> = ({
  shotNumber,
  shotDurationFrames,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 18, stiffness: 120 },
  });

  const prog = interpolate(
    frame,
    [10, Math.max(60, Math.min(shotDurationFrames - 20, 150))],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const breathe = Math.sin((frame / fps) * Math.PI * 1.1);

  return (
    <div
      style={{
        ...CARD_STYLE,
        borderColor: `${accent}55`,
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [18, 0])}px) scale(${interpolate(
          enter,
          [0, 1],
          [0.97, 1]
        )})`,
      }}
    >
      {/* Subtle Ambient Corner Glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}24 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {shotNumber === 2 && <Viz02ClockMap frame={frame} fps={fps} prog={prog} />}
      {shotNumber === 4 && <Viz04DayBlocks frame={frame} fps={fps} prog={prog} />}
      {shotNumber === 6 && <Viz06WarmTeaRitual frame={frame} prog={prog} breathe={breathe} />}
      {shotNumber === 8 && <Viz08Catastrophizing frame={frame} fps={fps} prog={prog} />}
      {shotNumber === 10 && <Viz10FiveSecBreath frame={frame} fps={fps} prog={prog} />}
      {shotNumber === 12 && <Viz12CornellSpotlight frame={frame} fps={fps} prog={prog} />}
      {shotNumber === 14 && <Viz14SpotlightOff frame={frame} fps={fps} prog={prog} />}
      {shotNumber === 16 && <Viz16EmotionalBattery frame={frame} shotDurationFrames={shotDurationFrames} />}
      {shotNumber === 18 && <Viz18BoundaryDome frame={frame} fps={fps} prog={prog} breathe={breathe} />}
      {shotNumber === 20 && <Viz20BrainEnergyTabs frame={frame} fps={fps} prog={prog} />}
      {shotNumber === 23 && <Viz23DopamineCurve frame={frame} prog={prog} />}
      {shotNumber === 26 && <Viz26PastSelfBridge frame={frame} fps={fps} prog={prog} />}
      {shotNumber === 29 && <Viz29MidnightResolution frame={frame} fps={fps} prog={prog} breathe={breathe} />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 1. SHOT 2: 24H Orbital Clock Map (7 Chapter Stops)
// ---------------------------------------------------------------------------
const Viz02ClockMap: React.FC<{ frame: number; fps: number; prog: number }> = ({
  frame,
  fps,
  prog,
}) => {
  const stops = [
    { t: "01:30", label: "Trả thù giờ ngủ", c: "#38BDF8" },
    { t: "09:30", label: "Mây xám suy diễn", c: "#FB7185" },
    { t: "14:00", label: "Hiệu ứng đèn pha", c: "#FDE047" },
    { t: "17:30", label: "Lao động cảm xúc", c: "#FB7185" },
    { t: "19:30", label: "Quá tải tab ngầm", c: "#38BDF8" },
    { t: "21:30", label: "Hẫng sau vạch đích", c: "#FDE047" },
    { t: "23:45", label: "Nhớ mình ngày xưa", c: "#4ADE80" },
  ];
  const sweepDeg = interpolate(prog, [0, 1], [-80, 275]);

  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%", gap: 22 }}>
      <svg width={186} height={186} viewBox="0 0 186 186" style={{ flexShrink: 0 }}>
        <circle cx={93} cy={93} r={78} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth={2} strokeDasharray="4 5" />
        <circle
          cx={93}
          cy={93}
          r={64}
          fill="none"
          stroke="#4ADE80"
          strokeWidth={4}
          strokeDasharray={402}
          strokeDashoffset={402 * (1 - prog)}
          strokeLinecap="round"
          transform="rotate(-90 93 93)"
        />
        {stops.map((s, idx) => {
          const ang = (-90 + idx * (360 / 7)) * (Math.PI / 180);
          const x = 93 + Math.cos(ang) * 64;
          const y = 93 + Math.sin(ang) * 64;
          const pop = spring({
            frame: Math.max(0, frame - 10 - idx * 8),
            fps,
            config: { damping: 14, stiffness: 160 },
          });
          return (
            <g key={s.t} transform={`translate(${x}, ${y}) scale(${pop})`}>
              <circle r={9} fill="#0B1324" stroke={s.c} strokeWidth={2.5} />
              <circle r={4} fill={s.c} />
            </g>
          );
        })}
        {/* Sweeping Brass Hand */}
        <g transform={`rotate(${sweepDeg} 93 93)`}>
          <line x1={93} y1={93} x2={93} y2={38} stroke="#FDE047" strokeWidth={3} strokeLinecap="round" />
          <circle cx={93} cy={93} r={6} fill="#FDE047" />
        </g>
        <text x={93} y={118} textAnchor="middle" fill="#94A3B8" fontSize={12} fontWeight={800}>
          24H ORBIT
        </text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", flex: 1 }}>
        {stops.map((s, idx) => {
          const itemIn = spring({
            frame: Math.max(0, frame - 8 - idx * 6),
            fps,
            config: { damping: 16, stiffness: 140 },
          });
          return (
            <div
              key={s.t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 10,
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                border: `1px solid ${s.c}55`,
                opacity: itemIn,
                transform: `translateX(${interpolate(itemIn, [0, 1], [12, 0])}px)`,
              }}
            >
              <span style={{ color: s.c, fontWeight: 900, fontSize: 14 }}>{s.t}</span>
              <span style={{ color: "#E2E8F0", fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap" }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. SHOT 4: Revenge Bedtime Procrastination (Daytime Squeezed vs Midnight Sliver)
// ---------------------------------------------------------------------------
const Viz04DayBlocks: React.FC<{ frame: number; fps: number; prog: number }> = ({
  frame,
  fps,
  prog,
}) => {
  const blocks = [
    { label: "Họp sớm", w: 13, c: "#475569" },
    { label: "Deadline", w: 16, c: "#64748B" },
    { label: "Tin nhắn", w: 12, c: "#475569" },
    { label: "Tăng ca", w: 16, c: "#64748B" },
    { label: "Kẹt xe", w: 11, c: "#475569" },
    { label: "Việc nhà", w: 13, c: "#64748B" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#94A3B8", fontSize: 14, fontWeight: 800, letterSpacing: 0.8 }}>
          MỘT NGÀY BỊ CHIA NHỎ · MINH HỌA
        </span>
        <span style={{ color: "#38BDF8", fontSize: 14, fontWeight: 900 }}>
          KHOẢNG RIÊNG CUỐI NGÀY
        </span>
      </div>

      {/* Segmented Bar */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 68,
          borderRadius: 14,
          overflow: "hidden",
          border: "1.5px solid rgba(148,163,184,0.28)",
          backgroundColor: "#060B14",
          gap: 3,
          padding: 4,
          boxSizing: "border-box",
        }}
      >
        {blocks.map((b, i) => {
          const bIn = spring({
            frame: Math.max(0, frame - 6 - i * 5),
            fps,
            config: { damping: 16, stiffness: 150 },
          });
          return (
            <div
              key={b.label}
              style={{
                width: `${b.w * bIn}%`,
                backgroundColor: b.c,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#CBD5E1",
                fontSize: 12.5,
                fontWeight: 800,
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {b.label}
            </div>
          );
        })}
        {/* Glowing Midnight Sliver */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #0284C7, #38BDF8)",
            borderRadius: 9,
            boxShadow: `0 0 ${14 + prog * 12}px rgba(56, 189, 248, 0.65)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#08101E",
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          <span>01:30</span>
          <span style={{ fontSize: 11 }}>TỰ DO</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, fontWeight: 700 }}>
        <span style={{ color: "#94A3B8" }}>Ban ngày: nhiều kỳ vọng bên ngoài</span>
        <span style={{ color: "#FDE047" }}>Đánh đổi giấc ngủ để bù tự do</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3. SHOT 6: 15-Minute Warm Water Ritual (Blue Light Off -> Warm Calm On)
// ---------------------------------------------------------------------------
const Viz06WarmTeaRitual: React.FC<{ frame: number; prog: number; breathe: number }> = ({
  frame,
  prog,
  breathe,
}) => {
  const blueGlare = interpolate(prog, [0, 0.7], [1, 0.18], { extrapolateRight: "clamp" });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%", gap: 20 }}>
      {/* Phone Face-Down Dimming */}
      <div
        style={{
          flex: 1,
          height: 168,
          borderRadius: 16,
          backgroundColor: "rgba(15,23,42,0.8)",
          border: "1.5px solid rgba(56,189,248,0.28)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 86,
            height: 22,
            borderRadius: 8,
            backgroundColor: "#1E293B",
            border: "2px solid #475569",
            boxShadow: `0 8px 22px rgba(56,189,248,${blueGlare * 0.6})`,
            transform: `translateY(${interpolate(prog, [0, 0.6], [-8, 4], { extrapolateRight: "clamp" })}px)`,
          }}
        />
        <span style={{ color: "#94A3B8", fontSize: 15, fontWeight: 800 }}>
          Úp màn hình · Tắt ánh sáng xanh
        </span>
        <span style={{ color: "#38BDF8", fontSize: 22, fontWeight: 900 }}>
          Bớt xao nhãng
        </span>
      </div>

      <div style={{ color: "#4ADE80", fontSize: 28, fontWeight: 900 }}>➔</div>

      {/* 15-Min Warm Cup Ring */}
      <div
        style={{
          flex: 1.15,
          height: 168,
          borderRadius: 16,
          backgroundColor: "rgba(20,34,28,0.72)",
          border: "1.5px solid rgba(74,222,128,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "0 16px",
        }}
      >
        <svg width={104} height={104} viewBox="0 0 104 104">
          <circle cx={52} cy={52} r={42} fill="none" stroke="rgba(74,222,128,0.18)" strokeWidth={7} />
          <circle
            cx={52}
            cy={52}
            r={42}
            fill="none"
            stroke="#4ADE80"
            strokeWidth={7}
            strokeDasharray={264}
            strokeDashoffset={264 * (1 - prog)}
            strokeLinecap="round"
            transform="rotate(-90 52 52)"
          />
          {/* Warm Mug + Steam */}
          <rect x={36} y={48} width={28} height={24} rx={6} fill="#FDE047" />
          <path d="M64 53 C71 53, 71 65, 64 65" fill="none" stroke="#FDE047" strokeWidth={3.5} />
          <path
            d={`M44 ${42 + breathe * 2} Q41 34 46 28 M55 ${42 - breathe * 2} Q58 34 53 28`}
            fill="none"
            stroke="#FEF08A"
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.75 + Math.sin(frame * 0.1) * 0.2}
          />
        </svg>
        <div>
          <div style={{ color: "#FDE047", fontSize: 26, fontWeight: 900 }}>15 PHÚT</div>
          <div style={{ color: "#E2E8F0", fontSize: 14.5, fontWeight: 700, lineHeight: 1.35 }}>
            Tự do tỉnh táo
            <br />
            <span style={{ color: "#4ADE80" }}>Chậm lại một chút</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 4. SHOT 8: Catastrophizing (1 Vague Message -> 10 Alarm Scenarios)
// ---------------------------------------------------------------------------
const Viz08Catastrophizing: React.FC<{ frame: number; fps: number; prog: number }> = ({
  frame,
  fps,
  prog,
}) => {
  const targets = [24, 52, 80, 108, 136, 164];
  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%", position: "relative" }}>
      <svg width="100%" height={188} viewBox="0 0 628 188">
        {/* Source Message Node */}
        <rect x={8} y={66} width={154} height={56} rx={14} fill="#1E293B" stroke="#38BDF8" strokeWidth={2} />
        <text x={85} y={91} textAnchor="middle" fill="#F8FAFC" fontSize={13.5} fontWeight={800}>
          1 TIN NHẮN NGẮN
        </text>
        <text x={85} y={110} textAnchor="middle" fill="#94A3B8" fontSize={12} fontWeight={700}>
          “Chiều gặp anh nhé”
        </text>

        {/* Branching Bezier Alarm Curves */}
        {targets.map((ty, idx) => {
          const bProg = interpolate(prog, [idx * 0.08, 0.55 + idx * 0.07], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const jitter = Math.sin(frame * 0.22 + idx) * 1.8;
          const labels = [
            "Mình làm sai báo cáo?",
            "Khách hàng phàn nàn?",
            "Bị cắt giảm nhân sự?",
            "Sếp đang thất vọng?",
            "Lỡ lời trong cuộc họp?",
            "+5 kịch bản xấu khác...",
          ];
          const pop = spring({
            frame: Math.max(0, frame - 12 - idx * 5),
            fps,
            config: { damping: 14, stiffness: 170 },
          });
          return (
            <g key={ty}>
              <path
                d={`M 164 94 C 265 94, 275 ${ty}, 376 ${ty}`}
                fill="none"
                stroke="#FB7185"
                strokeWidth={2.4}
                strokeDasharray={260}
                strokeDashoffset={260 * (1 - bProg)}
                opacity={0.85}
              />
              <g transform={`translate(380, ${ty - 13 + jitter}) scale(${pop})`}>
                <rect width={236} height={26} rx={8} fill="rgba(251,113,133,0.16)" stroke="#FB7185" strokeWidth={1.4} />
                <text x={12} y={17.5} fill="#FECDD3" fontSize={13} fontWeight={800}>
                  ⚠ {labels[idx]}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 5. SHOT 10: 5-Second Cognitive Defusion (Amygdala Down -> Prefrontal Up)
// ---------------------------------------------------------------------------
const Viz10FiveSecBreath: React.FC<{ frame: number; fps: number; prog: number }> = ({
  frame,
  fps,
  prog,
}) => {
  const breathCycle = (Math.sin((frame / fps) * ((2 * Math.PI) / 5) - Math.PI / 2) + 1) / 2;
  const amygdalaPct = Math.round(interpolate(prog, [0, 1], [88, 22]));
  const pfcPct = Math.round(interpolate(prog, [0, 1], [24, 90]));

  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%", gap: 26 }}>
      {/* 5s Breathing Orb */}
      <div style={{ position: "relative", width: 164, height: 164, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            width: 96 + breathCycle * 52,
            height: 96 + breathCycle * 52,
            borderRadius: "50%",
            backgroundColor: "rgba(74, 222, 128, 0.16)",
            border: "2px solid rgba(74, 222, 128, 0.55)",
          }}
        />
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "radial-gradient(circle, #4ADE80 0%, #15803D 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#052E16",
            fontWeight: 900,
          }}
        >
          <span style={{ fontSize: 24 }}>5 GIÂY</span>
          <span style={{ fontSize: 12 }}>HÍT SÂU</span>
        </div>
      </div>

      {/* Neural Shift Bars */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 15, fontWeight: 800 }}>
            <span style={{ color: "#FDA4AF" }}>Cảm giác báo động</span>
            <span style={{ color: "#FB7185" }}>Dịu lại ↓</span>
          </div>
          <div style={{ height: 18, borderRadius: 999, backgroundColor: "#1E293B", overflow: "hidden" }}>
            <div style={{ width: `${amygdalaPct}%`, height: "100%", backgroundColor: "#FB7185", borderRadius: 999 }} />
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 15, fontWeight: 800 }}>
            <span style={{ color: "#86EFAC" }}>Khoảng lặng để suy xét</span>
            <span style={{ color: "#4ADE80" }}>Mở ra ↑</span>
          </div>
          <div style={{ height: 18, borderRadius: 999, backgroundColor: "#1E293B", overflow: "hidden" }}>
            <div style={{ width: `${pfcPct}%`, height: "100%", backgroundColor: "#4ADE80", borderRadius: 999 }} />
          </div>
        </div>
        <div style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600 }}>
          Minh họa cảm giác · không phải đo hoạt động não
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 6. SHOT 12: Cornell Spotlight Effect (50% Predicted vs <25% Actual)
// ---------------------------------------------------------------------------
const Viz12CornellSpotlight: React.FC<{ frame: number; fps: number; prog: number }> = ({
  frame,
  fps,
  prog,
}) => {
  const predSpring = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 18, stiffness: 110 } });
  const realSpring = spring({ frame: Math.max(0, frame - 24), fps, config: { damping: 18, stiffness: 110 } });
  const predVal = Math.round(predSpring * 50);
  const realVal = Math.round(realSpring * 23);

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#94A3B8", fontSize: 14, fontWeight: 800 }}>
          THÍ NGHIỆM CORNELL (2000) · TỈ LỆ NGƯỜI NHẬN RA CHIẾC ÁO KỲ QUẶC
        </span>
        <span style={{ color: "#FDE047", fontSize: 14, fontWeight: 900 }}>LỆCH GẤP 2 LẦN</span>
      </div>

      {/* Bar 1: Predicted 50% */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 16, fontWeight: 800 }}>
          <span style={{ color: "#FEF08A" }}>Tâm trí bạn tự lo sợ (Dự đoán)</span>
          <span style={{ color: "#FDE047", fontSize: 22, fontWeight: 900 }}>{predVal}%</span>
        </div>
        <div style={{ height: 26, borderRadius: 12, backgroundColor: "#1E293B", padding: 3 }}>
          <div
            style={{
              width: `${predVal}%`,
              height: "100%",
              borderRadius: 9,
              background: "linear-gradient(90deg, #F59E0B, #FDE047)",
              boxShadow: "0 0 16px rgba(253,224,71,0.4)",
            }}
          />
        </div>
      </div>

      {/* Bar 2: Actual <25% + 20-dot visualization */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 16, fontWeight: 800 }}>
          <span style={{ color: "#86EFAC" }}>Thực tế người trong phòng để ý</span>
          <span style={{ color: "#4ADE80", fontSize: 22, fontWeight: 900 }}>&lt;{ Math.max(1, realVal + 2) }%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, height: 26, borderRadius: 12, backgroundColor: "#1E293B", padding: 3 }}>
            <div
              style={{
                width: `${realVal}%`,
                height: "100%",
                borderRadius: 9,
                background: "linear-gradient(90deg, #10B981, #4ADE80)",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const noticed = i < 3;
              return (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: noticed ? "#4ADE80" : "rgba(148,163,184,0.22)",
                    transform: `scale(${prog > 0.3 ? 1 : 0.6})`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 7. SHOT 14: Reverse Spotlight Switch (Click OFF)
// ---------------------------------------------------------------------------
const Viz14SpotlightOff: React.FC<{ frame: number; fps: number; prog: number }> = ({
  frame,
  fps,
  prog,
}) => {
  const switchedOff = prog > 0.42;
  const pullBounce = spring({
    frame: Math.max(0, frame - 28),
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%", gap: 24 }}>
      <svg width={210} height={186} viewBox="0 0 210 186" style={{ flexShrink: 0 }}>
        {/* Harsh Cone dimming out */}
        <polygon
          points="85,18 125,18 182,174 28,174"
          fill="url(#spotGrad)"
          opacity={switchedOff ? interpolate(prog, [0.42, 0.6], [0.7, 0.04], { extrapolateRight: "clamp" }) : 0.75}
        />
        <defs>
          <linearGradient id="spotGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        {/* Lamp Fixture */}
        <rect x={76} y={8} width={58} height={16} rx={6} fill="#334155" stroke="#94A3B8" strokeWidth={2} />
        {/* Brass Pull Chain */}
        <line
          x1={148}
          y1={16}
          x2={148}
          y2={68 + pullBounce * 18}
          stroke="#FDE047"
          strokeWidth={2.5}
          strokeDasharray="3 3"
        />
        <circle cx={148} cy={72 + pullBounce * 18} r={7} fill="#FDE047" />
        {/* Little Mochi Silhouette Relaxing */}
        <ellipse cx={105} cy={146} rx={28} ry={25} fill="#FAF7F0" stroke="#4ADE80" strokeWidth={switchedOff ? 2.5 : 0} />
        <rect x={80} y={138} width={50} height={10} rx={5} fill="#FACC15" />
      </svg>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            padding: "6px 14px",
            borderRadius: 999,
            backgroundColor: switchedOff ? "rgba(74,222,128,0.18)" : "rgba(253,224,71,0.2)",
            color: switchedOff ? "#4ADE80" : "#FDE047",
            fontWeight: 900,
            fontSize: 15,
          }}
        >
          {switchedOff ? "● ĐÈN PHA SÂN KHẤU: ĐÃ TẮT" : "○ ĐANG KIỂM CHỨNG KÝ ỨC..."}
        </div>
        <div style={{ color: "#F8FAFC", fontSize: 21, fontWeight: 900, lineHeight: 1.3 }}>
          Người khác có thể <span style={{ color: "#4ADE80" }}>ít nhớ lỗi nhỏ</span> hơn bạn nghĩ.
        </div>
        <div style={{ color: "#94A3B8", fontSize: 15, fontWeight: 600 }}>
          Ai cũng bận xoay sở với vòm đèn nhỏ của chính họ.
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 8. SHOT 16: Emotional Labor (Patience Battery Draining 100% -> 8%)
// ---------------------------------------------------------------------------
const Viz16EmotionalBattery: React.FC<{ frame: number; shotDurationFrames: number }> = ({
  frame,
  shotDurationFrames,
}) => {
  const drain = interpolate(frame, [10, Math.max(90, shotDurationFrames - 45)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pct = Math.round(interpolate(drain, [0, 1], [92, 9]));
  const activeBars = pct > 72 ? 4 : pct > 48 ? 3 : pct > 24 ? 2 : 1;
  const barColor = activeBars >= 3 ? "#4ADE80" : activeBars === 2 ? "#FDE047" : "#FB7185";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%", gap: 24 }}>
      {/* Big Animated Battery */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 248,
            height: 98,
            borderRadius: 18,
            border: `3px solid ${barColor}`,
            padding: 8,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 7,
            backgroundColor: "#060B14",
            boxShadow: activeBars === 1 ? "0 0 24px rgba(251,113,133,0.45)" : "none",
          }}
        >
          {[0, 1, 2, 3].map((idx) => {
            const on = idx < activeBars;
            const blink = activeBars === 1 && idx === 0 ? 0.65 + Math.sin(frame * 0.35) * 0.35 : 1;
            return (
              <div
                key={idx}
                style={{
                  borderRadius: 9,
                  backgroundColor: on ? barColor : "rgba(148,163,184,0.12)",
                  opacity: on ? blink : 1,
                }}
              />
            );
          })}
        </div>
        <div style={{ width: 10, height: 38, borderRadius: "0 6px 6px 0", backgroundColor: barColor }} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ color: "#94A3B8", fontSize: 14, fontWeight: 800, letterSpacing: 0.7 }}>
          ẨN DỤ PIN CẢM XÚC CUỐI NGÀY
        </div>
        <div style={{ color: barColor, fontSize: 30, fontWeight: 900, lineHeight: 1.1, margin: "6px 0" }}>
          {activeBars >= 3 ? "CÒN SỨC" : activeBars === 2 ? "DẦN MỆT" : "CẦN NGHỈ"}
        </div>
        <div style={{ color: "#CBD5E1", fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>
          Những lần cười gượng &amp; gật đầu trái lòng có thể khiến bạn mệt thêm.
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 9. SHOT 18: 10-Second Boundary Shield (Deflecting Urgent Requests)
// ---------------------------------------------------------------------------
const Viz18BoundaryDome: React.FC<{
  frame: number;
  fps: number;
  prog: number;
  breathe: number;
}> = ({ frame, fps, prog, breathe }) => {
  const domeScale = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14, stiffness: 130 } });
  const planeT = ((frame % 90) / 90);

  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%", gap: 20 }}>
      <svg width={250} height={184} viewBox="0 0 250 184" style={{ flexShrink: 0 }}>
        {/* Incoming Paper Planes curving away at the shield */}
        {[38, 92, 144].map((startY, i) => {
          const t = ((planeT + i * 0.31) % 1);
          const x = interpolate(t, [0, 0.55, 1], [10, 118, 86]);
          const y = interpolate(t, [0, 0.55, 1], [startY, startY, startY + (i === 0 ? -28 : 28)]);
          const op = interpolate(t, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
          return (
            <polygon
              key={i}
              points="0,-6 16,0 0,6 4,0"
              fill="#CBD5E1"
              opacity={op}
              transform={`translate(${x}, ${y}) rotate(${t > 0.55 ? -35 : 0})`}
            />
          );
        })}

        {/* Glowing Emerald Boundary Dome */}
        <g transform={`translate(175, 94) scale(${domeScale * (1 + breathe * 0.025)})`}>
          <circle r={62} fill="rgba(74,222,128,0.14)" stroke="#4ADE80" strokeWidth={3} />
          <circle r={48} fill="none" stroke="rgba(253,224,71,0.45)" strokeWidth={1.5} strokeDasharray="4 4" />
          {/* Protected Green Sprout */}
          <path d="M0 18 L0 -6" stroke="#4ADE80" strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={-10} cy={-10} rx={11} ry={6} transform="rotate(-25 -10 -10)" fill="#4ADE80" />
          <ellipse cx={10} cy={-10} rx={11} ry={6} transform="rotate(25 10 -10)" fill="#86EFAC" />
        </g>
      </svg>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ color: "#4ADE80", fontSize: 15, fontWeight: 900, letterSpacing: 0.8 }}>
          KHOẢNG ĐỆM LỊCH SỰ · 10 GIÂY
        </div>
        <div style={{ color: "#F8FAFC", fontSize: 22, fontWeight: 900, lineHeight: 1.28 }}>
          Ngắt phản xạ “Ừ đưa đây mình làm cho”
        </div>
        <div style={{ color: "#94A3B8", fontSize: 15, fontWeight: 700 }}>
          Giữ lại sự dịu dàng dành cho buổi tối ở nhà.
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 10. SHOT 20: Brain Mass 2% vs Energy 20% + Open Zeigarnik Tabs
// ---------------------------------------------------------------------------
const Viz20BrainEnergyTabs: React.FC<{ frame: number; fps: number; prog: number }> = ({
  frame,
  fps,
  prog,
}) => {
  const c = 2 * Math.PI * 38;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%", gap: 18 }}>
      {/* Dual Radial Gauges */}
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <svg width={98} height={98} viewBox="0 0 98 98">
            <circle cx={49} cy={49} r={38} fill="none" stroke="#1E293B" strokeWidth={8} />
            <circle
              cx={49}
              cy={49}
              r={38}
              fill="none"
              stroke="#94A3B8"
              strokeWidth={8}
              strokeDasharray={c}
              strokeDashoffset={c * (1 - 0.02 * prog)}
              strokeLinecap="round"
              transform="rotate(-90 49 49)"
            />
            <text x={49} y={55} textAnchor="middle" fill="#F8FAFC" fontSize={21} fontWeight={900}>
              2%
            </text>
          </svg>
          <div style={{ color: "#94A3B8", fontSize: 13, fontWeight: 800 }}>Trọng lượng</div>
        </div>

        <div style={{ textAlign: "center" }}>
          <svg width={98} height={98} viewBox="0 0 98 98">
            <circle cx={49} cy={49} r={38} fill="none" stroke="#1E293B" strokeWidth={8} />
            <circle
              cx={49}
              cy={49}
              r={38}
              fill="none"
              stroke="#38BDF8"
              strokeWidth={8}
              strokeDasharray={c}
              strokeDashoffset={c * (1 - 0.2 * prog)}
              strokeLinecap="round"
              transform="rotate(-90 49 49)"
            />
            <text x={49} y={55} textAnchor="middle" fill="#38BDF8" fontSize={21} fontWeight={900}>
              20%
            </text>
          </svg>
          <div style={{ color: "#38BDF8", fontSize: 13, fontWeight: 800 }}>Năng lượng</div>
        </div>
      </div>

      {/* Stacked Open Browser/Mind Tabs */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ color: "#FDE047", fontSize: 13.5, fontWeight: 900, letterSpacing: 0.6 }}>
          HIỆU ỨNG ZEIGARNIK · VÒNG LẶP MỞ CHƯA ĐÓNG
        </div>
        {["Tab #14: Tin nhắn chưa trả lời...", "Tab #29: Quyết định tối nay ăn gì...", "Tab #47: Việc dở lúc 4h chiều..."].map(
          (tab, i) => {
            const pop = spring({
              frame: Math.max(0, frame - 10 - i * 7),
              fps,
              config: { damping: 15, stiffness: 150 },
            });
            return (
              <div
                key={tab}
                style={{
                  padding: "7px 12px",
                  borderRadius: 10,
                  backgroundColor: "rgba(30, 41, 59, 0.9)",
                  border: "1px solid rgba(56, 189, 248, 0.42)",
                  color: "#E2E8F0",
                  fontSize: 13.5,
                  fontWeight: 700,
                  display: "flex",
                  justifyContent: "space-between",
                  opacity: pop,
                  transform: `translateX(${interpolate(pop, [0, 1], [16, 0])}px)`,
                }}
              >
                <span>{tab}</span>
                <span style={{ color: "#FB7185", fontWeight: 900 }}>RAM ●</span>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 11. SHOT 23: Arrival Fallacy (Dopamine Anticipation Peak -> Post-Goal Dip)
// ---------------------------------------------------------------------------
const Viz23DopamineCurve: React.FC<{ frame: number; prog: number }> = ({ prog }) => {
  // Spline points: climb (40,148) -> peak (290,34) -> summit (345,50) -> dip (485,152) -> steady (590,118)
  const pathD = "M 36 150 C 145 142, 225 32, 302 32 C 358 32, 410 156, 492 154 C 538 153, 568 118, 602 114";
  const cometX = interpolate(prog, [0, 0.48, 0.8, 1], [36, 302, 492, 602]);
  const cometY = interpolate(prog, [0, 0.48, 0.8, 1], [150, 32, 154, 114]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg width="100%" height={192} viewBox="0 0 628 192">
        {/* Grid baseline */}
        <line x1={30} y1={162} x2={608} y2={162} stroke="rgba(148,163,184,0.22)" strokeWidth={1.5} />
        <line x1={302} y1={22} x2={302} y2={162} stroke="rgba(253,224,71,0.35)" strokeWidth={1.5} strokeDasharray="4 4" />

        {/* Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#dopaGrad)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={720}
          strokeDashoffset={720 * (1 - prog)}
        />
        <defs>
          <linearGradient id="dopaGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="48%" stopColor="#FDE047" />
            <stop offset="80%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
        </defs>

        {/* Moving Comet */}
        <circle cx={cometX} cy={cometY} r={8} fill="#FDE047" />
        <circle cx={cometX} cy={cometY} r={16} fill="rgba(253,224,71,0.26)" />

        {/* Labels */}
        <text x={145} y={76} fill="#FDE047" fontSize={13.5} fontWeight={900} textAnchor="middle">
          Háo hức khi theo đuổi mục tiêu
        </text>
        <text x={302} y={182} fill="#FDE047" fontSize={13} fontWeight={800} textAnchor="middle">
          🏁 VẠCH ĐÍCH
        </text>
        <text x={485} y={182} fill="#FDA4AF" fontSize={13} fontWeight={800} textAnchor="middle">
          Hẫng sau đích · minh họa
        </text>
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 12. SHOT 26: Past-Self Nostalgia (7-Year Memory Bridge & Seed Growth)
// ---------------------------------------------------------------------------
const Viz26PastSelfBridge: React.FC<{ frame: number; fps: number; prog: number }> = ({
  frame,
  fps,
  prog,
}) => {
  const bloom = spring({ frame: Math.max(0, frame - 24), fps, config: { damping: 14, stiffness: 120 } });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%", padding: "0 8px" }}>
      {/* Past Self Node */}
      <div style={{ textAlign: "center", width: 158 }}>
        <div
          style={{
            width: 76,
            height: 76,
            margin: "0 auto 8px",
            borderRadius: "50%",
            backgroundColor: "rgba(253,224,71,0.16)",
            border: "2.5px solid #FDE047",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 900,
            color: "#FDE047",
          }}
        >
          -7 NĂM
        </div>
        <div style={{ color: "#FEF08A", fontSize: 15, fontWeight: 900 }}>Bản dạng hồn nhiên</div>
        <div style={{ color: "#94A3B8", fontSize: 13, fontWeight: 700 }}>Hạt giống ban đầu</div>
      </div>

      {/* Golden Arc Bridge */}
      <svg width={240} height={130} viewBox="0 0 240 130">
        <path
          d="M 14 96 Q 120 12 226 96"
          fill="none"
          stroke="#FDE047"
          strokeWidth={3.5}
          strokeDasharray={280}
          strokeDashoffset={280 * (1 - prog)}
          strokeLinecap="round"
        />
        <text x={120} y={40} textAnchor="middle" fill="#CBD5E1" fontSize={13} fontWeight={800}>
          Không biến mất — chỉ nứt vỏ lớn lên
        </text>
        <circle cx={120} cy={76} r={18 * bloom} fill="rgba(74,222,128,0.2)" stroke="#4ADE80" strokeWidth={2} />
      </svg>

      {/* Present Protective Self Node */}
      <div style={{ textAlign: "center", width: 158 }}>
        <div
          style={{
            width: 76,
            height: 76,
            margin: "0 auto 8px",
            borderRadius: "50%",
            backgroundColor: "rgba(74,222,128,0.18)",
            border: "2.5px solid #4ADE80",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 900,
            color: "#4ADE80",
            transform: `scale(${0.85 + bloom * 0.15})`,
          }}
        >
          HIỆN TẠI
        </div>
        <div style={{ color: "#86EFAC", fontSize: 15, fontWeight: 900 }}>Đủ sức che chở</div>
        <div style={{ color: "#94A3B8", fontSize: 13, fontWeight: 700 }}>Nở hoa 5 cánh</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 13. SHOT 29: 00:00 AM Full Circle Resolution (90 Minutes Earlier!)
// ---------------------------------------------------------------------------
const Viz29MidnightResolution: React.FC<{
  frame: number;
  fps: number;
  prog: number;
  breathe: number;
}> = ({ frame, fps, prog, breathe }) => {
  const flowerScale = spring({
    frame: Math.max(0, frame - 16),
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  return (
    <div style={{ display: "flex", alignItems: "center", height: "100%", gap: 26 }}>
      <svg width={182} height={182} viewBox="0 0 182 182" style={{ flexShrink: 0 }}>
        <circle cx={91} cy={91} r={72} fill="none" stroke="rgba(74,222,128,0.25)" strokeWidth={3} />
        {/* Arc saved between 00:00 (top) and 01:30 (+45deg) */}
        <path
          d="M 91 19 A 72 72 0 0 1 142 40"
          fill="none"
          stroke="#FDE047"
          strokeWidth={8}
          strokeLinecap="round"
          opacity={prog}
        />
        {/* Both Hands Aligned Upright at 00:00 */}
        <line x1={91} y1={91} x2={91} y2={34} stroke="#4ADE80" strokeWidth={4} strokeLinecap="round" />
        {/* 5-Petal Golden Star Flower at 12 o'clock */}
        <g transform={`translate(91, 20) scale(${flowerScale * (1 + breathe * 0.05)})`}>
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx={0}
              cy={-9}
              rx={5}
              ry={9}
              fill="#FDE047"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle r={4} fill="#FEF9C3" />
        </g>
        <text x={91} y={122} textAnchor="middle" fill="#F8FAFC" fontSize={18} fontWeight={900}>
          00:00 AM
        </text>
      </svg>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            padding: "6px 14px",
            borderRadius: 999,
            backgroundColor: "rgba(74,222,128,0.18)",
            border: "1.5px solid #4ADE80",
            color: "#4ADE80",
            fontSize: 15,
            fontWeight: 900,
          }}
        >
          ✓ ĐÃ GỌI ĐÚNG TÊN 7 CẢM XÚC
        </div>
        <div style={{ color: "#FDE047", fontSize: 30, fontWeight: 900, lineHeight: 1.15 }}>
          Ngủ sớm hơn 90 phút
        </div>
        <div style={{ color: "#CBD5E1", fontSize: 15.5, fontWeight: 700, lineHeight: 1.38 }}>
          Từ 01:30 sáng trằn trọc trở về 00:00 đêm bình yên cùng đóa hoa vàng trên đỉnh đầu.
        </div>
      </div>
    </div>
  );
};

