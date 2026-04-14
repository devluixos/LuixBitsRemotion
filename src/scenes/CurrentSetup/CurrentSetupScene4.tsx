import type { ReactNode } from "react";
import {
  AbsoluteFill,
  getStaticFiles,
  interpolate,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
  type StaticFile,
} from "remotion";
import { Terminal, type TerminalLine } from "../../Terminal";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { GlassCard } from "../../components/GlassCard";
import { SceneProgressBar } from "../../components/SceneProgressBar";

export const CURRENT_SETUP_SCENE_4_DURATION = 1200; // Scene 4, 40.00 seconds @ 30fps

const BASE_WIDTH = 3440;
const RECORDING_EXTENSIONS = ["mp4", "mov", "webm"] as const;

const HOT_PINK = "#ff5da2";
const NIX_ORANGE = "#ff9f4a";
const NEUTRAL_BLUE = "#7fe8ff";
const NEOVIM_GREEN = "#8affcf";
const SOFT_WHITE = "#f7f4ff";
const MUTED_TEXT = "rgba(247,244,255,0.68)";

const HERO_TERMINAL_LINES: TerminalLine[] = [
  {
    prompt: "$",
    text: 'rg "mkHost|nixosConfigurations" flake.nix -n',
    startFrame: 8,
    mode: "type",
    color: SOFT_WHITE,
  },
  {
    prompt: "",
    text: "24: mkHost = { hostName, homeHost, hmUser }:",
    startFrame: 58,
    mode: "paste",
    color: HOT_PINK,
    glow: "rgba(255,93,162,0.38)",
  },
  {
    prompt: "",
    text: "43: nixosConfigurations = { pc = ...; l = ...; work = ...; }",
    startFrame: 102,
    mode: "paste",
    color: NEUTRAL_BLUE,
    glow: "rgba(127,232,255,0.32)",
  },
];

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CodeSegment = {
  text: string;
  color?: string;
  weight?: number;
  opacity?: number;
};

type SnippetLine = {
  id: string;
  number: string;
  accent?: string;
  segments: CodeSegment[];
};

type RectCardProps = {
  rect: Rect;
  reveal: number;
  tilt?: number;
  zIndex: number;
  children: ReactNode;
};

const MKHOST_LINES: SnippetLine[] = [
  {
    id: "signature",
    number: "24",
    accent: HOT_PINK,
    segments: [
      { text: "mkHost", color: HOT_PINK, weight: 800 },
      { text: " = { ", color: SOFT_WHITE },
      { text: "hostName", color: NIX_ORANGE, weight: 800 },
      { text: ", ", color: SOFT_WHITE },
      { text: "homeHost", color: NEUTRAL_BLUE, weight: 800 },
      { text: ", ", color: SOFT_WHITE },
      { text: "hmUser", color: NEOVIM_GREEN, weight: 800 },
      { text: " }:", color: SOFT_WHITE },
    ],
  },
  {
    id: "system",
    number: "25",
    accent: HOT_PINK,
    segments: [
      { text: "  " },
      { text: "nixpkgs.lib.nixosSystem", color: HOT_PINK, weight: 800 },
      { text: " {", color: SOFT_WHITE },
    ],
  },
  {
    id: "modules",
    number: "26",
    segments: [{ text: "    modules = [", color: SOFT_WHITE, weight: 700 }],
  },
  {
    id: "hosts",
    number: "27",
    accent: NIX_ORANGE,
    segments: [
      { text: "      ./hosts/${", color: SOFT_WHITE },
      { text: "hostName", color: NIX_ORANGE, weight: 800 },
      { text: "}", color: SOFT_WHITE },
    ],
  },
  {
    id: "home",
    number: "28",
    accent: NEUTRAL_BLUE,
    segments: [
      { text: '      home-manager.users."', color: SOFT_WHITE },
      { text: "${hmUser}", color: NEOVIM_GREEN, weight: 800 },
      { text: '" = import ', color: SOFT_WHITE },
      { text: "homeHost", color: NEUTRAL_BLUE, weight: 800 },
      { text: ";", color: SOFT_WHITE },
    ],
  },
  {
    id: "close",
    number: "29",
    segments: [{ text: "    ];", color: SOFT_WHITE }],
  },
  {
    id: "done",
    number: "30",
    segments: [{ text: "  }", color: SOFT_WHITE }],
  },
];

