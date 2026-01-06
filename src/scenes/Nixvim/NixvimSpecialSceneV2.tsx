import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { SceneProgressBar } from "../../components/SceneProgressBar";

/*
 * Layout checklist:
 * - 3440x1440 scale: +20-30% sizes
 * - No overlaps; keep safe margins
 * - Labels readable on mobile
 * - Tags/lines sit below icon baselines
 * - Recenter remaining element after fades
 * - Keep the sun bright; avoid heavy scrims
 */

const NIX_ORANGE = "#ff9f4a";
const NEON_BLUE = "#7fe8ff";
const ACCENT_GREEN = "#8affcf";
const HOT_PINK = "#ff7eb6";
const LILAC = "#b47cff";
const SOFT_WHITE = "#f7f4ff";

const CENTER_STAGE: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
};

const LAYOUT_CONTAINER: CSSProperties = {
  width: "92%",
  maxWidth: 3200,
  paddingInline: "2%",
  boxSizing: "border-box",
};

const LAYOUT_HEIGHT = {
  tall: "86%",
  mid: "80%",
} as const;

const LAYOUT_TEXT = {
  title: "clamp(150px, 7.6vw, 250px)",
  label: "clamp(56px, 3.9vw, 105px)",
  labelMedium: "clamp(60px, 4.1vw, 100px)",
  labelLarge: "clamp(64px, 4.3vw, 104px)",
  labelXL: "clamp(74px, 4.6vw, 118px)",
  labelSmall: "clamp(44px, 3.1vw, 68px)",
  tag: "clamp(50px, 3.7vw, 90px)",
  tagEmphasis: "clamp(56px, 3.9vw, 94px)",
  configLabel: "clamp(64px, 4.2vw, 104px)",
};

const LAYOUT_ICON = {
  shellDefault: "clamp(400px, 21vw, 700px)",
  titleBadge: "clamp(200px, 9.4vw, 300px)",
  xl: "clamp(480px, 22vw, 700px)",
  lg: "clamp(460px, 21vw, 680px)",
  md: "clamp(430px, 20vw, 660px)",
  sm: "clamp(360px, 18vw, 560px)",
  xs: "clamp(320px, 17vw, 480px)",
  xxl: "clamp(580px, 28vw, 820px)",
  flake: "clamp(540px, 26vw, 820px)",
  neovimLg: "clamp(440px, 22vw, 680px)",
  config: "clamp(520px, 26vw, 780px)",
  configLg: "clamp(580px, 28vw, 840px)",
};

const LAYOUT_SPACING = {
  gapLoose: 110,
  gapWide: 90,
  gapRow: 84,
  gapTight: 60,
  arrowWidth: 640,
  tagPadding: "26px 52px",
  tagPaddingSmall: "22px 48px",
  sectionPadBottom: "7%",
  tagBottom: "7%",
};

const LAYOUT_OFFSETS = {
  unifiedLineBottom: "22%",
  unifiedTagBottom: "4%",
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const fadeInOut = (frame: number, start: number, end: number, fadeIn = 12, fadeOut = 12) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const IconShell: React.FC<{
  size?: number | string;
  accent: string;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ size = LAYOUT_ICON.shellDefault, accent, style, children }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 40,
      background: `linear-gradient(150deg, rgba(10,12,30,0.92), rgba(28,14,56,0.85)), radial-gradient(circle at 20% 20%, ${accent}44, transparent 65%)`,
      border: `1px solid ${accent}66`,
      boxShadow: `0 26px 90px rgba(0,0,0,0.65), 0 0 70px ${accent}99`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

const IconWithLabel: React.FC<{
  label: string;
  accent: string;
  size?: number | string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  children: ReactNode;
}> = ({ label, accent, size, style, labelStyle, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 18,
      ...style,
    }}
  >
    <IconShell size={size} accent={accent}>
      {children}
    </IconShell>
    <div
      style={{
        fontSize: LAYOUT_TEXT.label,
        fontWeight: 600,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: SOFT_WHITE,
        textAlign: "center",
        textShadow: "0 10px 28px rgba(0,0,0,0.5)",
        ...labelStyle,
      }}
    >
      {label}
    </div>
  </div>
);

