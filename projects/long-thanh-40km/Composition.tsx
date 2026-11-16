import React from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ----------------------------------------------------------------------------
// ATELIER (BESPOKE) — hand-authored for "40 km, và cái đổi lại".
//
// No imports from remotion-composer/src/components — the stock registry is a
// mechanics codex, not a parts bin. Every scene below is written for this
// subject: a Vietnamese infrastructure-documentary explainer.
//
// Visual law (see art_direction.md):
//   asphalt ink ground, paper for information, amber ONLY for distance,
//   teal ONLY for verified facts. One measuring line, two appearances.
// ----------------------------------------------------------------------------

const INK = "#10141F";
const PAPER = "#E8E6E1";
const AMBER = "#F0A202";
const TEAL = "#2E8B87";
const CONCRETE = "#777E86";

const FPS = 30;

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface SceneSpec {
  id: string;
  sectionId: string;
  start: number;
  duration: number;
  captionWords: WordTiming[];
}

export interface SceneProps {
  scenes: SceneSpec[];
  totalDuration: number;
  captionColor?: string;
}

// --- shared primitives ------------------------------------------------------

const easeSurvey = Easing.bezier(0.22, 0.61, 0.24, 1);

const reveal = (frame: number, delay: number, span = 18) =>
  interpolate(frame, [delay, delay + span], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeSurvey,
  });

/** Survey-style stroke reveal for a line of given length. */
const drawLine = (frame: number, delay: number, span = 20, length = 1) => {
  const t = reveal(frame, delay, span);
  return { strokeDasharray: length, strokeDashoffset: length * (1 - t) };
};

const SourceNote: React.FC<{ children: React.ReactNode; top?: number }> = ({
  children,
  top,
}) => (
  <div
    style={{
      position: "absolute",
      right: 72,
      top: top ?? 44,
      fontFamily: "IBM Plex Sans, Arial, sans-serif",
      fontSize: 19,
      letterSpacing: 0.3,
      color: CONCRETE,
      textAlign: "right",
      maxWidth: 760,
      lineHeight: 1.35,
    }}
  >
    {children}
  </div>
);

const Label: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  width?: number;
  align?: "left" | "center" | "right";
}> = ({ children, size = 26, color = PAPER, width, align = "left" }) => (
  <div
    style={{
      fontFamily: "IBM Plex Sans, Arial, sans-serif",
      fontSize: size,
      lineHeight: 1.45,
      color,
      textAlign: align,
      maxWidth: width,
      fontWeight: 400,
    }}
  >
    {children}
  </div>
);

/** Word-level caption band, driven by the alignment JSON exported with the audio. */
const CaptionBand: React.FC<{
  words: WordTiming[];
  offset: number;
  color?: string;
}> = ({ words, offset, color = PAPER }) => {
  const frame = useCurrentFrame();
  const t = (frame - offset) / FPS;
  const active = words.filter((w) => t >= w.start && t <= w.end + 0.12);

  if (!active.length) return null;
  const text = active.map((w) => w.word).join(" ");

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 46,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: "IBM Plex Sans, Arial, sans-serif",
          fontSize: 38,
          lineHeight: 1.3,
          color,
          background: "rgba(16, 20, 31, 0.74)",
          borderLeft: `3px solid ${AMBER}`,
          padding: "10px 22px",
          maxWidth: 1420,
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      opacity: 0.035,
      backgroundImage:
        "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
      backgroundSize: "4px 4px",
    }}
  />
);

// --- scene 1: regional schematic map ---------------------------------------