const OUTPUT_LINES: SnippetLine[] = [
  {
    id: "root",
    number: "43",
    accent: HOT_PINK,
    segments: [
      {
        text: "nixosConfigurations",
        color: HOT_PINK,
        weight: 800,
      },
      { text: " = {", color: SOFT_WHITE },
    ],
  },
  {
    id: "pc",
    number: "44",
    accent: NIX_ORANGE,
    segments: [
      { text: "  " },
      { text: "pc", color: NIX_ORANGE, weight: 800 },
      { text: " = ", color: SOFT_WHITE },
      { text: "mkHost", color: HOT_PINK, weight: 800 },
      { text: " { ... };", color: SOFT_WHITE },
    ],
  },
  {
    id: "l",
    number: "45",
    accent: NEUTRAL_BLUE,
    segments: [
      { text: "  " },
      { text: "l", color: NEUTRAL_BLUE, weight: 800 },
      { text: " = ", color: SOFT_WHITE },
      { text: "mkHost", color: HOT_PINK, weight: 800 },
      { text: " { ... };", color: SOFT_WHITE },
    ],
  },
  {
    id: "work",
    number: "46",
    accent: NEOVIM_GREEN,
    segments: [
      { text: "  " },
      { text: "work", color: NEOVIM_GREEN, weight: 800 },
      { text: " = ", color: SOFT_WHITE },
      { text: "mkHost", color: HOT_PINK, weight: 800 },
      { text: " { ... };", color: SOFT_WHITE },
    ],
  },
  {
    id: "end",
    number: "47",
    segments: [{ text: "};", color: SOFT_WHITE }],
  },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const mixRect = (from: Rect, to: Rect, progress: number): Rect => ({
  x: mix(from.x, to.x, progress),
  y: mix(from.y, to.y, progress),
  width: mix(from.width, to.width, progress),
  height: mix(from.height, to.height, progress),
});

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

const findRecordingSrc = (
  files: StaticFile[],
  label: "mkhost-function" | "mkhost-outputs",
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

const FlakeIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 120 120" style={{ width: "76%", height: "76%" }}>
    <g stroke={color} strokeWidth="6" strokeLinecap="round">
      <line x1="60" y1="12" x2="60" y2="108" />
      <line x1="12" y1="60" x2="108" y2="60" />
      <line x1="24" y1="24" x2="96" y2="96" />
      <line x1="96" y1="24" x2="24" y2="96" />
    </g>
    <circle
      cx="60"
      cy="60"
      r="13"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="5"
    />
  </svg>
);

const GearIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 120 120" style={{ width: "76%", height: "76%" }}>
    <circle
      cx="60"
      cy="60"
      r="24"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="6"
    />
    {[0, 60, 120, 180, 240, 300].map((deg) => (
      <rect
        key={deg}
        x="55"
        y="10"
        width="10"
        height="20"
        rx="5"
        fill={color}
        transform={`rotate(${deg} 60 60)`}
      />
    ))}
  </svg>
);

const HomeIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 140 120" style={{ width: "76%", height: "76%" }}>
    <path
      d="M24 64 L70 28 L116 64 V106 H24 Z"
      fill={`${color}18`}
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
      fill={`${color}26`}
      stroke={color}
      strokeWidth="5"
    />
  </svg>
);

const UserIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 120 120" style={{ width: "76%", height: "76%" }}>
    <circle
      cx="60"
      cy="42"
      r="18"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="5"
    />
    <path
      d="M32 92 C36 74 48 66 60 66 C72 66 84 74 88 92"
      fill="none"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
);

const SceneCard = ({
  rect,
  reveal,
  tilt = 0,
  zIndex,
  children,
}: RectCardProps) => {
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
        transform: `translate(-50%, -50%) translateY(${mix(72, 0, reveal)}px) rotate(${mix(
          tilt - 1.2,
          tilt,
          reveal,
        )}deg) scale(${mix(0.94, 1, reveal)})`,
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
}: {
  text: string;
  color: string;
  opacity: number;
}) => {
  if (opacity <= 0.01) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "8%",
        transform: `translateX(-50%) scale(${mix(0.96, 1, opacity)})`,
        opacity,
        fontSize: 84,
        lineHeight: 0.9,
        fontWeight: 800,
        color,
        letterSpacing: 1,
        textShadow: `0 0 26px ${color}30`,
        zIndex: 20,
      }}
    >
      {text}
    </div>
  );
};

const RecordingOrTerminal = ({
  rect,
  reveal,
  src,
  fontSize,
}: {
  rect: Rect;
  reveal: number;
  src: string | null;
  fontSize: number;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={-1.3} zIndex={4}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 34,
        background:
          "linear-gradient(135deg, rgba(18,8,48,0.9), rgba(66,16,102,0.82))",
        border: "1px solid rgba(255,137,255,0.25)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 30,
        }}
      >
        {src ? (
          <OffthreadVideo
            src={src}
            muted
            delayRenderTimeoutInMilliseconds={120000}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Terminal
            lines={HERO_TERMINAL_LINES}
            fontSize={fontSize}
            promptWidth={fontSize * 1.36}
          />
        )}
      </div>
    </GlassCard>
  </SceneCard>
);