const TagBadge: React.FC<{ label: string; accent: string; style?: CSSProperties }> = ({ label, accent, style }) => (
  <div
    style={{
      padding: LAYOUT_SPACING.tagPadding,
      borderRadius: 999,
      border: `1px solid ${accent}66`,
      background: "rgba(10,12,30,0.8)",
      fontSize: LAYOUT_TEXT.tag,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: SOFT_WHITE,
      textShadow: "0 8px 22px rgba(0,0,0,0.5)",
      boxShadow: `0 0 30px ${accent}55`,
      ...style,
    }}
  >
    {label}
  </div>
);

const NixHexIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "78%", height: "78%" }}>
    <polygon
      points="50,6 92,26 92,74 50,94 8,74 8,26"
      fill="rgba(255,159,74,0.25)"
      stroke={color}
      strokeWidth="6"
    />
    <text
      x="50"
      y="58"
      textAnchor="middle"
      fontFamily="'JetBrains Mono', 'Fira Code', monospace"
      fontSize="24"
      fill={SOFT_WHITE}
      fontWeight="700"
    >
      NIX
    </text>
  </svg>
);

const NixBlockIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <polygon points="60,10 110,35 60,60 10,35" fill={`${color}33`} stroke={color} strokeWidth="5" />
    <polygon points="10,35 60,60 60,110 10,85" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <polygon points="110,35 60,60 60,110 110,85" fill={`${color}44`} stroke={color} strokeWidth="5" />
  </svg>
);

const NeovimDiamondIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "78%", height: "78%" }}>
    <polygon
      points="50,6 94,50 50,94 6,50"
      fill="rgba(127,232,255,0.16)"
      stroke={color}
      strokeWidth="6"
    />
    <text
      x="50"
      y="58"
      textAnchor="middle"
      fontFamily="'JetBrains Mono', 'Fira Code', monospace"
      fontSize="26"
      fill={SOFT_WHITE}
      fontWeight="700"
    >
      NV
    </text>
  </svg>
);

const LuaStackIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    {[0, 1, 2].map((idx) => (
      <rect
        key={idx}
        x={22 + idx * 8}
        y={24 + idx * 10}
        width={84}
        height={52}
        rx={10}
        fill="rgba(127,232,255,0.14)"
        stroke={color}
        strokeWidth="4"
      />
    ))}
    <line x1="40" y1="48" x2="96" y2="48" stroke={color} strokeWidth="4" />
    <line x1="40" y1="66" x2="90" y2="66" stroke={color} strokeWidth="4" />
  </svg>
);

const NixCheckIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <polygon
      points="60,8 108,32 108,88 60,112 12,88 12,32"
      fill="rgba(255,159,74,0.2)"
      stroke={color}
      strokeWidth="6"
    />
    <polyline
      points="36,64 54,80 84,40"
      fill="none"
      stroke={color}
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GearIcon: React.FC<{ color: string; rotation: number }> = ({ color, rotation }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%", transform: `rotate(${rotation}deg)` }}>
    <circle cx="60" cy="60" r="28" fill="rgba(127,232,255,0.14)" stroke={color} strokeWidth="6" />
    {Array.from({ length: 8 }).map((_, idx) => {
      const angle = (idx / 8) * Math.PI * 2;
      const x = 60 + Math.cos(angle) * 40;
      const y = 60 + Math.sin(angle) * 40;
      return <rect key={idx} x={x - 6} y={y - 6} width={12} height={12} fill={color} rx={3} />;
    })}
  </svg>
);

const PaletteIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <circle cx="60" cy="60" r="36" fill={`${color}22`} stroke={color} strokeWidth="6" />
    <circle cx="44" cy="46" r="6" fill={HOT_PINK} />
    <circle cx="62" cy="38" r="6" fill={LILAC} />
    <circle cx="74" cy="58" r="6" fill={NEON_BLUE} />
    <circle cx="48" cy="72" r="6" fill={ACCENT_GREEN} />
  </svg>
);

const PuzzleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <rect x="26" y="26" width="68" height="68" rx="14" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="60" cy="26" r="10" fill={color} opacity="0.7" />
    <circle cx="94" cy="60" r="10" fill={color} opacity="0.7" />
  </svg>
);

const LuaScriptIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 140" style={{ width: "78%", height: "78%" }}>
    <rect x="22" y="14" width="76" height="108" rx="12" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <polygon points="74,14 98,38 74,38" fill={`${color}55`} />
    <text
      x="60"
      y="88"
      textAnchor="middle"
      fontFamily="'JetBrains Mono', 'Fira Code', monospace"
      fontSize="28"
      fill={SOFT_WHITE}
      fontWeight="700"
    >
      LUA
    </text>
  </svg>
);

const RocketIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 140" style={{ width: "78%", height: "78%" }}>
    <polygon points="60,8 92,46 60,120 28,46" fill={`${color}33`} stroke={color} strokeWidth="5" />
    <circle cx="60" cy="56" r="12" fill={SOFT_WHITE} opacity="0.8" />
    <polygon points="60,120 78,136 60,130 42,136" fill={HOT_PINK} />
  </svg>
);

const ScreenIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <rect x="18" y="18" width="104" height="64" rx="10" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <rect x="56" y="88" width="28" height="10" rx="5" fill={color} />
  </svg>
);

const PackageIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <polygon points="70,16 120,40 70,64 20,40" fill={`${color}33`} stroke={color} strokeWidth="5" />
    <polygon points="20,40 70,64 70,104 20,80" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <polygon points="120,40 70,64 70,104 120,80" fill={`${color}44`} stroke={color} strokeWidth="5" />
  </svg>
);

const FlakeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <g stroke={color} strokeWidth="6" strokeLinecap="round">
      <line x1="60" y1="10" x2="60" y2="110" />
      <line x1="10" y1="60" x2="110" y2="60" />
      <line x1="24" y1="24" x2="96" y2="96" />
      <line x1="96" y1="24" x2="24" y2="96" />
    </g>
  </svg>
);

const ConfigBlob: React.FC<{ label?: string; accent?: string; size?: number | string }> = ({
  label = "Nix config",
  accent = NEON_BLUE,
  size = LAYOUT_ICON.config,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 30% 30%, ${accent}44, transparent 60%), radial-gradient(circle at 70% 70%, ${LILAC}33, transparent 55%), rgba(10,12,30,0.82)`,
      border: `1px solid ${accent}66`,
      boxShadow: `0 30px 90px rgba(0,0,0,0.65), 0 0 60px ${accent}66`,
      display: "grid",
      placeItems: "center",
      color: SOFT_WHITE,
      fontSize: LAYOUT_TEXT.configLabel,
      letterSpacing: 3,
      textTransform: "uppercase",
      fontWeight: 600,
      textAlign: "center",
      lineHeight: 1.05,
      paddingInline: 56,
    }}
  >
    {label}
  </div>
);

const BurstDots: React.FC<{ progress: number; accent: string }> = ({ progress, accent }) => {
  const p = clamp01(progress);
  const opacity = interpolate(p, [0, 0.5, 1], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spread = interpolate(p, [0, 1], [0, 36]);

  return (
    <div
      style={{
        position: "absolute",
        inset: "-20%",
        opacity,
        pointerEvents: "none",
      }}
    >
      {[
        { x: -60, y: -40, size: 10 },
        { x: 60, y: -30, size: 8 },
        { x: -80, y: 40, size: 12 },
        { x: 90, y: 50, size: 14 },
      ].map((dot, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 20px ${accent}`,
            transform: `translate(${dot.x + spread}px, ${dot.y - spread}px)`,
          }}
        />
      ))}
    </div>
  );
};

export const NIXVIM_SPECIAL_V2_DURATION = 990;

