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
    tiny: 190,
  },
  spacing: {
    gapWide: 140,
    gapLoose: 110,
    gapTight: 70,
    gapList: 52,
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

const IconWithLabel: React.FC<{
  label: string;
  labelSize: number;
  accent: string;
  size: number | string;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  children: ReactNode;
}> = ({ label, labelSize, accent, size, style, labelStyle, children }) => (
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
        ...labelStyle,
      }}
    >
      {label}
    </div>
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

const ListItem: React.FC<{
  title: string;
  accent: string;
  icon: ReactNode;
  iconSize: number;
  titleSize: number;
}> = ({ title, accent, icon, iconSize, titleSize }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
    <IconShell size={iconSize} accent={accent} style={{ borderRadius: 28 }}>
      {icon}
    </IconShell>
    <div
      style={{
        fontSize: titleSize,
        fontWeight: 600,
        letterSpacing: 1.8,
        textTransform: "uppercase",
        color: SOFT_WHITE,
      }}
    >
      {title}
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

const PackageIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <polygon points="70,16 120,40 70,64 20,40" fill={`${color}33`} stroke={color} strokeWidth="5" />
    <polygon points="20,40 70,64 70,104 20,80" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <polygon points="120,40 70,64 70,104 120,80" fill={`${color}44`} stroke={color} strokeWidth="5" />
  </svg>
);

const ChipIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <rect x="26" y="26" width="68" height="68" rx="12" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <rect x="42" y="42" width="36" height="36" rx="8" fill={`${color}44`} stroke={color} strokeWidth="4" />
    {[18, 102].map((x) => (
      <line key={x} x1={x} y1="44" x2={x} y2="76" stroke={color} strokeWidth="5" />
    ))}
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

const LazyIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <rect x="18" y="26" width="84" height="68" rx="18" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <text
      x="60"
      y="70"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="28"
      fill={SOFT_WHITE}
      fontWeight="700"
    >
      lazy
    </text>
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

const CheckIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <circle cx="60" cy="60" r="36" fill={`${color}22`} stroke={color} strokeWidth="6" />
    <path d="M38 62 L54 78 L84 42" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const WarningIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <polygon points="60,16 106,100 14,100" fill={`${color}22`} stroke={color} strokeWidth="6" />
    <rect x="56" y="42" width="8" height="34" rx="4" fill={color} />
    <rect x="56" y="84" width="8" height="8" rx="4" fill={color} />
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

const NeovimDiamondIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "78%", height: "78%" }}>
    <polygon
      points="50,6 94,50 50,94 6,50"
      fill="rgba(138,255,207,0.18)"
      stroke={color}
      strokeWidth="6"
    />
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

export const NIXCATS_PROS_CONS_DURATION = 75 * 30;