const SceneDistanceMap: React.FC<{ duration: number }> = () => {
  const frame = useCurrentFrame();

  const cityReveal = reveal(frame, 6, 22);
  const tanSohnReveal = reveal(frame, 18, 20);
  const longThanhReveal = reveal(frame, 30, 20);
  const line40 = reveal(frame, 46, 26);
  const lineShort = reveal(frame, 58, 18);
  const labelFade = reveal(frame, 72, 16);

  const CITY = { x: 520, y: 620 };
  const TAN = { x: 640, y: 560 };
  const LONG = { x: 1480, y: 330 };

  return (
    <AbsoluteFill style={{ background: INK }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* survey grid */}
        <g opacity={0.14 * cityReveal}>
          {Array.from({ length: 17 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={120 + i * 110}
              y1={0}
              x2={120 + i * 110}
              y2={1080}
              stroke={CONCRETE}
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={60 + i * 100}
              x2={1920}
              y2={60 + i * 100}
              stroke={CONCRETE}
              strokeWidth={1}
            />
          ))}
        </g>

        {/* city core */}
        <g opacity={cityReveal}>
          <circle cx={CITY.x} cy={CITY.y} r={78} fill="none" stroke={CONCRETE} strokeWidth={2} />
          <circle cx={CITY.x} cy={CITY.y} r={26} fill={CONCRETE} opacity={0.55} />
          <text
            x={CITY.x}
            y={CITY.y + 128}
            fill={PAPER}
            fontSize={28}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
            textAnchor="middle"
          >
            Trung tâm TP.HCM
          </text>
        </g>

        {/* Tan Son Nhat */}
        <g opacity={tanSohnReveal}>
          <circle cx={TAN.x} cy={TAN.y} r={13} fill={TEAL} />
          <text
            x={TAN.x + 26}
            y={TAN.y - 14}
            fill={PAPER}
            fontSize={26}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            Tân Sơn Nhất
          </text>
        </g>

        {/* Long Thanh */}
        <g opacity={longThanhReveal}>
          <circle cx={LONG.x} cy={LONG.y} r={13} fill={TEAL} />
          <text
            x={LONG.x - 26}
            y={LONG.y - 26}
            fill={PAPER}
            fontSize={26}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
            textAnchor="end"
          >
            Long Thành
          </text>
          <text
            x={LONG.x - 26}
            y={LONG.y + 4}
            fill={CONCRETE}
            fontSize={21}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
            textAnchor="end"
          >
            Đồng Nai
          </text>
        </g>

        {/* the signature measuring line — first appearance */}
        <line
          x1={CITY.x}
          y1={CITY.y}
          x2={LONG.x}
          y2={LONG.y}
          stroke={AMBER}
          strokeWidth={3}
          {...drawLine(frame, 46, 26, 1010)}
        />
        <line
          x1={CITY.x}
          y1={CITY.y}
          x2={TAN.x}
          y2={TAN.y}
          stroke={AMBER}
          strokeWidth={3}
          {...drawLine(frame, 58, 18, 138)}
        />

        {labelFade > 0 && (
          <g opacity={labelFade}>
            <rect x={1010} y={428} width={152} height={46} fill={INK} opacity={0.92} />
            <text
              x={1086}
              y={462}
              fill={AMBER}
              fontSize={38}
              fontWeight={700}
              fontFamily="IBM Plex Sans, Arial, sans-serif"
              textAnchor="middle"
            >
              40 km
            </text>
            <rect x={516} y={554} width={172} height={42} fill={INK} opacity={0.92} />
            <text
              x={602}
              y={586}
              fill={AMBER}
              fontSize={30}
              fontWeight={700}
              fontFamily="IBM Plex Sans, Arial, sans-serif"
              textAnchor="middle"
            >
              8–10 km
            </text>
          </g>
        )}
      </svg>

      <div
        style={{
          position: "absolute",
          left: 72,
          top: 56,
          fontFamily: "IBM Plex Sans, Arial, sans-serif",
          fontSize: 22,
          letterSpacing: 3,
          color: CONCRETE,
        }}
      >
        SÂN BAY MỚI CỦA TP.HCM
      </div>

      <SourceNote top={56}>
        Khoảng cách theo ACV, qua Báo Chính phủ (08/2025)
      </SourceNote>
    </AbsoluteFill>
  );
};

// --- scene 2: terminal cross-section + two quantity tracks ------------------

