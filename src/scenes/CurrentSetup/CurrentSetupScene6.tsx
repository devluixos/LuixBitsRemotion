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

export const CURRENT_SETUP_SCENE_6_DURATION = 1260; // Scene 6, 42.00 seconds @ 30fps

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

type CodeEntry = {
  id: string;
  number: string;
  text: string;
  accent: string;
};

type BadgeConfig = {
  id: string;
  label: string;
  accent: string;
};

const BASE_LINES: CodeEntry[] = [
  {
    id: "import-opt",
    number: "4",
    text: "./optimisations.nix",
    accent: SOLAR_GOLD,
  },
  {
    id: "timezone",
    number: "8",
    text: 'time.timeZone = "Europe/Zurich";',
    accent: HOT_PINK,
  },
  {
    id: "locale",
    number: "9",
    text: 'i18n.defaultLocale = "en_GB.UTF-8";',
    accent: HOT_PINK,
  },
  {
    id: "network",
    number: "10",
    text: "networking.networkmanager.enable = true;",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "libvirt",
    number: "28",
    text: "virtualisation.libvirtd.enable = true;",
    accent: NIX_ORANGE,
  },
  {
    id: "docker",
    number: "30",
    text: "virtualisation.docker.enable = true;",
    accent: NIX_ORANGE,
  },
  {
    id: "boot",
    number: "41",
    text: "boot.loader.systemd-boot.enable = true;",
    accent: SOLAR_GOLD,
  },
  {
    id: "sddm",
    number: "48",
    text: "services.displayManager.sddm.enable = true;",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "niri-session",
    number: "56",
    text: 'services.displayManager.defaultSession = "niri";',
    accent: NEOVIM_GREEN,
  },
  {
    id: "fish-shell",
    number: "66",
    text: "environment.shells = with pkgs; [ fish ];",
    accent: SOLAR_GOLD,
  },
  {
    id: "fonts",
    number: "81",
    text: "fonts.packages = with pkgs; [ ... ];",
    accent: HOT_PINK,
  },
  {
    id: "fish-program",
    number: "93",
    text: "programs.fish.enable = true;",
    accent: SOLAR_GOLD,
  },
  {
    id: "niri-program",
    number: "95",
    text: "programs.niri.enable = true;",
    accent: NEOVIM_GREEN,
  },
  {
    id: "portal",
    number: "109",
    text: "xdg.portal = { enable = true; ... };",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "keyring",
    number: "120",
    text: "services.gnome.gnome-keyring.enable = true;",
    accent: HOT_PINK,
  },
];

const OPT_LINES: CodeEntry[] = [
  {
    id: "auto-upgrade",
    number: "4",
    text: "system.autoUpgrade = { enable = true; ... };",
    accent: SOLAR_GOLD,
  },
  {
    id: "gc",
    number: "11",
    text: "nix.gc = { automatic = true; ... };",
    accent: NIX_ORANGE,
  },
  {
    id: "optimise",
    number: "17",
    text: "nix.optimise = { automatic = true; ... };",
    accent: NIX_ORANGE,
  },
  {
    id: "limit",
    number: "23",
    text: "boot.loader.grub.configurationLimit = 10;",
    accent: SOLAR_GOLD,
  },
  {
    id: "systemd-limit",
    number: "24",
    text: "boot.loader.systemd-boot.configurationLimit = 10;",
    accent: SOLAR_GOLD,
  },
  {
    id: "fwupd",
    number: "26",
    text: "services.fwupd.enable = true;",
    accent: HOT_PINK,
  },
  {
    id: "trim",
    number: "27",
    text: "services.fstrim.enable = true;",
    accent: NEOVIM_GREEN,
  },
  {
    id: "bluetooth",
    number: "29",
    text: "hardware.bluetooth = { enable = true; ... };",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "blueman",
    number: "42",
    text: "services.blueman.enable = true;",
    accent: NEUTRAL_BLUE,
  },
  {
    id: "store",
    number: "44",
    text: "nix.settings.auto-optimise-store = true;",
    accent: NEOVIM_GREEN,
  },
];

