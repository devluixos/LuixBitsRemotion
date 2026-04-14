import {
  AbsoluteFill,
  getStaticFiles,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  type StaticFile,
} from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { GlassCard } from "../../components/GlassCard";
import { SceneProgressBar } from "../../components/SceneProgressBar";

export const FLAKE_FILE_SCENE_DURATION = 1241; // 41.37 seconds @ 30fps, extended by 0.7s

const BASE_WIDTH = 3440;
const RECORDING_EXTENSIONS = ["mp4", "mov", "webm"] as const;

const HOT_PINK = "#ff5da2";
const NIX_ORANGE = "#ff9f4a";
const NEUTRAL_BLUE = "#7fe8ff";
const NEOVIM_GREEN = "#8affcf";
const LILAC = "#d9a8ff";
const SOLAR_GOLD = "#ffd86c";
const SOFT_WHITE = "#f7f4ff";

const INPUT_SECTION_END = 720;
const OUTPUT_SECTION_START = 760;

const BASE_LAYOUT = {
  frame: {
    paddingX: 120,
    paddingY: 86,
  },
  stage: {
    width: 3080,
    height: 1180,
  },
  panel: {
    largeWidth: 1940,
    largeHeight: 970,
    smallWidth: 1660,
    smallHeight: 660,
  },
  node: {
    width: 320,
    height: 300,
  },
  host: {
    width: 350,
    height: 212,
  },
  text: {
    hero: 150,
    panelTitle: 68,
    code: 38,
    node: 50,
    host: 96,
  },
  size: {
    beam: 9,
    pulse: 26,
    hub: 136,
  },
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DependencyKind =
  | "nixpkgs"
  | "unstable"
  | "home-manager"
  | "nvf"
  | "noctalia"
  | "nix-citizen";

type DependencyConfig = {
  id: string;
  label: string[];
  accent: string;
  x: number;
  y: number;
  revealStart: number;
  anchorLineIndex: number;
  highlightLineIndices: number[];
  kind: DependencyKind;
};

type HostConfig = {
  id: "work" | "l" | "pc";
  accent: string;
  x: number;
  revealStart: number;
  anchorLineIndex: number;
  highlightLineIndices: number[];
};

type CodeSegment = {
  text: string;
  color?: string;
  opacity?: number;
  weight?: number;
};

type SnippetLine = {
  id: string;
  accent?: string;
  segments: CodeSegment[];
};

type AnchorSide = "left" | "right";

type LineAnchorConfig = {
  rect: Rect;
  titleSize: number;
  fontSize: number;
  compact?: boolean;
  lineIndex: number;
  side: AnchorSide;
  accent?: string;
};

const INPUTS: DependencyConfig[] = [
  {
    id: "nixpkgs",
    label: ["nixpkgs"],
    accent: NIX_ORANGE,
    x: 0.14,
    y: 0.22,
    revealStart: 120,
    anchorLineIndex: 1,
    highlightLineIndices: [1],
    kind: "nixpkgs",
  },
  {
    id: "nixpkgs-unstable",
    label: ["nixpkgs", "unstable"],
    accent: HOT_PINK,
    x: 0.14,
    y: 0.49,
    revealStart: 170,
    anchorLineIndex: 2,
    highlightLineIndices: [2],
    kind: "unstable",
  },
  {
    id: "home-manager",
    label: ["home", "manager"],
    accent: NEUTRAL_BLUE,
    x: 0.18,
    y: 0.78,
    revealStart: 220,
    anchorLineIndex: 3,
    highlightLineIndices: [3],
    kind: "home-manager",
  },
  {
    id: "nvf",
    label: ["nvf"],
    accent: NEOVIM_GREEN,
    x: 0.86,
    y: 0.22,
    revealStart: 270,
    anchorLineIndex: 4,
    highlightLineIndices: [4],
    kind: "nvf",
  },
  {
    id: "noctalia",
    label: ["noctalia"],
    accent: LILAC,
    x: 0.86,
    y: 0.49,
    revealStart: 320,
    anchorLineIndex: 5,
    highlightLineIndices: [5],
    kind: "noctalia",
  },
  {
    id: "nix-citizen",
    label: ["nix", "citizen"],
    accent: SOLAR_GOLD,
    x: 0.82,
    y: 0.78,
    revealStart: 370,
    anchorLineIndex: 6,
    highlightLineIndices: [6],
    kind: "nix-citizen",
  },
];

const HOSTS: HostConfig[] = [
  {
    id: "work",
    accent: NEOVIM_GREEN,
    x: 0.22,
    revealStart: 810,
    anchorLineIndex: 5,
    highlightLineIndices: [5],
  },
  {
    id: "l",
    accent: NEUTRAL_BLUE,
    x: 0.5,
    revealStart: 850,
    anchorLineIndex: 4,
    highlightLineIndices: [4],
  },
  {
    id: "pc",
    accent: NIX_ORANGE,
    x: 0.78,
    revealStart: 890,
    anchorLineIndex: 3,
    highlightLineIndices: [3],
  },
];

const INPUT_SNIPPET: SnippetLine[] = [
  {
    id: "inputs-open",
    segments: [
      { text: "inputs", color: SOFT_WHITE, weight: 800 },
      { text: " = {", color: SOFT_WHITE },
    ],
  },
  {
    id: "nixpkgs",
    accent: NIX_ORANGE,
    segments: [
      { text: "  " },
      { text: "nixpkgs", color: NIX_ORANGE, weight: 800 },
      { text: ".url", color: SOFT_WHITE },
      { text: " = ", color: "rgba(247,244,255,0.86)" },
      {
        text: '"github:NixOS/nixpkgs/nixos-25.11"',
        color: NIX_ORANGE,
        opacity: 0.96,
      },
      { text: ";", color: SOFT_WHITE },
    ],
  },
  {
    id: "nixpkgs-unstable",
    accent: HOT_PINK,
    segments: [
      { text: "  " },
      { text: "nixpkgs-unstable", color: HOT_PINK, weight: 800 },
      { text: ".url", color: SOFT_WHITE },
      { text: " = ", color: "rgba(247,244,255,0.86)" },
      {
        text: '"github:NixOS/nixpkgs/nixos-unstable"',
        color: HOT_PINK,
        opacity: 0.96,
      },
      { text: ";", color: SOFT_WHITE },
    ],
  },
  {
    id: "home-manager",
    accent: NEUTRAL_BLUE,
    segments: [
      { text: "  " },
      { text: "home-manager", color: NEUTRAL_BLUE, weight: 800 },
      { text: ".url", color: SOFT_WHITE },
      { text: " = ", color: "rgba(247,244,255,0.86)" },
      {
        text: '"github:nix-community/home-manager/release-25.11"',
        color: NEUTRAL_BLUE,
        opacity: 0.96,
      },
      { text: ";", color: SOFT_WHITE },
    ],
  },
  {
    id: "nvf",
    accent: NEOVIM_GREEN,
    segments: [
      { text: "  " },
      { text: "nvf", color: NEOVIM_GREEN, weight: 800 },
      { text: ".url", color: SOFT_WHITE },
      { text: " = ", color: "rgba(247,244,255,0.86)" },
      { text: '"github:notashelf/nvf"', color: NEOVIM_GREEN, opacity: 0.96 },
      { text: ";", color: SOFT_WHITE },
    ],
  },
  {
    id: "noctalia",
    accent: LILAC,
    segments: [
      { text: "  " },
      { text: "noctalia", color: LILAC, weight: 800 },
      { text: ".url", color: SOFT_WHITE },
      { text: " = ", color: "rgba(247,244,255,0.86)" },
      {
        text: '"github:noctalia-dev/noctalia-shell"',
        color: LILAC,
        opacity: 0.96,
      },
      { text: ";", color: SOFT_WHITE },
    ],
  },
  {
    id: "nix-citizen",
    accent: SOLAR_GOLD,
    segments: [
      { text: "  " },
      { text: "nix-citizen", color: SOLAR_GOLD, weight: 800 },
      { text: ".url", color: SOFT_WHITE },
      { text: " = ", color: "rgba(247,244,255,0.86)" },
      {
        text: '"github:LovingMelody/nix-citizen"',
        color: SOLAR_GOLD,
        opacity: 0.96,
      },
      { text: ";", color: SOFT_WHITE },
    ],
  },
  {
    id: "inputs-close",
    segments: [{ text: "};", color: SOFT_WHITE }],
  },
];

const OUTPUT_SNIPPET: SnippetLine[] = [
  {
    id: "outputs-head",
    segments: [
      { text: "outputs", color: SOFT_WHITE, weight: 800 },
      { text: " = { ", color: SOFT_WHITE },
      { text: "nixpkgs", color: NIX_ORANGE, weight: 800 },
      { text: ", ", color: SOFT_WHITE },
      { text: "home-manager", color: NEUTRAL_BLUE, weight: 800 },
      { text: ", ... }", color: SOFT_WHITE },
      { text: "@inputs", color: HOT_PINK, weight: 800 },
      { text: ":", color: SOFT_WHITE },
    ],
  },
  {
    id: "outputs-open",
    segments: [{ text: "{", color: SOFT_WHITE }],
  },
  {
    id: "outputs-configs",
    segments: [
      { text: "  " },
      { text: "nixosConfigurations", color: SOFT_WHITE, weight: 800 },
      { text: " = {", color: SOFT_WHITE },
    ],
  },
  {
    id: "pc",
    accent: NIX_ORANGE,
    segments: [
      { text: "    " },
      { text: "pc", color: NIX_ORANGE, weight: 800 },
      { text: " = ", color: SOFT_WHITE },
      { text: "mkHost", color: SOFT_WHITE, weight: 800 },
      { text: " { ... };", color: NIX_ORANGE, opacity: 0.92 },
    ],
  },
  {
    id: "l",
    accent: NEUTRAL_BLUE,
    segments: [
      { text: "    " },
      { text: "l", color: NEUTRAL_BLUE, weight: 800 },
      { text: " = ", color: SOFT_WHITE },
      { text: "mkHost", color: SOFT_WHITE, weight: 800 },
      { text: " { ... };", color: NEUTRAL_BLUE, opacity: 0.92 },
    ],
  },
  {
    id: "work",
    accent: NEOVIM_GREEN,
    segments: [
      { text: "    " },
      { text: "work", color: NEOVIM_GREEN, weight: 800 },
      { text: " = ", color: SOFT_WHITE },
      { text: "mkHost", color: SOFT_WHITE, weight: 800 },
      {
        text: ' { hostName = "work"; ... };',
        color: NEOVIM_GREEN,
        opacity: 0.92,
      },
    ],
  },
  {
    id: "outputs-close-inner",
    segments: [{ text: "  };", color: SOFT_WHITE }],
  },
  {
    id: "outputs-close",
    segments: [{ text: "};", color: SOFT_WHITE }],
  },
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

const mixRect = (from: Rect, to: Rect, progress: number): Rect => ({
  x: mix(from.x, to.x, progress),
  y: mix(from.y, to.y, progress),
  width: mix(from.width, to.width, progress),
  height: mix(from.height, to.height, progress),
});

const getFallbackLineAnchor = ({
  rect,
  titleSize,
  fontSize,
  compact = false,
  lineIndex,
  side,
}: LineAnchorConfig) => {
  const contentTop = rect.y - rect.height / 2 + titleSize * 2.15;
  const paddingTop = compact ? fontSize * 0.95 : fontSize * 1.6;
  const paddingX = compact ? fontSize * 1.2 : fontSize * 1.45;
  const marginBottom = compact ? fontSize * 0.24 : fontSize * 0.45;
  const linePaddingY = fontSize * 0.18;
  const lineHeight = fontSize * 1.28;
  const rowStep = linePaddingY * 2 + lineHeight + marginBottom;
  const y =
    contentTop +
    paddingTop +
    lineIndex * rowStep +
    linePaddingY +
    lineHeight * 0.5;
  const x =
    side === "left"
      ? rect.x - rect.width / 2 + paddingX - fontSize * 0.34
      : rect.x + rect.width / 2 - paddingX + fontSize * 0.34;

  return { x, y };
};

const findRecordingSrc = (
  files: StaticFile[],
  label: "flake-inputs" | "flake-outputs",
) => {
  for (const extension of RECORDING_EXTENSIONS) {
    const match = files.find(
      (file) => file.name === `current-setup/${label}.${extension}`,
    );

    if (match) {
      return match.src;
    }
  }

  return null;
};

const FlakeIcon: React.FC<{ color: string; rotation?: number }> = ({
  color,
  rotation = 0,
}) => (
  <svg
    viewBox="0 0 120 120"
    style={{
      width: "74%",
      height: "74%",
      transform: `rotate(${rotation}deg)`,
    }}
  >
    <g stroke={color} strokeWidth="6" strokeLinecap="round">
      <line x1="60" y1="12" x2="60" y2="108" />
      <line x1="12" y1="60" x2="108" y2="60" />
      <line x1="24" y1="24" x2="96" y2="96" />
      <line x1="96" y1="24" x2="24" y2="96" />
    </g>
    <circle
      cx="60"
      cy="60"
      r="12"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="5"
    />
  </svg>
);

const PackageIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "74%", height: "74%" }}>
    <polygon
      points="60,14 104,36 60,58 16,36"
      fill={`${color}28`}
      stroke={color}
      strokeWidth="5"
    />
    <polygon
      points="16,36 60,58 60,98 16,76"
      fill={`${color}18`}
      stroke={color}
      strokeWidth="5"
    />
    <polygon
      points="104,36 60,58 60,98 104,76"
      fill={`${color}3a`}
      stroke={color}
      strokeWidth="5"
    />
  </svg>
);

const UnstablePackageIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "74%", height: "74%" }}>
    <polygon
      points="60,14 104,36 60,58 16,36"
      fill={`${color}24`}
      stroke={color}
      strokeWidth="5"
    />
    <polygon
      points="16,36 60,58 60,98 16,76"
      fill={`${color}18`}
      stroke={color}
      strokeWidth="5"
    />
    <polygon
      points="104,36 60,58 60,98 104,76"
      fill={`${color}34`}
      stroke={color}
      strokeWidth="5"
    />
    <path
      d="M66 20 L52 48 H66 L56 78"
      fill="none"
      stroke={SOFT_WHITE}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HomeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "74%", height: "74%" }}>
    <path
      d="M22 64 L70 26 L118 64 V106 H22 Z"
      fill={`${color}20`}
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <rect
      x="54"
      y="72"
      width="32"
      height="34"
      rx="6"
      fill={`${color}28`}
      stroke={color}
      strokeWidth="5"
    />
  </svg>
);

const EditorIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "74%", height: "74%" }}>
    <rect
      x="20"
      y="20"
      width="100"
      height="80"
      rx="14"
      fill={`${color}16`}
      stroke={color}
      strokeWidth="5"
    />
    <path
      d="M42 60 L58 72"
      fill="none"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
    />
    <line
      x1="68"
      y1="72"
      x2="96"
      y2="72"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "74%", height: "74%" }}>
    <path
      d="M74 18 C46 24 34 50 40 76 C46 96 68 108 90 98 C74 96 60 84 56 68 C52 48 60 30 74 18 Z"
      fill={`${color}26`}
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
  </svg>
);

const CitizenIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "74%", height: "74%" }}>
    <circle
      cx="60"
      cy="60"
      r="26"
      fill={`${color}14`}
      stroke={color}
      strokeWidth="5"
    />
    <g stroke={color} strokeWidth="5" strokeLinecap="round">
      <line x1="60" y1="14" x2="60" y2="34" />
      <line x1="60" y1="86" x2="60" y2="106" />
      <line x1="14" y1="60" x2="34" y2="60" />
      <line x1="86" y1="60" x2="106" y2="60" />
      <line x1="30" y1="30" x2="42" y2="42" />
      <line x1="90" y1="30" x2="78" y2="42" />
      <line x1="30" y1="90" x2="42" y2="78" />
      <line x1="90" y1="90" x2="78" y2="78" />
    </g>
    <path
      d="M60 40 L66 55 L82 55 L70 65 L74 80 L60 70 L46 80 L50 65 L38 55 L54 55 Z"
      fill={`${color}26`}
      stroke={color}
      strokeWidth="4"
      strokeLinejoin="round"
    />
  </svg>
);

const NodeShell: React.FC<{
  width: number;
  height: number;
  accent: string;
  children: React.ReactNode;
}> = ({ width, height, accent, children }) => (
  <div
    style={{
      position: "relative",
      width,
      height,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: -width * 0.12,
        borderRadius: "42%",
        background: `radial-gradient(circle, ${accent}24, transparent 72%)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "38%",
        background:
          "radial-gradient(circle at 34% 24%, rgba(255,255,255,0.12), rgba(11,10,30,0.96) 68%)",
        border: `1px solid ${accent}66`,
        boxShadow: `0 28px 90px rgba(4,0,24,0.62), 0 0 42px ${accent}18`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 28%, rgba(255,255,255,0.02) 72%, rgba(0,0,0,0.2) 100%)",
        }}
      />
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  </div>
);

const Beam: React.FC<{
  start: { x: number; y: number };
  end: { x: number; y: number };
  progress: number;
  accent: string;
  thickness: number;
  pulseSize: number;
}> = ({ start, end, progress, accent, thickness, pulseSize }) => {
  if (progress <= 0) {
    return null;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const pulseX = start.x + dx * progress;
  const pulseY = start.y + dy * progress;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: start.x,
          top: start.y,
          width: distance,
          height: thickness,
          borderRadius: 999,
          transform: `translateY(-50%) rotate(${angle}deg) scaleX(${progress})`,
          transformOrigin: "0 50%",
          background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.96))`,
          boxShadow: `0 0 28px ${accent}, 0 0 44px ${accent}3c`,
          zIndex: 7,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: pulseX - pulseSize / 2,
          top: pulseY - pulseSize / 2,
          width: pulseSize,
          height: pulseSize,
          borderRadius: "50%",
          background: accent,
          boxShadow: `0 0 32px ${accent}, 0 0 48px ${accent}66`,
          zIndex: 8,
        }}
      />
    </>
  );
};

