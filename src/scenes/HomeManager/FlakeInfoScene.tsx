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
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { FileNode } from "../../VaporwaveInfoPanel";
import { GlassCard } from "../../components/GlassCard";
import { SplitPanel } from "../../components/SplitPanel";
import { SceneProgressBar } from "../../components/SceneProgressBar";

const FLAKE_TREE: FileNode[] = [
  {
    label: "flake.nix",
    meta: "single entrypoint · synced with flake.lock",
    children: [
      {
        label: "inputs/",
        meta: "all the external package sets",
        children: [
          {
            label: "nixpkgs (nixos-25.05)",
            meta: "system base + kernel",
          },
          {
            label: "nixpkgs-unstable",
            meta: "feeds nixvim for fresh plugins",
          },
          {
            label: "home-manager (release-25.05)",
            meta: "user-level config",
          },
          {
            label: "nixvim",
            meta: "neovim module + overlay",
          },
          {
            label: "nix-gaming",
            meta: "star citizen + proton tweaks",
          },
          {
            label: "nix-citizen",
          },
        ],
      },
      {
        label: "outputs/",
        meta: "wired into nixos-rebuild",
        children: [
          {
            label: "nixosConfigurations.nixos",
            meta: "single host exported as .#nixos",
            children: [
              {
                label: "imports",
                children: [
                  { label: "./configuration.nix", meta: "hardware + services" },
                  {
                    label: "hm.nixosModules.home-manager",
                    meta: "inline HM evaluation",
                  },
                ],
              },
              {
                label: "home-manager.users.luix",
                meta: "import ./home/luix",
              },
              {
                label: "home-manager.extraSpecialArgs",
                meta: "inherit inputs for modules",
              },
              {
                label: "home-manager.backupFileExtension",
                meta: "\"hm-back\" safety copies",
              },
            ],
          },
          {
            label: "packages",
            meta: "system + hm bundles",
          },
        ],
      },
    ],
  },
];

const FLAKE_INPUTS_DETAILS = [
  {
    title: "nixpkgs (nixos-25.05)",
    description: "base system + kernel, keeps host deterministic",
  },
  {
    title: "nixpkgs-unstable",
    description: "feeds nixvim so Neovim plugins stay on the bleeding edge",
  },
  {
    title: "home-manager (release-25.05)",
    description: "user-level config merged inline during nixos-rebuild",
  },
  {
    title: "nixvim",
    description: "flake input providing Neovim module + overlay",
  },
  {
    title: "nix-gaming",
    description: "ships proton tweaks + Star Citizen bits",
  },
  {
    title: "nix-citizen",
    description: "extra Star Citizen tooling layered on top",
  },
];

const HM_POINTS = [
  "Home Manager runs during nixos-rebuild switch via hm.nixosModules.home-manager.",
  "home-manager.useUserPackages = true brings flake pkgs into the user profile.",
  "extraSpecialArgs = { inherit inputs; } shares the exact same inputs blob.",
  'backupFileExtension = "hm-back" keeps a safety copy before HM touches files.',
];

const HM_CODE = `hm.nixosModules.home-manager {
  home-manager.useUserPackages = true;
  home-manager.users.luix = import ./home/luix;
  home-manager.extraSpecialArgs = { inherit inputs; };
  home-manager.backupFileExtension = "hm-back";
};`;

