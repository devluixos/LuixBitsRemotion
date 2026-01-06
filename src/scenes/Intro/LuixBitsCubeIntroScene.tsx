/*
 * Layout checklist:
 * - 3440x1440 scale: +20-30% sizes
 * - No overlaps; keep safe margins
 * - Labels readable on mobile
 * - Tags/lines sit below icon baselines
 * - Recenter remaining element after fades
 * - Keep the sun bright; avoid heavy scrims
 */

import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Block = {
  x: number;
  y: number;
  index: number;
  hue: number;
};

const LETTERS = [
  ["1000", "1000", "1000", "1000", "1110"], // L
  ["1001", "1001", "1001", "1001", "1111"], // U
  ["111", ".1.", ".1.", ".1.", "111"], // I
  ["10001", ".100.", "..1..", ".100.", "10001"], // X
  [""], // spacer
  ["1110", "1001", "1110", "1001", "1110"], // B
  ["111", ".1.", ".1.", ".1.", "111"], // I
  ["11111", "..1..", "..1..", "..1..", "..1.."], // T
  ["0111", "1000", "0110", "0001", "1110"], // S
];

const BLOCK_SIZE = 120;
const ROWS = 5;
const GAP = 30;
const backgroundGradient =
  "radial-gradient(circle at 20% 30%, rgba(255,93,162,0.22), transparent 35%), radial-gradient(circle at 80% 60%, rgba(78,255,228,0.18), transparent 35%), linear-gradient(135deg, #050712 0%, #090c1f 45%, #05060f 100%)";

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const LuixBitsCubeIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const blocks = useMemo<Block[]>(() => {
    const result: Block[] = [];
    let offsetX = 0;
    LETTERS.forEach((letter) => {
      const letterWidth = letter.reduce((acc, row) => Math.max(acc, row.length), 0);
      letter.forEach((row, rowIndex) => {
        row.split("").forEach((char, colIndex) => {
          if (char === "1") {
            const idx = result.length;
            const hue = 190 + pseudoRandom(idx) * 120;
            result.push({
              x: (offsetX + colIndex) * BLOCK_SIZE,
              y: rowIndex * BLOCK_SIZE,
              index: idx,
              hue,
            });
          }
        });
      });
      offsetX += letterWidth + 1;
    });
    const totalWidth = offsetX * BLOCK_SIZE - BLOCK_SIZE;
    const startX = -totalWidth / 2;
    const startY = -(ROWS * BLOCK_SIZE) / 2;
    return result.map((b) => ({ ...b, x: b.x + startX, y: b.y + startY }));
  }, []);

  const cameraPush = interpolate(frame, [0, 90, 180], [1400, 800, 500], {
    extrapolateRight: "clamp",
  });
  const baseTilt = interpolate(frame, [0, 120], [22, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });
  const sweep = interpolate(frame, [0, 120, 220], [90, 30, -10], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: backgroundGradient,
        overflow: "hidden",
        perspective: 2200,
        color: "#e7f6ff",
        fontFamily: "'SF Pro Display', 'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, rgba(255,93,162,0.05), rgba(0,255,255,0.05)), repeating-linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 80px)",
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: -240,
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06), transparent 45%)",
          transform: `translateY(${sweep}px) skewY(-6deg)`,
          filter: "blur(2px)",
          opacity: 0.35,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transformStyle: "preserve-3d",
          transform: `translateZ(-${cameraPush}px) rotateX(${baseTilt}deg) rotateY(${-baseTilt / 3}deg)`,
        }}
      >
        {blocks.map((block) => {
          const enter = spring({
            frame: frame - block.index * 2,
            fps,
            damping: 12,
            stiffness: 150,
          });
          const pop = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
          const float = Math.sin((frame + block.index * 9) / 16) * 6;
          const glow = interpolate(pop, [0, 1], [0.1, 0.7]);
          const rotate = interpolate(enter, [0, 1], [160, 0], {
            easing: Easing.out(Easing.cubic),
          });
          return (
            <div
              key={block.index}
              style={{
                position: "absolute",
                width: BLOCK_SIZE - GAP,
                height: BLOCK_SIZE - GAP,
                transformStyle: "preserve-3d",
                transform: `
                  translate3d(${block.x}px, ${block.y + float}px, ${-900 + pop * 1000}px)
                  rotateX(${rotate}deg)
                  rotateY(${rotate / 2}deg)
                  scale(${0.7 + pop * 0.35})
                `,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 18,
                  background: `linear-gradient(135deg, hsla(${block.hue}, 90%, 65%, 0.9), hsla(${block.hue + 40}, 95%, 70%, 0.75))`,
                  boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 45px hsla(${block.hue}, 95%, 70%, ${glow})`,
                  border: "1px solid rgba(255,255,255,0.15)",
                  transform: "translateZ(24px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 6,
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.4)",
                  filter: "blur(10px)",
                  transform: "translateZ(-40px) scale(1.08)",
                  opacity: 0.7,
                }}
              />
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.07), transparent 45%), radial-gradient(ellipse at 50% 120%, rgba(0,255,200,0.08), transparent 40%)",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