const HeroTitle: React.FC<{
  x: number;
  y: number;
  titleSize: number;
  reveal: number;
  frame: number;
}> = ({ x, y, titleSize, reveal, frame }) => {
  if (reveal <= 0) {
    return null;
  }

  const spin = frame * 1.6;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${mix(70, 0, reveal)}px) scale(${mix(
          0.72,
          1,
          reveal,
        )})`,
        opacity: reveal,
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: "relative",
          width: titleSize * 1.45,
          height: titleSize * 1.55,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: titleSize * 0.22,
            width: titleSize * 0.86,
            height: titleSize * 0.86,
            transform: `translate(-50%, -50%) rotate(${spin}deg)`,
            borderRadius: "36%",
            background: `conic-gradient(from 0deg, ${HOT_PINK}00 0deg, ${HOT_PINK}aa 68deg, transparent 130deg, ${NEUTRAL_BLUE}88 210deg, transparent 292deg, ${NIX_ORANGE}88 346deg, transparent 360deg)`,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: titleSize * 0.22,
            width: titleSize * 0.46,
            height: titleSize * 0.46,
            transform: "translate(-50%, -50%)",
          }}
        >
          <NodeShell
            width={titleSize * 0.46}
            height={titleSize * 0.46}
            accent={HOT_PINK}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlakeIcon color={HOT_PINK} rotation={-spin * 0.65} />
            </div>
          </NodeShell>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%)",
            fontSize: titleSize,
            lineHeight: 0.88,
            fontWeight: 800,
            color: SOFT_WHITE,
            letterSpacing: 1.2,
            whiteSpace: "nowrap",
            textShadow: "0 18px 44px rgba(255,93,162,0.32)",
          }}
        >
          flake.nix
        </div>
      </div>
    </div>
  );
};

const DependencyIcon: React.FC<{
  kind: DependencyKind;
  accent: string;
  frame: number;
}> = ({ kind, accent, frame }) => {
  switch (kind) {
    case "nixpkgs":
      return <PackageIcon color={accent} />;
    case "unstable":
      return <UnstablePackageIcon color={accent} />;
    case "home-manager":
      return <HomeIcon color={accent} />;
    case "nvf":
      return <EditorIcon color={accent} />;
    case "noctalia":
      return <MoonIcon color={accent} />;
    case "nix-citizen":
      return <CitizenIcon color={accent} />;
    default:
      return <FlakeIcon color={accent} rotation={frame} />;
  }
};

const DependencyNode: React.FC<{
  dependency: DependencyConfig;
  x: number;
  y: number;
  width: number;
  height: number;
  reveal: number;
  frame: number;
}> = ({ dependency, x, y, width, height, reveal, frame }) => {
  if (reveal <= 0) {
    return null;
  }

  const floatY = Math.sin((frame + dependency.revealStart) / 18) * 8;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        transform: `translate(-50%, -50%) translateY(${mix(90, 0, reveal) + floatY}px) scale(${mix(
          0.42,
          1,
          reveal,
        )})`,
        opacity: clamp01(reveal * 1.08),
        zIndex: 8,
      }}
    >
      <NodeShell width={width} height={height} accent={dependency.accent}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "34%",
            transform: "translate(-50%, -50%)",
            width: width * 0.38,
            height: width * 0.38,
          }}
        >
          <NodeShell
            width={width * 0.38}
            height={width * 0.38}
            accent={dependency.accent}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DependencyIcon
                kind={dependency.kind}
                accent={dependency.accent}
                frame={frame}
              />
            </div>
          </NodeShell>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "14%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: height * 0.02,
            width: "84%",
            textAlign: "center",
          }}
        >
          {dependency.label.map((line) => (
            <div
              key={line}
              style={{
                fontSize: width * 0.16,
                lineHeight: 0.88,
                fontWeight: 800,
                color: SOFT_WHITE,
                letterSpacing: 0.6,
                textShadow: `0 14px 32px ${dependency.accent}2c`,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </NodeShell>
    </div>
  );
};

const HostCard: React.FC<{
  host: HostConfig;
  x: number;
  y: number;
  width: number;
  height: number;
  reveal: number;
  frame: number;
}> = ({ host, x, y, width, height, reveal, frame }) => {
  if (reveal <= 0) {
    return null;
  }

  const floatY = Math.sin((frame + host.revealStart) / 16) * 8;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        transform: `translate(-50%, -50%) translateY(${mix(140, 0, reveal) + floatY}px) scale(${mix(
          0.5,
          1,
          reveal,
        )})`,
        opacity: clamp01(reveal * 1.08),
        zIndex: 8,
      }}
    >
      <NodeShell width={width} height={height} accent={host.accent}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: height * 0.46,
            lineHeight: 0.88,
            fontWeight: 800,
            color: SOFT_WHITE,
            textAlign: "center",
            textTransform: "lowercase",
            letterSpacing: host.id === "l" ? 0 : 1.6,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            textShadow: `0 18px 42px ${host.accent}38`,
          }}
        >
          {host.id}
        </div>
      </NodeShell>
    </div>
  );
};

const FallbackCode: React.FC<{
  lines: SnippetLine[];
  highlightedIndices: number[];
  fontSize: number;
  opacity: number;
  compact?: boolean;
}> = ({ lines, highlightedIndices, fontSize, opacity, compact = false }) => {
  const highlightSet = new Set(highlightedIndices);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: compact
          ? `${fontSize * 0.95}px ${fontSize * 1.2}px`
          : `${fontSize * 1.6}px ${fontSize * 1.45}px`,
        opacity,
      }}
    >
      {lines.map((line, index) => {
        const highlighted = highlightSet.has(index);

        return (
          <div
            key={line.id}
            style={{
              position: "relative",
              marginBottom: compact ? fontSize * 0.24 : fontSize * 0.45,
              padding: `${fontSize * 0.18}px ${fontSize * 0.28}px`,
              borderRadius: fontSize * 0.34,
              background: highlighted
                ? `linear-gradient(90deg, ${line.accent ?? SOFT_WHITE}16, rgba(255,255,255,0.04))`
                : "transparent",
              border: highlighted
                ? `1px solid ${line.accent ?? SOFT_WHITE}38`
                : "1px solid transparent",
              boxShadow: highlighted
                ? `0 0 24px ${line.accent ?? SOFT_WHITE}16`
                : "none",
            }}
          >
            <div
              style={{
                whiteSpace: "pre",
                fontSize,
                lineHeight: 1.28,
                fontWeight: highlighted ? 700 : 600,
                color: highlighted
                  ? (line.accent ?? SOFT_WHITE)
                  : "rgba(247,244,255,0.8)",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                letterSpacing: -0.8,
              }}
            >
              {line.segments.map((segment, segmentIndex) => (
                <span
                  key={`${line.id}-${segmentIndex}`}
                  style={{
                    color:
                      segment.color ??
                      (highlighted
                        ? (line.accent ?? SOFT_WHITE)
                        : "rgba(247,244,255,0.84)"),
                    opacity: segment.opacity ?? 1,
                    fontWeight: segment.weight ?? (highlighted ? 700 : 600),
                  }}
                >
                  {segment.text}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const FilePanel: React.FC<{
  rect: Rect;
  inputOpacity: number;
  outputOpacity: number;
  headerOpacity: number;
  inputSrc: string | null;
  outputSrc: string | null;
  inputHighlights: number[];
  outputHighlights: number[];
  titleSize: number;
  inputCodeSize: number;
  outputCodeSize: number;
}> = ({
  rect,
  inputOpacity,
  outputOpacity,
  headerOpacity,
  inputSrc,
  outputSrc,
  inputHighlights,
  outputHighlights,
  titleSize,
  inputCodeSize,
  outputCodeSize,
}) => (
  <div
    style={{
      position: "absolute",
      left: rect.x,
      top: rect.y,
      width: rect.width,
      height: rect.height,
      transform: "translate(-50%, -50%)",
      zIndex: 5,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: -24,
        borderRadius: 62,
        background:
          "radial-gradient(circle, rgba(255,93,162,0.16), rgba(127,232,255,0.08) 42%, transparent 74%)",
        filter: "blur(20px)",
      }}
    />

    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 44,
        background:
          "linear-gradient(145deg, rgba(8,6,28,0.94), rgba(20,10,48,0.9))",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 38,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: titleSize * 2,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 50%, transparent 100%)",
            zIndex: 4,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: titleSize * 0.95,
            top: titleSize * 0.75,
            display: "flex",
            alignItems: "center",
            gap: titleSize * 0.36,
            opacity: headerOpacity,
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: titleSize * 1.2,
              height: titleSize * 1.2,
            }}
          >
            <NodeShell
              width={titleSize * 1.2}
              height={titleSize * 1.2}
              accent={HOT_PINK}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FlakeIcon color={HOT_PINK} />
              </div>
            </NodeShell>
          </div>

          <div
            style={{
              fontSize: titleSize,
              lineHeight: 0.9,
              fontWeight: 800,
              color: SOFT_WHITE,
              letterSpacing: 0.8,
              textShadow: "0 12px 30px rgba(255,93,162,0.26)",
            }}
          >
            flake.nix
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: titleSize * 2.15,
            bottom: 0,
          }}
        >
          {inputSrc ? (
            <Sequence durationInFrames={INPUT_SECTION_END + 120}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: inputOpacity,
                }}
              >
                <OffthreadVideo
                  src={inputSrc}
                  muted
                  delayRenderTimeoutInMilliseconds={120000}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </Sequence>
          ) : (
            <FallbackCode
              lines={INPUT_SNIPPET}
              highlightedIndices={inputHighlights}
              fontSize={inputCodeSize}
              opacity={inputOpacity}
            />
          )}

          {outputSrc ? (
            <Sequence
              from={OUTPUT_SECTION_START}
              durationInFrames={
                FLAKE_FILE_SCENE_DURATION - OUTPUT_SECTION_START
              }
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: outputOpacity,
                }}
              >
                <OffthreadVideo
                  src={outputSrc}
                  muted
                  delayRenderTimeoutInMilliseconds={120000}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </Sequence>
          ) : (
            <FallbackCode
              lines={OUTPUT_SNIPPET}
              highlightedIndices={outputHighlights}
              fontSize={outputCodeSize}
              opacity={outputOpacity}
              compact
            />
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(8,5,24,0.08), rgba(8,5,24,0) 20%, rgba(8,5,24,0.08) 68%, rgba(8,5,24,0.7) 100%)",
            }}
          />
        </div>
      </div>
    </GlassCard>
  </div>
);

export const FlakeFileScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const staticFiles = getStaticFiles();

  const scaleValue = (value: number) => value * (width / BASE_WIDTH);
  const layout = {
    frame: {
      paddingX: scaleValue(BASE_LAYOUT.frame.paddingX),
      paddingY: scaleValue(BASE_LAYOUT.frame.paddingY),
    },
    stage: {
      width: scaleValue(BASE_LAYOUT.stage.width),
      height: scaleValue(BASE_LAYOUT.stage.height),
    },
    panel: {
      largeWidth: scaleValue(BASE_LAYOUT.panel.largeWidth),
      largeHeight: scaleValue(BASE_LAYOUT.panel.largeHeight),
      smallWidth: scaleValue(BASE_LAYOUT.panel.smallWidth),
      smallHeight: scaleValue(BASE_LAYOUT.panel.smallHeight),
    },
    node: {
      width: scaleValue(BASE_LAYOUT.node.width),
      height: scaleValue(BASE_LAYOUT.node.height),
    },
    host: {
      width: scaleValue(BASE_LAYOUT.host.width),
      height: scaleValue(BASE_LAYOUT.host.height),
    },
    text: {
      hero: scaleValue(BASE_LAYOUT.text.hero),
      panelTitle: scaleValue(BASE_LAYOUT.text.panelTitle),
      code: scaleValue(BASE_LAYOUT.text.code),
      node: scaleValue(BASE_LAYOUT.text.node),
      host: scaleValue(BASE_LAYOUT.text.host),
    },
    size: {
      beam: scaleValue(BASE_LAYOUT.size.beam),
      pulse: scaleValue(BASE_LAYOUT.size.pulse),
      hub: scaleValue(BASE_LAYOUT.size.hub),
    },
  };

  const stageReveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 120, mass: 1 },
  });

  const heroPresence = presenceBetween(frame, 0, 50, 170, 250);
  const panelMorph = progressBetween(frame, 730, 900);
  const inputOpacity = clamp01(1 - progressBetween(frame, 710, 810));
  const outputOpacity = progressBetween(frame, 760, 860);
  const headerOpacity = progressBetween(frame, 140, 250);
  const hubReveal = spring({
    fps,
    frame: frame - 790,
    config: { damping: 16, stiffness: 118, mass: 1 },
  });

  const inputHighlights = INPUTS.filter(
    (item) => frame >= item.revealStart,
  ).flatMap((item) => item.highlightLineIndices);
  const outputHighlights = HOSTS.filter(
    (item) => frame >= item.revealStart,
  ).flatMap((item) => item.highlightLineIndices);

  const inputClipSrc = findRecordingSrc(staticFiles, "flake-inputs");
  const outputClipSrc = findRecordingSrc(staticFiles, "flake-outputs");

  const largeRect: Rect = {
    x: layout.stage.width * 0.5,
    y: layout.stage.height * 0.56,
    width: layout.panel.largeWidth,
    height: layout.panel.largeHeight,
  };

  const smallRect: Rect = {
    x: layout.stage.width * 0.5,
    y: layout.stage.height * 0.29,
    width: layout.panel.smallWidth,
    height: layout.panel.smallHeight,
  };

  const panelRect = mixRect(largeRect, smallRect, panelMorph);
  const dependencyTarget = {
    x: panelRect.x,
    y: panelRect.y - panelRect.height * 0.28,
  };
  const hostHub = {
    x: panelRect.x,
    y: panelRect.y + panelRect.height * 0.38,
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 18% 44%, rgba(255,159,74,0.14), transparent 30%), radial-gradient(circle at 82% 44%, rgba(127,232,255,0.16), transparent 30%), radial-gradient(circle at 50% 16%, rgba(255,93,162,0.16), transparent 24%)",
        }}
      />

      <AbsoluteFill
        style={{
          padding: `${layout.frame.paddingY}px ${layout.frame.paddingX}px`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: layout.stage.width,
            height: layout.stage.height,
            opacity: clamp01(stageReveal * 1.08),
            transform: `translateY(${mix(24, 0, stageReveal)}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: panelRect.x,
              top: panelRect.y,
              width: panelRect.width * 1.22,
              height: panelRect.height * 1.22,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,93,162,0.16), rgba(127,232,255,0.06) 44%, transparent 72%)",
              filter: "blur(20px)",
              opacity: 0.85,
            }}
          />

          <HeroTitle
            x={layout.stage.width * 0.5}
            y={layout.stage.height * 0.18}
            titleSize={layout.text.hero}
            reveal={heroPresence}
            frame={frame}
          />

          <FilePanel
            rect={panelRect}
            inputOpacity={inputOpacity}
            outputOpacity={outputOpacity}
            headerOpacity={headerOpacity}
            inputSrc={inputClipSrc}
            outputSrc={outputClipSrc}
            inputHighlights={inputHighlights}
            outputHighlights={outputHighlights}
            titleSize={layout.text.panelTitle}
            inputCodeSize={layout.text.code}
            outputCodeSize={layout.text.code * 0.8}
          />

          {INPUTS.map((dependency, index) => {
            const reveal = spring({
              fps,
              frame: frame - dependency.revealStart,
              config: { damping: 16, stiffness: 120, mass: 0.96 },
            });

            const collapse = progressBetween(
              frame,
              OUTPUT_SECTION_START - 60 + index * 8,
              OUTPUT_SECTION_START + 20 + index * 8,
            );

            const baseX = layout.stage.width * dependency.x;
            const baseY = layout.stage.height * dependency.y;
            const x = mix(baseX, dependencyTarget.x, collapse);
            const y = mix(baseY, dependencyTarget.y, collapse);
            const presence = clamp01(reveal * 1.08) * (1 - collapse);
            const lineAnchor = getFallbackLineAnchor({
              rect: panelRect,
              titleSize: layout.text.panelTitle,
              fontSize: layout.text.code,
              lineIndex: dependency.anchorLineIndex,
              side: dependency.x < 0.5 ? "left" : "right",
            });

            return (
              <div key={dependency.id}>
                <Beam
                  start={lineAnchor}
                  end={{ x, y }}
                  progress={presence}
                  accent={dependency.accent}
                  thickness={layout.size.beam}
                  pulseSize={layout.size.pulse}
                />
                <DependencyNode
                  dependency={dependency}
                  x={x}
                  y={y}
                  width={layout.node.width}
                  height={layout.node.height}
                  reveal={presence}
                  frame={frame}
                />
              </div>
            );
          })}

          {hubReveal > 0 && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: hostHub.x,
                  top: hostHub.y,
                  width: layout.size.hub,
                  height: layout.size.hub,
                  transform: `translate(-50%, -50%) scale(${mix(0.3, 1, hubReveal)})`,
                  opacity: hubReveal,
                  zIndex: 7,
                }}
              >
                <NodeShell
                  width={layout.size.hub}
                  height={layout.size.hub}
                  accent={HOT_PINK}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FlakeIcon color={SOFT_WHITE} rotation={-frame * 0.9} />
                  </div>
                </NodeShell>
              </div>

              {HOSTS.map((host) => {
                const reveal = spring({
                  fps,
                  frame: frame - host.revealStart,
                  config: { damping: 16, stiffness: 120, mass: 0.98 },
                });
                const x = layout.stage.width * host.x;
                const y = layout.stage.height * 0.83;

                return (
                  <div key={host.id}>
                    <Beam
                      start={hostHub}
                      end={{ x, y }}
                      progress={reveal}
                      accent={host.accent}
                      thickness={layout.size.beam}
                      pulseSize={layout.size.pulse}
                    />
                    <HostCard
                      host={host}
                      x={x}
                      y={y}
                      width={layout.host.width}
                      height={layout.host.height}
                      reveal={reveal}
                      frame={frame}
                    />
                  </div>
                );
              })}
            </>
          )}
        </div>

        <SceneProgressBar colors={["#ff5da2", "#8affcf"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
