import type { ReactNode } from "react";
import {
  AbsoluteFill,
  getStaticFiles,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  type StaticFile,
} from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { GlassCard } from "../../components/GlassCard";
import { SceneProgressBar } from "../../components/SceneProgressBar";

export const CURRENT_SETUP_SCENE_5_DURATION = 1080; // Scene 5, 36.00 seconds @ 30fps

const BASE_WIDTH = 3440;
const FOOTAGE_EXTENSIONS = ["mp4", "mov", "webm"] as const;

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

type LineKind = "scaffold" | "shared" | "feature" | "hardware" | "hostname";

type HostLine = {
  text: string;
  kind: LineKind;
};

type HostConfig = {
  id: "pc" | "l" | "work";
  accent: string;
  fileLabel: string;
  lines: HostLine[];
  videoLabel: "pc" | "l" | "work";
};

type HighlightStrengths = {
  shared?: number;
  feature?: number;
  hardware?: number;
  hostname?: number;
  all?: number;
};

const HOSTS: HostConfig[] = [
  {
    id: "pc",
    accent: NIX_ORANGE,
    fileLabel: "hosts/pc/default.nix",
    videoLabel: "pc",
    lines: [
      { text: "{ ... }:", kind: "scaffold" },
      { text: "{", kind: "scaffold" },
      { text: "  imports = [", kind: "scaffold" },
      { text: "    ../common/base.nix", kind: "shared" },
      { text: "    ../features/hardware-amd.nix", kind: "feature" },
      { text: "    ../features/peripheral-quirks.nix", kind: "feature" },
      { text: "    ../features/pc-mass-storage.nix", kind: "feature" },
      { text: "    ../features/media-tools.nix", kind: "feature" },
      { text: "    ../features/flatpak.nix", kind: "feature" },
      { text: "    ../features/gaming.nix", kind: "feature" },
      { text: "    ./hardware-configuration.nix", kind: "hardware" },
      { text: "  ];", kind: "scaffold" },
      { text: '  networking.hostName = "pc";', kind: "hostname" },
      { text: "}", kind: "scaffold" },
    ],
  },
  {
    id: "l",
    accent: NEUTRAL_BLUE,
    fileLabel: "hosts/l/default.nix",
    videoLabel: "l",
    lines: [
      { text: "{ ... }:", kind: "scaffold" },
      { text: "{", kind: "scaffold" },
      { text: "  imports = [", kind: "scaffold" },
      { text: "    ../common/base.nix", kind: "shared" },
      { text: "    ../features/hardware-amd.nix", kind: "feature" },
      { text: "    ../features/flatpak.nix", kind: "feature" },
      { text: "    ./hardware-configuration.nix", kind: "hardware" },
      { text: "  ];", kind: "scaffold" },
      { text: '  networking.hostName = "l";', kind: "hostname" },
      { text: "}", kind: "scaffold" },
    ],
  },
  {
    id: "work",
    accent: NEOVIM_GREEN,
    fileLabel: "hosts/work/default.nix",
    videoLabel: "work",
    lines: [
      { text: "{ lib, pkgs, ... }:", kind: "scaffold" },
      { text: "{", kind: "scaffold" },
      { text: "  imports = [", kind: "scaffold" },
      { text: "    ../common/base.nix", kind: "shared" },
      { text: "    ../../audiofix.nix", kind: "feature" },
      { text: "    ../features/hardware-intel.nix", kind: "feature" },
      { text: "    ../features/work/appimage.nix", kind: "feature" },
      { text: "    ../features/work/caddy.nix", kind: "feature" },
      { text: "    ../features/work/cx.nix", kind: "feature" },
      { text: "    ../features/work/db.nix", kind: "feature" },
      { text: "    ../features/work/displaylink.nix", kind: "feature" },
      { text: "    ./hardware-configuration.nix", kind: "hardware" },
      { text: "  ];", kind: "scaffold" },
      { text: '  networking.hostName = "work";', kind: "hostname" },
      { text: "}", kind: "scaffold" },
    ],
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

const findFootageSrc = (
  files: StaticFile[],
  label: HostConfig["videoLabel"],
) => {
  for (const extension of FOOTAGE_EXTENSIONS) {
    const match = files.find(
      (file) => file.name === `current-setup/${label}.${extension}`,
    );

    if (match) {
      return match.src;
    }
  }

  return null;
};

const findSnippetFrameSrcs = (
  files: StaticFile[],
  label: HostConfig["videoLabel"],
) =>
  files
    .filter((file) => file.name.startsWith(`current-setup/scene-5/${label}-`))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map((file) => file.src);

const Dots = () => (
  <div style={{ display: "flex", gap: 12 }}>
    {["#ff5da2", "#ffbdde", "#8afff7"].map((color) => (
      <span
        key={color}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 14px ${color}55`,
        }}
      />
    ))}
  </div>
);

const FolderIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 140 120" style={{ width: "74%", height: "74%" }}>
    <path
      d="M18 34 H56 L68 46 H122 V98 H18 Z"
      fill={`${color}18`}
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path
      d="M18 48 H122"
      stroke={color}
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
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
          background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.92))`,
          boxShadow: `0 0 22px ${accent}, 0 0 36px ${accent}26`,
          opacity: clamp01(progress * 1.08) * opacity,
          zIndex: 8,
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
          boxShadow: `0 0 28px ${accent}, 0 0 42px ${accent}55`,
          opacity,
          zIndex: 9,
        }}
      />
    </>
  );
};

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
        transform: `translate(-50%, -50%) translateY(${mix(72, 0, reveal)}px) rotate(${mix(
          tilt - 1.3,
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
        top: "7.2%",
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

const GhostFlakePanel = ({ rect, reveal }: { rect: Rect; reveal: number }) => (
  <SceneCard rect={rect} reveal={reveal} tilt={-0.8} zIndex={1}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 46,
        background:
          "linear-gradient(145deg, rgba(20,8,48,0.38), rgba(22,10,48,0.18))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 0 transparent",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "52px 58px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: 0.48,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Dots />
          <div
            style={{
              fontSize: 34,
              lineHeight: 0.9,
              color: MUTED_TEXT,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            flake.nix
          </div>
        </div>
        <div
          style={{
            fontSize: 132,
            lineHeight: 0.84,
            fontWeight: 800,
            color: SOFT_WHITE,
            textShadow: "0 0 30px rgba(255,93,162,0.16)",
          }}
        >
          one huge file
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 44,
            color: MUTED_TEXT,
          }}
        >
          <div>inputs.nixpkgs = ...</div>
          <div>inputs.home-manager = ...</div>
          <div>mkHost = &#123; hostName, ... &#125;: ...</div>
          <div>nixosConfigurations.pc = ...</div>
          <div>nixosConfigurations.work = ...</div>
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const getLineAccent = (host: HostConfig, kind: LineKind) => {
  switch (kind) {
    case "shared":
      return HOT_PINK;
    case "feature":
      return host.accent;
    case "hardware":
      return SOLAR_GOLD;
    case "hostname":
      return host.accent;
    default:
      return SOFT_WHITE;
  }
};

const getHighlightStrength = (
  kind: LineKind,
  highlights: HighlightStrengths,
) => {
  switch (kind) {
    case "shared":
      return highlights.shared ?? 0;
    case "feature":
      return highlights.feature ?? 0;
    case "hardware":
      return highlights.hardware ?? 0;
    case "hostname":
      return highlights.hostname ?? 0;
    default:
      return 0;
  }
};

const TerminalHostCard = ({
  host,
  rect,
  reveal,
  zIndex,
  headerSize,
  codeSize,
  highlights,
  subtitle,
  showSubtitle = true,
}: {
  host: HostConfig;
  rect: Rect;
  reveal: number;
  zIndex: number;
  headerSize: number;
  codeSize: number;
  highlights: HighlightStrengths;
  subtitle?: string;
  showSubtitle?: boolean;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={0} zIndex={zIndex}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 40,
        background: `linear-gradient(145deg, rgba(8,6,28,0.96), rgba(24,10,54,0.9)), radial-gradient(circle at 18% 12%, ${host.accent}18, transparent 28%)`,
        border: `1px solid ${host.accent}26`,
        boxShadow: `0 30px 100px rgba(4,0,24,0.72), 0 0 26px ${host.accent}10`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: `${rect.height * 0.05}px ${rect.width * 0.05}px`,
          display: "flex",
          flexDirection: "column",
          gap: rect.height * 0.028,
          overflow: "hidden",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 10%, rgba(255,93,162,0.12), transparent 24%), radial-gradient(circle at 84% 14%, rgba(127,232,255,0.12), transparent 22%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: headerSize * 1.16,
          }}
        >
          <Dots />
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: headerSize,
              lineHeight: 0.86,
              fontWeight: 800,
              color: SOFT_WHITE,
              textTransform: host.id === "work" ? "lowercase" : "lowercase",
              textShadow: `0 0 22px ${host.accent}24`,
            }}
          >
            {host.id}
          </div>
          <div
            style={{
              width: headerSize,
              height: headerSize,
              borderRadius: headerSize * 0.28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${host.accent}10`,
              border: `1px solid ${host.accent}28`,
            }}
          >
            <FolderIcon color={host.accent} />
          </div>
        </div>

        {showSubtitle ? (
          <div
            style={{
              position: "relative",
              fontSize: codeSize * 0.74,
              lineHeight: 0.9,
              color: MUTED_TEXT,
              textAlign: "center",
              letterSpacing: 1.8,
              textTransform: "uppercase",
            }}
          >
            {subtitle ?? host.fileLabel}
          </div>
        ) : null}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: rect.height * 0.011,
            paddingTop: rect.height * 0.014,
          }}
        >
          {host.lines.map((line) => {
            const strength = Math.max(
              highlights.all ?? 0,
              getHighlightStrength(line.kind, highlights),
            );
            const accent = getLineAccent(host, line.kind);
            const active = strength > 0.04;

            const baseColor =
              line.kind === "scaffold"
                ? "rgba(247,244,255,0.82)"
                : line.kind === "hardware"
                  ? "rgba(255,216,108,0.9)"
                  : line.kind === "shared"
                    ? "rgba(247,244,255,0.94)"
                    : "rgba(247,244,255,0.9)";

            return (
              <div
                key={`${host.id}-${line.text}`}
                style={{
                  minHeight: codeSize * 1.34,
                  padding: `${codeSize * 0.18}px ${codeSize * 0.3}px`,
                  borderRadius: codeSize * 0.32,
                  background: active
                    ? `linear-gradient(90deg, ${accent}1f, rgba(255,255,255,0.02))`
                    : "transparent",
                  border: active
                    ? `1px solid ${accent}${strength > 0.45 ? "44" : "2a"}`
                    : "1px solid transparent",
                  boxShadow: active ? `0 0 20px ${accent}18` : "none",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: codeSize,
                  lineHeight: 1.14,
                  letterSpacing: -0.6,
                  whiteSpace: "pre",
                  color: active ? accent : baseColor,
                  fontWeight:
                    line.kind === "shared" ||
                    line.kind === "feature" ||
                    line.kind === "hardware" ||
                    line.kind === "hostname"
                      ? 700
                      : 600,
                  opacity: line.kind === "scaffold" ? 0.82 : 1,
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const DeviceVideoCard = ({
  rect,
  reveal,
  accent,
  srcs,
  frame,
  durationInFrames,
}: {
  rect: Rect;
  reveal: number;
  accent: string;
  srcs: string[];
  frame: number;
  durationInFrames: number;
}) => {
  const framesPerStill =
    srcs.length > 0
      ? Math.max(1, Math.floor(durationInFrames / srcs.length))
      : 1;
  const imageIndex =
    srcs.length > 0
      ? Math.min(srcs.length - 1, Math.floor(frame / framesPerStill))
      : -1;
  const activeSrc = imageIndex >= 0 ? srcs[imageIndex] : null;

  return (
    <SceneCard rect={rect} reveal={reveal} tilt={1.2} zIndex={10}>
      <GlassCard
        style={{
          height: "100%",
          padding: 0,
          borderRadius: 44,
          background: `linear-gradient(145deg, ${accent}10, rgba(10,8,28,0.96))`,
          border: `1px solid ${accent}34`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: 40,
          }}
        >
          {activeSrc ? (
            <img
              src={activeSrc}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `radial-gradient(circle at 30% 26%, ${accent}22, transparent 36%), linear-gradient(145deg, rgba(18,12,40,0.92), rgba(10,8,26,0.96))`,
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 26%, rgba(0,0,0,0.26) 100%)",
            }}
          />
        </div>
      </GlassCard>
    </SceneCard>
  );
};

const HostSpotlight = ({
  host,
  snippetSrcs,
  stageWidth,
  stageHeight,
  beamThickness,
  pulseSize,
  durationInFrames,
}: {
  host: HostConfig;
  snippetSrcs: string[];
  stageWidth: number;
  stageHeight: number;
  beamThickness: number;
  pulseSize: number;
  durationInFrames: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 124, mass: 0.96 },
  });

  const beamProgress = progressBetween(frame, 12, 46);

  const codeRect: Rect = {
    x: stageWidth * 0.34,
    y: stageHeight * 0.57,
    width: stageWidth * 0.53,
    height: stageHeight * 0.84,
  };

  const videoRect: Rect = {
    x: stageWidth * 0.82,
    y: stageHeight * 0.57,
    width: stageWidth * 0.28,
    height: stageHeight * 0.72,
  };

  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 68% 34%, ${host.accent}16, transparent 26%)`,
          opacity: 0.92,
        }}
      />

      <TerminalHostCard
        host={host}
        rect={codeRect}
        reveal={reveal}
        zIndex={9}
        headerSize={92}
        codeSize={host.id === "work" ? 32 : 36}
        highlights={{
          feature: 0.8,
          hardware: 1,
          hostname: 0.8,
          shared: 0.44,
        }}
        subtitle="composition point"
      />

      <DeviceVideoCard
        rect={videoRect}
        reveal={reveal}
        accent={host.accent}
        srcs={snippetSrcs}
        frame={frame}
        durationInFrames={durationInFrames}
      />

      <Beam
        start={{
          x: codeRect.x + codeRect.width / 2,
          y: codeRect.y,
        }}
        end={{
          x: videoRect.x - videoRect.width / 2,
          y: videoRect.y,
        }}
        progress={beamProgress * reveal}
        accent={host.accent}
        thickness={beamThickness}
        pulseSize={pulseSize}
      />
    </>
  );
};

export const CurrentSetupScene5 = () => {
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

  const ghostReveal = presenceBetween(frame, 0, 28, 120, 180);
  const overviewPresence = presenceBetween(frame, 110, 160, 760, 840);

  const sharedStrength = presenceBetween(frame, 220, 260, 330, 390);
  const featureStrength = presenceBetween(frame, 340, 380, 470, 530);
  const hardwareStrength = presenceBetween(frame, 470, 510, 610, 670);
  const compositionStrength = presenceBetween(frame, 620, 660, 760, 820);
  const spotlightPresence = progressBetween(frame, 780, 840);

  const hostRevealStarts = [92, 122, 152];

  const hostRects = [
    {
      x: stage.width * 0.165,
      y: stage.height * 0.615,
      width: stage.width * 0.305,
      height: stage.height * 0.79,
    },
    {
      x: stage.width * 0.5,
      y: stage.height * 0.615,
      width: stage.width * 0.305,
      height: stage.height * 0.79,
    },
    {
      x: stage.width * 0.835,
      y: stage.height * 0.615,
      width: stage.width * 0.305,
      height: stage.height * 0.79,
    },
  ];

  const ghostRect: Rect = {
    x: stage.width * 0.5,
    y: stage.height * 0.565,
    width: stage.width * 0.82,
    height: stage.height * 0.88,
  };

  const spotlightOpacity = progressBetween(frame, 780, 840);
  const stageFloat = Math.sin(frame / 42) * scaleValue(8);
  const beamThickness = scaleValue(9);
  const pulseSize = scaleValue(28);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,93,162,0.16), transparent 28%), radial-gradient(circle at 82% 24%, rgba(127,232,255,0.14), transparent 26%), radial-gradient(circle at 58% 78%, rgba(255,216,108,0.1), transparent 28%)",
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
            text="smaller files"
            color={SOFT_WHITE}
            opacity={presenceBetween(frame, 70, 110, 160, 220)}
          />
          <OverlayTitle
            text="inherits"
            color={HOT_PINK}
            opacity={presenceBetween(frame, 230, 260, 320, 370)}
          />
          <OverlayTitle
            text="adds"
            color={NEUTRAL_BLUE}
            opacity={presenceBetween(frame, 350, 380, 450, 500)}
          />
          <OverlayTitle
            text="hardware"
            color={SOLAR_GOLD}
            opacity={presenceBetween(frame, 490, 520, 590, 640)}
          />
          <OverlayTitle
            text="composition points"
            color={SOFT_WHITE}
            opacity={presenceBetween(frame, 640, 680, 760, 820)}
          />
          <OverlayTitle
            text="made of modules"
            color={SOFT_WHITE}
            opacity={presenceBetween(frame, 800, 840, 1020, 1070)}
          />

          <div style={{ opacity: ghostReveal }}>
            <GhostFlakePanel rect={ghostRect} reveal={ghostReveal} />
          </div>

          <div
            style={{
              opacity: overviewPresence * (1 - spotlightPresence * 0.96),
            }}
          >
            {HOSTS.map((host, index) => {
              const cardReveal =
                spring({
                  fps,
                  frame: frame - hostRevealStarts[index]!,
                  config: { damping: 18, stiffness: 124, mass: 0.96 },
                }) *
                overviewPresence *
                (1 - spotlightPresence * 0.78);

              return (
                <TerminalHostCard
                  key={host.id}
                  host={host}
                  rect={hostRects[index]!}
                  reveal={cardReveal}
                  zIndex={6 + index}
                  headerSize={scaleValue(62)}
                  codeSize={scaleValue(
                    host.id === "work" ? 25 : host.id === "pc" ? 27 : 29,
                  )}
                  highlights={{
                    shared: sharedStrength + compositionStrength * 0.55,
                    feature: featureStrength + compositionStrength * 0.8,
                    hardware: hardwareStrength + compositionStrength,
                    hostname: compositionStrength * 0.72,
                  }}
                />
              );
            })}
          </div>

          <div style={{ opacity: spotlightOpacity }}>
            <Sequence from={780} durationInFrames={90}>
              <HostSpotlight
                host={HOSTS[0]}
                snippetSrcs={findSnippetFrameSrcs(
                  staticFiles,
                  HOSTS[0].videoLabel,
                )}
                stageWidth={stage.width}
                stageHeight={stage.height}
                beamThickness={beamThickness}
                pulseSize={pulseSize}
                durationInFrames={90}
              />
            </Sequence>
            <Sequence from={870} durationInFrames={90}>
              <HostSpotlight
                host={HOSTS[1]}
                snippetSrcs={findSnippetFrameSrcs(
                  staticFiles,
                  HOSTS[1].videoLabel,
                )}
                stageWidth={stage.width}
                stageHeight={stage.height}
                beamThickness={beamThickness}
                pulseSize={pulseSize}
                durationInFrames={90}
              />
            </Sequence>
            <Sequence from={960} durationInFrames={120}>
              <HostSpotlight
                host={HOSTS[2]}
                snippetSrcs={findSnippetFrameSrcs(
                  staticFiles,
                  HOSTS[2].videoLabel,
                )}
                stageWidth={stage.width}
                stageHeight={stage.height}
                beamThickness={beamThickness}
                pulseSize={pulseSize}
                durationInFrames={120}
              />
            </Sequence>
          </div>
        </div>

        <SceneProgressBar colors={["#ff5da2", "#8affcf"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
