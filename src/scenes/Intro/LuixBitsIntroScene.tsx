import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const FLOATERS = [
  { x: 8, y: 10, w: 240, h: 70, r: -6, hue: 192 },
  { x: 68, y: 16, w: 260, h: 70, r: 8, hue: 278 },
  { x: 18, y: 58, w: 300, h: 90, r: -10, hue: 320 },
  { x: 74, y: 68, w: 260, h: 80, r: 6, hue: 190 },
];

const TABS = ["<NixOS/>", "<Neovim/>", "<Remotion/>", "<Linux/>", "<TypeScript/>"];

const perspective = 1200;

export const LuixBitsIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({ frame, fps, damping: 12, stiffness: 110 });
  const glowPulse = interpolate(frame % 90, [0, 45, 90], [0.4, 1, 0.4], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const sweep = interpolate(frame, [0, 30, 80], [80, 20, -30], {
    extrapolateRight: "clamp",
  });
  const bracketTilt = interpolate(frame, [0, 60], [18, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 20% 30%, rgba(108,0,255,0.35), transparent 35%), radial-gradient(circle at 80% 60%, rgba(0,255,205,0.30), transparent 30%), linear-gradient(135deg, #0c0f26 0%, #0a0c1c 60%, #06070f 100%)",
        overflow: "hidden",
        perspective,
        color: "#e7f6ff",
        fontFamily: "'SF Pro Display', 'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(120deg, rgba(255,93,162,0.08), rgba(0,255,255,0.06))",
          maskImage: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.7), transparent 60%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: -180,
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 120px), repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 120px)",
          filter: "blur(0.5px)",
          transform: `translate3d(0, ${sweep}px, -200px) skewY(-8deg)`,
          opacity: 0.4,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateZ(${40 * entrance}px) rotateY(${bracketTilt}deg)`,
          textShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            padding: "48px 64px",
            borderRadius: 32,
            background:
              "linear-gradient(135deg, rgba(255,93,162,0.20), rgba(54,221,255,0.18)), rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "0 20px 80px rgba(0,0,0,0.55), 0 0 40px rgba(0,255,255,0.25), 0 0 60px rgba(255,0,200,0.20)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 56,
              letterSpacing: 2,
              fontWeight: 800,
              textTransform: "uppercase",
              transform: "translateZ(30px)",
            }}
          >
            <span
              style={{
                fontSize: 44,
                color: "#7cf2ff",
                textShadow: "0 0 24px rgba(0,255,255,0.65)",
                transform: "translateZ(20px) rotateY(-6deg)",
              }}
            >
              {">"}
            </span>
            <span
              style={{
                color: "#f8f0ff",
                background: "linear-gradient(120deg, #95f4ff, #ff72d2 55%, #9fa7ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: `drop-shadow(0 0 28px rgba(255,114,210,${glowPulse})) drop-shadow(0 0 18px rgba(124,242,255,${glowPulse}))`,
              }}
            >
              LuixBits
            </span>
            <span
              style={{
                fontSize: 44,
                color: "#ff91e5",
                textShadow: "0 0 24px rgba(255,114,210,0.65)",
                transform: "translateZ(20px) rotateY(6deg)",
              }}
            >
              {"</"}
            </span>
          </div>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              fontSize: 18,
              letterSpacing: 0.4,
              opacity: 0.9,
            }}
          >
            {TABS.map((tab, idx) => {
              const float = Math.sin((frame + idx * 10) / 25) * 6;
              return (
                <div
                  key={tab}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
                    transform: `translateZ(12px) translateY(${float}px)`,
                  }}
                >
                  {tab}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {FLOATERS.map((floater, idx) => {
          const drift = Math.sin((frame + idx * 12) / 20) * 8;
          const glow = interpolate(glowPulse, [0.4, 1], [0.2, 0.55]);
          return (
            <div
              key={floater.x + floater.y}
              style={{
                position: "absolute",
                left: `${floater.x}%`,
                top: `${floater.y}%`,
                width: floater.w,
                height: floater.h,
                borderRadius: 16,
                background: `linear-gradient(135deg, hsla(${floater.hue}, 95%, 62%, 0.32), hsla(${floater.hue + 40}, 95%, 65%, 0.20))`,
                transform: `translate3d(-50%, -50%, -120px) rotate(${floater.r}deg) translateY(${drift}px)`,
                boxShadow: `0 10px 40px rgba(0,0,0,0.45), 0 0 36px rgba(255,255,255,${glow})`,
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(6px)",
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06), transparent 55%)",
          mixBlendMode: "screen",
          opacity: 0.8,
        }}
      />
    </AbsoluteFill>
  );
};
