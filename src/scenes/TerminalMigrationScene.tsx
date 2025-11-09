import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Terminal, TerminalLine } from "../Terminal";
import { VaporwaveBackground } from "../VaporwaveBackground";

const MIGRATION_LINES: TerminalLine[] = [
  {
    prompt: "λ nixos@luix ~",
    text: "mkdir -p ~/luix_nix_config",
    startFrame: 20,
    mode: "type",
  },
  {
    prompt: "λ nixos@luix ~",
    text: "sudo cp -r /etc/nixos/* ~/luix_nix_config/",
    startFrame: 150,
    mode: "type",
  },
  {
    prompt: "λ nixos@luix ~",
    text: "sudo chown -R luix:users ~/luix_nix_config",
    startFrame: 330,
    mode: "type",
  },
  {
    prompt: "λ nixos@luix ~",
    text: "sudo mv /etc/nixos /etc/nixos_backup",
    startFrame: 510,
    mode: "type",
  },
  {
    prompt: "λ nixos@luix ~",
    text: "sudo ln -s ~/luix_nix_config /etc/nixos",
    startFrame: 690,
    mode: "type",
  },
  {
    prompt: "λ nixos@luix ~",
    text: "sudo nixos-rebuild switch",
    startFrame: 870,
    mode: "type",
  },
  {
    prompt: "",
    text: "✔ system rebuild complete — dotfiles now live in ~/luix_nix_config",
    startFrame: 1080,
    mode: "paste",
  },
];

export const TerminalMigrationScene = () => {
  const frame = useCurrentFrame();
  const float = interpolate(frame, [0, 140], [0, 18], {
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
            width: "90%",
            height: "80%",
            transform: `translateY(${float}px)`,
          }}
        >
          <Terminal lines={MIGRATION_LINES} fontSize={66} promptWidth={520} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