const ScenePhaseOne: React.FC<{ duration: number }> = () => {
  const frame = useCurrentFrame();
  const shell = reveal(frame, 8, 26);
  const passTrack = reveal(frame, 40, 24);
  const cargoTrack = reveal(frame, 62, 24);
  const caveat = reveal(frame, 88, 16);

  return (
    <AbsoluteFill style={{ background: INK }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* abstract terminal section — not the real building */}
        <g opacity={shell}>
          <path
            d="M 520 470 L 960 300 L 1400 470 L 520 470 Z"
            fill="none"
            stroke={CONCRETE}
            strokeWidth={3}
            {...drawLine(frame, 8, 26, 900)}
          />
          <path
            d="M 560 470 L 560 560 M 1360 470 L 1360 560"
            stroke={CONCRETE}
            strokeWidth={3}
            opacity={0.6}
          />
          <path
            d="M 700 400 L 700 470 M 1220 400 L 1220 470"
            stroke={CONCRETE}
            strokeWidth={2}
            opacity={0.4}
          />
          <text
            x={960}
            y={268}
            fill={CONCRETE}
            fontSize={21}
            letterSpacing={2}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
            textAnchor="middle"
          >
            MẶT BẰNG NHÀ GA — SƠ ĐỒ GIẢ LẬP
          </text>
        </g>

        {/* passenger track */}
        <g opacity={passTrack}>
          <line
            x1={300}
            y1={660}
            x2={1620}
            y2={660}
            stroke={CONCRETE}
            strokeWidth={1}
            opacity={0.5}
          />
          <rect x={300} y={660} width={1320 * passTrack} height={6} fill={TEAL} />
          <text
            x={300}
            y={638}
            fill={PAPER}
            fontSize={25}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            Hành khách
          </text>
          <text
            x={300}
            y={742}
            fill={PAPER}
            fontSize={62}
            fontWeight={700}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            25 triệu
            <tspan fontSize={26} fontWeight={400} fill={CONCRETE} dx={14}>
              lượt khách / năm
            </tspan>
          </text>
        </g>

        {/* cargo track — different unit, never on the same axis */}
        <g opacity={cargoTrack}>
          <line
            x1={300}
            y1={812}
            x2={1620}
            y2={812}
            stroke={CONCRETE}
            strokeWidth={1}
            opacity={0.5}
          />
          <rect
            x={300}
            y={812}
            width={1320 * cargoTrack}
            height={6}
            fill={TEAL}
            opacity={0.75}
          />
          <text
            x={300}
            y={790}
            fill={PAPER}
            fontSize={25}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            Hàng hóa
          </text>
          <text
            x={300}
            y={894}
            fill={PAPER}
            fontSize={62}
            fontWeight={700}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            1,2 triệu
            <tspan fontSize={26} fontWeight={400} fill={CONCRETE} dx={14}>
              tấn / năm
            </tspan>
          </text>
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          right: 72,
          top: 56,
          fontFamily: "IBM Plex Sans, Arial, sans-serif",
          fontSize: 24,
          letterSpacing: 2.4,
          color: TEAL,
        }}
      >
        THIẾT KẾ GIAI ĐOẠN 1
      </div>

      {caveat > 0 && (
        <div
          style={{
            position: "absolute",
            right: 72,
            bottom: 178,
            opacity: caveat,
            fontFamily: "IBM Plex Sans, Arial, sans-serif",
            fontSize: 23,
            color: PAPER,
            border: `1px solid ${AMBER}`,
            padding: "10px 18px",
            maxWidth: 620,
            lineHeight: 1.4,
          }}
        >
          Công suất thiết kế, không phải lượng khách ngày khai trương.
        </div>
      )}

      <SourceNote top={92}>
        Báo Chính phủ 03/12/2024, dẫn Bộ GTVT
      </SourceNote>
    </AbsoluteFill>
  );
};

// --- scene 3: three phase slabs + separately scoped T3 panel -----------------

