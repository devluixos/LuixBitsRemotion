/*
 * Layout checklist:
 * - 3440x1440 scale: +20-30% sizes
 * - No overlaps; keep safe margins
 * - Labels readable on mobile
 * - Tags/lines sit below icon baselines
 * - Recenter remaining element after fades
 * - Keep the sun bright; avoid heavy scrims
 */

import {
  AbsoluteFill,
  Html5Video,
  getStaticFiles,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  type StaticFile,
} from "remotion";
import { Terminal, type TerminalLine } from "../../Terminal";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { GlassCard } from "../../components/GlassCard";
import { SceneProgressBar } from "../../components/SceneProgressBar";

export const CURRENT_SETUP_SCENE_DURATION = 1095; // 36.50 seconds @ 30fps

const BASE_WIDTH = 3440;

const HOT_PINK = "#ff5da2";
const NIX_ORANGE = "#ff9f4a";
const NEUTRAL_BLUE = "#7fe8ff";
const NEOVIM_GREEN = "#8affcf";
const SOFT_WHITE = "#f7f4ff";

const BASE_LAYOUT = {
  frame: {
    paddingX: 126,
    paddingY: 84,
  },
  stage: {
    width: 3040,
    height: 1160,
  },
  intro: {
    terminalWidth: 1540,
    terminalHeight: 820,
    rightWidth: 1040,
  },
  footage: {
    width: 900,
    height: 810,
    gap: 110,
    topY: 684,
  },
  landing: {
    width: 1940,
    height: 760,
    chipWidth: 340,
    chipHeight: 164,
    chipGap: 120,
  },
  text: {
    introTitle: 146,
    introBody: 42,
    terminalFont: 50,
    hostChip: 52,
    machinesTitle: 104,
    panelTitle: 76,
    panelNote: 30,
    chipLabel: 58,
    landingTitle: 146,
    landingMeta: 56,
    laneTitle: 70,
  },
  size: {
    beam: 8,
    hub: 22,
  },
};

const FOOTAGE_EXTENSIONS = ["mp4", "mov", "webm"] as const;

