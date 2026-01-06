import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { SceneProgressBar } from "../../components/SceneProgressBar";

const NIX_ORANGE = "#ff9f4a";
const NEOVIM_GREEN = "#8affcf";
const LUA_BLUE = "#6fb6ff";
const HOT_PINK = "#ff7eb6";
const LILAC = "#b47cff";
const SOFT_WHITE = "#f7f4ff";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const fadeInOut = (frame: number, start: number, end: number, fadeIn = 12, fadeOut = 12) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const CENTER_STAGE: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
};

const BASE_WIDTH = 3440;

const BASE_LAYOUT = {
  container: {
    width: "92%",
    maxWidth: 3200,
    paddingInline: "2%",
    boxSizing: "border-box",
  } as CSSProperties,
  heights: {
    tall: "86%",
  },
  text: {
    title: 210,
    label: 96,
    labelSmall: 72,
    labelCompact: 56,
    labelXL: 120,
    tag: 84,
  },
  icon: {
    xl: 680,
    lg: 600,
    md: 500,
    sm: 340,
    xs: 260,
    bgNix: 760,
    bgNeovim: 720,
  },
  spacing: {
    gapWide: 90,
    gapLoose: 110,
    gapRow: 84,
    gapTight: 64,
  },
  padding: {
    titleY: 28,
    titleX: 56,
    tagY: 24,
    tagX: 52,
  },
  misc: {
    labelMinHeight: 90,
  },
};

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
      borderRadius: 32,
      background: `linear-gradient(150deg, rgba(10,12,30,0.92), rgba(28,14,56,0.85)), radial-gradient(circle at 20% 20%, ${accent}44, transparent 65%)`,
      border: `1px solid ${accent}66`,
      boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${accent}88`,
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
  size: number | string;
  labelSize: number;
  style?: CSSProperties;
  labelStyle?: CSSProperties;
  iconStyle?: CSSProperties;
  children: ReactNode;
}> = ({ label, accent, size, labelSize, style, labelStyle, iconStyle, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 18,
      ...style,
    }}
  >
    <IconShell size={size} accent={accent} style={iconStyle}>
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

const PackageIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <polygon points="70,16 120,40 70,64 20,40" fill={`${color}33`} stroke={color} strokeWidth="5" />
    <polygon points="20,40 70,64 70,104 20,80" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <polygon points="120,40 70,64 70,104 120,80" fill={`${color}44`} stroke={color} strokeWidth="5" />
  </svg>
);

const LoopArrowIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <circle cx="60" cy="60" r="36" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <path d="M40 54 L60 40 L80 54" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <path d="M80 66 L60 80 L40 66" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
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

const PuzzleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <rect x="26" y="26" width="68" height="68" rx="14" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="60" cy="26" r="10" fill={color} opacity="0.7" />
    <circle cx="94" cy="60" r="10" fill={color} opacity="0.7" />
  </svg>
);

const KeyIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <rect x="20" y="48" width="80" height="28" rx="12" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <circle cx="104" cy="62" r="14" fill={`${color}44`} stroke={color} strokeWidth="5" />
    <line x1="50" y1="62" x2="70" y2="62" stroke={color} strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const DownloadIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <rect x="20" y="18" width="80" height="84" rx="16" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <path d="M60 36 L60 70" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <polyline points="44,56 60,72 76,56" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const BinaryIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <rect x="20" y="20" width="80" height="80" rx="16" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <text
      x="60"
      y="68"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="26"
      fill={SOFT_WHITE}
      fontWeight="700"
    >
      BIN
    </text>
  </svg>
);

export const NIXCATS_INTRO_DURATION = 870;

export const NixCatsIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const scale = width / BASE_WIDTH;
  const scaleValue = (value: number) => value * scale;
  const layout = {
    container: {
      ...BASE_LAYOUT.container,
      maxWidth: scaleValue(BASE_LAYOUT.container.maxWidth),
    },
    heights: BASE_LAYOUT.heights,
    text: {
      title: scaleValue(BASE_LAYOUT.text.title),
      label: scaleValue(BASE_LAYOUT.text.label),
      labelSmall: scaleValue(BASE_LAYOUT.text.labelSmall),
      labelCompact: scaleValue(BASE_LAYOUT.text.labelCompact),
      labelXL: scaleValue(BASE_LAYOUT.text.labelXL),
      tag: scaleValue(BASE_LAYOUT.text.tag),
    },
    icon: {
      xl: scaleValue(BASE_LAYOUT.icon.xl),
      lg: scaleValue(BASE_LAYOUT.icon.lg),
      md: scaleValue(BASE_LAYOUT.icon.md),
      sm: scaleValue(BASE_LAYOUT.icon.sm),
      xs: scaleValue(BASE_LAYOUT.icon.xs),
      bgNix: scaleValue(BASE_LAYOUT.icon.bgNix),
      bgNeovim: scaleValue(BASE_LAYOUT.icon.bgNeovim),
    },
    spacing: {
      gapWide: scaleValue(BASE_LAYOUT.spacing.gapWide),
      gapLoose: scaleValue(BASE_LAYOUT.spacing.gapLoose),
      gapRow: scaleValue(BASE_LAYOUT.spacing.gapRow),
      gapTight: scaleValue(BASE_LAYOUT.spacing.gapTight),
    },
    padding: {
      titleY: scaleValue(BASE_LAYOUT.padding.titleY),
      titleX: scaleValue(BASE_LAYOUT.padding.titleX),
      tagY: scaleValue(BASE_LAYOUT.padding.tagY),
      tagX: scaleValue(BASE_LAYOUT.padding.tagX),
    },
    misc: {
      labelMinHeight: scaleValue(BASE_LAYOUT.misc.labelMinHeight),
    },
  };
  const managedArrowWidth = scaleValue(280);
  const managedArrowHeight = scaleValue(16);
  const managedLineHeight = scaleValue(8);
  const managedArrowHead = scaleValue(8);
  const managedArrowHeadWidth = scaleValue(14);
  const ribbonHeight = scaleValue(16);
  const ribbonCheckSize = scaleValue(64);
  const pluginAreaHeight = scaleValue(420);
  const luaLineHeight = scaleValue(10);
  const fetchArrowWidth = scaleValue(360);
  const fetchArrowHeight = scaleValue(16);
  const fetchRowGap = scaleValue(64);
  const fetchColumnGap = scaleValue(30);
  const fetchArrowHead = scaleValue(12);
  const fetchArrowHeadWidth = scaleValue(20);
  const sideOffsetX = scaleValue(80);
  const sideOffsetY = scaleValue(60);

  const t03 = 3 * fps;
  const t10 = 10 * fps;
  const t17 = 17 * fps;
  const t23 = 23 * fps;
  const t29 = 29 * fps;

  const waveOffset = Math.sin(frame / 40) * scaleValue(26);
  const waveShift = Math.sin(frame / 70) * scaleValue(30);

  const titleOpacity = fadeInOut(frame, 0, t03, 8, 12);
  const titlePop = spring({ frame, fps, damping: 12, stiffness: 160 });
  const titleScale = interpolate(titlePop, [0, 1], [0.9, 1]);
  const titleGlow = interpolate(Math.sin(frame / 12), [-1, 1], [0.2, 0.8]);
  const titleText = "Configuring NixCats-nvim";
  const titleType = Math.max(
    0,
    Math.floor(
      interpolate(frame, [0, Math.round(fps * 1.2)], [0, titleText.length], {
        extrapolateRight: "clamp",
      }),
    ),
  );
  const titleTyped = titleText.slice(0, titleType);
  const caretOpacity = interpolate(Math.sin(frame / 6), [-1, 1], [0.2, 1]);

  const managedOpacity = fadeInOut(frame, t03, t10, 10, 10);
  const managedPop = spring({ frame: frame - t03, fps, damping: 12, stiffness: 120 });
  const managedSlide = interpolate(managedPop, [0, 1], [scaleValue(160), 0], { extrapolateRight: "clamp" });
  const managedLabel = "Managed by Nix";
  const managedChars = Math.floor(
    interpolate(frame, [t03, t03 + 24], [0, managedLabel.length], { extrapolateRight: "clamp" }),
  );
  const managedTyped = managedLabel.slice(0, managedChars);
  const managedLine = clamp01((frame - (t03 + 12)) / 16);
  const managedLineGlow = interpolate(Math.sin(frame / 9), [-1, 1], [0.3, 0.8]);
  const managedArrowPulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.3, 0.8]);

  const bestOpacity = fadeInOut(frame, t10, t17, 10, 10);
  const ribbonProgress = clamp01((frame - (t10 + 8)) / 20);
  const ribbonGlow = interpolate(Math.sin(frame / 10), [-1, 1], [0.3, 0.8]);
  const bestTagScale = interpolate(Math.sin(frame / 12), [-1, 1], [0.98, 1.02]);
  const ribbonCheckPop = spring({ frame: frame - (t10 + 10), fps, damping: 12, stiffness: 160 });
  const ribbonCheckScale = interpolate(ribbonCheckPop, [0, 1], [0.8, 1], { extrapolateRight: "clamp" });
  const ribbonCheckOpacity = clamp01((frame - (t10 + 10)) / 10);
  const ribbonCheckX = interpolate(ribbonProgress, [0, 1], [0.06, 0.94]);

  const luaOpacity = fadeInOut(frame, t17, t23, 10, 10);
  const luaPulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.95, 1.05]);
  const pluginFlow = clamp01((frame - (t17 + 8)) / 18);
  const luaLine = clamp01((frame - (t17 + 6)) / 18);
  const luaCharge = interpolate(pluginFlow, [0, 1], [0.9, 1.35]);
  const luaGlow = interpolate(Math.sin(frame / 9), [-1, 1], [0.4, 0.9]) * luaCharge;

  const translateOpacity = fadeInOut(frame, t23, t29, 10, 10);
  const leftFade = clamp01((frame - t23) / 16);
  const rightPop = spring({ frame: frame - (t23 + 4), fps, damping: 12, stiffness: 120 });
  const rightShift = interpolate(rightPop, [0, 1], [scaleValue(120), 0], { extrapolateRight: "clamp" });
  const arrowProgress = clamp01((frame - (t23 + 10)) / 18);
  const arrowGlow = interpolate(Math.sin(frame / 7), [-1, 1], [0.3, 0.8]);
  const fetchPop = spring({ frame: frame - (t23 + 16), fps, damping: 12, stiffness: 140 });
  const fetchScale = interpolate(fetchPop, [0, 1], [0.9, 1], { extrapolateRight: "clamp" });

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
            transform: `scale(${titleScale})`,
            padding: `${layout.padding.titleY}px ${layout.padding.titleX}px`,
            borderRadius: 999,
            background: "rgba(8,10,26,0.78)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 50px rgba(127,232,255,${0.35 * titleGlow})`,
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
            <span
              style={{
                background: `linear-gradient(100deg, ${SOFT_WHITE} 10%, ${NEOVIM_GREEN} 40%, ${NIX_ORANGE} 70%, ${SOFT_WHITE} 90%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {titleTyped}
            </span>
            <span style={{ color: SOFT_WHITE, opacity: caretOpacity }}>|</span>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: managedOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: layout.spacing.gapWide,
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", transform: `translateX(${-managedSlide}px)` }}>
            <IconWithLabel label="Nix" accent={NIX_ORANGE} size={layout.icon.xl} labelSize={layout.text.label}>
              <NixBlockIcon color={NIX_ORANGE} />
            </IconWithLabel>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: layout.text.label,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: SOFT_WHITE,
                textShadow: "0 10px 26px rgba(0,0,0,0.5)",
                minHeight: layout.misc.labelMinHeight,
                whiteSpace: "nowrap",
              }}
            >
              {managedTyped}
            </div>
            <div
              style={{
                margin: `${scaleValue(12)}px auto ${scaleValue(6)}px`,
                width: managedArrowWidth,
                height: managedArrowHeight,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  top: "50%",
                  height: managedLineHeight,
                  transform: `translateY(-50%) scaleX(${managedLine})`,
                  transformOrigin: "left",
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${NIX_ORANGE}, ${NEOVIM_GREEN})`,
                  boxShadow: `0 0 18px rgba(255,159,74,${0.45 * managedLineGlow})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  top: "50%",
                  height: managedLineHeight,
                  transform: `translateY(-50%) scaleX(${managedLine})`,
                  transformOrigin: "left",
                  borderRadius: 999,
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.5 * managedArrowPulse}), transparent)`,
                  backgroundSize: "200% 100%",
                  backgroundPosition: `${frame * 5}% 0`,
                  opacity: managedLine * 0.6,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: managedLine * managedArrowWidth,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 0,
                  height: 0,
                  borderTop: `${managedArrowHead}px solid transparent`,
                  borderBottom: `${managedArrowHead}px solid transparent`,
                  borderLeft: `${managedArrowHeadWidth}px solid ${NEOVIM_GREEN}`,
                  opacity: managedLine,
                  filter: `drop-shadow(0 0 10px rgba(138,255,207,${0.6 * managedArrowPulse}))`,
                }}
              />
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: layout.text.labelSmall,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              package manager
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", transform: `translateX(${managedSlide}px)` }}>
            <IconWithLabel label="Neovim" accent={NEOVIM_GREEN} size={layout.icon.xl} labelSize={layout.text.label}>
              <NeovimDiamondIcon color={NEOVIM_GREEN} />
            </IconWithLabel>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: bestOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: scaleValue(40),
          }}
        >
          <div style={{ position: "relative", width: "100%" }}>
            <div
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                top: "50%",
                height: ribbonHeight,
                transform: "translateY(-50%)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  height: "100%",
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${NIX_ORANGE}, ${LUA_BLUE}, ${NEOVIM_GREEN})`,
                  transform: `scaleX(${ribbonProgress})`,
                  transformOrigin: "left",
                  boxShadow: `0 0 34px rgba(255,159,74,${0.5 * ribbonGlow})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  height: "100%",
                  borderRadius: 999,
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.5 * ribbonGlow}), transparent)`,
                  backgroundSize: "200% 100%",
                  backgroundPosition: `${frame * 4}% 0`,
                  transform: `scaleX(${ribbonProgress})`,
                  transformOrigin: "left",
                  opacity: ribbonProgress * 0.6,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${ribbonCheckX * 100}%`,
                  top: "50%",
                  transform: `translate(-50%, -50%) scale(${ribbonCheckScale})`,
                  opacity: ribbonCheckOpacity * ribbonProgress,
                }}
              >
                <div
                  style={{
                    width: ribbonCheckSize,
                    height: ribbonCheckSize,
                    borderRadius: 999,
                    background: "rgba(8,10,26,0.92)",
                    border: `1px solid ${NEOVIM_GREEN}88`,
                    boxShadow: `0 0 26px rgba(138,255,207,0.7)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg viewBox="0 0 24 24" style={{ width: "60%", height: "60%" }}>
                    <path
                      d="M5 13 L10 18 L19 7"
                      fill="none"
                      stroke={SOFT_WHITE}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: layout.spacing.gapRow,
              }}
            >
              {[
                { label: "Dependencies", accent: NIX_ORANGE, icon: <PackageIcon color={NIX_ORANGE} /> },
                { label: "Install", accent: LUA_BLUE, icon: <LoopArrowIcon color={LUA_BLUE} /> },
                { label: "Reproducible", accent: NEOVIM_GREEN, icon: <FlakeIcon color={NEOVIM_GREEN} /> },
              ].map((item, idx) => {
                const pop = spring({ frame: frame - (t10 + idx * 8), fps, damping: 12, stiffness: 140 });
                const scale = interpolate(pop, [0, 1], [0.85, 1], { extrapolateRight: "clamp" });
                const lift = interpolate(pop, [0, 1], [scaleValue(40), 0], { extrapolateRight: "clamp" });
                const glow = interpolate(Math.sin((frame + idx * 12) / 10), [-1, 1], [0.2, 0.7]);
                const labelSize =
                  item.label === "Reproducible" ? layout.text.labelCompact : layout.text.labelSmall;
                const labelStyle =
                  item.label === "Reproducible" ? { letterSpacing: 1, whiteSpace: "nowrap" } : undefined;
                return (
                  <div key={item.label} style={{ transform: `translateY(${lift}px) scale(${scale})` }}>
                    <IconWithLabel
                      label={item.label}
                      accent={item.accent}
                      size={layout.icon.lg}
                      labelSize={labelSize}
                      labelStyle={labelStyle}
                      iconStyle={{
                        filter: `drop-shadow(0 0 20px rgba(255,255,255,${0.35 * glow}))`,
                      }}
                    >
                      {item.icon}
                    </IconWithLabel>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ transform: `scale(${bestTagScale})` }}>
            <TagBadge
              label="Best of both worlds"
              accent={LILAC}
              fontSize={layout.text.tag}
              paddingX={layout.padding.tagX}
              paddingY={layout.padding.tagY}
            />
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: luaOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            alignItems: "center",
            gap: layout.spacing.gapLoose,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ transform: `scale(${luaPulse})` }}>
              <IconWithLabel
                label="Your config"
                accent={LUA_BLUE}
                size={layout.icon.xl}
                labelSize={layout.text.label}
                iconStyle={{
                  filter: `drop-shadow(0 0 26px rgba(111,182,255,${0.45 * luaGlow}))`,
                }}
              >
                <LuaScriptIcon color={LUA_BLUE} />
              </IconWithLabel>
            </div>
          </div>
          <div style={{ position: "relative", height: pluginAreaHeight }}>
            <div
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                top: "50%",
                height: luaLineHeight,
                transform: `translateY(-50%) scaleX(${luaLine})`,
                transformOrigin: "right",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${LUA_BLUE}, ${NEOVIM_GREEN})`,
                opacity: 0.6,
                boxShadow: `0 0 24px rgba(111,182,255,${0.4 * luaGlow})`,
              }}
            />
            {[0, 1, 2].map((idx) => {
              const startX = scaleValue(300 + idx * 140);
              const float = Math.sin((frame + idx * 14) / 9) * scaleValue(8);
              const drift = interpolate(pluginFlow, [0, 1], [0, -scaleValue(18)], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const y = scaleValue(40 + idx * 80) + drift + float;
              const x = interpolate(pluginFlow, [0, 1], [startX, scaleValue(80)], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const opacity = interpolate(pluginFlow, [0, 0.8, 1], [1, 1, 0.2]);
              const scale = interpolate(pluginFlow, [0, 1], [1, 0.78], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const glow = interpolate(Math.sin((frame + idx * 10) / 8), [-1, 1], [0.3, 0.8]);
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    opacity,
                    zIndex: 1,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                  }}
                >
                  <IconShell
                    size={layout.icon.sm}
                    accent={NEOVIM_GREEN}
                    style={{
                      filter: `drop-shadow(0 0 18px rgba(138,255,207,${0.5 * glow}))`,
                    }}
                  >
                    <PuzzleIcon color={NEOVIM_GREEN} />
                  </IconShell>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "8%", left: "50%", transform: "translateX(-50%)" }}>
          <TagBadge
            label="Lua stays the truth"
            accent={LUA_BLUE}
            fontSize={layout.text.tag}
            paddingX={layout.padding.tagX}
            paddingY={layout.padding.tagY}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: translateOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: layout.spacing.gapLoose,
          }}
        >
          <div
            style={{
              opacity: 1 - leftFade,
              transform: `translateX(${-leftFade * scaleValue(40)}px)`,
              display: "flex",
              justifyContent: "center",
              flex: "0 1 auto",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: layout.text.labelXL,
                textTransform: "uppercase",
                letterSpacing: 2,
                textShadow: "0 10px 26px rgba(0,0,0,0.5)",
                position: "relative",
                display: "inline-block",
                color: "rgba(255,255,255,0.8)",
                textAlign: "center",
              }}
            >
              Translate to Nix?
              <div
                style={{
                  position: "absolute",
                  left: "-6%",
                  right: "-6%",
                  top: "55%",
                  height: 8,
                  background: "rgba(255,126,182,0.9)",
                  transform: "rotate(-6deg)",
                  boxShadow: "0 0 18px rgba(255,126,182,0.8)",
                }}
              />
            </div>
          </div>
          <div
            style={{
              transform: `translateX(${rightShift}px)`,
              display: "flex",
              justifyContent: "center",
              flex: "0 1 auto",
              minWidth: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: fetchRowGap }}>
              <div style={{ position: "relative", zIndex: 2 }}>
                <IconShell size={layout.icon.xl} accent={LUA_BLUE}>
                  <LuaScriptIcon color={LUA_BLUE} />
                </IconShell>
                <div style={{ position: "absolute", right: -sideOffsetX, top: -sideOffsetY, zIndex: 1 }}>
                  <IconShell size={layout.icon.sm} accent={NEOVIM_GREEN}>
                    <PuzzleIcon color={NEOVIM_GREEN} />
                  </IconShell>
                </div>
                <div style={{ position: "absolute", left: -sideOffsetX, bottom: -sideOffsetY, zIndex: 1 }}>
                  <IconShell size={layout.icon.sm} accent={HOT_PINK}>
                    <KeyIcon color={HOT_PINK} />
                  </IconShell>
                </div>
              </div>
              <div style={{ position: "relative", width: fetchArrowWidth, height: fetchArrowHeight }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${LUA_BLUE}, ${NIX_ORANGE})`,
                    transform: `scaleX(${arrowProgress})`,
                    transformOrigin: "left",
                    boxShadow: `0 0 18px rgba(255,159,74,${0.45 * arrowGlow})`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: `${arrowProgress * fetchArrowWidth}px`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 0,
                    height: 0,
                    borderTop: `${fetchArrowHead}px solid transparent`,
                    borderBottom: `${fetchArrowHead}px solid transparent`,
                    borderLeft: `${fetchArrowHeadWidth}px solid ${NIX_ORANGE}`,
                    opacity: arrowProgress,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.6 * arrowGlow}), transparent)`,
                    backgroundSize: "200% 100%",
                    backgroundPosition: `${frame * 4}% 0`,
                    opacity: arrowProgress * 0.4,
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: fetchColumnGap }}>
                <IconShell
                  size={layout.icon.md}
                  accent={NIX_ORANGE}
                  style={{
                    transform: `scale(${fetchScale})`,
                    filter: `drop-shadow(0 0 18px rgba(255,159,74,${0.45 * arrowGlow}))`,
                  }}
                >
                  <DownloadIcon color={NIX_ORANGE} />
                </IconShell>
                <IconShell
                  size={layout.icon.md}
                  accent={NEOVIM_GREEN}
                  style={{
                    transform: `scale(${fetchScale})`,
                    filter: `drop-shadow(0 0 18px rgba(138,255,207,${0.45 * arrowGlow}))`,
                  }}
                >
                  <BinaryIcon color={NEOVIM_GREEN} />
                </IconShell>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "8%", left: "50%", transform: "translateX(-50%)" }}>
          <TagBadge
            label="Write in Lua. Let Nix fetch."
            accent={NIX_ORANGE}
            fontSize={layout.text.tag}
            paddingX={layout.padding.tagX}
            paddingY={layout.padding.tagY}
          />
        </div>
      </div>

      <SceneProgressBar />
    </AbsoluteFill>
  );
};