export const NixvimSpecialSceneV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t04 = 4 * fps;
  const t09 = 9 * fps;
  const t15 = 15 * fps;
  const t20 = 20 * fps;
  const t25 = 25 * fps;
  const t29 = 29 * fps;
  const t33 = 33 * fps;

  const waveOffset = Math.sin(frame / 40) * 28;
  const waveShift = Math.sin(frame / 70) * 32;

  const headlineOpacity = fadeInOut(frame, 0, t04, 8, 12);
  const headlineText = "Why is Nixvim special";
  const headlineType = Math.max(
    0,
    Math.floor(
      interpolate(frame, [0, Math.round(fps * 1.4)], [0, headlineText.length], {
        extrapolateRight: "clamp",
      }),
    ),
  );
  const headlineTyped = headlineText.slice(0, headlineType);
  const caretOpacity = interpolate(Math.sin(frame / 6), [-1, 1], [0.2, 1]);

  const managedOpacity = fadeInOut(frame, t04, t09, 10, 10);
  const managedPop = spring({ frame: frame - t04, fps, damping: 12, stiffness: 120 });
  const leftX = interpolate(managedPop, [0, 1], [-140, 0], { extrapolateRight: "clamp" });
  const rightX = interpolate(managedPop, [0, 1], [140, 0], { extrapolateRight: "clamp" });
  const arrowProgress = clamp01((frame - (t04 + 10)) / 24);
  const arrowGlow = interpolate(Math.sin(frame / 8), [-1, 1], [0.2, 0.7]);
  const arrowWidth = LAYOUT_SPACING.arrowWidth;

  const defaultsOpacity = fadeInOut(frame, t09, t15, 10, 10);
  const leftExit = clamp01((frame - (t09 + 24)) / 24);
  const leftScale = interpolate(leftExit, [0, 1], [1, 0.7]);
  const leftOpacity = interpolate(leftExit, [0, 1], [1, 0]);
  const defaultsShift = interpolate(leftExit, [0, 0.6, 1], [0, 0, -260]);
  const rightPop = spring({ frame: frame - (t09 + 6), fps, damping: 12, stiffness: 140 });
  const rightScale = interpolate(rightPop, [0, 1], [0.9, 1]);
  const leftBurst = clamp01((frame - (t09 + 22)) / 18);

  const wantOpacity = fadeInOut(frame, t15, t20, 10, 10);
  const wantIconStagger = Math.round(0.85 * fps);
  const wantIconMove = Math.round(0.55 * fps);
  const wantIconFade = Math.round(0.35 * fps);
  const wantBlobRevealStart =
    t15 + wantIconStagger * 2 + wantIconMove + wantIconFade + Math.round(0.1 * fps);
  const wantBlobReveal = clamp01((frame - wantBlobRevealStart) / Math.round(0.4 * fps));
  const wantBlobScale = interpolate(wantBlobReveal, [0, 1], [0.88, 1]);

  const generateOpacity = fadeInOut(frame, t20, t25, 10, 10);
  const blobToLua = clamp01((frame - (t20 + 4)) / 24);
  const luaToRocket = clamp01((frame - (t20 + 60)) / 26);
  const luaHold = clamp01((frame - (t20 + 60)) / 24);
  const blobOpacity = interpolate(blobToLua, [0, 0.6, 1], [1, 0.7, 0]);
  const luaOpacity =
    interpolate(blobToLua, [0.1, 0.9, 1], [0, 1, 1]) *
    interpolate(luaHold, [0, 1], [1, 0]);
  const rocketOpacity = interpolate(luaToRocket, [0.2, 0.8, 1], [0, 1, 1]);
  const rocketY = interpolate(luaToRocket, [0, 1], [80, -180]);
  const generateBurst = clamp01((frame - (t20 + 12)) / 18);

  const unifiedOpacity = fadeInOut(frame, t25, t29, 8, 8);
  const threadProgress = clamp01((frame - t25) / 18);
  const threadGlow = frame * 6;

  const nixifyOpacity = fadeInOut(frame, t29, t33, 8, 8);
  const leftLuaExit = clamp01((frame - (t29 + 12)) / 18);
  const leftLuaX = interpolate(leftLuaExit, [0, 1], [0, -340]);
  const leftLuaScale = interpolate(leftLuaExit, [0, 1], [1, 0.7]);
  const leftLuaOpacity = interpolate(leftLuaExit, [0, 1], [1, 0]);
  const nixifyShift = interpolate(leftLuaExit, [0, 0.6, 1], [0, 0, -480]);
  const nixifyBoost = interpolate(leftLuaExit, [0, 0.6, 1], [1, 1, 1.2]);
  const nixifyPop = spring({ frame: frame - t29, fps, damping: 12, stiffness: 130 });
  const nixifyScale = interpolate(nixifyPop, [0, 1], [0.9, 1]);
  const nixifyPulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.6, 1]);

  return (
    <AbsoluteFill
      style={{
        color: SOFT_WHITE,
        fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <VaporwaveBackground />
      <div
        style={{
          position: "absolute",
          inset: "-12%",
          background:
            "radial-gradient(circle at 20% 20%, rgba(124,255,231,0.22), transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,157,226,0.25), transparent 50%), radial-gradient(circle at 50% 80%, rgba(180,124,255,0.2), transparent 55%)",
          opacity: 0.35,
          transform: `translate(${waveShift}px, ${waveOffset}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          backgroundImage:
            "repeating-linear-gradient(120deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 140px)",
          opacity: 0.18,
          transform: `translateY(${waveOffset}px)`,
        }}
      />

      <div style={{ ...CENTER_STAGE, opacity: headlineOpacity }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
            justifyContent: "center",
            gap: 22,
            padding: "22px 40px",
            maxWidth: "94%",
            borderRadius: 999,
            background: "rgba(8,10,26,0.75)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 30px 90px rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              width: LAYOUT_ICON.titleBadge,
              height: LAYOUT_ICON.titleBadge,
              borderRadius: 30,
              background: "rgba(10,12,30,0.8)",
              border: `1px solid ${NIX_ORANGE}77`,
              boxShadow: `0 0 30px ${NIX_ORANGE}88`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <NixHexIcon color={NIX_ORANGE} />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "nowrap",
              justifyContent: "center",
              whiteSpace: "nowrap",
              fontSize: LAYOUT_TEXT.title,
              fontWeight: 800,
              letterSpacing: 2,
              lineHeight: 1,
              fontFamily: "Arial, Helvetica, sans-serif",
              color: SOFT_WHITE,
            }}
          >
            <span
              style={{
                background: `linear-gradient(100deg, ${SOFT_WHITE} 10%, ${NEON_BLUE} 40%, ${NIX_ORANGE} 70%, ${SOFT_WHITE} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 18px 60px rgba(0,0,0,0.65)",
              }}
            >
              {headlineTyped}
            </span>
            <span
              style={{
                marginLeft: 10,
                color: SOFT_WHITE,
                opacity: caretOpacity,
              }}
            >
              |
            </span>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: managedOpacity }}>
        <div
          style={{
            ...LAYOUT_CONTAINER,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: LAYOUT_SPACING.gapWide,
          }}
        >
          <div style={{ transform: `translateX(${leftX}px)` }}>
            <IconWithLabel label="Nix" accent={NIX_ORANGE} size={LAYOUT_ICON.xl}>
              <NixBlockIcon color={NIX_ORANGE} />
            </IconWithLabel>
          </div>
          <div
            style={{
              flex: "0 0 auto",
              width: arrowWidth,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                fontSize: LAYOUT_TEXT.labelMedium,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.8)",
                textShadow: "0 10px 28px rgba(0,0,0,0.5)",
                whiteSpace: "nowrap",
              }}
            >
              managed by Nix
            </div>
            <div style={{ position: "relative", width: arrowWidth, height: 20 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  width: arrowWidth,
                  height: 20,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${NIX_ORANGE}, ${ACCENT_GREEN})`,
                  transform: `translateY(-50%) scaleX(${arrowProgress})`,
                  transformOrigin: "left",
                  boxShadow: `0 0 30px rgba(255,159,74,${arrowGlow})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${arrowProgress * arrowWidth}px`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 0,
                  height: 0,
                  borderTop: "20px solid transparent",
                  borderBottom: "20px solid transparent",
                  borderLeft: `40px solid ${ACCENT_GREEN}`,
                  opacity: arrowProgress,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,${arrowGlow}), transparent)`,
                  backgroundSize: "200% 100%",
                  backgroundPosition: `${frame * 4}% 0`,
                  opacity: arrowProgress * 0.5,
                }}
              />
            </div>
          </div>
          <div style={{ transform: `translateX(${rightX}px)` }}>
            <IconWithLabel label="Neovim" accent={ACCENT_GREEN} size={LAYOUT_ICON.xl}>
              <NeovimDiamondIcon color={ACCENT_GREEN} />
            </IconWithLabel>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: defaultsOpacity }}>
        <div
          style={{
            ...LAYOUT_CONTAINER,
            paddingBottom: LAYOUT_SPACING.sectionPadBottom,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)",
            gap: LAYOUT_SPACING.gapLoose,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div
              style={{
                fontSize: LAYOUT_TEXT.labelLarge,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                textShadow: "0 8px 24px rgba(0,0,0,0.45)",
              }}
            >
              Lua files
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 32,
                alignItems: "center",
                justifyItems: "center",
                position: "relative",
                opacity: leftOpacity,
                transform: `scale(${leftScale}) translateX(${-leftExit * 40}px)`,
              }}
            >
              <BurstDots progress={leftBurst} accent={NEON_BLUE} />
              {[0, 1, 2].map((idx) => (
                <IconShell
                  key={idx}
                  size={LAYOUT_ICON.sm}
                  accent={NEON_BLUE}
                  style={{
                    transform: `translateY(${Math.sin((frame + idx * 16) / 16) * 8}px)`,
                    gridColumn: idx === 2 ? "1 / -1" : "auto",
                    justifySelf: idx === 2 ? "center" : "stretch",
                  }}
                >
                  <LuaStackIcon color={NEON_BLUE} />
                </IconShell>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 26,
              transform: `translateX(${defaultsShift}px) scale(${rightScale})`,
            }}
          >
            <IconShell size={LAYOUT_ICON.lg} accent={NIX_ORANGE}>
              <NixCheckIcon color={NIX_ORANGE} />
            </IconShell>
            <div
              style={{
                fontSize: LAYOUT_TEXT.labelXL,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                textAlign: "center",
                textShadow: "0 12px 34px rgba(0,0,0,0.5)",
              }}
            >
              Defaults by Nix
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: LAYOUT_SPACING.tagBottom, left: "50%", transform: "translateX(-50%)" }}>
          <TagBadge label="Less manual Lua" accent={NEON_BLUE} />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: wantOpacity }}>
        <div
          style={{
            ...LAYOUT_CONTAINER,
            height: LAYOUT_HEIGHT.tall,
            position: "relative",
          }}
        >
          {[
            {
              label: "Settings",
              accent: NEON_BLUE,
              icon: <GearIcon color={NEON_BLUE} rotation={frame * 4} />,
              startX: -1100,
              startY: -180,
              endX: -860,
              endY: -140,
            },
            {
              label: "Themes",
              accent: HOT_PINK,
              icon: <PaletteIcon color={HOT_PINK} />,
              startX: 0,
              startY: -260,
              endX: 0,
              endY: -200,
            },
            {
              label: "Plugins",
              accent: ACCENT_GREEN,
              icon: <PuzzleIcon color={ACCENT_GREEN} />,
              startX: 1100,
              startY: -180,
              endX: 860,
              endY: -140,
            },
          ].map((item, idx) => {
            const iconStart = t15 + idx * wantIconStagger;
            const appear = spring({ frame: frame - iconStart, fps, damping: 12, stiffness: 130 });
            const moveProgress = clamp01((frame - iconStart) / wantIconMove);
            const fadeProgress = clamp01((frame - (iconStart + wantIconMove)) / wantIconFade);
            const localScale = interpolate(appear, [0, 1], [0.9, 1], { extrapolateRight: "clamp" });
            const hop = interpolate(appear, [0, 1], [50, 0], { extrapolateRight: "clamp" });
            const x = interpolate(moveProgress, [0, 1], [item.startX, item.endX], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(moveProgress, [0, 1], [item.startY, item.endY], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const opacity =
              interpolate(moveProgress, [0, 0.2, 1], [0, 1, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }) *
              interpolate(fadeProgress, [0, 1], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
            return (
              <div
                key={item.label}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "47%",
                  opacity,
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${localScale}) translateY(${hop}px)`,
                }}
              >
                <IconWithLabel label={item.label} accent={item.accent} size={LAYOUT_ICON.md}>
                  {item.icon}
                </IconWithLabel>
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "68%",
              opacity: wantBlobReveal,
              transform: `translate(-50%, -50%) scale(${wantBlobScale})`,
            }}
          >
            <ConfigBlob size={LAYOUT_ICON.config} />
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: generateOpacity }}>
        <div
          style={{
            ...LAYOUT_CONTAINER,
            height: LAYOUT_HEIGHT.tall,
            position: "relative",
            paddingBottom: LAYOUT_SPACING.sectionPadBottom,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              opacity: blobOpacity,
            }}
          >
            <ConfigBlob size={LAYOUT_ICON.configLg} />
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              opacity: luaOpacity,
            }}
          >
            <IconShell size={LAYOUT_ICON.lg} accent={NEON_BLUE}>
              <LuaScriptIcon color={NEON_BLUE} />
            </IconShell>
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translateY(${rocketY}px)`,
              opacity: rocketOpacity,
            }}
          >
            <IconShell size={LAYOUT_ICON.xxl} accent={ACCENT_GREEN}>
              <RocketIcon color={ACCENT_GREEN} />
            </IconShell>
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <BurstDots progress={generateBurst} accent={ACCENT_GREEN} />
          </div>
          <div style={{ position: "absolute", bottom: LAYOUT_SPACING.tagBottom, left: "50%", transform: "translateX(-50%)" }}>
            <TagBadge label="Generated & reproducible" accent={ACCENT_GREEN} />
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: unifiedOpacity }}>
        <div
          style={{
            ...LAYOUT_CONTAINER,
            position: "relative",
            height: LAYOUT_HEIGHT.tall,
            paddingBottom: "20%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "6%",
              right: "6%",
              bottom: LAYOUT_OFFSETS.unifiedLineBottom,
              height: 18,
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${NIX_ORANGE}, ${NEON_BLUE}, ${ACCENT_GREEN})`,
                transform: `scaleX(${threadProgress})`,
                transformOrigin: "left",
                boxShadow: "0 0 30px rgba(255,159,74,0.6)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 999,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                backgroundSize: "200% 100%",
                backgroundPosition: `${threadGlow}% 0`,
                opacity: threadProgress,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: LAYOUT_SPACING.gapRow,
              transform: "translateY(-90px)",
            }}
          >
            <IconWithLabel label="System" accent={NEON_BLUE} size={LAYOUT_ICON.sm}>
              <ScreenIcon color={NEON_BLUE} />
            </IconWithLabel>
            <IconWithLabel label="Env" accent={HOT_PINK} size={LAYOUT_ICON.sm}>
              <PackageIcon color={HOT_PINK} />
            </IconWithLabel>
            <IconWithLabel label="Neovim" accent={ACCENT_GREEN} size={LAYOUT_ICON.sm}>
              <NeovimDiamondIcon color={ACCENT_GREEN} />
            </IconWithLabel>
          </div>
          <div style={{ position: "absolute", bottom: LAYOUT_OFFSETS.unifiedTagBottom, left: "50%", transform: "translateX(-50%)" }}>
            <TagBadge label="Unified in Nix" accent={NIX_ORANGE} />
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: nixifyOpacity }}>
        <div
          style={{
            ...LAYOUT_CONTAINER,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.35fr)",
            gap: LAYOUT_SPACING.gapLoose,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 30,
              transform: `translateX(${leftLuaX}px) scale(${leftLuaScale})`,
              opacity: leftLuaOpacity,
            }}
          >
            <div
              style={{
                fontSize: LAYOUT_TEXT.labelSmall,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                textShadow: "0 8px 24px rgba(0,0,0,0.45)",
              }}
            >
              Lua script list
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 28,
                alignItems: "center",
                justifyItems: "center",
              }}
            >
              {[0, 1, 2].map((idx) => (
                <IconShell
                  key={idx}
                  size={LAYOUT_ICON.xs}
                  accent={NEON_BLUE}
                  style={{
                    gridColumn: idx === 2 ? "1 / -1" : "auto",
                    justifySelf: idx === 2 ? "center" : "stretch",
                  }}
                >
                  <LuaStackIcon color={NEON_BLUE} />
                </IconShell>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 30,
              alignItems: "center",
              transform: `translateX(${nixifyShift}px) scale(${nixifyScale * nixifyBoost})`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <IconShell size={LAYOUT_ICON.flake} accent={NIX_ORANGE}>
                <FlakeIcon color={NIX_ORANGE} />
              </IconShell>
              <IconShell size={LAYOUT_ICON.neovimLg} accent={ACCENT_GREEN}>
                <NeovimDiamondIcon color={ACCENT_GREEN} />
              </IconShell>
            </div>
            <div
              style={{
                fontSize: LAYOUT_TEXT.tagEmphasis,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: SOFT_WHITE,
                background: `linear-gradient(90deg, ${HOT_PINK}, ${LILAC})`,
                padding: LAYOUT_SPACING.tagPaddingSmall,
                borderRadius: 999,
                boxShadow: `0 0 40px rgba(255,126,182,${0.4 * nixifyPulse})`,
                opacity: nixifyPulse,
              }}
            >
              Nixified Lua
            </div>
          </div>
        </div>
      </div>

      <SceneProgressBar />
    </AbsoluteFill>
  );
};
