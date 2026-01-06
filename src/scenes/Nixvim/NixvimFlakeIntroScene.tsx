/*
 * Layout checklist:
 * - 3440x1440 scale: +20-30% sizes
 * - No overlaps; keep safe margins
 * - Labels readable on mobile
 * - Tags/lines sit below icon baselines
 * - Recenter remaining element after fades
 * - Keep the sun bright; avoid heavy scrims
 */

import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { SceneProgressBar } from "../../components/SceneProgressBar";
import { Terminal, type TerminalLine } from "../../Terminal";

const FLAKE_LINES: TerminalLine[] = [
  { prompt: "", text: "# inputs", startFrame: 18, mode: "paste" },
  {
    prompt: "",
    text: "nixvim.url = \"github:nix-community/nixvim\";",
    startFrame: 36,
    mode: "paste",
    color: "#8afff7",
    glow: "rgba(138,255,247,0.7)",
  },
  {
    prompt: "",
    text: "nixvim.inputs.nixpkgs.follows = \"nixpkgs\";",
    startFrame: 54,
    mode: "paste",
    color: "#8afff7",
    glow: "rgba(138,255,247,0.7)",
  },
  { prompt: "", text: "", startFrame: 72, mode: "paste" },
  { prompt: "", text: "# outputs", startFrame: 240, mode: "paste" },
  {
    prompt: "",
    text: "outputs = { self, nixvim, ... }@inputs: {",
    startFrame: 258,
    mode: "paste",
    color: "#ffd6ff",
    glow: "rgba(255,214,255,0.7)",
  },
  { prompt: "", text: "};", startFrame: 276, mode: "paste" },
];

export const NIXVIM_FLAKE_INTRO_DURATION = 600;

export const NixvimFlakeIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const settle = spring({
    frame,
    fps,
    damping: 16,
    stiffness: 140,
  });
  const lift = interpolate(settle, [0, 1], [50, 0], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(settle, [0, 1], [0.97, 1], {
    extrapolateRight: "clamp",
  });
  const glowPulse = interpolate(Math.sin(frame / 24), [-1, 1], [0.18, 0.35]);
  const float = Math.sin(frame / 40) * 8;
  const backdropShift = interpolate(frame, [0, 240], [0, 40], {
    extrapolateRight: "extend",
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
      }}
    >
      <VaporwaveBackground />
      <div
        style={{
          position: "absolute",
          inset: "-15%",
          backgroundImage:
            "repeating-linear-gradient(110deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 120px)",
          transform: `translateY(${backdropShift}px)`,
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 70%, rgba(124,255,231,0.08), transparent 55%)",
          opacity: glowPulse,
        }}
      />
      <AbsoluteFill
        style={{
          padding: "6%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "86%",
            height: "96%",
            transform: `translateY(${lift + float}px) scale(${scale})`,
            opacity: settle,
          }}
        >
          <Terminal
            lines={FLAKE_LINES}
            fontSize={58}
            promptWidth={0}
            style={{
              background:
                "linear-gradient(135deg, rgba(10,12,22,0.96), rgba(24,14,32,0.9))",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow:
                "0 40px 120px rgba(4,0,18,0.7), inset 0 0 40px rgba(124,255,231,0.08)",
              padding: "40px 56px",
            }}
          />
        </div>
      </AbsoluteFill>
      <SceneProgressBar />
    </AbsoluteFill>
  );
};
