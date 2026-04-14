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

export const CURRENT_SETUP_SCENE_8_DURATION = 1110; // Scene 8, 37.00 seconds @ 30fps

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

type FactChip = {
  id: string;
  label: string;
  accent: string;
};

const GENERATED_PC: CodeLine[] = [
  {
    id: "comment",
    number: "#",
    text: "Do not modify this file!",
    accent: SOLAR_GOLD,
  },
  {
    id: "initrd",
    number: "9",
    text: 'boot.initrd.availableKernelModules = [ "nvme" ... ];',
    accent: NEUTRAL_BLUE,
  },
  {
    id: "fs-root",
    number: "13",
    text: 'fileSystems."/" = { device = "/dev/disk/by-uuid/..."; };',
    accent: HOT_PINK,
  },
  {
    id: "fs-boot",
    number: "17",
    text: 'fileSystems."/boot" = { fsType = "vfat"; ... };',
    accent: NIX_ORANGE,
  },
  {
    id: "platform",
    number: "33",
    text: 'nixpkgs.hostPlatform = "x86_64-linux";',
    accent: NEOVIM_GREEN,
  },
];

const GENERATED_LAPTOP: CodeLine[] = [
  {
    id: "comment",
    number: "#",
    text: "Do not modify this file!",
    accent: SOLAR_GOLD,
  },
  {
    id: "initrd",
    number: "9",
    text: 'boot.initrd.availableKernelModules = [ "nvme" "thunderbolt" ];',
    accent: NEUTRAL_BLUE,
  },
  {
    id: "kernel",
    number: "11",
    text: 'boot.kernelModules = [ "kvm-amd" ];',
    accent: HOT_PINK,
  },
  {
    id: "fs-root",
    number: "14",
    text: 'fileSystems."/" = { fsType = "ext4"; ... };',
    accent: HOT_PINK,
  },
  {
    id: "platform",
    number: "31",
    text: 'nixpkgs.hostPlatform = "x86_64-linux";',
    accent: NEOVIM_GREEN,
  },
];

const GENERATED_WORK: CodeLine[] = [
  {
    id: "comment",
    number: "#",
    text: "Do not modify this file!",
    accent: SOLAR_GOLD,
  },
  {
    id: "initrd",
    number: "9",
    text: 'boot.initrd.availableKernelModules = [ "xhci_pci" "nvme" ... ];',
    accent: NEUTRAL_BLUE,
  },
  {
    id: "kernel",
    number: "11",
    text: 'boot.kernelModules = [ "kvm-intel" ];',
    accent: HOT_PINK,
  },
  {
    id: "fs-root",
    number: "14",
    text: 'fileSystems."/" = { fsType = "ext4"; ... };',
    accent: HOT_PINK,
  },
  {
    id: "platform",
    number: "38",
    text: "hardware.cpu.intel.updateMicrocode = lib.mkDefault ...;",
    accent: NEOVIM_GREEN,
  },
];

const AMD_LINES: CodeLine[] = [
  {
    id: "video",
    number: "3",
    text: 'services.xserver.videoDrivers = [ "amdgpu" ];',
    accent: NIX_ORANGE,
  },
  {
    id: "microcode",
    number: "4",
    text: "hardware.cpu.amd.updateMicrocode = true;",
    accent: HOT_PINK,
  },
  {
    id: "opencl",
    number: "7",
    text: "hardware.graphics.extraPackages = [ rocmPackages.clr.icd ];",
    accent: NEOVIM_GREEN,
  },
];

const INTEL_LINES: CodeLine[] = [
  {
    id: "video",
    number: "3",
    text: 'services.xserver.videoDrivers = [ "nvidia" ];',
    accent: HOT_PINK,
  },
  {
    id: "microcode",
    number: "4",
    text: "hardware.cpu.intel.updateMicrocode = true;",
    accent: SOLAR_GOLD,
  },
  {
    id: "nvidia",
    number: "7",
    text: "hardware.nvidia = { modesetting.enable = true; ... };",
    accent: NEUTRAL_BLUE,
  },
];

