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
import { Terminal, type TerminalLine } from "../../Terminal";

export const CURRENT_SETUP_SCENE_10_DURATION = 990; // Scene 10, 33.00 seconds @ 30fps

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

type ModuleGroup = {
  id: string;
  title: string;
  accent: string;
  modules: string[];
  startRect: Rect;
  finalRect: Rect;
  tilt?: number;
};

type FloatingTag = {
  id: string;
  label: string;
  accent: string;
  x: number;
  y: number;
};

const MODULE_GROUPS: ModuleGroup[] = [
  {
    id: "apps",
    title: "apps",
    accent: NIX_ORANGE,
    modules: ["applications", "kdenlive"],
    startRect: { x: 0.16, y: 0.26, width: 0.19, height: 0.22 },
    finalRect: { x: 0.14, y: 0.31, width: 0.18, height: 0.22 },
    tilt: -4,
  },
  {
    id: "dev",
    title: "dev",
    accent: NEUTRAL_BLUE,
    modules: ["programming", "docker", "vpn"],
    startRect: { x: 0.39, y: 0.21, width: 0.2, height: 0.22 },
    finalRect: { x: 0.38, y: 0.31, width: 0.18, height: 0.22 },
    tilt: -2,
  },
  {
    id: "terminal",
    title: "terminal",
    accent: HOT_PINK,
    modules: ["kitty", "fish", "cli"],
    startRect: { x: 0.71, y: 0.23, width: 0.21, height: 0.22 },
    finalRect: { x: 0.62, y: 0.31, width: 0.18, height: 0.22 },
    tilt: 2,
  },
  {
    id: "editor",
    title: "editor",
    accent: NEOVIM_GREEN,
    modules: ["nvfvim"],
    startRect: { x: 0.84, y: 0.43, width: 0.16, height: 0.2 },
    finalRect: { x: 0.86, y: 0.31, width: 0.16, height: 0.22 },
    tilt: 4,
  },
  {
    id: "browser",
    title: "browser",
    accent: SOLAR_GOLD,
    modules: ["qutebrowser"],
    startRect: { x: 0.71, y: 0.72, width: 0.18, height: 0.2 },
    finalRect: { x: 0.26, y: 0.7, width: 0.18, height: 0.22 },
    tilt: 3,
  },
  {
    id: "audio",
    title: "audio",
    accent: HOT_PINK,
    modules: ["audio"],
    startRect: { x: 0.43, y: 0.79, width: 0.16, height: 0.2 },
    finalRect: { x: 0.5, y: 0.7, width: 0.18, height: 0.22 },
    tilt: -1,
  },
  {
    id: "shell",
    title: "desktop shell",
    accent: NEOVIM_GREEN,
    modules: ["niri"],
    startRect: { x: 0.17, y: 0.61, width: 0.2, height: 0.22 },
    finalRect: { x: 0.74, y: 0.7, width: 0.18, height: 0.22 },
    tilt: -3,
  },
];

const TERMINAL_LINES: TerminalLine[] = [
  {
    prompt: "luix@pc",
    text: "freshfetch",
    startFrame: 314,
    mode: "type",
    speed: 2,
    color: "#F88132",
    glow: "#F88132",
  },
  {
    prompt: "",
    text: "kitty • fish • git • docker",
    startFrame: 348,
    mode: "paste",
    color: "#8afff7",
    glow: "#8afff7",
  },
  {
    prompt: "luix@pc",
    text: "nvim home/modules/nvfvim/default.nix",
    startFrame: 394,
    mode: "type",
    speed: 2,
    color: "#ffd86c",
    glow: "#ffd86c",
  },
  {
    prompt: "luix@pc",
    text: "docker compose up -d",
    startFrame: 452,
    mode: "type",
    speed: 2,
    color: "#8affcf",
    glow: "#8affcf",
  },
];

const NVF_LINES: CodeLine[] = [
  {
    id: "enable",
    number: "7",
    text: "programs.nvf.enable = true;",
    accent: NEOVIM_GREEN,
  },
  {
    id: "leader",
    number: "13",
    text: 'globals.mapleader = " ";',
    accent: SOLAR_GOLD,
  },
  {
    id: "find-files",
    number: "72",
    text: 'action = "<cmd>Telescope find_files<CR>";',
    accent: NEUTRAL_BLUE,
  },
  {
    id: "toggleterm",
    number: "147",
    text: 'mappings.open = "<leader>lg";',
    accent: HOT_PINK,
  },
  {
    id: "theme",
    number: "181",
    text: 'style = "moon";',
    accent: NIX_ORANGE,
  },
];

