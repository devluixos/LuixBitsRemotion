import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import atopileScreenshot from "../../assets/atopile.png";
import { SceneProgressBar } from "../../components/SceneProgressBar";
import { TextInfoCard } from "../../components/TextInfoCard";
import { InfoMediaPanel, type InfoMediaContent } from "../../components/InfoMediaPanel";
import { GlassCard } from "../../components/GlassCard";
import { SplitPanel } from "../../components/SplitPanel";
import { VaporwaveBackground } from "../../VaporwaveBackground";

const SEGMENT_DURATIONS = [330, 510, 240, 450]; // 11s, 17s, 8s, 15s @30fps

type Segment = {
  title: string;
  body: ReactNode[];
  right: InfoMediaContent;
};

const Highlight: React.FC<{ children: ReactNode }> = ({ children }) => (
  <span
    style={{
      background:
        "linear-gradient(120deg, rgba(255,93,162,0.35), rgba(138,255,247,0.35))",
      borderRadius: 12,
      padding: "2px 10px",
      color: "#fff",
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);

const SEGMENTS: Segment[] = [
  {
    title: "Overlay injection fixes atopile",
    body: [
      <>
        <Highlight>nixpkgs.overlays</Highlight> injects{" "}
        <Highlight>nixvim.overlays.default</Highlight> first so{" "}
        <Highlight>pkgs</Highlight> starts with the Neovim toolchain baked in.
      </>,
      <>
        Skipping it makes nixvim LSP modules fetch <Highlight>atopile</Highlight>,
        then the evaluation dies before Home Manager even runs.
      </>,
      <>
        This segment describes the <Highlight>"atopile not found"</Highlight>{" "}
        failure that kicked everything off.
      </>,
    ],
    right: {
      kind: "error",
      lines: [
        "❌ error: package 'atopile' not found in pkgs",
        "hint: add nixvim overlay or stub atopile",
        "context: nixos-rebuild switch on nixos-25.05",
      ],
    },
  },
  {
    title: "Overlay snippet inside configuration.nix",
    body: [
      <>
        The overlay ships nixvim packages and a{" "}
        <Highlight>placeholder atopile binary</Highlight> so stable channels keep evaluating.
      </>,
      <>
        Replace the stub with the real package once{" "}
        <Highlight>nixos-25.05</Highlight> picks it up.
      </>,
      <>
        Keep this overlay near the top so any downstream modules inherit the fake binary.
      </>,
    ],
    right: {
      kind: "code",
      code: `nixpkgs.overlays = [
  inputs.nixvim.overlays.default
  (final: prev: {
    atopile = prev.writeShellScriptBin "atopile" ''
      echo "Atopile placeholder; real package not available on this channel."
    '';
  })
];`,
    },
  },
  {
    title: "Alternative fix (didn’t work here)",
    body: [
      <>
        I also tried the fix shown on the right—dropping a manual package
        override through <Highlight>nixpkgs.config</Highlight>—but the evaluation
        still failed on my host.
      </>,
      <>
        If you have a better approach,{" "}
        <Highlight>leave a comment</Highlight>; for now the overlay + stub combo
        is the reliable path.
      </>,
    ],
    right: {
      kind: "image",
      src: atopileScreenshot,
      alt: "Attempted nixpkgs.config override screenshot",
      caption: "Attempted nixpkgs.config override (screenshot)",
    },
  },
  {
    title: "What configuration.nix still owns",
    body: [
      <>
        <Highlight>environment.systemPackages</Highlight> is trimmed down to
        globally required tools only.
      </>,
      <>
        User apps, shells, prompts, and themes moved into{" "}
        <Highlight>Home Manager</Highlight> to keep the host lean.
      </>,
    ],
    right: {
      kind: "compare",
      columns: [
        {
          title: "Stay in configuration.nix",
          items: [
            "DaVinci Resolve Studio",
            "Star Citizen & proton tooling",
            "Hardware modules + services",
            "Display + audio drivers",
          ],
        },
        {
          title: "Move to Home Manager",
          items: [
            <>
              <Highlight>programs.git.enable</Highlight> = true;
            </>,
            <>
              <Highlight>programs.tmux.enable</Highlight> = true;
            </>,
            <>
              <Highlight>programs.neovim.enable</Highlight> = true;
            </>,
            <>
              <Highlight>programs.neovim.defaultEditor</Highlight> = true;
            </>,
            <>
              <Highlight>home.packages</Highlight> = with pkgs; [ yazi ];
            </>,
          ],
        },
      ],
    },
  },
];

export const SystemConfigScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (durationInFrames !== SEGMENT_DURATIONS.reduce((a, b) => a + b, 0)) {
    console.warn(
      "SystemConfigScene duration doesn't match defined segments; adjust composition length.",
    );
  }

  let accumulated = 0;
  let activeIndex = 0;
  for (let i = 0; i < SEGMENT_DURATIONS.length; i++) {
    if (frame >= accumulated && frame < accumulated + SEGMENT_DURATIONS[i]) {
      activeIndex = i;
      break;
    }
    accumulated += SEGMENT_DURATIONS[i];
  }

  const segmentStart = SEGMENT_DURATIONS.slice(0, activeIndex).reduce(
    (sum, dur) => sum + dur,
    0,
  );
  const segmentEnd = segmentStart + SEGMENT_DURATIONS[activeIndex];
  const fade = interpolate(
    frame,
    [segmentStart, segmentStart + 12, segmentEnd - 12, segmentEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const activeSegment = SEGMENTS[activeIndex];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />
      <AbsoluteFill
        style={{
          padding: "4%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SplitPanel
          gap={36}
          style={{
            width: "100%",
            height: "100%",
            opacity: fade,
            transition: "opacity 0.3s ease-out",
          }}
          left={
            <GlassCard>
              <TextInfoCard title={activeSegment.title} items={activeSegment.body} />
            </GlassCard>
          }
          right={<InfoMediaPanel content={activeSegment.right} />}
        />
        <SceneProgressBar />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
