import React from "react";
import { AbsoluteFill } from "remotion";

const OUTLINE = "#08080A";

export type ExpressionMood = "default" | "angry" | "scared" | "awakened";

// ============================================================================
// HOT TREND #1 (GLOBAL TOP 1): "MOCHI MẦM XANH" — THE VIRAL WHITE BLOB MASCOT
// Pure white marshmallow/mochi body (100% contrast on dark TikTok feeds),
// cute leaf sprout on head that transforms by emotion, squishy body physics!
// ============================================================================
export const HotChar01MochiBlob: React.FC<{
  x: number;
  y: number;
  scale?: number;
  mood?: ExpressionMood;
  label?: string;
}> = ({ x, y, scale = 1, mood = "default", label }) => {
  const bodyFill =
    mood === "angry"
      ? "#FFE4E6"
      : mood === "scared"
        ? "#E0F2FE"
        : "#FFFFFF";

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Soft Ground Shadow */}
      <ellipse cx="0" cy="145" rx="78" ry="16" fill="rgba(0,0,0,0.45)" />

      {/* Ambient Glow */}
      {mood === "angry" && (
        <circle cx="0" cy="0" r="145" fill="#F43F5E" opacity="0.22" />
      )}
      {mood === "scared" && (
        <circle cx="0" cy="10" r="135" fill="#38BDF8" opacity="0.18" />
      )}
      {mood === "awakened" && (
        <g>
          <circle cx="0" cy="0" r="150" fill="#FACC15" opacity="0.22" />
          <circle
            cx="0"
            cy="0"
            r="118"
            fill="none"
            stroke="#FDE047"
            strokeWidth="4"
            strokeDasharray="10 8"
          />
        </g>
      )}

      {/* Stubby Cute Mochi Feet */}
      <ellipse
        cx="-36"
        cy="132"
        rx="22"
        ry="14"
        fill={bodyFill}
        stroke={OUTLINE}
        strokeWidth="6.5"
      />
      <ellipse
        cx="36"
        cy="132"
        rx="22"
        ry="14"
        fill={bodyFill}
        stroke={OUTLINE}
        strokeWidth="6.5"
      />

      {/* Squishy Marshmallow Body Silhouette (Changes shape slightly with emotion!) */}
      {mood === "scared" ? (
        /* Melting / Squished Puddle Blob when Scared */
        <path
          d="M -92 125 C -108 125 -112 85 -88 45 C -76 -35 -48 -88 0 -88 C 48 -88 76 -35 88 45 C 112 85 108 125 92 125 Z"
          fill={bodyFill}
          stroke={OUTLINE}
          strokeWidth="6.5"
          strokeLinejoin="round"
        />
      ) : (
        /* Plump Bouncy Mochi Body */
        <path
          d="M -78 122 C -96 82 -92 -18 -68 -68 C -48 -108 48 -108 68 -68 C 92 -18 96 82 78 122 C 42 132 -42 132 -78 122 Z"
          fill={bodyFill}
          stroke={OUTLINE}
          strokeWidth="6.5"
          strokeLinejoin="round"
        />
      )}

      {/* Subtle Bottom Shading Inside Mochi Body */}
      <path
        d="M -72 114 Q 0 128 72 114 Q 82 92 76 70 Q 0 98 -76 70 Q -82 92 -72 114 Z"
        fill={mood === "angry" ? "#FECDD3" : "#E2E8F0"}
        opacity="0.65"
      />

      {/* Cute Little Stubby Arms */}
      {mood === "angry" ? (
        <>
          <path
            d="M -82 10 C -118 -25 -115 -55 -88 -45"
            fill={bodyFill}
            stroke={OUTLINE}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <path
            d="M 82 10 C 118 -25 115 -55 88 -45"
            fill={bodyFill}
            stroke={OUTLINE}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
        </>
      ) : mood === "awakened" ? (
        /* Hands together in peaceful gesture */
        <>
          <ellipse
            cx="-18"
            cy="56"
            rx="18"
            ry="13"
            transform="rotate(-25 -18 56)"
            fill={bodyFill}
            stroke={OUTLINE}
            strokeWidth="6"
          />
          <ellipse
            cx="18"
            cy="56"
            rx="18"
            ry="13"
            transform="rotate(25 18 56)"
            fill={bodyFill}
            stroke={OUTLINE}
            strokeWidth="6"
          />
        </>
      ) : (
        <>
          <path
            d="M -82 15 C -112 32 -108 62 -80 52"
            fill={bodyFill}
            stroke={OUTLINE}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <path
            d="M 82 15 C 112 32 108 62 80 52"
            fill={bodyFill}
            stroke={OUTLINE}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Signature Head Sprout (Transforms by Emotion!) */}
      {mood === "angry" ? (
        /* Sprout bursts into a cartoon flame! */
        <g transform="translate(0, -98)">
          <path
            d="M 0 -55 C 24 -28 32 -5 22 10 C 14 20 -14 20 -22 10 C -32 -5 -24 -28 0 -55 Z"
            fill="#F43F5E"
            stroke={OUTLINE}
            strokeWidth="6"
          />
          <path
            d="M 0 -30 C 12 -14 16 0 10 8 C 6 14 -6 14 -10 8 C -16 0 -12 -14 0 -30 Z"
            fill="#FDE047"
          />
        </g>
      ) : (
        /* Cute Green Leaf Sprout (Droops when scared, blooms with lotus when awakened) */
        <g
          transform={`translate(0, ${mood === "scared" ? -86 : -98}) rotate(${mood === "scared" ? 28 : 0})`}
        >
          <path
            d="M 0 2 Q -4 -26 0 -38"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 0 -34 C -28 -52 -42 -28 -18 -14 C -8 -8 0 -22 0 -34 Z"
            fill="#4ADE80"
            stroke={OUTLINE}
            strokeWidth="5.5"
          />
          <path
            d="M 0 -34 C 28 -52 42 -28 18 -14 C 8 -8 0 -22 0 -34 Z"
            fill="#22C55E"
            stroke={OUTLINE}
            strokeWidth="5.5"
          />
          {mood === "awakened" && (
            <circle
              cx="0"
              cy="-44"
              r="11"
              fill="#FDE047"
              stroke={OUTLINE}
              strokeWidth="4.5"
            />
          )}
        </g>
      )}

      {/* Rosy Cheeks */}
      <ellipse
        cx="-42"
        cy="2"
        rx="13"
        ry="7.5"
        fill={mood === "angry" ? "#F43F5E" : "#FB7185"}
        opacity="0.65"
      />
      <ellipse
        cx="42"
        cy="2"
        rx="13"
        ry="7.5"
        fill={mood === "angry" ? "#F43F5E" : "#FB7185"}
        opacity="0.65"
      />

      {/* Expressive Meme-Ready Face */}
      <g transform="translate(0, -16)">
        {mood === "awakened" ? (
          /* Peaceful Closed Arc Eyes */
          <>
            <path
              d="M -36 0 Q -24 -14 -12 0"
              fill="none"
              stroke={OUTLINE}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 12 0 Q 24 -14 36 0"
              fill="none"
              stroke={OUTLINE}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx="-26" cy="-4" r="11.5" fill={OUTLINE} />
            <circle cx="26" cy="-4" r="11.5" fill={OUTLINE} />
            <circle cx="-29" cy="-8" r="4.2" fill="#FFFFFF" />
            <circle cx="23" cy="-8" r="4.2" fill="#FFFFFF" />
            <circle cx="-22" cy="-1" r="2" fill="#FFFFFF" />
            <circle cx="30" cy="-1" r="2" fill="#FFFFFF" />
          </>
        )}

        {/* Eyebrows */}
        {mood === "angry" && (
          <>
            <line
              x1="-42"
              y1="-24"
              x2="-12"
              y2="-12"
              stroke={OUTLINE}
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            <line
              x1="42"
              y1="-24"
              x2="12"
              y2="-12"
              stroke={OUTLINE}
              strokeWidth="6.5"
              strokeLinecap="round"
            />
          </>
        )}
        {mood === "scared" && (
          <>
            <line
              x1="-42"
              y1="-12"
              x2="-14"
              y2="-24"
              stroke={OUTLINE}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <line
              x1="42"
              y1="-12"
              x2="14"
              y2="-24"
              stroke={OUTLINE}
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Teardrops */}
            <path
              d="M -38 8 C -46 22 -30 22 -38 8 Z"
              fill="#38BDF8"
              stroke={OUTLINE}
              strokeWidth="3.5"
            />
          </>
        )}

        {/* Mouth */}
        {mood === "default" && (
          <path
            d="M -12 16 Q -6 23 0 16 Q 6 23 12 16"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
        )}
        {mood === "angry" && (
          <path
            d="M -18 14 L 18 14 L 14 32 L -14 32 Z"
            fill="#F43F5E"
            stroke={OUTLINE}
            strokeWidth="5"
            strokeLinejoin="round"
          />
        )}
        {mood === "scared" && (
          <path
            d="M -16 24 Q -8 16 0 24 Q 8 32 16 24"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
        )}
        {mood === "awakened" && (
          <path
            d="M -12 16 Q 0 26 12 16"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
        )}
      </g>

      {label && (
        <text
          x="0"
          y="202"
          textAnchor="middle"
          fill="#E2E8F0"
          fontSize="24"
          fontWeight="800"
        >
          {label}
        </text>
      )}
    </g>
  );
};

