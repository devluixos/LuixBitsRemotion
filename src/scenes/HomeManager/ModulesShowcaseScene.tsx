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
import { GlassCard } from "../../components/GlassCard";
import { SceneProgressBar } from "../../components/SceneProgressBar";
import { SplitPanel } from "../../components/SplitPanel";
import { TextInfoCard } from "../../components/TextInfoCard";
import { CodeBlock } from "../../components/CodeBlock";

export const MODULES_SHOWCASE_DURATION = 2010; // 67 seconds @ 30fps
const PSEUDO_SEGMENT_FRAMES = 630; // 21 seconds
const TRANSITION_FRAMES = 18;

const PSEUDO_CODE = `{ pkgs, lib, ... }:
let
  scriptPath = lib.makeBinPath [ bash git nix nixos-rebuild ... ];

  pushConfigs = writeShellScriptBin "pushconfigs" ''
    read COMMIT_MSG
    define helper_functions()
    function push_repo(dir) { git add/commit/push; sudo fallback via helper }
    main_loop_over_repos()
  '';

  buildall = writeShellScriptBin "buildall" ''
    nix flake update --flake $FLAKE
    sudo nixos-rebuild switch --flake "$FLAKE#$HOST"
    pushconfigs "$MSG"
  '';

  flakeonly = writeShellScriptBin "flakeonly" ''
    nix flake update --flake $FLAKE
    sudo nixos-rebuild switch --flake "$FLAKE#$HOST"
  '';

  pushonly = writeShellScriptBin "pushonly" ''
    exec pushconfigs "$@"
  '';
in {
  home.packages = [ pushConfigs buildall flakeonly pushonly ];
}`;

const PSEUDO_LINES = PSEUDO_CODE.trim().split("\n").length;
const CODE_LINE_HEIGHT = 54; // px, roughly matches CodeBlock line spacing at 1440p
const CODE_VISIBLE_HEIGHT = 1080;
const CODE_EXTRA_PADDING = 160;
const MAX_CODE_SCROLL = Math.max(
  0,
  PSEUDO_LINES * CODE_LINE_HEIGHT + CODE_EXTRA_PADDING - CODE_VISIBLE_HEIGHT,
);

const PSEUDO_SUMMARY_ITEMS = [
  <>
    ship the legacy <strong style={{ color: "#ffd8ff" }}>~/bin scripts</strong>{" "}
    via <code>writeShellScriptBin</code> so they stay version-controlled.
  </>,
  <>
    expose every helper through <strong style={{ color: "#8afff7" }}>home.packages</strong>,
    guaranteeing they land on PATH for any shell.
  </>,
  <>
    standardize <strong>buildall</strong>, <strong>flakeonly</strong>,{" "}
    <strong>pushonly</strong>, and <strong>pushconfigs</strong> for every host.
  </>,
];

const REALITY_CALLOUTS = [
  {
    title: "scriptPath bundles deps",
    detail: "Bash · git · nix · nixos-rebuild · coreutils – shipped together so helpers never rely on random installs.",
  },
  {
    title: "pushconfigs revived",
    detail: "Color logs, walks ~/dotfiles + flake + /etc/nixos, commits staged work, keeps SSH agent alive even through sudo.",
  },
  {
    title: "buildall / flakeonly",
    detail: "Honor CONFIG_FLAKE + CONFIG_HOST, run nix flake update, then sudo nixos-rebuild switch \"${FLAKE}#${HOST}\".",
  },
  {
    title: "pushonly muscle memory",
    detail: "Thin wrapper that just execs pushconfigs so the old alias still works everywhere.",
  },
];

const AnimatedCodePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const scrollProgress = Math.min(frame, PSEUDO_SEGMENT_FRAMES) / PSEUDO_SEGMENT_FRAMES;
  const translateY = -scrollProgress * MAX_CODE_SCROLL;

  return (
    <GlassCard
      style={{
        height: "100%",
        padding: "48px 46px 64px",
        display: "flex",
        flexDirection: "column",
        gap: 26,
      }}
    >
      <div
        style={{
          fontSize: "clamp(46px, 3.8vw, 82px)",
          fontWeight: 700,
          color: "#ffe7ff",
        }}
      >
        Pseudo-code sketch
      </div>
      <div
        style={{
          height: CODE_VISIBLE_HEIGHT,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            transform: `translateY(${translateY}px)`,
            transition: "transform 0.2s linear",
          }}
        >
          <div style={{ paddingBottom: CODE_EXTRA_PADDING }}>
            <CodeBlock code={PSEUDO_CODE} />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const PseudoSegment: React.FC = () => {
  return (
    <SplitPanel
      gap={36}
      leftFlex={0.45}
      rightFlex={0.55}
      left={
        <GlassCard
          style={{
            height: "100%",
            padding: "54px 58px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextInfoCard
            title={
              <>
                buildandpush.nix{" "}
                <span style={{ color: "#8afff7" }}>automation</span>
              </>
            }
            items={PSEUDO_SUMMARY_ITEMS}
            markerColor="#ffb86c"
            gap={32}
            style={{ paddingTop: 0, paddingBottom: 0 }}
          />
        </GlassCard>
      }
      right={
        <AnimatedCodePanel />
      }
    />
  );
};

const SummarySegment: React.FC = () => {
  return (
    <GlassCard
      style={{
        height: "100%",
        padding: "64px 72px",
        display: "flex",
        flexDirection: "column",
        gap: 38,
      }}
    >
      <div
        style={{
          fontSize: "clamp(64px, 5vw, 120px)",
          fontWeight: 800,
          color: "#ffe7ff",
          letterSpacing: 2,
        }}
      >
        What actually happens
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 32,
          flex: 1,
        }}
      >
        {REALITY_CALLOUTS.map((callout) => (
          <div
            key={callout.title}
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 28,
              padding: "28px 32px",
              background:
                "linear-gradient(135deg, rgba(60,0,90,0.55), rgba(255,93,162,0.2))",
              boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                fontSize: "clamp(32px, 3vw, 58px)",
                fontWeight: 700,
                color: "#8afff7",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 14,
              }}
            >
              {callout.title}
            </div>
            <div
              style={{
                fontSize: "clamp(26px, 2.4vw, 44px)",
                color: "#f7f4ff",
                lineHeight: 1.4,
              }}
            >
              {callout.detail}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: "clamp(28px, 2.4vw, 44px)",
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          letterSpacing: 0.5,
          marginTop: 24,
        }}
      >
        Because the scripts live in Home Manager, calling <strong>buildall</strong> or{" "}
        <strong>pushconfigs</strong> from any shell always matches the repo you just edited—no sudo editing spree needed.
      </div>
    </GlassCard>
  );
};

export const ModulesShowcaseScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const showSummary = frame >= PSEUDO_SEGMENT_FRAMES;

  const pseudoOpacity = interpolate(
    frame,
    [PSEUDO_SEGMENT_FRAMES - TRANSITION_FRAMES, PSEUDO_SEGMENT_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const summaryOpacity = interpolate(
    frame,
    [PSEUDO_SEGMENT_FRAMES - 4, PSEUDO_SEGMENT_FRAMES + TRANSITION_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill>
      <VaporwaveBackground variant="grid" />
      <AbsoluteFill
        style={{
          padding: "80px 140px",
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: pseudoOpacity,
              pointerEvents: showSummary ? "none" : "auto",
            }}
          >
            <PseudoSegment />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: summaryOpacity,
              pointerEvents: showSummary ? "auto" : "none",
            }}
          >
            <SummarySegment />
          </div>
        </div>
        <SceneProgressBar
          colors={["#ff5da2", "#9ffcff"]}
          height={16}
          key={durationInFrames}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
