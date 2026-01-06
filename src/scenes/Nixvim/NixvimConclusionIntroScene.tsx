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
    title: 170,
    subtitle: 70,
    label: 90,
    labelSmall: 66,
    caption: 56,
  },
  icon: {
    xxl: 620,
    xl: 540,
    lg: 460,
    md: 360,
    sm: 280,
    xs: 220,
  },
  spacing: {
    gapWide: 140,
    gapLoose: 110,
    gapTight: 70,
  },
  padding: {
    titleX: 52,
    titleY: 20,
    tagX: 48,
    tagY: 18,
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

const FolderIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <path d="M18 38 H52 L62 26 H122 V94 H18 Z" fill={`${color}22`} stroke={color} strokeWidth="5" />
  </svg>
);

const FileIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 140" style={{ width: "78%", height: "78%" }}>
    <rect x="22" y="18" width="76" height="104" rx="10" fill={`${color}18`} stroke={color} strokeWidth="5" />
    <polygon points="74,18 98,42 74,42" fill={`${color}55`} />
  </svg>
);

const CrateIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "78%", height: "78%" }}>
    <rect x="20" y="28" width="100" height="70" rx="10" fill={`${color}22`} stroke={color} strokeWidth="5" />
    <line x1="20" y1="62" x2="120" y2="62" stroke={color} strokeWidth="5" />
  </svg>
);

const RocketIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "78%", height: "78%" }}>
    <path d="M60 10 L86 70 L60 88 L34 70 Z" fill={`${color}33`} stroke={color} strokeWidth="5" />
    <circle cx="60" cy="58" r="10" fill={`${color}55`} stroke={color} strokeWidth="4" />
    <path d="M60 88 L68 108 L60 100 L52 108 Z" fill="#ffbf6b" />
  </svg>
);

const Card: React.FC<{
  title: string;
  subtitle: string;
  accent: string;
  icon: ReactNode;
  width: number;
  height: number;
  paddingX: number;
  paddingY: number;
  titleSize: number;
  subtitleSize: number;
  radius: number;
  gap: number;
}> = ({ title, subtitle, accent, icon, width, height, paddingX, paddingY, titleSize, subtitleSize, radius, gap }) => (
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
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "flex-start",
      gap,
    }}
  >
    <div>{icon}</div>
    <div
      style={{
        fontSize: titleSize,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: SOFT_WHITE,
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontSize: subtitleSize,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.7)",
      }}
    >
      {subtitle}
    </div>
  </div>
);

