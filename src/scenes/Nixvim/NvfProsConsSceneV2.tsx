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
    gapList: 56,
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

const ListItem: React.FC<{
  title: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
  iconSize: number;
  titleSize: number;
  subtitleSize: number;
}> = ({ title, subtitle, accent, icon, iconSize, titleSize, subtitleSize }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
    <IconShell size={iconSize} accent={accent} style={{ borderRadius: 28 }}>
      {icon}
    </IconShell>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontSize: titleSize,
          fontWeight: 600,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: SOFT_WHITE,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: subtitleSize,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {subtitle}
      </div>
    </div>
  </div>
);

const SideItem: React.FC<{
  label: string;
  accent: string;
  icon: ReactNode;
  iconSize: number;
  textSize: number;
  align: "left" | "right";
}> = ({ label, accent, icon, iconSize, textSize, align }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 20,
      flexDirection: align === "left" ? "row" : "row-reverse",
      textAlign: align === "left" ? "left" : "right",
    }}
  >
    <IconShell size={iconSize} accent={accent} style={{ borderRadius: 26 }}>
      {icon}
    </IconShell>
    <div
      style={{
        fontSize: textSize,
        fontWeight: 600,
        letterSpacing: 1.8,
        textTransform: "uppercase",
        color: SOFT_WHITE,
        maxWidth: 320,
        lineHeight: 1.1,
      }}
    >
      {label}
    </div>
  </div>
);

const NixBlockIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <polygon points="60,10 110,35 60,60 10,35" fill={`${color}33`} stroke={color} strokeWidth="5" />
    <polygon points="10,35 60,60 60,110 10,85" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <polygon points="110,35 60,60 60,110 110,85" fill={`${color}44`} stroke={color} strokeWidth="5" />
  </svg>
);

const PuzzleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <rect x="26" y="26" width="68" height="68" rx="14" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="60" cy="26" r="10" fill={color} opacity="0.7" />
    <circle cx="94" cy="60" r="10" fill={color} opacity="0.7" />
  </svg>
);

const ServerIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <rect x="22" y="18" width="96" height="30" rx="8" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <rect x="22" y="62" width="96" height="30" rx="8" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="38" cy="33" r="4" fill={color} />
    <circle cx="38" cy="77" r="4" fill={color} />
  </svg>
);

const TreeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 140" style={{ width: "78%", height: "78%" }}>
    <circle cx="60" cy="52" r="32" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <rect x="52" y="72" width="16" height="40" rx="6" fill={`${color}33`} stroke={color} strokeWidth="5" />
  </svg>
);

const PaletteIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <path
      d="M70 16 C100 16 124 40 124 70 C124 98 102 104 88 90 C82 84 72 90 70 104 C44 104 20 80 20 56 C20 34 40 16 70 16 Z"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="5"
    />
    <circle cx="54" cy="52" r="6" fill={color} />
    <circle cx="82" cy="46" r="6" fill={color} />
    <circle cx="90" cy="72" r="6" fill={color} />
  </svg>
);

const ToggleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 100" style={{ width: "78%", height: "78%" }}>
    <rect x="16" y="24" width="108" height="52" rx="26" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="52" cy="50" r="20" fill={color} />
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

const LoopArrowIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <circle cx="60" cy="60" r="36" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <path d="M40 54 L60 40 L80 54" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <path d="M80 66 L60 80 L40 66" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const HomeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <path d="M22 64 L70 26 L118 64 V106 H22 Z" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <rect x="52" y="72" width="36" height="34" rx="6" fill={`${color}33`} stroke={color} strokeWidth="5" />
  </svg>
);

const GlobeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <circle cx="60" cy="60" r="40" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <path d="M20 60 H100" stroke={color} strokeWidth="4" />
    <path d="M60 20 C48 34 48 86 60 100 C72 86 72 34 60 20 Z" stroke={color} strokeWidth="4" fill="none" />
  </svg>
);

const BookIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <path d="M28 24 H64 V96 H28 Z" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <path d="M76 24 H112 V96 H76 Z" fill={`${color}18`} stroke={color} strokeWidth="5" />
    <line x1="64" y1="24" x2="64" y2="96" stroke={color} strokeWidth="4" />
  </svg>
);

const CurveArrowIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 100" style={{ width: "78%", height: "78%" }}>
    <path d="M24 70 C40 32 96 32 116 52" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <path d="M108 44 L118 54 L104 58" fill={color} />
  </svg>
);

const SparkleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <polygon points="60,16 70,50 104,60 70,70 60,104 50,70 16,60 50,50" fill={`${color}33`} stroke={color} strokeWidth="5" />
  </svg>
);

const BrainIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <path
      d="M36 60 C24 52 24 32 40 28 C44 18 64 16 72 28 C84 22 102 30 100 48 C112 54 112 76 96 80 C94 94 76 98 66 90 C54 96 34 88 34 72 C26 70 26 62 36 60 Z"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="5"
    />
  </svg>
);

export const NVF_PROS_CONS_V2_DURATION = 47 * 30;

export const NvfProsConsSceneV2: React.FC = () => {
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
      gapList: scaleValue(BASE_LAYOUT.spacing.gapList),
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

  const t05 = 5 * fps;
  const t15 = 15 * fps;
  const t30 = 30 * fps;
  const t45 = 45 * fps;
  const t47 = 47 * fps;

  const titleOpacity = fadeInOut(frame, 0, t05, 10, 10);
  const titlePop = spring({ frame, fps, damping: 12, stiffness: 160 });
  const titleScale = interpolate(titlePop, [0, 1], [0.9, 1]);

  const overviewOpacity = fadeInOut(frame, t05, t15, 10, 10);
  const overviewPulse = clamp01((frame - (t05 + 6)) / 12);

  const prosOpacity = fadeInOut(frame, t15, t30, 8, 10);
  const consOpacity = fadeInOut(frame, t30, t45, 8, 10);
  const bestOpacity = fadeInOut(frame, t45, t47, 6, 6);

  const shimmerShift = Math.sin(frame / 50) * scaleValue(20);
  const shimmerShiftY = Math.cos(frame / 70) * scaleValue(18);

  const overviewWidth = scaleValue(3000);
  const overviewHeight = scaleValue(960);
  const overviewCenterX = overviewWidth / 2;
  const overviewCenterY = overviewHeight / 2;
  const overviewColumnOffset = overviewWidth * 0.3;
  const overviewRowGap = scaleValue(230);
  const overviewRowYs = [overviewCenterY - overviewRowGap, overviewCenterY, overviewCenterY + overviewRowGap];
  const wobble = Math.sin(frame / 22) * scaleValue(6);

  const listWidth = scaleValue(2800);
  const listHeight = scaleValue(1100);
  const listTitleY = scaleValue(140);
  const listStartY = scaleValue(360);
  const listGap = scaleValue(280);
  const listColumnX = ["12%", "56%"];

  const bestWidth = scaleValue(3000);
  const bestHeight = scaleValue(980);
  const bestColumnGap = scaleValue(140);
  const bestLeftWidth = scaleValue(1150);
  const bestRightWidth = bestWidth - bestLeftWidth - bestColumnGap;
  const bestRightCardHeight = scaleValue(300);
  const bestRightGapX = scaleValue(140);
  const bestRightGapY = scaleValue(120);
  const bestRightCardWidth = (bestRightWidth - bestRightGapX) / 2;
  const bestIconSize = layout.icon.sm * 0.72;
  const bestLabelSize = layout.text.labelSmall * 0.88;
  const bestSubtextSize = layout.text.labelSmall * 0.78;

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

      <div style={{ ...CENTER_STAGE, opacity: titleOpacity }}>
        <div
          style={{
            transform: `scale(${titleScale})`,
            padding: `${layout.padding.titleY}px ${layout.padding.titleX}px`,
            borderRadius: 999,
            background: "rgba(8,10,26,0.78)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 26px 90px rgba(0,0,0,0.6)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: layout.text.title,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              textShadow: "0 14px 40px rgba(0,0,0,0.6)",
            }}
          >
            NVF - Fully Declarative Neovim
          </div>
          <div
            style={{
              marginTop: scaleValue(18),
              fontSize: layout.text.labelSmall,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.72)",
            }}
          >
            Powered by Nix
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: overviewOpacity }}>
        <div style={{ position: "relative", width: overviewWidth, height: overviewHeight }}>
          <div
            style={{
              position: "absolute",
              left: overviewCenterX,
              top: overviewCenterY,
              transform: "translate(-50%, -50%)",
            }}
          >
            <IconShell size={layout.icon.md} accent={NIX_ORANGE}>
              <NixBlockIcon color={NIX_ORANGE} />
            </IconShell>
            <div
              style={{
                marginTop: scaleValue(16),
                fontSize: layout.text.labelSmall,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              Nix config
            </div>
          </div>

          {[
            { label: "Plugins", icon: <PuzzleIcon color={NEOVIM_GREEN} />, accent: NEOVIM_GREEN },
            { label: "LSP", icon: <ServerIcon color={HOT_PINK} />, accent: HOT_PINK },
            { label: "Treesitter", icon: <TreeIcon color={LUA_BLUE} />, accent: LUA_BLUE },
          ].map((item, idx) => {
            const glow = interpolate(overviewPulse, [0, 1], [0.4, 1]);
            return (
              <div
                key={item.label}
                style={{
                  position: "absolute",
                  left: overviewCenterX - overviewColumnOffset + wobble,
                  top: overviewRowYs[idx],
                  transform: "translate(-50%, -50%)",
                  opacity: glow,
                }}
              >
                <SideItem
                  label={item.label}
                  accent={item.accent}
                  icon={item.icon}
                  iconSize={layout.icon.xs}
                  textSize={layout.text.labelSmall}
                  align="left"
                />
              </div>
            );
          })}

          {[
            { label: "Themes", icon: <PaletteIcon color={HOT_PINK} />, accent: HOT_PINK },
            { label: "Lazy loading", icon: <ToggleIcon color={NEOVIM_GREEN} />, accent: NEOVIM_GREEN },
            { label: "Options", icon: <GearIcon color={NIX_ORANGE} />, accent: NIX_ORANGE },
          ].map((item, idx) => {
            const glow = interpolate(overviewPulse, [0, 1], [0.4, 1]);
            return (
              <div
                key={item.label}
                style={{
                  position: "absolute",
                  left: overviewCenterX + overviewColumnOffset - wobble,
                  top: overviewRowYs[idx],
                  transform: "translate(-50%, -50%)",
                  opacity: glow,
                }}
              >
                <SideItem
                  label={item.label}
                  accent={item.accent}
                  icon={item.icon}
                  iconSize={layout.icon.xs}
                  textSize={layout.text.labelSmall}
                  align="right"
                />
              </div>
            );
          })}

          <div style={{ position: "absolute", left: "50%", bottom: scaleValue(12), transform: "translateX(-50%)" }}>
            <TagBadge
              label="Fully declarative editor configuration"
              accent={NEOVIM_GREEN}
              fontSize={layout.text.caption}
              paddingX={layout.padding.tagX}
              paddingY={layout.padding.tagY}
            />
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: prosOpacity }}>
        <div style={{ position: "relative", width: listWidth, height: listHeight }}>
          <div
            style={{
              position: "absolute",
              top: listTitleY,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: layout.text.title * 0.85,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Pros
          </div>
          {[
            {
              title: "Very modular toggles",
              subtitle: "Enable only what you want",
              icon: <PuzzleIcon color={NEOVIM_GREEN} />,
              accent: NEOVIM_GREEN,
            },
            {
              title: "Lazy loading + reproducible",
              subtitle: "Built-in speed wins",
              icon: <LoopArrowIcon color={NIX_ORANGE} />,
              accent: NIX_ORANGE,
            },
            {
              title: "Standalone or NixOS",
              subtitle: "Home Manager ready",
              icon: <HomeIcon color={LUA_BLUE} />,
              accent: LUA_BLUE,
            },
            {
              title: "Same behavior anywhere",
              subtitle: "Nix-backed consistency",
              icon: <GlobeIcon color={HOT_PINK} />,
              accent: HOT_PINK,
            },
          ].map((item, idx) => {
            const pop = spring({ frame: frame - (t15 + 6 + idx * 5), fps, damping: 12, stiffness: 150 });
            const slide = interpolate(pop, [0, 1], [scaleValue(-40), 0]);
            const column = idx % 2;
            const row = Math.floor(idx / 2);
            return (
              <div
                key={item.title}
                style={{
                  position: "absolute",
                  left: listColumnX[column],
                  top: listStartY + row * listGap,
                  transform: `translateX(${slide}px)`,
                }}
              >
                <ListItem
                  title={item.title}
                  subtitle={item.subtitle}
                  accent={item.accent}
                  icon={item.icon}
                  iconSize={layout.icon.xs}
                  titleSize={layout.text.labelSmall}
                  subtitleSize={layout.text.caption}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: consOpacity }}>
        <div style={{ position: "relative", width: listWidth, height: listHeight }}>
          <div
            style={{
              position: "absolute",
              top: listTitleY,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: layout.text.title * 0.85,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Cons
          </div>
          {[
            {
              title: "Requires more Nix comfort",
              subtitle: "Less Lua-first",
              icon: <BookIcon color={NIX_ORANGE} />,
              accent: NIX_ORANGE,
            },
            {
              title: "Steeper learning curve",
              subtitle: "Harder for pure Lua users",
              icon: <CurveArrowIcon color={HOT_PINK} />,
              accent: HOT_PINK,
            },
          ].map((item, idx) => {
            const pop = spring({ frame: frame - (t30 + 6 + idx * 6), fps, damping: 12, stiffness: 150 });
            const slide = interpolate(pop, [0, 1], [scaleValue(40), 0]);
            return (
              <div
                key={item.title}
                style={{
                  position: "absolute",
                  left: "12%",
                  top: listStartY + idx * listGap,
                  transform: `translateX(${slide}px)`,
                }}
              >
                <ListItem
                  title={item.title}
                  subtitle={item.subtitle}
                  accent={item.accent}
                  icon={item.icon}
                  iconSize={layout.icon.xs}
                  titleSize={layout.text.labelSmall}
                  subtitleSize={layout.text.caption}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: bestOpacity }}>
        <div
          style={{
            width: bestWidth,
            height: bestHeight,
            display: "grid",
            gridTemplateColumns: `${bestLeftWidth}px ${bestRightWidth}px`,
            columnGap: bestColumnGap,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: scaleValue(28),
            }}
          >
            <div
              style={{
                fontSize: layout.text.title * 0.82,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                lineHeight: 1.1,
              }}
            >
              Best For - Declarative & Reproducible
            </div>
            <div
              style={{
                fontSize: bestSubtextSize,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.15,
                maxWidth: bestLeftWidth,
              }}
            >
              Nix-first flexibility · Optional Lua
            </div>
          </div>
          <div
            style={{
              width: bestRightWidth,
              display: "grid",
              gridTemplateColumns: `repeat(2, ${bestRightCardWidth}px)`,
              gridAutoRows: `${bestRightCardHeight}px`,
              columnGap: bestRightGapX,
              rowGap: bestRightGapY,
              justifyContent: "center",
            }}
          >
            {[
              { label: "Modularity", icon: <SparkleIcon color={NEOVIM_GREEN} />, accent: NEOVIM_GREEN },
              { label: "Reproducible", icon: <LoopArrowIcon color={NIX_ORANGE} />, accent: NIX_ORANGE },
              { label: "Nix-first", icon: <BrainIcon color={LUA_BLUE} />, accent: LUA_BLUE },
              { label: "Flexible", icon: <GearIcon color={HOT_PINK} />, accent: HOT_PINK },
            ].map((item, idx) => {
              const pop = spring({ frame: frame - (t45 + 6 + idx * 4), fps, damping: 12, stiffness: 150 });
              const scale = interpolate(pop, [0, 1], [0.94, 1]);
              return (
                <CardShell
                  key={item.label}
                  width={bestRightCardWidth}
                  height={bestRightCardHeight}
                  accent={item.accent}
                  radius={scaleValue(32)}
                  paddingX={layout.padding.cardX}
                  paddingY={layout.padding.cardY}
                  style={{ transform: `scale(${scale})` }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: scaleValue(18), alignItems: "center" }}>
                    <IconShell size={bestIconSize} accent={item.accent}>
                      {item.icon}
                    </IconShell>
                    <div
                      style={{
                        fontSize: bestLabelSize,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        textAlign: "center",
                        color: SOFT_WHITE,
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                </CardShell>
              );
            })}
          </div>
        </div>
      </div>

      <SceneProgressBar />
    </AbsoluteFill>
  );
};