const INTRO_LINES: TerminalLine[] = [
  { prompt: "$", text: "ls", startFrame: 10, mode: "type", color: SOFT_WHITE },
  {
    prompt: "",
    text: "flake.nix  hosts  home  modules",
    startFrame: 40,
    mode: "paste",
    color: NEUTRAL_BLUE,
    glow: "rgba(127,232,255,0.6)",
  },
  {
    prompt: "$",
    text: "rg nixosConfigurations flake.nix",
    startFrame: 80,
    mode: "type",
    color: SOFT_WHITE,
  },
  {
    prompt: "",
    text: 'pc   = mkHost "pc";',
    startFrame: 130,
    mode: "paste",
    color: NIX_ORANGE,
    glow: "rgba(255,159,74,0.5)",
  },
  {
    prompt: "",
    text: 'l    = mkHost "l";',
    startFrame: 146,
    mode: "paste",
    color: NEUTRAL_BLUE,
    glow: "rgba(127,232,255,0.5)",
  },
  {
    prompt: "",
    text: 'work = mkHost "work";',
    startFrame: 162,
    mode: "paste",
    color: NEOVIM_GREEN,
    glow: "rgba(138,255,207,0.5)",
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

type MachineConfig = {
  label: "work" | "l" | "pc";
  title: string;
  role: string;
  accent: string;
  tilt: number;
  revealFrame: number;
  activeStart: number;
  activeEnd: number;
};

const MACHINES: MachineConfig[] = [
  {
    label: "work",
    title: "Surface Studio",
    role: "work laptop",
    accent: NEOVIM_GREEN,
    tilt: -2.5,
    revealFrame: 388,
    activeStart: 492,
    activeEnd: 584,
  },
  {
    label: "l",
    title: "Lenovo T14 Gen 5",
    role: "last video machine",
    accent: NEUTRAL_BLUE,
    tilt: 0,
    revealFrame: 412,
    activeStart: 598,
    activeEnd: 690,
  },
  {
    label: "pc",
    title: "Custom desktop",
    role: "self-built desktop",
    accent: NIX_ORANGE,
    tilt: 2.5,
    revealFrame: 436,
    activeStart: 704,
    activeEnd: 796,
  },
];

const LAYERS = [
  { label: "hosts/", accent: HOT_PINK },
  { label: "home/", accent: NEUTRAL_BLUE },
  { label: "modules/", accent: NIX_ORANGE },
];

const findFootageSrc = (files: StaticFile[], label: MachineConfig["label"]) => {
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

const PreviewHostChip: React.FC<{
  machine: MachineConfig;
  width: number;
  height: number;
  text: typeof BASE_LAYOUT.text;
}> = ({ machine, width, height, text }) => (
  <div
    style={{
      width,
      height,
      borderRadius: height * 0.25,
      background: `linear-gradient(145deg, rgba(10,12,30,0.94), rgba(28,14,56,0.84)), radial-gradient(circle at 20% 20%, ${machine.accent}2a, transparent 62%)`,
      border: `1px solid ${machine.accent}55`,
      boxShadow: `0 24px 64px rgba(4,0,24,0.44), 0 0 30px ${machine.accent}18`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 12px",
    }}
  >
    <div
      style={{
        fontSize: text.chipLabel,
        lineHeight: 0.88,
        fontWeight: 800,
        color: SOFT_WHITE,
        letterSpacing: machine.label === "l" ? 0 : 1.6,
        textTransform: "lowercase",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        textAlign: "center",
      }}
    >
      {machine.label}
    </div>
  </div>
);

const IntroHero: React.FC<{
  frame: number;
  fps: number;
  stageWidth: number;
  stageHeight: number;
  layout: {
    intro: {
      terminalWidth: number;
      terminalHeight: number;
      rightWidth: number;
    };
    landing: {
      chipWidth: number;
      chipHeight: number;
      chipGap: number;
    };
    text: typeof BASE_LAYOUT.text;
  };
}> = ({ frame, fps, stageWidth, stageHeight, layout }) => {
  const heroPresence = presenceBetween(frame, 0, 36, 320, 390);
  const terminalReveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 130, mass: 1 },
  });
  const rightReveal = spring({
    fps,
    frame: frame - 14,
    config: { damping: 18, stiffness: 130, mass: 1 },
  });

  if (heroPresence <= 0) {
    return null;
  }

  const terminalX = stageWidth * 0.29;
  const rightX = stageWidth * 0.79;
  const centerY = stageHeight * 0.47;
  const chipWidth = layout.landing.chipWidth * 0.7;
  const chipHeight = layout.landing.chipHeight * 0.58;
  const chipGap = layout.landing.chipGap * 0.2;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: terminalX,
          top: centerY,
          width: layout.intro.terminalWidth,
          height: layout.intro.terminalHeight,
          transform: `translate(-50%, -50%) translateY(${mix(72, 0, terminalReveal)}px) rotate(${mix(-4, 0, terminalReveal)}deg) scale(${mix(0.92, 1, terminalReveal)})`,
          opacity: heroPresence,
          zIndex: 4,
        }}
      >
        <Terminal
          lines={INTRO_LINES}
          fontSize={layout.text.terminalFont}
          promptWidth={layout.text.terminalFont * 1.2}
          style={{
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(10,12,22,0.96), rgba(24,14,32,0.9))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "0 40px 120px rgba(4,0,18,0.7), inset 0 0 40px rgba(124,255,231,0.08)",
            padding: "42px 54px",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: rightX,
          top: centerY,
          width: layout.intro.rightWidth,
          transform: `translate(-50%, -50%) translateY(${mix(68, 0, rightReveal)}px)`,
          opacity: heroPresence,
          zIndex: 5,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 30,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: layout.text.introTitle,
              lineHeight: 0.84,
              fontWeight: 800,
              color: SOFT_WHITE,
              letterSpacing: 1.1,
              textShadow: "0 16px 40px rgba(255,93,162,0.18)",
            }}
          >
            One repo
            <br />
            three machines
          </div>

          <div
            style={{
              fontSize: layout.text.introBody,
              lineHeight: 1.28,
              color: "rgba(247,244,255,0.82)",
              maxWidth: layout.intro.rightWidth * 0.88,
            }}
          >
            Not a tutorial. Just the structure I use right now.
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: chipGap,
            }}
          >
            {MACHINES.map((machine, index) => (
              <div
                key={`intro-${machine.label}`}
                style={{
                  transform: `translateY(${mix(50 + index * 14, 0, rightReveal)}px)`,
                  opacity: clamp01(rightReveal * 1.08),
                }}
              >
                <PreviewHostChip
                  machine={machine}
                  width={chipWidth}
                  height={chipHeight}
                  text={layout.text}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const MachinesHeader: React.FC<{
  opacity: number;
  stageWidth: number;
  text: typeof BASE_LAYOUT.text;
}> = ({ opacity, stageWidth, text }) => {
  if (opacity <= 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: stageWidth * 0.5,
        top: 132,
        transform: `translate(-50%, 0) translateY(${mix(24, 0, opacity)}px)`,
        opacity,
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      <div
        style={{
          fontSize: text.machinesTitle,
          lineHeight: 0.94,
          fontWeight: 800,
          color: SOFT_WHITE,
          letterSpacing: 1.1,
          textShadow: "0 14px 34px rgba(255,93,162,0.18)",
        }}
      >
        Three machines
      </div>
    </div>
  );
};

const FootageFallback: React.FC<{
  machine: MachineConfig;
  frame: number;
  titleSize: number;
}> = ({ machine, frame, titleSize }) => {
  const driftX = Math.sin((frame + machine.revealFrame) / 34) * 16;
  const driftY = Math.cos((frame + machine.revealFrame) / 30) * 18;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: `linear-gradient(145deg, rgba(14,10,38,0.96), rgba(8,5,24,0.98)), radial-gradient(circle at 18% 20%, ${machine.accent}28, transparent 42%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "7%",
          borderRadius: 34,
          border: `1px solid ${machine.accent}26`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: `calc(50% + ${driftX}px)`,
          top: `calc(50% + ${driftY}px)`,
          transform: "translate(-50%, -50%)",
          fontSize: titleSize * 1.2,
          lineHeight: 0.9,
          fontWeight: 800,
          letterSpacing: 2,
          color: `${machine.accent}88`,
          textTransform: "lowercase",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          textShadow: `0 0 34px ${machine.accent}22`,
        }}
      >
        {machine.label}
      </div>
    </div>
  );
};

const FootagePanel: React.FC<{
  machine: MachineConfig;
  src: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  frame: number;
  fps: number;
  text: typeof BASE_LAYOUT.text;
}> = ({ machine, src, x, y, width, height, frame, fps, text }) => {
  const reveal = spring({
    fps,
    frame: frame - machine.revealFrame,
    config: { damping: 20, stiffness: 120, mass: 1 },
  });
  const active = presenceBetween(
    frame,
    machine.activeStart - 10,
    machine.activeStart + 18,
    machine.activeEnd - 18,
    machine.activeEnd + 10,
  );
  const collapse = progressBetween(frame, 780, 892);
  const floatY = Math.sin((frame + machine.revealFrame) / 26) * 10;
  const index = MACHINES.findIndex((entry) => entry.label === machine.label);
  const activeSpread = mix(0, (index - 1) * 36, active);
  const scanX = mix(
    -width * 0.4,
    width * 1.2,
    progressBetween(frame, machine.activeStart, machine.activeEnd),
  );

  const scale =
    mix(0.84, 1, reveal) * mix(1, 0.82, collapse) * mix(0.97, 1.03, active);
  const translateY = mix(120, 0, reveal) + floatY - collapse * 90;
  const rotate = mix(machine.tilt, machine.tilt * 0.2, reveal) * (1 - collapse);
  const opacity = clamp01(reveal * 1.08) * (1 - collapse);
  const brightness = mix(0.76, 1.02, active);
  const saturation = mix(0.84, 1.16, active);
  const titleSize =
    machine.label === "l" ? text.panelTitle * 0.94 : text.panelTitle;

  if (opacity <= 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x + activeSpread,
        top: y,
        width,
        height,
        transform: `translate(-50%, -50%) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
        opacity,
        zIndex: 4 + Math.round(active * 3),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -22,
          borderRadius: 66,
          background: `radial-gradient(circle, ${machine.accent}2f, transparent 70%)`,
          filter: "blur(26px)",
          opacity: 0.42 + active * 0.36,
        }}
      />

      <GlassCard
        style={{
          height: "100%",
          padding: 0,
          borderRadius: 44,
          background: "rgba(9, 7, 28, 0.9)",
          border: `1px solid ${machine.accent}50`,
          boxShadow: `0 34px 120px rgba(4,0,24,0.68), 0 0 56px ${machine.accent}18`,
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
          {src ? (
            <Html5Video
              src={src}
               loop
              muted
              playsInline
              delayRenderTimeoutInMilliseconds={120000}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: `saturate(${saturation}) brightness(${brightness})`,
              }}
            />
          ) : (
            <FootageFallback
              machine={machine}
              frame={frame}
              titleSize={text.panelTitle}
            />
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(8,5,24,0.16), rgba(8,5,24,0) 24%, rgba(8,5,24,0.04) 56%, rgba(8,5,24,0.78) 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: scanX,
              width: width * 0.22,
              transform: "skewX(-12deg)",
              background: `linear-gradient(90deg, transparent, ${machine.accent}28, transparent)`,
              opacity: active * 0.9,
            }}
          />

          <div
            style={{
              position: "absolute",
              left: 38,
              top: 34,
              fontSize: text.hostChip,
              lineHeight: 0.88,
              fontWeight: 800,
              color: SOFT_WHITE,
              letterSpacing: machine.label === "l" ? 0 : 1.6,
              textTransform: "lowercase",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              textShadow: `0 14px 30px ${machine.accent}44`,
            }}
          >
            {machine.label}
          </div>

          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              bottom: 40,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: titleSize,
                lineHeight: 0.94,
                fontWeight: 800,
                color: SOFT_WHITE,
                letterSpacing: 0.9,
                textShadow: "0 12px 26px rgba(0,0,0,0.52)",
                maxWidth: "92%",
              }}
            >
              {machine.title}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              height: 10,
              width: `${mix(24, 100, active)}%`,
              borderRadius: "0 999px 999px 0",
              background: `linear-gradient(90deg, ${machine.accent}, rgba(255,255,255,0.9))`,
              boxShadow: `0 0 28px ${machine.accent}`,
              opacity: 0.78,
            }}
          />
        </div>
      </GlassCard>
    </div>
  );
};

