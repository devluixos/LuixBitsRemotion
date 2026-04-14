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

export const CURRENT_SETUP_SCENE_7_DURATION = 1170; // Scene 7, 39.00 seconds @ 30fps

const BASE_WIDTH = 3440;

const HOT_PINK = "#ff5da2";
const NIX_ORANGE = "#ff9f4a";
const NEUTRAL_BLUE = "#7fe8ff";
const NEOVIM_GREEN = "#8affcf";
const SOLAR_GOLD = "#ffd86c";
const SOFT_WHITE = "#f7f4ff";
const MUTED_TEXT = "rgba(247,244,255,0.66)";

type HostId = "pc" | "l" | "work";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DirectoryRow = {
  id: string;
  label: string;
  kind: "folder" | "file";
  accent: string;
  indent: number;
};

type ModuleConfig = {
  id: string;
  rowId: string;
  label: string;
  fileLabel: string;
  host: HostId;
  accent: string;
  targetOffset: { x: number; y: number };
  startFrame: number;
};

const DIRECTORY_ROWS: DirectoryRow[] = [
  {
    id: "hardware-amd",
    label: "hardware-amd.nix",
    kind: "file",
    accent: NIX_ORANGE,
    indent: 0,
  },
  {
    id: "hardware-intel",
    label: "hardware-intel.nix",
    kind: "file",
    accent: HOT_PINK,
    indent: 0,
  },
  {
    id: "media-tools",
    label: "media-tools.nix",
    kind: "file",
    accent: SOLAR_GOLD,
    indent: 0,
  },
  {
    id: "gaming",
    label: "gaming.nix",
    kind: "file",
    accent: NEOVIM_GREEN,
    indent: 0,
  },
  {
    id: "pc-mass-storage",
    label: "pc-mass-storage.nix",
    kind: "file",
    accent: NEUTRAL_BLUE,
    indent: 0,
  },
  {
    id: "peripheral-quirks",
    label: "peripheral-quirks.nix",
    kind: "file",
    accent: HOT_PINK,
    indent: 0,
  },
  {
    id: "flatpak",
    label: "flatpak.nix",
    kind: "file",
    accent: NEUTRAL_BLUE,
    indent: 0,
  },
  {
    id: "work-folder",
    label: "work/",
    kind: "folder",
    accent: NEOVIM_GREEN,
    indent: 0,
  },
  {
    id: "appimage",
    label: "appimage.nix",
    kind: "file",
    accent: SOLAR_GOLD,
    indent: 1,
  },
  {
    id: "displaylink",
    label: "displaylink.nix",
    kind: "file",
    accent: HOT_PINK,
    indent: 1,
  },
  {
    id: "cx",
    label: "cx.nix",
    kind: "file",
    accent: NEOVIM_GREEN,
    indent: 1,
  },
  {
    id: "db",
    label: "db.nix",
    kind: "file",
    accent: NEUTRAL_BLUE,
    indent: 1,
  },
  {
    id: "caddy",
    label: "caddy.nix",
    kind: "file",
    accent: NIX_ORANGE,
    indent: 1,
  },
];