const QUIRKS_LINES: CodeLine[] = [
  {
    id: "import",
    number: "3",
    text: "imports = [ ../../audiofix.nix ];",
    accent: SOLAR_GOLD,
  },
  {
    id: "usb",
    number: "6",
    text: '  "usbcore.autosuspend=-1"',
    accent: HOT_PINK,
  },
  {
    id: "pcie",
    number: "7",
    text: '  "pcie_aspm=off"',
    accent: HOT_PINK,
  },
  {
    id: "quirks",
    number: "8",
    text: '  "usbcore.quirks=1038:12e5:k,17ef:..."',
    accent: NEUTRAL_BLUE,
  },
];

const AUDIO_LINES: CodeLine[] = [
  {
    id: "pipewire",
    number: "5",
    text: "services.pipewire = { enable = true; ... };",
    accent: NEOVIM_GREEN,
  },
  {
    id: "clock",
    number: "12",
    text: '"default.clock.rate" = 48000;',
    accent: SOLAR_GOLD,
  },
  {
    id: "quantum",
    number: "14",
    text: '"default.clock.quantum" = 1024;',
    accent: NIX_ORANGE,
  },
  {
    id: "udev",
    number: "29",
    text: "services.udev.extraRules = '' ... '';",
    accent: HOT_PINK,
  },
];

const GENERATED_SUMMARY_LINES: CodeLine[] = [
  GENERATED_WORK[0],
  GENERATED_PC[1],
  GENERATED_PC[2],
  GENERATED_PC[4],
];

const STABILITY_LINES: CodeLine[] = [
  QUIRKS_LINES[0],
  QUIRKS_LINES[1],
  AUDIO_LINES[0],
  AUDIO_LINES[1],
];

const GENERATED_FACTS: FactChip[] = [
  { id: "initrd", label: "initrd", accent: NEUTRAL_BLUE },
  { id: "disks", label: "disk uuids", accent: HOT_PINK },
  { id: "fs", label: "filesystems", accent: NIX_ORANGE },
  { id: "platform", label: "platform", accent: NEOVIM_GREEN },
];