const CodePanel = ({
  rect,
  reveal,
  title,
  label,
  lines,
  activeIds,
  titleAccent,
  codeSize,
  lineNoSize,
  zIndex,
  tilt = 0,
  videoSrc,
  titleScale = 1.75,
  bodyTopRatio = 0.34,
  rowGapRatio = 0.088,
}: {
  rect: Rect;
  reveal: number;
  title: string;
  label: string;
  lines: SnippetLine[];
  activeIds: string[];
  titleAccent: string;
  codeSize: number;
  lineNoSize: number;
  zIndex: number;
  tilt?: number;
  videoSrc?: string | null;
  titleScale?: number;
  bodyTopRatio?: number;
  rowGapRatio?: number;
}) => {
  const activeSet = new Set(activeIds);
  const lineNoWidth = rect.width * 0.075;
  const rowGap = rect.height * rowGapRatio;

  return (
    <SceneCard rect={rect} reveal={reveal} tilt={tilt} zIndex={zIndex}>
      <GlassCard
        style={{
          height: "100%",
          padding: 0,
          borderRadius: 42,
          background:
            "linear-gradient(145deg, rgba(8,6,28,0.95), rgba(24,10,54,0.9))",
          border: "1px solid rgba(255,255,255,0.12)",
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
          {videoSrc ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.18,
              }}
            >
              <OffthreadVideo
                src={videoSrc}
                muted
                delayRenderTimeoutInMilliseconds={120000}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : null}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 18% 10%, rgba(255,93,162,0.15), transparent 30%), radial-gradient(circle at 86% 16%, rgba(127,232,255,0.12), transparent 24%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: rect.width * 0.05,
              top: rect.height * 0.065,
              right: rect.width * 0.05,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Dots />
            <div
              style={{
                fontSize: lineNoSize * 1.35,
                lineHeight: 0.9,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: MUTED_TEXT,
              }}
            >
              {label}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: rect.width * 0.05,
              top: rect.height * 0.16,
              display: "flex",
              alignItems: "center",
              gap: rect.width * 0.018,
            }}
          >
            <div
              style={{
                width: codeSize * 1.65,
                height: codeSize * 1.65,
                borderRadius: codeSize * 0.36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${titleAccent}10`,
                border: `1px solid ${titleAccent}32`,
                boxShadow: `0 0 18px ${titleAccent}18`,
              }}
            >
              <FlakeIcon color={titleAccent} />
            </div>
            <div
              style={{
                fontSize: codeSize * titleScale,
                lineHeight: 0.84,
                fontWeight: 800,
                color: SOFT_WHITE,
                textShadow: `0 14px 36px ${titleAccent}24`,
              }}
            >
              {title}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: rect.width * 0.055,
              right: rect.width * 0.055,
              top: rect.height * bodyTopRatio,
            }}
          >
            {lines.map((line, index) => {
              const active = activeSet.has(line.id);
              const accent = line.accent ?? titleAccent;

              return (
                <div
                  key={line.id}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: rowGap * index,
                    minHeight: rowGap * 0.84,
                    display: "grid",
                    gridTemplateColumns: `${lineNoWidth}px 1fr`,
                    alignItems: "center",
                    gap: codeSize * 0.18,
                    padding: `${codeSize * 0.18}px ${codeSize * 0.26}px`,
                    borderRadius: codeSize * 0.3,
                    background: active
                      ? `linear-gradient(90deg, ${accent}18, rgba(255,255,255,0.02))`
                      : "transparent",
                    border: active
                      ? `1px solid ${accent}30`
                      : "1px solid transparent",
                    boxShadow: active ? `0 0 18px ${accent}16` : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: lineNoSize,
                      color: active ? SOFT_WHITE : MUTED_TEXT,
                      textAlign: "right",
                    }}
                  >
                    {line.number}
                  </div>
                  <div
                    style={{
                      whiteSpace: "pre",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: codeSize,
                      lineHeight: 1.16,
                      letterSpacing: -0.8,
                      color: SOFT_WHITE,
                    }}
                  >
                    {line.segments.map((segment, segmentIndex) => (
                      <span
                        key={`${line.id}-${segmentIndex}`}
                        style={{
                          color:
                            segment.color ??
                            (active ? accent : "rgba(247,244,255,0.88)"),
                          fontWeight: segment.weight ?? (active ? 700 : 600),
                          opacity: segment.opacity ?? 1,
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
        </div>
      </GlassCard>
    </SceneCard>
  );
};

const PatternCard = ({
  rect,
  reveal,
  accent,
  label,
  topText,
  bottomText,
}: {
  rect: Rect;
  reveal: number;
  accent: string;
  label: string;
  topText: string;
  bottomText: string;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={0} zIndex={6}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 38,
        background: `linear-gradient(145deg, ${accent}16, rgba(20,10,40,0.9))`,
        border: `1px solid ${accent}3f`,
        boxShadow: `0 0 28px ${accent}18`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "34px 36px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: Math.min(rect.width * 0.12, rect.height * 0.16),
            lineHeight: 0.9,
            color: MUTED_TEXT,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: rect.height * 0.08,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: Math.min(rect.width * 0.14, rect.height * 0.22),
            lineHeight: 0.88,
            fontWeight: 800,
            color: SOFT_WHITE,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            textShadow: `0 0 20px ${accent}28`,
          }}
        >
          {topText}
        </div>
        <div
          style={{
            width: "64%",
            height: 4,
            margin: "26px 0 24px",
            borderRadius: 999,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          }}
        />
        <div
          style={{
            fontSize: Math.min(rect.width * 0.12, rect.height * 0.18),
            lineHeight: 0.88,
            fontWeight: 800,
            color: SOFT_WHITE,
            textShadow: `0 0 20px ${accent}20`,
          }}
        >
          {bottomText}
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const ResultBadge = ({
  rect,
  reveal,
  accent,
  label,
  value,
}: {
  rect: Rect;
  reveal: number;
  accent: string;
  label: string;
  value: string;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={0.8} zIndex={8}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 40,
        background: `linear-gradient(145deg, ${accent}14, rgba(12,10,34,0.94))`,
        border: `1px solid ${accent}40`,
        boxShadow: `0 0 30px ${accent}18`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "30px 34px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accent}10`,
            border: `1px solid ${accent}30`,
          }}
        >
          <FlakeIcon color={accent} />
        </div>
        <div
          style={{
            fontSize: 28,
            lineHeight: 0.9,
            color: MUTED_TEXT,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 76,
            lineHeight: 0.88,
            fontWeight: 800,
            color: SOFT_WHITE,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            textShadow: `0 0 24px ${accent}24`,
          }}
        >
          {value}
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const InputCard = ({
  rect,
  reveal,
  label,
  value,
  accent,
  icon,
}: {
  rect: Rect;
  reveal: number;
  label: string;
  value: string;
  accent: string;
  icon: ReactNode;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={0} zIndex={7}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 34,
        background: `linear-gradient(145deg, ${accent}14, rgba(16,10,36,0.92))`,
        border: `1px solid ${accent}40`,
        boxShadow: `0 0 26px ${accent}18`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${accent}10`,
            border: `1px solid ${accent}34`,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 24,
              lineHeight: 0.9,
              color: MUTED_TEXT,
              letterSpacing: 1.8,
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 56,
              lineHeight: 0.88,
              fontWeight: 800,
              color: SOFT_WHITE,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              textShadow: `0 0 18px ${accent}26`,
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const OrbNode = ({
  center,
  size,
  reveal,
  label,
  accent,
  zIndex,
}: {
  center: { x: number; y: number };
  size: number;
  reveal: number;
  label: string;
  accent: string;
  zIndex: number;
}) => (
  <SceneCard
    rect={{ x: center.x, y: center.y, width: size, height: size }}
    reveal={reveal}
    tilt={0}
    zIndex={zIndex}
  >
    <div
      style={{
        position: "absolute",
        inset: -size * 0.12,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}24, transparent 68%)`,
        filter: "blur(22px)",
      }}
    />
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.1), transparent 36%), linear-gradient(145deg, ${accent}18, rgba(16,10,36,0.92))`,
        border: `1px solid ${accent}44`,
        boxShadow: `0 0 32px ${accent}1f, inset 0 0 40px rgba(255,255,255,0.06)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "10%",
          borderRadius: "50%",
          border: `2px solid ${accent}30`,
        }}
      />
      <div
        style={{
          position: "relative",
          fontSize: size * 0.18,
          lineHeight: 0.88,
          fontWeight: 800,
          color: SOFT_WHITE,
          textShadow: `0 0 22px ${accent}2a`,
        }}
      >
        {label}
      </div>
    </div>
  </SceneCard>
);