const BASE_BADGES: BadgeConfig[] = [
  { id: "time-locale", label: "time + locale", accent: HOT_PINK },
  { id: "network", label: "network", accent: NEUTRAL_BLUE },
  { id: "docker", label: "docker", accent: NIX_ORANGE },
  { id: "libvirt", label: "libvirt", accent: NIX_ORANGE },
  { id: "sddm-niri", label: "sddm + niri", accent: NEOVIM_GREEN },
  { id: "fish", label: "fish shell", accent: SOLAR_GOLD },
  { id: "fonts", label: "fonts", accent: HOT_PINK },
  { id: "portals", label: "xdg portals", accent: NEUTRAL_BLUE },
  { id: "keyring", label: "keyring", accent: NEOVIM_GREEN },
];

const BASE_LAYER_BADGES: BadgeConfig[] = [
  { id: "time-locale", label: "time + locale", accent: HOT_PINK },
  { id: "network", label: "network", accent: NEUTRAL_BLUE },
  { id: "docker", label: "docker", accent: NIX_ORANGE },
  { id: "sddm-niri", label: "sddm + niri", accent: NEOVIM_GREEN },
  { id: "fish", label: "fish shell", accent: SOLAR_GOLD },
  { id: "keyring", label: "keyring", accent: NEOVIM_GREEN },
];

