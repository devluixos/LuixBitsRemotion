import type { ComponentType } from "react";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DockerOriginal, NixosOriginal, SvelteOriginal } from "devicons-react";
import { SceneProgressBar } from "../../components/SceneProgressBar";
import { GlassCard } from "../../components/GlassCard";

const OUTRO_DURATION_FRAMES = 8 * 30; // 8s @30fps

const backgroundGradient =
  "radial-gradient(circle at 25% 25%, rgba(138,255,247,0.18), transparent 40%), radial-gradient(circle at 75% 70%, rgba(255,93,162,0.18), transparent 40%), linear-gradient(135deg, #050815, #030510 70%)";

type Pill = {
  label: string;
  caption: string;
  icon: ComponentType<{ size?: number }>;
  tint: string;
};

const CloudflareGlyph: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50.5 36.5H13.5c-4 0-7.5-3.3-7.5-7.5 0-4.2 3.5-7.5 7.5-7.5 1.4-7.3 7.8-13 15.5-13 6.8 0 12.6 4.2 14.7 10.1 1.2-0.4 2.6-0.6 4-0.6 6.6 0 12 5.1 12 11.4 0 4.1-2.4 7.6-5.7 9"
      stroke="url(#cf-gradient)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="cf-gradient" x1="8" y1="16" x2="56" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff9f1c" />
        <stop offset="1" stopColor="#ff6f61" />
      </linearGradient>
    </defs>
  </svg>
);

const PILLS: Pill[] = [
  {
    label: "NixOS install locked in",
    caption: "Day 1 base complete",
    icon: NixosOriginal,
    tint: "#8ff4ff",
  },
  {
    label: "Docker + Svelte",
    caption: "Starculator container ready",
    icon: DockerOriginal,
    tint: "#87c9ff",
  },
  {
    label: "Cloudflare tunnel live",
    caption: "Secure remote entry",
    icon: CloudflareGlyph,
    tint: "#ff9f6a",
  },
  {
    label: "Thank you!",
    caption: "See you on Day 2",
    icon: SvelteOriginal,
    tint: "#ff5c2c",
  },
];

type Star = { x: number; y: number; size: number; speed: number; phase: number };

const StarField: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 140 }, (_, i) => {
        const seed = Math.sin(i * 37.7 + 3.14);
        return {
          x: ((seed * 1000) % 100 + 100) % 100,
          y: ((seed * 700) % 100 + 100) % 100,
          size: 1 + ((seed * 13) % 2.6),
          speed: 0.05 + ((seed * 17) % 0.08),
          phase: ((seed * 11) % 1) * Math.PI * 2,
        };
      }),
    [],
  );

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {stars.map((star, idx) => {
        const driftY = (star.y + frame * star.speed) % 100;
        const twinkle = 0.5 + (Math.sin(frame / 12 + star.phase) + 1) * 0.25;
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${driftY}%`,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              background: "#e8f6ff",
              filter: `drop-shadow(0 0 8px rgba(143,244,255,${twinkle}))`,
              opacity: twinkle,
            }}
          />
        );
      })}
    </div>
  );
};

const PillCard: React.FC<{ pill: Pill; index: number; segment: number }> = ({
  pill,
  index,
  segment,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = index * segment;
  const progress = spring({
    frame: frame - start,
    fps,
    damping: 12,
    stiffness: 180,
  });
  const glow = interpolate(progress, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "18px 20px",
        borderRadius: 22,
        background: `linear-gradient(120deg, ${pill.tint}22, rgba(8,10,20,0.85))`,
        border: `1px solid ${pill.tint}66`,
        boxShadow: `0 16px 60px rgba(0,0,0,0.55), 0 0 24px ${pill.tint}33`,
        opacity: Math.min(1, progress),
        transform: `translateY(${(1 - progress) * 14}px) scale(${1 + glow * 0.02})`,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${pill.tint}77`,
          display: "grid",
          placeItems: "center",
          boxShadow: `0 0 20px ${pill.tint}40`,
        }}
      >
        <pill.icon size={40} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontSize: "clamp(26px, 2.5vw, 42px)",
            fontWeight: 700,
            color: "#f8fbff",
          }}
        >
          {pill.label}
        </div>
        <div
          style={{
            fontSize: "clamp(18px, 2vw, 30px)",
            color: "rgba(230,240,255,0.8)",
            letterSpacing: 0.5,
          }}
        >
          {pill.caption}
        </div>
      </div>
    </div>
  );
};

export const STAR_OUTRO_COMPOSITION_ID = "starculator-outro";
export const STAR_OUTRO_DURATION = OUTRO_DURATION_FRAMES;

export const StarculatorOutroScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames = OUTRO_DURATION_FRAMES } = useVideoConfig();
  const segment = durationInFrames / PILLS.length;
  const pulse = 1 + Math.sin(frame / 24) * 0.03;
  const hue = (frame * 2) % 360;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: backgroundGradient,
        color: "#fff",
        fontFamily: "'Space Grotesk', 'Sora', sans-serif",
      }}
    >
      <StarField opacity={0.8} />
      <div
        style={{
          position: "absolute",
          inset: -60,
          background: `radial-gradient(circle at 55% 55%, rgba(255,255,255,0.04), transparent 50%), radial-gradient(circle at 15% 75%, hsla(${hue},80%,70%,0.12), transparent 40%)`,
          filter: "blur(18px)",
        }}
      />
      <AbsoluteFill
        style={{
          padding: "3% 4%",
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <GlassCard
          style={{
            padding: "26px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.06), rgba(138,255,247,0.08))",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontSize: "clamp(38px, 4vw, 86px)",
                fontWeight: 900,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Starculator outro
            </div>
            <div
              style={{
                fontSize: "clamp(22px, 2.4vw, 34px)",
                color: "rgba(230,240,255,0.82)",
              }}
            >
              Day 1 of 24 — milestones locked in.
            </div>
          </div>
          <div
            style={{
              padding: "12px 18px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(6,8,18,0.7)",
              boxShadow: "0 0 24px rgba(138,255,247,0.4)",
              fontSize: "clamp(22px, 2.4vw, 36px)",
              fontWeight: 800,
              letterSpacing: 1.5,
              transform: `scale(${pulse})`,
              transformOrigin: "center",
            }}
          >
            Day 01 / 24
          </div>
        </GlassCard>

        <GlassCard
          style={{
            flex: 1,
            padding: "28px 30px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(540px, 1fr))",
            gap: 20,
            background: "rgba(8,12,26,0.7)",
          }}
        >
          {PILLS.map((pill, idx) => (
            <PillCard key={pill.label} pill={pill} index={idx} segment={segment} />
          ))}
        </GlassCard>

        <GlassCard
          style={{
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(6,10,22,0.75)",
          }}
        >
          <div
            style={{
              fontSize: "clamp(26px, 2.8vw, 44px)",
              fontWeight: 700,
              color: "#e9f5ff",
            }}
          >
            Thank you — see you on Day 2.
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              fontSize: "clamp(18px, 1.9vw, 28px)",
              color: "rgba(230,240,255,0.78)",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#8afff7",
                boxShadow: "0 0 16px rgba(138,255,247,0.6)",
              }}
            />
            Day 1 finished strong — momentum kept.
          </div>
        </GlassCard>

        <SceneProgressBar colors={["#8afff7", "#ff5da2"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
