import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface PhatBieuCartoon2DProps {
  durationSeconds?: number;
  narrationSrc?: string;
  musicSrc?: string;
}

const resolveAsset = (src: string): string => {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("file://") ||
    src.startsWith("/")
  ) {
    return src;
  }
  return staticFile(src);
};

const OUTLINE = "#080808";

// ============================================================================
// SHARED 2D CARTOON STAGE WITH OPTIONAL CUSTOM ENVIRONMENT BACKGROUND
// ============================================================================
const CartoonStage: React.FC<{
  bgGradient?: string;
  children: React.ReactNode;
}> = ({
  bgGradient = "radial-gradient(circle at 50% 48%, #221E2B 0%, #121018 62%, #08070B 100%)",
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: bgGradient,
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {children}

        {/* Top-Center 2D Cartoon Bubble Title */}
        <g transform="translate(960, 68)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fontSize="44"
            fontWeight="900"
            letterSpacing="3"
            fill="#16131D"
            stroke="#F8FAFC"
            strokeWidth="6.5"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          >
            GÓC NHÌN TÂM LÝ
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// DIVERSE CAST OF 5 ORIGINAL 2D FLAT CARTOON CHARACTERS + EMOTION MASCOTS
// ============================================================================
export type CharacterVariant =
  | "minh-glasses" // Wavy parted hair, round glasses, mustard hoodie
  | "lan-bob" // Cute curved bob hair with red clip, rosy cheeks, mint sweater
  | "hung-boss" // Slicked-back hair, thick eyebrows, crimson vest & tie
  | "tieu-tam" // Inner child with bear-ear beanie, overalls, big shiny eyes
  | "mentor-calm"; // Warm curly hair, cozy scarf, sage green coat

const DiverseCartoonPerson: React.FC<{
  variant: CharacterVariant;
  x: number;
  y: number;
  scale?: number;
  mood?: "neutral" | "angry" | "scared" | "smug" | "calm" | "happy" | "sad";
  leftArmDeg?: number;
  rightArmDeg?: number;
  bobOffset?: number;
}> = ({
  variant,
  x,
  y,
  scale = 1,
  mood = "neutral",
  leftArmDeg = 0,
  rightArmDeg = 0,
  bobOffset = 0,
}) => {
  const configs: Record<
    CharacterVariant,
    {
      skin: string;
      shirt: string;
      pants: string;
      hair: string;
      shoe: string;
    }
  > = {
    "minh-glasses": {
      skin: "#F3D9C2",
      shirt: "#EAB308",
      pants: "#1E293B",
      hair: "#292524",
      shoe: "#F8FAFC",
    },
    "lan-bob": {
      skin: "#F7E1D3",
      shirt: "#34D399",
      pants: "#334155",
      hair: "#451A03",
      shoe: "#FDE047",
    },
    "hung-boss": {
      skin: "#E8C3A5",
      shirt: "#E11D48",
      pants: "#18181B",
      hair: "#1C1917",
      shoe: "#D4D4D8",
    },
    "tieu-tam": {
      skin: "#F9E5D8",
      shirt: "#60A5FA",
      pants: "#1D4ED8",
      hair: "#3F2305",
      shoe: "#FCA5A5",
    },
    "mentor-calm": {
      skin: "#F1D6BF",
      shirt: "#8B5CF6",
      pants: "#1E1B4B",
      hair: "#312E81",
      shoe: "#E2E8F0",
    },
  };

  const c = configs[variant];

  return (
    <g transform={`translate(${x}, ${y + bobOffset}) scale(${scale})`}>
      {/* Back Hair for Lan (Bob cut sits behind head too) */}
      {variant === "lan-bob" && (
        <path
          d="M -48 -105 C -58 -70 -56 -42 -42 -36 L 42 -36 C 56 -42 58 -70 48 -105 Z"
          fill={c.hair}
          stroke={OUTLINE}
          strokeWidth="5"
          strokeLinejoin="round"
        />
      )}

      {/* Legs */}
      <rect
        x="-31"
        y="62"
        width="28"
        height="92"
        rx="6"
        fill={c.pants}
        stroke={OUTLINE}
        strokeWidth="5"
      />
      <rect
        x="3"
        y="62"
        width="28"
        height="92"
        rx="6"
        fill={c.pants}
        stroke={OUTLINE}
        strokeWidth="5"
      />

      {/* Shoes */}
      <ellipse
        cx="-18"
        cy="156"
        rx="18"
        ry="9"
        fill={c.shoe}
        stroke={OUTLINE}
        strokeWidth="5"
      />
      <ellipse
        cx="18"
        cy="156"
        rx="18"
        ry="9"
        fill={c.shoe}
        stroke={OUTLINE}
        strokeWidth="5"
      />

      {/* Left Arm */}
      <g transform={`translate(-44, -34) rotate(${leftArmDeg})`}>
        <rect
          x="-12"
          y="0"
          width="24"
          height="94"
          rx="11"
          fill={c.shirt}
          stroke={OUTLINE}
          strokeWidth="5"
        />
        <circle
          cx="0"
          cy="100"
          r="11"
          fill={c.skin}
          stroke={OUTLINE}
          strokeWidth="5"
        />
      </g>

      {/* Right Arm */}
      <g transform={`translate(44, -34) rotate(${rightArmDeg})`}>
        <rect
          x="-12"
          y="0"
          width="24"
          height="94"
          rx="11"
          fill={c.shirt}
          stroke={OUTLINE}
          strokeWidth="5"
        />
        <circle
          cx="0"
          cy="100"
          r="11"
          fill={c.skin}
          stroke={OUTLINE}
          strokeWidth="5"
        />
      </g>

      {/* Torso */}
      <rect
        x="-40"
        y="-42"
        width="80"
        height="108"
        rx="14"
        fill={c.shirt}
        stroke={OUTLINE}
        strokeWidth="5"
      />

      {/* Costume Details on Torso */}
      {variant === "minh-glasses" && (
        <>
          {/* Hoodie pocket & drawstrings */}
          <path
            d="M -26 28 L 26 28 L 32 58 L -32 58 Z"
            fill="#CA8A04"
            stroke={OUTLINE}
            strokeWidth="4"
          />
          <line x1="-10" y1="-38" x2="-10" y2="-10" stroke={OUTLINE} strokeWidth="4" />
          <line x1="10" y1="-38" x2="10" y2="-10" stroke={OUTLINE} strokeWidth="4" />
        </>
      )}
      {variant === "hung-boss" && (
        <>
          {/* White shirt V-neck & Tie */}
          <polygon
            points="-18,-42 18,-42 0,-8"
            fill="#FFFFFF"
            stroke={OUTLINE}
            strokeWidth="4"
          />
          <polygon
            points="-6,-18 6,-18 9,36 0,48 -9,36"
            fill="#FACC15"
            stroke={OUTLINE}
            strokeWidth="4"
          />
        </>
      )}
      {variant === "lan-bob" && (
        <>
          {/* Cute Peter Pan Collar */}
          <path
            d="M -22 -42 Q -10 -22 0 -34 Q 10 -22 22 -42"
            fill="#FFFFFF"
            stroke={OUTLINE}
            strokeWidth="4"
          />
        </>
      )}
      {variant === "tieu-tam" && (
        <>
          {/* Overalls straps & heart badge */}
          <rect
            x="-26"
            y="-42"
            width="12"
            height="108"
            fill="#2563EB"
            stroke={OUTLINE}
            strokeWidth="4"
          />
          <rect
            x="14"
            y="-42"
            width="12"
            height="108"
            fill="#2563EB"
            stroke={OUTLINE}
            strokeWidth="4"
          />
        </>
      )}
      {variant === "mentor-calm" && (
        <>
          {/* Cozy Cream Scarf */}
          <rect
            x="-42"
            y="-46"
            width="84"
            height="24"
            rx="10"
            fill="#FDE68A"
            stroke={OUTLINE}
            strokeWidth="4.5"
          />
          <rect
            x="12"
            y="-34"
            width="20"
            height="52"
            rx="8"
            fill="#FDE68A"
            stroke={OUTLINE}
            strokeWidth="4.5"
          />
        </>
      )}

      {/* Head */}
      <circle
        cx="0"
        cy="-88"
        r="43"
        fill={c.skin}
        stroke={OUTLINE}
        strokeWidth="5"
      />

      {/* Rosy Cheeks for Lan & Tieu Tam */}
      {(variant === "lan-bob" || variant === "tieu-tam") && (
        <>
          <ellipse cx="-24" cy="-76" rx="7" ry="4.5" fill="#FB7185" opacity="0.65" />
          <ellipse cx="24" cy="-76" rx="7" ry="4.5" fill="#FB7185" opacity="0.65" />
        </>
      )}

      {/* Distinct Hairstyles / Hats per Character */}
      {variant === "minh-glasses" && (
        <path
          d="M -44 -96 C -48 -134 -15 -146 8 -138 C 34 -144 50 -122 44 -94 C 28 -112 8 -108 -6 -116 C -18 -104 -32 -106 -44 -96 Z"
          fill={c.hair}
          stroke={OUTLINE}
          strokeWidth="5"
          strokeLinejoin="round"
        />
      )}
      {variant === "lan-bob" && (
        <>
          <path
            d="M -44 -96 C -42 -136 42 -136 44 -96 C 22 -114 -12 -114 -44 -96 Z"
            fill={c.hair}
            stroke={OUTLINE}
            strokeWidth="5"
          />
          {/* Cute Red Hairclip */}
          <rect
            x="18"
            y="-114"
            width="22"
            height="10"
            rx="5"
            transform="rotate(15 29 -109)"
            fill="#F43F5E"
            stroke={OUTLINE}
            strokeWidth="3.5"
          />
        </>
      )}
      {variant === "hung-boss" && (
        <path
          d="M -43 -98 L -46 -126 L -18 -122 L -6 -136 L 18 -124 L 46 -128 L 43 -96 Z"
          fill={c.hair}
          stroke={OUTLINE}
          strokeWidth="5"
          strokeLinejoin="round"
        />
      )}
      {variant === "tieu-tam" && (
        <>
          {/* Bear-Ear Beanie Hat */}
          <circle
            cx="-32"
            cy="-128"
            r="14"
            fill="#F59E0B"
            stroke={OUTLINE}
            strokeWidth="5"
          />
          <circle
            cx="32"
            cy="-128"
            r="14"
            fill="#F59E0B"
            stroke={OUTLINE}
            strokeWidth="5"
          />
          <path
            d="M -45 -98 C -45 -142 45 -142 45 -98 Z"
            fill="#F59E0B"
            stroke={OUTLINE}
            strokeWidth="5"
          />
          <rect
            x="-47"
            y="-104"
            width="94"
            height="14"
            rx="7"
            fill="#FDE047"
            stroke={OUTLINE}
            strokeWidth="4.5"
          />
        </>
      )}
      {variant === "mentor-calm" && (
        <path
          d="M -45 -95 C -52 -128 -25 -144 0 -138 C 28 -144 52 -126 45 -95 C 25 -112 -25 -112 -45 -95 Z"
          fill={c.hair}
          stroke={OUTLINE}
          strokeWidth="5"
        />
      )}

      {/* Eyes & Facial Expressions */}
      <g transform="translate(0, -88)">
        <circle
          cx="-15"
          cy="0"
          r="10"
          fill="#FFFFFF"
          stroke={OUTLINE}
          strokeWidth="3.8"
        />
        <circle
          cx="15"
          cy="0"
          r="10"
          fill="#FFFFFF"
          stroke={OUTLINE}
          strokeWidth="3.8"
        />
        <circle cx="-15" cy="1.5" r="4" fill={OUTLINE} />
        <circle cx="15" cy="1.5" r="4" fill={OUTLINE} />

        {/* Round Glasses for Minh */}
        {variant === "minh-glasses" && (
          <>
            <circle
              cx="-15"
              cy="0"
              r="14"
              fill="none"
              stroke="#0F172A"
              strokeWidth="3.5"
            />
            <circle
              cx="15"
              cy="0"
              r="14"
              fill="none"
              stroke="#0F172A"
              strokeWidth="3.5"
            />
            <line x1="-1" y1="0" x2="1" y2="0" stroke="#0F172A" strokeWidth="3.5" />
          </>
        )}

        {/* Mood Eyelids / Brows */}
        {mood === "angry" && (
          <>
            <line
              x1="-26"
              y1="-14"
              x2="-5"
              y2="-5"
              stroke={OUTLINE}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="26"
              y1="-14"
              x2="5"
              y2="-5"
              stroke={OUTLINE}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </>
        )}
        {(mood === "scared" || mood === "sad") && (
          <>
            <line
              x1="-26"
              y1="-5"
              x2="-6"
              y2="-14"
              stroke={OUTLINE}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line
              x1="26"
              y1="-5"
              x2="6"
              y2="-14"
              stroke={OUTLINE}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </>
        )}
        {(mood === "neutral" || mood === "smug") && (
          <>
            <path
              d="M -25 -2 A 10 10 0 0 1 -5 -2 Z"
              fill={c.skin}
              stroke={OUTLINE}
              strokeWidth="3.5"
            />
            <path
              d="M 5 -2 A 10 10 0 0 1 25 -2 Z"
              fill={c.skin}
              stroke={OUTLINE}
              strokeWidth="3.5"
            />
          </>
        )}

        {/* Mouths */}
        {mood === "neutral" && (
          <line
            x1="-9"
            y1="20"
            x2="9"
            y2="20"
            stroke={OUTLINE}
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
        {mood === "angry" && (
          <rect
            x="-13"
            y="15"
            width="26"
            height="13"
            rx="5"
            fill="#E11D48"
            stroke={OUTLINE}
            strokeWidth="3.8"
          />
        )}
        {mood === "scared" && (
          <ellipse
            cx="0"
            cy="21"
            rx="8"
            ry="10"
            fill="#1E293B"
            stroke={OUTLINE}
            strokeWidth="3.8"
          />
        )}
        {mood === "sad" && (
          <path
            d="M -11 24 Q 0 15 11 24"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
        {(mood === "calm" || mood === "happy" || mood === "smug") && (
          <path
            d="M -12 17 Q 0 27 12 17"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
        )}
      </g>
    </g>
  );
};

// ============================================================================
// CUTE EMOTION MASCOTS (Bé Lửa Giận Dữ & Bé Mây Sợ Hãi)
// ============================================================================
const FireAngerMascot: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <path
      d="M 0 -120 C 35 -80 85 -40 80 25 C 75 80 40 110 0 110 C -40 110 -75 80 -80 25 C -85 -40 -35 -80 0 -120 Z"
      fill="#F43F5E"
      stroke={OUTLINE}
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <path
      d="M 0 -65 C 20 -35 48 -10 45 30 C 42 65 22 85 0 85 C -22 85 -42 65 -45 30 C -48 -10 -20 -35 0 -65 Z"
      fill="#FB923C"
    />
    <circle cx="-22" cy="18" r="10" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="4" />
    <circle cx="22" cy="18" r="10" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="4" />
    <circle cx="-22" cy="20" r="4" fill={OUTLINE} />
    <circle cx="22" cy="20" r="4" fill={OUTLINE} />
    <line x1="-35" y1="2" x2="-10" y2="12" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
    <line x1="35" y1="2" x2="10" y2="12" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
  </g>
);

const CloudFearMascot: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <path
      d="M -75 45 Q -105 45 -105 15 Q -105 -20 -70 -28 Q -55 -70 0 -68 Q 55 -70 72 -28 Q 105 -20 105 15 Q 105 45 75 45 Z"
      fill="#60A5FA"
      stroke={OUTLINE}
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <circle cx="-24" cy="0" r="10" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="4" />
    <circle cx="24" cy="0" r="10" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="4" />
    <circle cx="-24" cy="0" r="4" fill={OUTLINE} />
    <circle cx="24" cy="0" r="4" fill={OUTLINE} />
    <path d="M -14 24 Q 0 14 14 24" fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
  </g>
);

// ============================================================================
// SCENE 01 (0.0s - 2.3s): Wooden Puppet Stage — Minh Controlled by Giant Strings
// ============================================================================
const Scene01PuppetStrings: React.FC = () => {
  const frame = useCurrentFrame();
  const swing = Math.sin(frame * 0.25) * 35;

  return (
    <CartoonStage bgGradient="radial-gradient(circle at 50% 45%, #2D1B36 0%, #140D1A 70%, #09060C 100%)">
      {/* Wooden Crossbar Controller at Top */}
      <g transform={`translate(960, 175) rotate(${Math.sin(frame * 0.2) * 6})`}>
        <rect
          x="-260"
          y="-22"
          width="520"
          height="44"
          rx="12"
          fill="#B45309"
          stroke={OUTLINE}
          strokeWidth="6"
        />
        {/* Puppet Strings */}
        <line x1="-180" y1="22" x2="-95" y2="410" stroke="#E2E8F0" strokeWidth="4" strokeDasharray="8 6" />
        <line x1="180" y1="22" x2="95" y2="410" stroke="#E2E8F0" strokeWidth="4" strokeDasharray="8 6" />
        <line x1="0" y1="22" x2="0" y2="290" stroke="#E2E8F0" strokeWidth="4" strokeDasharray="8 6" />
        <text x="0" y="8" textAnchor="middle" fill="#FEF08A" fontSize="28" fontWeight="900">
          KÍCH THÍCH BÊN NGOÀI
        </text>
      </g>

      {/* Checkered Stage Floor */}
      <ellipse
        cx="960"
        cy="860"
        rx="420"
        ry="65"
        fill="#3B254B"
        stroke={OUTLINE}
        strokeWidth="6"
      />

      {/* Character Minh jerking like a marionette */}
      <DiverseCartoonPerson
        variant="minh-glasses"
        x={960}
        y={650}
        scale={1.38}
        mood="scared"
        leftArmDeg={-110 + swing}
        rightArmDeg={110 - swing}
        bobOffset={Math.sin(frame * 0.3) * 10}
      />

      <text x="960" y="965" textAnchor="middle" fill="#FDE047" fontSize="46" fontWeight="900">
        sống theo phản xạ
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 02 (2.3s - 4.1s): Flashing Red Siren Button vs Sleeping Brain
// ============================================================================
const Scene02SirenVsBrain: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = Math.abs(Math.sin(frame * 0.35));

  return (
    <CartoonStage>
      {/* Left: Giant Flashing Red Alarm Siren ("PHẢN ỨNG") */}
      <g transform="translate(620, 540)">
        <circle cx="0" cy="-40" r={165 + flash * 25} fill="#F43F5E" opacity={0.22} />
        <path
          d="M -95 80 L -75 -95 A 75 75 0 0 1 75 -95 L 95 80 Z"
          fill="#E11D48"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        <rect
          x="-125"
          y="80"
          width="250"
          height="52"
          rx="12"
          fill="#334155"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        <text x="0" y="195" textAnchor="middle" fill="#FB7185" fontSize="44" fontWeight="900">
          phản ứng (99%)
        </text>
      </g>

      {/* Right: Cute Sleeping Pink Brain on a Pillow ("THẤU HIỂU") */}
      <g transform="translate(1300, 560)">
        <rect
          x="-135"
          y="40"
          width="270"
          height="65"
          rx="28"
          fill="#E2E8F0"
          stroke={OUTLINE}
          strokeWidth="7"
        />
        <path
          d="M -85 45 C -110 0 -80 -75 -15 -70 C 10 -95 75 -80 85 -25 C 110 10 85 45 55 45 Z"
          fill="#F472B6"
          stroke={OUTLINE}
          strokeWidth="7"
        />
        <text x="85" y="-85" fill="#93C5FD" fontSize="42" fontWeight="900">
          Zzz...
        </text>
        <text x="0" y="175" textAnchor="middle" fill="#94A3B8" fontSize="44" fontWeight="900">
          thấu hiểu (1%)
        </text>
      </g>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 03 (4.1s - 6.0s): Character Hùng + Fire Mascot Shouting into Megaphone
// ============================================================================
const Scene03BossMegaphoneAttack: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 0.8) * 6;

  return (
    <CartoonStage bgGradient="radial-gradient(circle at 50% 50%, #3B1219 0%, #18070A 68%, #090304 100%)">
      <DiverseCartoonPerson
        variant="hung-boss"
        x={720 + shake}
        y={640}
        scale={1.42}
        mood="angry"
        rightArmDeg={-85}
      />

      {/* Giant Cartoon Megaphone shooting Red Spikes */}
      <g transform={`translate(${920 + shake}, 555)`}>
        <polygon
          points="0,-25 220,-115 220,65 0,25"
          fill="#FACC15"
          stroke={OUTLINE}
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <rect x="-32" y="-35" width="36" height="70" rx="8" fill="#E11D48" stroke={OUTLINE} strokeWidth="7" />
        {/* Flying Spike Arrows */}
        {[0, 1, 2].map((i) => {
          const ax = 260 + ((frame * 14 + i * 95) % 280);
          const ay = (i - 1) * 65;
          return (
            <polygon
              key={i}
              points={`${ax},${ay - 18} ${ax + 65},${ay} ${ax},${ay + 18}`}
              fill="#F43F5E"
              stroke={OUTLINE}
              strokeWidth="5"
            />
          );
        })}
      </g>

      <FireAngerMascot x={460} y={590 + Math.sin(frame * 0.4) * 14} scale={0.78} />

      <text x="960" y="950" textAnchor="middle" fill="#FB7185" fontSize="48" fontWeight="900">
        giận → lập tức tấn công
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 04 (6.0s - 7.8s): Character Lan Pulling Down Iron Shutter & Snail Shell
// ============================================================================
const Scene04LanSnailHide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const shutterH = interpolate(drop, [0, 1], [60, 420]);

  return (
    <CartoonStage bgGradient="radial-gradient(circle at 50% 50%, #17253B 0%, #0B121E 70%, #05080E 100%)">
      <DiverseCartoonPerson
        variant="lan-bob"
        x={960}
        y={650}
        scale={1.42}
        mood="scared"
        leftArmDeg={-135}
        rightArmDeg={135}
      />

      <CloudFearMascot x={560} y={470 + Math.sin(frame * 0.3) * 10} scale={0.85} />

      {/* Rolling Iron Shutter Door dropping down in front of Lan */}
      <g transform="translate(960, 320)">
        <rect
          x="-210"
          y="0"
          width="420"
          height={shutterH}
          rx="12"
          fill="#64748B"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        {Array.from({ length: 6 }).map((_, i) => {
          const ly = 55 + i * 62;
          if (ly > shutterH - 20) return null;
          return (
            <line
              key={i}
              x1="-195"
              y1={ly}
              x2="195"
              y2={ly}
              stroke="#334155"
              strokeWidth="6"
            />
          );
        })}
        <rect
          x="-115"
          y={shutterH / 2 - 32}
          width="230"
          height="64"
          rx="10"
          fill="#FDE047"
          stroke={OUTLINE}
          strokeWidth="6"
        />
        <text x="0" y={shutterH / 2 + 12} textAnchor="middle" fill={OUTLINE} fontSize="34" fontWeight="900">
          ĐÓNG CỬA
        </text>
      </g>

      <text x="960" y="950" textAnchor="middle" fill="#93C5FD" fontSize="48" fontWeight="900">
        sợ → vội vàng né tránh
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 05 (7.8s - 10.1s): Overflowing Cracked Cup Pouring Storm onto Another
// ============================================================================
const Scene05OverflowingWoundCup: React.FC = () => {
  const frame = useCurrentFrame();
  const tilt = interpolate(frame, [0, 35], [0, 42], { extrapolateRight: "clamp" });

  return (
    <CartoonStage>
      {/* Left: Giant Cracked Teacup ("VẾT THƯƠNG CŨ") tilting over */}
      <g transform={`translate(760, 460) rotate(${tilt})`}>
        <path
          d="M -110 -95 L 110 -95 L 85 110 Q 0 135 -85 110 Z"
          fill="#F8FAFC"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        {/* Crack line */}
        <polyline
          points="-10,-90 -30,-20 10,20 -15,85"
          fill="none"
          stroke="#E11D48"
          strokeWidth="6"
        />
        <text x="0" y="-120" textAnchor="middle" fill="#FDA4AF" fontSize="34" fontWeight="900">
          vết thương cũ
        </text>
      </g>

      {/* Pouring Black/Red Liquid Splash hitting Character Lan on the Right */}
      <path
        d="M 855 470 Q 1080 490 1160 660"
        fill="none"
        stroke="#F43F5E"
        strokeWidth="36"
        strokeLinecap="round"
      />

      <DiverseCartoonPerson
        variant="lan-bob"
        x={1240}
        y={650}
        scale={1.35}
        mood="sad"
        leftArmDeg={35}
        rightArmDeg={-35}
      />

      <text x="960" y="950" textAnchor="middle" fill="#FDA4AF" fontSize="48" fontWeight="900">
        trút hết lên người đối diện
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 06 (10.1s - 13.5s): Secret Heart Chest Drawer & Glowing Question Mark
// ============================================================================
const Scene06HeartChestDrawer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const open = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });

  return (
    <CartoonStage bgGradient="radial-gradient(circle at 50% 50%, #1E293B 0%, #0F172A 68%, #060911 100%)">
      <DiverseCartoonPerson
        variant="minh-glasses"
        x={960}
        y={660}
        scale={1.5}
        mood="sad"
      />

      {/* Open Glowing Drawer on Chest revealing a Bandaged Heart + "?" */}
      <g transform={`translate(960, 625) scale(${interpolate(open, [0, 1], [0.3, 1])})`}>
        <rect
          x="-115"
          y="-85"
          width="230"
          height="170"
          rx="20"
          fill="#FEF3C7"
          stroke={OUTLINE}
          strokeWidth="7"
        />
        {/* Heart inside */}
        <path
          d="M 0 45 C -65 0 -75 -55 -32 -65 C -8 -70 0 -42 0 -42 C 0 -42 8 -70 32 -65 C 75 -55 65 0 0 45 Z"
          fill="#FB7185"
          stroke={OUTLINE}
          strokeWidth="6"
        />
        <text x="0" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="64" fontWeight="900">
          ?
        </text>
      </g>

      <text x="960" y="950" textAnchor="middle" fill="#FDE047" fontSize="48" fontWeight="900">
        tại sao mình lại đau?
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 07 (13.5s - 18.0s): Tree with Tangled Dark Roots Shooting Thorns at 3 People
// ============================================================================
const Scene07RootTreeContagion: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CartoonStage bgGradient="radial-gradient(circle at 50% 50%, #27201C 0%, #14100E 70%, #080605 100%)">
      {/* Ground Divider Line */}
      <line x1="180" y1="640" x2="1740" y2="640" stroke="#78716C" strokeWidth="8" />

      {/* Center Tree Trunk & Tangled Dark Roots Underneath */}
      <g transform="translate(620, 640)">
        {/* Tangled Roots Below Ground */}
        <path
          d="M -35 0 Q -95 95 -140 185 M 0 0 Q 10 120 -20 210 M 35 0 Q 110 95 155 180"
          fill="none"
          stroke="#F43F5E"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <text x="0" y="255" textAnchor="middle" fill="#FB7185" fontSize="36" fontWeight="900">
          gốc rễ chưa lành
        </text>

        {/* Tree Trunk & Thorny Crown Above Ground */}
        <rect x="-38" y="-240" width="76" height="240" fill="#78350F" stroke={OUTLINE} strokeWidth="7" />
        <circle cx="0" cy="-310" r="135" fill="#3F6212" stroke={OUTLINE} strokeWidth="8" />
      </g>

      {/* 3 Different Characters on the Right getting poked by flying thorns */}
      <DiverseCartoonPerson variant="hung-boss" x={1080} y={480} scale={0.95} mood="angry" />
      <DiverseCartoonPerson variant="minh-glasses" x={1330} y={480} scale={0.95} mood="scared" />
      <DiverseCartoonPerson variant="tieu-tam" x={1560} y={495} scale={0.88} mood="sad" />

      {/* Flying Thorns */}
      {[0, 1, 2].map((i) => {
        const tx = 790 + ((frame * 10 + i * 80) % 240);
        const ty = 340 + i * 55;
        return (
          <polygon
            key={i}
            points={`${tx},${ty - 12} ${tx + 48},${ty} ${tx},${ty + 12}`}
            fill="#F43F5E"
            stroke={OUTLINE}
            strokeWidth="4"
          />
        );
      })}
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 08 (18.0s - 21.3s): Crowned Hedgehog "CÁI TÔI" Touched by a Feather
// ============================================================================
const Scene08CrownedEgoHedgehog: React.FC = () => {
  const frame = useCurrentFrame();
  const featherX = interpolate(frame, [0, 85], [1460, 1140], { extrapolateRight: "clamp" });

  return (
    <CartoonStage>
      {/* Velvet Royal Cushion */}
      <g transform="translate(880, 660)">
        <rect
          x="-240"
          y="0"
          width="480"
          height="95"
          rx="36"
          fill="#9333EA"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        {/* Cute Chubby Ego Creature wearing a Gold Crown */}
        <ellipse
          cx="0"
          cy="-95"
          rx="165"
          ry="135"
          fill="#FBBF24"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        {/* Gold Crown */}
        <polygon
          points="-75,-215 -40,-275 0,-230 40,-275 75,-215"
          fill="#FDE047"
          stroke={OUTLINE}
          strokeWidth="7"
          strokeLinejoin="round"
        />
        {/* Smug Eyes */}
        <circle cx="-45" cy="-115" r="14" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="5" />
        <circle cx="45" cy="-115" r="14" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="5" />
        <circle cx="-45" cy="-115" r="5" fill={OUTLINE} />
        <circle cx="45" cy="-115" r="5" fill={OUTLINE} />
        <text x="0" y="-35" textAnchor="middle" fill={OUTLINE} fontSize="48" fontWeight="900">
          CÁI TÔI
        </text>
      </g>

      {/* Tiny White Feather floating in to touch it */}
      <g transform={`translate(${featherX}, 540) rotate(-25)`}>
        <ellipse cx="0" cy="0" rx="75" ry="22" fill="#F8FAFC" stroke={OUTLINE} strokeWidth="5" />
        <line x1="-85" y1="0" x2="75" y2="0" stroke="#94A3B8" strokeWidth="4" />
      </g>

      <text x="960" y="945" textAnchor="middle" fill="#FDE047" fontSize="46" fontWeight="900">
        chỉ cần cái tôi bị chạm nhẹ...
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 09 (21.3s - 24.7s): 360-Degree Spike Fortress Instantly Pops Out!
// ============================================================================
const Scene09SpikyFortressPop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });

  return (
    <CartoonStage bgGradient="radial-gradient(circle at 50% 50%, #3F1D24 0%, #190B0E 70%, #080405 100%)">
      <g transform={`translate(960, 530) scale(${interpolate(pop, [0, 1], [0.4, 1.08])})`}>
        {/* 12 Sharp Spikes radiating around */}
        {Array.from({ length: 12 }).map((_, i) => {
          const deg = i * 30;
          return (
            <g key={i} transform={`rotate(${deg})`}>
              <polygon
                points="-32,-165 0,-295 32,-165"
                fill="#E11D48"
                stroke={OUTLINE}
                strokeWidth="7"
                strokeLinejoin="round"
              />
            </g>
          );
        })}

        {/* Armored Steel Core */}
        <circle
          cx="0"
          cy="0"
          r="175"
          fill="#475569"
          stroke={OUTLINE}
          strokeWidth="9"
        />
        <text x="0" y="16" textAnchor="middle" fill="#F8FAFC" fontSize="48" fontWeight="900">
          PHÒNG THỦ!
        </text>
      </g>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 10 (24.7s - 28.4s): Cozy Velvet Armchair + Noise-Canceling Headphones ("TÔI ĐÚNG")
// ============================================================================
const Scene10CozyArmchairEgo: React.FC = () => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.14) * 6;

  return (
    <CartoonStage>
      {/* Giant Plush Velvet Sofa */}
      <g transform={`translate(960, ${620 + bob})`}>
        <rect
          x="-240"
          y="-180"
          width="480"
          height="260"
          rx="65"
          fill="#D97706"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        <DiverseCartoonPerson
          variant="minh-glasses"
          x={0}
          y={-30}
          scale={1.32}
          mood="smug"
        />
        {/* Giant Red Noise-Canceling Headphones on Minh */}
        <g transform="translate(0, -145)">
          <path
            d="M -52 0 A 52 52 0 0 1 52 0"
            fill="none"
            stroke="#E11D48"
            strokeWidth="12"
          />
          <ellipse cx="-52" cy="8" rx="16" ry="26" fill="#E11D48" stroke={OUTLINE} strokeWidth="5" />
          <ellipse cx="52" cy="8" rx="16" ry="26" fill="#E11D48" stroke={OUTLINE} strokeWidth="5" />
        </g>

        {/* Banner on Sofa Front */}
        <rect
          x="-190"
          y="40"
          width="380"
          height="78"
          rx="16"
          fill="#FEF08A"
          stroke={OUTLINE}
          strokeWidth="7"
        />
        <text x="0" y="92" textAnchor="middle" fill={OUTLINE} fontSize="42" fontWeight="900">
          TÔI LUÔN ĐÚNG
        </text>
      </g>

      <text x="960" y="945" textAnchor="middle" fill="#FDE047" fontSize="46" fontWeight="900">
        bảo vệ quan điểm thì dễ chịu
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 11 (28.4s - 32.1s): Full-Length Mirror Revealing Missing Puzzle Pieces
// ============================================================================
const Scene11PuzzleMirrorTruth: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CartoonStage bgGradient="radial-gradient(circle at 50% 50%, #162836 0%, #0B141C 70%, #05090D 100%)">
      {/* Ornate Standing Mirror in Center */}
      <g transform="translate(960, 510)">
        <rect
          x="-250"
          y="-340"
          width="500"
          height="680"
          rx="250"
          fill="#38BDF8"
          stroke="#F59E0B"
          strokeWidth="16"
        />
        <rect
          x="-230"
          y="-320"
          width="460"
          height="640"
          rx="230"
          fill="#0F172A"
          stroke={OUTLINE}
          strokeWidth="7"
        />

        {/* Character Inside Mirror with Missing Jigsaw Pieces */}
        <DiverseCartoonPerson
          variant="minh-glasses"
          x={0}
          y={75}
          scale={1.38}
          mood="sad"
        />
        {/* Missing Jigsaw Hole on Torso */}
        <rect
          x="-28"
          y="38"
          width="56"
          height="56"
          rx="10"
          fill="#0F172A"
          stroke="#38BDF8"
          strokeWidth="5"
          strokeDasharray="8 6"
        />
      </g>

      {/* Floating Missing Puzzle Piece outside */}
      <g transform={`translate(1340, ${480 + Math.sin(frame * 0.2) * 14}) rotate(15)`}>
        <rect
          x="-45"
          y="-45"
          width="90"
          height="90"
          rx="14"
          fill="#EAB308"
          stroke={OUTLINE}
          strokeWidth="6"
        />
        <text x="0" y="14" textAnchor="middle" fill={OUTLINE} fontSize="42" fontWeight="900">
          ?
        </text>
      </g>

      <text x="960" y="955" textAnchor="middle" fill="#7DD3FC" fontSize="46" fontWeight="900">
        đối diện thiếu sót của chính mình
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 12 (32.1s - 35.8s): Two Characters Separated by a Deep Canyon / Glass Dome
// ============================================================================
const Scene12CanyonDivide: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CartoonStage>
      {/* Left Cliff & Character Hung */}
      <path
        d="M 120 740 L 720 740 L 660 1080 L 120 1080 Z"
        fill="#475569"
        stroke={OUTLINE}
        strokeWidth="8"
      />
      <DiverseCartoonPerson variant="hung-boss" x={490} y={580} scale={1.25} mood="angry" />

      {/* Right Cliff & Character Lan */}
      <path
        d="M 1200 740 L 1800 740 L 1800 1080 L 1260 1080 Z"
        fill="#475569"
        stroke={OUTLINE}
        strokeWidth="8"
      />
      <DiverseCartoonPerson variant="lan-bob" x={1430} y={580} scale={1.25} mood="sad" />

      {/* Speech Bubbles Falling into the Abyss */}
      {[0, 1].map((i) => {
        const by = 520 + ((frame * 6 + i * 120) % 360);
        return (
          <g key={i} transform={`translate(${910 + i * 100}, ${by}) rotate(${by * 0.2})`}>
            <rect
              x="-55"
              y="-32"
              width="110"
              height="64"
              rx="18"
              fill="#F8FAFC"
              stroke={OUTLINE}
              strokeWidth="5"
            />
            <line x1="-30" y1="0" x2="30" y2="0" stroke="#64748B" strokeWidth="6" />
          </g>
        );
      })}

      <text x="960" y="965" textAnchor="middle" fill="#FDE047" fontSize="46" fontWeight="900">
        khó trò chuyện sâu sắc
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 13 (35.8s - 39.5s): Green Sprout ("góp ý") Turning into Judge Gavel ("phán xét")
// ============================================================================
const Scene13SproutToGavel: React.FC = () => {
  const frame = useCurrentFrame();
  const bang = Math.sin(frame * 0.45) * 18;

  return (
    <CartoonStage>
      {/* Left: Cute Potted Green Plant ("GÓP Ý") */}
      <g transform="translate(520, 560)">
        <polygon
          points="-75,0 75,0 55,120 -55,120"
          fill="#D97706"
          stroke={OUTLINE}
          strokeWidth="7"
        />
        <line x1="0" y1="0" x2="0" y2="-95" stroke="#22C55E" strokeWidth="10" />
        <ellipse cx="-35" cy="-65" rx="35" ry="18" transform="rotate(-25 -35 -65)" fill="#4ADE80" stroke={OUTLINE} strokeWidth="6" />
        <ellipse cx="35" cy="-85" rx="35" ry="18" transform="rotate(25 35 -85)" fill="#4ADE80" stroke={OUTLINE} strokeWidth="6" />
        <text x="0" y="195" textAnchor="middle" fill="#4ADE80" fontSize="44" fontWeight="900">
          lời góp ý
        </text>
      </g>

      {/* Center: Distortion Red Filter Lens */}
      <g transform="translate(960, 540)">
        <circle
          cx="0"
          cy="0"
          r="115"
          fill="#E11D48"
          fillOpacity="0.35"
          stroke="#F43F5E"
          strokeWidth="10"
        />
        <text x="0" y="175" textAnchor="middle" fill="#FDA4AF" fontSize="34" fontWeight="800">
          lăng kính tự ái
        </text>
      </g>

      {/* Right: Giant Wooden Judge Gavel & Spiked Mace ("PHÁN XÉT / CÔNG KÍCH") */}
      <g transform={`translate(1400, 540) rotate(${bang})`}>
        <rect x="-20" y="-20" width="40" height="175" rx="10" fill="#92400E" stroke={OUTLINE} strokeWidth="7" />
        <rect x="-110" y="-95" width="220" height="90" rx="18" fill="#B91C1C" stroke={OUTLINE} strokeWidth="8" />
        <text x="0" y="215" textAnchor="middle" fill="#FB7185" fontSize="44" fontWeight="900">
          công kích!
        </text>
      </g>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 14 (39.5s - 45.7s): Giant Tough Robot Armor Opens -> Tiny Inner Child (Tiểu Tâm)
// ============================================================================
const Scene14MechaInnerChild: React.FC = () => {
  const frame = useCurrentFrame();
  const doorOpen = interpolate(frame, [40, 95], [0, 175], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <CartoonStage bgGradient="radial-gradient(circle at 50% 50%, #261C35 0%, #110C18 70%, #07050A 100%)">
      {/* Giant Steel Robot Suit Outline */}
      <g transform="translate(960, 540)">
        {/* Robot Shoulders & Chest */}
        <rect
          x="-260"
          y="-220"
          width="520"
          height="420"
          rx="36"
          fill="#334155"
          stroke={OUTLINE}
          strokeWidth="9"
        />
        {/* Glowing Warm Interior Cockpit */}
        <rect
          x="-165"
          y="-150"
          width="330"
          height="300"
          rx="24"
          fill="#FEF3C7"
          stroke={OUTLINE}
          strokeWidth="7"
        />

        {/* Little Inner Child ("Tiểu Tâm" in Bear Beanie) sitting inside */}
        <DiverseCartoonPerson
          variant="tieu-tam"
          x={0}
          y={25}
          scale={0.92}
          mood="scared"
        />

        {/* Left & Right Steel Armor Doors sliding open */}
        <rect
          x={-170 - doorOpen}
          y="-155"
          width="172"
          height="310"
          rx="12"
          fill="#64748B"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        <rect
          x={-2 + doorOpen}
          y="-155"
          width="172"
          height="310"
          rx="12"
          fill="#64748B"
          stroke={OUTLINE}
          strokeWidth="8"
        />
      </g>

      <text x="960" y="950" textAnchor="middle" fill="#FDE68A" fontSize="46" fontWeight="900">
        vỏ bọc mạnh mẽ che giấu đứa trẻ mong manh
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 15 (45.7s - 50.0s): Mentor Sitting on Park Bench Having Tea with Anger & Fear Mascots
// ============================================================================
const Scene15TeaWithEmotions: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CartoonStage bgGradient="radial-gradient(circle at 50% 50%, #16302B 0%, #0B1916 70%, #050B0A 100%)">
      {/* Wooden Park Bench */}
      <g transform="translate(960, 710)">
        <rect x="-460" y="-85" width="920" height="36" rx="10" fill="#B45309" stroke={OUTLINE} strokeWidth="7" />
        <rect x="-460" y="-35" width="920" height="36" rx="10" fill="#B45309" stroke={OUTLINE} strokeWidth="7" />
        <rect x="-490" y="12" width="980" height="32" rx="12" fill="#D97706" stroke={OUTLINE} strokeWidth="7" />
        <rect x="-380" y="44" width="32" height="95" fill="#334155" stroke={OUTLINE} strokeWidth="6" />
        <rect x="348" y="44" width="32" height="95" fill="#334155" stroke={OUTLINE} strokeWidth="6" />
      </g>

      {/* Mentor Character in the Center */}
      <DiverseCartoonPerson
        variant="mentor-calm"
        x={960}
        y={590}
        scale={1.32}
        mood="happy"
      />

      {/* Fire Anger Mascot on Left & Cloud Fear Mascot on Right sitting peacefully */}
      <FireAngerMascot x={620} y={625 + Math.sin(frame * 0.15) * 6} scale={0.78} />
      <CloudFearMascot x={1300} y={635 + Math.cos(frame * 0.15) * 6} scale={0.85} />

      <text x="960" y="950" textAnchor="middle" fill="#6EE7B7" fontSize="46" fontWeight="900">
        trưởng thành là làm bạn với cảm xúc
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 16 (50.0s - 54.0s): Captain at the Wooden Ship Helm Steering Over Waves
// ============================================================================
const Scene16ShipHelmCaptain: React.FC = () => {
  const frame = useCurrentFrame();
  const wheelRot = Math.sin(frame * 0.08) * 22;

  return (
    <CartoonStage bgGradient="radial-gradient(circle at 50% 45%, #1D3557 0%, #0F1E36 70%, #070E1A 100%)">
      {/* Character Lan calmly steering */}
      <DiverseCartoonPerson
        variant="lan-bob"
        x={960}
        y={560}
        scale={1.4}
        mood="calm"
      />

      {/* Big Wooden Ship Steering Wheel */}
      <g transform={`translate(960, 620) rotate(${wheelRot})`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="-10"
            y="-195"
            width="20"
            height="390"
            rx="10"
            transform={`rotate(${i * 45})`}
            fill="#B45309"
            stroke={OUTLINE}
            strokeWidth="6"
          />
        ))}
        <circle
          cx="0"
          cy="0"
          r="135"
          fill="none"
          stroke="#D97706"
          strokeWidth="28"
        />
        <circle cx="0" cy="0" r="149" fill="none" stroke={OUTLINE} strokeWidth="6" />
        <circle cx="0" cy="0" r="121" fill="none" stroke={OUTLINE} strokeWidth="6" />
        <circle cx="0" cy="0" r="38" fill="#FDE047" stroke={OUTLINE} strokeWidth="6" />
      </g>

      {/* Rolling 2D Cartoon Ocean Waves at Bottom */}
      <path
        d={`M 0 820 Q 240 ${780 + Math.sin(frame * 0.15) * 20} 480 820 T 960 820 T 1440 820 T 1920 820 L 1920 1080 L 0 1080 Z`}
        fill="#0284C7"
        stroke={OUTLINE}
        strokeWidth="8"
      />

      <text x="960" y="955" textAnchor="middle" fill="#FEF08A" fontSize="48" fontWeight="900">
        tỉnh táo cầm lái trước sóng cảm xúc
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 17 (54.0s - 63.0s): 3 Interactive Story Windows (3 Characters Practicing the 3 Steps!)
// ============================================================================
const Scene17ThreeCharactersPractice: React.FC = () => {
  const frame = useCurrentFrame();
  const activeStep = frame < 85 ? 0 : frame < 175 ? 1 : 2;

  return (
    <CartoonStage>
      {/* Window 1: Lan with Glowing Chest Lantern ("1. NHẬN DIỆN") */}
      <g transform={`translate(430, 520) scale(${activeStep === 0 ? 1.06 : 0.94})`}>
        <rect
          x="-220"
          y="-290"
          width="440"
          height="560"
          rx="32"
          fill="#1E293B"
          stroke={activeStep === 0 ? "#34D399" : OUTLINE}
          strokeWidth={activeStep === 0 ? 12 : 7}
        />
        <DiverseCartoonPerson variant="lan-bob" x={0} y={40} scale={1.15} mood="calm" />
        <circle cx="0" cy="10" r="32" fill="#FDE047" stroke={OUTLINE} strokeWidth="5" />
        <text x="0" y="215" textAnchor="middle" fill="#6EE7B7" fontSize="40" fontWeight="900">
          1. nhận diện
        </text>
      </g>

      {/* Window 2: Hung with Golden Hourglass ("2. DỪNG LẠI 1 NHỊP") */}
      <g transform={`translate(960, 520) scale(${activeStep === 1 ? 1.06 : 0.94})`}>
        <rect
          x="-220"
          y="-290"
          width="440"
          height="560"
          rx="32"
          fill="#1E293B"
          stroke={activeStep === 1 ? "#FBBF24" : OUTLINE}
          strokeWidth={activeStep === 1 ? 12 : 7}
        />
        <DiverseCartoonPerson variant="hung-boss" x={0} y={40} scale={1.15} mood="calm" />
        {/* Golden Pause Badge */}
        <circle cx="0" cy="-165" r="46" fill="#FBBF24" stroke={OUTLINE} strokeWidth="6" />
        <rect x="-16" y="-185" width="12" height="40" rx="4" fill={OUTLINE} />
        <rect x="4" y="-185" width="12" height="40" rx="4" fill={OUTLINE} />
        <text x="0" y="215" textAnchor="middle" fill="#FDE047" fontSize="40" fontWeight="900">
          2. dừng lại 1 nhịp
        </text>
      </g>

      {/* Window 3: Minh Choosing Calm Flower Response ("3. PHẢN HỒI ĐIỀM TĨNH") */}
      <g transform={`translate(1490, 520) scale(${activeStep === 2 ? 1.06 : 0.94})`}>
        <rect
          x="-220"
          y="-290"
          width="440"
          height="560"
          rx="32"
          fill="#1E293B"
          stroke={activeStep === 2 ? "#60A5FA" : OUTLINE}
          strokeWidth={activeStep === 2 ? 12 : 7}
        />
        <DiverseCartoonPerson variant="minh-glasses" x={0} y={40} scale={1.15} mood="happy" />
        <text x="0" y="215" textAnchor="middle" fill="#93C5FD" fontSize="40" fontWeight="900">
          3. chọn điềm tĩnh
        </text>
      </g>
    </CartoonStage>
  );
};

// ============================================================================
// SCENE 18 (63.0s - 69.0s): Sunrise Green Hilltop — All 4 Characters Free Under Golden Sun
// ============================================================================
const Scene18SunriseHilltopFreedom: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <CartoonStage bgGradient="linear-gradient(180deg, #1E3A8A 0%, #3B82F6 45%, #FDE047 100%)">
      {/* Rising Golden Sun */}
      <circle
        cx="960"
        cy="540"
        r={240 + Math.sin(frame * 0.1) * 10}
        fill="#FEF08A"
        opacity="0.35"
      />
      <circle
        cx="960"
        cy="540"
        r="165"
        fill="#FACC15"
        stroke={OUTLINE}
        strokeWidth="7"
      />

      {/* Rolling Green 2D Cartoon Hills */}
      <ellipse
        cx="480"
        cy="980"
        rx="820"
        ry="280"
        fill="#22C55E"
        stroke={OUTLINE}
        strokeWidth="8"
      />
      <ellipse
        cx="1440"
        cy="980"
        rx="820"
        ry="280"
        fill="#16A34A"
        stroke={OUTLINE}
        strokeWidth="8"
      />

      {/* All 4 Diverse Characters Standing Together Happily */}
      <DiverseCartoonPerson
        variant="hung-boss"
        x={520}
        y={650}
        scale={1.18}
        mood="happy"
        leftArmDeg={135}
      />
      <DiverseCartoonPerson
        variant="minh-glasses"
        x={810}
        y={635}
        scale={1.22}
        mood="happy"
        rightArmDeg={-135}
      />
      <DiverseCartoonPerson
        variant="lan-bob"
        x={1110}
        y={635}
        scale={1.22}
        mood="happy"
        leftArmDeg={135}
      />
      <DiverseCartoonPerson
        variant="tieu-tam"
        x={1390}
        y={670}
        scale={1.05}
        mood="happy"
        leftArmDeg={140}
        rightArmDeg={-140}
      />

      {/* Flying White Doves in the Sky */}
      {[-340, 0, 340].map((dx, i) => {
        const by = 260 - frame * 1.2 + i * 35;
        return (
          <path
            key={i}
            d={`M ${960 + dx - 32} ${by} Q ${960 + dx - 15} ${by - 22} ${960 + dx} ${by} Q ${960 + dx + 15} ${by - 22} ${960 + dx + 32} ${by}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
          />
        );
      })}

      <text
        x="960"
        y="965"
        textAnchor="middle"
        fill="#FFFFFF"
        stroke={OUTLINE}
        strokeWidth="8"
        paintOrder="stroke fill"
        fontSize="52"
        fontWeight="900"
      >
        làm chủ khoảng dừng → thực sự tự do
      </text>
    </CartoonStage>
  );
};

// ============================================================================
// MASTER COMPOSITION: DIVERSE 2D CARTOON STORYTELLING (0.0s -> 69.0s)
// ============================================================================
export const PhatBieuCartoon2D: React.FC<PhatBieuCartoon2DProps> = ({
  narrationSrc = "episodes/reactive-mind/narration.mp3",
  musicSrc = "episodes/reactive-mind/tiktok_newpulse_bgm.wav",
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const microScenes: Array<{
    id: string;
    inSec: number;
    outSec: number;
    Comp: React.FC;
  }> = [
    { id: "c01", inSec: 0.0, outSec: 2.3, Comp: Scene01PuppetStrings },
    { id: "c02", inSec: 2.3, outSec: 4.1, Comp: Scene02SirenVsBrain },
    { id: "c03", inSec: 4.1, outSec: 6.0, Comp: Scene03BossMegaphoneAttack },
    { id: "c04", inSec: 6.0, outSec: 7.8, Comp: Scene04LanSnailHide },
    { id: "c05", inSec: 7.8, outSec: 10.1, Comp: Scene05OverflowingWoundCup },
    { id: "c06", inSec: 10.1, outSec: 13.5, Comp: Scene06HeartChestDrawer },
    { id: "c07", inSec: 13.5, outSec: 18.0, Comp: Scene07RootTreeContagion },
    { id: "c08", inSec: 18.0, outSec: 21.3, Comp: Scene08CrownedEgoHedgehog },
    { id: "c09", inSec: 21.3, outSec: 24.7, Comp: Scene09SpikyFortressPop },
    { id: "c10", inSec: 24.7, outSec: 28.4, Comp: Scene10CozyArmchairEgo },
    { id: "c11", inSec: 28.4, outSec: 32.1, Comp: Scene11PuzzleMirrorTruth },
    { id: "c12", inSec: 32.1, outSec: 35.8, Comp: Scene12CanyonDivide },
    { id: "c13", inSec: 35.8, outSec: 39.5, Comp: Scene13SproutToGavel },
    { id: "c14", inSec: 39.5, outSec: 45.7, Comp: Scene14MechaInnerChild },
    { id: "c15", inSec: 45.7, outSec: 50.0, Comp: Scene15TeaWithEmotions },
    { id: "c16", inSec: 50.0, outSec: 54.0, Comp: Scene16ShipHelmCaptain },
    { id: "c17", inSec: 54.0, outSec: 63.0, Comp: Scene17ThreeCharactersPractice },
    { id: "c18", inSec: 63.0, outSec: 69.0, Comp: Scene18SunriseHilltopFreedom },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#08070B" }}>
      {microScenes.map(({ id, inSec, outSec, Comp }) => {
        const from = Math.round(inSec * fps);
        const dur = Math.max(1, Math.round((outSec - inSec) * fps));
        return (
          <Sequence key={id} from={from} durationInFrames={dur}>
            <Comp />
          </Sequence>
        );
      })}

      {/* Voiceover Narration */}
      {narrationSrc && <Audio src={resolveAsset(narrationSrc)} volume={1.0} />}

      {/* Soft Transition SFX */}
      <Audio
        src={resolveAsset("episodes/reactive-mind/sfx_stem_master.wav")}
        volume={0.18}
      />

      {/* TikTok Background Music */}
      {musicSrc && (
        <Audio
          src={resolveAsset(musicSrc)}
          loop
          volume={(f) => {
            const fadeIn = interpolate(f, [0, 30], [0, 0.25], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const fadeOut = interpolate(
              f,
              [durationInFrames - 60, durationInFrames],
              [0.25, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            return Math.min(fadeIn, fadeOut);
          }}
        />
      )}
    </AbsoluteFill>
  );
};