// ============================================================================
// HOT TREND #2 (VIETNAM TOP 1): "THỎ TỈNH BƠ" — VIRAL VN BUNNY MASCOT
// Inspired by Thỏ Bảy Màu / Chiikawa / Én: Expressive long bunny ears that
// react to every emotion, deadpan witty eyes, cozy yellow sweater.
// ============================================================================
export const HotChar02BunnyVN: React.FC<{
  x: number;
  y: number;
  scale?: number;
  mood?: ExpressionMood;
  label?: string;
}> = ({ x, y, scale = 1, mood = "default", label }) => {
  const fur = "#FFFDF9";
  const earPink = "#FDA4AF";
  const sweater = "#F59E0B";

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="162" rx="68" ry="15" fill="rgba(0,0,0,0.45)" />

      {mood === "angry" && (
        <circle cx="0" cy="-20" r="145" fill="#EF4444" opacity="0.2" />
      )}
      {mood === "scared" && (
        <circle cx="0" cy="-20" r="140" fill="#60A5FA" opacity="0.18" />
      )}
      {mood === "awakened" && (
        <circle cx="0" cy="-20" r="148" fill="#34D399" opacity="0.2" />
      )}

      {/* Expressive Long Bunny Ears (Change angle based on mood!) */}
      <g
        transform={`translate(-24, -108) rotate(${mood === "angry" ? -18 : mood === "scared" ? -68 : -8})`}
      >
        <ellipse
          cx="0"
          cy="-48"
          rx="18"
          ry="54"
          fill={fur}
          stroke={OUTLINE}
          strokeWidth="6"
        />
        <ellipse cx="0" cy="-46" rx="9" ry="36" fill={earPink} />
      </g>
      <g
        transform={`translate(24, -108) rotate(${mood === "angry" ? 18 : mood === "scared" ? 68 : 8})`}
      >
        <ellipse
          cx="0"
          cy="-48"
          rx="18"
          ry="54"
          fill={fur}
          stroke={OUTLINE}
          strokeWidth="6"
        />
        <ellipse cx="0" cy="-46" rx="9" ry="36" fill={earPink} />
      </g>

      {/* Cute White Bunny Legs */}
      <path
        d="M -28 68 L -10 68 L -12 145 C -12 154 -28 154 -28 145 Z"
        fill={fur}
        stroke={OUTLINE}
        strokeWidth="6"
      />
      <path
        d="M 10 68 L 28 68 L 28 145 C 28 154 12 154 12 145 Z"
        fill={fur}
        stroke={OUTLINE}
        strokeWidth="6"
      />

      {/* Cozy Sweater Arms */}
      <g
        transform={
          mood === "angry"
            ? "translate(-46, -15) rotate(125)"
            : "translate(-44, -15) rotate(18)"
        }
      >
        <rect
          x="-12"
          y="0"
          width="24"
          height="74"
          rx="12"
          fill={sweater}
          stroke={OUTLINE}
          strokeWidth="6"
        />
        <circle
          cx="0"
          cy="78"
          r="12"
          fill={fur}
          stroke={OUTLINE}
          strokeWidth="5.5"
        />
      </g>
      <g
        transform={
          mood === "angry"
            ? "translate(46, -15) rotate(-125)"
            : mood === "awakened"
              ? "translate(44, -15) rotate(-45)"
              : "translate(44, -15) rotate(-18)"
        }
      >
        <rect
          x="-12"
          y="0"
          width="24"
          height="74"
          rx="12"
          fill={sweater}
          stroke={OUTLINE}
          strokeWidth="6"
        />
        <circle
          cx="0"
          cy="78"
          r="12"
          fill={fur}
          stroke={OUTLINE}
          strokeWidth="5.5"
        />
      </g>

      {/* Cozy Mustard Sweater Torso */}
      <path
        d="M -40 -22 C -46 15 -48 52 -42 74 L 42 74 C 48 52 46 15 40 -22 Z"
        fill={sweater}
        stroke={OUTLINE}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* Heart Logo on Sweater */}
      <path
        d="M 0 32 C -16 18 -20 4 -8 0 C -2 -2 0 6 0 6 C 0 6 2 -2 8 0 C 20 4 16 18 0 32 Z"
        fill="#F43F5E"
        stroke={OUTLINE}
        strokeWidth="4.5"
      />

      {/* Plump Bunny Cheeks Head */}
      <path
        d="M -52 -65 C -66 -42 -58 -15 -34 -15 L 34 -15 C 58 -15 66 -42 52 -65 C 54 -102 32 -120 0 -120 C -32 -120 -54 -102 -52 -65 Z"
        fill={fur}
        stroke={OUTLINE}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Rosy Cheeks */}
      <ellipse cx="-36" cy="-52" rx="10" ry="6" fill="#FB7185" opacity="0.65" />
      <ellipse cx="36" cy="-52" rx="10" ry="6" fill="#FB7185" opacity="0.65" />

      {/* Bunny Face */}
      <g transform="translate(0, -68)">
        <circle
          cx="-20"
          cy="-2"
          r="10.5"
          fill="#FFFFFF"
          stroke={OUTLINE}
          strokeWidth="4.5"
        />
        <circle
          cx="20"
          cy="-2"
          r="10.5"
          fill="#FFFFFF"
          stroke={OUTLINE}
          strokeWidth="4.5"
        />
        <circle cx="-20" cy="0" r="4.5" fill={OUTLINE} />
        <circle cx="20" cy="0" r="4.5" fill={OUTLINE} />

        {/* Signature Deadpan Eyelids */}
        {mood === "default" && (
          <>
            <path
              d="M -30 -4 A 10.5 10.5 0 0 1 -10 -4 Z"
              fill={fur}
              stroke={OUTLINE}
              strokeWidth="4"
            />
            <path
              d="M 10 -4 A 10.5 10.5 0 0 1 30 -4 Z"
              fill={fur}
              stroke={OUTLINE}
              strokeWidth="4"
            />
          </>
        )}
        {mood === "angry" && (
          <>
            <line
              x1="-32"
              y1="-16"
              x2="-8"
              y2="-6"
              stroke={OUTLINE}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <line
              x1="32"
              y1="-16"
              x2="8"
              y2="-6"
              stroke={OUTLINE}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Cute Pink Nose & Y-Shaped Bunny Mouth */}
        <ellipse cx="0" cy="10" rx="5.5" ry="4" fill="#FB7185" stroke={OUTLINE} strokeWidth="3.5" />
        {mood === "angry" ? (
          <rect
            x="-12"
            y="16"
            width="24"
            height="12"
            rx="4"
            fill="#E11D48"
            stroke={OUTLINE}
            strokeWidth="4"
          />
        ) : (
          <path
            d="M 0 14 L 0 21 M -9 24 Q 0 19 9 24"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
        )}
      </g>

      {label && (
        <text
          x="0"
          y="202"
          textAnchor="middle"
          fill="#E2E8F0"
          fontSize="24"
          fontWeight="800"
        >
          {label}
        </text>
      )}
    </g>
  );
};