const BuildResultCard = ({
  rect,
  reveal,
  systemGlow,
  homeGlow,
}: {
  rect: Rect;
  reveal: number;
  systemGlow: number;
  homeGlow: number;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={1.4} zIndex={8}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 42,
        background:
          "linear-gradient(145deg, rgba(8,6,28,0.96), rgba(24,10,54,0.9))",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "38px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,93,162,0.1)",
              border: "1px solid rgba(255,93,162,0.32)",
            }}
          >
            <FlakeIcon color={HOT_PINK} />
          </div>
          <div
            style={{
              fontSize: 110,
              lineHeight: 0.84,
              fontWeight: 800,
              color: SOFT_WHITE,
              textShadow: "0 14px 34px rgba(255,93,162,0.22)",
            }}
          >
            nixosSystem
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            flex: 1,
          }}
        >
          <div
            style={{
              borderRadius: 34,
              padding: "30px 28px",
              background: `linear-gradient(145deg, ${NIX_ORANGE}${
                systemGlow > 0.05 ? "18" : "10"
              }, rgba(255,255,255,0.03))`,
              border: `1px solid ${NIX_ORANGE}${
                systemGlow > 0.05 ? "54" : "30"
              }`,
              boxShadow:
                systemGlow > 0.05
                  ? `0 0 32px ${NIX_ORANGE}1f`
                  : "0 0 0 transparent",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${NIX_ORANGE}10`,
                border: `1px solid ${NIX_ORANGE}34`,
              }}
            >
              <GearIcon color={NIX_ORANGE} />
            </div>
            <div
              style={{
                fontSize: 28,
                lineHeight: 0.9,
                color: MUTED_TEXT,
                textTransform: "uppercase",
                letterSpacing: 1.8,
              }}
            >
              system
            </div>
            <div
              style={{
                fontSize: 46,
                lineHeight: 0.9,
                fontWeight: 800,
                color: SOFT_WHITE,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            >
              ./hosts/${"{hostName}"}
            </div>
          </div>

          <div
            style={{
              borderRadius: 34,
              padding: "30px 28px",
              background: `linear-gradient(145deg, ${NEUTRAL_BLUE}${
                homeGlow > 0.05 ? "18" : "10"
              }, rgba(255,255,255,0.03))`,
              border: `1px solid ${NEUTRAL_BLUE}${homeGlow > 0.05 ? "54" : "30"}`,
              boxShadow:
                homeGlow > 0.05
                  ? `0 0 32px ${NEUTRAL_BLUE}1f`
                  : "0 0 0 transparent",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", gap: 14 }}>
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${NEUTRAL_BLUE}10`,
                  border: `1px solid ${NEUTRAL_BLUE}34`,
                }}
              >
                <HomeIcon color={NEUTRAL_BLUE} />
              </div>
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${NEOVIM_GREEN}10`,
                  border: `1px solid ${NEOVIM_GREEN}34`,
                }}
              >
                <UserIcon color={NEOVIM_GREEN} />
              </div>
            </div>
            <div
              style={{
                fontSize: 28,
                lineHeight: 0.9,
                color: MUTED_TEXT,
                textTransform: "uppercase",
                letterSpacing: 1.8,
              }}
            >
              home manager
            </div>
            <div
              style={{
                fontSize: 42,
                lineHeight: 0.94,
                fontWeight: 800,
                color: SOFT_WHITE,
                whiteSpace: "pre-line",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            >
              {'users."${hmUser}"\n= import homeHost;'}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const ReasonPanel = ({
  rect,
  reveal,
  accent,
  title,
  value,
  icon,
  secondary,
}: {
  rect: Rect;
  reveal: number;
  accent: string;
  title: string;
  value: string;
  icon: ReactNode;
  secondary?: ReactNode;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={0} zIndex={8}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 42,
        background: `linear-gradient(145deg, ${accent}12, rgba(14,10,36,0.94))`,
        border: `1px solid ${accent}40`,
        boxShadow: `0 0 30px ${accent}1a`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "42px 38px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 22,
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${accent}10`,
              border: `1px solid ${accent}34`,
            }}
          >
            {icon}
          </div>
          {secondary}
        </div>
        <div
          style={{
            fontSize: 34,
            lineHeight: 0.9,
            color: MUTED_TEXT,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 60,
            lineHeight: 0.92,
            fontWeight: 800,
            color: SOFT_WHITE,
            whiteSpace: "pre-line",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            textShadow: `0 14px 28px ${accent}22`,
          }}
        >
          {value}
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const HostCard = ({
  rect,
  reveal,
  id,
  accent,
}: {
  rect: Rect;
  reveal: number;
  id: string;
  accent: string;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={0} zIndex={9}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 38,
        background: `linear-gradient(145deg, ${accent}14, rgba(14,10,36,0.94))`,
        border: `1px solid ${accent}42`,
        boxShadow: `0 0 28px ${accent}1d`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "30px 32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 28,
            lineHeight: 0.9,
            color: MUTED_TEXT,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          host output
        </div>
        <div
          style={{
            fontSize: id.length > 2 ? 128 : 142,
            lineHeight: 0.84,
            fontWeight: 800,
            color: SOFT_WHITE,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            textShadow: `0 0 24px ${accent}2c`,
          }}
        >
          {id}
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const Beam = ({
  start,
  end,
  progress,
  accent,
  thickness,
  pulseSize,
  opacity = 1,
}: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  progress: number;
  accent: string;
  thickness: number;
  pulseSize: number;
  opacity?: number;
}) => {
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
          background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.94))`,
          boxShadow: `0 0 22px ${accent}, 0 0 36px ${accent}24`,
          opacity: clamp01(progress * 1.08) * opacity,
          zIndex: 6,
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
          boxShadow: `0 0 28px ${accent}, 0 0 42px ${accent}50`,
          opacity,
          zIndex: 7,
        }}
      />
    </>
  );
};

export const CurrentSetupScene4 = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const staticFiles = getStaticFiles();

  const scaleValue = (value: number) => value * (width / BASE_WIDTH);
  const stage = {
    width: scaleValue(3080),
    height: scaleValue(1180),
    paddingX: scaleValue(118),
    paddingY: scaleValue(84),
  };

  const functionClip = findRecordingSrc(staticFiles, "mkhost-function");
  const outputsClip = findRecordingSrc(staticFiles, "mkhost-outputs");

  const heroPresence = presenceBetween(frame, 0, 40, 170, 220);
  const repeatPresence = presenceBetween(frame, 170, 215, 345, 395);
  const pipelinePresence = presenceBetween(frame, 360, 410, 595, 645);
  const reasonsPresence = presenceBetween(frame, 600, 650, 910, 960);
  const outputsPresence = progressBetween(frame, 930, 990);

  const heroReveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 126, mass: 0.96 },
  });
  const heroHostReveal = spring({
    fps,
    frame: frame - 36,
    config: { damping: 18, stiffness: 126, mass: 0.96 },
  });
  const heroHomeReveal = spring({
    fps,
    frame: frame - 62,
    config: { damping: 18, stiffness: 126, mass: 0.96 },
  });
  const heroUserReveal = spring({
    fps,
    frame: frame - 88,
    config: { damping: 18, stiffness: 126, mass: 0.96 },
  });
  const heroResultReveal = spring({
    fps,
    frame: frame - 110,
    config: { damping: 18, stiffness: 122, mass: 0.96 },
  });
  const heroHostFlow = progressBetween(frame, 78, 120);
  const heroHomeFlow = progressBetween(frame, 100, 142);
  const heroUserFlow = progressBetween(frame, 122, 164);

  const repeatCollapse = progressBetween(frame, 285, 360);
  const repeatRightReveal = spring({
    fps,
    frame: frame - 236,
    config: { damping: 18, stiffness: 122, mass: 0.96 },
  });
  const repeatFlow1 = progressBetween(frame, 240, 290);
  const repeatFlow2 = progressBetween(frame, 258, 308);
  const repeatFlow3 = progressBetween(frame, 276, 326);
  const mkHostOrbReveal = spring({
    fps,
    frame: frame - 432,
    config: { damping: 18, stiffness: 126, mass: 0.96 },
  });
  const resultReveal = spring({
    fps,
    frame: frame - 492,
    config: { damping: 17, stiffness: 120, mass: 0.96 },
  });

  const systemInputFlow = progressBetween(frame, 430, 500);
  const homeFileFlow = progressBetween(frame, 462, 532);
  const userFlow = progressBetween(frame, 494, 564);
  const mkHostFlow = progressBetween(frame, 530, 600);

  const reasonHubReveal = spring({
    fps,
    frame: frame - 620,
    config: { damping: 18, stiffness: 126, mass: 0.96 },
  });
  const leftReasonReveal = spring({
    fps,
    frame: frame - 650,
    config: { damping: 18, stiffness: 126, mass: 0.96 },
  });
  const rightReasonReveal = spring({
    fps,
    frame: frame - 680,
    config: { damping: 18, stiffness: 126, mass: 0.96 },
  });
  const systemReasonFlow = progressBetween(frame, 700, 790);
  const homeReasonFlow = progressBetween(frame, 740, 830);

  const outputsReveal = spring({
    fps,
    frame: frame - 930,
    config: { damping: 17, stiffness: 118, mass: 0.98 },
  });

  const heroActiveIds = ["signature"];
  if (frame >= 60) {
    heroActiveIds.push("system");
  }
  if (frame >= 92) {
    heroActiveIds.push("hosts");
  }
  if (frame >= 120) {
    heroActiveIds.push("home");
  }

  const outputActiveIds = ["root"];
  if (frame >= 986) {
    outputActiveIds.push("pc");
  }
  if (frame >= 1022) {
    outputActiveIds.push("l");
  }
  if (frame >= 1058) {
    outputActiveIds.push("work");
  }

  const heroStripRect: Rect = {
    x: stage.width * 0.25,
    y: stage.height * 0.14,
    width: stage.width * 0.39,
    height: stage.height * 0.16,
  };

  const heroCodeRect: Rect = {
    x: stage.width * 0.34,
    y: stage.height * 0.57,
    width: stage.width * 0.56,
    height: stage.height * 0.68,
  };

  const repeatCards = [
    {
      accent: NIX_ORANGE,
      label: "pc",
      from: {
        x: stage.width * 0.26,
        y: stage.height * 0.28,
        width: stage.width * 0.28,
        height: stage.height * 0.22,
      },
    },
    {
      accent: HOT_PINK,
      label: "l",
      from: {
        x: stage.width * 0.26,
        y: stage.height * 0.56,
        width: stage.width * 0.28,
        height: stage.height * 0.22,
      },
    },
    {
      accent: NEUTRAL_BLUE,
      label: "work",
      from: {
        x: stage.width * 0.26,
        y: stage.height * 0.84,
        width: stage.width * 0.28,
        height: stage.height * 0.22,
      },
    },
  ];

  const repeatFocusRect: Rect = {
    x: stage.width * 0.72,
    y: stage.height * 0.56,
    width: stage.width * 0.34,
    height: stage.height * 0.42,
  };

  const heroSummaryRects = [
    {
      x: stage.width * 0.79,
      y: stage.height * 0.25,
    },
    {
      x: stage.width * 0.79,
      y: stage.height * 0.44,
    },
    {
      x: stage.width * 0.79,
      y: stage.height * 0.63,
    },
  ];

  const heroSummarySize = {
    width: stage.width * 0.26,
    height: stage.height * 0.145,
  };

  const heroResultRect: Rect = {
    x: stage.width * 0.79,
    y: stage.height * 0.84,
    width: stage.width * 0.28,
    height: stage.height * 0.22,
  };

  const inputRects = [
    {
      x: stage.width * 0.17,
      y: stage.height * 0.29,
    },
    {
      x: stage.width * 0.17,
      y: stage.height * 0.52,
    },
    {
      x: stage.width * 0.17,
      y: stage.height * 0.75,
    },
  ];

  const inputCardSize = {
    width: stage.width * 0.25,
    height: stage.height * 0.17,
  };

  const mkHostOrbCenter = { x: stage.width * 0.47, y: stage.height * 0.53 };
  const mkHostOrbSize = stage.width * 0.14;

  const resultRect: Rect = {
    x: stage.width * 0.79,
    y: stage.height * 0.53,
    width: stage.width * 0.34,
    height: stage.height * 0.6,
  };

  const resultLeftAnchor = {
    x: resultRect.x - resultRect.width / 2,
    y: resultRect.y,
  };

  const reasonsLeftRect: Rect = {
    x: stage.width * 0.23,
    y: stage.height * 0.57,
    width: stage.width * 0.29,
    height: stage.height * 0.62,
  };

  const reasonsRightRect: Rect = {
    x: stage.width * 0.77,
    y: stage.height * 0.57,
    width: stage.width * 0.29,
    height: stage.height * 0.62,
  };

  const reasonsHubCenter = { x: stage.width * 0.5, y: stage.height * 0.57 };
  const reasonsHubSize = stage.width * 0.12;

  const outputsCodeRect: Rect = {
    x: stage.width * 0.35,
    y: stage.height * 0.55,
    width: stage.width * 0.6,
    height: stage.height * 0.7,
  };

  const outputHostRectSize = {
    width: stage.width * 0.24,
    height: stage.height * 0.22,
  };

  const stageFloat = Math.sin(frame / 44) * scaleValue(8);
  const pulseSize = scaleValue(28);
  const beamSize = scaleValue(9);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 18% 16%, rgba(255,93,162,0.14), transparent 28%), radial-gradient(circle at 82% 24%, rgba(127,232,255,0.14), transparent 26%), radial-gradient(circle at 56% 78%, rgba(255,159,74,0.12), transparent 28%)",
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
            text="define once"
            color={HOT_PINK}
            opacity={presenceBetween(frame, 202, 238, 310, 350)}
          />
          <OverlayTitle
            text="removes repetition"
            color={NIX_ORANGE}
            opacity={presenceBetween(frame, 645, 680, 720, 760)}
          />
          <OverlayTitle
            text="built together"
            color={SOFT_WHITE}
            opacity={presenceBetween(frame, 780, 820, 905, 945)}
          />

          <div style={{ opacity: heroPresence }}>
            <RecordingOrTerminal
              rect={heroStripRect}
              reveal={heroReveal}
              src={functionClip}
              fontSize={scaleValue(36)}
            />
            <CodePanel
              rect={heroCodeRect}
              reveal={heroReveal}
              title="mkHost"
              label="flake.nix"
              lines={MKHOST_LINES}
              activeIds={heroActiveIds}
              titleAccent={HOT_PINK}
              codeSize={scaleValue(52)}
              lineNoSize={scaleValue(30)}
              zIndex={5}
              tilt={-0.6}
            />
            <InputCard
              rect={{
                ...heroSummaryRects[0],
                ...heroSummarySize,
              }}
              reveal={heroHostReveal * heroPresence}
              label="host name"
              value="hostName"
              accent={NIX_ORANGE}
              icon={<GearIcon color={NIX_ORANGE} />}
            />
            <InputCard
              rect={{
                ...heroSummaryRects[1],
                ...heroSummarySize,
              }}
              reveal={heroHomeReveal * heroPresence}
              label="home file"
              value="homeHost"
              accent={NEUTRAL_BLUE}
              icon={<HomeIcon color={NEUTRAL_BLUE} />}
            />
            <InputCard
              rect={{
                ...heroSummaryRects[2],
                ...heroSummarySize,
              }}
              reveal={heroUserReveal * heroPresence}
              label="username"
              value="hmUser"
              accent={NEOVIM_GREEN}
              icon={<UserIcon color={NEOVIM_GREEN} />}
            />
            <ResultBadge
              rect={heroResultRect}
              reveal={heroResultReveal * heroPresence}
              accent={HOT_PINK}
              label="builds"
              value="nixosSystem"
            />
          </div>

          <Beam
            start={{
              x: heroSummaryRects[0].x,
              y: heroSummaryRects[0].y + heroSummarySize.height / 2,
            }}
            end={{
              x: heroResultRect.x,
              y: heroResultRect.y - heroResultRect.height / 2,
            }}
            progress={heroHostFlow * heroPresence}
            accent={NIX_ORANGE}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={heroPresence}
          />
          <Beam
            start={{
              x: heroSummaryRects[1].x,
              y: heroSummaryRects[1].y + heroSummarySize.height / 2,
            }}
            end={{
              x: heroResultRect.x,
              y: heroResultRect.y - heroResultRect.height / 2,
            }}
            progress={heroHomeFlow * heroPresence}
            accent={NEUTRAL_BLUE}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={heroPresence}
          />
          <Beam
            start={{
              x: heroSummaryRects[2].x,
              y: heroSummaryRects[2].y + heroSummarySize.height / 2,
            }}
            end={{
              x: heroResultRect.x,
              y: heroResultRect.y - heroResultRect.height / 2,
            }}
            progress={heroUserFlow * heroPresence}
            accent={NEOVIM_GREEN}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={heroPresence}
          />

          <div style={{ opacity: repeatPresence }}>
            {repeatCards.map((card, index) => {
              const progress = index === 1 ? repeatCollapse * 0.12 : 0;
              const rect = mixRect(card.from, repeatFocusRect, progress);
              const reveal = repeatPresence * (1 - progress * 0.9);

              return (
                <PatternCard
                  key={card.label}
                  rect={rect}
                  reveal={reveal}
                  accent={card.accent}
                  label={card.label}
                  topText="nixosSystem"
                  bottomText="modules = [ ... ]"
                />
              );
            })}
            <PatternCard
              rect={repeatFocusRect}
              reveal={repeatRightReveal * repeatPresence}
              accent={HOT_PINK}
              label="one function"
              topText="mkHost(...)"
              bottomText="nixosSystem"
            />
          </div>

          <Beam
            start={{
              x: repeatCards[0].from.x + repeatCards[0].from.width / 2,
              y: repeatCards[0].from.y,
            }}
            end={{
              x: repeatFocusRect.x - repeatFocusRect.width / 2,
              y: repeatFocusRect.y - repeatFocusRect.height * 0.18,
            }}
            progress={repeatFlow1 * repeatPresence}
            accent={NIX_ORANGE}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={repeatPresence}
          />
          <Beam
            start={{
              x: repeatCards[1].from.x + repeatCards[1].from.width / 2,
              y: repeatCards[1].from.y,
            }}
            end={{
              x: repeatFocusRect.x - repeatFocusRect.width / 2,
              y: repeatFocusRect.y,
            }}
            progress={repeatFlow2 * repeatPresence}
            accent={HOT_PINK}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={repeatPresence}
          />
          <Beam
            start={{
              x: repeatCards[2].from.x + repeatCards[2].from.width / 2,
              y: repeatCards[2].from.y,
            }}
            end={{
              x: repeatFocusRect.x - repeatFocusRect.width / 2,
              y: repeatFocusRect.y + repeatFocusRect.height * 0.18,
            }}
            progress={repeatFlow3 * repeatPresence}
            accent={NEUTRAL_BLUE}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={repeatPresence}
          />

          <div style={{ opacity: pipelinePresence }}>
            <InputCard
              rect={{
                ...inputRects[0],
                ...inputCardSize,
              }}
              reveal={
                spring({
                  fps,
                  frame: frame - 370,
                  config: { damping: 18, stiffness: 126, mass: 0.96 },
                }) * pipelinePresence
              }
              label="host name"
              value="hostName"
              accent={NIX_ORANGE}
              icon={<GearIcon color={NIX_ORANGE} />}
            />
            <InputCard
              rect={{
                ...inputRects[1],
                ...inputCardSize,
              }}
              reveal={
                spring({
                  fps,
                  frame: frame - 398,
                  config: { damping: 18, stiffness: 126, mass: 0.96 },
                }) * pipelinePresence
              }
              label="home file"
              value="homeHost"
              accent={NEUTRAL_BLUE}
              icon={<HomeIcon color={NEUTRAL_BLUE} />}
            />
            <InputCard
              rect={{
                ...inputRects[2],
                ...inputCardSize,
              }}
              reveal={
                spring({
                  fps,
                  frame: frame - 426,
                  config: { damping: 18, stiffness: 126, mass: 0.96 },
                }) * pipelinePresence
              }
              label="username"
              value="hmUser"
              accent={NEOVIM_GREEN}
              icon={<UserIcon color={NEOVIM_GREEN} />}
            />

            <OrbNode
              center={mkHostOrbCenter}
              size={mkHostOrbSize}
              reveal={mkHostOrbReveal * pipelinePresence}
              label="mkHost"
              accent={HOT_PINK}
              zIndex={8}
            />

            <BuildResultCard
              rect={resultRect}
              reveal={resultReveal * pipelinePresence}
              systemGlow={systemInputFlow + mkHostFlow * 0.2}
              homeGlow={Math.max(homeFileFlow, userFlow) + mkHostFlow * 0.2}
            />
          </div>

          <Beam
            start={{
              x: inputRects[0].x + inputCardSize.width / 2,
              y: inputRects[0].y,
            }}
            end={{
              x: mkHostOrbCenter.x - mkHostOrbSize / 2,
              y: mkHostOrbCenter.y - mkHostOrbSize * 0.18,
            }}
            progress={systemInputFlow * pipelinePresence}
            accent={NIX_ORANGE}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={pipelinePresence}
          />
          <Beam
            start={{
              x: inputRects[1].x + inputCardSize.width / 2,
              y: inputRects[1].y,
            }}
            end={{
              x: mkHostOrbCenter.x - mkHostOrbSize / 2,
              y: mkHostOrbCenter.y,
            }}
            progress={homeFileFlow * pipelinePresence}
            accent={NEUTRAL_BLUE}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={pipelinePresence}
          />
          <Beam
            start={{
              x: inputRects[2].x + inputCardSize.width / 2,
              y: inputRects[2].y,
            }}
            end={{
              x: mkHostOrbCenter.x - mkHostOrbSize / 2,
              y: mkHostOrbCenter.y + mkHostOrbSize * 0.18,
            }}
            progress={userFlow * pipelinePresence}
            accent={NEOVIM_GREEN}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={pipelinePresence}
          />
          <Beam
            start={{
              x: mkHostOrbCenter.x + mkHostOrbSize / 2,
              y: mkHostOrbCenter.y,
            }}
            end={resultLeftAnchor}
            progress={mkHostFlow * pipelinePresence}
            accent={HOT_PINK}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={pipelinePresence}
          />

          <div style={{ opacity: reasonsPresence }}>
            <ReasonPanel
              rect={reasonsLeftRect}
              reveal={leftReasonReveal * reasonsPresence}
              accent={NIX_ORANGE}
              title="system"
              value="./hosts/${hostName}"
              icon={<GearIcon color={NIX_ORANGE} />}
            />
            <OrbNode
              center={reasonsHubCenter}
              size={reasonsHubSize}
              reveal={reasonHubReveal * reasonsPresence}
              label="nixosSystem"
              accent={HOT_PINK}
              zIndex={9}
            />
            <ReasonPanel
              rect={reasonsRightRect}
              reveal={rightReasonReveal * reasonsPresence}
              accent={NEUTRAL_BLUE}
              title="home manager"
              value={'users."${hmUser}"\n= import homeHost;'}
              icon={<HomeIcon color={NEUTRAL_BLUE} />}
              secondary={
                <div
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `${NEOVIM_GREEN}10`,
                    border: `1px solid ${NEOVIM_GREEN}34`,
                  }}
                >
                  <UserIcon color={NEOVIM_GREEN} />
                </div>
              }
            />
          </div>

          <Beam
            start={{
              x: reasonsHubCenter.x - reasonsHubSize / 2,
              y: reasonsHubCenter.y,
            }}
            end={{
              x: reasonsLeftRect.x + reasonsLeftRect.width / 2,
              y: reasonsLeftRect.y,
            }}
            progress={systemReasonFlow * reasonsPresence}
            accent={NIX_ORANGE}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={reasonsPresence}
          />
          <Beam
            start={{
              x: reasonsHubCenter.x + reasonsHubSize / 2,
              y: reasonsHubCenter.y,
            }}
            end={{
              x: reasonsRightRect.x - reasonsRightRect.width / 2,
              y: reasonsRightRect.y,
            }}
            progress={homeReasonFlow * reasonsPresence}
            accent={NEUTRAL_BLUE}
            thickness={beamSize}
            pulseSize={pulseSize}
            opacity={reasonsPresence}
          />

          <div style={{ opacity: outputsPresence }}>
            <CodePanel
              rect={outputsCodeRect}
              reveal={outputsReveal}
              title="nixosConfigurations"
              label="flake outputs"
              lines={OUTPUT_LINES}
              activeIds={outputActiveIds}
              titleAccent={HOT_PINK}
              codeSize={scaleValue(44)}
              lineNoSize={scaleValue(26)}
              zIndex={7}
              tilt={0}
              videoSrc={outputsClip}
              titleScale={1.38}
              bodyTopRatio={0.29}
              rowGapRatio={0.106}
            />

            {[
              {
                id: "pc",
                accent: NIX_ORANGE,
                x: stage.width * 0.82,
                y: stage.height * 0.23,
                delay: 980,
              },
              {
                id: "l",
                accent: NEUTRAL_BLUE,
                x: stage.width * 0.82,
                y: stage.height * 0.52,
                delay: 1018,
              },
              {
                id: "work",
                accent: NEOVIM_GREEN,
                x: stage.width * 0.82,
                y: stage.height * 0.81,
                delay: 1056,
              },
            ].map((host) => (
              <HostCard
                key={host.id}
                rect={{
                  x: host.x,
                  y: host.y,
                  width: outputHostRectSize.width,
                  height: outputHostRectSize.height,
                }}
                reveal={
                  spring({
                    fps,
                    frame: frame - host.delay,
                    config: { damping: 18, stiffness: 126, mass: 0.96 },
                  }) * outputsPresence
                }
                id={host.id}
                accent={host.accent}
              />
            ))}
          </div>
        </div>

        <SceneProgressBar colors={["#ff5da2", "#8affcf"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
