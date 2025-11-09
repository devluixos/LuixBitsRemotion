import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Terminal, TerminalLine } from "../Terminal";
import { VaporwaveBackground } from "../VaporwaveBackground";

const TERMINAL_LINES: TerminalLine[] = [
  {
    prompt: "λ nixos@luix ~",
    text: "nix flake update",
    startFrame: 15,
    mode: "type",
  },
  {
    prompt: "λ nixos@luix ~",
    text: "home-manager switch --flake .#atlas",
    startFrame: 120,
    mode: "type",
  },
  {
    prompt: "",
    text: "✔ build completed in 18.4s",
    startFrame: 300,
    mode: "paste",
  },
  {
    prompt: "",
    text: "✔ activating user environment",
    startFrame: 360,
    mode: "paste",
  },
  {
    prompt: "",
    text: "✔ done. happy hacking!",
    startFrame: 420,
    mode: "type",
    speed: 4,
  },
];

export const TerminalScene = () => {
  const frame = useCurrentFrame();
  const float = interpolate(frame, [0, 120], [0, 16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "extend",
    easing: Easing.inOut(Easing.sin),
  });

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
        <div
          style={{
            width: "92%",
            height: "85%",
            transform: `translateY(${float}px)`,
          }}
        >
          <Terminal lines={TERMINAL_LINES} fontSize={64} promptWidth={480} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
