/*
 * Layout checklist:
 * - 3440x1440 scale: +20-30% sizes
 * - No overlaps; keep safe margins
 * - Labels readable on mobile
 * - Tags/lines sit below icon baselines
 * - Recenter remaining element after fades
 * - Keep the sun bright; avoid heavy scrims
 */

import type { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { GlassCard } from "../../components/GlassCard";
import { SplitPanel } from "../../components/SplitPanel";
import { TextInfoCard } from "../../components/TextInfoCard";
import { InfoMediaPanel } from "../../components/InfoMediaPanel";
import { SceneProgressBar } from "../../components/SceneProgressBar";
import { ModuleGrid } from "../../components/ModuleGrid";

const Highlight: React.FC<{ children: ReactNode }> = ({ children }) => (
  <span
    style={{
      background:
        "linear-gradient(120deg, rgba(255,93,162,0.35), rgba(138,255,247,0.35))",
      borderRadius: 12,
      padding: "2px 8px",
      color: "#fff",
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);

const BULLET_SEGMENTS: ReactNode[][] = [
  [
    <>
      <Highlight>home/luix/default.nix</Highlight> is the single entrypoint for
      every user tweak.
    </>,
    <>
      <Highlight>home.username</Highlight>, <Highlight>home.homeDirectory</Highlight>,
      and <Highlight>stateVersion</Highlight> now live in Home Manager, not the host.
    </>,
    <>
      <Highlight>allowUnfree</Highlight> flips on at the user layer so the flake stays clean.
    </>,
  ],
  [
    <>
      <Highlight>xdg.enable</Highlight> + <Highlight>fonts.fontconfig.enable</Highlight>{" "}
      make caches and fonts follow the user profile.
    </>,
    <>
      <Highlight>~/.nix-profile</Highlight> is force-linked to each generation so apps stay on{" "}
      <Highlight>PATH</Highlight>.
    </>,
    <>
      <Highlight>targets.genericLinux</Highlight> keeps this same profile deployable on other hosts.
    </>,
    <>
      The <Highlight>imports</Highlight> list fans out to reusable modules; hardware + services stay in{" "}
      <Highlight>/etc/nixos</Highlight>.
    </>,
    <>
      <Highlight>home.packages</Highlight> is reserved for user apps so{" "}
      <Highlight>environment.systemPackages</Highlight> can stay tiny.
    </>,
  ],
];

const SNIPPET_SEGMENTS = [
  `nixpkgs.config.allowUnfree = true;

home.username = "luix";
home.homeDirectory = "/home/luix";
home.stateVersion = "25.05";`,
  `xdg.enable = true;
fonts.fontconfig.enable = true;

home.profileDirectory = "~/.nix-profile";
home.sessionPath = [ "~/.nix-profile/bin" ];
targets.genericLinux.enable = true;

imports = [
  ./modules/base.nix
  ./modules/applications.nix
  ./modules/cli.nix
  ./modules/media.nix
  ./modules/programming.nix
  ./modules/kitty.nix
  ./modules/nixvim.nix
  ./modules/buildandpush.nix
  ./modules/zsh.nix
];`,
];

const MODULES = [
  "base.nix",
  "applications.nix",
  "cli.nix",
  "media.nix",
  "programming.nix",
  "kitty.nix",
  "nixvim.nix",
  "buildandpush.nix",
  "zsh.nix",
];

const SEGMENT_DURATION_FRAMES = [360, 720, 300]; // 12s intro, 24s details, 10s modules

export const HomeManagerScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const expectedDuration = SEGMENT_DURATION_FRAMES.reduce(
    (sum, val) => sum + val,
    0,
  );
  if (durationInFrames !== expectedDuration) {
    console.warn("HomeManagerScene expects", expectedDuration, "frames.");
  }

  let accumulated = 0;
  let segmentIndex = 0;
  for (let i = 0; i < SEGMENT_DURATION_FRAMES.length; i++) {
    if (frame >= accumulated && frame < accumulated + SEGMENT_DURATION_FRAMES[i]) {
      segmentIndex = i;
      break;
    }
    accumulated += SEGMENT_DURATION_FRAMES[i];
  }

  const segmentStart = SEGMENT_DURATION_FRAMES.slice(0, segmentIndex).reduce(
    (sum, dur) => sum + dur,
    0,
  );
  const segmentEnd = segmentStart + SEGMENT_DURATION_FRAMES[segmentIndex];
  const fade = interpolate(
    frame,
    [segmentStart, segmentStart + 10, segmentEnd - 10, segmentEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

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
            width: "100%",
            height: "90%",
            gap: 32,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {segmentIndex <= 1 ? (
            <div style={{ opacity: fade }}>
              <SplitPanel
                gap={36}
                left={
                  <GlassCard>
                    <TextInfoCard
                      title="Home Manager layout"
                      items={BULLET_SEGMENTS[segmentIndex]}
                    />
                  </GlassCard>
                }
                right={
                  <InfoMediaPanel
                    content={{
                      kind: "code",
                      code: SNIPPET_SEGMENTS[segmentIndex],
                    }}
                  />
                }
              />
            </div>
          ) : null}

          {segmentIndex === 2 ? (
            <div style={{ opacity: fade }}>
              <GlassCard
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 24,
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(32px, 2.8vw, 58px)",
                    fontWeight: 600,
                    color: "#ffd8ff",
                    letterSpacing: 2,
                  }}
                >
                  Reusable module stack
                </div>
                <ModuleGrid modules={MODULES} columns={3} />
              </GlassCard>
            </div>
          ) : null}
        </div>
        <SceneProgressBar />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
