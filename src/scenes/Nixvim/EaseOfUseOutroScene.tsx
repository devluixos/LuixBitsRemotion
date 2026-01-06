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
const HOT_PINK = "#ff7eb6";
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
    title: 190,
    subtitle: 82,
    label: 92,
    labelSmall: 70,
    caption: 56,
    tag: 76,
  },
  icon: {
    xl: 620,
    lg: 520,
    md: 420,
    sm: 320,
    xs: 240,
    tiny: 180,
  },
  spacing: {
    gapWide: 140,
    gapLoose: 110,
    gapTight: 70,
  },
  padding: {
    titleX: 54,
    titleY: 26,
    cardX: 46,
    cardY: 34,
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

const CardShell: React.FC<{
  width: number;
  height: number;
  accent: string;
  radius: number;
  paddingX: number;
  paddingY: number;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ width, height, accent, radius, paddingX, paddingY, style, children }) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius,
      border: `1px solid ${accent}55`,
      background: "rgba(10,12,30,0.78)",
      boxShadow: `0 24px 70px rgba(0,0,0,0.45), 0 0 40px ${accent}33`,
      padding: `${paddingY}px ${paddingX}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

const TagBadge: React.FC<{
  label: string;
  accent: string;
  fontSize: number;
  paddingX: number;
  paddingY: number;
  style?: CSSProperties;
}> = ({ label, accent, fontSize, paddingX, paddingY, style }) => (
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
      ...style,
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

const NeovimDiamondIcon: React.FC<{ color: string; label?: string }> = ({ color, label = "NV" }) => (
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
      {label}
    </text>
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

const ModuleBlocksIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <rect x="16" y="18" width="42" height="38" rx="10" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <rect x="70" y="18" width="54" height="38" rx="10" fill={`${color}33`} stroke={color} strokeWidth="5" />
    <rect x="34" y="68" width="56" height="38" rx="10" fill={`${color}22`} stroke={color} strokeWidth="5" />
  </svg>
);

const PuzzleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <rect x="28" y="24" width="84" height="72" rx="16" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="70" cy="24" r="10" fill={`${color}33`} stroke={color} strokeWidth="4" />
    <circle cx="70" cy="96" r="10" fill={`${color}33`} stroke={color} strokeWidth="4" />
    <circle cx="28" cy="60" r="10" fill={`${color}33`} stroke={color} strokeWidth="4" />
    <circle cx="112" cy="60" r="10" fill={`${color}33`} stroke={color} strokeWidth="4" />
  </svg>
);

const GraphIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <circle cx="32" cy="80" r="12" fill={`${color}55`} />
    <circle cx="70" cy="30" r="12" fill={`${color}55`} />
    <circle cx="108" cy="80" r="12" fill={`${color}55`} />
    <line x1="32" y1="80" x2="70" y2="30" stroke={color} strokeWidth="5" />
    <line x1="70" y1="30" x2="108" y2="80" stroke={color} strokeWidth="5" />
  </svg>
);

const CatIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <path d="M30 40 L50 20 L66 40 L74 40 L90 20 L110 40" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <circle cx="50" cy="70" r="10" fill={color} />
    <circle cx="90" cy="70" r="10" fill={color} />
    <path d="M56 86 Q70 98 84 86" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const HeartIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <path
      d="M60 96 C30 72 18 54 24 38 C30 22 48 20 60 34 C72 20 90 22 96 38 C102 54 90 72 60 96 Z"
      fill={`${color}55`}
      stroke={color}
      strokeWidth="4"
    />
  </svg>
);

const TerminalIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 160 120" style={{ width: "78%", height: "78%" }}>
    <rect x="14" y="18" width="132" height="84" rx="12" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="32" cy="36" r="4" fill={color} />
    <circle cx="46" cy="36" r="4" fill={color} />
    <circle cx="60" cy="36" r="4" fill={color} />
    <path d="M40 60 L58 72 L40 84" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" />
    <rect x="68" y="76" width="36" height="6" rx="3" fill={color} />
  </svg>
);

const IsoCube: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "100%", height: "100%" }}>
    <polygon points="70,8 126,36 70,64 14,36" fill={`${color}33`} stroke={color} strokeWidth="4" />
    <polygon points="14,36 70,64 70,112 14,84" fill={`${color}22`} stroke={color} strokeWidth="4" />
    <polygon points="126,36 70,64 70,112 126,84" fill={`${color}55`} stroke={color} strokeWidth="4" />
  </svg>
);

const ArrowLine: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 200 24" style={{ width: "100%", height: "100%" }}>
    <line x1="0" y1="12" x2="170" y2="12" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <polygon points="170,4 200,12 170,20" fill={color} />
  </svg>
);

export const EASE_OF_USE_OUTRO_DURATION = 84 * 30;

export const EaseOfUseOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
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
      xl: scaleValue(BASE_LAYOUT.icon.xl),
      lg: scaleValue(BASE_LAYOUT.icon.lg),
      md: scaleValue(BASE_LAYOUT.icon.md),
      sm: scaleValue(BASE_LAYOUT.icon.sm),
      xs: scaleValue(BASE_LAYOUT.icon.xs),
      tiny: scaleValue(BASE_LAYOUT.icon.tiny),
    },
    spacing: {
      gapWide: scaleValue(BASE_LAYOUT.spacing.gapWide),
      gapLoose: scaleValue(BASE_LAYOUT.spacing.gapLoose),
      gapTight: scaleValue(BASE_LAYOUT.spacing.gapTight),
    },
    padding: {
      titleX: scaleValue(BASE_LAYOUT.padding.titleX),
      titleY: scaleValue(BASE_LAYOUT.padding.titleY),
      cardX: scaleValue(BASE_LAYOUT.padding.cardX),
      cardY: scaleValue(BASE_LAYOUT.padding.cardY),
      tagX: scaleValue(BASE_LAYOUT.padding.tagX),
      tagY: scaleValue(BASE_LAYOUT.padding.tagY),
    },
  };

  const t04 = 4 * fps;
  const t18 = 18 * fps;
  const t33 = 33 * fps;
  const t43 = 43 * fps;
  const t58 = 58 * fps;
  const t68 = 68 * fps;
  const t77 = 77 * fps;
  const t84 = 84 * fps;

  const easeTitleOpacity = fadeInOut(frame, 0, t04, 8, 8);
  const spectrumOpacity = fadeInOut(frame, t04, t18, 8, 8);
  const reinforceOpacity = fadeInOut(frame, t18, t33, 8, 8);
  const whichOpacity = fadeInOut(frame, t33, t43, 8, 8);
  const recsOpacity = fadeInOut(frame, t43, t58, 8, 8);
  const montageOpacity = fadeInOut(frame, t58, t68, 8, 8);
  const ctaOpacity = fadeInOut(frame, t68, t77, 6, 6);
  const outroOpacity = fadeInOut(frame, t77, t84, 6, 6);

  const shimmerShift = Math.sin(frame / 50) * scaleValue(20);
  const shimmerShiftY = Math.cos(frame / 70) * scaleValue(18);

  const easeTitleText = "Ease of Use Spectrum";
  const easeTitleType = clamp01((frame - 6) / 36);
  const easeTitleChars = Math.floor(easeTitleType * easeTitleText.length);
  const easeTitleShown = easeTitleText.slice(0, Math.max(0, easeTitleChars));

  const whichTitleText = "Which Should You Use?";
  const whichTitleType = clamp01((frame - (t33 + 6)) / 36);
  const whichTitleChars = Math.floor(whichTitleType * whichTitleText.length);
  const whichTitleShown = whichTitleText.slice(0, Math.max(0, whichTitleChars));

  const whichUnderline = clamp01((frame - (t33 + 16)) / 18);
  const easeTitlePop = spring({ frame, fps, damping: 12, stiffness: 150 });
  const whichTitlePop = spring({ frame: frame - t33, fps, damping: 12, stiffness: 150 });

  const spectrumIndex = frame < t04 + 5 * fps ? 0 : frame < t04 + 10 * fps ? 1 : 2;
  const recsIndex = frame < t43 + 5 * fps ? 0 : frame < t43 + 10 * fps ? 1 : 2;
  const cursorVisible = Math.floor(frame / 12) % 2 === 0;

  const spectrumContainerWidth = scaleValue(2800);
  const spectrumLineWidth = scaleValue(2400);
  const spectrumLeft = (spectrumContainerWidth - spectrumLineWidth) / 2;
  const spectrumLineY = scaleValue(500);
  const sliderSize = scaleValue(56);
  const sliderProgress = interpolate(
    frame,
    [t04, t04 + 5 * fps, t04 + 10 * fps, t18 - 2 * fps],
    [0.05, 0.12, 0.5, 0.95],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const sliderX = spectrumLeft + sliderProgress * spectrumLineWidth - sliderSize / 2;

  const montageProgress = clamp01((frame - t58) / (t68 - t58));
  const orbitRadius = interpolate(montageProgress, [0, 1], [scaleValue(420), scaleValue(360)]);
  const orbitOpacity = interpolate(montageProgress, [0, 0.6, 0.8], [1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeOpacity = interpolate(montageProgress, [0.65, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const montageSpin = (frame - t58) / 20;

  const ctaPop = spring({ frame: frame - t68, fps, damping: 12, stiffness: 160 });

  const confettiSeeds = [
    { x: 0.08, speed: 0.7, size: 12 },
    { x: 0.16, speed: 0.6, size: 10 },
    { x: 0.24, speed: 0.8, size: 14 },
    { x: 0.32, speed: 0.75, size: 11 },
    { x: 0.4, speed: 0.65, size: 9 },
    { x: 0.58, speed: 0.7, size: 12 },
    { x: 0.66, speed: 0.8, size: 10 },
    { x: 0.74, speed: 0.6, size: 14 },
    { x: 0.82, speed: 0.75, size: 11 },
    { x: 0.9, speed: 0.68, size: 9 },
  ];

  const morphPhase = clamp01((frame - t77) / (t84 - t77)) * 3;
  const cubeOpacity = clamp01(1 - Math.abs(morphPhase - 0));
  const heartOpacity = clamp01(1 - Math.abs(morphPhase - 1));
  const terminalOpacity = clamp01(1 - Math.abs(morphPhase - 2));

  const renderFlyTerminal = (start: number, end: number, y: number, accent: string, label: string, tilt: number) => {
    const progress = clamp01((frame - start) / (end - start));
    const x = interpolate(progress, [0, 1], [-scaleValue(260), width + scaleValue(260)], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const bob = Math.sin((frame - start) / 6) * scaleValue(6);
    const opacity = interpolate(frame, [start, start + 8, end - 8, end], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <div
        style={{
          position: "absolute",
          top: y + bob,
          left: x,
          opacity,
          transform: `rotate(${tilt}deg)`,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: scaleValue(8),
            transform: "scale(0.86)",
          }}
        >
          <IconShell size={scaleValue(150)} accent={accent}>
            <TerminalIcon color={accent} />
          </IconShell>
          <div
            style={{
              fontSize: scaleValue(44),
              letterSpacing: 2,
              textTransform: "uppercase",
              color: SOFT_WHITE,
              textShadow: "0 8px 16px rgba(0,0,0,0.5)",
            }}
          >
            {label}
          </div>
        </div>
      </div>
    );
  };

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
          inset: "-10%",
          background:
            "radial-gradient(circle at 16% 18%, rgba(124,255,231,0.18), transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,157,226,0.2), transparent 50%), radial-gradient(circle at 50% 82%, rgba(180,124,255,0.16), transparent 55%)",
          opacity: 0.35,
          transform: `translate(${shimmerShift}px, ${shimmerShiftY}px)`,
        }}
      />

      <div style={{ ...CENTER_STAGE, opacity: easeTitleOpacity }}>
        <div
          style={{
            position: "absolute",
            inset: "-20%",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 180px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 120px)",
            opacity: 0.18,
          }}
        />
        <div
          style={{
            padding: `${layout.padding.titleY}px ${layout.padding.titleX}px`,
            borderRadius: 24,
            background: "rgba(8,10,26,0.78)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 26px 90px rgba(0,0,0,0.6)",
            textAlign: "center",
            transform: `scale(${0.94 + 0.06 * easeTitlePop})`,
          }}
        >
          <div
            style={{
              fontFamily: "Courier New, monospace",
              fontSize: layout.text.caption,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            $ spectrum
          </div>
          <div
            style={{
              marginTop: scaleValue(18),
              fontSize: layout.text.title,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              textShadow: "0 14px 40px rgba(0,0,0,0.6)",
              minHeight: layout.text.title,
            }}
          >
            {easeTitleShown}
            <span style={{ opacity: cursorVisible ? 0.6 : 0 }}>_</span>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: spectrumOpacity }}>
        <div style={{ position: "relative", width: spectrumContainerWidth, height: scaleValue(620) }}>
          <div
            style={{
              position: "absolute",
              left: spectrumLeft,
              top: scaleValue(40),
              width: spectrumLineWidth,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {[
              {
                title: "NixCats",
                caption: "Lua Comfort",
                accent: NEOVIM_GREEN,
                icon: <CatIcon color={NEOVIM_GREEN} />,
              },
              {
                title: "Nixvim",
                caption: "Nix Balance",
                accent: NIX_ORANGE,
                icon: <ModuleBlocksIcon color={NIX_ORANGE} />,
              },
              {
                title: "NVF",
                caption: "Full Nix Power",
                accent: HOT_PINK,
                icon: <GraphIcon color={HOT_PINK} />,
              },
            ].map((item, idx) => {
              const emphasis = idx === spectrumIndex ? 1.08 + Math.sin(frame / 6) * 0.02 : 0.95;
              return (
                <div
                  key={item.title}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: scaleValue(16), transform: `scale(${emphasis})` }}
                >
                  <IconShell size={layout.icon.sm} accent={item.accent}>
                    {item.icon}
                  </IconShell>
                  <div style={{ fontSize: layout.text.labelSmall, letterSpacing: 2, textTransform: "uppercase" }}>{item.title}</div>
                  <div style={{ fontSize: layout.text.caption, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
                    {item.caption}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: "absolute",
              left: spectrumLeft,
              top: spectrumLineY,
              width: spectrumLineWidth,
              height: scaleValue(10),
              borderRadius: 999,
              background: "rgba(255,255,255,0.25)",
              boxShadow: "0 0 30px rgba(255,255,255,0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: sliderX,
              top: spectrumLineY - sliderSize / 2,
              width: sliderSize,
              height: sliderSize,
              borderRadius: "50%",
              background: `radial-gradient(circle at 40% 40%, #ffffff, ${NIX_ORANGE} 60%, rgba(255,255,255,0.2) 100%)`,
              boxShadow: `0 0 40px ${NIX_ORANGE}`,
            }}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: reinforceOpacity }}>
        {[
          {
            title: "NixCats",
            caption: "Reuse Lua config, Nix fetches deps",
            accent: NEOVIM_GREEN,
            content: (
              <div style={{ display: "flex", alignItems: "center", gap: scaleValue(20) }}>
                <IconShell size={layout.icon.xs} accent={LUA_BLUE}>
                  <LuaScriptIcon color={LUA_BLUE} />
                </IconShell>
                <div style={{ width: scaleValue(200), height: scaleValue(24) }}>
                  <ArrowLine color={NEOVIM_GREEN} />
                </div>
                <IconShell size={layout.icon.xs} accent={NEOVIM_GREEN}>
                  <NixBlockIcon color={NEOVIM_GREEN} />
                </IconShell>
              </div>
            ),
          },
          {
            title: "Nixvim",
            caption: "Sensible defaults, Nix modules",
            accent: NIX_ORANGE,
            content: (
              <div style={{ display: "flex", alignItems: "center", gap: scaleValue(20) }}>
                <IconShell size={layout.icon.xs} accent={NIX_ORANGE}>
                  <ModuleBlocksIcon color={NIX_ORANGE} />
                </IconShell>
                <div style={{ width: scaleValue(200), height: scaleValue(24) }}>
                  <ArrowLine color={NIX_ORANGE} />
                </div>
                <IconShell size={layout.icon.xs} accent={NEOVIM_GREEN}>
                  <NeovimDiamondIcon color={NEOVIM_GREEN} />
                </IconShell>
              </div>
            ),
          },
          {
            title: "NVF",
            caption: "Config in Nix, maximum control",
            accent: HOT_PINK,
            content: (
              <div style={{ display: "flex", alignItems: "center", gap: scaleValue(20) }}>
                <IconShell size={layout.icon.xs} accent={HOT_PINK}>
                  <GraphIcon color={HOT_PINK} />
                </IconShell>
                <div style={{ width: scaleValue(200), height: scaleValue(24) }}>
                  <ArrowLine color={HOT_PINK} />
                </div>
                <IconShell size={layout.icon.xs} accent={NIX_ORANGE}>
                  <NixBlockIcon color={NIX_ORANGE} />
                </IconShell>
              </div>
            ),
          },
        ].map((item, idx) => {
          const segmentStart = t18 + idx * 5 * fps;
          const segmentEnd = segmentStart + 5 * fps;
          const itemOpacity = fadeInOut(frame, segmentStart, segmentEnd, 6, 6);
          const pop = spring({ frame: frame - segmentStart, fps, damping: 12, stiffness: 140 });
          const scalePop = interpolate(pop, [0, 1], [0.96, 1]);
          return (
            <div key={item.title} style={{ ...CENTER_STAGE, opacity: itemOpacity }}>
              <CardShell
                width={scaleValue(1800)}
                height={scaleValue(620)}
                accent={item.accent}
                radius={scaleValue(36)}
                paddingX={layout.padding.cardX}
                paddingY={layout.padding.cardY}
                style={{ transform: `scale(${scalePop})` }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: scaleValue(26), alignItems: "center", textAlign: "center" }}>
                  {item.content}
                  <div style={{ fontSize: layout.text.label, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: layout.text.caption, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
                    {item.caption}
                  </div>
                </div>
              </CardShell>
            </div>
          );
        })}
      </div>

      <div style={{ ...CENTER_STAGE, opacity: whichOpacity }}>
        <div
          style={{
            position: "absolute",
            inset: "-18%",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 160px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 100px)",
            opacity: 0.22,
          }}
        />
        <div
          style={{
            padding: `${layout.padding.titleY}px ${layout.padding.titleX}px`,
            borderRadius: 24,
            background: "rgba(8,10,26,0.78)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 26px 90px rgba(0,0,0,0.6)",
            textAlign: "center",
            transform: `scale(${0.94 + 0.06 * whichTitlePop})`,
          }}
        >
          <div
            style={{
              fontSize: layout.text.title,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              textShadow: "0 14px 40px rgba(0,0,0,0.6)",
              minHeight: layout.text.title,
            }}
          >
            {whichTitleShown}
            <span style={{ opacity: cursorVisible ? 0.6 : 0 }}>_</span>
          </div>
          <div
            style={{
              marginTop: scaleValue(18),
              width: scaleValue(820),
              height: scaleValue(8),
              borderRadius: 999,
              background: `linear-gradient(90deg, ${NEOVIM_GREEN}, ${NIX_ORANGE}, ${HOT_PINK})`,
              transform: `scaleX(${whichUnderline})`,
              transformOrigin: "center",
              boxShadow: "0 0 28px rgba(255,255,255,0.25)",
            }}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: recsOpacity }}>
        <div
          style={{
            ...layout.container,
            height: scaleValue(860),
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            columnGap: layout.spacing.gapLoose,
            alignItems: "center",
          }}
        >
          {[
            {
              title: "NixCats",
              desc: "Lua workflow + Nix fetch",
              tag: "Lua comfort",
              accent: NEOVIM_GREEN,
              icon: <CatIcon color={NEOVIM_GREEN} />,
            },
            {
              title: "Nixvim",
              desc: "Mostly Nix, sane defaults",
              tag: "Nix balance",
              accent: NIX_ORANGE,
              icon: <ModuleBlocksIcon color={NIX_ORANGE} />,
            },
            {
              title: "NVF",
              desc: "Full Nix control",
              tag: "Ultimate control",
              accent: HOT_PINK,
              icon: <GraphIcon color={HOT_PINK} />,
            },
          ].map((item, idx) => {
            const isActive = idx === recsIndex;
            const pop = spring({ frame: frame - (t43 + idx * 6), fps, damping: 12, stiffness: 140 });
            const scalePop = interpolate(pop, [0, 1], [0.92, 1]);
            const glow = isActive ? 1 : 0.55;
            const lift = isActive ? scaleValue(-12) : 0;
            return (
              <CardShell
                key={item.title}
                width={scaleValue(900)}
                height={scaleValue(640)}
                accent={item.accent}
                radius={scaleValue(36)}
                paddingX={layout.padding.cardX}
                paddingY={layout.padding.cardY}
                style={{
                  transform: `translateY(${lift}px) scale(${scalePop})`,
                  boxShadow: `0 28px 70px rgba(0,0,0,0.45), 0 0 50px ${item.accent}${Math.round(88 * glow).toString(16)}`,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: scaleValue(20), alignItems: "center" }}>
                  <IconShell size={layout.icon.sm} accent={item.accent}>
                    {item.icon}
                  </IconShell>
                  <div style={{ fontSize: layout.text.label, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: layout.text.caption,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.75)",
                      textAlign: "center",
                    }}
                  >
                    {item.desc}
                  </div>
                  <TagBadge
                    label={item.tag}
                    accent={item.accent}
                    fontSize={layout.text.caption}
                    paddingX={layout.padding.tagX}
                    paddingY={layout.padding.tagY}
                    style={{ opacity: glow }}
                  />
                </div>
              </CardShell>
            );
          })}
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: montageOpacity }}>
        <div style={{ position: "relative", width: scaleValue(2400), height: scaleValue(760) }}>
          {[
            { icon: <NixBlockIcon color={NIX_ORANGE} />, accent: NIX_ORANGE },
            { icon: <TerminalIcon color={NEOVIM_GREEN} />, accent: NEOVIM_GREEN },
            { icon: <NeovimDiamondIcon color={NEOVIM_GREEN} />, accent: NEOVIM_GREEN },
            { icon: <LuaScriptIcon color={LUA_BLUE} />, accent: LUA_BLUE },
            { icon: <GraphIcon color={HOT_PINK} />, accent: HOT_PINK },
          ].map((item, idx, arr) => {
            const angle = (idx / arr.length) * Math.PI * 2 + montageSpin;
            const x = Math.cos(angle) * orbitRadius;
            const y = Math.sin(angle) * orbitRadius;
            return (
              <div
                key={`orbit-${idx}`}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(${x}px, ${y}px)`,
                  opacity: orbitOpacity,
                }}
              >
                <IconShell size={layout.icon.sm} accent={item.accent}>
                  {item.icon}
                </IconShell>
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              opacity: badgeOpacity,
            }}
          >
            <CardShell
              width={scaleValue(980)}
              height={scaleValue(420)}
              accent={NEOVIM_GREEN}
              radius={scaleValue(36)}
              paddingX={layout.padding.cardX}
              paddingY={layout.padding.cardY}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: scaleValue(20) }}>
                <div style={{ display: "flex", gap: scaleValue(26), alignItems: "center" }}>
                  <IconShell size={layout.icon.xs} accent={NIX_ORANGE}>
                    <NixBlockIcon color={NIX_ORANGE} />
                  </IconShell>
                  <IconShell size={layout.icon.xs} accent={NEOVIM_GREEN}>
                    <NeovimDiamondIcon color={NEOVIM_GREEN} />
                  </IconShell>
                </div>
                <div style={{ fontSize: layout.text.label, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                  Neovim with Nix
                </div>
                <div style={{ fontSize: layout.text.caption, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
                  One toolchain, many workflows
                </div>
              </div>
            </CardShell>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: ctaOpacity }}>
        <div
          style={{
            textAlign: "center",
            transform: `scale(${0.94 + 0.06 * ctaPop})`,
          }}
        >
          <div style={{ fontSize: layout.text.title, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
            Comment What You Want Next!
          </div>
          <div
            style={{
              marginTop: scaleValue(18),
              fontSize: layout.text.labelSmall,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            <span style={{ opacity: cursorVisible ? 1 : 0.35 }}>&gt;&gt;</span> drop a comment
          </div>
        </div>
        {renderFlyTerminal(t68, t77, scaleValue(90), NEOVIM_GREEN, "Subscribe", -8)}
      </div>

      <div style={{ ...CENTER_STAGE, opacity: outroOpacity }}>
        <div
          style={{
            width: scaleValue(2200),
            height: scaleValue(720),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: scaleValue(28),
          }}
        >
          <div style={{ fontSize: layout.text.title, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
            Thanks for Watching!
          </div>
          <div style={{ fontSize: layout.text.labelSmall, letterSpacing: 1.6, textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
            Nix is Fun :)
          </div>
          <div style={{ width: scaleValue(220), height: scaleValue(220), position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, opacity: cubeOpacity }}>
              <IconShell size={scaleValue(220)} accent={NIX_ORANGE}>
                <NixBlockIcon color={NIX_ORANGE} />
              </IconShell>
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: heartOpacity }}>
              <IconShell size={scaleValue(220)} accent={HOT_PINK}>
                <HeartIcon color={HOT_PINK} />
              </IconShell>
            </div>
            <div style={{ position: "absolute", inset: 0, opacity: terminalOpacity }}>
              <IconShell size={scaleValue(220)} accent={NEOVIM_GREEN}>
                <TerminalIcon color={NEOVIM_GREEN} />
              </IconShell>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {confettiSeeds.map((seed, idx) => {
            const segment = clamp01((frame - t77) / (t84 - t77));
            const y = ((segment * 1.2 + seed.speed) % 1) * 100;
            const drift = Math.sin(frame / 12 + idx) * 2;
            const color = idx % 2 === 0 ? NIX_ORANGE : idx % 3 === 0 ? HOT_PINK : NEOVIM_GREEN;
            return (
              <div
                key={`confetti-${idx}`}
                style={{
                  position: "absolute",
                  left: `${seed.x * 100}%`,
                  top: `${y}%`,
                  width: scaleValue(seed.size),
                  height: scaleValue(seed.size * 1.6),
                  borderRadius: scaleValue(4),
                  background: color,
                  opacity: 0.7,
                  transform: `translate(${drift}px, 0) rotate(${frame * (idx + 1) * 0.3}deg)`,
                }}
              />
            );
          })}
        </div>
        {renderFlyTerminal(t77, t84, height - scaleValue(240), NIX_ORANGE, "Subscribe", 8)}
      </div>

      <SceneProgressBar />
    </AbsoluteFill>
  );
};