// ============================================================================
// HOT TREND #3: "HOODIE PAINT EXPLAINER" — VIRAL MINIMALIST STORYTIME AVATAR
// Clean white/cream head, bold hoodie silhouette, super readable on TikTok.
// ============================================================================
export const HotChar03HoodieAvatar: React.FC<{
  x: number;
  y: number;
  scale?: number;
  mood?: ExpressionMood;
  label?: string;
}> = ({ x, y, scale = 1, mood = "default", label }) => {
  const skin = "#FFF8F0";
  const hoodie = "#3B82F6";

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="162" rx="68" ry="15" fill="rgba(0,0,0,0.45)" />

      {mood === "angry" && (
        <circle cx="0" cy="-20" r="145" fill="#EF4444" opacity="0.2" />
      )}
      {mood === "scared" && (
        <circle cx="0" cy="-20" r="140" fill="#A855F7" opacity="0.18" />
      )}
      {mood === "awakened" && (
        <circle cx="0" cy="-20" r="148" fill="#FACC15" opacity="0.2" />
      )}

      {/* Legs */}
      <rect
        x="-28"
        y="65"
        width="24"
        height="85"
        rx="8"
        fill="#1E293B"
        stroke={OUTLINE}
        strokeWidth="6"
      />
      <rect
        x="4"
        y="65"
        width="24"
        height="85"
        rx="8"
        fill="#1E293B"
        stroke={OUTLINE}
        strokeWidth="6"
      />
      <ellipse
        cx="-16"
        cy="154"
        rx="18"
        ry="9"
        fill="#FFFFFF"
        stroke={OUTLINE}
        strokeWidth="5.5"
      />
      <ellipse
        cx="16"
        cy="154"
        rx="18"
        ry="9"
        fill="#FFFFFF"
        stroke={OUTLINE}
        strokeWidth="5.5"
      />

      {/* Arms */}
      <g
        transform={
          mood === "angry"
            ? "translate(-44, -22) rotate(130)"
            : "translate(-44, -22) rotate(14)"
        }
      >
        <rect
          x="-12"
          y="0"
          width="24"
          height="82"
          rx="12"
          fill={hoodie}
          stroke={OUTLINE}
          strokeWidth="6"
        />
        <circle
          cx="0"
          cy="88"
          r="12"
          fill={skin}
          stroke={OUTLINE}
          strokeWidth="5.5"
        />
      </g>
      <g
        transform={
          mood === "angry"
            ? "translate(44, -22) rotate(-130)"
            : "translate(44, -22) rotate(-14)"
        }
      >
        <rect
          x="-12"
          y="0"
          width="24"
          height="82"
          rx="12"
          fill={hoodie}
          stroke={OUTLINE}
          strokeWidth="6"
        />
        <circle
          cx="0"
          cy="88"
          r="12"
          fill={skin}
          stroke={OUTLINE}
          strokeWidth="5.5"
        />
      </g>

      {/* Hoodie Torso */}
      <rect
        x="-40"
        y="-30"
        width="80"
        height="100"
        rx="18"
        fill={hoodie}
        stroke={OUTLINE}
        strokeWidth="6"
      />
      <line x1="-10" y1="-26" x2="-10" y2="4" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="10" y1="-26" x2="10" y2="4" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />

      {/* Big Clean Round Head */}
      <circle
        cx="0"
        cy="-82"
        r="48"
        fill={skin}
        stroke={OUTLINE}
        strokeWidth="6"
      />
      {/* Spiky Hair */}
      <path
        d="M -46 -92 L -52 -114 L -32 -112 L -28 -138 L -10 -122 L 4 -144 L 18 -122 L 36 -136 L 38 -112 L 54 -112 L 46 -90 Q 0 -112 -46 -92 Z"
        fill="#1E1B24"
        stroke={OUTLINE}
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Face */}
      <g transform="translate(0, -80)">
        <circle
          cx="-17"
          cy="0"
          r="11"
          fill="#FFFFFF"
          stroke={OUTLINE}
          strokeWidth="4.5"
        />
        <circle
          cx="17"
          cy="0"
          r="11"
          fill="#FFFFFF"
          stroke={OUTLINE}
          strokeWidth="4.5"
        />
        <circle cx="-17" cy="2" r="4.5" fill={OUTLINE} />
        <circle cx="17" cy="2" r="4.5" fill={OUTLINE} />
        {mood === "default" && (
          <>
            <path
              d="M -28 -2 A 11 11 0 0 1 -6 -2 Z"
              fill={skin}
              stroke={OUTLINE}
              strokeWidth="4"
            />
            <path
              d="M 6 -2 A 11 11 0 0 1 28 -2 Z"
              fill={skin}
              stroke={OUTLINE}
              strokeWidth="4"
            />
          </>
        )}
        {mood === "angry" ? (
          <rect
            x="-14"
            y="18"
            width="28"
            height="12"
            rx="4"
            fill="#E11D48"
            stroke={OUTLINE}
            strokeWidth="4"
          />
        ) : (
          <path
            d="M -10 20 Q 0 27 10 20"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        )}
      </g>

      {label && (
        <text
          x="0"
          y="202"
          textAnchor="middle"
          fill="#E2E8F0"
          fontSize="24"
          fontWeight="800"
        >
          {label}
        </text>
      )}
    </g>
  );
};