const MODULES: ModuleConfig[] = [
  {
    id: "pc-amd",
    rowId: "hardware-amd",
    label: "amd",
    fileLabel: "hardware-amd",
    host: "pc",
    accent: NIX_ORANGE,
    targetOffset: { x: -250, y: -150 },
    startFrame: 306,
  },
  {
    id: "pc-media",
    rowId: "media-tools",
    label: "media",
    fileLabel: "media-tools",
    host: "pc",
    accent: SOLAR_GOLD,
    targetOffset: { x: 0, y: -228 },
    startFrame: 324,
  },
  {
    id: "pc-gaming",
    rowId: "gaming",
    label: "gaming",
    fileLabel: "gaming",
    host: "pc",
    accent: NEOVIM_GREEN,
    targetOffset: { x: 258, y: -136 },
    startFrame: 342,
  },
  {
    id: "pc-storage",
    rowId: "pc-mass-storage",
    label: "storage",
    fileLabel: "pc-mass-storage",
    host: "pc",
    accent: NEUTRAL_BLUE,
    targetOffset: { x: 212, y: 158 },
    startFrame: 360,
  },
  {
    id: "pc-quirks",
    rowId: "peripheral-quirks",
    label: "quirks",
    fileLabel: "peripheral-quirks",
    host: "pc",
    accent: HOT_PINK,
    targetOffset: { x: -10, y: 224 },
    startFrame: 378,
  },
  {
    id: "l-amd",
    rowId: "hardware-amd",
    label: "amd",
    fileLabel: "hardware-amd",
    host: "l",
    accent: NIX_ORANGE,
    targetOffset: { x: -188, y: -150 },
    startFrame: 450,
  },
  {
    id: "l-flatpak",
    rowId: "flatpak",
    label: "flatpak",
    fileLabel: "flatpak",
    host: "l",
    accent: NEUTRAL_BLUE,
    targetOffset: { x: 188, y: -150 },
    startFrame: 478,
  },
  {
    id: "work-intel",
    rowId: "hardware-intel",
    label: "intel + nvidia",
    fileLabel: "hardware-intel",
    host: "work",
    accent: HOT_PINK,
    targetOffset: { x: -292, y: -172 },
    startFrame: 536,
  },
  {
    id: "work-displaylink",
    rowId: "displaylink",
    label: "displaylink",
    fileLabel: "displaylink",
    host: "work",
    accent: HOT_PINK,
    targetOffset: { x: 0, y: -228 },
    startFrame: 554,
  },
  {
    id: "work-appimage",
    rowId: "appimage",
    label: "appimage",
    fileLabel: "appimage",
    host: "work",
    accent: SOLAR_GOLD,
    targetOffset: { x: 292, y: -172 },
    startFrame: 572,
  },
  {
    id: "work-local-dev",
    rowId: "cx",
    label: "local dev",
    fileLabel: "cx",
    host: "work",
    accent: NEOVIM_GREEN,
    targetOffset: { x: 332, y: 8 },
    startFrame: 590,
  },
  {
    id: "work-db",
    rowId: "db",
    label: "db",
    fileLabel: "db",
    host: "work",
    accent: NEUTRAL_BLUE,
    targetOffset: { x: 132, y: 220 },
    startFrame: 608,
  },
  {
    id: "work-caddy",
    rowId: "caddy",
    label: "caddy",
    fileLabel: "caddy",
    host: "work",
    accent: NIX_ORANGE,
    targetOffset: { x: -158, y: 220 },
    startFrame: 626,
  },
];