const SceneThreePhases: React.FC<{ duration: number }> = () => {
  const frame = useCurrentFrame();
  const p1 = reveal(frame, 10, 22);
  const p2 = reveal(frame, 32, 22);
  const p3 = reveal(frame, 54, 22);
  const hundred = reveal(frame, 82, 18);
  const t3 = reveal(frame, 102, 20);
  const bracket = reveal(frame, 136, 18);
  const scopeNote = reveal(frame, 152, 16);

  const slabY = 620;
  const slabW = 190;

  return (
    <AbsoluteFill style={{ background: INK }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* phase slabs rise in sequence */}
        <g opacity={p1}>
          <rect
            x={180}
            y={slabY}
            width={slabW}
            height={120}
            fill="none"
            stroke={CONCRETE}
            strokeWidth={2.5}
          />
          <text
            x={275}
            y={slabY + 170}
            fill={PAPER}
            fontSize={24}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            GĐ 1
          </text>
        </g>
        <g opacity={p2}>
          <rect
            x={420}
            y={slabY - 130}
            width={slabW}
            height={250}
            fill="none"
            stroke={CONCRETE}
            strokeWidth={2.5}
          />
          <text
            x={515}
            y={slabY + 170}
            fill={PAPER}
            fontSize={24}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            GĐ 2
          </text>
        </g>
        <g opacity={p3}>
          <rect
            x={660}
            y={slabY - 270}
            width={slabW}
            height={390}
            fill="none"
            stroke={AMBER}
            strokeWidth={3}
          />
          <text
            x={755}
            y={slabY + 170}
            fill={PAPER}
            fontSize={24}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            GĐ 3
          </text>
        </g>

        {hundred > 0 && (
          <g opacity={hundred}>
            <text
              x={880}
              y={slabY - 190}
              fill={PAPER}
              fontSize={96}
              fontWeight={700}
              fontFamily="IBM Plex Sans, Arial, sans-serif"
            >
              100 triệu
              <tspan fontSize={30} fontWeight={400} fill={CONCRETE} dx={14}>
                lượt khách / năm
              </tspan>
            </text>
            <text
              x={880}
              y={slabY - 148}
              fill={CONCRETE}
              fontSize={24}
              fontFamily="IBM Plex Sans, Arial, sans-serif"
            >
              công suất thiết kế toàn sân bay, sau cả ba giai đoạn
            </text>
          </g>
        )}

        {/* T3 panel — visibly a different scope */}
        <g opacity={t3}>
          <rect
            x={1250}
            y={250}
            width={590}
            height={300}
            fill="none"
            stroke={CONCRETE}
            strokeWidth={2}
          />
          <text
            x={1290}
            y={300}
            fill={CONCRETE}
            fontSize={22}
            letterSpacing={2}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            TÂN SƠN NHẤT — NHÀ GA T3
          </text>
          <text
            x={1290}
            y={392}
            fill={PAPER}
            fontSize={76}
            fontWeight={700}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            20 triệu
          </text>
          <text
            x={1290}
            y={438}
            fill={CONCRETE}
            fontSize={26}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            lượt khách / năm — thiết kế
          </text>
          <text
            x={1290}
            y={492}
            fill={TEAL}
            fontSize={23}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            phạm vi: một nhà ga
          </text>
        </g>

        {/* scope-mismatch bracket */}
        {bracket > 0 && (
          <g opacity={bracket}>
            <path
              d="M 880 620 L 880 700 M 880 700 L 1250 700 M 1250 700 L 1250 620"
              fill="none"
              stroke={AMBER}
              strokeWidth={2.5}
              {...drawLine(frame, 136, 18, 900)}
            />
            <text
              x={1065}
              y={748}
              fill={AMBER}
              fontSize={25}
              textAnchor="middle"
              fontFamily="IBM Plex Sans, Arial, sans-serif"
            >
              khác phạm vi thống kê
            </text>
          </g>
        )}
      </svg>

      {scopeNote > 0 && (
        <div
          style={{
            position: "absolute",
            left: 180,
            bottom: 196,
            opacity: scopeNote,
            fontFamily: "IBM Plex Sans, Arial, sans-serif",
            fontSize: 25,
            color: PAPER,
            maxWidth: 900,
            lineHeight: 1.45,
            borderLeft: `3px solid ${AMBER}`,
            paddingLeft: 18,
          }}
        >
          Một số là toàn sân bay, số kia là một nhà ga — không so như cùng phạm vi được.
        </div>
      )}

      <SourceNote top={56}>
        100 triệu: Báo Chính phủ 30/03/2026 · 20 triệu: Báo Chính phủ 23/05/2026
      </SourceNote>
    </AbsoluteFill>
  );
};

// --- scene 4: proportional land ledger --------------------------------------