const OPT_BADGES: BadgeConfig[] = [
  { id: "upgrades", label: "auto upgrades", accent: SOLAR_GOLD },
  { id: "gc", label: "garbage collect", accent: NIX_ORANGE },
  { id: "store", label: "store optimise", accent: NEOVIM_GREEN },
  { id: "firmware", label: "firmware", accent: HOT_PINK },
  { id: "trim", label: "trim", accent: NEOVIM_GREEN },
  { id: "bluetooth", label: "bluetooth", accent: NEUTRAL_BLUE },
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

const StackIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 120 120" style={{ width: "76%", height: "76%" }}>
    <rect
      x="22"
      y="24"
      width="76"
      height="20"
      rx="8"
      fill={`${color}18`}
      stroke={color}
      strokeWidth="5"
    />
    <rect
      x="22"
      y="50"
      width="76"
      height="20"
      rx="8"
      fill={`${color}18`}
      stroke={color}
      strokeWidth="5"
    />
    <rect
      x="22"
      y="76"
      width="76"
      height="20"
      rx="8"
      fill={`${color}18`}
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
        transform: `translate(-50%, -50%) translateY(${mix(78, 0, reveal)}px) rotate(${mix(
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

const CodeWindow = ({
  rect,
  reveal,
  title,
  label,
  accent,
  lines,
  activeIds,
  codeSize,
  lineNoSize,
  scrollY = 0,
  zIndex,
  tilt = 0,
}: {
  rect: Rect;
  reveal: number;
  title: string;
  label: string;
  accent: string;
  lines: CodeEntry[];
  activeIds: string[];
  codeSize: number;
  lineNoSize: number;
  scrollY?: number;
  zIndex: number;
  tilt?: number;
}) => {
  const activeSet = new Set(activeIds);
  const rowHeight = codeSize * 1.56;

  return (
    <SceneCard rect={rect} reveal={reveal} tilt={tilt} zIndex={zIndex}>
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
              background:
                "radial-gradient(circle at 18% 10%, rgba(255,93,162,0.14), transparent 28%), radial-gradient(circle at 86% 16%, rgba(127,232,255,0.12), transparent 24%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: rect.width * 0.05,
              top: rect.height * 0.055,
              right: rect.width * 0.05,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Dots />
            <div
              style={{
                fontSize: lineNoSize * 1.36,
                lineHeight: 0.9,
                color: MUTED_TEXT,
                letterSpacing: 2.2,
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: rect.width * 0.05,
              top: rect.height * 0.15,
              display: "flex",
              alignItems: "center",
              gap: rect.width * 0.018,
            }}
          >
            <div
              style={{
                width: codeSize * 1.6,
                height: codeSize * 1.6,
                borderRadius: codeSize * 0.34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${accent}10`,
                border: `1px solid ${accent}34`,
              }}
            >
              <StackIcon color={accent} />
            </div>
            <div
              style={{
                fontSize: codeSize * 1.7,
                lineHeight: 0.84,
                fontWeight: 800,
                color: SOFT_WHITE,
                textShadow: `0 14px 34px ${accent}22`,
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
              top: rect.height * 0.3,
              bottom: rect.height * 0.07,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                transform: `translateY(${-scrollY}px)`,
                transition: "none",
              }}
            >
              {lines.map((line) => {
                const active = activeSet.has(line.id);
                return (
                  <div
                    key={line.id}
                    style={{
                      minHeight: rowHeight,
                      display: "grid",
                      gridTemplateColumns: `${rect.width * 0.085}px 1fr`,
                      alignItems: "center",
                      gap: codeSize * 0.24,
                      padding: `${codeSize * 0.18}px ${codeSize * 0.24}px`,
                      borderRadius: codeSize * 0.3,
                      background: active
                        ? `linear-gradient(90deg, ${line.accent}1e, rgba(255,255,255,0.02))`
                        : "transparent",
                      border: active
                        ? `1px solid ${line.accent}34`
                        : "1px solid transparent",
                      boxShadow: active ? `0 0 18px ${line.accent}16` : "none",
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
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontSize: codeSize,
                        lineHeight: 1.14,
                        letterSpacing: -0.6,
                        color: active ? line.accent : "rgba(247,244,255,0.9)",
                        fontWeight: active ? 700 : 600,
                        whiteSpace: "pre",
                      }}
                    >
                      {line.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>
    </SceneCard>
  );
};

const Badge = ({
  label,
  accent,
  reveal,
}: {
  label: string;
  accent: string;
  reveal: number;
}) => (
  <div
    style={{
      transform: `translateY(${mix(24, 0, reveal)}px) scale(${mix(0.94, 1, reveal)})`,
      opacity: clamp01(reveal * 1.08),
      borderRadius: 32,
      padding: "24px 26px",
      background: `linear-gradient(145deg, ${accent}12, rgba(14,10,34,0.94))`,
      border: `1px solid ${accent}34`,
      boxShadow: `0 0 22px ${accent}14`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      minHeight: 112,
    }}
  >
    <div
      style={{
        fontSize: 40,
        lineHeight: 0.9,
        fontWeight: 800,
        color: SOFT_WHITE,
        textShadow: `0 0 18px ${accent}22`,
      }}
    >
      {label}
    </div>
  </div>
);

const BehaviorBoard = ({
  rect,
  reveal,
  title,
  label,
  icon,
  accent,
  badges,
  badgeStart,
}: {
  rect: Rect;
  reveal: number;
  title: string;
  label: string;
  icon: ReactNode;
  accent: string;
  badges: BadgeConfig[];
  badgeStart: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneCard rect={rect} reveal={reveal} tilt={1.2} zIndex={8}>
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
            position: "relative",
            width: "100%",
            height: "100%",
            padding: "36px 38px",
            display: "flex",
            flexDirection: "column",
            gap: 26,
            overflow: "hidden",
            borderRadius: 38,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 14% 12%, rgba(255,93,162,0.12), transparent 22%), radial-gradient(circle at 84% 16%, rgba(127,232,255,0.1), transparent 20%)",
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${accent}10`,
                  border: `1px solid ${accent}30`,
                }}
              >
                {icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 0.9,
                    color: MUTED_TEXT,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 106,
                    lineHeight: 0.84,
                    fontWeight: 800,
                    color: SOFT_WHITE,
                    textShadow: `0 14px 30px ${accent}20`,
                  }}
                >
                  {title}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 18,
              flex: 1,
            }}
          >
            {badges.map((badge, index) => {
              const badgeReveal =
                spring({
                  fps,
                  frame: frame - (badgeStart + index * 18),
                  config: { damping: 18, stiffness: 124, mass: 0.96 },
                }) * reveal;

              return (
                <Badge
                  key={badge.id}
                  label={badge.label}
                  accent={badge.accent}
                  reveal={badgeReveal}
                />
              );
            })}
          </div>
        </div>
      </GlassCard>
    </SceneCard>
  );
};

const LayerCard = ({
  rect,
  reveal,
  title,
  fileLabel,
  accent,
  previewLines,
  badges,
  badgeStart,
}: {
  rect: Rect;
  reveal: number;
  title: string;
  fileLabel: string;
  accent: string;
  previewLines: CodeEntry[];
  badges: BadgeConfig[];
  badgeStart: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <SceneCard rect={rect} reveal={reveal} tilt={0} zIndex={10}>
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
            position: "relative",
            width: "100%",
            height: "100%",
            padding: "28px 30px",
            display: "grid",
            gridTemplateColumns: "0.34fr 0.66fr",
            gap: 24,
            overflow: "hidden",
            borderRadius: 38,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 16% 18%, ${accent}16, transparent 26%)`,
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              borderRadius: 30,
              padding: "18px 20px",
              background: `${accent}0d`,
              border: `1px solid ${accent}24`,
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
              {fileLabel}
            </div>
            <div
              style={{
                fontSize: 86,
                lineHeight: 0.84,
                fontWeight: 800,
                color: SOFT_WHITE,
                textShadow: `0 10px 26px ${accent}20`,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 8,
              }}
            >
              {previewLines.map((line) => (
                <div
                  key={line.id}
                  style={{
                    borderRadius: 18,
                    padding: "12px 14px",
                    background: `linear-gradient(90deg, ${line.accent}18, rgba(255,255,255,0.02))`,
                    border: `1px solid ${line.accent}28`,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: 28,
                    lineHeight: 1.1,
                    color: SOFT_WHITE,
                    whiteSpace: "pre",
                  }}
                >
                  <span style={{ color: MUTED_TEXT, marginRight: 12 }}>
                    {line.number}
                  </span>
                  <span style={{ color: line.accent }}>{line.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
              alignContent: "center",
            }}
          >
            {badges.map((badge, index) => {
              const badgeReveal =
                spring({
                  fps,
                  frame: frame - (badgeStart + index * 16),
                  config: { damping: 18, stiffness: 124, mass: 0.96 },
                }) * reveal;

              return (
                <Badge
                  key={badge.id}
                  label={badge.label}
                  accent={badge.accent}
                  reveal={badgeReveal}
                />
              );
            })}
          </div>
        </div>
      </GlassCard>
    </SceneCard>
  );
};

export const CurrentSetupScene6 = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const scaleValue = (value: number) => value * (width / BASE_WIDTH);

  const stage = {
    width: scaleValue(3080),
    height: scaleValue(1180),
    paddingX: scaleValue(118),
    paddingY: scaleValue(84),
  };

  const introBasePresence = presenceBetween(frame, 0, 14, 170, 186);
  const basePresence = presenceBetween(frame, 194, 224, 640, 710);
  const layersPresence = progressBetween(frame, 670, 730);

  const baseCodeReveal = spring({
    fps,
    frame: frame - 205,
    config: { damping: 18, stiffness: 124, mass: 0.96 },
  });

  const baseBoardReveal = spring({
    fps,
    frame: frame - 252,
    config: { damping: 18, stiffness: 124, mass: 0.96 },
  });

  const topLayerReveal = spring({
    fps,
    frame: frame - 670,
    config: { damping: 18, stiffness: 124, mass: 0.96 },
  });

  const bottomLayerReveal = spring({
    fps,
    frame: frame - 730,
    config: { damping: 18, stiffness: 124, mass: 0.96 },
  });

  const introBaseRect: Rect = {
    x: stage.width * 0.5,
    y: stage.height * 0.47,
    width: stage.width * 0.94,
    height: stage.height * 0.78,
  };

  const baseCodeRect: Rect = {
    x: stage.width * 0.31,
    y: stage.height * 0.6,
    width: stage.width * 0.45,
    height: stage.height * 0.78,
  };

  const baseBoardRect: Rect = {
    x: stage.width * 0.77,
    y: stage.height * 0.61,
    width: stage.width * 0.38,
    height: stage.height * 0.74,
  };

  const topLayerRect: Rect = {
    x: stage.width * 0.5,
    y: stage.height * 0.33,
    width: stage.width * 0.92,
    height: stage.height * 0.31,
  };

  const bottomLayerRect: Rect = {
    x: stage.width * 0.5,
    y: stage.height * 0.74,
    width: stage.width * 0.92,
    height: stage.height * 0.31,
  };

  const codeSize = scaleValue(44);
  const baseRowHeight = codeSize * 1.56;
  const introCodeSize = scaleValue(46);
  const introRowHeight = introCodeSize * 1.56;
  const introScrollY = introRowHeight * 4.8 * progressBetween(frame, 52, 190);
  const baseScroll1 = progressBetween(frame, 190, 310);
  const baseScroll2 = progressBetween(frame, 320, 470);
  const baseScrollY =
    baseRowHeight * 4.1 * baseScroll1 + baseRowHeight * 5.1 * baseScroll2;

  const introActiveIds = ["import-opt"];
  if (frame >= 20) {
    introActiveIds.push("timezone", "locale", "network");
  }
  if (frame >= 60) {
    introActiveIds.push("libvirt", "docker", "boot", "sddm", "niri-session");
  }
  if (frame >= 100) {
    introActiveIds.push(
      "fish-shell",
      "fonts",
      "fish-program",
      "niri-program",
      "portal",
      "keyring",
    );
  }

  const baseActiveIds = ["import-opt"];
  if (frame >= 170) {
    baseActiveIds.push("timezone", "locale", "network", "libvirt", "docker");
  }
  if (frame >= 310) {
    baseActiveIds.push(
      "boot",
      "sddm",
      "niri-session",
      "fish-shell",
      "fonts",
      "fish-program",
      "niri-program",
    );
  }
  if (frame >= 440) {
    baseActiveIds.push("portal", "keyring");
  }

  const baseBeamProgress = progressBetween(frame, 290, 355);
  const stageFloat = Math.sin(frame / 44) * scaleValue(8);
  const beamThickness = scaleValue(9);
  const pulseSize = scaleValue(28);

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
            text="shared identity"
            color={SOFT_WHITE}
            opacity={presenceBetween(frame, 430, 456, 568, 602)}
          />
          <OverlayTitle
            text="machine behavior"
            color={NEOVIM_GREEN}
            opacity={presenceBetween(frame, 722, 746, 906, 934)}
          />
          <OverlayTitle
            text="maintenance"
            color={SOLAR_GOLD}
            opacity={presenceBetween(frame, 852, 878, 1060, 1092)}
          />

          <div style={{ opacity: introBasePresence }}>
            <CodeWindow
              rect={introBaseRect}
              reveal={introBasePresence}
              title="base.nix"
              label="hosts/common"
              accent={HOT_PINK}
              lines={BASE_LINES}
              activeIds={introActiveIds}
              codeSize={introCodeSize}
              lineNoSize={scaleValue(28)}
              scrollY={introScrollY}
              zIndex={6}
              tilt={-0.3}
            />
          </div>

          <div style={{ opacity: basePresence * (1 - layersPresence * 0.9) }}>
            <CodeWindow
              rect={baseCodeRect}
              reveal={baseCodeReveal * basePresence}
              title="base.nix"
              label="hosts/common"
              accent={HOT_PINK}
              lines={BASE_LINES}
              activeIds={baseActiveIds}
              codeSize={codeSize}
              lineNoSize={scaleValue(28)}
              scrollY={baseScrollY}
              zIndex={6}
              tilt={-0.8}
            />

            <BehaviorBoard
              rect={baseBoardRect}
              reveal={baseBoardReveal * basePresence}
              title="behavior"
              label="base.nix"
              icon={<GearIcon color={NEOVIM_GREEN} />}
              accent={NEOVIM_GREEN}
              badges={BASE_BADGES}
              badgeStart={190}
            />
          </div>

          <Beam
            start={{
              x: baseCodeRect.x + baseCodeRect.width / 2,
              y: baseCodeRect.y,
            }}
            end={{
              x: baseBoardRect.x - baseBoardRect.width / 2,
              y: baseBoardRect.y,
            }}
            progress={
              baseBeamProgress * basePresence * (1 - layersPresence * 0.9)
            }
            accent={NEOVIM_GREEN}
            thickness={beamThickness}
            pulseSize={pulseSize}
            opacity={basePresence}
          />

          <div style={{ opacity: layersPresence }}>
            <LayerCard
              rect={topLayerRect}
              reveal={topLayerReveal * layersPresence}
              title="behavior"
              fileLabel="base.nix"
              accent={NEOVIM_GREEN}
              previewLines={[BASE_LINES[1], BASE_LINES[3], BASE_LINES[8]]}
              badges={BASE_LAYER_BADGES}
              badgeStart={720}
            />

            <LayerCard
              rect={bottomLayerRect}
              reveal={bottomLayerReveal * layersPresence}
              title="maintenance"
              fileLabel="optimisations.nix"
              accent={SOLAR_GOLD}
              previewLines={[OPT_LINES[0], OPT_LINES[1], OPT_LINES[5]]}
              badges={OPT_BADGES}
              badgeStart={820}
            />
          </div>
        </div>

        <SceneProgressBar colors={["#ff5da2", "#8affcf"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
