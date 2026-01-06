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
const NEUTRAL_BLUE = "#7fe8ff";
const SOFT_WHITE = "#f7f4ff";

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


const TreeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <line x1="60" y1="20" x2="60" y2="100" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <line x1="60" y1="44" x2="30" y2="64" stroke={color} strokeWidth="5" strokeLinecap="round" />
    <line x1="60" y1="44" x2="90" y2="64" stroke={color} strokeWidth="5" strokeLinecap="round" />
    <circle cx="60" cy="20" r="8" fill={`${color}55`} stroke={color} strokeWidth="4" />
    <circle cx="30" cy="64" r="8" fill={`${color}33`} stroke={color} strokeWidth="4" />
    <circle cx="90" cy="64" r="8" fill={`${color}33`} stroke={color} strokeWidth="4" />
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

const LuaScriptIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 140" style={{ width: "78%", height: "78%" }}>
    <rect x="22" y="14" width="76" height="108" rx="12" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <polygon points="74,14 98,38 74,38" fill={`${color}55`} />
    <text
      x="60"
      y="88"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="28"
      fill={SOFT_WHITE}
      fontWeight="700"
    >
      LUA
    </text>
  </svg>
);

const CommandIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <rect x="18" y="24" width="104" height="72" rx="14" fill={`${color}18`} stroke={color} strokeWidth="5" />
    <text
      x="50"
      y="72"
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


const DoorIcon: React.FC<{ color: string; open: number }> = ({ color, open }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <rect x="20" y="18" width="80" height="84" rx="12" fill={`${color}14`} stroke={color} strokeWidth="5" />
    <g transform={`translate(24,22)`}>
      <rect
        x="0"
        y="0"
        width="56"
        height="76"
        rx="10"
        fill={`${color}33`}
        stroke={color}
        strokeWidth="4"
        transform={`rotate(${-55 * open} 0 38)`}
      />
      <circle cx="40" cy="40" r="4" fill={color} />
    </g>
  </svg>
);

const HomeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <path d="M20 60 L60 24 L100 60" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <rect x="30" y="60" width="60" height="40" rx="8" fill={`${color}22`} stroke={color} strokeWidth="5" />
  </svg>
);

const TerminalIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <rect x="18" y="24" width="104" height="72" rx="14" fill={`${color}18`} stroke={color} strokeWidth="5" />
    <path d="M38 58 L54 70" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <line x1="62" y1="70" x2="90" y2="70" stroke={color} strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const WrenchIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <path
      d="M30 30 L52 52 L90 14"
      fill="none"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
    />
    <circle cx="52" cy="52" r="10" fill={`${color}33`} stroke={color} strokeWidth="4" />
    <path d="M52 52 L90 90" stroke={color} strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const NvBox: React.FC<{ label: string; size: number; accent: string }> = ({ label, size, accent }) => (
  <div
    style={{
      width: size,
      height: size * 0.7,
      borderRadius: 24,
      border: `1px solid ${accent}66`,
      background: "rgba(10,12,30,0.8)",
      boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 40px ${accent}55`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.22,
      fontWeight: 700,
      letterSpacing: 2,
      color: SOFT_WHITE,
      textTransform: "uppercase",
    }}
  >
    {label}
  </div>
);

export const NVF_ADVANTAGES_DURATION = 60 * 30;

export const NvfAdvantagesScene: React.FC = () => {
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

  const t06 = 6 * fps;
  const t12 = 12 * fps;
  const t23 = 23 * fps;
  const t31 = 31 * fps;
  const t41 = 41 * fps;
  const t50 = 50 * fps;
  const t59 = 59 * fps;

  const waveOffset = Math.sin(frame / 40) * scaleValue(24);
  const waveShift = Math.sin(frame / 70) * scaleValue(28);

  const declarativeOpacity = fadeInOut(frame, 0, t06, 8, 8);
  const declarativePop = spring({ frame, fps, damping: 12, stiffness: 140 });
  const leftSlide = interpolate(declarativePop, [0, 1], [-scaleValue(160), 0], { extrapolateRight: "clamp" });
  const rightSlide = interpolate(declarativePop, [0, 1], [scaleValue(160), 0], { extrapolateRight: "clamp" });
  const lineProgress = clamp01((frame - Math.round(fps * 0.6)) / 18);

  const advantagesOpacity = fadeInOut(frame, t06, t12, 8, 8);
  const titlePop = spring({ frame: frame - t06, fps, damping: 12, stiffness: 160 });
  const titleScale = interpolate(titlePop, [0, 1], [0.92, 1]);
  const titlePulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.95, 1.05]);
  const titleWords = ["NVF", "-", "Key", "Advantages"];

  const nixFirstOpacity = fadeInOut(frame, t12, t23, 8, 8);
  const nixGlow = interpolate(Math.sin(frame / 9), [-1, 1], [0.3, 0.7]);
  const arrowProgress = clamp01((frame - (t12 + 8)) / 18);
  const luaArrowProgress = clamp01((frame - (t12 + 12)) / 18);
  const hubPulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.96, 1.04]);
  const hubWidth = scaleValue(2400);
  const hubHeight = scaleValue(680);
  const hubX = hubWidth * 0.5;
  const hubY = hubHeight * 0.5;
  const leftX = hubWidth * 0.18;
  const rightX = hubWidth * 0.82;
  const leftY = hubHeight * 0.44;
  const rightY = hubHeight * 0.6;
  const hubInset = layout.icon.md * 0.45;
  const orbitAngle = (frame - t12) * 0.04;

  const modularOpacity = fadeInOut(frame, t23, t31, 8, 8);

  const reproducibleOpacity = fadeInOut(frame, t31, t41, 8, 8);
  const travelProgress = clamp01((frame - (t31 + 8)) / 26);

  const lazyOpacity = fadeInOut(frame, t41, t50, 8, 8);
  const doorOpen = clamp01((frame - (t41 + 10)) / 18);

  const flexibleOpacity = fadeInOut(frame, t50, t59, 8, 8);
  const sourceProgress = clamp01((frame - (t50 + 8)) / 20);
  const deployPop = spring({ frame: frame - (t50 + 26), fps, damping: 12, stiffness: 140 });
  const deployScale = interpolate(deployPop, [0, 1], [0.9, 1]);

  const sourceIcons = [
    { label: "nixpkgs", icon: <PackageIcon color={NEUTRAL_BLUE} /> },
    { label: "flake inputs", icon: <FlakeIcon color={NEUTRAL_BLUE} /> },
    { label: "custom sources", icon: <WrenchIcon color={NEUTRAL_BLUE} /> },
  ];

  const deploymentIcons = [
    { label: "nix run", icon: <TerminalIcon color={NEUTRAL_BLUE} /> },
    { label: "Home Manager", icon: <HomeIcon color={NEUTRAL_BLUE} /> },
    { label: "NixOS", icon: <GearIcon color={NEUTRAL_BLUE} /> },
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

      <div style={{ ...CENTER_STAGE, opacity: declarativeOpacity }}>
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
            <IconWithLabel label="Nix" labelSize={layout.text.labelSmall} accent={NIX_ORANGE} size={layout.icon.lg}>
              <NixBlockIcon color={NIX_ORANGE} />
            </IconWithLabel>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: scaleValue(380),
                height: scaleValue(12),
                margin: "0 auto",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${NIX_ORANGE}, ${NEOVIM_GREEN})`,
                transform: `scaleX(${lineProgress})`,
                transformOrigin: "left",
                boxShadow: `0 0 24px rgba(255,159,74,0.4)`,
              }}
            />
            <div
              style={{
                marginTop: scaleValue(16),
                fontSize: layout.text.caption,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Declarative in Nix
            </div>
            <div
              style={{
                marginTop: scaleValue(12),
                fontSize: layout.text.caption,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              One declarative format
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", transform: `translateX(${rightSlide}px)` }}>
            <IconWithLabel
              label="Editor config"
              labelSize={layout.text.labelSmall}
              accent={NEOVIM_GREEN}
              size={layout.icon.lg}
            >
              <TreeIcon color={NEOVIM_GREEN} />
            </IconWithLabel>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: advantagesOpacity }}>
        <div
          style={{
            transform: `scale(${titleScale})`,
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
              gap: 14,
              fontSize: layout.text.title,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              textShadow: "0 14px 40px rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
            }}
          >
            {titleWords.map((word, idx) => {
              const delay = t06 + idx * 4;
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
                    display: "inline-block",
                    transform: isNvf ? `scale(${titlePulse})` : undefined,
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
            <div
              style={{
                marginLeft: scaleValue(12),
                transform: `scale(${titlePulse})`,
              }}
            >
              <IconShell size={layout.icon.xs} accent={NIX_ORANGE}>
                <NixBlockIcon color={NIX_ORANGE} />
              </IconShell>
            </div>
          </div>
          <div
            style={{
              marginTop: scaleValue(18),
              width: scaleValue(1500),
              height: scaleValue(10),
              borderRadius: 999,
              background: `linear-gradient(90deg, ${NIX_ORANGE}, ${NEUTRAL_BLUE}, ${NEOVIM_GREEN})`,
              boxShadow: `0 0 30px rgba(127,232,255,${0.35 * titlePulse})`,
              transform: `scaleX(${titlePulse})`,
              transformOrigin: "center",
            }}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: nixFirstOpacity }}>
        <div style={{ position: "relative", width: hubWidth, height: hubHeight }}>
          <svg
            viewBox={`0 0 ${hubWidth} ${hubHeight}`}
            style={{ position: "absolute", inset: 0, zIndex: 0 }}
          >
            <path
              d={`M ${leftX + layout.icon.lg * 0.45} ${leftY} C ${leftX + scaleValue(260)} ${
                leftY - scaleValue(160)
              } ${hubX - scaleValue(320)} ${hubY - scaleValue(160)} ${hubX - hubInset} ${
                hubY - scaleValue(40)
              }`}
              fill="none"
              stroke={NIX_ORANGE}
              strokeWidth={scaleValue(8)}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - arrowProgress}
              opacity={0.6}
            />
            <path
              d={`M ${rightX - layout.icon.sm * 0.45} ${rightY} C ${rightX - scaleValue(260)} ${
                rightY + scaleValue(160)
              } ${hubX + scaleValue(320)} ${hubY + scaleValue(160)} ${hubX + hubInset} ${
                hubY + scaleValue(40)
              }`}
              fill="none"
              stroke={LUA_BLUE}
              strokeWidth={scaleValue(6)}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - luaArrowProgress}
              opacity={0.5}
            />
          </svg>

          <div
            style={{
              position: "absolute",
              left: leftX,
              top: leftY,
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}
          >
            <IconWithLabel label="Nix" labelSize={layout.text.labelSmall} accent={NIX_ORANGE} size={layout.icon.lg}>
              <NixBlockIcon color={NIX_ORANGE} />
            </IconWithLabel>
          </div>

          <div
            style={{
              position: "absolute",
              left: hubX,
              top: hubY,
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}
          >
            <div style={{ transform: `scale(${hubPulse})` }}>
              <IconShell size={layout.icon.md} accent={NEOVIM_GREEN}>
                <CommandIcon color={NEOVIM_GREEN} />
              </IconShell>
            </div>
            <div
              style={{
                marginTop: scaleValue(18),
                fontSize: layout.text.caption,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
              }}
            >
              Config hub
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: rightX,
              top: rightY,
              transform: "translate(-50%, -50%)",
              zIndex: 2,
              opacity: 0.85,
            }}
          >
            <IconWithLabel
              label="Lua (optional)"
              labelSize={layout.text.caption}
              accent={LUA_BLUE}
              size={layout.icon.sm}
            >
              <LuaScriptIcon color={LUA_BLUE} />
            </IconWithLabel>
          </div>

          {[0, 1, 2, 3].map((idx) => {
            const angle = orbitAngle + idx * (Math.PI / 2);
            const radius = scaleValue(220);
            const x = hubX + Math.cos(angle) * radius;
            const y = hubY + Math.sin(angle) * radius;
            return (
              <div
                key={`hub-dot-${idx}`}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: scaleValue(16),
                  height: scaleValue(16),
                  borderRadius: "50%",
                  background: `rgba(127,232,255,${0.4 + 0.3 * nixGlow})`,
                  boxShadow: `0 0 16px rgba(127,232,255,${0.7 * nixGlow})`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
        </div>
        <div style={{ position: "absolute", bottom: scaleValue(110), left: "50%", transform: "translateX(-50%)" }}>
          <TagBadge
            label="Nix first, Lua optional"
            accent={NIX_ORANGE}
            fontSize={layout.text.caption}
            paddingX={layout.padding.tagX}
            paddingY={layout.padding.tagY}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: modularOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: layout.spacing.gapTight,
          }}
        >
          <div style={{ display: "flex", gap: layout.spacing.gapLoose }}>
            {[
              { label: "Treesitter", icon: <PackageIcon color={NEUTRAL_BLUE} /> },
              { label: "LSP", icon: <ServerIcon color={NEUTRAL_BLUE} /> },
              { label: "Themes", icon: <PaletteIcon color={NEUTRAL_BLUE} /> },
              { label: "Lazy", icon: <LoopArrowIcon color={NEUTRAL_BLUE} /> },
            ].map((item, idx) => {
              const pop = spring({ frame: frame - (t23 + idx * 6), fps, damping: 12, stiffness: 150 });
              const scale = interpolate(pop, [0, 1], [0.86, 1], { extrapolateRight: "clamp" });
              const lift = interpolate(pop, [0, 1], [scaleValue(40), 0], { extrapolateRight: "clamp" });
              return (
                <div key={item.label} style={{ transform: `translateY(${lift}px) scale(${scale})` }}>
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
          </div>
          <div
            style={{
              width: scaleValue(1000),
              height: scaleValue(18),
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              position: "relative",
              boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
            }}
          >
            {[0, 1, 2, 3].map((idx) => {
              const toggleProgress = clamp01((frame - (t23 + 6 + idx * 8)) / 10);
              return (
                <div
                  key={`toggle-${idx}`}
                  style={{
                    position: "absolute",
                    left: `${15 + idx * 23}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: scaleValue(28),
                    height: scaleValue(28),
                    borderRadius: "50%",
                    background: `rgba(255,255,255,${0.2 + 0.6 * toggleProgress})`,
                    boxShadow: `0 0 20px rgba(127,232,255,${0.6 * toggleProgress})`,
                  }}
                />
              );
            })}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: scaleValue(110), left: "50%", transform: "translateX(-50%)" }}>
          <TagBadge
            label="Enable only what you need"
            accent={NEUTRAL_BLUE}
            fontSize={layout.text.caption}
            paddingX={layout.padding.tagX}
            paddingY={layout.padding.tagY}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: reproducibleOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: layout.spacing.gapTight,
          }}
        >
          <div style={{ position: "relative", width: scaleValue(1200), height: scaleValue(600) }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.25 }}>
              <IconShell size={layout.icon.xxl} accent={NEUTRAL_BLUE}>
                <GlobeIcon color={NEUTRAL_BLUE} />
              </IconShell>
            </div>
            {[
              { x: 0.2, y: 0.32 },
              { x: 0.75, y: 0.28 },
              { x: 0.3, y: 0.7 },
              { x: 0.7, y: 0.72 },
            ].map((point, idx) => {
              const reveal = clamp01((travelProgress - idx * 0.18) / 0.18);
              const lineOpacity = interpolate(reveal, [0, 1], [0, 0.6]);
              return (
                <div key={`point-${idx}`}>
                  <svg
                    viewBox="0 0 1200 600"
                    style={{ position: "absolute", inset: 0, opacity: lineOpacity }}
                  >
                    <line
                      x1={600}
                      y1={300}
                      x2={point.x * 1200}
                      y2={point.y * 600}
                      stroke={NIX_ORANGE}
                      strokeWidth={scaleValue(4)}
                      strokeLinecap="round"
                      pathLength={1}
                      strokeDasharray="1"
                      strokeDashoffset={1 - reveal}
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      left: `${point.x * 100}%`,
                      top: `${point.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                      opacity: reveal,
                    }}
                  >
                    <IconShell size={layout.icon.xs} accent={NIX_ORANGE}>
                      <NixBlockIcon color={NIX_ORANGE} />
                    </IconShell>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: scaleValue(110), left: "50%", transform: "translateX(-50%)" }}>
          <TagBadge
            label="Same config everywhere"
            accent={NIX_ORANGE}
            fontSize={layout.text.caption}
            paddingX={layout.padding.tagX}
            paddingY={layout.padding.tagY}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: lazyOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: layout.spacing.gapLoose,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: layout.spacing.gapTight }}>
            {[
              { label: "Internal", accent: NEOVIM_GREEN },
              { label: "External", accent: NEUTRAL_BLUE },
            ].map((block) => (
              <div
                key={block.label}
                style={{
                  width: scaleValue(1100),
                  height: scaleValue(160),
                  borderRadius: 26,
                  border: `1px solid ${block.accent}66`,
                  background: "rgba(10,12,30,0.78)",
                  boxShadow: "0 24px 70px rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  padding: `0 ${scaleValue(40)}px`,
                  gap: layout.spacing.gapTight,
                }}
              >
                <div
                  style={{
                    fontSize: layout.text.labelSmall,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: SOFT_WHITE,
                  }}
                >
                  {block.label}
                </div>
                {[0, 1, 2].map((idx) => {
                  const pop = spring({ frame: frame - (t41 + 18 + idx * 6), fps, damping: 12, stiffness: 160 });
                  const scale = interpolate(pop, [0, 1], [0.7, 1], { extrapolateRight: "clamp" });
                  return (
                    <div key={`${block.label}-${idx}`} style={{ transform: `scale(${scale})` }}>
                      <IconShell size={layout.icon.xs} accent={block.accent}>
                        <PuzzleIcon color={block.accent} />
                      </IconShell>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: layout.spacing.gapTight }}>
            <IconShell size={layout.icon.sm} accent={NIX_ORANGE}>
              <DoorIcon color={NIX_ORANGE} open={doorOpen} />
            </IconShell>
            <div
              style={{
                fontSize: layout.text.caption,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Lazy loading
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: scaleValue(110), left: "50%", transform: "translateX(-50%)" }}>
          <TagBadge
            label="Lazy load for speed"
            accent={NEUTRAL_BLUE}
            fontSize={layout.text.caption}
            paddingX={layout.padding.tagX}
            paddingY={layout.padding.tagY}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: flexibleOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            alignItems: "center",
            gap: layout.spacing.gapLoose,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: layout.spacing.gapLoose,
            }}
          >
            <div style={{ display: "flex", gap: layout.spacing.gapLoose }}>
              {sourceIcons.map((item, idx) => {
                const startX = (idx - 1) * scaleValue(420);
                const endX = 0;
                const x = interpolate(sourceProgress, [0, 1], [startX, endX], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div key={item.label} style={{ transform: `translateX(${x}px)` }}>
                    <IconWithLabel
                      label={item.label}
                      labelSize={layout.text.caption}
                      accent={NEUTRAL_BLUE}
                      size={layout.icon.sm}
                    >
                      {item.icon}
                    </IconWithLabel>
                  </div>
                );
              })}
            </div>
            <div style={{ transform: `scale(${sourceProgress * 0.2 + 0.9})` }}>
              <NvBox label="NVF" size={scaleValue(520)} accent={NIX_ORANGE} />
            </div>
            <TagBadge
              label="Flexible sources + deployment"
              accent={NIX_ORANGE}
              fontSize={layout.text.caption}
              paddingX={layout.padding.tagX}
              paddingY={layout.padding.tagY}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: layout.spacing.gapTight,
              transform: `scale(${deployScale})`,
            }}
          >
            {deploymentIcons.map((item) => (
              <IconWithLabel
                key={item.label}
                label={item.label}
                labelSize={layout.text.caption}
                accent={NEUTRAL_BLUE}
                size={layout.icon.xs}
              >
                {item.icon}
              </IconWithLabel>
            ))}
          </div>
        </div>
      </div>

      <SceneProgressBar />
    </AbsoluteFill>
  );
};