const MANUAL_CHOICES: FactChip[] = [
  { id: "amd", label: "AMD graphics", accent: NIX_ORANGE },
  { id: "opencl", label: "OpenCL", accent: NEOVIM_GREEN },
  { id: "nvidia", label: "NVIDIA", accent: HOT_PINK },
  { id: "microcode", label: "microcode", accent: SOLAR_GOLD },
  { id: "usb", label: "USB quirks", accent: NEUTRAL_BLUE },
  { id: "audio", label: "audio stability", accent: HOT_PINK },
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
      transform: `translateY(${mix(18, 0, reveal)}px) scale(${mix(
        0.94,
        mix(0.96, 1.04, emphasis),
        reveal,
      )})`,
      opacity: clamp01(reveal * 1.08) * mix(0.38, 1, emphasis),
      borderRadius: 28,
      minHeight: fontSize * 2.2,
      padding: `${fontSize * 0.5}px ${fontSize * 0.7}px`,
      background:
        emphasis > 0.72
          ? `linear-gradient(145deg, ${accent}16, rgba(14,10,34,0.95))`
          : "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(14,10,34,0.92))",
      border: `1px solid ${accent}${emphasis > 0.72 ? "34" : "14"}`,
      boxShadow:
        emphasis > 0.72 ? `0 0 18px ${accent}16` : `0 0 8px ${accent}08`,
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
        transform: `translate(-50%, -50%) translateY(${mix(48, 0, reveal)}px) rotate(${mix(
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
        top: "7%",
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

const CodeCard = ({
  rect,
  reveal,
  host,
  fileLabel,
  accent,
  lines,
  headerTone,
  codeSize,
  tilt = 0,
  zIndex,
}: {
  rect: Rect;
  reveal: number;
  host: string;
  fileLabel: string;
  accent: string;
  lines: CodeLine[];
  headerTone: "cold" | "hot";
  codeSize: number;
  tilt?: number;
  zIndex: number;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={tilt} zIndex={zIndex}>
    <GlassCard
      style={{
        height: "100%",
        padding: 0,
        borderRadius: 42,
        background:
          headerTone === "cold"
            ? "linear-gradient(145deg, rgba(10,8,30,0.97), rgba(18,14,38,0.94))"
            : "linear-gradient(145deg, rgba(8,6,28,0.98), rgba(26,10,56,0.96))",
        border:
          headerTone === "cold"
            ? "1px solid rgba(255,255,255,0.12)"
            : `1px solid ${accent}28`,
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
              headerTone === "cold"
                ? "radial-gradient(circle at 82% 16%, rgba(127,232,255,0.08), transparent 24%), radial-gradient(circle at 18% 12%, rgba(255,255,255,0.04), transparent 26%)"
                : `radial-gradient(circle at 18% 12%, ${accent}18, transparent 24%), radial-gradient(circle at 84% 18%, rgba(127,232,255,0.08), transparent 22%)`,
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
              fontSize: codeSize * 0.64,
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
              width: codeSize * 1.26,
              height: codeSize * 1.26,
              borderRadius: codeSize * 0.26,
              background: `${accent}14`,
              border: `1px solid ${accent}34`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileIcon color={accent} />
          </div>
          <div>
            <div
              style={{
                fontSize: codeSize * 0.52,
                lineHeight: 0.9,
                color: MUTED_TEXT,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: codeSize * 0.2,
              }}
            >
              host
            </div>
            <div
              style={{
                fontSize:
                  host.length >= 6
                    ? codeSize * 1.1
                    : host.length >= 4
                      ? codeSize * 1.28
                      : codeSize * 1.44,
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
            gap: codeSize * 0.2,
          }}
        >
          {lines.map((line) => (
            <div
              key={line.id}
              style={{
                borderRadius: codeSize * 0.28,
                padding: `${codeSize * 0.16}px ${codeSize * 0.22}px`,
                background:
                  headerTone === "cold"
                    ? "rgba(255,255,255,0.018)"
                    : `linear-gradient(90deg, ${line.accent ?? accent}14, rgba(255,255,255,0.02))`,
                border:
                  headerTone === "cold"
                    ? "1px solid rgba(255,255,255,0.06)"
                    : `1px solid ${(line.accent ?? accent) + "30"}`,
                display: "grid",
                gridTemplateColumns: `${rect.width * 0.08}px 1fr`,
                gap: codeSize * 0.18,
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

const CategoryBoard = ({
  rect,
  reveal,
  title,
  label,
  accent,
  children,
  zIndex,
}: {
  rect: Rect;
  reveal: number;
  title: string;
  label: string;
  accent: string;
  children: ReactNode;
  zIndex: number;
}) => (
  <SceneCard rect={rect} reveal={reveal} tilt={0} zIndex={zIndex}>
    <GlassCard
      style={{
        height: "100%",
        padding: "30px 32px",
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
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 16% 12%, ${accent}14, transparent 26%)`,
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
            marginBottom: 12,
          }}
        >
          {label}
        </div>
        <div
          style={{
            position: "relative",
            fontSize: 94,
            lineHeight: 0.84,
            fontWeight: 800,
            color: SOFT_WHITE,
            marginBottom: 24,
          }}
        >
          {title}
        </div>
        <div style={{ position: "relative", flex: 1 }}>{children}</div>
      </div>
    </GlassCard>
  </SceneCard>
);