const MachineChip: React.FC<{
  machine: MachineConfig;
  from: { x: number; y: number };
  to: { x: number; y: number };
  width: number;
  height: number;
  frame: number;
  text: typeof BASE_LAYOUT.text;
}> = ({ machine, from, to, width, height, frame, text }) => {
  const index = MACHINES.findIndex((entry) => entry.label === machine.label);
  const move = progressBetween(frame, 812 + index * 18, 918 + index * 18);

  if (move <= 0) {
    return null;
  }

  const x = mix(from.x, to.x, move);
  const y = mix(from.y, to.y, move);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        transform: `translate(-50%, -50%) scale(${mix(1.32, 1, move)})`,
        opacity: clamp01(move * 1.08),
        zIndex: 8,
      }}
    >
      <GlassCard
        style={{
          height: "100%",
          padding: "20px 22px",
          borderRadius: 30,
          background: `linear-gradient(145deg, rgba(10,12,30,0.94), rgba(28,14,56,0.86)), radial-gradient(circle at 20% 20%, ${machine.accent}28, transparent 62%)`,
          border: `1px solid ${machine.accent}5c`,
          boxShadow: `0 24px 68px rgba(4,0,24,0.56), 0 0 44px ${machine.accent}18`,
        }}
      >
        <div
          style={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: text.chipLabel,
              lineHeight: 0.88,
              fontWeight: 800,
              color: SOFT_WHITE,
              letterSpacing: machine.label === "l" ? 0 : 1.6,
              textTransform: "lowercase",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              textAlign: "center",
            }}
          >
            {machine.label}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

