import { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";

type StarFieldVariant = "trailer" | "outro";

type StarFieldProps = {
  opacity?: number;
  variant?: StarFieldVariant;
};

type TrailerStar = {
  x: number;
  y: number;
  size: number;
  speed: number;
  sparkle: number;
};

type OutroStar = {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
};

const buildTrailerStars = (): TrailerStar[] =>
  Array.from({ length: 120 }, (_, i) => {
    const seed = Math.sin(i * 999);
    return {
      x: (seed * 1000) % 100,
      y: ((seed * 7000) % 100 + 100) % 100,
      size: 1.2 + ((seed * 13) % 2),
      speed: 0.04 + ((seed * 7) % 0.08),
      sparkle: 0.4 + ((seed * 5) % 0.4),
    };
  });

const buildOutroStars = (): OutroStar[] =>
  Array.from({ length: 140 }, (_, i) => {
    const seed = Math.sin(i * 37.7 + 3.14);
    return {
      x: ((seed * 1000) % 100 + 100) % 100,
      y: ((seed * 700) % 100 + 100) % 100,
      size: 1 + ((seed * 13) % 2.6),
      speed: 0.05 + ((seed * 17) % 0.08),
      phase: ((seed * 11) % 1) * Math.PI * 2,
    };
  });

export const StarField: React.FC<StarFieldProps> = ({
  opacity = 1,
  variant = "trailer",
}) => {
  const frame = useCurrentFrame();
  const trailerStars = useMemo(buildTrailerStars, []);
  const outroStars = useMemo(buildOutroStars, []);

  if (variant === "outro") {
    return (
      <div style={{ position: "absolute", inset: 0, opacity }}>
        {outroStars.map((star, idx) => {
          const driftY = (star.y + frame * star.speed) % 100;
          const twinkle =
            0.5 + (Math.sin(frame / 12 + star.phase) + 1) * 0.25;
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
  }

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {trailerStars.map((star, idx) => {
        const y = (star.y + frame * star.speed) % 100;
        const twinkle = interpolate(
          Math.sin((frame + idx * 8) / 10),
          [-1, 1],
          [0.35, 1],
        );
        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${y}%`,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              background: "white",
              filter: `drop-shadow(0 0 6px rgba(138,255,247,${star.sparkle * twinkle}))`,
              opacity: 0.5 + star.sparkle * twinkle,
            }}
          />
        );
      })}
    </div>
  );
};