const COMPARE_STACK = [
  { label: "displaylink", accent: HOT_PINK },
  { label: "appimage", accent: SOLAR_GOLD },
  { label: "local dev", accent: NEOVIM_GREEN },
  { label: "db", accent: NEUTRAL_BLUE },
  { label: "caddy", accent: NIX_ORANGE },
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
        transform: `translate(-50%, -50%) translateY(${mix(56, 0, reveal)}px) rotate(${mix(
          tilt - 1.1,
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
        fontSize: 86,
        lineHeight: 0.9,
        fontWeight: 800,
        color,
        letterSpacing: 1,
        textShadow: `0 0 26px ${color}30`,
        zIndex: 40,
      }}
    >
      {text}
    </div>
  );
};

const FolderIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
    <path
      d="M8 18h18l6 7h24v21c0 4.4-3.6 8-8 8H16c-4.4 0-8-3.6-8-8V18Z"
      fill={`${color}18`}
      stroke={color}
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <path d="M8 24h48" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const FileIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
    <path
      d="M18 8h22l10 10v30c0 4.4-3.6 8-8 8H18c-4.4 0-8-3.6-8-8V16c0-4.4 3.6-8 8-8Z"
      fill={`${color}16`}
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
      d="M20 30h20M20 40h20"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const DirectoryPanel = ({
  rect,
  reveal,
  rows,
  rowHeight,
  scrollY,
}: {
  rect: Rect;
  reveal: number;
  rows: DirectoryRow[];
  rowHeight: number;
  scrollY: number;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={-0.35} zIndex={6}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 44,
        background:
          "linear-gradient(145deg, rgba(8,6,28,0.97), rgba(21,10,48,0.94))",
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 14%, rgba(255,93,162,0.13), transparent 24%), radial-gradient(circle at 84% 18%, rgba(127,232,255,0.12), transparent 22%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: rect.width * 0.04,
            right: rect.width * 0.04,
            top: rect.height * 0.06,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Dots />
          <div
            style={{
              fontSize: rowHeight * 0.52,
              lineHeight: 0.9,
              color: MUTED_TEXT,
              letterSpacing: 2.4,
              textTransform: "uppercase",
            }}
          >
            hosts/features
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: rect.width * 0.045,
            top: rect.height * 0.16,
            display: "flex",
            alignItems: "center",
            gap: rect.width * 0.012,
          }}
        >
          <div
            style={{
              width: rowHeight * 0.84,
              height: rowHeight * 0.84,
              borderRadius: rowHeight * 0.22,
              background: `${NEOVIM_GREEN}14`,
              border: `1px solid ${NEOVIM_GREEN}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FolderIcon color={NEOVIM_GREEN} />
          </div>
          <div
            style={{
              fontSize: rowHeight * 0.78,
              lineHeight: 0.84,
              fontWeight: 800,
              color: SOFT_WHITE,
              textShadow: `0 12px 26px ${NEOVIM_GREEN}1f`,
            }}
          >
            features/
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: rect.width * 0.045,
            right: rect.width * 0.045,
            top: rect.height * 0.31,
            bottom: rect.height * 0.08,
            overflow: "hidden",
          }}
        >
          <div style={{ transform: `translateY(${-scrollY}px)` }}>
            {rows.map((row, index) => {
              const iconSize = rowHeight * 0.64;
              return (
                <div
                  key={row.id}
                  style={{
                    position: "relative",
                    minHeight: rowHeight,
                    marginBottom: rowHeight * 0.12,
                    borderRadius: rowHeight * 0.24,
                    padding: `${rowHeight * 0.18}px ${rowHeight * 0.26}px`,
                    background:
                      row.kind === "folder"
                        ? `linear-gradient(90deg, ${row.accent}1a, rgba(255,255,255,0.03))`
                        : "rgba(255,255,255,0.015)",
                    border: `1px solid ${
                      row.kind === "folder"
                        ? `${row.accent}35`
                        : "rgba(255,255,255,0.06)"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    gap: rowHeight * 0.22,
                    paddingLeft: rowHeight * (1.24 + row.indent * 0.82),
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: rowHeight * (0.24 + row.indent * 0.82),
                      width: iconSize,
                      height: iconSize,
                    }}
                  >
                    {row.kind === "folder" ? (
                      <FolderIcon color={row.accent} />
                    ) : (
                      <FileIcon color={row.accent} />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: rowHeight * 0.6,
                      lineHeight: 0.92,
                      fontWeight: row.kind === "folder" ? 800 : 700,
                      color: row.kind === "folder" ? row.accent : SOFT_WHITE,
                      letterSpacing: row.kind === "folder" ? 0.4 : 0,
                    }}
                  >
                    {row.label}
                  </div>
                  {index === 7 ? (
                    <div
                      style={{
                        marginLeft: "auto",
                        fontSize: rowHeight * 0.42,
                        lineHeight: 0.9,
                        color: MUTED_TEXT,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      work
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  </SceneCard>
);

const OrbitGuide = ({
  center,
  width,
  height,
  accent,
  opacity,
}: {
  center: { x: number; y: number };
  width: number;
  height: number;
  accent: string;
  opacity: number;
}) => {
  if (opacity <= 0.01) {
    return null;
  }

  return (
    <svg
      style={{
        position: "absolute",
        left: center.x - width / 2,
        top: center.y - height / 2,
        width,
        height,
        overflow: "visible",
        opacity,
        zIndex: 5,
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2 - 8}
        ry={height / 2 - 8}
        fill="none"
        stroke={`${accent}58`}
        strokeWidth="4"
        strokeDasharray="18 14"
      />
    </svg>
  );
};

const HostNode = ({
  rect,
  reveal,
  label,
  accent,
  hot,
}: {
  rect: Rect;
  reveal: number;
  label: string;
  accent: string;
  hot: number;
}) => {
  const labelFontSize = label.length >= 6 ? 78 : label.length >= 4 ? 88 : 104;

  return (
    <SceneCard rect={rect} reveal={reveal} tilt={0} zIndex={12}>
      <GlassCard
        style={{
          height: "100%",
          padding: 0,
          borderRadius: 42,
          background:
            "linear-gradient(145deg, rgba(8,6,28,0.97), rgba(21,10,48,0.94))",
          boxShadow: `0 32px 90px rgba(4,0,24,0.7), 0 0 ${mix(
            18,
            56,
            hot,
          )}px ${accent}22`,
          border: `1px solid ${accent}${hot > 0.4 ? "50" : "26"}`,
          transform: `scale(${mix(1, 1.05, hot)})`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 50% 20%, ${accent}18, transparent 45%)`,
            }}
          />
          <div
            style={{
              position: "relative",
              fontSize: 30,
              lineHeight: 0.9,
              color: MUTED_TEXT,
              letterSpacing: 2.4,
              textTransform: "uppercase",
            }}
          >
            host
          </div>
          <div
            style={{
              position: "relative",
              fontSize: labelFontSize,
              lineHeight: 0.84,
              fontWeight: 800,
              color: SOFT_WHITE,
              textShadow: `0 0 28px ${accent}28`,
            }}
          >
            {label}
          </div>
        </div>
      </GlassCard>
    </SceneCard>
  );
};

const Beam = ({
  start,
  end,
  progress,
  accent,
  thickness,
  opacity = 1,
}: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  progress: number;
  accent: string;
  thickness: number;
  opacity?: number;
}) => {
  if (progress <= 0.01 || opacity <= 0.01) {
    return null;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
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
        boxShadow: `0 0 22px ${accent}, 0 0 34px ${accent}24`,
        opacity,
        zIndex: 7,
      }}
    />
  );
};

