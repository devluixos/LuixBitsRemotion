import type { ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { GlassCard } from "../../components/GlassCard";
import { SceneProgressBar } from "../../components/SceneProgressBar";

export const CURRENT_SETUP_SCENE_9_DURATION = 870; // Scene 9, 29.00 seconds @ 30fps

const BASE_WIDTH = 3440;

const HOT_PINK = "#ff5da2";
const NIX_ORANGE = "#ff9f4a";
const NEUTRAL_BLUE = "#7fe8ff";
const NEOVIM_GREEN = "#8affcf";
const SOLAR_GOLD = "#ffd86c";
const SOFT_WHITE = "#f7f4ff";
const MUTED_TEXT = "rgba(247,244,255,0.66)";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CodeLine = {
  id: string;
  number: string;
  text: string;
  accent?: string;
};

type ChipData = {
  id: string;
  label: string;
  accent: string;
};

const PC_HOST_LINES: CodeLine[] = [
  {
    id: "username",
    number: "4",
    text: 'home.username = "luix";',
    accent: HOT_PINK,
  },
  {
    id: "home-dir",
    number: "5",
    text: 'home.homeDirectory = "/home/luix";',
    accent: SOLAR_GOLD,
  },
  {
    id: "imports-a",
    number: "8",
    text: "../modules/applications ../modules/cli ../modules/programming",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "imports-b",
    number: "11",
    text: "../modules/kitty ../modules/fish ../modules/niri",
    accent: NIX_ORANGE,
  },
  {
    id: "imports-c",
    number: "14",
    text: "../modules/qutebrowser ../modules/nvfvim ../modules/flatpak",
    accent: NEOVIM_GREEN,
  },
];

const LAPTOP_HOST_LINES: CodeLine[] = [
  {
    id: "username",
    number: "4",
    text: 'home.username = "luix";',
    accent: HOT_PINK,
  },
  {
    id: "home-dir",
    number: "5",
    text: 'home.homeDirectory = "/home/luix";',
    accent: SOLAR_GOLD,
  },
  {
    id: "imports-a",
    number: "8",
    text: "../modules/applications ../modules/cli ../modules/programming",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "imports-b",
    number: "11",
    text: "../modules/kitty ../modules/fish ../modules/niri",
    accent: NIX_ORANGE,
  },
  {
    id: "imports-c",
    number: "14",
    text: "../modules/qutebrowser ../modules/nvfvim ../modules/flatpak",
    accent: NEOVIM_GREEN,
  },
];

const WORK_HOST_LINES: CodeLine[] = [
  {
    id: "username",
    number: "4",
    text: 'home.username = "luiz";',
    accent: HOT_PINK,
  },
  {
    id: "home-dir",
    number: "5",
    text: 'home.homeDirectory = "/home/luiz";',
    accent: SOLAR_GOLD,
  },
  {
    id: "imports-a",
    number: "8",
    text: "../modules/applications ../modules/cli ../modules/programming",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "imports-b",
    number: "11",
    text: "../modules/kitty ../modules/fish ../modules/nvfvim",
    accent: NIX_ORANGE,
  },
  {
    id: "imports-c",
    number: "14",
    text: "../modules/work",
    accent: HOT_PINK,
  },
];

const SHARED_STACK_LINES: CodeLine[] = [
  {
    id: "shared-import-a",
    number: "8",
    text: "../modules/applications ../modules/cli ../modules/programming",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "shared-import-b",
    number: "11",
    text: "../modules/kitty ../modules/fish ../modules/niri",
    accent: NIX_ORANGE,
  },
  {
    id: "shared-import-c",
    number: "14",
    text: "../modules/qutebrowser ../modules/nvfvim ../modules/flatpak",
    accent: NEOVIM_GREEN,
  },
];

const WORK_VARIANT_LINES: CodeLine[] = [
  {
    id: "variant-user",
    number: "4",
    text: 'home.username = "luiz";',
    accent: HOT_PINK,
  },
  {
    id: "variant-dir",
    number: "5",
    text: 'home.homeDirectory = "/home/luiz";',
    accent: SOLAR_GOLD,
  },
  {
    id: "variant-import",
    number: "14",
    text: "../modules/work",
    accent: HOT_PINK,
  },
];

const WORK_MODULE_LINES: CodeLine[] = [
  {
    id: "git-enable",
    number: "3",
    text: "programs.git = { enable = true; lfs.enable = true; };",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "git-user",
    number: "8",
    text: 'user.name = "Luiz Perren";',
    accent: HOT_PINK,
  },
  {
    id: "packages-tools",
    number: "18",
    text: "azure-cli kubectl kubelogin teams-for-linux vivaldi",
    accent: NIX_ORANGE,
  },
];

const SHARED_CHIPS: ChipData[] = [
  { id: "applications", label: "applications", accent: NEUTRAL_BLUE },
  { id: "cli", label: "cli", accent: NIX_ORANGE },
  { id: "niri", label: "niri", accent: HOT_PINK },
  { id: "nvfvim", label: "nvfvim", accent: NEOVIM_GREEN },
];

const WORK_CHIPS: ChipData[] = [
  { id: "username", label: "username", accent: HOT_PINK },
  { id: "git", label: "git", accent: NEUTRAL_BLUE },
  { id: "tools", label: "work tools", accent: NIX_ORANGE },
];

const ENVIRONMENT_CHIPS = [
  { id: "fish", label: "fish", accent: NIX_ORANGE, x: 16, y: 39 },
  { id: "kitty", label: "kitty", accent: SOLAR_GOLD, x: 25, y: 70 },
  { id: "niri", label: "niri", accent: HOT_PINK, x: 50, y: 22 },
  { id: "nvfvim", label: "nvfvim", accent: NEOVIM_GREEN, x: 76, y: 39 },
  { id: "git", label: "git", accent: NEUTRAL_BLUE, x: 68, y: 70 },
  { id: "tools", label: "tools", accent: HOT_PINK, x: 36, y: 84 },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const progressBetween = (frame: number, start: number, end: number) =>
  clamp01(
    interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

const presenceBetween = (
  frame: number,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number,
) =>
  clamp01(
    interpolate(
      frame,
      [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
      [0, 1, 1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ),
  );

const Dots = () => (
  <div style={{ display: "flex", gap: 12 }}>
    {["#ff5da2", "#ffbdde", "#8afff7"].map((color) => (
      <span
        key={color}
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 14px ${color}55`,
        }}
      />
    ))}
  </div>
);

const HouseIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
    <path
      d="M10 30 32 12l22 18"
      fill="none"
      stroke={color}
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 28v24h28V28"
      fill={`${color}14`}
      stroke={color}
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
    <path
      d="M27 52V38h10v14"
      fill="none"
      stroke={color}
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
  </svg>
);

const FileIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
    <path
      d="M18 8h22l10 10v30c0 4.4-3.6 8-8 8H18c-4.4 0-8-3.6-8-8V16c0-4.4 3.6-8 8-8Z"
      fill={`${color}18`}
      stroke={color}
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path
      d="M40 8v14h14"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 32h20M20 42h20"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const Chip = ({
  label,
  accent,
  reveal,
  fontSize,
  emphasis = 1,
}: {
  label: string;
  accent: string;
  reveal: number;
  fontSize: number;
  emphasis?: number;
}) => (
  <div
    style={{
      transform: `translateY(${mix(24, 0, reveal)}px) scale(${mix(
        0.94,
        mix(0.96, 1.04, emphasis),
        reveal,
      )})`,
      opacity: clamp01(reveal * 1.08) * mix(0.28, 1, emphasis),
      borderRadius: 34,
      minHeight: fontSize * 2.28,
      padding: `${fontSize * 0.54}px ${fontSize * 0.8}px`,
      background:
        emphasis > 0.72
          ? `linear-gradient(145deg, ${accent}18, rgba(14,10,34,0.96))`
          : "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(14,10,34,0.92))",
      border: `1px solid ${accent}${emphasis > 0.72 ? "34" : "14"}`,
      boxShadow:
        emphasis > 0.72 ? `0 0 18px ${accent}18` : `0 0 8px ${accent}08`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontSize,
        lineHeight: 0.92,
        fontWeight: 800,
        color: emphasis > 0.72 ? SOFT_WHITE : "rgba(247,244,255,0.74)",
      }}
    >
      {label}
    </div>
  </div>
);

const SceneCard = ({
  rect,
  reveal,
  tilt = 0,
  zIndex,
  children,
}: {
  rect: Rect;
  reveal: number;
  tilt?: number;
  zIndex: number;
  children: ReactNode;
}) => {
  if (reveal <= 0.01) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        transform: `translate(-50%, -50%) translateY(${mix(52, 0, reveal)}px) rotate(${mix(
          tilt - 1,
          tilt,
          reveal,
        )}deg) scale(${mix(0.95, 1, reveal)})`,
        opacity: clamp01(reveal * 1.08),
        zIndex,
      }}
    >
      {children}
    </div>
  );
};

const OverlayTitle = ({
  text,
  color,
  opacity,
  top = "7%",
}: {
  text: string;
  color: string;
  opacity: number;
  top?: string;
}) => {
  if (opacity <= 0.01) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top,
        transform: `translateX(-50%) scale(${mix(0.96, 1, opacity)})`,
        opacity,
        fontSize: 92,
        lineHeight: 0.9,
        fontWeight: 800,
        color,
        letterSpacing: 1,
        textShadow: `0 0 28px ${color}30`,
        zIndex: 50,
      }}
    >
      {text}
    </div>
  );
};

const CodeCard = ({
  rect,
  reveal,
  host,
  fileLabel,
  accent,
  lines,
  codeSize,
  tilt = 0,
  zIndex,
  icon = "file",
}: {
  rect: Rect;
  reveal: number;
  host: string;
  fileLabel: string;
  accent: string;
  lines: CodeLine[];
  codeSize: number;
  tilt?: number;
  zIndex: number;
  icon?: "file" | "home";
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={tilt} zIndex={zIndex}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 42,
        background:
          "linear-gradient(145deg, rgba(10,8,30,0.98), rgba(18,14,38,0.95))",
        border: `1px solid ${accent}1f`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 38,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 18% 12%, ${accent}16, transparent 24%), radial-gradient(circle at 84% 18%, rgba(127,232,255,0.08), transparent 22%)`,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: rect.width * 0.055,
            top: rect.height * 0.065,
            right: rect.width * 0.055,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Dots />
          <div
            style={{
              fontSize: codeSize * 0.62,
              lineHeight: 0.9,
              color: MUTED_TEXT,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            {fileLabel}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: rect.width * 0.055,
            top: rect.height * 0.18,
            display: "flex",
            alignItems: "center",
            gap: rect.width * 0.015,
          }}
        >
          <div
            style={{
              width: codeSize * 1.28,
              height: codeSize * 1.28,
              borderRadius: codeSize * 0.28,
              background: `${accent}14`,
              border: `1px solid ${accent}34`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon === "home" ? (
              <HouseIcon color={accent} />
            ) : (
              <FileIcon color={accent} />
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: codeSize * 0.52,
                lineHeight: 0.9,
                color: MUTED_TEXT,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: codeSize * 0.18,
              }}
            >
              host
            </div>
            <div
              style={{
                fontSize:
                  host.length >= 10
                    ? codeSize * 0.98
                    : host.length >= 6
                      ? codeSize * 1.14
                      : codeSize * 1.34,
                lineHeight: 0.84,
                fontWeight: 800,
                color: SOFT_WHITE,
              }}
            >
              {host}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: rect.width * 0.06,
            right: rect.width * 0.06,
            top: rect.height * 0.42,
            bottom: rect.height * 0.08,
            display: "flex",
            flexDirection: "column",
            gap: codeSize * 0.18,
          }}
        >
          {lines.map((line) => (
            <div
              key={line.id}
              style={{
                borderRadius: codeSize * 0.28,
                padding: `${codeSize * 0.16}px ${codeSize * 0.24}px`,
                background: `linear-gradient(90deg, ${(line.accent ?? accent) + "14"}, rgba(255,255,255,0.02))`,
                border: `1px solid ${(line.accent ?? accent) + "24"}`,
                display: "grid",
                gridTemplateColumns: `${rect.width * 0.07}px 1fr`,
                gap: codeSize * 0.18,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: codeSize * 0.52,
                  color: MUTED_TEXT,
                  textAlign: "right",
                }}
              >
                {line.number}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: codeSize,
                  lineHeight: 1.08,
                  fontWeight: 700,
                  color: line.accent ?? SOFT_WHITE,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
              >
                {line.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const Board = ({
  rect,
  reveal,
  label,
  title,
  accent,
  zIndex,
  children,
}: {
  rect: Rect;
  reveal: number;
  label: string;
  title: string;
  accent: string;
  zIndex: number;
  children: ReactNode;
}) => (
  <SceneCard rect={rect} reveal={reveal} zIndex={zIndex}>
    <GlassCard
      style={{
        height: "100%",
        padding: "34px 36px",
        borderRadius: 44,
        background:
          "linear-gradient(145deg, rgba(8,6,28,0.97), rgba(22,10,48,0.94))",
        border: `1px solid ${accent}22`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 16% 12%, ${accent}16, transparent 28%)`,
          }}
        />
        <div
          style={{
            position: "relative",
            fontSize: 32,
            lineHeight: 0.9,
            color: MUTED_TEXT,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {label}
        </div>
        <div
          style={{
            position: "relative",
            fontSize: 96,
            lineHeight: 0.84,
            fontWeight: 800,
            color: SOFT_WHITE,
            marginBottom: 28,
          }}
        >
          {title}
        </div>
        <div style={{ position: "relative", height: `calc(100% - 132px)` }}>
          {children}
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const HostChip = ({
  label,
  accent,
  reveal,
  emphasis,
  x,
  y,
}: {
  label: string;
  accent: string;
  reveal: number;
  emphasis: number;
  x: number;
  y: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: "16%",
      transform: `translate(-50%, -50%) translateY(${mix(26, 0, reveal)}px) scale(${mix(
        0.94,
        mix(0.96, 1.06, emphasis),
        reveal,
      )})`,
      opacity: clamp01(reveal * 1.08) * mix(0.3, 1, emphasis),
      zIndex: 18,
    }}
  >
    <Chip
      label={label}
      accent={accent}
      reveal={reveal}
      fontSize={52}
      emphasis={emphasis}
    />
  </div>
);

const EnvironmentChip = ({
  label,
  accent,
  x,
  y,
  reveal,
}: {
  label: string;
  accent: string;
  x: number;
  y: number;
  reveal: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(-50%, -50%) translateY(${mix(28, 0, reveal)}px) scale(${mix(
        0.92,
        1,
        reveal,
      )})`,
      opacity: clamp01(reveal * 1.08),
      zIndex: 22,
    }}
  >
    <Chip label={label} accent={accent} reveal={reveal} fontSize={40} />
  </div>
);

const ConnectorPaths = ({
  width,
  height,
  opacity,
}: {
  width: number;
  height: number;
  opacity: number;
}) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    style={{
      position: "absolute",
      inset: 0,
      opacity,
      zIndex: 6,
      pointerEvents: "none",
    }}
  >
    {[
      {
        d: `M ${width * 0.16} ${height * 0.19} C ${width * 0.18} ${height * 0.28}, ${
          width * 0.2
        } ${height * 0.32}, ${width * 0.26} ${height * 0.37}`,
        color: NEUTRAL_BLUE,
      },
      {
        d: `M ${width * 0.33} ${height * 0.19} C ${width * 0.33} ${height * 0.29}, ${
          width * 0.31
        } ${height * 0.33}, ${width * 0.26} ${height * 0.37}`,
        color: SOLAR_GOLD,
      },
      {
        d: `M ${width * 0.78} ${height * 0.19} C ${width * 0.77} ${height * 0.28}, ${
          width * 0.76
        } ${height * 0.31}, ${width * 0.74} ${height * 0.37}`,
        color: HOT_PINK,
      },
    ].map((path) => (
      <g key={path.d}>
        <path
          d={path.d}
          fill="none"
          stroke={path.color}
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.44}
        />
        <path
          d={path.d}
          fill="none"
          stroke={path.color}
          strokeWidth={18}
          strokeLinecap="round"
          opacity={0.08}
        />
      </g>
    ))}
  </svg>
);

export const CurrentSetupScene9 = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const scaleValue = (value: number) => value * (width / BASE_WIDTH);

  const stage = {
    width: scaleValue(3080),
    height: scaleValue(1180),
    paddingX: scaleValue(118),
    paddingY: scaleValue(84),
  };

  const openingPcPresence = presenceBetween(frame, 0, 22, 88, 114);
  const openingLaptopPresence = presenceBetween(frame, 96, 122, 184, 212);
  const openingWorkPresence = presenceBetween(frame, 192, 220, 280, 310);
  const openingPresence = Math.max(
    openingPcPresence,
    openingLaptopPresence,
    openingWorkPresence,
  );

  const splitPresence = presenceBetween(frame, 292, 330, 650, 692);
  const finalPresence = progressBetween(frame, 662, 710);

  const openingTitleOpacity = presenceBetween(frame, 18, 42, 246, 278);
  const openingReveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 118, mass: 0.96 },
  });

  const sharedBoardReveal = spring({
    fps,
    frame: frame - 304,
    config: { damping: 18, stiffness: 120, mass: 0.96 },
  });

  const workBoardReveal = spring({
    fps,
    frame: frame - 364,
    config: { damping: 18, stiffness: 122, mass: 0.96 },
  });

  const workHostCardPresence = presenceBetween(frame, 374, 402, 498, 526);
  const workModuleCardPresence = presenceBetween(frame, 518, 548, 862, 869);

  const openingMainRect: Rect = {
    x: stage.width * 0.5,
    y: stage.height * 0.58,
    width: stage.width * 0.62,
    height: stage.height * 0.58,
  };

  const sharedBoardRect: Rect = {
    x: stage.width * 0.26,
    y: stage.height * 0.58,
    width: stage.width * 0.4,
    height: stage.height * 0.72,
  };

  const workBoardRect: Rect = {
    x: stage.width * 0.74,
    y: stage.height * 0.58,
    width: stage.width * 0.4,
    height: stage.height * 0.72,
  };

  const sharedCodeRect: Rect = {
    x: sharedBoardRect.width * 0.5,
    y: sharedBoardRect.height * 0.63,
    width: sharedBoardRect.width * 0.88,
    height: sharedBoardRect.height * 0.5,
  };

  const workCodeRect: Rect = {
    x: workBoardRect.width * 0.5,
    y: workBoardRect.height * 0.63,
    width: workBoardRect.width * 0.88,
    height: workBoardRect.height * 0.56,
  };

  const stageFloat = Math.sin(frame / 42) * scaleValue(8);
  const openingCodeSize = scaleValue(31);
  const boardCodeSize = scaleValue(28);

  const openingAccent =
    openingWorkPresence > Math.max(openingPcPresence, openingLaptopPresence)
      ? HOT_PINK
      : openingLaptopPresence > openingPcPresence
        ? SOLAR_GOLD
        : NEUTRAL_BLUE;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,93,162,0.16), transparent 28%), radial-gradient(circle at 82% 24%, rgba(127,232,255,0.14), transparent 26%), radial-gradient(circle at 56% 78%, rgba(255,216,108,0.1), transparent 28%)",
        }}
      />

      <AbsoluteFill
        style={{
          padding: `${stage.paddingY}px ${stage.paddingX}px`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: stage.width,
            height: stage.height,
            transform: `translateY(${stageFloat}px)`,
          }}
        >
          <OverlayTitle
            text="home / hosts"
            color={SOFT_WHITE}
            opacity={openingTitleOpacity}
          />
          <div style={{ opacity: openingPresence }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "53%",
                width: scaleValue(1940),
                height: scaleValue(780),
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${openingAccent}18, transparent 68%)`,
                filter: `blur(${scaleValue(26)}px)`,
                opacity: openingPresence * 0.95,
                zIndex: 3,
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "19%",
                transform: "translateX(-50%)",
                width: scaleValue(1480),
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: scaleValue(24),
                zIndex: 16,
              }}
            >
              <Chip
                label="pc"
                accent={NEUTRAL_BLUE}
                reveal={openingPresence}
                fontSize={scaleValue(38)}
                emphasis={mix(0.32, 1, openingPcPresence)}
              />
              <Chip
                label="laptop"
                accent={SOLAR_GOLD}
                reveal={openingPresence}
                fontSize={scaleValue(38)}
                emphasis={mix(0.32, 1, openingLaptopPresence)}
              />
              <Chip
                label="work"
                accent={HOT_PINK}
                reveal={openingPresence}
                fontSize={scaleValue(38)}
                emphasis={mix(0.32, 1, openingWorkPresence)}
              />
            </div>

            <CodeCard
              rect={openingMainRect}
              reveal={openingReveal * openingPcPresence}
              host="pc"
              fileLabel="home/hosts/pc.nix"
              accent={NEUTRAL_BLUE}
              lines={PC_HOST_LINES}
              codeSize={openingCodeSize}
              tilt={-0.3}
              zIndex={10}
              icon="home"
            />
            <CodeCard
              rect={openingMainRect}
              reveal={openingReveal * openingLaptopPresence}
              host="laptop"
              fileLabel="home/hosts/l.nix"
              accent={SOLAR_GOLD}
              lines={LAPTOP_HOST_LINES}
              codeSize={openingCodeSize}
              zIndex={11}
              icon="home"
            />
            <CodeCard
              rect={openingMainRect}
              reveal={openingReveal * openingWorkPresence}
              host="work"
              fileLabel="home/hosts/work.nix"
              accent={HOT_PINK}
              lines={WORK_HOST_LINES}
              codeSize={openingCodeSize}
              tilt={0.3}
              zIndex={12}
              icon="home"
            />
          </div>

          <div style={{ opacity: splitPresence }}>
            <ConnectorPaths
              width={stage.width}
              height={stage.height}
              opacity={splitPresence * 0.9}
            />

            <HostChip
              label="pc"
              accent={NEUTRAL_BLUE}
              reveal={splitPresence}
              emphasis={0.92}
              x={16}
              y={19}
            />
            <HostChip
              label="laptop"
              accent={SOLAR_GOLD}
              reveal={splitPresence}
              emphasis={0.92}
              x={33}
              y={19}
            />
            <HostChip
              label="work"
              accent={HOT_PINK}
              reveal={splitPresence}
              emphasis={0.98}
              x={78}
              y={19}
            />

            <Board
              rect={sharedBoardRect}
              reveal={sharedBoardReveal * splitPresence}
              label="pc + laptop"
              title="shared stack"
              accent={NEUTRAL_BLUE}
              zIndex={10}
            >
              <div
                style={{
                  position: "absolute",
                  left: "3%",
                  right: "3%",
                  top: "2%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                {SHARED_CHIPS.map((chip, index) => {
                  const reveal =
                    spring({
                      frame: frame - (336 + index * 10),
                      fps,
                      config: { damping: 18, stiffness: 122, mass: 0.96 },
                    }) * splitPresence;

                  return (
                    <Chip
                      key={chip.id}
                      label={chip.label}
                      accent={chip.accent}
                      reveal={reveal}
                      fontSize={scaleValue(28)}
                    />
                  );
                })}
              </div>

              <CodeCard
                rect={sharedCodeRect}
                reveal={sharedBoardReveal * splitPresence}
                host="pc + laptop"
                fileLabel="home/hosts/{pc,l}.nix"
                accent={NEUTRAL_BLUE}
                lines={SHARED_STACK_LINES}
                codeSize={boardCodeSize}
                tilt={-0.18}
                zIndex={7}
                icon="home"
              />
            </Board>

            <Board
              rect={workBoardRect}
              reveal={workBoardReveal * splitPresence}
              label="work"
              title="work variant"
              accent={HOT_PINK}
              zIndex={11}
            >
              <div
                style={{
                  position: "absolute",
                  left: "3%",
                  right: "3%",
                  top: "2%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 14,
                }}
              >
                {WORK_CHIPS.map((chip, index) => {
                  const emphasis =
                    chip.id === "username"
                      ? mix(0.48, 1, workHostCardPresence)
                      : chip.id === "git"
                        ? mix(0.48, 1, workModuleCardPresence)
                        : mix(0.48, 1, workModuleCardPresence);

                  const reveal =
                    spring({
                      frame: frame - (422 + index * 10),
                      fps,
                      config: { damping: 18, stiffness: 122, mass: 0.96 },
                    }) * splitPresence;

                  return (
                    <Chip
                      key={chip.id}
                      label={chip.label}
                      accent={chip.accent}
                      reveal={reveal}
                      fontSize={scaleValue(28)}
                      emphasis={emphasis}
                    />
                  );
                })}
              </div>

              <CodeCard
                rect={workCodeRect}
                reveal={workBoardReveal * splitPresence * workHostCardPresence}
                host="work"
                fileLabel="home/hosts/work.nix"
                accent={HOT_PINK}
                lines={WORK_VARIANT_LINES}
                codeSize={boardCodeSize}
                tilt={0.18}
                zIndex={7}
                icon="home"
              />

              <CodeCard
                rect={workCodeRect}
                reveal={
                  workBoardReveal * splitPresence * workModuleCardPresence
                }
                host="work"
                fileLabel="home/modules/work/default.nix"
                accent={NIX_ORANGE}
                lines={WORK_MODULE_LINES}
                codeSize={boardCodeSize}
                tilt={0.08}
                zIndex={8}
              />
            </Board>
          </div>

          <div style={{ opacity: finalPresence }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "56%",
                width: scaleValue(980),
                height: scaleValue(980),
                transform: `translate(-50%, -50%) scale(${mix(0.88, 1, finalPresence)})`,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,216,108,0.18), rgba(255,93,162,0.1) 42%, transparent 72%)",
                filter: `blur(${scaleValue(18)}px)`,
                zIndex: 14,
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "56%",
                width: scaleValue(820),
                height: scaleValue(820),
                transform: `translate(-50%, -50%) scale(${mix(0.92, 1, finalPresence)})`,
                borderRadius: "50%",
                background:
                  "linear-gradient(145deg, rgba(8,6,28,0.98), rgba(32,12,54,0.96))",
                border: "1px solid rgba(255,216,108,0.2)",
                boxShadow: "0 30px 120px rgba(10,0,28,0.72)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: scaleValue(120),
                  height: scaleValue(120),
                  marginBottom: scaleValue(28),
                }}
              >
                <HouseIcon color={SOLAR_GOLD} />
              </div>
              <div
                style={{
                  fontSize: scaleValue(104),
                  lineHeight: 0.88,
                  fontWeight: 800,
                  color: SOFT_WHITE,
                  textAlign: "center",
                  textShadow: `0 0 26px ${SOLAR_GOLD}20`,
                }}
              >
                working
              </div>
              <div
                style={{
                  fontSize: scaleValue(104),
                  lineHeight: 0.88,
                  fontWeight: 800,
                  color: SOFT_WHITE,
                  textAlign: "center",
                  textShadow: `0 0 26px ${SOLAR_GOLD}20`,
                }}
              >
                environment
              </div>
            </div>

            {ENVIRONMENT_CHIPS.map((chip, index) => {
              const reveal =
                spring({
                  frame: frame - (716 + index * 10),
                  fps,
                  config: { damping: 18, stiffness: 122, mass: 0.96 },
                }) * finalPresence;

              return (
                <EnvironmentChip
                  key={chip.id}
                  label={chip.label}
                  accent={chip.accent}
                  x={chip.x}
                  y={chip.y}
                  reveal={reveal}
                />
              );
            })}
          </div>
        </div>

        <SceneProgressBar colors={["#ff5da2", "#8affcf"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