export const CurrentSetupScene8 = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const scaleValue = (value: number) => value * (width / BASE_WIDTH);

  const stage = {
    width: scaleValue(3080),
    height: scaleValue(1180),
    paddingX: scaleValue(118),
    paddingY: scaleValue(84),
  };

  const openingPcPresence = presenceBetween(frame, 0, 24, 92, 118);
  const openingLaptopPresence = presenceBetween(frame, 104, 130, 206, 234);
  const openingWorkPresence = presenceBetween(frame, 220, 246, 320, 348);
  const openingPresence = Math.max(
    openingPcPresence,
    openingLaptopPresence,
    openingWorkPresence,
  );
  const splitPresence = progressBetween(frame, 320, 368);

  const openingReveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 118, mass: 0.96 },
  });

  const splitReveal = spring({
    fps,
    frame: frame - 304,
    config: { damping: 18, stiffness: 120, mass: 0.96 },
  });

  const generatedTitleOpacity = presenceBetween(frame, 18, 44, 256, 288);
  const manualTitleOpacity = presenceBetween(frame, 394, 426, 770, 804);
  const finalTitleOpacity = progressBetween(frame, 856, 892);

  const amdCardPresence = presenceBetween(frame, 392, 420, 520, 548);
  const intelCardPresence = presenceBetween(frame, 530, 558, 676, 706);
  const stabilityCardPresence = presenceBetween(frame, 692, 722, 1060, 1096);

  const openingMainRect: Rect = {
    x: stage.width * 0.5,
    y: stage.height * 0.58,
    width: stage.width * 0.58,
    height: stage.height * 0.58,
  };

  const generatedBoardRect: Rect = {
    x: stage.width * 0.25,
    y: stage.height * 0.58,
    width: stage.width * 0.34,
    height: stage.height * 0.72,
  };

  const generatedSummaryRect: Rect = {
    x: generatedBoardRect.width * 0.5,
    y: generatedBoardRect.height * 0.6,
    width: generatedBoardRect.width * 0.84,
    height: generatedBoardRect.height * 0.44,
  };

  const manualBoardRect: Rect = {
    x: stage.width * 0.74,
    y: stage.height * 0.58,
    width: stage.width * 0.46,
    height: stage.height * 0.72,
  };

  const manualFocusRect: Rect = {
    x: manualBoardRect.width * 0.5,
    y: manualBoardRect.height * 0.6,
    width: manualBoardRect.width * 0.88,
    height: manualBoardRect.height * 0.5,
  };

  const stageFloat = Math.sin(frame / 42) * scaleValue(8);
  const openingCodeSize = scaleValue(31);
  const generatedSummaryCodeSize = scaleValue(26);
  const manualFocusCodeSize = scaleValue(29);

  const openingAccent =
    openingWorkPresence > Math.max(openingPcPresence, openingLaptopPresence)
      ? HOT_PINK
      : openingLaptopPresence > openingPcPresence
        ? SOLAR_GOLD
        : NEUTRAL_BLUE;

  const manualAccent =
    intelCardPresence > Math.max(amdCardPresence, stabilityCardPresence)
      ? HOT_PINK
      : stabilityCardPresence > amdCardPresence
        ? NEOVIM_GREEN
        : NIX_ORANGE;

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
            text="generated hardware facts"
            color={SOFT_WHITE}
            opacity={generatedTitleOpacity}
          />
          <OverlayTitle
            text="manual hardware choices"
            color={HOT_PINK}
            opacity={manualTitleOpacity}
          />
          <OverlayTitle
            text="facts stay generated"
            color={SOLAR_GOLD}
            opacity={finalTitleOpacity}
          />

          <div style={{ opacity: openingPresence }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "56%",
                width: scaleValue(1860),
                height: scaleValue(760),
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${openingAccent}18, transparent 68%)`,
                filter: `blur(${scaleValue(26)}px)`,
                opacity: openingPresence * 0.95,
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "20%",
                transform: "translateX(-50%)",
                width: scaleValue(1260),
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: scaleValue(22),
                zIndex: 16,
              }}
            >
              <Chip
                label="pc"
                accent={NEUTRAL_BLUE}
                reveal={openingPresence}
                fontSize={scaleValue(34)}
                emphasis={mix(0.32, 1, openingPcPresence)}
              />
              <Chip
                label="laptop"
                accent={SOLAR_GOLD}
                reveal={openingPresence}
                fontSize={scaleValue(34)}
                emphasis={mix(0.32, 1, openingLaptopPresence)}
              />
              <Chip
                label="work"
                accent={HOT_PINK}
                reveal={openingPresence}
                fontSize={scaleValue(34)}
                emphasis={mix(0.32, 1, openingWorkPresence)}
              />
            </div>

            <CodeCard
              rect={openingMainRect}
              reveal={openingReveal * openingPcPresence}
              host="pc"
              fileLabel="hardware-configuration.nix"
              accent={NEUTRAL_BLUE}
              lines={GENERATED_PC}
              headerTone="cold"
              codeSize={openingCodeSize}
              tilt={-0.35}
              zIndex={10}
            />
            <CodeCard
              rect={openingMainRect}
              reveal={openingReveal * openingLaptopPresence}
              host="laptop"
              fileLabel="hardware-configuration.nix"
              accent={SOLAR_GOLD}
              lines={GENERATED_LAPTOP}
              headerTone="cold"
              codeSize={openingCodeSize}
              zIndex={11}
            />
            <CodeCard
              rect={openingMainRect}
              reveal={openingReveal * openingWorkPresence}
              host="work"
              fileLabel="hardware-configuration.nix"
              accent={HOT_PINK}
              lines={GENERATED_WORK}
              headerTone="cold"
              codeSize={openingCodeSize}
              tilt={0.35}
              zIndex={12}
            />
          </div>

          <div style={{ opacity: splitPresence }}>
            <CategoryBoard
              rect={generatedBoardRect}
              reveal={splitReveal * splitPresence}
              title="generated"
              label="hardware facts"
              accent={NEUTRAL_BLUE}
              zIndex={12}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "6%",
                    transform: "translateX(-50%)",
                    width: "84%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  {GENERATED_FACTS.map((chip, index) => {
                    const reveal =
                      spring({
                        frame: frame - (408 + index * 10),
                        fps,
                        config: { damping: 18, stiffness: 122, mass: 0.96 },
                      }) * splitPresence;
                    return (
                      <Chip
                        key={chip.id}
                        label={chip.label}
                        accent={chip.accent}
                        reveal={reveal}
                        fontSize={scaleValue(30)}
                      />
                    );
                  })}
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "54%",
                    width: "94%",
                    height: "52%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: scaleValue(220),
                    background:
                      "radial-gradient(circle, rgba(127,232,255,0.12), transparent 68%)",
                    filter: `blur(${scaleValue(18)}px)`,
                    opacity: splitPresence * 0.9,
                  }}
                />

                <CodeCard
                  rect={generatedSummaryRect}
                  reveal={splitReveal * splitPresence}
                  host="generated"
                  fileLabel="hardware-configuration.nix"
                  accent={NEUTRAL_BLUE}
                  lines={GENERATED_SUMMARY_LINES}
                  headerTone="cold"
                  codeSize={generatedSummaryCodeSize}
                  tilt={-0.2}
                  zIndex={7}
                />
              </div>
            </CategoryBoard>

            <CategoryBoard
              rect={manualBoardRect}
              reveal={splitReveal * splitPresence}
              title="manual"
              label="hardware choices"
              accent={HOT_PINK}
              zIndex={13}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "3%",
                    right: "3%",
                    top: "1%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 14,
                  }}
                >
                  {MANUAL_CHOICES.map((chip, index) => {
                    const reveal =
                      spring({
                        frame: frame - (462 + index * 8),
                        fps,
                        config: { damping: 18, stiffness: 122, mass: 0.96 },
                      }) * splitPresence;
                    return (
                      <Chip
                        key={chip.id}
                        label={chip.label}
                        accent={chip.accent}
                        reveal={reveal}
                        fontSize={scaleValue(26)}
                        emphasis={
                          chip.id === "amd" || chip.id === "opencl"
                            ? mix(0.28, 1, amdCardPresence)
                            : chip.id === "nvidia" || chip.id === "microcode"
                              ? mix(0.28, 1, intelCardPresence)
                              : mix(0.28, 1, stabilityCardPresence)
                        }
                      />
                    );
                  })}
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "61%",
                    width: "94%",
                    height: "56%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: scaleValue(260),
                    background: `radial-gradient(circle, ${manualAccent}18, transparent 68%)`,
                    filter: `blur(${scaleValue(22)}px)`,
                    opacity: splitPresence * 0.95,
                  }}
                />

                <CodeCard
                  rect={manualFocusRect}
                  reveal={splitReveal * splitPresence * amdCardPresence}
                  host="pc + laptop"
                  fileLabel="hardware-amd.nix"
                  accent={NIX_ORANGE}
                  lines={AMD_LINES}
                  headerTone="hot"
                  codeSize={manualFocusCodeSize}
                  tilt={-0.25}
                  zIndex={10}
                />
                <CodeCard
                  rect={manualFocusRect}
                  reveal={splitReveal * splitPresence * intelCardPresence}
                  host="work"
                  fileLabel="hardware-intel.nix"
                  accent={HOT_PINK}
                  lines={INTEL_LINES}
                  headerTone="hot"
                  codeSize={manualFocusCodeSize}
                  tilt={0.2}
                  zIndex={11}
                />
                <CodeCard
                  rect={manualFocusRect}
                  reveal={splitReveal * splitPresence * stabilityCardPresence}
                  host="stability"
                  fileLabel="peripheral-quirks.nix + audiofix.nix"
                  accent={NEOVIM_GREEN}
                  lines={STABILITY_LINES}
                  headerTone="hot"
                  codeSize={manualFocusCodeSize}
                  tilt={-0.12}
                  zIndex={12}
                />
              </div>
            </CategoryBoard>
          </div>
        </div>

        <SceneProgressBar colors={["#ff5da2", "#8affcf"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
