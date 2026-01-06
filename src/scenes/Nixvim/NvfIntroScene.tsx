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
const NEOVIM_GREEN = "#8affcf";
const LUA_BLUE = "#6fb6ff";
const SOFT_WHITE = "#f7f4ff";
const NEUTRAL_BLUE = "#7fe8ff";

const BASE_WIDTH = 3440;

const BASE_LAYOUT = {
  container: {
    width: "92%",
    maxWidth: 3200,
    paddingInline: "2%",
    boxSizing: "border-box",
  } as CSSProperties,
  text: {
    title: 200,
    subtitle: 70,
    label: 90,
    labelSmall: 66,
    caption: 56,
    tag: 72,
  },
  icon: {
    xxl: 640,
    xl: 560,
    lg: 480,
    md: 380,
    sm: 300,
    xs: 240,
  },
  spacing: {
    gapWide: 140,
    gapLoose: 110,
    gapTight: 70,
  },
  padding: {
    titleX: 56,
    titleY: 22,
    tagX: 50,
    tagY: 20,
  },
};

const CENTER_STAGE: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const fadeInOut = (frame: number, start: number, end: number, fadeIn = 10, fadeOut = 10) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const IconShell: React.FC<{
  size: number | string;
  accent: string;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ size, accent, style, children }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 36,
      background: `linear-gradient(150deg, rgba(10,12,30,0.92), rgba(28,14,56,0.85)), radial-gradient(circle at 20% 20%, ${accent}44, transparent 65%)`,
      border: `1px solid ${accent}66`,
      boxShadow: `0 26px 90px rgba(0,0,0,0.6), 0 0 70px ${accent}88`,
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
  labelSize: number;
  accent: string;
  size: number | string;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ label, labelSize, accent, size, style, children }) => (
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
        fontSize: labelSize,
        fontWeight: 600,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: SOFT_WHITE,
        textAlign: "center",
        textShadow: "0 10px 26px rgba(0,0,0,0.45)",
      }}
    >
      {label}
    </div>
  </div>
);

const TagBadge: React.FC<{
  label: string;
  accent: string;
  fontSize: number;
  paddingX: number;
  paddingY: number;
}> = ({ label, accent, fontSize, paddingX, paddingY }) => (
  <div
    style={{
      padding: `${paddingY}px ${paddingX}px`,
      borderRadius: 999,
      border: `1px solid ${accent}66`,
      background: "rgba(10,12,30,0.8)",
      fontSize,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: SOFT_WHITE,
      textShadow: "0 8px 22px rgba(0,0,0,0.5)",
      boxShadow: `0 0 30px ${accent}55`,
    }}
  >
    {label}
  </div>
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
    <polygon points="50,6 94,50 50,94 6,50" fill="rgba(138,255,207,0.18)" stroke={color} strokeWidth="6" />
    <text
      x="50"
      y="58"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="26"
      fill={SOFT_WHITE}
      fontWeight="700"
    >
      NV
    </text>
  </svg>
);

const GearIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <circle cx="60" cy="60" r="26" fill={`${color}22`} stroke={color} strokeWidth="6" />
    {[0, 60, 120, 180, 240, 300].map((deg) => (
      <rect
        key={deg}
        x="56"
        y="6"
        width="8"
        height="22"
        rx="4"
        fill={color}
        transform={`rotate(${deg} 60 60)`}
      />
    ))}
  </svg>
);

const CommandIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <rect x="18" y="24" width="104" height="72" rx="14" fill={`${color}18`} stroke={color} strokeWidth="5" />
    <text
      x="48"
      y="70"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="28"
      fill={SOFT_WHITE}
      fontWeight="700"
    >
      &gt;_
    </text>
  </svg>
);

const PackageIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <polygon points="70,16 120,40 70,64 20,40" fill={`${color}33`} stroke={color} strokeWidth="5" />
    <polygon points="20,40 70,64 70,104 20,80" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <polygon points="120,40 70,64 70,104 120,80" fill={`${color}44`} stroke={color} strokeWidth="5" />
  </svg>
);

const SliderIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    {[32, 60, 88].map((y, idx) => (
      <g key={y}>
        <line x1="20" y1={y} x2="100" y2={y} stroke={color} strokeWidth="6" strokeLinecap="round" />
        <circle cx={idx === 0 ? 44 : idx === 1 ? 72 : 56} cy={y} r="10" fill={`${color}55`} stroke={color} strokeWidth="4" />
      </g>
    ))}
  </svg>
);

const PaletteIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <circle cx="60" cy="60" r="36" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="44" cy="50" r="6" fill={color} />
    <circle cx="70" cy="44" r="6" fill={color} />
    <circle cx="76" cy="68" r="6" fill={color} />
  </svg>
);

const ServerIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <rect x="24" y="26" width="72" height="28" rx="8" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <rect x="24" y="66" width="72" height="28" rx="8" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="38" cy="40" r="4" fill={color} />
    <circle cx="38" cy="80" r="4" fill={color} />
  </svg>
);

const PuzzleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <rect x="26" y="26" width="68" height="68" rx="14" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="60" cy="26" r="10" fill={color} opacity="0.7" />
    <circle cx="94" cy="60" r="10" fill={color} opacity="0.7" />
  </svg>
);

const LoopArrowIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <circle cx="60" cy="60" r="36" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <path d="M40 54 L60 40 L80 54" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <path d="M80 66 L60 80 L40 66" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const GlobeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <circle cx="60" cy="60" r="36" fill={`${color}18`} stroke={color} strokeWidth="5" />
    <ellipse cx="60" cy="60" rx="20" ry="36" fill="none" stroke={color} strokeWidth="4" />
    <line x1="24" y1="60" x2="96" y2="60" stroke={color} strokeWidth="4" />
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

const RocketIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <path d="M60 10 L86 70 L60 88 L34 70 Z" fill={`${color}33`} stroke={color} strokeWidth="5" />
    <circle cx="60" cy="58" r="10" fill={`${color}55`} stroke={color} strokeWidth="4" />
    <path d="M60 88 L68 108 L60 100 L52 108 Z" fill="#ffbf6b" />
  </svg>
);

export const NVF_INTRO_DURATION = 25 * 30;