const SceneLandLedger: React.FC<{ duration: number }> = () => {
  const frame = useCurrentFrame();
  const baseline = reveal(frame, 8, 20);
  const totalBar = reveal(frame, 22, 26);
  const civilian = reveal(frame, 46, 22);
  const shared = reveal(frame, 66, 18);
  const military = reveal(frame, 80, 18);
  const citation = reveal(frame, 102, 16);

  const X0 = 190;
  const TOTAL_W = 1540;
  const BAR_Y = 470;
  const BAR_H = 132;

  // exact proportions of 3950 / 480 / 570 = 5000
  const wCivil = (3950 / 5000) * TOTAL_W;
  const wShared = (480 / 5000) * TOTAL_W;
  const wMilitary = (570 / 5000) * TOTAL_W;

  return (
    <AbsoluteFill style={{ background: INK }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* survey baseline with measurement ticks */}
        <g opacity={baseline}>
          <line
            x1={X0}
            y1={BAR_Y + BAR_H + 70}
            x2={X0 + TOTAL_W}
            y2={BAR_Y + BAR_H + 70}
            stroke={CONCRETE}
            strokeWidth={1.5}
          />
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={i}
              x1={X0 + i * (TOTAL_W / 10)}
              y1={BAR_Y + BAR_H + 58}
              x2={X0 + i * (TOTAL_W / 10)}
              y2={BAR_Y + BAR_H + 82}
              stroke={CONCRETE}
              strokeWidth={1.5}
            />
          ))}
          <text
            x={X0}
            y={BAR_Y + BAR_H + 126}
            fill={CONCRETE}
            fontSize={22}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            0
          </text>
          <text
            x={X0 + TOTAL_W}
            y={BAR_Y + BAR_H + 126}
            fill={CONCRETE}
            fontSize={22}
            textAnchor="end"
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            5.000 ha
          </text>
        </g>

        {/* total */}
        <g opacity={totalBar}>
          <rect
            x={X0}
            y={BAR_Y}
            width={TOTAL_W * totalBar}
            height={BAR_H}
            fill="none"
            stroke={CONCRETE}
            strokeWidth={2}
          />
        </g>

        {/* civil aviation — dominant */}
        <g opacity={civilian}>
          <rect
            x={X0}
            y={BAR_Y}
            width={wCivil * civilian}
            height={BAR_H}
            fill={TEAL}
            opacity={0.85}
          />
          <text
            x={X0 + 34}
            y={BAR_Y + 66}
            fill={INK}
            fontSize={34}
            fontWeight={700}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            3.950 ha
          </text>
          <text
            x={X0 + 34}
            y={BAR_Y + 106}
            fill={INK}
            fontSize={24}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            dân dụng
          </text>
        </g>

        {/* shared — hatched, not a third colour family */}
        <g opacity={shared}>
          <rect
            x={X0 + wCivil}
            y={BAR_Y}
            width={wShared * shared}
            height={BAR_H}
            fill={INK}
            stroke={PAPER}
            strokeWidth={1.5}
          />
          {Array.from({ length: 7 }).map((_, i) => (
            <line
              key={i}
              x1={X0 + wCivil + i * 20}
              y1={BAR_Y + BAR_H}
              x2={X0 + wCivil + i * 20 + BAR_H}
              y2={BAR_Y}
              stroke={PAPER}
              strokeWidth={1.2}
              opacity={0.65}
            />
          ))}
        </g>

        {/* military */}
        <g opacity={military}>
          <rect
            x={X0 + wCivil + wShared}
            y={BAR_Y}
            width={wMilitary * military}
            height={BAR_H}
            fill="none"
            stroke={AMBER}
            strokeWidth={2.5}
          />
        </g>

        {/* leader lines to labels outside the small segments */}
        <g opacity={shared}>
          <line
            x1={X0 + wCivil + wShared / 2}
            y1={BAR_Y - 16}
            x2={X0 + wCivil + wShared / 2}
            y2={BAR_Y - 118}
            stroke={PAPER}
            strokeWidth={1.5}
          />
          <text
            x={X0 + wCivil + wShared / 2}
            y={BAR_Y - 136}
            fill={PAPER}
            fontSize={26}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            480 ha dùng chung
          </text>
        </g>
        <g opacity={military}>
          <line
            x1={X0 + wCivil + wShared + wMilitary / 2}
            y1={BAR_Y - 16}
            x2={X0 + wCivil + wShared + wMilitary / 2}
            y2={BAR_Y - 118}
            stroke={AMBER}
            strokeWidth={1.5}
          />
          <text
            x={X0 + wCivil + wShared + wMilitary / 2}
            y={BAR_Y - 136}
            fill={AMBER}
            fontSize={26}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            570 ha quân sự
          </text>
        </g>
      </svg>

      <div
        style={{
          position: "absolute",
          left: X0,
          top: 56,
          fontFamily: "IBM Plex Sans, Arial, sans-serif",
          fontSize: 23,
          letterSpacing: 2.4,
          color: CONCRETE,
        }}
      >
        QUY HOẠCH SỬ DỤNG ĐẤT
      </div>

      {citation > 0 && (
        <div
          style={{
            position: "absolute",
            right: 72,
            bottom: 188,
            opacity: citation,
            fontFamily: "IBM Plex Sans, Arial, sans-serif",
            fontSize: 23,
            color: TEAL,
            border: `1px solid ${TEAL}`,
            padding: "10px 18px",
            lineHeight: 1.4,
          }}
        >
          Quyết định 562/QĐ-BXD, 09/05/2025 — Điều 1
        </div>
      )}

      <SourceNote top={92}>
        Ba nhóm quản lý theo Quyết định 562/QĐ-BXD
      </SourceNote>
    </AbsoluteFill>
  );
};

