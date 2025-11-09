import { useId } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

const STARS = Array.from({ length: 40 }).map(() => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 40}%`,
  size: Math.random() * 3 + 1,
  phase: Math.random() * Math.PI * 2,
}));

const AnimatedSun = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 40) * 0.03;

  return (
    <div
      style={{
        position: "absolute",
        top: "8%",
        left: "50%",
        width: 720 * pulse,
        height: 720 * pulse,
        transform: "translateX(-50%)",
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,188,141,0.95), rgba(255,86,182,0.8) 60%, rgba(120,0,144,0.6))",
        boxShadow:
          "0 0 90px rgba(255, 86, 182, 0.7), 0 0 180px rgba(255, 188, 141, 0.4)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient( to bottom, rgba(12,0,40,0) 0px, rgba(12,0,40,0) 28px, rgba(12,0,40,0.4) 32px, rgba(12,0,40,0.6) 36px )",
        }}
      />
    </div>
  );
};

const HorizonMountains = () => (
  <div
    style={{
      position: "absolute",
      bottom: "35%",
      left: 0,
      right: 0,
      height: "25%",
      background:
        "linear-gradient(180deg, rgba(20,0,45,0.8), rgba(5,0,20,0.95))",
      clipPath: "polygon(0% 100%, 0% 45%, 15% 60%, 30% 40%, 45% 65%, 60% 35%, 75% 55%, 100% 30%, 100% 100%)",
      filter: "drop-shadow(0 0 20px rgba(255,86,182,0.25))",
    }}
  />
);

const VaporGrid = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 1800], [0, 60], {
    extrapolateRight: "extend",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: "-10%",
        right: "-10%",
        height: "45%",
        backgroundImage: `
          linear-gradient(
            rgba(255, 137, 255, 0.4) 1px,
            transparent 1px
          ),
          linear-gradient(
            90deg,
            rgba(137, 203, 255, 0.35) 1px,
            transparent 1px
          )
        `,
        backgroundSize: "100% 40px, 160px 100%",
        backgroundPosition: `0 ${drift}px, ${drift}px 0`,
        transformOrigin: "top center",
        transform: "perspective(1200px) rotateX(72deg)",
        boxShadow: "0 -20px 60px rgba(120,0,160,0.4)",
        opacity: 0.85,
      }}
    />
  );
};

const PalmTree = ({
  position,
  scale,
  flip = false,
}: {
  position: string;
  scale: number;
  flip?: boolean;
}) => {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + (flip ? 40 : 0)) / 30) * 4;
  const trunkId = useId();
  const leafId = useId();

  return (
    <svg
      viewBox="0 0 120 200"
      style={{
        position: "absolute",
        bottom: "25%",
        left: position,
        width: 200 * scale,
        height: 340 * scale,
        transformOrigin: "bottom center",
        transform: `${flip ? "scaleX(-1)" : ""} rotate(${sway}deg)`,
        opacity: 0.75,
        filter: "drop-shadow(0 0 20px rgba(0,0,0,0.45))",
      }}
    >
      <path
        d="M55 90 L70 90 L90 200 L45 200 Z"
        fill={`url(#${trunkId})`}
      />
      <path
        d="M62 90 C 20 60, 10 35, 18 20 C 40 30, 55 45, 80 65 Z"
        fill={`url(#${leafId})`}
      />
      <path
        d="M66 88 C 40 50, 45 30, 70 20 C 82 30, 95 45, 108 70 Z"
        fill={`url(#${leafId})`}
      />
      <path
        d="M60 92 C 10 82, 0 70, 5 60 C 25 60, 48 70, 78 85 Z"
        fill={`url(#${leafId})`}
      />
      <defs>
        <linearGradient
          id={trunkId}
          x1="0%"
          x2="0%"
          y1="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#70204c" />
          <stop offset="100%" stopColor="#2b0424" />
        </linearGradient>
        <linearGradient
          id={leafId}
          x1="0%"
          x2="100%"
          y1="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ff9af2" />
          <stop offset="100%" stopColor="#7c4dff" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const Starfield = () => {
  const frame = useCurrentFrame();
  const twinkle = (phase: number) =>
    0.25 + (Math.sin(frame / 18 + phase) + 1) * 0.35;

  return (
    <>
      {STARS.map((star, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            background: "#ffd6ff",
            top: star.top,
            left: star.left,
            opacity: twinkle(star.phase),
          }}
        />
      ))}
    </>
  );
};

const NeonAtmosphere = () => {
  const frame = useCurrentFrame();
  const offsetX = Math.sin(frame / 160) * 30;
  const offsetY = Math.cos(frame / 200) * 20;

  return (
    <div
      style={{
        position: "absolute",
        inset: "-10%",
        background:
          "radial-gradient(circle at 30% 30%, rgba(255,124,244,0.25), transparent 55%), radial-gradient(circle at 70% 40%, rgba(124,210,255,0.22), transparent 50%)",
        mixBlendMode: "screen",
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        opacity: 0.4,
      }}
    />
  );
};

export const VaporwaveBackground = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 20% 0%, #2b003f, #060012 65%, #030008)",
        overflow: "hidden",
      }}
    >
      <Starfield />
      <AnimatedSun />
      <HorizonMountains />
      <VaporGrid />
      <PalmTree position="4%" scale={1.05} />
      <PalmTree position="16%" scale={0.75} />
      <PalmTree position="78%" scale={0.8} flip />
      <PalmTree position="92%" scale={0.95} flip />
      <PalmTree position="65%" scale={0.6} flip />
      <PalmTree position="28%" scale={0.65} />
      <NeonAtmosphere />
    </AbsoluteFill>
  );
};
