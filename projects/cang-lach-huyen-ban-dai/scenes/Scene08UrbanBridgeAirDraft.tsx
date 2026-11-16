import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";

export const Scene08UrbanBridgeAirDraft: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const stageIn = spring({ frame: frame - 3, fps, config: { damping: 18, stiffness: 135 } });
  const shipSlide = interpolate(progress, [0.12, 0.45], [-210, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const blocked = progress >= 0.43;
  const flash = Math.abs(Math.sin((frame / fps) * Math.PI * 2.4));

  const waterY = 640;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #040B18 0%, #0A1B33 52%, #040914 100%)",
        overflow: "hidden",
      }}
    >
      {/* Top Broadcast Title */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          top: 34,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: stageIn,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "5px 14px",
              borderRadius: 6,
              background: PALETTE.coralWarn,
              color: "#FFFFFF",
              fontFamily: FONTS.mono,
              fontSize: 13,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            CHƯƠNG 2.4 • NÚT THẮT TRÊN KHÔNG &amp; HAI BỜ ĐÔ THỊ SÔNG CẤM
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 36, fontWeight: 800, color: "#FFFFFF" }}>
            Vướng <span style={{ color: "#FACC15" }}>tĩnh không cầu nội đô</span> &amp; không gian quay tàu 400 m
          </div>
        </div>

        <div
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: "rgba(245, 158, 11, 0.16)",
            border: `2px solid ${PALETTE.amberBright}`,
            fontFamily: FONTS.mono,
            fontSize: 16,
            fontWeight: 800,
            color: "#FACC15",
          }}
        >
          HOÀNG DIỆU LÙI BƯỚC → ĐÔ THỊ THỦY NGUYÊN
        </div>
      </div>

      {/* Main Elevation Diagram: Megaship vs 3 Urban Bridges across Song Cam */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: stageIn }}>
        <defs>
          <linearGradient id="urbanRiver" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#082F49" stopOpacity={0.92} />
          </linearGradient>
        </defs>

        {/* Left & Right Urban Skylines framing Song Cam */}
        <g opacity={0.9}>
          <rect x={SAFE_X} y={370} width={220} height={270} fill="#0F172A" stroke="#334155" strokeWidth={2} />
          <rect x={88} y={310} width={76} height={330} fill="#1E293B" stroke="#38BDF8" strokeWidth={1.5} />
          <rect x={182} y={410} width={88} height={230} fill="#1E293B" stroke="#38BDF8" strokeWidth={1.5} />
          <text x={174} y={294} textAnchor="middle" fill="#CBD5E1" fontFamily={FONTS.sans} fontSize={16} fontWeight={800}>
            LÕI ĐÔ THỊ NỘI THÀNH
          </text>

          <rect x={width - SAFE_X - 240} y={380} width={240} height={260} fill="#0F172A" stroke="#334155" strokeWidth={2} />
          <rect x={width - SAFE_X - 210} y={335} width={86} height={305} fill="#1E293B" stroke="#2DD4BF" strokeWidth={1.5} />
          <rect x={width - SAFE_X - 104} y={420} width={78} height={220} fill="#1E293B" stroke="#2DD4BF" strokeWidth={1.5} />
          <text x={width - SAFE_X - 120} y={316} textAnchor="middle" fill="#99F6E4" fontFamily={FONTS.sans} fontSize={16} fontWeight={800}>
            TRUNG TÂM MỚI THỦY NGUYÊN
          </text>
        </g>

        {/* River Water & Channel Bed */}
        <rect x={SAFE_X} y={waterY} width={width - SAFE_X * 2} height={220} fill="url(#urbanRiver)" />
        <line x1={SAFE_X} y1={waterY} x2={width - SAFE_X} y2={waterY} stroke="#38BDF8" strokeWidth={3.5} />

        {/* Three Highway Bridges (Cau Binh / Cau Hoang Van Thu / Cau Nguyen Trai) forming an Air-Draft Ceiling */}
        {[
          { x: 640, name: "CẦU BÍNH", sub: "Tĩnh không hạn chế" },
          { x: 1035, name: "CẦU HOÀNG VĂN THỤ", sub: "Cửa ngõ Thủy Nguyên" },
          { x: 1410, name: "CẦU NGUYỄN TRÃI", sub: "Di dời bến Hoàng Diệu" },
        ].map((br, idx) => (
          <g key={idx}>
            {/* Bridge Pylons & Arch Deck at y=408 */}
            <rect x={br.x - 155} y={406} width={310} height={18} rx={4} fill="#334155" stroke="#FACC15" strokeWidth={2} />
            <path d={`M ${br.x - 135} ${406} Q ${br.x} ${296} ${br.x + 135} ${406}`} fill="none" stroke="#FACC15" strokeWidth={5} />
            <line x1={br.x - 125} y1={424} x2={br.x - 125} y2={waterY} stroke="#64748B" strokeWidth={10} />
            <line x1={br.x + 125} y1={424} x2={br.x + 125} y2={waterY} stroke="#64748B" strokeWidth={10} />
            {/* Bridge Pill Label */}
            <rect x={br.x - 118} y={222} width={236} height={54} rx={8} fill="rgba(6, 17, 31, 0.94)" stroke="#FACC15" strokeWidth={1.8} />
            <text x={br.x} y={245} textAnchor="middle" fill="#FACC15" fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
              {br.name}
            </text>
            <text x={br.x} y={265} textAnchor="middle" fill="#E2E8F0" fontFamily={FONTS.sans} fontSize={13.5} fontWeight={600}>
              {br.sub}
            </text>
          </g>
        ))}

        {/* Dashed Red Air-Draft Ceiling Line across all urban bridges */}
        <line x1={320} y1={426} x2={1580} y2={426} stroke={PALETTE.coralWarn} strokeWidth={3} strokeDasharray="10 6" />
        <rect x={1155} y={438} width={348} height={36} rx={6} fill="rgba(159, 18, 57, 0.94)" stroke="#FFFFFF" strokeWidth={1.4} />
        <text x={1329} y={462} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
          TRẦN TĨNH KHÔNG THÔNG THUYỀN
        </text>

        {/* Giant 400m Megaship Superstructure hitting bridge clearance ceiling! */}
        <g transform={`translate(${660 + shipSlide}, ${waterY})`}>
          <polygon points="-245,-58 230,-58 275,0 240,86 -235,86 -265,0" fill="#0F766E" stroke="#2DD4BF" strokeWidth={3} />
          {[-205, -135, -65, 5, 75].map((cx, ci) => (
            <rect key={ci} x={cx} y={-136} width={58} height={78} fill={ci % 2 === 0 ? "#F59E0B" : "#EF4444"} stroke="#020611" strokeWidth={1.8} />
          ))}
          {/* High Navigation Bridge Tower crashing above bridge line y=426 (relative y=-214!) */}
          <rect x={150} y={-258} width={54} height={200} fill="#F8FAFC" stroke="#0F172A" strokeWidth={2.5} />
          <rect x={144} y={-236} width={66} height={18} fill="#0F172A" />

          {/* Collision flash rings */}
          {blocked && (
            <g transform="translate(177, -214)">
              <circle r={24 + flash * 16} fill="none" stroke={PALETTE.coralWarn} strokeWidth={3.5} opacity={1 - flash * 0.6} />
              <circle r={14} fill={PALETTE.coralWarn} stroke="#FFFFFF" strokeWidth={2.5} />
              <text x={0} y={6} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={18} fontWeight={900}>
                ✕
              </text>
            </g>
          )}
        </g>

        {/* Bottom Explanation Summary Strip (trimmed width to clear bottom-right documentary photo) */}
        <rect x={SAFE_X} y={762} width={1268} height={116} rx={14} fill="rgba(6, 17, 31, 0.94)" stroke="#38BDF8" strokeWidth={1.8} />
        <text x={SAFE_X + 26} y={794} fill="#FACC15" fontFamily={FONTS.mono} fontSize={15} fontWeight={800}>
          HAI NGUYÊN NHÂN NỘI ĐÔ KHÔNG THỂ ĐÓN SIÊU TÀU:
        </text>
        <text x={SAFE_X + 26} y={822} fill="#FFFFFF" fontFamily={FONTS.sans} fontSize={18.5} fontWeight={700}>
          1. Đài chỉ huy siêu tàu cao vượt trần tĩnh không cầu đường bộ nội đô
        </text>
        <text x={SAFE_X + 26} y={850} fill="#FFFFFF" fontFamily={FONTS.sans} fontSize={18.5} fontWeight={700}>
          2. Lòng sông hẹp 80 m không đủ khẩu độ cho tàu dài 400 m quay trở
        </text>
      </svg>

      <EvidencePhotoCard
        photo={REAL_PHOTOS.cau_hoang_van_thu}
        left={width - SAFE_X - 442}
        top={666}
        width={442}
        height={244}
        accentColor="#FACC15"
        appearAtSec={1.6}
      />
    </AbsoluteFill>
  );
};