const ModuleChip = ({
  x,
  y,
  label,
  accent,
  reveal,
  width,
  fontSize,
  zIndex,
}: {
  x: number;
  y: number;
  label: string;
  accent: string;
  reveal: number;
  width: number;
  fontSize: number;
  zIndex: number;
}) => {
  if (reveal <= 0.01) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height: fontSize * 2.46,
        transform: `translate(-50%, -50%) translateY(${mix(22, 0, reveal)}px) scale(${mix(
          0.92,
          1,
          reveal,
        )})`,
        opacity: clamp01(reveal * 1.08),
        zIndex,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 28,
          background: `linear-gradient(145deg, ${accent}14, rgba(14,10,34,0.95))`,
          border: `1px solid ${accent}36`,
          boxShadow: `0 0 22px ${accent}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 22px",
        }}
      >
        <div
          style={{
            fontSize,
            lineHeight: 0.92,
            fontWeight: 800,
            color: SOFT_WHITE,
            textShadow: `0 0 18px ${accent}20`,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

const ModuleStackCard = ({
  rect,
  reveal,
  chipHeight,
}: {
  rect: Rect;
  reveal: number;
  chipHeight: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneCard rect={rect} reveal={reveal} tilt={-0.45} zIndex={20}>
      <GlassCard
        style={{
          height: "100%",
          padding: "34px 34px",
          borderRadius: 42,
          background:
            "linear-gradient(145deg, rgba(8,6,28,0.98), rgba(22,10,50,0.96))",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 30,
              lineHeight: 0.9,
              color: MUTED_TEXT,
              letterSpacing: 2.2,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            feature modules
          </div>
          {COMPARE_STACK.map((chip, index) => {
            const chipReveal = spring({
              frame: frame - (900 + index * 12),
              fps,
              config: { damping: 18, stiffness: 120, mass: 0.96 },
            });

            return (
              <div
                key={chip.label}
                style={{
                  height: chipHeight,
                  borderRadius: 26,
                  background: `linear-gradient(145deg, ${chip.accent}16, rgba(12,10,32,0.95))`,
                  border: `1px solid ${chip.accent}34`,
                  boxShadow: `0 0 20px ${chip.accent}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `translateY(${mix(26, 0, chipReveal)}px)`,
                  opacity: clamp01(chipReveal),
                }}
              >
                <div
                  style={{
                    fontSize: 44,
                    lineHeight: 0.92,
                    fontWeight: 800,
                    color: SOFT_WHITE,
                  }}
                >
                  {chip.label}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </SceneCard>
  );
};