export const NvfIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const scale = width / BASE_WIDTH;
  const scaleValue = (value: number) => value * scale;

  const layout = {
    container: {
      ...BASE_LAYOUT.container,
      maxWidth: scaleValue(BASE_LAYOUT.container.maxWidth),
    },
    text: {
      title: scaleValue(BASE_LAYOUT.text.title),
      subtitle: scaleValue(BASE_LAYOUT.text.subtitle),
      label: scaleValue(BASE_LAYOUT.text.label),
      labelSmall: scaleValue(BASE_LAYOUT.text.labelSmall),
      caption: scaleValue(BASE_LAYOUT.text.caption),
      tag: scaleValue(BASE_LAYOUT.text.tag),
    },
    icon: {
      xxl: scaleValue(BASE_LAYOUT.icon.xxl),
      xl: scaleValue(BASE_LAYOUT.icon.xl),
      lg: scaleValue(BASE_LAYOUT.icon.lg),
      md: scaleValue(BASE_LAYOUT.icon.md),
      sm: scaleValue(BASE_LAYOUT.icon.sm),
      xs: scaleValue(BASE_LAYOUT.icon.xs),
    },
    spacing: {
      gapWide: scaleValue(BASE_LAYOUT.spacing.gapWide),
      gapLoose: scaleValue(BASE_LAYOUT.spacing.gapLoose),
      gapTight: scaleValue(BASE_LAYOUT.spacing.gapTight),
    },
    padding: {
      titleX: scaleValue(BASE_LAYOUT.padding.titleX),
      titleY: scaleValue(BASE_LAYOUT.padding.titleY),
      tagX: scaleValue(BASE_LAYOUT.padding.tagX),
      tagY: scaleValue(BASE_LAYOUT.padding.tagY),
    },
  };

  const t03 = 3 * fps;
  const t08 = 8 * fps;
  const t13 = 13 * fps;
  const t18 = 18 * fps;
  const t25 = 25 * fps;

  const waveOffset = Math.sin(frame / 40) * scaleValue(24);
  const waveShift = Math.sin(frame / 70) * scaleValue(28);

  const titleOpacity = fadeInOut(frame, 0, t03, 6, 8);
  const subtitleOpacity = interpolate(frame, [12, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nvfPop = spring({ frame, fps, damping: 12, stiffness: 160 });
  const nvfScale = interpolate(nvfPop, [0, 1], [0.82, 1]);
  const words = ["NVF", "-", "Nix", "Vim", "Framework"];

  const philosophyOpacity = fadeInOut(frame, t03, t08, 8, 10);
  const philosophyPop = spring({ frame: frame - t03, fps, damping: 12, stiffness: 140 });
  const leftSlide = interpolate(philosophyPop, [0, 1], [-scaleValue(180), 0], { extrapolateRight: "clamp" });
  const rightSlide = interpolate(philosophyPop, [0, 1], [scaleValue(180), 0], { extrapolateRight: "clamp" });
  const arcProgress = clamp01((frame - (t03 + 10)) / 20);

  const orbitOpacity = fadeInOut(frame, t08, t13, 8, 10);
  const orbitRadiusX = scaleValue(360);
  const orbitRadiusY = scaleValue(220);
  const orbitAngle = (frame - t08) * 0.04;
  const orbitCaptionOpacity = interpolate(frame, [t08 + Math.round(fps * 0.8), t08 + Math.round(fps * 1.2)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const qualitiesOpacity = fadeInOut(frame, t13, t18, 8, 10);

  const unifiedOpacity = fadeInOut(frame, t18, t25, 8, 10);
  const flowProgress = clamp01((frame - (t18 + 8)) / 26);
  const arrowProgress = clamp01((frame - (t18 + 12)) / 22);
  const flakePulse = interpolate(Math.sin(frame / 9), [-1, 1], [0.96, 1.05]);

  const flowWidth = scaleValue(2200);
  const flowHeight = scaleValue(760);
  const centerX = flowWidth * 0.5;
  const centerY = flowHeight * 0.52;
  const rocketX = centerX + scaleValue(520);
  const rocketY = centerY;

  const inputs = [
    { label: "Config", icon: <CommandIcon color={NEUTRAL_BLUE} />, color: NEUTRAL_BLUE, start: [0.12, 0.2], end: [0.34, 0.3] },
    { label: "Themes", icon: <PaletteIcon color={NEUTRAL_BLUE} />, color: NEUTRAL_BLUE, start: [0.16, 0.44], end: [0.3, 0.5] },
    { label: "Plugins", icon: <PackageIcon color={NEUTRAL_BLUE} />, color: NEUTRAL_BLUE, start: [0.2, 0.66], end: [0.34, 0.7] },
    { label: "LSP", icon: <ServerIcon color={NEUTRAL_BLUE} />, color: NEUTRAL_BLUE, start: [0.32, 0.18], end: [0.46, 0.3] },
    { label: "Lazy", icon: <SliderIcon color={NEUTRAL_BLUE} />, color: NEUTRAL_BLUE, start: [0.36, 0.66], end: [0.46, 0.7] },
  ];

  const qualities = [
    { label: "Modular", icon: <PuzzleIcon color={NEUTRAL_BLUE} />, accent: NEUTRAL_BLUE },
    { label: "Reproducible", icon: <LoopArrowIcon color={NEUTRAL_BLUE} />, accent: NEUTRAL_BLUE },
    { label: "Portable", icon: <GlobeIcon color={NEUTRAL_BLUE} />, accent: NEUTRAL_BLUE },
    { label: "Configurable", icon: <GearIcon color={NEUTRAL_BLUE} />, accent: NEUTRAL_BLUE },
  ];

  return (
    <AbsoluteFill
      style={{
        color: SOFT_WHITE,
        fontFamily: "Arial, Helvetica, sans-serif",
        overflow: "hidden",
      }}
    >
      <VaporwaveBackground />
      <div
        style={{
          position: "absolute",
          inset: "-12%",
          background:
            "radial-gradient(circle at 20% 20%, rgba(124,255,231,0.18), transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,157,226,0.2), transparent 50%), radial-gradient(circle at 50% 80%, rgba(180,124,255,0.18), transparent 55%)",
          opacity: 0.35,
          transform: `translate(${waveShift}px, ${waveOffset}px)`,
        }}
      />

      <div style={{ ...CENTER_STAGE, opacity: titleOpacity }}>
        <div
          style={{
            padding: `${layout.padding.titleY}px ${layout.padding.titleX}px`,
            borderRadius: 999,
            background: "rgba(8,10,26,0.78)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 26px 90px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontSize: layout.text.title,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              textShadow: "0 14px 40px rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
            }}
          >
            {words.map((word, idx) => {
              const delay = idx * 4;
              const wordOpacity = interpolate(frame, [delay, delay + 8], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const isNvf = word === "NVF";
              return (
                <span
                  key={`${word}-${idx}`}
                  style={{
                    opacity: wordOpacity,
                    transform: isNvf ? `scale(${nvfScale})` : undefined,
                    display: "inline-block",
                    background: isNvf
                      ? `linear-gradient(100deg, ${SOFT_WHITE} 10%, ${NEOVIM_GREEN} 45%, ${NIX_ORANGE} 80%, ${SOFT_WHITE} 90%)`
                      : undefined,
                    WebkitBackgroundClip: isNvf ? "text" : undefined,
                    WebkitTextFillColor: isNvf ? "transparent" : undefined,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
          <div
            style={{
              marginTop: scaleValue(16),
              fontSize: layout.text.subtitle,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
              textAlign: "center",
              opacity: subtitleOpacity,
            }}
          >
            Unified Nix Neovim config
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: philosophyOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: layout.spacing.gapWide,
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", transform: `translateX(${leftSlide}px)` }}>
            <IconShell size={layout.icon.lg} accent={NIX_ORANGE}>
              <NixBlockIcon color={NIX_ORANGE} />
            </IconShell>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: layout.text.labelSmall,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: SOFT_WHITE,
                textShadow: "0 10px 26px rgba(0,0,0,0.5)",
              }}
            >
              Nix-first philosophy
            </div>
            <svg
              viewBox="0 0 360 140"
              style={{ width: scaleValue(420), height: scaleValue(160), margin: "0 auto" }}
            >
              <path
                d="M20 110 C120 20 240 20 340 110"
                fill="none"
                stroke={NIX_ORANGE}
                strokeWidth="8"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - arcProgress}
              />
            </svg>
            <div
              style={{
                fontSize: layout.text.caption,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Everything configured in Nix
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", transform: `translateX(${rightSlide}px)` }}>
            <IconShell size={layout.icon.lg} accent={NEOVIM_GREEN}>
              <NeovimDiamondIcon color={NEOVIM_GREEN} />
            </IconShell>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: orbitOpacity }}>
        <div style={{ position: "relative", width: scaleValue(1200), height: scaleValue(760) }}>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
            <IconShell size={layout.icon.xl} accent={NIX_ORANGE}>
              <CommandIcon color={NIX_ORANGE} />
            </IconShell>
          </div>
          {[
            { label: "Plugins", icon: <PackageIcon color={NEUTRAL_BLUE} />, angle: 0 },
            { label: "Options", icon: <SliderIcon color={NEUTRAL_BLUE} />, angle: Math.PI / 2 },
            { label: "Themes", icon: <PaletteIcon color={NEUTRAL_BLUE} />, angle: Math.PI },
            { label: "LSP", icon: <ServerIcon color={NEUTRAL_BLUE} />, angle: (Math.PI * 3) / 2 },
          ].map((item, idx) => {
            const angle = orbitAngle + item.angle;
            const x = Math.cos(angle) * orbitRadiusX;
            const y = Math.sin(angle) * orbitRadiusY;
            return (
              <div
                key={`${item.label}-${idx}`}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                }}
              >
                <IconWithLabel
                  label={item.label}
                  labelSize={layout.text.labelSmall}
                  accent={NEUTRAL_BLUE}
                  size={layout.icon.sm}
                >
                  {item.icon}
                </IconWithLabel>
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              bottom: scaleValue(40),
              left: "50%",
              transform: "translateX(-50%)",
              opacity: orbitCaptionOpacity,
            }}
          >
            <TagBadge
              label="Lua optional"
              accent={LUA_BLUE}
              fontSize={layout.text.caption}
              paddingX={layout.padding.tagX}
              paddingY={layout.padding.tagY}
            />
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: qualitiesOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: layout.spacing.gapLoose,
          }}
        >
          {qualities.map((item, idx) => {
            const pop = spring({ frame: frame - (t13 + idx * 6), fps, damping: 12, stiffness: 150 });
            const scale = interpolate(pop, [0, 1], [0.86, 1], { extrapolateRight: "clamp" });
            const lift = interpolate(pop, [0, 1], [scaleValue(40), 0], { extrapolateRight: "clamp" });
            return (
              <div key={item.label} style={{ transform: `translateY(${lift}px) scale(${scale})` }}>
                <IconWithLabel label={item.label} labelSize={layout.text.labelSmall} accent={item.accent} size={layout.icon.sm}>
                  {item.icon}
                </IconWithLabel>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: unifiedOpacity }}>
        <div style={{ position: "relative", width: flowWidth, height: flowHeight }}>
          <svg
            viewBox={`0 0 ${flowWidth} ${flowHeight}`}
            style={{ position: "absolute", inset: 0 }}
          >
            {inputs.map((item) => {
              const startX = item.start[0] * flowWidth;
              const startY = item.start[1] * flowHeight;
              return (
                <line
                  key={`${item.label}-line`}
                  x1={startX}
                  y1={startY}
                  x2={centerX}
                  y2={centerY}
                  stroke={NIX_ORANGE}
                  strokeWidth={scaleValue(6)}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - flowProgress}
                  opacity={0.4}
                />
              );
            })}
          </svg>

          {inputs.map((item) => {
            const startX = item.start[0] * flowWidth;
            const startY = item.start[1] * flowHeight;
            const endX = item.end[0] * flowWidth;
            const endY = item.end[1] * flowHeight;
            const x = interpolate(flowProgress, [0, 1], [startX, endX], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(flowProgress, [0, 1], [startY, endY], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const iconOpacity = interpolate(flowProgress, [0, 0.8, 1], [1, 1, 0.7]);
            return (
              <div
                key={item.label}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                  opacity: iconOpacity,
                }}
              >
                <IconShell size={layout.icon.xs} accent={item.color}>
                  {item.icon}
                </IconShell>
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              left: centerX,
              top: centerY,
              transform: `translate(-50%, -50%) scale(${flakePulse})`,
            }}
          >
            <IconShell size={layout.icon.lg} accent={NIX_ORANGE}>
              <FlakeIcon color={NIX_ORANGE} />
            </IconShell>
          </div>

          <div
            style={{
              position: "absolute",
              left: centerX,
              top: centerY,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                width: rocketX - centerX - layout.icon.lg * 0.35,
                height: scaleValue(10),
                transform: `translateY(-50%) scaleX(${arrowProgress})`,
                transformOrigin: "left",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${NIX_ORANGE}, ${NEOVIM_GREEN})`,
                boxShadow: "0 0 24px rgba(255,159,74,0.45)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: (rocketX - centerX - layout.icon.lg * 0.35) * arrowProgress,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 0,
                height: 0,
                borderTop: `${scaleValue(10)}px solid transparent`,
                borderBottom: `${scaleValue(10)}px solid transparent`,
                borderLeft: `${scaleValue(18)}px solid ${NEOVIM_GREEN}`,
                opacity: arrowProgress,
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: rocketX,
              top: rocketY,
              transform: "translate(-50%, -50%)",
            }}
          >
            <IconShell size={layout.icon.lg} accent={NEOVIM_GREEN}>
              <RocketIcon color={NEOVIM_GREEN} />
            </IconShell>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: scaleValue(80),
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <TagBadge
            label="Unified Nix config to Neovim"
            accent={NIX_ORANGE}
            fontSize={layout.text.caption}
            paddingX={layout.padding.tagX}
            paddingY={layout.padding.tagY}
          />
        </div>
      </div>

      <SceneProgressBar />
    </AbsoluteFill>
  );
};