const BROWSER_LINES: CodeLine[] = [
  {
    id: "stylesheets",
    number: "10",
    text: "content.user_stylesheets = [ ... ];",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "bg",
    number: "13",
    text: 'colors.webpage.bg = "#050614";',
    accent: HOT_PINK,
  },
];

const BROWSER_STYLE_FILES = ["vaporwave-base.css", "vaporwave-overrides.css"];

const BROWSER_FACTS = [
  {
    id: "default-bg",
    title: "page default",
    value: "#050614",
    note: "Dark initial background cuts the white flash on load.",
    accent: HOT_PINK,
  },
  {
    id: "darkmode-target",
    title: "targeted rule",
    value: "*.google.com",
    note: "Dark mode is forced only where upstream still misses it.",
    accent: SOLAR_GOLD,
  },
];

const SUPPORT_TAGS: FloatingTag[] = [
  {
    id: "applications",
    label: "applications",
    accent: NIX_ORANGE,
    x: 10,
    y: 21,
  },
  {
    id: "programming",
    label: "programming",
    accent: NEUTRAL_BLUE,
    x: 45,
    y: 9,
  },
  { id: "audio", label: "audio", accent: HOT_PINK, x: 12, y: 83 },
  { id: "desktop", label: "desktop shell", accent: NEOVIM_GREEN, x: 91, y: 33 },
];

const BLOB_TAGS: FloatingTag[] = [
  { id: "blob-apps", label: "applications", accent: NIX_ORANGE, x: 41, y: 46 },
  { id: "blob-dev", label: "programming", accent: NEUTRAL_BLUE, x: 54, y: 47 },
  { id: "blob-kitty", label: "kitty", accent: HOT_PINK, x: 47, y: 58 },
  { id: "blob-editor", label: "nvfvim", accent: NEOVIM_GREEN, x: 57, y: 59 },
  { id: "blob-browser", label: "browser", accent: SOLAR_GOLD, x: 49, y: 67 },
  { id: "blob-audio", label: "audio", accent: HOT_PINK, x: 60, y: 67 },
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

const FolderIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
    <path
      d="M10 18a6 6 0 0 1 6-6h12l5 6h15a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6Z"
      fill={`${color}16`}
      stroke={color}
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path d="M10 24h44" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const CodeIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
    <path
      d="M25 18 12 32l13 14M39 18l13 14-13 14"
      fill="none"
      stroke={color}
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BrowserIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
    <rect
      x="10"
      y="12"
      width="44"
      height="40"
      rx="8"
      fill={`${color}14`}
      stroke={color}
      strokeWidth="4"
    />
    <path d="M10 22h44" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <circle cx="19" cy="18" r="2.5" fill={color} />
    <circle cx="27" cy="18" r="2.5" fill={color} />
    <circle cx="35" cy="18" r="2.5" fill={color} />
  </svg>
);

const TerminalIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
    <rect
      x="10"
      y="12"
      width="44"
      height="40"
      rx="8"
      fill={`${color}14`}
      stroke={color}
      strokeWidth="4"
    />
    <path
      d="M18 28 26 34 18 40M32 40h12"
      fill="none"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      transform: `translateY(${mix(20, 0, reveal)}px) scale(${mix(
        0.94,
        mix(0.96, 1.04, emphasis),
        reveal,
      )})`,
      opacity: clamp01(reveal * 1.08) * mix(0.3, 1, emphasis),
      borderRadius: 30,
      minHeight: fontSize * 2.2,
      padding: `${fontSize * 0.48}px ${fontSize * 0.78}px`,
      background:
        emphasis > 0.72
          ? `linear-gradient(145deg, ${accent}16, rgba(14,10,34,0.96))`
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
        transform: `translate(-50%, -50%) translateY(${mix(44, 0, reveal)}px) rotate(${mix(
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

const GroupCard = ({
  rect,
  reveal,
  title,
  accent,
  modules,
  tilt = 0,
  zIndex,
}: {
  rect: Rect;
  reveal: number;
  title: string;
  accent: string;
  modules: string[];
  tilt?: number;
  zIndex: number;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={tilt} zIndex={zIndex}>
    <GlassCard
      style={{
        height: "100%",
        padding: "30px 32px",
        borderRadius: 40,
        background:
          "linear-gradient(145deg, rgba(8,6,28,0.98), rgba(24,10,52,0.94))",
        border: `1px solid ${accent}26`,
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
            background: `radial-gradient(circle at 16% 14%, ${accent}16, transparent 28%)`,
          }}
        />
        <div
          style={{
            position: "relative",
            fontSize: 54,
            lineHeight: 0.88,
            fontWeight: 800,
            color: SOFT_WHITE,
            marginBottom: 22,
          }}
        >
          {title}
        </div>
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: modules.length >= 3 ? "1fr 1fr" : "1fr",
            gap: 12,
          }}
        >
          {modules.map((module, index) => (
            <Chip
              key={module}
              label={module}
              accent={accent}
              reveal={Math.min(1, reveal * 1.1)}
              fontSize={28}
              emphasis={index === 0 ? 1 : 0.86}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const HubCard = ({
  rect,
  reveal,
  zIndex,
}: {
  rect: Rect;
  reveal: number;
  zIndex: number;
}) => (
  <SceneCard rect={rect} reveal={reveal} zIndex={zIndex}>
    <GlassCard
      style={{
        height: "100%",
        padding: "34px 38px",
        borderRadius: 44,
        background:
          "linear-gradient(145deg, rgba(10,8,30,0.98), rgba(18,12,44,0.95))",
        border: "1px solid rgba(255,255,255,0.14)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <div style={{ width: 88, height: 88 }}>
          <FolderIcon color={SOLAR_GOLD} />
        </div>
        <div
          style={{
            fontSize: 74,
            lineHeight: 0.88,
            fontWeight: 800,
            color: SOFT_WHITE,
            textAlign: "center",
          }}
        >
          home/modules
        </div>
        <div
          style={{
            fontSize: 28,
            lineHeight: 1,
            fontWeight: 700,
            color: MUTED_TEXT,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          themed user-space modules
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const FloatingTagChip = ({
  label,
  accent,
  x,
  y,
  reveal,
  emphasis = 1,
  fontSize = 34,
}: {
  label: string;
  accent: string;
  x: number;
  y: number;
  reveal: number;
  emphasis?: number;
  fontSize?: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      transform: "translate(-50%, -50%)",
      zIndex: 18,
    }}
  >
    <Chip
      label={label}
      accent={accent}
      reveal={reveal}
      fontSize={fontSize}
      emphasis={emphasis}
    />
  </div>
);

const CodeLinePill = ({
  line,
  codeSize,
}: {
  line: CodeLine;
  codeSize: number;
}) => (
  <div
    style={{
      borderRadius: codeSize * 0.28,
      padding: `${codeSize * 0.16}px ${codeSize * 0.24}px`,
      background: `linear-gradient(90deg, ${(line.accent ?? SOFT_WHITE) + "14"}, rgba(255,255,255,0.02))`,
      border: `1px solid ${(line.accent ?? SOFT_WHITE) + "24"}`,
      display: "grid",
      gridTemplateColumns: `${codeSize * 2.2}px 1fr`,
      gap: codeSize * 0.22,
      alignItems: "center",
    }}
  >
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: codeSize * 0.54,
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
      }}
    >
      {line.text}
    </div>
  </div>
);

const WorkspaceFrame = ({
  rect,
  reveal,
  accent,
  title,
  subtitle,
  icon,
  zIndex,
  children,
  tilt = 0,
}: {
  rect: Rect;
  reveal: number;
  accent: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  zIndex: number;
  children: ReactNode;
  tilt?: number;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={tilt} zIndex={zIndex}>
    <GlassCard
      style={{
        height: "100%",
        padding: "28px 30px",
        borderRadius: 42,
        background:
          "linear-gradient(145deg, rgba(10,8,30,0.98), rgba(20,12,42,0.95))",
        border: `1px solid ${accent}26`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 16% 12%, ${accent}16, transparent 26%)`,
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Dots />
          <div
            style={{
              fontSize: 22,
              lineHeight: 1,
              color: MUTED_TEXT,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: `${accent}14`,
              border: `1px solid ${accent}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
          <div
            style={{
              fontSize: 48,
              lineHeight: 0.88,
              fontWeight: 800,
              color: SOFT_WHITE,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ position: "relative", flex: 1 }}>{children}</div>
      </div>
    </GlassCard>
  </SceneCard>
);

const EditorPanel = ({
  rect,
  reveal,
  zIndex,
}: {
  rect: Rect;
  reveal: number;
  zIndex: number;
}) => (
  <WorkspaceFrame
    rect={rect}
    reveal={reveal}
    accent={NEOVIM_GREEN}
    title="nvfvim"
    subtitle="home/modules/nvfvim/default.nix"
    icon={<CodeIcon color={NEOVIM_GREEN} />}
    zIndex={zIndex}
  >
    <div
      style={{
        display: "grid",
        gridTemplateRows: "1fr auto",
        height: "100%",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {NVF_LINES.map((line) => (
          <CodeLinePill key={line.id} line={line} codeSize={28} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: 16,
          alignItems: "center",
          borderRadius: 20,
          padding: "14px 18px",
          background:
            "linear-gradient(90deg, rgba(16,12,38,0.95), rgba(22,28,58,0.85))",
          border: "1px solid rgba(138,255,207,0.18)",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: SOFT_WHITE,
          }}
        >
          NORMAL
        </div>
        <div style={{ fontSize: 22, color: MUTED_TEXT }}>tokyonight-moon</div>
        <div style={{ fontSize: 22, color: MUTED_TEXT }}>telescope / git</div>
      </div>
    </div>
  </WorkspaceFrame>
);

const BrowserPanel = ({
  rect,
  reveal,
  zIndex,
}: {
  rect: Rect;
  reveal: number;
  zIndex: number;
}) => (
  <WorkspaceFrame
    rect={rect}
    reveal={reveal}
    accent={SOLAR_GOLD}
    title="qutebrowser"
    subtitle="home/modules/qutebrowser/default.nix"
    icon={<BrowserIcon color={SOLAR_GOLD} />}
    zIndex={zIndex}
    tilt={1.2}
  >
    <div
      style={{
        display: "grid",
        gridTemplateRows: "auto auto 1fr",
        gap: 18,
        height: "100%",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: SOFT_WHITE,
          }}
        >
          browser styling
        </div>
        <Chip
          label="themed web layer"
          accent={SOLAR_GOLD}
          reveal={1}
          fontSize={20}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {BROWSER_LINES.map((line) => (
          <CodeLinePill key={line.id} line={line} codeSize={22} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: 16,
        }}
      >
        <div
          style={{
            borderRadius: 24,
            padding: "20px 22px",
            background:
              "linear-gradient(160deg, rgba(8,10,26,0.98), rgba(22,12,44,0.92))",
            border: "1px solid rgba(255,216,108,0.18)",
            display: "grid",
            gridTemplateRows: "auto auto",
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: SOFT_WHITE,
            }}
          >
            style sources
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 12,
            }}
          >
            {BROWSER_STYLE_FILES.map((file, index) => (
              <Chip
                key={file}
                label={file}
                accent={index === 0 ? NEUTRAL_BLUE : HOT_PINK}
                reveal={1}
                fontSize={22}
                emphasis={0.92}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {BROWSER_FACTS.map((fact) => (
            <div
              key={fact.id}
              style={{
                borderRadius: 22,
                padding: "18px 18px 20px",
                background: `linear-gradient(145deg, ${fact.accent}12, rgba(10,8,30,0.95))`,
                border: `1px solid ${fact.accent}24`,
                display: "grid",
                gridTemplateRows: "auto auto 1fr",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: SOFT_WHITE,
                }}
              >
                {fact.title}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 24,
                  lineHeight: 1.04,
                  fontWeight: 700,
                  color: fact.accent,
                }}
              >
                {fact.value}
              </div>
              <div
                style={{
                  fontSize: 19,
                  lineHeight: 1.28,
                  color: "rgba(247,244,255,0.8)",
                }}
              >
                {fact.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </WorkspaceFrame>
);

const OrbitConnections = ({
  width,
  height,
  hubRect,
  opacity,
}: {
  width: number;
  height: number;
  hubRect: Rect;
  opacity: number;
}) => {
  if (opacity <= 0.01) {
    return null;
  }

  const hubX = hubRect.x * width;
  const hubY = hubRect.y * height;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        zIndex: 4,
        pointerEvents: "none",
      }}
    >
      {MODULE_GROUPS.map((group) => {
        const targetX = group.startRect.x * width;
        const targetY = group.startRect.y * height;
        const controlX = mix(hubX, targetX, 0.5);
        const controlY = mix(hubY, targetY, 0.42) - height * 0.06;
        const d = `M ${hubX} ${hubY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
        return (
          <g key={group.id}>
            <path
              d={d}
              fill="none"
              stroke={group.accent}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.38}
            />
            <path
              d={d}
              fill="none"
              stroke={group.accent}
              strokeWidth={18}
              strokeLinecap="round"
              opacity={0.08}
            />
          </g>
        );
      })}
    </svg>
  );
};