const HostFileCard = ({ rect, reveal }: { rect: Rect; reveal: number }) => {
  const frame = useCurrentFrame();
  const bars = Array.from({ length: 16 }).map((_, index) => {
    const width = 0.42 + ((index * 17) % 43) / 100;
    const tint =
      index % 4 === 0
        ? HOT_PINK
        : index % 4 === 1
          ? NIX_ORANGE
          : index % 4 === 2
            ? NEUTRAL_BLUE
            : NEOVIM_GREEN;
    const drift = Math.sin(frame / 28 + index) * 12;

    return { width, tint, drift };
  });

  return (
    <SceneCard rect={rect} reveal={reveal} tilt={0.9} zIndex={18}>
      <GlassCard
        style={{
          height: "100%",
          padding: "34px 36px",
          borderRadius: 42,
          background:
            "linear-gradient(145deg, rgba(14,8,32,0.92), rgba(20,12,34,0.92))",
          filter: "blur(0.2px)",
          opacity: 0.95,
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
              fontSize: 30,
              lineHeight: 0.9,
              color: MUTED_TEXT,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            host file
          </div>
          <div
            style={{
              fontSize: 82,
              lineHeight: 0.84,
              fontWeight: 800,
              color: "rgba(247,244,255,0.9)",
              marginTop: 10,
              marginBottom: 28,
            }}
          >
            default.nix
          </div>

          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 146,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {bars.map((bar, index) => (
              <div
                key={index}
                style={{
                  width: `${bar.width * 100}%`,
                  height: 30 + (index % 3) * 8,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${bar.tint}20, rgba(255,255,255,0.03))`,
                  border: `1px solid ${bar.tint}22`,
                  transform: `translateX(${bar.drift}px)`,
                  opacity: 0.8 - index * 0.025,
                }}
              />
            ))}
          </div>
        </div>
      </GlassCard>
    </SceneCard>
  );
};

export const CurrentSetupScene7 = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const scaleValue = (value: number) => value * (width / BASE_WIDTH);

  const stage = {
    width: scaleValue(3080),
    height: scaleValue(1180),
    paddingX: scaleValue(118),
    paddingY: scaleValue(84),
  };

  const explorerPresence = presenceBetween(frame, 0, 16, 256, 284);
  const clusterPresence = presenceBetween(frame, 272, 304, 842, 876);
  const comparePresence = progressBetween(frame, 864, 894);

  const explorerReveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 118, mass: 0.96 },
  });

  const clusterReveal = spring({
    fps,
    frame: frame - 276,
    config: { damping: 18, stiffness: 120, mass: 0.96 },
  });

  const compareReveal = spring({
    fps,
    frame: frame - 868,
    config: { damping: 18, stiffness: 122, mass: 0.96 },
  });

  const titleFeatureOpacity = presenceBetween(frame, 18, 48, 224, 252);
  const titleBranchOpacity = presenceBetween(frame, 322, 350, 700, 728);
  const titlePracticalOpacity = presenceBetween(frame, 734, 758, 834, 856);
  const titleModulesOpacity = progressBetween(frame, 904, 934);

  const explorerRect: Rect = {
    x: stage.width * 0.5,
    y: stage.height * 0.49,
    width: stage.width * 0.94,
    height: stage.height * 0.8,
  };

  const directoryRowHeight = scaleValue(78);
  const explorerScrollY =
    directoryRowHeight * 4.9 * progressBetween(frame, 92, 238);

  const hostCenters = {
    pc: { x: stage.width * 0.2, y: stage.height * 0.61 },
    l: { x: stage.width * 0.5, y: stage.height * 0.39 },
    work: { x: stage.width * 0.81, y: stage.height * 0.61 },
  };

  const hostRects: Record<HostId, Rect> = {
    pc: {
      x: hostCenters.pc.x,
      y: hostCenters.pc.y,
      width: stage.width * 0.17,
      height: stage.height * 0.19,
    },
    l: {
      x: hostCenters.l.x,
      y: hostCenters.l.y,
      width: stage.width * 0.19,
      height: stage.height * 0.18,
    },
    work: {
      x: hostCenters.work.x,
      y: hostCenters.work.y,
      width: stage.width * 0.18,
      height: stage.height * 0.2,
    },
  };

  const orbitSizes = {
    pc: { width: stage.width * 0.36, height: stage.height * 0.44 },
    l: { width: stage.width * 0.22, height: stage.height * 0.28 },
    work: { width: stage.width * 0.41, height: stage.height * 0.46 },
  };

  const pcHot = presenceBetween(frame, 312, 340, 410, 442);
  const lHot = presenceBetween(frame, 452, 476, 520, 548);
  const workHot = presenceBetween(frame, 548, 576, 710, 740);

  const compareStackRect: Rect = {
    x: stage.width * 0.17,
    y: stage.height * 0.58,
    width: stage.width * 0.22,
    height: stage.height * 0.62,
  };

  const compareWorkRect: Rect = {
    x: stage.width * 0.5,
    y: stage.height * 0.58,
    width: stage.width * 0.18,
    height: stage.height * 0.2,
  };

  const compareFileRect: Rect = {
    x: stage.width * 0.81,
    y: stage.height * 0.58,
    width: stage.width * 0.3,
    height: stage.height * 0.68,
  };

  const getRowMeta = (rowId: string) => {
    const index = DIRECTORY_ROWS.findIndex((row) => row.id === rowId);
    const row = DIRECTORY_ROWS[index];
    return { index, indent: row.indent };
  };

  const getRowAnchor = (rowId: string) => {
    const meta = getRowMeta(rowId);
    return {
      x:
        explorerRect.x -
        explorerRect.width / 2 +
        explorerRect.width * 0.11 +
        meta.indent * scaleValue(74),
      y:
        explorerRect.y -
        explorerRect.height / 2 +
        explorerRect.height * 0.34 +
        meta.index * directoryRowHeight -
        explorerScrollY,
    };
  };

  const stageFloat = Math.sin(frame / 42) * scaleValue(8);
  const chipWidth = scaleValue(248);
  const beamThickness = scaleValue(8);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,93,162,0.16), transparent 28%), radial-gradient(circle at 82% 24%, rgba(127,232,255,0.14), transparent 26%), radial-gradient(circle at 56% 78%, rgba(255,216,108,0.12), transparent 28%)",
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
            text="feature layer"
            color={SOFT_WHITE}
            opacity={titleFeatureOpacity}
          />
          <OverlayTitle
            text="machine specific"
            color={NEOVIM_GREEN}
            opacity={titleBranchOpacity}
          />
          <OverlayTitle
            text="practical compromises"
            color={SOLAR_GOLD}
            opacity={titlePracticalOpacity}
          />
          <OverlayTitle
            text="feature modules"
            color={HOT_PINK}
            opacity={titleModulesOpacity}
          />

          <div style={{ opacity: explorerPresence }}>
            <DirectoryPanel
              rect={explorerRect}
              reveal={explorerReveal * explorerPresence}
              rows={DIRECTORY_ROWS}
              rowHeight={directoryRowHeight}
              scrollY={explorerScrollY}
            />
          </div>

          <div style={{ opacity: clusterPresence }}>
            <OrbitGuide
              center={hostCenters.pc}
              width={orbitSizes.pc.width}
              height={orbitSizes.pc.height}
              accent={NIX_ORANGE}
              opacity={clusterPresence * 0.5}
            />
            <OrbitGuide
              center={hostCenters.l}
              width={orbitSizes.l.width}
              height={orbitSizes.l.height}
              accent={NEUTRAL_BLUE}
              opacity={clusterPresence * 0.5}
            />
            <OrbitGuide
              center={hostCenters.work}
              width={orbitSizes.work.width}
              height={orbitSizes.work.height}
              accent={HOT_PINK}
              opacity={clusterPresence * 0.5}
            />

            <HostNode
              rect={hostRects.pc}
              reveal={clusterReveal * clusterPresence}
              label="pc"
              accent={NIX_ORANGE}
              hot={pcHot}
            />
            <HostNode
              rect={hostRects.l}
              reveal={clusterReveal * clusterPresence}
              label="laptop"
              accent={NEUTRAL_BLUE}
              hot={lHot}
            />
            <HostNode
              rect={hostRects.work}
              reveal={clusterReveal * clusterPresence}
              label="work"
              accent={HOT_PINK}
              hot={workHot}
            />

            {MODULES.map((module, index) => {
              const travel =
                spring({
                  frame: frame - module.startFrame,
                  fps,
                  config: { damping: 18, stiffness: 122, mass: 0.96 },
                }) * clusterPresence;

              const start = getRowAnchor(module.rowId);
              const hostCenter = hostCenters[module.host];
              const end = {
                x: hostCenter.x + scaleValue(module.targetOffset.x),
                y: hostCenter.y + scaleValue(module.targetOffset.y),
              };
              const bob =
                Math.sin(frame / 22 + index * 1.3) * scaleValue(10) * travel;

              const x = mix(start.x, end.x, travel);
              const y = mix(start.y, end.y, travel) + bob;
              const hostAccent =
                module.host === "pc"
                  ? NIX_ORANGE
                  : module.host === "l"
                    ? NEUTRAL_BLUE
                    : HOT_PINK;

              return (
                <div key={module.id}>
                  <Beam
                    start={hostCenter}
                    end={{ x, y }}
                    progress={travel}
                    accent={hostAccent}
                    thickness={beamThickness}
                    opacity={0.74 * clusterPresence}
                  />
                  <ModuleChip
                    x={x}
                    y={y}
                    label={module.label}
                    accent={module.accent}
                    reveal={travel}
                    width={
                      module.label.length > 11
                        ? chipWidth * 1.18
                        : module.label.length > 8
                          ? chipWidth * 1.04
                          : chipWidth
                    }
                    fontSize={scaleValue(38)}
                    zIndex={14}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ opacity: comparePresence }}>
            <ModuleStackCard
              rect={compareStackRect}
              reveal={compareReveal * comparePresence}
              chipHeight={scaleValue(102)}
            />

            <HostNode
              rect={compareWorkRect}
              reveal={compareReveal * comparePresence}
              label="work"
              accent={HOT_PINK}
              hot={0.84}
            />

            <HostFileCard
              rect={compareFileRect}
              reveal={compareReveal * comparePresence}
            />

            {[0.26, 0.5, 0.74].map((t, index) => (
              <Beam
                key={t}
                start={{
                  x: compareStackRect.x + compareStackRect.width * 0.42,
                  y:
                    compareStackRect.y -
                    compareStackRect.height * 0.24 +
                    compareStackRect.height * t,
                }}
                end={{
                  x: compareWorkRect.x - compareWorkRect.width * 0.18,
                  y: compareWorkRect.y + (index - 1) * scaleValue(32),
                }}
                progress={compareReveal * comparePresence}
                accent={HOT_PINK}
                thickness={beamThickness}
                opacity={0.92}
              />
            ))}
          </div>
        </div>

        <SceneProgressBar colors={["#ff5da2", "#8affcf"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
