/*
 * Layout checklist:
 * - 3440x1440 scale: +20-30% sizes
 * - No overlaps; keep safe margins
 * - Labels readable on mobile
 * - Tags/lines sit below icon baselines
 * - Recenter remaining element after fades
 * - Keep the sun bright; avoid heavy scrims
 */

import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { SceneProgressBar } from "../../components/SceneProgressBar";

const COMPARISON_ITEMS = [
  { label: "Nixvim", accent: "#7fe8ff" },
  { label: "Nixcats", accent: "#ffc48a" },
  { label: "NVF", accent: "#c7a0ff" },
];

const HELLO_EXIT_START = 72;
const HELLO_EXIT_END = 112;
const COMPARISON_START = 84;
export const NIXVIM_COMPARISON_INTRO_DURATION = 480;

export const NixvimComparisonIntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const helloFadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const helloFadeOut = interpolate(frame, [HELLO_EXIT_START, HELLO_EXIT_END], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const helloPop = spring({
    frame,
    fps,
    damping: 14,
    stiffness: 140,
  });
  const helloOpacity = helloFadeIn * helloFadeOut;
  const helloScale = interpolate(frame, [0, 28, HELLO_EXIT_END], [1.35, 1.02, 0.88], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const helloBreath = 1 + Math.sin(frame / 18) * 0.015;
  const helloY = interpolate(frame, [0, 34, HELLO_EXIT_END], [70, 0, -32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const helloZ = interpolate(frame, [0, HELLO_EXIT_END], [260, -160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const helloRotate = interpolate(frame, [0, HELLO_EXIT_END], [-12, 8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const helloTilt = interpolate(frame, [0, 52, HELLO_EXIT_END], [12, 0, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const helloSpin = Math.sin(frame / 44) * 3;
  const helloBlur = interpolate(frame, [HELLO_EXIT_START, HELLO_EXIT_END], [0, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const helloGlow = interpolate(Math.sin(frame / 12), [-1, 1], [0.2, 0.7]);
  const helloDriftX = Math.sin(frame / 26) * 18;
  const helloDriftY = Math.cos(frame / 32) * 12;
  const helloSheen = interpolate(frame, [0, HELLO_EXIT_END], [0, 160], {
    extrapolateRight: "extend",
  });
  const ringScale = interpolate(frame, [0, HELLO_EXIT_END], [0.7, 1.35], {
    extrapolateRight: "clamp",
  });

  const compareProgress = spring({
    frame: frame - COMPARISON_START,
    fps,
    damping: 14,
    stiffness: 110,
  });
  const compareOpacity = interpolate(frame, [COMPARISON_START - 14, COMPARISON_START + 22], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const compareScale = interpolate(compareProgress, [0, 1], [0.92, 1], {
    extrapolateRight: "clamp",
  });
  const compareDepth = interpolate(compareProgress, [0, 1], [-240, 0], {
    extrapolateRight: "clamp",
  });
  const baseTilt = interpolate(compareProgress, [0, 1], [16, 0], {
    extrapolateRight: "clamp",
  });
  const orbit = Math.sin(frame / 90) * 4;
  const groupFloat = Math.sin(frame / 36) * 10;
  const groupSpin = Math.sin(frame / 100) * 2;
  const groupRotateY = -baseTilt + orbit;
  const groupRotateX = baseTilt / 2 + orbit / 2;
  const stageShiftX = Math.sin(frame / 38) * 14;
  const stageShiftY = Math.cos(frame / 46) * 10;
  const stageSheen = frame * 0.7;
  const stageGridShift = frame * 0.4;
  const stagePulse = interpolate(Math.sin(frame / 20), [-1, 1], [0.22, 0.75]);
  const stageTilt = Math.sin(frame / 70) * 1.8;
  const shimmerBase = frame * 3.2;

  const orbDriftX = Math.sin(frame / 120) * 60;
  const orbDriftY = Math.cos(frame / 150) * 40;
  const gridShift = interpolate(frame, [0, 240], [0, 40], {
    extrapolateRight: "extend",
  });

  return (
    <AbsoluteFill
      style={{
        color: "#eef6ff",
        fontFamily: "'SF Pro Display', 'Inter', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        perspective: 1600,
      }}
    >
      <VaporwaveBackground />
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(124,255,231,0.12), transparent 55%), radial-gradient(circle at 70% 40%, rgba(255,131,202,0.16), transparent 50%)",
          transform: `translate(${orbDriftX}px, ${orbDriftY}px)`,
          opacity: 0.85,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: "-10%",
          backgroundImage:
            "repeating-linear-gradient(110deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 120px)",
          transform: `translateY(${gridShift}px)`,
          opacity: 0.3,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            opacity: helloOpacity,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-120px -240px",
              borderRadius: "999px",
              background:
                "radial-gradient(circle, rgba(124,255,231,0.25), rgba(124,255,231,0.05) 45%, transparent 70%)",
              filter: "blur(2px)",
              transform: `translateZ(${helloZ - 220}px) scale(${ringScale})`,
              opacity: helloOpacity * 0.6,
            }}
          />
          <div
            style={{
              fontSize: "clamp(130px, 10.5vw, 240px)",
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "lowercase",
              background:
                "linear-gradient(110deg, #e0fbff 0%, #9df3ff 35%, #ff9de2 65%, #e0fbff 100%)",
              backgroundSize: "200% 200%",
              backgroundPosition: `${helloSheen}% 50%`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: `0 30px 70px rgba(0,0,0,0.45), 0 0 60px rgba(124,255,231,${helloGlow})`,
              filter: `blur(${helloBlur}px)`,
              transformStyle: "preserve-3d",
              transform: `translate3d(${helloDriftX}px, ${helloY + helloDriftY}px, ${helloZ}px) rotateY(${helloRotate}deg) rotateX(${helloTilt}deg) rotateZ(${helloSpin}deg) scale(${
                helloScale * helloBreath + helloPop * 0.02
              })`,
            }}
          >
            hello_world
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 80px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 120,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: compareOpacity,
          }}
        >
          <div
            style={{
              padding: "24px 64px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.22)",
              background:
                "linear-gradient(135deg, rgba(10, 12, 30, 0.85), rgba(18, 10, 36, 0.6))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              backdropFilter: "blur(14px)",
              textAlign: "center",
              minWidth: "clamp(520px, 45vw, 980px)",
            }}
          >
            <span
              style={{
                fontSize: "clamp(36px, 2.9vw, 58px)",
                textTransform: "uppercase",
                letterSpacing: 5,
                color: "rgba(199, 232, 255, 0.9)",
              }}
            >
              Configuration Showdown
            </span>
          </div>
          <div
            style={{
              height: 6,
              width: "48%",
              borderRadius: 999,
              background:
                "linear-gradient(90deg, rgba(124,255,231,0.15), rgba(124,255,231,0.95), rgba(255,157,226,0.5))",
              boxShadow: "0 0 32px rgba(124,255,231,0.65)",
              opacity: 0.85,
            }}
          />
        </div>
        <div
          style={{
            width: "100%",
            maxWidth: 3200,
            display: "flex",
            flexDirection: "column",
            gap: 36,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `translate3d(0, ${groupFloat}px, ${compareDepth}px) rotateY(${groupRotateY}deg) rotateX(${groupRotateX}deg) rotateZ(${groupSpin}deg) scale(${compareScale})`,
            opacity: compareOpacity,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "4% 3%",
              borderRadius: 60,
              background:
                "linear-gradient(135deg, rgba(8,10,26,0.88), rgba(20,12,40,0.6))",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow:
                "0 40px 140px rgba(4,0,24,0.7), 0 0 90px rgba(124,255,231,0.12)",
              backdropFilter: "blur(16px)",
              transform: `translate3d(${stageShiftX}px, ${stageShiftY}px, -260px) rotateX(${stageTilt}deg)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "7% 5%",
              borderRadius: 52,
              background:
                "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.18) 45%, transparent 70%)",
              backgroundSize: "200% 100%",
              backgroundPosition: `${stageSheen}px 0%`,
              mixBlendMode: "screen",
              opacity: 0.55,
              transform: `translate3d(${stageShiftX * 0.7}px, ${stageShiftY * 0.7}px, -220px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "9% 8%",
              borderRadius: 46,
              border: "1px solid rgba(255,255,255,0.1)",
              transform: `translate3d(${stageShiftX * 0.5}px, ${stageShiftY * 0.5}px, -230px)`,
              opacity: 0.7,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "12% 10% 16%",
              borderRadius: 42,
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 140px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 140px)",
              backgroundPosition: `${stageGridShift}px ${stageGridShift}px`,
              opacity: 0.22,
              mixBlendMode: "screen",
              transform: `translate3d(${stageShiftX * 0.6}px, ${stageShiftY * 0.6}px, -240px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "12%",
              right: "12%",
              bottom: "7%",
              height: "35%",
              borderRadius: 999,
              background:
                "radial-gradient(circle, rgba(124,255,231,0.35), transparent 70%)",
              filter: "blur(26px)",
              transform: `translate3d(${stageShiftX * 0.3}px, ${stageShiftY * 0.3}px, -280px)`,
              opacity: stagePulse,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "12%",
              left: "8%",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(124,255,231,0.35), transparent 70%)",
              filter: "blur(6px)",
              opacity: 0.45,
              transform: `translate3d(${stageShiftX * -0.4}px, ${stageShiftY * 0.8}px, -210px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "18%",
              right: "10%",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,157,226,0.35), transparent 70%)",
              filter: "blur(6px)",
              opacity: 0.4,
              transform: `translate3d(${stageShiftX * 0.5}px, ${stageShiftY * -0.6}px, -220px)`,
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr)",
              alignItems: "center",
              gap: 54,
              transformStyle: "preserve-3d",
            }}
          >
            {COMPARISON_ITEMS.flatMap((item, idx) => {
              const cardStart = COMPARISON_START + idx * 12;
              const cardProgress = spring({
                frame: frame - cardStart,
                fps,
                damping: 16,
                stiffness: 120,
              });
              const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1], {
                extrapolateRight: "clamp",
              });
              const cardY = interpolate(cardProgress, [0, 1], [80, 0], {
                extrapolateRight: "clamp",
              });
              const cardZ = interpolate(cardProgress, [0, 1], [-80, 90], {
                extrapolateRight: "clamp",
              });
              const float = Math.sin((frame + idx * 22) / 20) * 8;
              const baseCardTilt = (1 - idx) * 6;
              const cardRotateY = baseCardTilt + Math.sin((frame + idx * 26) / 26) * 4;
              const cardRotateX = Math.sin((frame + idx * 16) / 22) * 3;
              const cardRotateZ = Math.sin((frame + idx * 12) / 38) * 2;
              const cardGlow = 0.35 + (Math.sin((frame + idx * 40) / 18) + 1) * 0.2;
              const cardGlowHex = Math.round(cardGlow * 255)
                .toString(16)
                .padStart(2, "0");
              const cardScale = 1 + Math.sin((frame + idx * 14) / 24) * 0.012;
              const shimmerPosition = (shimmerBase + idx * 140) % 240;
              const shimmerOpacity = 0.2 + (Math.sin((frame + idx * 10) / 18) + 1) * 0.18;
              const card = (
                <div
                  key={`card-${item.label}`}
                  style={{
                    position: "relative",
                    padding: "56px 44px",
                    borderRadius: 32,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))",
                    border: "1px solid rgba(255,255,255,0.18)",
                    textAlign: "center",
                    boxShadow: `0 30px 90px rgba(0,0,0,0.55), 0 0 70px ${item.accent}${cardGlowHex}`,
                    transformStyle: "preserve-3d",
                    transform: `translate3d(0, ${cardY + float}px, ${cardZ}px) rotateY(${cardRotateY}deg) rotateX(${cardRotateX}deg) rotateZ(${cardRotateZ}deg) scale(${cardScale})`,
                    opacity: cardOpacity,
                    width: "100%",
                    minWidth: 0,
                    height: "clamp(300px, 22vw, 420px)",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: "-40% -20%",
                      background:
                        "linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
                      backgroundSize: "200% 100%",
                      backgroundPosition: `${shimmerPosition}% 50%`,
                      opacity: shimmerOpacity,
                      mixBlendMode: "screen",
                      transform: "translateZ(30px)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 32,
                      background: `radial-gradient(circle at 15% 20%, ${item.accent}33, transparent 60%)`,
                      transform: "translateZ(18px)",
                      opacity: 0.8,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 8,
                      borderRadius: 26,
                      border: `1px solid ${item.accent}55`,
                      transform: "translateZ(12px)",
                      opacity: 0.8,
                    }}
                  />
                  <div style={{ position: "relative", transform: "translateZ(32px)" }}>
                    <div
                      style={{
                        fontSize: "clamp(60px, 3.8vw, 104px)",
                        fontWeight: 700,
                        color: "#f8f6ff",
                        letterSpacing: 1,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        marginTop: 14,
                        height: 8,
                        width: "60%",
                        borderRadius: 999,
                        marginInline: "auto",
                        background: `linear-gradient(90deg, ${item.accent}, rgba(255,255,255,0.1))`,
                      }}
                    />
                  </div>
                </div>
              );
              if (idx === COMPARISON_ITEMS.length - 1) {
                return [card];
              }
              const vsStart = COMPARISON_START + idx * 12 + 8;
              const vsProgress = spring({
                frame: frame - vsStart,
                fps,
                damping: 16,
                stiffness: 140,
              });
              const vsScale = interpolate(vsProgress, [0, 1], [0.6, 1], {
                extrapolateRight: "clamp",
              });
              const vsOpacity = interpolate(vsProgress, [0, 1], [0, 1], {
                extrapolateRight: "clamp",
              });
              const vsSpin = interpolate(vsProgress, [0, 1], [-16, 0], {
                easing: Easing.out(Easing.cubic),
                extrapolateRight: "clamp",
              });
              const vsDepth = interpolate(vsProgress, [0, 1], [-160, 40], {
                extrapolateRight: "clamp",
              });
              const vsWobble = Math.sin((frame + idx * 20) / 18) * 6;
              const vsRotateX = vsWobble / 2;
              const vs = (
                <div
                  key={`vs-${idx}`}
                  style={{
                    padding: "22px 26px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.35)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.04))",
                    color: "#f3f1ff",
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    textAlign: "center",
                    boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
                    transformStyle: "preserve-3d",
                    transform: `translateZ(${vsDepth}px) scale(${vsScale}) rotateY(${vsWobble}deg) rotateX(${vsRotateX}deg) rotateZ(${vsSpin}deg)`,
                    opacity: vsOpacity,
                    minWidth: 140,
                    fontSize: "clamp(26px, 1.7vw, 38px)",
                  }}
                >
                  VS
                </div>
              );
              return [card, vs];
            })}
          </div>
        </div>
      </div>
      <SceneProgressBar />
    </AbsoluteFill>
  );
};