// --- scene 5: instrument clock + attributed operating rationale --------------

/** SVG arc path helper for the dial's night arc. */
function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const x1 = cx + Math.cos(start) * r;
  const y1 = cy + Math.sin(start) * r;
  const x2 = cx + Math.cos(end) * r;
  const y2 = cy + Math.sin(end) * r;
  const largeArc = end - start > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

const SceneOperatorClaims: React.FC<{ duration: number }> = () => {
  const frame = useCurrentFrame();
  const ring = reveal(frame, 10, 26);
  const hand = reveal(frame, 36, 120);
  const claim1 = reveal(frame, 56, 18);
  const claim2 = reveal(frame, 84, 18);
  const claim3 = reveal(frame, 112, 18);
  const contour = reveal(frame, 138, 24);
  const attribution = reveal(frame, 46, 18);

  const CX = 520;
  const CY = 520;
  const R = 230;

  return (
    <AbsoluteFill style={{ background: INK }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {/* 24-hour dial */}
        <g opacity={ring}>
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={CONCRETE}
            strokeWidth={2.5}
            {...drawLine(frame, 10, 26, 1450)}
          />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
            const inner = i % 6 === 0 ? R - 26 : R - 14;
            return (
              <line
                key={i}
                x1={CX + Math.cos(a) * inner}
                y1={CY + Math.sin(a) * inner}
                x2={CX + Math.cos(a) * R}
                y2={CY + Math.sin(a) * R}
                stroke={i >= 6 && i < 18 ? AMBER : CONCRETE}
                strokeWidth={i % 6 === 0 ? 2.5 : 1.4}
              />
            );
          })}
          <text
            x={CX}
            y={CY - R - 40}
            fill={CONCRETE}
            fontSize={21}
            letterSpacing={2}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            00
          </text>
          <text
            x={CX}
            y={CY + R + 56}
            fill={CONCRETE}
            fontSize={21}
            letterSpacing={2}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            24
          </text>
        </g>

        {/* the hand completes one cycle */}
        <g opacity={ring}>
          <line
            x1={CX}
            y1={CY}
            x2={CX + Math.cos(-Math.PI / 2 + hand * Math.PI * 2) * (R - 40)}
            y2={CY + Math.sin(-Math.PI / 2 + hand * Math.PI * 2) * (R - 40)}
            stroke={AMBER}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <circle cx={CX} cy={CY} r={9} fill={AMBER} />
        </g>

        {/* night arc */}
        <path
          d={describeArc(
            CX,
            CY,
            R - 52,
            -Math.PI / 2 + (6 / 24) * Math.PI * 2,
            -Math.PI / 2 + (18 / 24) * Math.PI * 2
          )}
          fill="none"
          stroke={AMBER}
          strokeWidth={8}
          opacity={0.28 * ring}
        />

        {/* claims with leader lines */}
        <g opacity={claim1}>
          <line
            x1={960}
            y1={352}
            x2={1130}
            y2={352}
            stroke={TEAL}
            strokeWidth={1.5}
          />
          <text
            x={960}
            y={318}
            fill={PAPER}
            fontSize={34}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            Khai thác được 24/7
          </text>
        </g>
        <g opacity={claim2}>
          <line
            x1={960}
            y1={512}
            x2={1130}
            y2={512}
            stroke={TEAL}
            strokeWidth={1.5}
          />
          <text
            x={960}
            y={478}
            fill={PAPER}
            fontSize={34}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            Ít hạn chế bay đêm hơn
          </text>
        </g>
        <g opacity={claim3}>
          <line
            x1={960}
            y1={672}
            x2={1130}
            y2={672}
            stroke={TEAL}
            strokeWidth={1.5}
          />
          <text
            x={960}
            y={638}
            fill={PAPER}
            fontSize={34}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            Tách biệt khu dân cư
          </text>
        </g>

        {/* conceptual sound contour at the city edge — never a measurement */}
        <g opacity={contour}>
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M 1240 ${300 + i * 78} q 60 ${i % 2 === 0 ? -42 : 42} 120 0 q 60 ${
                i % 2 === 0 ? 42 : -42
              } 120 0 q 60 ${i % 2 === 0 ? -42 : 42} 120 0`}
              fill="none"
              stroke={CONCRETE}
              strokeWidth={1.6}
              opacity={0.5 - i * 0.06}
            />
          ))}
          <text
            x={1620}
            y={720}
            fill={CONCRETE}
            fontSize={19}
            textAnchor="end"
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            minh họa khái niệm, không phải số đo tiếng ồn
          </text>
        </g>
      </svg>

      {/* persistent attribution */}
      <div
        style={{
          position: "absolute",
          left: 960,
          top: 200,
          fontFamily: "IBM Plex Sans, Arial, sans-serif",
          opacity: attribution,
          fontSize: 26,
          letterSpacing: 2,
          color: TEAL,
        }}
      >
        LẬP LUẬN CỦA ACV
      </div>

      <SourceNote top={56}>ACV, qua Báo Chính phủ 12/08/2025</SourceNote>
    </AbsoluteFill>
  );
};

// --- scene 6: map reprise + balanced closing -------------------------------

const SceneClosingTradeoff: React.FC<{ duration: number }> = () => {
  const frame = useCurrentFrame();
  const mapIn = reveal(frame, 6, 24);
  const lineIn = reveal(frame, 32, 26);
  const tradeoff = reveal(frame, 62, 20);
  const date = reveal(frame, 96, 18);
  const teaser = reveal(frame, 122, 20);

  const CITY = { x: 420, y: 560 };
  const LONG = { x: 940, y: 360 };

  return (
    <AbsoluteFill style={{ background: INK }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <g opacity={mapIn}>
          <circle
            cx={CITY.x}
            cy={CITY.y}
            r={52}
            fill="none"
            stroke={CONCRETE}
            strokeWidth={2}
          />
          <circle cx={CITY.x} cy={CITY.y} r={16} fill={CONCRETE} opacity={0.5} />
          <text
            x={CITY.x}
            y={CITY.y + 96}
            fill={PAPER}
            fontSize={24}
            textAnchor="middle"
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            Trung tâm TP.HCM
          </text>
          <circle cx={LONG.x} cy={LONG.y} r={11} fill={TEAL} />
          <text
            x={LONG.x + 24}
            y={LONG.y - 12}
            fill={PAPER}
            fontSize={24}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            Long Thành
          </text>
        </g>

        {/* the signature line returns — second and final appearance */}
        <line
          x1={CITY.x}
          y1={CITY.y}
          x2={LONG.x}
          y2={LONG.y}
          stroke={AMBER}
          strokeWidth={3}
          {...drawLine(frame, 32, 26, 566)}
        />
        {lineIn > 0 && (
          <text
            x={690}
            y={430}
            fill={AMBER}
            fontSize={40}
            fontWeight={700}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
            textAnchor="middle"
            opacity={lineIn}
          >
            40 km
          </text>
        )}

        {/* balanced trade-off statement */}
        <g opacity={tradeoff}>
          <rect x={1080} y={300} width={4} height={190} fill={AMBER} />
          <text
            x={1120}
            y={352}
            fill={PAPER}
            fontSize={44}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            40 km vẫn là bất tiện.
          </text>
          <text
            x={1120}
            y={412}
            fill={CONCRETE}
            fontSize={30}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            Quy hoạch cho quy mô lớn hơn,
          </text>
          <text
            x={1120}
            y={452}
            fill={CONCRETE}
            fontSize={30}
            fontFamily="IBM Plex Sans, Arial, sans-serif"
          >
            khai thác được cả ngày đêm.
          </text>
        </g>

        {/* expected commercial operation — marked as planned */}
        {date > 0 && (
          <g opacity={date}>
            <text
              x={1120}
              y={560}
              fill={PAPER}
              fontSize={38}
              fontWeight={700}
              fontFamily="IBM Plex Sans, Arial, sans-serif"
            >
              01/12/2026
            </text>
            <text
              x={1120}
              y={600}
              fill={TEAL}
              fontSize={23}
              fontFamily="IBM Plex Sans, Arial, sans-serif"
            >
              dự kiến khai thác thương mại
            </text>
          </g>
        )}

        {/* teaser timeline */}
        {teaser > 0 && (
          <g opacity={teaser}>
            <line
              x1={1120}
              y1={700}
              x2={1760}
              y2={700}
              stroke={CONCRETE}
              strokeWidth={1.5}
            />
            {[
              { x: 1120, label: "12/2026" },
              { x: 1440, label: "Hè 2027" },
              { x: 1760, label: "Đông 2027–28" },
            ].map((m) => (
              <g key={m.label}>
                <circle cx={m.x} cy={700} r={7} fill={AMBER} />
                <text
                  x={m.x}
                  y={742}
                  fill={CONCRETE}
                  fontSize={21}
                  textAnchor="middle"
                  fontFamily="IBM Plex Sans, Arial, sans-serif"
                >
                  {m.label}
                </text>
              </g>
            ))}
            <text
              x={1120}
              y={790}
              fill={CONCRETE}
              fontSize={20}
              fontFamily="IBM Plex Sans, Arial, sans-serif"
            >
              lộ trình chuyển đổi khai thác theo 3 bước
            </text>
          </g>
        )}
      </svg>

      <SourceNote top={56}>Lộ trình chuyển đổi: Báo Chính phủ 28/07/2026</SourceNote>
    </AbsoluteFill>
  );
};

// --- scene registry ---------------------------------------------------------

const SCENE_RENDERERS: Record<string, React.FC<{ duration: number }>> = {
  "scene-01-distance-map": SceneDistanceMap,
  "scene-02-phase-one-capacity": ScenePhaseOne,
  "scene-03-three-phase-capacity": SceneThreePhases,
  "scene-04-land-use-ledger": SceneLandLedger,
  "scene-05-operator-claims": SceneOperatorClaims,
  "scene-06-distance-tradeoff-close": SceneClosingTradeoff,
};

export const Scene: React.FC<SceneProps> = ({
  scenes,
  totalDuration,
  captionColor,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: INK,
        fontFamily: "IBM Plex Sans, Arial, sans-serif",
      }}
    >
      {scenes.map((s) => {
        const Renderer = SCENE_RENDERERS[s.id];
        if (!Renderer) return null;
        const from = Math.round(s.start * fps);
        const dur = Math.round(s.duration * fps);
        return (
          <Sequence
            key={s.id}
            from={from}
            durationInFrames={dur}
            name={s.id}
          >
            <Renderer duration={dur} />
            <CaptionBand
              words={s.captionWords}
              offset={0}
              color={captionColor}
            />
            <Audio src={staticFile(`audio/${s.sectionId}.mp3`)} />
          </Sequence>
        );
      })}
      <Grain />
    </AbsoluteFill>
  );
};

export const calculateMetadata: CalculateMetadataFunction<SceneProps> = async ({
  props,
}) => ({
  durationInFrames: Math.round((props.totalDuration ?? 70) * FPS),
  fps: FPS,
  width: 1920,
  height: 1080,
});