const TreeList: React.FC<{
  nodes: FileNode[];
  depth?: number;
}> = ({ nodes, depth = 0 }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {nodes.map((node, index) => {
        const delay = depth * 10 + index * 6;
        const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div key={`${node.label}-${index}`} style={{ opacity }}>
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                padding: "10px 0",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.4)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(16px, 1.8vw, 26px)",
                  color: "#ffbef8",
                }}
              >
                {depth === 0 ? "~" : depth === 1 ? "▸" : "∙"}
              </span>
              <div>
                <div
                  style={{
                    fontSize: depth === 0
                      ? "clamp(36px, 3vw, 66px)"
                      : "clamp(28px, 2.4vw, 46px)",
                    fontWeight: depth <= 1 ? 600 : 400,
                    color: "#fff5ff",
                    lineHeight: 1.2,
                  }}
                >
                  {node.label}
                </div>
                {node.meta ? (
                  <div
                    style={{
                      fontSize: "clamp(20px, 2vw, 34px)",
                      color: "rgba(255,255,255,0.7)",
                      marginTop: 4,
                    }}
                  >
                    {node.meta}
                  </div>
                ) : null}
              </div>
            </div>
            {node.children ? (
              <div
                style={{
                  marginLeft: 24,
                  borderLeft: "1px dashed rgba(255,255,255,0.2)",
                  paddingLeft: 24,
                }}
              >
                <TreeList nodes={node.children} depth={depth + 1} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const FlakeOverviewSplit = () => (
  <SplitPanel
    gap={36}
    leftFlex={1.05}
    rightFlex={0.9}
    left={
      <GlassCard
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          height: "100%",
        }}
      >
        <div
          style={{
            fontSize: "clamp(42px, 3.5vw, 76px)",
            fontWeight: 700,
            color: "#ffe7ff",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          Flake structure
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: 16,
            maxHeight: "100%",
          }}
        >
          <TreeList nodes={FLAKE_TREE} />
        </div>
      </GlassCard>
    }
    right={
      <GlassCard style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: "clamp(32px, 3vw, 58px)",
            fontWeight: 600,
            color: "#ffd8ff",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Inputs (root flake)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {FLAKE_INPUTS_DETAILS.map((item) => (
            <div
              key={item.title}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(24px, 2.6vw, 46px)",
                  fontWeight: 600,
                  color: "#fef2ff",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: "clamp(20px, 2.2vw, 32px)",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.35,
                }}
              >
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    }
  />
);

const HomeManagerSplit = () => (
  <SplitPanel
    gap={32}
    left={
      <GlassCard style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            fontSize: "clamp(48px, 4vw, 90px)",
            fontWeight: 700,
            color: "#ffe7ff",
            letterSpacing: 2,
            lineHeight: 1.1,
          }}
        >
          Inline Home‑Manager
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          {HM_POINTS.map((point, idx) => (
            <div
              key={point}
              style={{
                display: "flex",
                gap: 18,
                fontSize: "clamp(28px, 2.7vw, 48px)",
                color: "#f6f1ff",
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: ["#ff5da2", "#8afff7", "#ffd580", "#bd9bff"][
                    idx % 4
                  ],
                  boxShadow: "0 0 18px rgba(255,255,255,0.45)",
                  marginTop: 14,
                }}
              />
              <span style={{ flex: 1 }}>{point}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    }
    right={
      <GlassCard style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <p
          style={{
            margin: 0,
            fontSize: "clamp(32px, 2.8vw, 54px)",
            color: "#ffd8ff",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Wiring snippet
        </p>
        <pre
          style={{
            flex: 1,
            borderRadius: 24,
            padding: "26px 32px",
            background: "rgba(4, 0, 12, 0.75)",
            border: "1px solid rgba(255,255,255,0.12)",
            fontSize: "clamp(24px, 2.2vw, 38px)",
            lineHeight: 1.6,
            color: "#f6f1ff",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
          }}
        >
          {HM_CODE}
        </pre>
      </GlassCard>
    }
  />
);

export const FlakeInfoScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phaseDuration = 15 * fps;
  const fadeWindow = 20;

  const flakeOpacity = interpolate(
    frame,
    [phaseDuration - fadeWindow, phaseDuration + fadeWindow],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const hmOpacity = interpolate(
    frame,
    [phaseDuration - fadeWindow, phaseDuration + fadeWindow],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />
      <AbsoluteFill
        style={{
          padding: "2.5% 3%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", height: "92%", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: flakeOpacity,
              transition: "opacity 0.2s ease-out",
            }}
          >
            <FlakeOverviewSplit />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: hmOpacity,
              transition: "opacity 0.2s ease-out",
            }}
          >
            <HomeManagerSplit />
          </div>
        </div>
        <SceneProgressBar />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
