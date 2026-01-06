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

const BASE_WIDTH = 3440;

const BASE_LAYOUT = {
  container: {
    width: "92%",
    maxWidth: 3200,
    paddingInline: "2%",
    boxSizing: "border-box",
  } as CSSProperties,
  text: {
    title: 210,
    label: 94,
    labelSmall: 70,
    caption: 56,
    tag: 76,
  },
  icon: {
    xl: 640,
    lg: 540,
    md: 440,
    sm: 320,
    xs: 240,
  },
  spacing: {
    gapWide: 120,
    gapLoose: 100,
    gapTight: 60,
  },
  padding: {
    titleX: 56,
    titleY: 24,
    tagX: 52,
    tagY: 22,
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

export const NIXCATS_SPECIAL_DURATION = 11 * 30;

export const NixCatsSpecialScene: React.FC = () => {
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

  const t02 = 2 * fps;
  const t06 = 6 * fps;
  const t10 = 10 * fps;
  const t11 = 11 * fps;

  const waveOffset = Math.sin(frame / 40) * scaleValue(24);
  const waveShift = Math.sin(frame / 70) * scaleValue(26);

  const headlineOpacity = fadeInOut(frame, 0, t02, 6, 8);
  const headlinePop = spring({ frame, fps, damping: 12, stiffness: 170 });
  const headlineScale = interpolate(headlinePop, [0, 1], [0.86, 1]);
  const headlineGlow = interpolate(Math.sin(frame / 10), [-1, 1], [0.2, 0.8]);
  const headlineText = "What makes NixCats special";
  const headlineType = Math.max(
    0,
    Math.floor(
      interpolate(frame, [0, Math.round(fps * 1.1)], [0, headlineText.length], {
        extrapolateRight: "clamp",
      }),
    ),
  );
  const headlineTyped = headlineText.slice(0, headlineType);
  const caretOpacity = interpolate(Math.sin(frame / 6), [-1, 1], [0.2, 1]);

  const luaOpacity = fadeInOut(frame, t02, t06, 8, 8);
  const luaPop = spring({ frame: frame - t02, fps, damping: 12, stiffness: 140 });
  const luaSlide = interpolate(luaPop, [0, 1], [-scaleValue(160), 0], { extrapolateRight: "clamp" });
  const luaLabel = "Lua config";
  const luaLabelChars = Math.floor(
    interpolate(frame, [t02 + 8, t02 + 26], [0, luaLabel.length], { extrapolateRight: "clamp" }),
  );
  const luaTyped = luaLabel.slice(0, luaLabelChars);
  const arrowProgress = clamp01((frame - (t02 + 10)) / 18);
  const arrowGlow = interpolate(Math.sin(frame / 8), [-1, 1], [0.3, 0.8]);
  const neovimScale = interpolate(Math.sin(frame / 12), [-1, 1], [0.98, 1.04]);

  const fetchOpacity = fadeInOut(frame, t06, t10, 8, 8);
  const nixSpin = interpolate(frame, [t06, t06 + Math.round(fps * 0.7)], [0, 360], {
    extrapolateRight: "clamp",
  });
  const fetchArrow = clamp01((frame - (t06 + 8)) / 18);
  const fetchArrowGlow = interpolate(Math.sin(frame / 9), [-1, 1], [0.3, 0.7]);
  const boxPop = spring({ frame: frame - (t06 + 10), fps, damping: 12, stiffness: 150 });
  const boxScale = interpolate(boxPop, [0, 1], [0.9, 1]);

  const pluginOpacity = fadeInOut(frame, t10, t11, 4, 6);
  const pluginPop = spring({ frame: frame - t10, fps, damping: 12, stiffness: 160 });
  const pluginScale = interpolate(pluginPop, [0, 1], [0.92, 1]);
  const pluginGlow = interpolate(Math.sin(frame / 7), [-1, 1], [0.4, 0.8]);

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

      <div style={{ ...CENTER_STAGE, opacity: headlineOpacity }}>
        <div
          style={{
            transform: `scale(${headlineScale})`,
            padding: `${layout.padding.titleY}px ${layout.padding.titleX}px`,
            borderRadius: 999,
            background: "rgba(8,10,26,0.78)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: `0 26px 90px rgba(0,0,0,0.65), 0 0 50px rgba(127,232,255,${0.35 * headlineGlow})`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontSize: layout.text.title * 0.7,
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
              {headlineTyped}
            </span>
            <span style={{ color: SOFT_WHITE, opacity: caretOpacity }}>|</span>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: luaOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: layout.spacing.gapWide,
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", transform: `translateX(${luaSlide}px)` }}>
            <IconWithLabel label={luaTyped} labelSize={layout.text.label} accent={LUA_BLUE} size={layout.icon.lg}>
              <LuaScriptIcon color={LUA_BLUE} />
            </IconWithLabel>
          </div>
          <div style={{ position: "relative", width: scaleValue(360), height: scaleValue(220) }}>
            <svg viewBox="0 0 360 220" style={{ width: "100%", height: "100%" }}>
              <path
                d="M20 180 C140 40 220 40 340 180"
                fill="none"
                stroke={NIX_ORANGE}
                strokeWidth={scaleValue(10)}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - arrowProgress}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                right: scaleValue(10),
                bottom: scaleValue(32),
                width: 0,
                height: 0,
                borderTop: `${scaleValue(12)}px solid transparent`,
                borderBottom: `${scaleValue(12)}px solid transparent`,
                borderLeft: `${scaleValue(20)}px solid ${NIX_ORANGE}`,
                opacity: arrowProgress,
                filter: `drop-shadow(0 0 12px rgba(255,159,74,${0.6 * arrowGlow}))`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxShadow: `0 0 30px rgba(255,159,74,${0.35 * arrowGlow})`,
                opacity: arrowProgress,
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", transform: `scale(${neovimScale})` }}>
            <IconShell size={layout.icon.lg} accent={NEOVIM_GREEN}>
              <NeovimDiamondIcon color={NEOVIM_GREEN} />
            </IconShell>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: scaleValue(110),
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <TagBadge
            label="Your workflow stays"
            accent={LUA_BLUE}
            fontSize={layout.text.caption}
            paddingX={layout.padding.tagX}
            paddingY={layout.padding.tagY}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: fetchOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: layout.spacing.gapTight,
          }}
        >
          <IconShell size={layout.icon.sm} accent={NIX_ORANGE} style={{ transform: `rotate(${nixSpin}deg)` }}>
            <NixBlockIcon color={NIX_ORANGE} />
          </IconShell>
          <div style={{ position: "relative", width: scaleValue(160), height: scaleValue(220) }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                width: scaleValue(10),
                height: "100%",
                transform: `translateX(-50%) scaleY(${fetchArrow})`,
                transformOrigin: "top",
                borderRadius: 999,
                background: `linear-gradient(180deg, ${NIX_ORANGE}, ${NEOVIM_GREEN})`,
                boxShadow: `0 0 26px rgba(255,159,74,${0.5 * fetchArrowGlow})`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: scaleValue(6),
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: `${scaleValue(14)}px solid transparent`,
                borderRight: `${scaleValue(14)}px solid transparent`,
                borderTop: `${scaleValue(22)}px solid ${NIX_ORANGE}`,
                opacity: fetchArrow,
              }}
            />
          </div>
          <div
            style={{
              width: scaleValue(980),
              height: scaleValue(360),
              borderRadius: 36,
              border: "1px solid rgba(255,255,255,0.2)",
              background:
                "linear-gradient(160deg, rgba(10,12,30,0.92), rgba(28,14,56,0.8))",
              boxShadow: `0 30px 90px rgba(0,0,0,0.6), 0 0 50px rgba(255,159,74,0.3)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: scaleValue(24),
              transform: `scale(${boxScale})`,
            }}
          >
            <div
              style={{
                fontSize: layout.text.labelSmall,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: SOFT_WHITE,
                textShadow: "0 10px 26px rgba(0,0,0,0.5)",
              }}
            >
              Dependencies
            </div>
            <div style={{ display: "flex", gap: layout.spacing.gapLoose }}>
              {[0, 1, 2].map((idx) => {
                const pop = spring({ frame: frame - (t06 + 12 + idx * 6), fps, damping: 12, stiffness: 160 });
                const scale = interpolate(pop, [0, 1], [0.85, 1], { extrapolateRight: "clamp" });
                const lift = interpolate(pop, [0, 1], [scaleValue(30), 0], { extrapolateRight: "clamp" });
                return (
                  <div key={idx} style={{ transform: `translateY(${lift}px) scale(${scale})` }}>
                    <IconShell size={layout.icon.xs} accent={NEOVIM_GREEN}>
                      <PuzzleIcon color={NEOVIM_GREEN} />
                    </IconShell>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: scaleValue(100),
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <TagBadge
            label="Nix fetches deps"
            accent={NIX_ORANGE}
            fontSize={layout.text.caption}
            paddingX={layout.padding.tagX}
            paddingY={layout.padding.tagY}
          />
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: pluginOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: layout.spacing.gapLoose,
            transform: `scale(${pluginScale})`,
          }}
        >
          <IconShell size={layout.icon.md} accent={NEOVIM_GREEN}>
            <NeovimDiamondIcon color={NEOVIM_GREEN} />
          </IconShell>
          <div style={{ display: "flex", alignItems: "center", gap: layout.spacing.gapTight }}>
            <IconShell size={layout.icon.xs} accent={LUA_BLUE}>
              <LazyIcon color={LUA_BLUE} />
            </IconShell>
            <div
              style={{
                fontSize: layout.text.labelSmall,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: SOFT_WHITE,
                textShadow: "0 10px 26px rgba(0,0,0,0.45)",
                padding: `${scaleValue(14)}px ${scaleValue(28)}px`,
                borderRadius: 999,
                background: "rgba(10,12,30,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: `0 0 24px rgba(127,232,255,${0.35 * pluginGlow})`,
              }}
            >
              lazy.nvim + friends
            </div>
          </div>
        </div>
      </div>

      <SceneProgressBar />
    </AbsoluteFill>
  );
};
