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

export const KITTY_SHOWCASE_DURATION = 1380; // 46 seconds @ 30fps
const PSEUDO_SEGMENT_FRAMES = 600; // first 20 seconds
const TRANSITION_FRAMES = 18;

const PSEUDO_CODE = `{ ... }:
{
  programs.kitty = {
    enable = true;
    font = { name = "MonoLisa Nerd Font"; size = 30; };

    settings = {
      cursor_blink_interval = "0.75";
      tab_title_template = "{index}: {cwd}";
      window_padding_width = 18;
      background_blur = 24;
      notify_on_cmd_finish = "unfocused 10.0 bell";
    };

    extraConfig = ''
      include current-theme.conf
    '';
  };
}`;

const PSEUDO_LINES = PSEUDO_CODE.trim().split("\n").length;
const CODE_LINE_HEIGHT = 52;
const CODE_VISIBLE_HEIGHT = 1080;
const CODE_EXTRA_PADDING = 160;
const MAX_CODE_SCROLL = Math.max(
  0,
  PSEUDO_LINES * CODE_LINE_HEIGHT + CODE_EXTRA_PADDING - CODE_VISIBLE_HEIGHT,
);

const PSEUDO_SUMMARY_ITEMS = [
  <>
    Declarative <strong style={{ color: "#ffd8ff" }}>programs.kitty</strong>{" "}
    block replaces manual edits under <code>~/.config/kitty</code>.
  </>,
  <>
    Fonts, keybinds, window padding, and effects all live inside the{" "}
    <strong style={{ color: "#8afff7" }}>settings</strong> attr set.
  </>,
  <>
    Themes + one-off tweaks stay in <strong>extraConfig</strong>, so the module
    still understands includes.
  </>,
];

const REALITY_CALLOUTS = [
  {
    title: "1:1 kitty.conf port",
    detail:
      "Every prior directive (font fallback, cursor trail, tab fade, URL hints) became a Nix key under settings.",
  },
  {
    title: "String fidelity",
    detail:
      'Kitty expects literal strings—values like tab_fade "0.15 0.35 0.65 1" stay intact, booleans use "yes"/"no".',
  },
  {
    title: "Font block",
    detail:
      "Font stack, size, and fallback glyph sets migrate into font = { name; size; }; no more ad-hoc Nerd Font copies.",
  },
  {
    title: "Safe linking",
    detail:
      "Home Manager links kitty.conf, backs up the old file, and applies the theme include via extraConfig.",
  },
];

const AnimatedCodePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = Math.min(frame, PSEUDO_SEGMENT_FRAMES) / PSEUDO_SEGMENT_FRAMES;
  const translateY = -progress * MAX_CODE_SCROLL;

  return (
    <GlassCard
      style={{
        height: "100%",
        padding: "46px 50px 70px",
        display: "flex",
        flexDirection: "column",
        gap: 26,
      }}
    >
      <div
        style={{
          fontSize: "clamp(46px, 4vw, 90px)",
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

const PseudoSegment: React.FC = () => (
  <SplitPanel
    gap={36}
    leftFlex={0.45}
    rightFlex={0.55}
    left={
      <GlassCard
        style={{
          height: "100%",
          padding: "56px 60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <TextInfoCard
          title={
            <>
              kitty.nix{" "}
              <span style={{ color: "#8afff7" }}>declarative control</span>
            </>
          }
          items={PSEUDO_SUMMARY_ITEMS}
          markerColor="#ffb86c"
          gap={32}
          style={{ paddingTop: 0, paddingBottom: 0 }}
        />
      </GlassCard>
    }
    right={<AnimatedCodePanel />}
  />
);

const SummarySegment: React.FC = () => (
  <GlassCard
    style={{
      height: "100%",
      padding: "70px 78px",
      display: "flex",
      flexDirection: "column",
      gap: 42,
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
      What’s inside kitty.nix?
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
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 28,
            padding: "30px 32px",
            background:
              "linear-gradient(135deg, rgba(20,0,60,0.55), rgba(138,255,247,0.18))",
            boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              fontSize: "clamp(32px, 3vw, 58px)",
              fontWeight: 700,
              color: "#ffd8ff",
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
              lineHeight: 1.45,
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
        color: "rgba(255,255,255,0.9)",
        textAlign: "center",
        marginTop: 10,
      }}
    >
      Update the module, run Home Manager, and Kitty refreshes with backups +
      declarative safety—no stray dotfiles left behind.
    </div>
  </GlassCard>
);

export const KittyShowcaseScene = () => {
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
          colors={["#ff5da2", "#f7f495"]}
          height={16}
          key={durationInFrames}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