const Beam: React.FC<{
  start: { x: number; y: number };
  end: { x: number; y: number };
  progress: number;
  accent: string;
  thickness: number;
}> = ({ start, end, progress, accent, thickness }) => {
  if (progress <= 0) {
    return null;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: start.x,
          top: start.y,
          width: distance,
          height: thickness,
          transform: `translateY(-50%) rotate(${angle}deg) scaleX(${progress})`,
          transformOrigin: "0 50%",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.92))`,
          boxShadow: `0 0 22px ${accent}, 0 0 44px ${accent}44`,
          zIndex: 6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: start.x + dx * progress - thickness * 1.4,
          top: start.y + dy * progress - thickness * 1.4,
          width: thickness * 2.8,
          height: thickness * 2.8,
          borderRadius: "50%",
          background: accent,
          boxShadow: `0 0 24px ${accent}, 0 0 40px ${accent}55`,
          opacity: 0.94,
          zIndex: 7,
        }}
      />
    </>
  );
};

const LandingCard: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  width: number;
  height: number;
  chipTargets: { x: number; y: number }[];
  text: typeof BASE_LAYOUT.text;
  beamThickness: number;
  hubSize: number;
}> = ({
  frame,
  fps,
  x,
  y,
  width,
  height,
  chipTargets,
  text,
  beamThickness,
  hubSize,
}) => {
  const reveal = spring({
    fps,
    frame: frame - 850,
    config: { damping: 18, stiffness: 120, mass: 1 },
  });
  const hubProgress = progressBetween(frame, 886, 956);
  const hub = {
    x,
    y: y - height * 0.34,
  };

  if (reveal <= 0) {
    return null;
  }

  return (
    <>
      {MACHINES.map((machine, index) => (
        <Beam
          key={`beam-${machine.label}`}
          start={{
            x: chipTargets[index]?.x ?? x,
            y: (chipTargets[index]?.y ?? y) + 62,
          }}
          end={hub}
          progress={progressBetween(frame, 894 + index * 10, 966 + index * 10)}
          accent={machine.accent}
          thickness={beamThickness}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: hub.x - hubSize / 2,
          top: hub.y - hubSize / 2,
          width: hubSize,
          height: hubSize,
          borderRadius: "50%",
          background: SOFT_WHITE,
          boxShadow: `0 0 ${hubSize * 2.2}px rgba(255,255,255,0.92), 0 0 ${hubSize * 4}px rgba(255,93,162,0.48)`,
          opacity: hubProgress,
          zIndex: 8,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width,
          height,
          transform: `translate(-50%, -50%) translateY(${mix(88, 0, reveal)}px) scale(${mix(
            0.9,
            1,
            reveal,
          )})`,
          opacity: clamp01(reveal * 1.12),
          zIndex: 5,
        }}
      >
        <GlassCard
          style={{
            height: "100%",
            padding: "42px 44px",
            background:
              "linear-gradient(145deg, rgba(15,10,42,0.96), rgba(28,12,58,0.86))",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow:
              "0 36px 120px rgba(4,0,24,0.72), 0 0 76px rgba(255,93,162,0.18)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "0.9fr 1.1fr",
              gap: 40,
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                }}
              >
                <div
                  style={{
                    fontSize: text.landingTitle,
                    lineHeight: 0.86,
                    fontWeight: 800,
                    color: SOFT_WHITE,
                    letterSpacing: 1.1,
                    textShadow: "0 14px 36px rgba(255,93,162,0.22)",
                  }}
                >
                  repo/
                </div>
                <div
                  style={{
                    fontSize: text.landingMeta,
                    lineHeight: 0.9,
                    fontWeight: 700,
                    color: "rgba(247,244,255,0.82)",
                    letterSpacing: 1,
                  }}
                >
                  shared flake
                  <br />
                  different jobs
                </div>
              </div>

              <div
                style={{
                  width: "88%",
                  height: 16,
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, rgba(127,232,255,0.88), rgba(255,93,162,0.9), rgba(255,159,74,0.9))",
                  boxShadow:
                    "0 0 34px rgba(255,93,162,0.3), 0 0 50px rgba(127,232,255,0.2)",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 20,
                alignContent: "center",
              }}
            >
              {LAYERS.map((layer, index) => {
                const laneReveal = spring({
                  fps,
                  frame: frame - (884 + index * 16),
                  config: { damping: 18, stiffness: 120, mass: 1 },
                });

                return (
                  <div
                    key={layer.label}
                    style={{
                      borderRadius: 32,
                      padding: "34px 36px",
                      background: `${layer.accent}16`,
                      border: `1px solid ${layer.accent}32`,
                      transform: `translateX(${mix(90 - index * 14, 0, laneReveal)}px)`,
                      opacity: clamp01(laneReveal * 1.08),
                    }}
                  >
                    <div
                      style={{
                        fontSize: text.laneTitle,
                        lineHeight: 0.96,
                        fontWeight: 800,
                        color: SOFT_WHITE,
                        letterSpacing: 1,
                      }}
                    >
                      {layer.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
};

export const CurrentSetupScene = () => {
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
    intro: {
      terminalWidth: scaleValue(BASE_LAYOUT.intro.terminalWidth),
      terminalHeight: scaleValue(BASE_LAYOUT.intro.terminalHeight),
      rightWidth: scaleValue(BASE_LAYOUT.intro.rightWidth),
    },
    footage: {
      width: scaleValue(BASE_LAYOUT.footage.width),
      height: scaleValue(BASE_LAYOUT.footage.height),
      gap: scaleValue(BASE_LAYOUT.footage.gap),
      topY: scaleValue(BASE_LAYOUT.footage.topY),
    },
    landing: {
      width: scaleValue(BASE_LAYOUT.landing.width),
      height: scaleValue(BASE_LAYOUT.landing.height),
      chipWidth: scaleValue(BASE_LAYOUT.landing.chipWidth),
      chipHeight: scaleValue(BASE_LAYOUT.landing.chipHeight),
      chipGap: scaleValue(BASE_LAYOUT.landing.chipGap),
    },
    text: {
      introTitle: scaleValue(BASE_LAYOUT.text.introTitle),
      introBody: scaleValue(BASE_LAYOUT.text.introBody),
      terminalFont: scaleValue(BASE_LAYOUT.text.terminalFont),
      hostChip: scaleValue(BASE_LAYOUT.text.hostChip),
      machinesTitle: scaleValue(BASE_LAYOUT.text.machinesTitle),
      panelTitle: scaleValue(BASE_LAYOUT.text.panelTitle),
      panelNote: scaleValue(BASE_LAYOUT.text.panelNote),
      chipLabel: scaleValue(BASE_LAYOUT.text.chipLabel),
      landingTitle: scaleValue(BASE_LAYOUT.text.landingTitle),
      landingMeta: scaleValue(BASE_LAYOUT.text.landingMeta),
      laneTitle: scaleValue(BASE_LAYOUT.text.laneTitle),
    },
    size: {
      beam: scaleValue(BASE_LAYOUT.size.beam),
      hub: scaleValue(BASE_LAYOUT.size.hub),
    },
  };

  const panelReveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 120, mass: 1 },
  });
  const machinesHeaderOpacity = presenceBetween(frame, 372, 432, 760, 840);

  const stageCenterX = layout.stage.width * 0.5;
  const landingY = layout.stage.height * 0.57;
  const machinePositions = MACHINES.map((_, index) => ({
    x: stageCenterX + (index - 1) * (layout.footage.width + layout.footage.gap),
    y: layout.footage.topY + (index === 1 ? scaleValue(-18) : scaleValue(6)),
  }));

  const chipTargets = MACHINES.map((_, index) => ({
    x:
      stageCenterX +
      (index - 1) * (layout.landing.chipWidth + layout.landing.chipGap),
    y: landingY - layout.landing.height * 0.66,
  }));

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />
      <AbsoluteFill
        style={{
          padding: `${layout.frame.paddingY}px ${layout.frame.paddingX}px`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            opacity: clamp01(panelReveal * 1.08),
            transform: `translateY(${mix(28, 0, panelReveal)}px)`,
          }}
        >
          <GlassCard
            style={{
              height: "100%",
              padding: `${scaleValue(34)}px ${scaleValue(42)}px`,
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
                  left: "50%",
                  top: scaleValue(560),
                  width: scaleValue(980),
                  height: scaleValue(980),
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,93,162,0.18), rgba(127,232,255,0.08) 42%, transparent 72%)",
                  filter: "blur(10px)",
                  opacity: 0.88,
                }}
              />

              <div
                style={{
                  position: "relative",
                  width: layout.stage.width,
                  height: layout.stage.height,
                  margin: "0 auto",
                }}
              >
                <IntroHero
                  frame={frame}
                  fps={fps}
                  stageWidth={layout.stage.width}
                  stageHeight={layout.stage.height}
                  layout={{
                    intro: layout.intro,
                    landing: layout.landing,
                    text: layout.text,
                  }}
                />

                <MachinesHeader
                  opacity={machinesHeaderOpacity}
                  stageWidth={layout.stage.width}
                  text={layout.text}
                />

                {MACHINES.map((machine, index) => (
                  <FootagePanel
                    key={machine.label}
                    machine={machine}
                    src={findFootageSrc(staticFiles, machine.label)}
                    x={machinePositions[index]?.x ?? stageCenterX}
                    y={machinePositions[index]?.y ?? layout.footage.topY}
                    width={layout.footage.width}
                    height={layout.footage.height}
                    frame={frame}
                    fps={fps}
                    text={layout.text}
                  />
                ))}

                <LandingCard
                  frame={frame}
                  fps={fps}
                  x={stageCenterX}
                  y={landingY}
                  width={layout.landing.width}
                  height={layout.landing.height}
                  chipTargets={chipTargets}
                  text={layout.text}
                  beamThickness={layout.size.beam}
                  hubSize={layout.size.hub}
                />

                {MACHINES.map((machine, index) => (
                  <MachineChip
                    key={`${machine.label}-chip`}
                    machine={machine}
                    from={{
                      x: machinePositions[index]?.x ?? stageCenterX,
                      y:
                        (machinePositions[index]?.y ?? layout.footage.topY) +
                        layout.footage.height * 0.4,
                    }}
                    to={chipTargets[index] ?? { x: stageCenterX, y: landingY }}
                    width={layout.landing.chipWidth}
                    height={layout.landing.chipHeight}
                    frame={frame}
                    text={layout.text}
                  />
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
        <SceneProgressBar colors={["#7fe8ff", "#ff5da2"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