const FrameworkCard: React.FC<{
  titleLines: string[];
  accent: string;
  width: number;
  height: number;
  radius: number;
  icon: ReactNode;
  iconSize: number;
  titleSize: number;
  gap: number;
}> = ({ titleLines, accent, width, height, radius, icon, iconSize, titleSize, gap }) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius,
      border: `1px solid ${accent}55`,
      background: "rgba(10,12,30,0.78)",
      boxShadow: `0 22px 70px rgba(0,0,0,0.45), 0 0 36px ${accent}22`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap,
      }}
    >
      <IconShell size={iconSize} accent={accent}>
        {icon}
      </IconShell>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          textAlign: "center",
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: SOFT_WHITE,
        }}
      >
        {titleLines.map((line) => (
          <div key={line} style={{ fontSize: titleSize, lineHeight: 1.05 }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const GoalCard: React.FC<{
  title: string;
  accent: string;
  width: number;
  height: number;
  radius: number;
  icon: ReactNode;
  iconSize: number;
  titleSize: number;
  gap: number;
  paddingX: number;
}> = ({ title, accent, width, height, radius, icon, iconSize, titleSize, gap, paddingX }) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius,
      border: `1px solid ${accent}55`,
      background: "rgba(10,12,30,0.78)",
      boxShadow: `0 24px 70px rgba(0,0,0,0.45), 0 0 40px ${accent}33`,
      padding: `0 ${paddingX}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap,
    }}
  >
    <IconShell size={iconSize} accent={accent}>
      {icon}
    </IconShell>
    <div
      style={{
        fontSize: titleSize,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: SOFT_WHITE,
        textAlign: "center",
      }}
    >
      {title}
    </div>
  </div>
);

export const NIXVIM_CONCLUSION_INTRO_DURATION = 39 * 30;

export const NixvimConclusionIntroScene: React.FC = () => {
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

  const t04 = 4 * fps;
  const t14 = 14 * fps;
  const t22 = 22 * fps;
  const t39 = 39 * fps;

  const waveOffset = Math.sin(frame / 40) * scaleValue(24);
  const waveShift = Math.sin(frame / 70) * scaleValue(28);

  const titleOpacity = fadeInOut(frame, 0, t04, 6, 8);
  const titleRise = interpolate(frame, [0, 12], [scaleValue(28), 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const underlineProgress = clamp01((frame - 6) / 14);
  const titleWords = ["Conclusion", "—", "How", "They", "Compare"];

  const commonOpacity = fadeInOut(frame, t04, t14, 8, 8);
  const commonLineProgress = clamp01((frame - (t04 + 8)) / 18);

  const contrastOpacity = fadeInOut(frame, t14, t22, 8, 8);
  const fileDrop = interpolate(frame, [t14 + 6, t14 + 24], [scaleValue(-220), 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rocketPop = spring({ frame: frame - (t14 + 18), fps, damping: 12, stiffness: 150 });
  const rocketScale = interpolate(rocketPop, [0, 1], [0.9, 1]);

  const cardsOpacity = fadeInOut(frame, t22, t39, 8, 10);

  const cardWidth = scaleValue(900);
  const cardHeight = scaleValue(520);
  const cardPaddingX = scaleValue(36);
  const cardPaddingY = scaleValue(32);
  const cardRadius = scaleValue(28);
  const cardGap = scaleValue(18);
  const commonWidth = scaleValue(2700);
  const commonHeight = scaleValue(880);
  const frameworkCardWidth = scaleValue(760);
  const frameworkCardHeight = scaleValue(300);
  const frameworkGap = layout.spacing.gapWide;
  const frameworkRowWidth = frameworkCardWidth * 3 + frameworkGap * 2;
  const frameworkStartX = (commonWidth - frameworkRowWidth) / 2;
  const frameworkCenters = [0, 1, 2].map(
    (idx) => frameworkStartX + frameworkCardWidth / 2 + idx * (frameworkCardWidth + frameworkGap)
  );
  const frameworkTopY = commonHeight * 0.24;
  const frameworkIconSize = layout.icon.xs * 0.78;
  const frameworkTitleSize = layout.text.label * 0.78;
  const sharedCardWidth = scaleValue(1320);
  const sharedCardHeight = scaleValue(260);
  const sharedCardY = commonHeight * 0.62;
  const connectorStartY = frameworkTopY + frameworkCardHeight / 2;
  const connectorEndY = sharedCardY - sharedCardHeight / 2;
  const tagY = commonHeight * 0.9;
  const goalIconSize = layout.icon.sm * 0.68;
  const goalTextSize = layout.text.label * 0.72;

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
            transform: `translateY(${titleRise}px)`,
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
              gap: scaleValue(28),
              fontSize: layout.text.title,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              textShadow: "0 14px 40px rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
            }}
          >
            {titleWords.map((word, idx) => {
              const delay = idx * 4;
              const wordOpacity = interpolate(frame, [delay, delay + 6], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <span
                  key={`${word}-${idx}`}
                  style={{ opacity: wordOpacity, paddingInline: scaleValue(6) }}
                >
                  {word}
                </span>
              );
            })}
          </div>
          <div
            style={{
              marginTop: scaleValue(16),
              width: scaleValue(1050),
              height: scaleValue(8),
              borderRadius: 999,
              background: `linear-gradient(90deg, ${NIX_ORANGE}, ${NEUTRAL_BLUE}, ${NEOVIM_GREEN})`,
              transform: `scaleX(${underlineProgress})`,
              transformOrigin: "center",
              boxShadow: "0 0 30px rgba(127,232,255,0.35)",
            }}
          />
        </div>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {[0, 1, 2].map((idx) => {
            const left = idx === 0 ? "12%" : idx === 1 ? "50%" : "86%";
            const top = idx === 0 ? "20%" : idx === 1 ? "18%" : "24%";
            const accent = idx === 0 ? NIX_ORANGE : idx === 1 ? LUA_BLUE : NEOVIM_GREEN;
            const icon = idx === 0 ? <NixBlockIcon color={accent} /> : idx === 1 ? <LuaScriptIcon color={accent} /> : <FlakeIcon color={accent} />;
            return (
              <div
                key={`bg-icon-${idx}`}
                style={{
                  position: "absolute",
                  left,
                  top,
                  transform: "translate(-50%, -50%)",
                  opacity: 0.08,
                }}
              >
                <IconShell size={layout.icon.xs} accent={accent}>
                  {icon}
                </IconShell>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: commonOpacity }}>
        <div style={{ position: "relative", width: commonWidth, height: commonHeight }}>
          <svg viewBox={`0 0 ${commonWidth} ${commonHeight}`} style={{ position: "absolute", inset: 0 }}>
            {frameworkCenters.map((x, idx) => (
              <line
                key={`line-${idx}`}
                x1={x}
                y1={connectorStartY}
                x2={commonWidth * 0.5}
                y2={connectorEndY}
                stroke={NIX_ORANGE}
                strokeWidth={6}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - commonLineProgress}
                opacity={0.55}
              />
            ))}
          </svg>
          {frameworkCenters.map((x, idx) => {
            const pop = spring({ frame: frame - (t04 + idx * 6), fps, damping: 12, stiffness: 150 });
            const scale = interpolate(pop, [0, 1], [0.9, 1]);
            const lift = interpolate(pop, [0, 1], [scaleValue(36), 0]);
            const accent = idx === 0 ? NIX_ORANGE : idx === 1 ? LUA_BLUE : NEOVIM_GREEN;
            const titleLines = idx === 0 ? ["NIXVIM"] : idx === 1 ? ["NIXCATS"] : ["NIX VIM", "FRAMEWORK"];
            const icon =
              idx === 0 ? <NixBlockIcon color={accent} /> : idx === 1 ? <LuaScriptIcon color={accent} /> : <FlakeIcon color={accent} />;
            const titleSize = idx === 2 ? frameworkTitleSize * 0.8 : frameworkTitleSize;
            return (
              <div
                key={`framework-${idx}`}
                style={{
                  position: "absolute",
                  left: x,
                  top: frameworkTopY,
                  transform: `translate(-50%, -50%) translateY(${lift}px) scale(${scale})`,
                }}
              >
                <FrameworkCard
                  titleLines={titleLines}
                  accent={accent}
                  width={frameworkCardWidth}
                  height={frameworkCardHeight}
                  radius={scaleValue(28)}
                  icon={icon}
                  iconSize={frameworkIconSize}
                  titleSize={titleSize}
                  gap={scaleValue(18)}
                />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: "50%", top: sharedCardY, transform: "translate(-50%, -50%)" }}>
            <GoalCard
              title="Reproducible Neovim with Nix"
              accent={NEOVIM_GREEN}
              width={sharedCardWidth}
              height={sharedCardHeight}
              radius={scaleValue(28)}
              icon={
                <div style={{ position: "relative" }}>
                  <FlakeIcon color={NEOVIM_GREEN} />
                  <div style={{ position: "absolute", inset: "18%" }}>
                    <GearIcon color={NEUTRAL_BLUE} />
                  </div>
                </div>
              }
              iconSize={goalIconSize}
              titleSize={goalTextSize}
              gap={scaleValue(32)}
              paddingX={scaleValue(32)}
            />
          </div>
          <div style={{ position: "absolute", left: "50%", top: tagY, transform: "translate(-50%, -50%)" }}>
            <TagBadge
              label="Portable. Declarative. Shareable."
              accent={NEUTRAL_BLUE}
              fontSize={layout.text.caption}
              paddingX={layout.padding.tagX}
              paddingY={layout.padding.tagY}
            />
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: contrastOpacity }}>
        <div style={{ position: "relative", width: scaleValue(2200), height: scaleValue(700) }}>
          <div style={{ position: "absolute", left: "18%", top: "46%", transform: "translate(-50%, -50%)" }}>
            <IconWithLabel
              label="flake.nix"
              labelSize={layout.text.caption}
              accent={NEUTRAL_BLUE}
              size={layout.icon.sm}
            >
              <FolderIcon color={NEUTRAL_BLUE} />
            </IconWithLabel>
          </div>
          <div style={{ position: "absolute", left: "50%", top: "46%", transform: "translate(-50%, -50%)" }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "-10%",
                  transform: `translate(-50%, ${fileDrop}px)`,
                  opacity: 0.9,
                }}
              >
                <IconShell size={layout.icon.xs} accent={NEUTRAL_BLUE}>
                  <FileIcon color={NEUTRAL_BLUE} />
                </IconShell>
              </div>
              <IconShell size={layout.icon.md} accent={NIX_ORANGE}>
                <CrateIcon color={NIX_ORANGE} />
              </IconShell>
            </div>
          </div>
          <div style={{ position: "absolute", left: "82%", top: "46%", transform: "translate(-50%, -50%)" }}>
            <div style={{ transform: `scale(${rocketScale})` }}>
              <IconWithLabel
                label="Portable"
                labelSize={layout.text.caption}
                accent={NEOVIM_GREEN}
                size={layout.icon.sm}
              >
                <RocketIcon color={NEOVIM_GREEN} />
              </IconWithLabel>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...CENTER_STAGE, opacity: cardsOpacity }}>
        <div
          style={{
            ...layout.container,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: layout.spacing.gapLoose,
          }}
        >
          {[
            {
              title: "Nixvim",
              subtitle: "Nix modules",
              accent: NIX_ORANGE,
              icon: (
                <div style={{ display: "flex", gap: 16 }}>
                  <IconShell size={layout.icon.xs} accent={NIX_ORANGE}>
                    <NixBlockIcon color={NIX_ORANGE} />
                  </IconShell>
                  <IconShell size={layout.icon.xs} accent={NEUTRAL_BLUE}>
                    <GearIcon color={NEUTRAL_BLUE} />
                  </IconShell>
                </div>
              ),
            },
            {
              title: "NixCats",
              subtitle: "Lua + Nix fetch",
              accent: LUA_BLUE,
              icon: (
                <div style={{ display: "flex", gap: 16 }}>
                  <IconShell size={layout.icon.xs} accent={LUA_BLUE}>
                    <LuaScriptIcon color={LUA_BLUE} />
                  </IconShell>
                  <IconShell size={layout.icon.xs} accent={NIX_ORANGE}>
                    <NixBlockIcon color={NIX_ORANGE} />
                  </IconShell>
                </div>
              ),
            },
            {
              title: "NVF",
              subtitle: "Full declarative",
              accent: NEOVIM_GREEN,
              icon: (
                <div style={{ display: "flex", gap: 16 }}>
                  <IconShell size={layout.icon.xs} accent={NEUTRAL_BLUE}>
                    <FlakeIcon color={NEUTRAL_BLUE} />
                  </IconShell>
                  <IconShell size={layout.icon.xs} accent={NEOVIM_GREEN}>
                    <GearIcon color={NEOVIM_GREEN} />
                  </IconShell>
                </div>
              ),
            },
          ].map((card, idx) => {
            const pop = spring({ frame: frame - (t22 + idx * 6), fps, damping: 12, stiffness: 140 });
            const scale = interpolate(pop, [0, 1], [0.92, 1]);
            const slide = interpolate(pop, [0, 1], [scaleValue((idx - 1) * 80), 0]);
            return (
              <div key={card.title} style={{ transform: `translateX(${slide}px) scale(${scale})` }}>
                <Card
                  title={card.title}
                  subtitle={card.subtitle}
                  accent={card.accent}
                  icon={card.icon}
                  width={cardWidth}
                  height={cardHeight}
                  paddingX={cardPaddingX}
                  paddingY={cardPaddingY}
                  titleSize={layout.text.label}
                  subtitleSize={layout.text.labelSmall}
                  radius={cardRadius}
                  gap={cardGap}
                />
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", bottom: scaleValue(90), left: "50%", transform: "translateX(-50%)" }}>
          <TagBadge
            label="Similar goal, different philosophy"
            accent={NEUTRAL_BLUE}
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