export const CurrentSetupScene10 = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const scaleValue = (value: number) => value * (width / BASE_WIDTH);

  const stage = {
    width: scaleValue(3080),
    height: scaleValue(1180),
    paddingX: scaleValue(118),
    paddingY: scaleValue(84),
  };

  const stageA = presenceBetween(frame, 0, 26, 254, 296);
  const stageB = presenceBetween(frame, 262, 304, 692, 736);
  const stageC = progressBetween(frame, 720, 768);

  const openingTitleOpacity = presenceBetween(frame, 18, 44, 210, 244);
  const finalTitleOpacity = progressBetween(frame, 756, 794);

  const terminalReveal =
    spring({
      fps,
      frame: frame - 292,
      config: { damping: 18, stiffness: 118, mass: 0.96 },
    }) * stageB;

  const editorReveal =
    spring({
      fps,
      frame: frame - 340,
      config: { damping: 18, stiffness: 122, mass: 0.96 },
    }) * stageB;

  const browserReveal =
    spring({
      fps,
      frame: frame - 396,
      config: { damping: 18, stiffness: 122, mass: 0.96 },
    }) * stageB;

  const supportReveal =
    spring({
      fps,
      frame: frame - 454,
      config: { damping: 18, stiffness: 118, mass: 0.96 },
    }) * stageB;

  const hubReveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 118, mass: 0.96 },
  });

  const openingHubRect: Rect = {
    x: stage.width * 0.5,
    y: stage.height * 0.5,
    width: stage.width * 0.29,
    height: stage.height * 0.24,
  };

  const terminalRect: Rect = {
    x: stage.width * 0.2,
    y: stage.height * 0.57,
    width: stage.width * 0.24,
    height: stage.height * 0.58,
  };

  const editorRect: Rect = {
    x: stage.width * 0.51,
    y: stage.height * 0.55,
    width: stage.width * 0.32,
    height: stage.height * 0.64,
  };

  const browserRect: Rect = {
    x: stage.width * 0.815,
    y: stage.height * 0.57,
    width: stage.width * 0.27,
    height: stage.height * 0.6,
  };

  const blobOpacity = presenceBetween(frame, 706, 740, 816, 856);
  const stageFloat = Math.sin(frame / 42) * scaleValue(8);

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
            text="day-to-day experience"
            color={SOFT_WHITE}
            opacity={openingTitleOpacity}
            top="3.5%"
          />
          <OverlayTitle
            text="clear themes"
            color={SOLAR_GOLD}
            opacity={finalTitleOpacity}
          />

          <div style={{ opacity: stageA }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: scaleValue(1460),
                height: scaleValue(860),
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,216,108,0.12), rgba(255,93,162,0.08) 44%, transparent 72%)",
                filter: `blur(${scaleValue(24)}px)`,
                opacity: stageA,
                zIndex: 2,
              }}
            />

            <OrbitConnections
              width={stage.width}
              height={stage.height}
              hubRect={{
                x: 0.5,
                y: 0.5,
                width: 0.29,
                height: 0.24,
              }}
              opacity={stageA * 0.9}
            />

            <HubCard
              rect={openingHubRect}
              reveal={hubReveal * stageA}
              zIndex={12}
            />

            {MODULE_GROUPS.map((group, index) => {
              const reveal =
                spring({
                  fps,
                  frame: frame - (36 + index * 12),
                  config: { damping: 18, stiffness: 120, mass: 0.96 },
                }) * stageA;

              return (
                <GroupCard
                  key={group.id}
                  rect={{
                    x: stage.width * group.startRect.x,
                    y: stage.height * group.startRect.y,
                    width: stage.width * group.startRect.width,
                    height: stage.height * group.startRect.height,
                  }}
                  reveal={reveal}
                  title={group.title}
                  accent={group.accent}
                  modules={group.modules}
                  tilt={group.tilt}
                  zIndex={10 + index}
                />
              );
            })}
          </div>

          <div style={{ opacity: stageB }}>
            {SUPPORT_TAGS.map((tag, index) => {
              const reveal =
                spring({
                  fps,
                  frame: frame - (468 + index * 10),
                  config: { damping: 18, stiffness: 118, mass: 0.96 },
                }) * supportReveal;

              return (
                <FloatingTagChip
                  key={tag.id}
                  label={tag.label}
                  accent={tag.accent}
                  x={tag.x}
                  y={tag.y}
                  reveal={reveal}
                  fontSize={28}
                />
              );
            })}

            <SceneCard
              rect={terminalRect}
              reveal={terminalReveal}
              tilt={-1.8}
              zIndex={14}
            >
              <Terminal
                lines={TERMINAL_LINES}
                fontSize={42}
                promptWidth={240}
                style={{
                  height: "100%",
                  padding: "34px 34px 36px",
                  borderRadius: 42,
                  border: "1px solid rgba(255,93,162,0.26)",
                }}
              />
            </SceneCard>

            <FloatingTagChip
              label="kitty"
              accent={HOT_PINK}
              x={20}
              y={17}
              reveal={terminalReveal}
              fontSize={36}
            />

            <EditorPanel rect={editorRect} reveal={editorReveal} zIndex={16} />

            <FloatingTagChip
              label="neovim"
              accent={NEOVIM_GREEN}
              x={51}
              y={14}
              reveal={editorReveal}
              fontSize={36}
            />

            <BrowserPanel
              rect={browserRect}
              reveal={browserReveal}
              zIndex={15}
            />

            <FloatingTagChip
              label="browser"
              accent={SOLAR_GOLD}
              x={82}
              y={17}
              reveal={browserReveal}
              fontSize={36}
            />
          </div>

          <div style={{ opacity: stageC }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "52%",
                width: scaleValue(880),
                height: scaleValue(560),
                transform: `translate(-50%, -50%) scale(${mix(1.02, 0.78, stageC)})`,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,93,162,0.12), rgba(8,6,28,0.55) 52%, transparent 76%)",
                filter: `blur(${scaleValue(18)}px)`,
                opacity: blobOpacity,
                zIndex: 6,
              }}
            />

            {BLOB_TAGS.map((tag, index) => {
              const reveal =
                spring({
                  fps,
                  frame: frame - (708 + index * 4),
                  config: { damping: 18, stiffness: 118, mass: 0.96 },
                }) * blobOpacity;

              return (
                <FloatingTagChip
                  key={tag.id}
                  label={tag.label}
                  accent={tag.accent}
                  x={tag.x}
                  y={tag.y}
                  reveal={reveal}
                  emphasis={0.7}
                  fontSize={26}
                />
              );
            })}

            {MODULE_GROUPS.map((group, index) => {
              const reveal =
                spring({
                  fps,
                  frame: frame - (736 + index * 10),
                  config: { damping: 18, stiffness: 120, mass: 0.96 },
                }) * stageC;

              return (
                <GroupCard
                  key={`${group.id}-final`}
                  rect={{
                    x: stage.width * group.finalRect.x,
                    y: stage.height * group.finalRect.y,
                    width: stage.width * group.finalRect.width,
                    height: stage.height * group.finalRect.height,
                  }}
                  reveal={reveal}
                  title={group.title}
                  accent={group.accent}
                  modules={group.modules}
                  tilt={0}
                  zIndex={20 + index}
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