export const NixCatsProsConsScene: React.FC = () => {
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

  const t06 = 6 * fps;
  const t18 = 18 * fps;
  const t30 = 30 * fps;
  const t45 = 45 * fps;
  const t60 = 60 * fps;
  const t75 = 75 * fps;

  const titleOpacity = fadeInOut(frame, 0, t06, 10, 10);
  const titlePop = spring({ frame, fps, damping: 12, stiffness: 160 });
  const titleScale = interpolate(titlePop, [0, 1], [0.9, 1]);

  const pkgOpacity = fadeInOut(frame, t06, t18, 10, 10);
  const pkgLineProgress = clamp01((frame - (t06 + 6)) / 16);

  const luaOpacity = fadeInOut(frame, t18, t30, 10, 10);
  const luaPop = spring({ frame: frame - (t18 + 2), fps, damping: 12, stiffness: 140 });
  const luaScale = interpolate(luaPop, [0, 1], [0.92, 1]);

  const prosOpacity = fadeInOut(frame, t30, t45, 8, 10);
  const consOpacity = fadeInOut(frame, t45, t60, 8, 10);
  const bestOpacity = fadeInOut(frame, t60, t75, 8, 10);

  const shimmerShift = Math.sin(frame / 50) * scaleValue(20);
  const shimmerShiftY = Math.cos(frame / 70) * scaleValue(18);

  const pkgWidth = scaleValue(3000);
  const pkgHeight = scaleValue(860);
  const pkgNixX = pkgWidth * 0.18;
  const pkgRowY = pkgHeight * 0.4;
  const pkgItemXs = [0.55, 0.72, 0.89].map((x) => x * pkgWidth);

  const luaWidth = scaleValue(2800);
  const luaHeight = scaleValue(860);
  const luaCenterX = luaWidth / 2;
  const luaCenterY = luaHeight * 0.42;

  const listCardWidth = scaleValue(1120);
  const listCardHeight = scaleValue(560);
  const listIconSize = layout.icon.xs * 0.72;
  const listTextSize = layout.text.label * 0.72;

  const bestWidth = scaleValue(3000);
  const bestHeight = scaleValue(980);
  const bestTitleY = scaleValue(8);
  const bestCardWidth = scaleValue(2600);
  const bestCardHeight = scaleValue(440);
  const bestCardTop = scaleValue(190);
  const bestTagY = scaleValue(740);
  const bestCaptionY = scaleValue(930);
  const bestInnerIcon = layout.icon.sm * 0.85;
  const bestInnerLabel = layout.text.labelSmall * 0.85;

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
            NixCats - Lua-friendly Workflow
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
            Nix handles downloads / Lua stays your config
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: pkgOpacity }}>
        <div style={{ position: "relative", width: pkgWidth, height: pkgHeight }}>
          <svg viewBox={`0 0 ${pkgWidth} ${pkgHeight}`} style={{ position: "absolute", inset: 0 }}>
            {pkgItemXs.map((x, idx) => (
              <g key={`pkg-line-${idx}`}>
                <line
                  x1={pkgNixX + layout.icon.md * 0.45}
                  y1={pkgRowY}
                  x2={x - layout.icon.md * 0.45}
                  y2={pkgRowY}
                  stroke={NIX_ORANGE}
                  strokeWidth={6}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - pkgLineProgress}
                  opacity={0.6}
                />
                <polygon
                  points={`${x - layout.icon.md * 0.45},${pkgRowY - 10} ${x - layout.icon.md * 0.45 + 22},${pkgRowY} ${
                    x - layout.icon.md * 0.45
                  },${pkgRowY + 10}`}
                  fill={NIX_ORANGE}
                  opacity={0.6}
                />
              </g>
            ))}
          </svg>
          <div style={{ position: "absolute", left: pkgNixX, top: pkgRowY, transform: "translate(-50%, -50%)" }}>
            <IconWithLabel
              label="Nix (download & fetch)"
              labelSize={layout.text.labelSmall}
              accent={NIX_ORANGE}
              size={layout.icon.lg}
              labelStyle={{ maxWidth: scaleValue(420), lineHeight: 1.15 }}
            >
              <NixBlockIcon color={NIX_ORANGE} />
            </IconWithLabel>
          </div>
          {[
            {
              label: "Plugin sources",
              icon: <PackageIcon color={NEOVIM_GREEN} />,
              accent: NEOVIM_GREEN,
            },
            {
              label: "Binaries",
              icon: <ChipIcon color={LUA_BLUE} />,
              accent: LUA_BLUE,
            },
            {
              label: "LSP runtimes",
              icon: <ServerIcon color={HOT_PINK} />,
              accent: HOT_PINK,
            },
          ].map((item, idx) => {
            const pop = spring({ frame: frame - (t06 + 8 + idx * 6), fps, damping: 12, stiffness: 150 });
            const scale = interpolate(pop, [0, 1], [0.9, 1]);
            return (
              <div
                key={item.label}
                style={{
                  position: "absolute",
                  left: pkgItemXs[idx],
                  top: pkgRowY,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                }}
              >
                <IconWithLabel
                  label={item.label}
                  labelSize={layout.text.labelSmall}
                  accent={item.accent}
                  size={layout.icon.md}
                  labelStyle={{ maxWidth: scaleValue(320), lineHeight: 1.1 }}
                >
                  {item.icon}
                </IconWithLabel>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: "50%", bottom: scaleValue(90), transform: "translateX(-50%)" }}>
          <TagBadge
            label="Dependencies managed by Nix"
            accent={NEOVIM_GREEN}
            fontSize={layout.text.caption}
            paddingX={layout.padding.tagX}
            paddingY={layout.padding.tagY}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: luaOpacity }}>
        <div style={{ position: "relative", width: luaWidth, height: luaHeight }}>
          <div
            style={{
              position: "absolute",
              left: luaCenterX,
              top: luaCenterY,
              transform: `translate(-50%, -50%) scale(${luaScale})`,
            }}
          >
            <IconWithLabel
              label="~/.config/nvim"
              labelSize={layout.text.labelSmall}
              accent={LUA_BLUE}
              size={layout.icon.lg}
            >
              <LuaScriptIcon color={LUA_BLUE} />
            </IconWithLabel>
          </div>
          {[
            {
              label: "lazy.nvim",
              icon: <LazyIcon color={NEOVIM_GREEN} />,
              accent: NEOVIM_GREEN,
              x: luaCenterX - luaWidth * 0.32,
              y: luaCenterY + scaleValue(20),
            },
            {
              label: "plugin mgr",
              icon: <PuzzleIcon color={NIX_ORANGE} />,
              accent: NIX_ORANGE,
              x: luaCenterX + luaWidth * 0.32,
              y: luaCenterY + scaleValue(20),
            },
          ].map((item, idx) => {
            const pop = spring({ frame: frame - (t18 + 6 + idx * 5), fps, damping: 12, stiffness: 150 });
            const scale = interpolate(pop, [0, 1], [0.9, 1]);
            return (
              <div
                key={item.label}
                style={{
                  position: "absolute",
                  left: item.x,
                  top: item.y,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                }}
              >
                <IconWithLabel
                  label={item.label}
                  labelSize={layout.text.labelSmall}
                  accent={item.accent}
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
              left: luaCenterX + luaWidth * 0.2,
              top: luaCenterY + luaHeight * 0.22,
              transform: "translate(-50%, -50%)",
            }}
          >
            <IconShell size={layout.icon.tiny} accent={NEOVIM_GREEN}>
              <CheckIcon color={NEOVIM_GREEN} />
            </IconShell>
          </div>
          <div style={{ position: "absolute", left: "50%", bottom: scaleValue(8), transform: "translateX(-50%)" }}>
            <TagBadge
              label="Lua config stays intact"
              accent={LUA_BLUE}
              fontSize={layout.text.caption}
              paddingX={layout.padding.tagX}
              paddingY={layout.padding.tagY}
            />
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: prosOpacity }}>
        <div style={{ position: "relative", width: scaleValue(3000), height: scaleValue(860) }}>
          <div
            style={{
              position: "absolute",
              top: scaleValue(40),
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
          <div
            style={{
              position: "absolute",
              left: "6%",
              top: "26%",
              width: "46%",
              display: "flex",
              flexDirection: "column",
              gap: layout.spacing.gapList,
            }}
          >
            {[
              { title: "Quick start with Lua", icon: <LuaScriptIcon color={LUA_BLUE} />, accent: LUA_BLUE },
              { title: "Keep your workflow", icon: <LoopArrowIcon color={NEOVIM_GREEN} />, accent: NEOVIM_GREEN },
              { title: "Nix handles downloads", icon: <PackageIcon color={NIX_ORANGE} />, accent: NIX_ORANGE },
            ].map((item, idx) => {
              const pop = spring({ frame: frame - (t30 + 6 + idx * 6), fps, damping: 12, stiffness: 150 });
              const slide = interpolate(pop, [0, 1], [scaleValue(-40), 0]);
              return (
                <div key={item.title} style={{ transform: `translateX(${slide}px)` }}>
                  <ListItem
                    title={item.title}
                    accent={item.accent}
                    icon={item.icon}
                    iconSize={listIconSize}
                    titleSize={listTextSize}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", right: "6%", top: "24%" }}>
            <CardShell
              width={listCardWidth}
              height={listCardHeight}
              accent={NEOVIM_GREEN}
              radius={scaleValue(32)}
              paddingX={layout.padding.cardX}
              paddingY={layout.padding.cardY}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: scaleValue(26), alignItems: "center" }}>
                <IconShell size={layout.icon.md} accent={NEOVIM_GREEN}>
                  <CheckIcon color={NEOVIM_GREEN} />
                </IconShell>
                <div
                  style={{
                    fontSize: layout.text.label,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  Lua-first speed
                </div>
                <TagBadge
                  label="Fast adoption"
                  accent={NEOVIM_GREEN}
                  fontSize={layout.text.caption}
                  paddingX={layout.padding.tagX}
                  paddingY={layout.padding.tagY}
                />
              </div>
            </CardShell>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: consOpacity }}>
        <div style={{ position: "relative", width: scaleValue(3000), height: scaleValue(860) }}>
          <div
            style={{
              position: "absolute",
              top: scaleValue(40),
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
          <div style={{ position: "absolute", left: "6%", top: "24%" }}>
            <CardShell
              width={listCardWidth}
              height={listCardHeight}
              accent={HOT_PINK}
              radius={scaleValue(32)}
              paddingX={layout.padding.cardX}
              paddingY={layout.padding.cardY}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: scaleValue(26), alignItems: "center" }}>
                <IconShell size={layout.icon.md} accent={HOT_PINK}>
                  <WarningIcon color={HOT_PINK} />
                </IconShell>
                <div
                  style={{
                    fontSize: layout.text.label,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  Not fully declarative
                </div>
                <TagBadge
                  label="Lua logic remains"
                  accent={HOT_PINK}
                  fontSize={layout.text.caption}
                  paddingX={layout.padding.tagX}
                  paddingY={layout.padding.tagY}
                />
              </div>
            </CardShell>
          </div>
          <div
            style={{
              position: "absolute",
              right: "6%",
              top: "26%",
              width: "46%",
              display: "flex",
              flexDirection: "column",
              gap: layout.spacing.gapList,
              alignItems: "flex-end",
            }}
          >
            {[
              { title: "Logic lives in Lua", icon: <BrainIcon color={LUA_BLUE} />, accent: LUA_BLUE },
              { title: "Plugin behavior to manage", icon: <PuzzleIcon color={NEOVIM_GREEN} />, accent: NEOVIM_GREEN },
              { title: "More moving parts", icon: <WarningIcon color={HOT_PINK} />, accent: HOT_PINK },
            ].map((item, idx) => {
              const pop = spring({ frame: frame - (t45 + 6 + idx * 6), fps, damping: 12, stiffness: 150 });
              const slide = interpolate(pop, [0, 1], [scaleValue(40), 0]);
              return (
                <div key={item.title} style={{ transform: `translateX(${slide}px)` }}>
                  <ListItem
                    title={item.title}
                    accent={item.accent}
                    icon={item.icon}
                    iconSize={listIconSize}
                    titleSize={listTextSize}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: bestOpacity }}>
        <div style={{ position: "relative", width: bestWidth, height: bestHeight }}>
          <div
            style={{
              position: "absolute",
              top: bestTitleY,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: layout.text.title * 0.85,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Best for
          </div>
          <div style={{ position: "absolute", top: bestCardTop, left: "50%", transform: "translateX(-50%)" }}>
            <CardShell
              width={bestCardWidth}
              height={bestCardHeight}
              accent={NEOVIM_GREEN}
              radius={scaleValue(32)}
              paddingX={layout.padding.cardX}
              paddingY={layout.padding.cardY}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: layout.spacing.gapWide,
                }}
              >
                {[
                  {
                    label: "Neovim",
                    accent: NEOVIM_GREEN,
                    icon: <NeovimDiamondIcon color={NEOVIM_GREEN} />,
                  },
                  {
                    label: "Lua config",
                    accent: LUA_BLUE,
                    icon: <LuaScriptIcon color={LUA_BLUE} />,
                  },
                  {
                    label: "Nix fetch",
                    accent: NIX_ORANGE,
                    icon: <NixBlockIcon color={NIX_ORANGE} />,
                  },
                ].map((item, idx) => {
                  const pop = spring({ frame: frame - (t60 + 6 + idx * 5), fps, damping: 12, stiffness: 150 });
                  const scale = interpolate(pop, [0, 1], [0.92, 1]);
                  return (
                    <div
                      key={item.label}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: scaleValue(18),
                        transform: `scale(${scale})`,
                      }}
                    >
                      <IconShell size={bestInnerIcon} accent={item.accent}>
                        {item.icon}
                      </IconShell>
                      <div
                        style={{
                          fontSize: bestInnerLabel,
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
                  );
                })}
              </div>
            </CardShell>
          </div>
          <div style={{ position: "absolute", top: bestTagY, left: "50%", transform: "translateX(-50%)" }}>
            <TagBadge
              label="Lua first, Nix assists"
              accent={NEOVIM_GREEN}
              fontSize={layout.text.tag}
              paddingX={layout.padding.tagX}
              paddingY={layout.padding.tagY}
            />
          </div>
          <div style={{ position: "absolute", top: bestCaptionY, left: "50%", transform: "translateX(-50%)" }}>
            <div
              style={{
                fontSize: layout.text.caption,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Keep your workflow, get reproducibility
            </div>
          </div>
        </div>
      </div>

      <SceneProgressBar />
    </AbsoluteFill>
  );
};