// ============================================================================
// MASTER BOARD: TOP 3 VIRAL HOT-TREND 2D CHARACTERS ON TIKTOK & SHORTS
// ============================================================================
export const CharacterSelectionBoard: React.FC<{
  mode?: "all" | "char1" | "char2" | "char3";
}> = ({ mode = "all" }) => {
  if (mode === "char1") {
    return (
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #1E293B 0%, #0F172A 65%, #060911 100%)",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        <svg width="1920" height="1080">
          <text x="960" y="78" textAnchor="middle" fill="#4ADE80" fontSize="42" fontWeight="900">
            TOP 1 QUỐC TẾ: &quot;MOCHI MẦM XANH&quot; (WHITE BLOB MASCOT — TRIỆU VIEW TIKTOK)
          </text>
          <text x="960" y="122" textAnchor="middle" fill="#CBD5E1" fontSize="25" fontWeight="600">
            Tương phản 100% trên nền tối • Mầm cây trên đầu biến thành Lửa khi giận / Hoa sen khi tỉnh thức
          </text>
          <HotChar01MochiBlob x={300} y={560} scale={1.55} mood="default" label="1. Mặc định đáng yêu" />
          <HotChar01MochiBlob x={740} y={560} scale={1.55} mood="angry" label="2. Bốc hỏa (Mầm hóa lửa)" />
          <HotChar01MochiBlob x={1180} y={560} scale={1.55} mood="scared" label="3. Tan chảy sợ hãi" />
          <HotChar01MochiBlob x={1620} y={560} scale={1.55} mood="awakened" label="4. Nở hoa tỉnh thức" />
        </svg>
      </AbsoluteFill>
    );
  }

  if (mode === "char2") {
    return (
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #271E19 0%, #140F0C 65%, #080605 100%)",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        <svg width="1920" height="1080">
          <text x="960" y="78" textAnchor="middle" fill="#FDE047" fontSize="42" fontWeight="900">
            TOP 1 VIỆT NAM: &quot;THỎ TỈNH BƠ&quot; (PHONG CÁCH THỎ BẢY MÀU / CHIIKAWA / ÉN)
          </text>
          <text x="960" y="122" textAnchor="middle" fill="#CBD5E1" fontSize="25" fontWeight="600">
            Đôi tai dài biểu cảm cực mạnh (dựng đứng khi giận, cụp xuống khi buồn) • Vừa hài vừa thấm
          </text>
          <HotChar02BunnyVN x={300} y={560} scale={1.55} mood="default" label="1. Tỉnh bơ suy ngẫm" />
          <HotChar02BunnyVN x={740} y={560} scale={1.55} mood="angry" label="2. Dựng tai nổi nóng" />
          <HotChar02BunnyVN x={1180} y={560} scale={1.55} mood="scared" label="3. Cụp tai tổn thương" />
          <HotChar02BunnyVN x={1620} y={560} scale={1.55} mood="awakened" label="4. Bình yên thấu hiểu" />
        </svg>
      </AbsoluteFill>
    );
  }

  if (mode === "char3") {
    return (
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #1E1B34 0%, #0F0D1B 65%, #07050C 100%)",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        <svg width="1920" height="1080">
          <text x="960" y="78" textAnchor="middle" fill="#93C5FD" fontSize="42" fontWeight="900">
            TOP 3 KỂ CHUYỆN: &quot;CHÀNG TRAI HOODIE&quot; (PAINT EXPLAINER / @PHATBIEULUNGTUNG)
          </text>
          <text x="960" y="122" textAnchor="middle" fill="#CBD5E1" fontSize="25" fontWeight="600">
            Nhân vật người tối giản mặc Hoodie • Hợp diễn hoạt các tình huống giao tiếp đời thường
          </text>
          <HotChar03HoodieAvatar x={300} y={560} scale={1.55} mood="default" label="1. Đời thường" />
          <HotChar03HoodieAvatar x={740} y={560} scale={1.55} mood="angry" label="2. Phản kháng" />
          <HotChar03HoodieAvatar x={1180} y={560} scale={1.55} mood="scared" label="3. Phòng vệ" />
          <HotChar03HoodieAvatar x={1620} y={560} scale={1.55} mood="awakened" label="4. Điềm tĩnh" />
        </svg>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 45%, #1E1B2E 0%, #0F0D18 68%, #07060C 100%)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <svg width="1920" height="1080">
        <text
          x="960"
          y="66"
          textAnchor="middle"
          fill="#F8FAFC"
          fontSize="42"
          fontWeight="900"
          letterSpacing="1"
        >
          TOP 3 NHÂN VẬT 2D ĐANG HOT NHẤT TRÊN TIKTOK &amp; YOUTUBE SHORTS (2025–2026)
        </text>
        <text
          x="960"
          y="106"
          textAnchor="middle"
          fill="#94A3B8"
          fontSize="24"
          fontWeight="600"
        >
          Kết quả nghiên cứu xu hướng triệu view — Bạn chọn Số 1 (Mochi), Số 2 (Thỏ) hay Số 3 (Hoodie)?
        </text>

        {/* CARD 01: WHITE BLOB MOCHI */}
        <g transform="translate(340, 560)">
          <rect
            x="-265"
            y="-405"
            width="530"
            height="865"
            rx="32"
            fill="#111C24"
            stroke="#4ADE80"
            strokeWidth="6"
          />
          <rect
            x="-150"
            y="-432"
            width="300"
            height="54"
            rx="27"
            fill="#22C55E"
            stroke={OUTLINE}
            strokeWidth="5"
          />
          <text x="0" y="-396" textAnchor="middle" fill={OUTLINE} fontSize="25" fontWeight="900">
            HOT #1 QUỐC TẾ
          </text>

          <HotChar01MochiBlob x={0} y={-85} scale={1.45} mood="default" />

          <HotChar01MochiBlob x={-145} y={235} scale={0.45} mood="angry" />
          <HotChar01MochiBlob x={0} y={235} scale={0.45} mood="scared" />
          <HotChar01MochiBlob x={145} y={235} scale={0.45} mood="awakened" />

          <text x="0" y="385" textAnchor="middle" fill="#4ADE80" fontSize="30" fontWeight="900">
            1. Bé Mochi Mầm Xanh (Blob)
          </text>
          <text x="0" y="422" textAnchor="middle" fill="#CBD5E1" fontSize="20" fontWeight="600">
            Top 1 Faceless TikTok • Trắng nổi bật, mềm dẻo
          </text>
        </g>

        {/* CARD 02: BUNNY VN */}
        <g transform="translate(960, 560)">
          <rect
            x="-265"
            y="-405"
            width="530"
            height="865"
            rx="32"
            fill="#241B16"
            stroke="#F59E0B"
            strokeWidth="6"
          />
          <rect
            x="-150"
            y="-432"
            width="300"
            height="54"
            rx="27"
            fill="#F59E0B"
            stroke={OUTLINE}
            strokeWidth="5"
          />
          <text x="0" y="-396" textAnchor="middle" fill={OUTLINE} fontSize="25" fontWeight="900">
            HOT #1 VIỆT NAM
          </text>

          <HotChar02BunnyVN x={0} y={-75} scale={1.42} mood="default" />

          <HotChar02BunnyVN x={-145} y={235} scale={0.45} mood="angry" />
          <HotChar02BunnyVN x={0} y={235} scale={0.45} mood="scared" />
          <HotChar02BunnyVN x={145} y={235} scale={0.45} mood="awakened" />

          <text x="0" y="385" textAnchor="middle" fill="#FDE047" fontSize="30" fontWeight="900">
            2. Thỏ Tâm Lý Mắt Lờ Đờ
          </text>
          <text x="0" y="422" textAnchor="middle" fill="#CBD5E1" fontSize="20" fontWeight="600">
            Gu khán giả VN • Tai thỏ cụp/dựng theo cảm xúc
          </text>
        </g>

        {/* CARD 03: HOODIE PAINT EXPLAINER */}
        <g transform="translate(1580, 560)">
          <rect
            x="-265"
            y="-405"
            width="530"
            height="865"
            rx="32"
            fill="#15192B"
            stroke="#60A5FA"
            strokeWidth="6"
          />
          <rect
            x="-150"
            y="-432"
            width="300"
            height="54"
            rx="27"
            fill="#3B82F6"
            stroke={OUTLINE}
            strokeWidth="5"
          />
          <text x="0" y="-396" textAnchor="middle" fill="#FFFFFF" fontSize="25" fontWeight="900">
            HOT #3 STORYTIME
          </text>

          <HotChar03HoodieAvatar x={0} y={-75} scale={1.42} mood="default" />

          <HotChar03HoodieAvatar x={-145} y={235} scale={0.45} mood="angry" />
          <HotChar03HoodieAvatar x={0} y={235} scale={0.45} mood="scared" />
          <HotChar03HoodieAvatar x={145} y={235} scale={0.45} mood="awakened" />

          <text x="0" y="385" textAnchor="middle" fill="#93C5FD" fontSize="30" fontWeight="900">
            3. Chàng Trai Hoodie 2D
          </text>
          <text x="0" y="422" textAnchor="middle" fill="#CBD5E1" fontSize="20" fontWeight="600">
            Kiểu Paint Explainer / @phatbieulungtung
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
