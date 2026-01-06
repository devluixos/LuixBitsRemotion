/*
 * Layout checklist:
 * - 3440x1440 scale: +20-30% sizes
 * - No overlaps; keep safe margins
 * - Labels readable on mobile
 * - Tags/lines sit below icon baselines
 * - Recenter remaining element after fades
 * - Keep the sun bright; avoid heavy scrims
 */

import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { GlassCard } from "../../components/GlassCard";
import { SceneProgressBar } from "../../components/SceneProgressBar";
import { TextInfoCard } from "../../components/TextInfoCard";

export const BRINGING_SCENE_DURATION = 510; // 17 seconds @ 30fps

type TreeNode = {
  label: string;
  meta?: string;
  children?: TreeNode[];
};

const ARCHITECTURE_TREE: TreeNode[] = [
  {
    label: "home/",
    children: [
      {
        label: "luix/",
        children: [{ label: "default.nix" }],
      },
      {
        label: "modules/",
        children: [
          { label: "base.nix" },
          { label: "applications.nix" },
          { label: "cli.nix" },
          { label: "media.nix" },
          { label: "programming.nix" },
          { label: "kitty.nix" },
          { label: "nixvim.nix" },
          { label: "buildandpush.nix" },
          { label: "zsh.nix" },
        ],
      },
    ],
  },
  { label: "configuration.nix" },
  { label: "hardware-configuration.nix" },
  { label: "flake.nix" },
  { label: "flake.lock" },
];

const SUMMARY_ITEMS = [
  <>
    <strong style={{ color: "#ffd8ff" }}>Unified flake</strong> wires NixOS +
    Home Manager so one repo owns the entire host.
  </>,
  <>
    <strong style={{ color: "#8afff7" }}>Module boundaries</strong> keep Kitty,
    Zsh, media, and apps isolated from <code>/etc/nixos</code>.
  </>,
  <>
    <strong style={{ color: "#ffb86c" }}>Fast rebuilds</strong> happen from
    <code>~/luix_nix_config</code>; deploy only when the audio section says it’s
    time.
  </>,
];

const TreeBranch: React.FC<{ nodes: TreeNode[]; depth?: number }> = ({
  nodes,
  depth = 0,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: depth <= 1 ? 24 : 16,
        marginLeft: depth === 0 ? 0 : 28,
        borderLeft:
          depth === 0 ? "none" : "1px dashed rgba(255,255,255,0.18)",
        paddingLeft: depth === 0 ? 0 : 24,
      }}
    >
      {nodes.map((node, index) => {
        const delay = depth * 8 + index * 6;
        const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const translateY = interpolate(
          frame,
          [delay, delay + 12],
          [18, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );

        return (
          <div
            key={`${node.label}-${index}`}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.5)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(16px, 1.8vw, 28px)",
                  color: depth === 0 ? "#ffbef8" : "#8afff7",
                }}
              >
                {depth === 0 ? "~" : depth === 1 ? "▸" : "∙"}
              </span>
              <div
                style={{
                  fontSize:
                    depth === 0
                      ? "clamp(42px, 3.2vw, 74px)"
                      : "clamp(30px, 2.4vw, 54px)",
                  fontWeight: depth <= 1 ? 600 : 400,
                  color: "#fff5ff",
                  lineHeight: 1.2,
                }}
              >
                {node.label}
              </div>
            </div>
            {node.children ? (
              <TreeBranch nodes={node.children} depth={depth + 1} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export const BringingItTogetherScene = () => {
  return (
    <AbsoluteFill>
      <VaporwaveBackground variant="grid" />
      <AbsoluteFill
        style={{
          padding: "80px 150px",
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 40,
            height: "100%",
          }}
        >
          <GlassCard
            style={{
              flex: 0.58,
              padding: "56px 60px",
              display: "flex",
              flexDirection: "column",
              gap: 32,
              boxShadow: "0 35px 120px rgba(4,0,24,0.55)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(68px, 5.2vw, 122px)",
                fontWeight: 800,
                color: "#ffe7ff",
                letterSpacing: 2,
              }}
            >
              Bringing it all together
            </div>
            <div
              style={{
                fontSize: "clamp(30px, 2.6vw, 52px)",
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.4,
              }}
            >
              Final repo layout that powers both NixOS and Home Manager.
            </div>
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                paddingTop: 16,
              }}
            >
              <TreeBranch nodes={ARCHITECTURE_TREE} />
            </div>
          </GlassCard>

          <GlassCard
            style={{
              flex: 0.42,
              padding: "32px 56px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextInfoCard
              title={
                <>
                  System + Home <span style={{ color: "#8afff7" }}>pipeline</span>
                </>
              }
              items={SUMMARY_ITEMS}
              markerColor="#ffd580"
              gap={36}
              style={{
                paddingTop: 10,
                paddingBottom: 0,
              }}
            />
          </GlassCard>
        </div>
        <SceneProgressBar />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
