import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProgressBar } from "../../components/SceneProgressBar";
import { GlassCard } from "../../components/GlassCard";
import { VaporwaveBackground } from "../../VaporwaveBackground";

type LearningPoint = {
  title: string;
  detail: string;
  accent: string;
};

const LEARNINGS: LearningPoint[] = [
  {
    title: "Set tangible goals I can actually reach",
    detail: "Pick 1–2 deliverables for the night so the edit has something to show.",
    accent: "#ff5da2",
  },
  {
    title: "Fix problems when I encounter them",
    detail: "Patch blockers on the spot instead of letting TODOs stack up.",
    accent: "#8afff7",
  },
  {
    title: "Don't take on too much — 1 evening at a time",
    detail: "Keep the scope tiny; park the extras for tomorrow's track.",
    accent: "#ffd580",
  },
  {
    title: "Have a timeline so there is time to make the video",
    detail: "Back-plan from render/upload to protect the editing buffer.",
    accent: "#bd9bff",
  },
  {
    title: "More time for better explanations / animations",
    detail: "Reserve the last block to polish the story and motion.",
    accent: "#7bf0c8",
  },
];

const LearningCard: React.FC<{
  learning: LearningPoint;
  index: number;
  segmentFrames: number;
  float: number;
}> = ({ learning, index, segmentFrames, float }) => {
  const frame = useCurrentFrame();
  const start = index * segmentFrames;
  const end = start + segmentFrames;
  const reveal = interpolate(frame, [start - 12, start + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const activeAmount = interpolate(frame, [start, end], [1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sway = Math.sin((frame + index * 12) / 32) * float;

  return (
    <div
      style={{
        padding: "28px 32px",
        borderRadius: 30,
        background: `linear-gradient(120deg, ${learning.accent}26, rgba(8,0,18,0.9))`,
        border: `1px solid ${learning.accent}55`,
        boxShadow: `0 18px 44px rgba(0,0,0,0.45), 0 0 36px ${learning.accent}33`,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 24,
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 24 + sway}px) scale(${1 + activeAmount * 0.02})`,
        transition: "transform 0.2s ease-out",
      }}
    >
      <div
        style={{
          width: 86,
          height: 86,
          borderRadius: 20,
          border: `2px solid ${learning.accent}`,
          background: "rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          fontWeight: 800,
          color: learning.accent,
          boxShadow: `0 0 28px ${learning.accent}40`,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            fontSize: "clamp(38px, 4vw, 68px)",
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#fff",
            textShadow: "0 0 24px rgba(0,0,0,0.45)",
          }}
        >
          {learning.title}
        </div>
        <div
          style={{
            fontSize: "clamp(24px, 2.6vw, 38px)",
            color: "rgba(240,240,255,0.9)",
            lineHeight: 1.4,
          }}
        >
          {learning.detail}
        </div>
      </div>
    </div>
  );
};

export const DAY1_LEARNINGS_DURATION = 27 * 30; // 27s @30fps (3:39 → 4:06)

export const Day1LearningsScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const totalFrames = durationInFrames || DAY1_LEARNINGS_DURATION;
  const segmentFrames = totalFrames / LEARNINGS.length;
  const float = 6;
  const glowDrift = Math.sin(frame / 90) * 50;
  const ribbon = Math.sin(frame / 28) * 6;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        fontFamily: "'Space Grotesk', 'Sora', sans-serif",
      }}
    >
      <VaporwaveBackground />
      <AbsoluteFill
        style={{
          padding: "2.5% 3%",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <GlassCard
          style={{
            padding: "30px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            background:
              "linear-gradient(120deg, rgba(12,0,32,0.75), rgba(6,0,24,0.85))",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                fontSize: "clamp(42px, 4vw, 82px)",
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Day 1 learnings
            </div>
          </div>
          <div
            style={{
              width: 280,
              height: 14,
              borderRadius: 14,
              background: "linear-gradient(90deg, #ff5da2, #8afff7, #ffd580, #bd9bff)",
              boxShadow: "0 0 24px rgba(255,93,162,0.45)",
              transform: `translateY(${ribbon}px)`,
            }}
          />
        </GlassCard>

        <GlassCard
          style={{
            position: "relative",
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: "32px 34px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -120,
              background:
                "radial-gradient(circle at 20% 30%, rgba(255,93,162,0.16), transparent 32%), radial-gradient(circle at 85% 60%, rgba(138,255,247,0.14), transparent 32%), radial-gradient(circle at 55% 80%, rgba(189,155,255,0.18), transparent 34%)",
              filter: "blur(14px)",
              transform: `translate(${glowDrift}px, ${glowDrift * 0.4}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient( 135deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 8px, rgba(0,0,0,0) 8px, rgba(0,0,0,0) 22px )",
              opacity: 0.35,
              transform: `translateY(${ribbon * 2}px)`,
            }}
          />
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(720px, 1fr))",
              gap: 20,
            }}
          >
            {LEARNINGS.map((learning, index) => (
              <LearningCard
                key={learning.title}
                learning={learning}
                index={index}
                segmentFrames={segmentFrames}
                float={float}
              />
            ))}
          </div>
        </GlassCard>

        <SceneProgressBar colors={["#ff5da2", "#8afff7"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
