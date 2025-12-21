import { useMemo, type ComponentType } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NixosOriginal, DockerOriginal, SvelteOriginal } from "devicons-react";
import { SceneProgressBar } from "../../components/SceneProgressBar";

type Star = {
  x: number;
  y: number;
  size: number;
  speed: number;
  sparkle: number;
};

const backgroundGradient =
  "radial-gradient(circle at 20% 30%, rgba(78,255,228,0.12), transparent 35%), radial-gradient(circle at 80% 70%, rgba(255,93,162,0.18), transparent 40%), linear-gradient(135deg, #040610 0%, #06081a 60%, #03040a 100%)";

const StarField: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const seed = Math.sin(i * 999);
      return {
        x: (seed * 1000) % 100,
        y: ((seed * 7000) % 100 + 100) % 100,
        size: 1.2 + ((seed * 13) % 2),
        speed: 0.04 + ((seed * 7) % 0.08),
        sparkle: 0.4 + ((seed * 5) % 0.4),
      };
    });
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {stars.map((star, idx) => {
        const y = (star.y + frame * star.speed) % 100;
        const twinkle = interpolate(Math.sin((frame + idx * 8) / 10), [-1, 1], [0.35, 1]);
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

const NixosSequence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bounce = spring({
    frame,
    fps,
    damping: 10,
    stiffness: 180,
    mass: 0.8,
  });
  const scale = interpolate(bounce, [0, 1], [0.5, 1.05], {
    extrapolateRight: "clamp",
  });
  const exitFade = interpolate(frame, [42, 72], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const explosionStart = 26;
  const explosionDuration = 18;
  const explosionFrame = frame - explosionStart;
  const explosionProgress = Math.max(0, explosionFrame);
  const explosionT = Math.min(
    1,
    interpolate(explosionProgress, [0, explosionDuration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  const iconOpacity = explosionProgress > 0 ? Math.max(0, 1 - explosionT * 1.3) : 1;
  const iconScale = 1 + explosionT * 0.08;
  const hue = (frame * 2) % 360;
  const neonGradient = `linear-gradient(120deg, hsl(${hue}, 80%, 68%), hsl(${(hue + 120) % 360}, 78%, 68%), hsl(${(hue + 220) % 360}, 80%, 72%))`;
  const particles = useMemo(() => {
    const palette = ["#8ff4ff", "#fff5f9", "#7ec8ff", "#ffd1f3", "#a6ffef"];
    return Array.from({ length: 32 }, (_, i) => {
      const seed = Math.sin(i * 23.7 + 7.1);
      const angle = ((seed + 1) / 2) * Math.PI * 2;
      const speed = 10 + ((seed * 100) % 18);
      const size = 8 + ((seed * 1000) % 14);
      const spin = ((seed * 10) % 1) * 180;
      const color = palette[i % palette.length];
      return { angle, speed, size, spin, color };
    });
  }, []);
  const snow = useMemo(
    () =>
      Array.from({ length: 150 }, (_, i) => {
        const seed = Math.sin(i * 45.3 + 3.1);
        return {
          x: ((seed * 1000) % 100 + 100) % 100,
          drift: ((seed * 7) % 1) - 0.5,
          size: 2 + ((seed * 19) % 3),
          speed: 0.5 + ((seed * 5) % 1.2),
          phase: i * 5,
        };
      }),
    [],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        opacity: exitFade,
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "72px 86px",
          borderRadius: 36,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
          overflow: "visible",
          transform: `scale(${scale}) rotateY(${interpolate(frame, [0, 20], [12, 0])}deg)`,
          minWidth: "70vw",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -120,
            background:
              "radial-gradient(circle at 30% 40%, rgba(143,244,255,0.15), transparent 45%), radial-gradient(circle at 70% 60%, rgba(255,125,213,0.2), transparent 40%)",
            filter: "blur(8px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "-40% -50% 30% -50%",
            background:
              "linear-gradient(135deg, rgba(143,244,255,0.2), rgba(255,125,213,0.18))",
            transform: `translateX(${Math.sin(frame / 10) * 40}px) skewY(-10deg) rotateX(12deg)`,
            filter: "blur(10px)",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "20% -40% -40% -40%",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(143,244,255,0.12))",
            transform: `translateX(${Math.cos(frame / 14) * 36}px) skewY(12deg) rotateX(8deg)`,
            filter: "blur(8px)",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "relative",
            fontSize: "clamp(92px, 8.5vw, 210px)",
            fontWeight: 900,
            letterSpacing: 2,
            transform: `scale(${iconScale})`,
            color: "#0b0f2b",
            textShadow:
              "0 0 22px rgba(0,0,0,0.75), 0 14px 60px rgba(0,0,0,0.65), 0 0 40px rgba(143,244,255,0.6), 0 0 40px rgba(255,125,213,0.6)",
            WebkitTextStroke: "2.8px rgba(255,255,255,0.9)",
            background: neonGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Advent of Code
        </div>
        <div
          style={{
            marginTop: 32,
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "20px 28px",
            borderRadius: 18,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "#fefbff",
            fontSize: "clamp(52px, 5vw, 104px)",
            letterSpacing: 3,
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            }}
        >
          <span style={{ color: "#8ff4ff" }}>Day 1</span>
          <span style={{ opacity: 0.7 }}>/</span>
          <span style={{ color: "#ffb7f3" }}>24</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            border: "2px solid rgba(143,244,255,0.3)",
            transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame / 16) * 0.06}) rotate(${frame / 3}deg)`,
            boxShadow: "0 0 50px rgba(143,244,255,0.35)",
            mixBlendMode: "screen",
            filter: "blur(1px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 520,
            height: 520,
            borderRadius: "50%",
            border: "2px dashed rgba(255,255,255,0.2)",
            transform: `translate(-50%, -50%) scale(${1.05 + Math.cos(frame / 22) * 0.05}) rotate(${frame / 4}deg)`,
            opacity: 0.7,
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "20% 10% auto 10%",
            height: 16,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.4), rgba(143,244,255,0.5), rgba(255,125,213,0.4))",
            filter: "blur(6px)",
            opacity: 0.8,
            transform: `translateY(${Math.sin(frame / 8) * 10}px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "-20% -10% auto -10%",
            height: 10,
            background:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 4px, transparent 4px 16px)",
            transform: `skewX(-12deg) translateY(${Math.cos(frame / 12) * 8}px)`,
            opacity: 0.6,
          }}
        />
        {explosionProgress > 0 && (
          <>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 80 + explosionT * 220,
                height: 80 + explosionT * 220,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.65)",
                boxShadow: "0 0 50px rgba(143,244,255,0.8)",
                opacity: 1 - explosionT,
                mixBlendMode: "screen",
                filter: "blur(1px)",
              }}
            />
            {particles.map((p, idx) => {
              const travel = p.speed * explosionT;
              const x = Math.cos(p.angle) * travel;
              const y = Math.sin(p.angle) * travel - explosionT * 20;
              const size = p.size * (0.6 + explosionT * 0.6);
              const opacity = 1 - explosionT * 1.1;
              return (
                <div
                  key={idx}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    width: size,
                    height: size,
                    borderRadius: size * 0.4,
                    background: p.color,
                    boxShadow: `0 0 20px ${p.color}`,
                    opacity,
                    transform: `translate(-50%, -50%) rotate(${p.spin * explosionT}deg)`,
                    mixBlendMode: "screen",
                  }}
                />
              );
            })}
          </>
        )}
        <div
          style={{
            position: "absolute",
            inset: "-20% -10% -10% -10%",
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {snow.map((flake, idx) => {
            const fall = (frame * flake.speed + flake.phase) % 140;
            const x = flake.x + Math.sin((frame + idx * 10) / 28) * 10 + flake.drift * 50;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: `${x}%`,
                  top: `${fall}%`,
                  width: flake.size,
                  height: flake.size,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.95)",
                  boxShadow: "0 0 12px rgba(255,255,255,0.6)",
                  opacity: 0.8,
                  filter: "blur(0.4px)",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

type Tech = {
  label: string;
  color: string;
  Icon: ComponentType<{ size?: number }>;
  delay: number;
  accent?: string;
};

const CloudflareIcon: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <svg width={size} height={(size / 3) * 2} viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cfGradient" x1="0" y1="0" x2="180" y2="0">
        <stop offset="0%" stopColor="#fbbf77" />
        <stop offset="100%" stopColor="#ff7c4d" />
      </linearGradient>
    </defs>
    <path
      d="M50 80c0-22 18-40 40-40 17 0 32 10 38 26 4-2 9-3 14-3 17 0 32 12 36 29H44c-10 0-18-8-18-18 0-9 7-17 16-18 3-9 12-16 23-16 12 0 22 8 24 20"
      stroke="rgba(255,255,255,0.9)"
      strokeWidth="4"
      fill="url(#cfGradient)"
      strokeLinejoin="round"
    />
  </svg>
);

const TraefikIcon: React.FC<{ size?: number }> = ({ size = 96 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tfGradient" x1="0" y1="0" x2="120" y2="120">
        <stop offset="0%" stopColor="#83f1ff" />
        <stop offset="100%" stopColor="#6a9bff" />
      </linearGradient>
    </defs>
    <rect x="12" y="18" width="96" height="84" rx="18" fill="url(#tfGradient)" stroke="rgba(255,255,255,0.8)" strokeWidth="4" />
    <path d="M30 48h60M30 72h60" stroke="#0c1024" strokeWidth="7" strokeLinecap="round" />
    <circle cx="46" cy="48" r="6" fill="#0c1024" />
    <circle cx="74" cy="72" r="6" fill="#0c1024" />
    <path d="M40 30h40" stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const TechStackSequence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const techs: Tech[] = [
    { label: "NixOS", color: "#7BD6F5", Icon: NixosOriginal, delay: 6 },
    { label: "Dockerized Services", color: "#80cfff", Icon: DockerOriginal, delay: 10, accent: "Local only" },
    { label: "Cloudflare Tunnel", color: "#ff9a64", Icon: CloudflareIcon, delay: 14, accent: "Secure ingress" },
    { label: "Traefik Routing", color: "#83f1ff", Icon: TraefikIcon, delay: 18, accent: "Reverse proxy" },
    { label: "Svelte + Threlte", color: "#ff8f6b", Icon: SvelteOriginal, delay: 22, accent: "Frontend + 3D" },
  ];

  const pews = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const seed = Math.sin(i * 77.3);
        const angle = ((seed + 1) / 2) * Math.PI * 2;
        return { angle, speed: 8 + ((seed * 100) % 12), width: 4 + ((seed * 50) % 6) };
      }),
    [],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          fontSize: "clamp(44px, 4vw, 96px)",
          fontWeight: 800,
          letterSpacing: 1,
          color: "#fef7ff",
          textShadow: "0 12px 48px rgba(0,0,0,0.55)",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Current Tech Stack
      </div>

      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(520px, 1fr))",
          gap: 36,
          width: "100%",
          maxWidth: 1920,
        }}
      >
        {techs.map((tech, idx) => {
          const enter = spring({
            frame: frame - tech.delay,
            fps,
            damping: 11,
            stiffness: 150,
            mass: 0.7,
          });
          const pop = Math.max(0, Math.min(1, enter));
          const float = Math.sin((frame + idx * 8) / 20) * 6;
          const pewOpacity = interpolate(frame - tech.delay, [0, 16], [0.9, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={tech.label}
              style={{
                position: "relative",
                padding: "28px 32px",
                borderRadius: 30,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 14px 50px rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                transform: `translateY(${float}px) scale(${0.9 + pop * 0.12})`,
                opacity: pop,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: -80,
                  background: `radial-gradient(circle at 50% 50%, ${tech.color}22, transparent 55%)`,
                  filter: "blur(10px)",
                }}
              />
              <tech.Icon size={128} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "clamp(38px, 3.2vw, 76px)",
                    fontWeight: 800,
                    color: "#fefbff",
                    textShadow: "0 8px 24px rgba(0,0,0,0.45)",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {tech.label}
                </div>
                <div
                  style={{
                    height: 6,
                    width: 260,
                    borderRadius: 12,
                    background: `linear-gradient(90deg, ${tech.color}, rgba(255,255,255,0.85))`,
                    boxShadow: `0 0 28px ${tech.color}88`,
                  }}
                />
                {tech.accent ? (
                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#d4e9ff",
                      fontSize: "clamp(18px, 1.6vw, 28px)",
                      width: "fit-content",
                    }}
                  >
                    {tech.accent}
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  mixBlendMode: "screen",
                }}
              >
                {pews.map((pew, pIdx) => {
                  const travel = pew.speed * pop * 18;
                  const x = Math.cos(pew.angle) * travel;
                  const y = Math.sin(pew.angle) * travel;
                  const opacity = Math.max(0, pewOpacity - pIdx * 0.01);
                  return (
                    <div
                      key={`${tech.label}-pew-${pIdx}`}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: pew.width,
                        height: 28,
                        background: `linear-gradient(90deg, ${tech.color}, transparent)`,
                        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${(pew.angle * 180) / Math.PI}deg)`,
                        filter: "blur(1px)",
                        opacity,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RocketIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.35))" }}
  >
    <defs>
      <linearGradient id="bodyGradient" x1="0" y1="0" x2="120" y2="0">
        <stop offset="0%" stopColor="#8ff4ff" />
        <stop offset="100%" stopColor="#ff7dd5" />
      </linearGradient>
      <linearGradient id="flameGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffefa1" />
        <stop offset="100%" stopColor="#ff6b3d" />
      </linearGradient>
    </defs>
    <path
      d="M60 10 C40 40 32 70 32 110 L60 170 L88 110 C88 70 80 40 60 10 Z"
      fill="url(#bodyGradient)"
      stroke="rgba(255,255,255,0.8)"
      strokeWidth="4"
    />
    <circle cx="60" cy="70" r="16" fill="#0a0e1f" stroke="#d9e8ff" strokeWidth="4" />
    <path d="M45 110 L60 145 L75 110 Z" fill="#0a0e1f" opacity="0.45" />
    <path d="M60 170 L48 150 L72 150 Z" fill="url(#flameGradient)" />
  </svg>
);

const JumpDriveSequence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame,
    fps,
    damping: 9,
    stiffness: 170,
    mass: 0.7,
  });
  const y = interpolate(pop, [0, 1], [90, -40], { extrapolateRight: "clamp" });
  const glow = interpolate(frame, [0, 30], [0.3, 0.9], {
    extrapolateRight: "clamp",
  });
  const flameScale = interpolate(frame, [0, 30], [0.8, 1.4], {
    extrapolateRight: "clamp",
  });
  const jitter = Math.sin(frame / 6) * (1 - pop) * 3;
  const smoke = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const seed = Math.sin(i * 31.7);
        return {
          dx: (seed * 40) % 28,
          size: 24 + ((seed * 23) % 22),
          delay: i * 2,
        };
      }),
    [],
  );
  const starBursts = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const seed = Math.sin(i * 55.5);
        return {
          angle: ((seed + 1) / 2) * Math.PI * 2,
          speed: 12 + ((seed * 100) % 18),
          hue: 180 + ((seed * 400) % 120),
        };
      }),
    [],
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        position: "relative",
        transform: `translateY(${y}px) translateX(${jitter}px) scale(${1 + pop * 0.2})`,
        filter: `drop-shadow(0 0 40px rgba(255,125,213,${glow}))`,
      }}
    >
      <div style={{ position: "relative", width: 240, height: 240 }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 12,
            width: 140,
            height: 50,
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse at 50% 50%, rgba(255,125,213,0.55), transparent 70%)",
            filter: "blur(8px)",
            opacity: 0.7,
          }}
        />
        {smoke.map((puff, idx) => {
          const progress = Math.max(0, Math.min(1, (frame - puff.delay) / 20));
          const rise = interpolate(progress, [0, 1], [0, -65], {
            extrapolateRight: "clamp",
          });
          const size = puff.size * (0.6 + progress * 0.9);
          const opacity = interpolate(progress, [0, 1], [0.8, 0], {
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: `calc(50% - 18px + ${puff.dx}px)`,
                bottom: 6 + rise,
                width: size,
                height: size,
                borderRadius: "50%",
                background: "rgba(200,215,255,0.28)",
                filter: "blur(10px)",
                opacity,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 16,
            width: 32,
            height: 90,
            transform: `translateX(-50%) scaleY(${flameScale})`,
            background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,125,213,0.9) 40%, rgba(255,110,80,0.9) 100%)",
            filter: "blur(6px)",
            borderRadius: 20,
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 20,
            transform: `translateX(-50%) rotate(${interpolate(pop, [0, 1], [6, -4], {
              extrapolateRight: "clamp",
            })}deg)`,
          }}
        >
          <RocketIcon size={220} />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        >
          {starBursts.map((burst, idx) => {
            const travel = burst.speed * pop * 16;
            const x = Math.cos(burst.angle) * travel;
            const yStar = Math.sin(burst.angle) * travel - pop * 10;
            const opacity = Math.max(0, 0.8 - pop * 0.8);
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${x}px)`,
                  top: `calc(40% + ${yStar}px)`,
                  width: 6,
                  height: 30,
                  background: `linear-gradient(180deg, hsla(${burst.hue}, 90%, 70%, 0.9), transparent)`,
                  transform: `translate(-50%, -50%) rotate(${(burst.angle * 180) / Math.PI}deg)`,
                  filter: "blur(1px)",
                  opacity,
                }}
              />
            );
          })}
        </div>
      </div>
      <div
        style={{
          fontSize: "clamp(42px, 3vw, 70px)",
          fontWeight: 700,
          color: "#fefcff",
          textShadow: "0 12px 50px rgba(0,0,0,0.55), 0 0 40px rgba(143,244,255,0.6)",
        }}
      >
        Starting Jump Drive
      </div>
    </div>
  );
};

const StarculatorReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame,
    fps,
    damping: 12,
    stiffness: 150,
  });
  const scale = interpolate(pop, [0, 1], [0.85, 1.08], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const slideX = interpolate(frame, [0, 24], [160, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const tilt = interpolate(frame, [0, 24], [18, 8], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const ribbonShift = interpolate(frame, [0, 24], [-120, 40], {
    extrapolateRight: "clamp",
  });
  const pulse = interpolate(frame % 50, [0, 25, 50], [0.4, 1, 0.4]);

  return (
    <div
      style={{
        width: "90%",
        maxWidth: 1600,
        margin: "0 auto",
        perspective: 1600,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "60px 72px",
          borderRadius: 36,
          background: "rgba(6,8,20,0.85)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "0 30px 90px rgba(0,0,0,0.6), 0 0 80px rgba(143,244,255,0.4), 0 0 60px rgba(255,125,213,0.35)",
          overflow: "hidden",
          transformStyle: "preserve-3d",
          transform: `rotateY(${tilt}deg) rotateX(${tilt / 2}deg) translateZ(40px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-30% -30% -10% -30%",
            background:
              "radial-gradient(circle at 30% 40%, rgba(143,244,255,0.18), transparent 40%), radial-gradient(circle at 70% 60%, rgba(255,125,213,0.25), transparent 38%)",
            transform: `translateX(${ribbonShift * -0.4}px) translateZ(-80px)`,
            filter: "blur(6px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -200,
            width: 520,
            height: 520,
            background: "conic-gradient(from 120deg, rgba(143,244,255,0.22), rgba(255,125,213,0.14), rgba(143,244,255,0.22))",
            borderRadius: "50%",
            filter: "blur(16px)",
            opacity: 0.8,
            transform: `translateX(${ribbonShift * 0.8}px) translateZ(-60px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(120deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
            mixBlendMode: "screen",
            transform: `translateX(${ribbonShift}px) translateZ(-20px) skewX(-8deg)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -140,
            right: -140,
            bottom: -160,
            height: 260,
            background: "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.75), transparent 70%)",
            transform: "rotateX(75deg) translateZ(-120px)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 28,
            transform: `translateX(${slideX}px) translateZ(60px)`,
          }}
        >
          <div
            style={{
              width: 210,
              height: 210,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8ff4ff, #ff7dd5)",
              boxShadow:
                "0 20px 80px rgba(0,0,0,0.5), 0 0 80px rgba(255,125,213,0.6), 0 0 70px rgba(143,244,255,0.55)",
              display: "grid",
              placeItems: "center",
              color: "#040611",
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: -2,
              transform: "rotateZ(-10deg) translateZ(12px)",
            }}
          >
            SC
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontSize: "clamp(56px, 5vw, 110px)",
                fontWeight: 900,
                color: "#fef7ff",
                letterSpacing: -1,
                textShadow:
                  "0 12px 40px rgba(0,0,0,0.55), 0 0 40px rgba(143,244,255,0.5), 0 0 30px rgba(255,125,213,0.4)",
              }}
            >
              Starculator.space
            </div>
            <div
              style={{
                width: 360,
                height: 16,
                borderRadius: 16,
                background: "linear-gradient(90deg, rgba(143,244,255,0.85), rgba(255,125,213,0.75))",
                boxShadow: `0 0 30px rgba(255,125,213,${pulse}), 0 0 40px rgba(143,244,255,${pulse})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const TRAILER_DURATION = 420; // 14s @30fps

export const StarculatorTrailerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const starOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outroDarken = interpolate(frame, [360, 420], [0, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: backgroundGradient,
        overflow: "hidden",
        color: "#e6f6ff",
        fontFamily: "'SF Pro Display', 'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <StarField opacity={starOpacity} />

      <Sequence from={15} durationInFrames={75}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NixosSequence />
        </div>
      </Sequence>

      <Sequence from={90} durationInFrames={105}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TechStackSequence />
        </div>
      </Sequence>

      <Sequence from={195} durationInFrames={90}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <JumpDriveSequence />
        </div>
      </Sequence>

      <Sequence from={285} durationInFrames={105}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StarculatorReveal />
        </div>
      </Sequence>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(0,0,0,${outroDarken})`,
          transition: "background 0.3s linear",
          pointerEvents: "none",
        }}
      />

      <SceneProgressBar />
    </AbsoluteFill>
  );
};
