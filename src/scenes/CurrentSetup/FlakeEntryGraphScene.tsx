import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { SceneProgressBar } from "../../components/SceneProgressBar";

export const FLAKE_ENTRY_GRAPH_DURATION = 648; // 21.60 seconds @ 30fps, cut 00:41:49 -> 01:04:07

const BASE_WIDTH = 3440;

const HOT_PINK = "#ff5da2";
const NIX_ORANGE = "#ff9f4a";
const NEUTRAL_BLUE = "#7fe8ff";
const SOFT_WHITE = "#f7f4ff";

const BASE_LAYOUT = {
  frame: {
    paddingX: 120,
    paddingY: 88,
  },
  stage: {
    width: 3060,
    height: 1180,
  },
  size: {
    repo: 620,
    world: 730,
    worldFinal: 560,
    orbit: 118,
    flake: 420,
    hub: 270,
    beam: 10,
    pulse: 30,
  },
  text: {
    repo: 154,
    world: 124,
    flake: 100,
  },
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

const progressBetween = (frame: number, start: number, end: number) =>
  clamp01(
    interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

const presenceBetween = (
  frame: number,
  fadeInStart: number,
  fadeInEnd: number,
  fadeOutStart: number,
  fadeOutEnd: number,
) =>
  clamp01(
    interpolate(
      frame,
      [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
      [0, 1, 1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ),
  );

const FolderSplitIcon: React.FC<{ colorLeft: string; colorRight: string }> = ({
  colorLeft,
  colorRight,
}) => (
  <svg viewBox="0 0 140 120" style={{ width: "76%", height: "76%" }}>
    <path
      d="M18 34 H54 L66 46 H122 V98 H18 Z"
      fill="rgba(255,255,255,0.04)"
      stroke={SOFT_WHITE}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path
      d="M24 52 H68 V92 H24 Z"
      fill={`${colorLeft}30`}
      stroke={colorLeft}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path
      d="M72 52 H116 V92 H72 Z"
      fill={`${colorRight}30`}
      stroke={colorRight}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <line
      x1="70"
      y1="50"
      x2="70"
      y2="94"
      stroke={SOFT_WHITE}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const GearIcon: React.FC<{ color: string; rotation?: number }> = ({
  color,
  rotation = 0,
}) => (
  <svg
    viewBox="0 0 120 120"
    style={{
      width: "76%",
      height: "76%",
      transform: `rotate(${rotation}deg)`,
    }}
  >
    <circle
      cx="60"
      cy="60"
      r="26"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="6"
    />
    {[0, 60, 120, 180, 240, 300].map((deg) => (
      <rect
        key={deg}
        x="56"
        y="8"
        width="8"
        height="22"
        rx="4"
        fill={color}
        transform={`rotate(${deg} 60 60)`}
      />
    ))}
  </svg>
);

const HomeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 140 120" style={{ width: "76%", height: "76%" }}>
    <path
      d="M22 64 L70 26 L118 64 V106 H22 Z"
      fill={`${color}20`}
      stroke={color}
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <rect
      x="54"
      y="72"
      width="32"
      height="34"
      rx="6"
      fill={`${color}28`}
      stroke={color}
      strokeWidth="5"
    />
  </svg>
);

const ServerIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "76%", height: "76%" }}>
    <rect
      x="24"
      y="24"
      width="72"
      height="28"
      rx="8"
      fill={`${color}18`}
      stroke={color}
      strokeWidth="5"
    />
    <rect
      x="24"
      y="66"
      width="72"
      height="28"
      rx="8"
      fill={`${color}18`}
      stroke={color}
      strokeWidth="5"
    />
    <circle cx="38" cy="38" r="4" fill={color} />
    <circle cx="38" cy="80" r="4" fill={color} />
  </svg>
);

const WindowIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 120 120" style={{ width: "76%", height: "76%" }}>
    <rect
      x="24"
      y="24"
      width="72"
      height="72"
      rx="12"
      fill={`${color}18`}
      stroke={color}
      strokeWidth="5"
    />
    <line x1="60" y1="24" x2="60" y2="96" stroke={color} strokeWidth="4" />
    <line x1="24" y1="60" x2="96" y2="60" stroke={color} strokeWidth="4" />
  </svg>
);

const FlakeIcon: React.FC<{ color: string; rotation?: number }> = ({
  color,
  rotation = 0,
}) => (
  <svg
    viewBox="0 0 120 120"
    style={{
      width: "76%",
      height: "76%",
      transform: `rotate(${rotation}deg)`,
    }}
  >
    <g stroke={color} strokeWidth="6" strokeLinecap="round">
      <line x1="60" y1="12" x2="60" y2="108" />
      <line x1="12" y1="60" x2="108" y2="60" />
      <line x1="24" y1="24" x2="96" y2="96" />
      <line x1="96" y1="24" x2="24" y2="96" />
    </g>
    <circle
      cx="60"
      cy="60"
      r="12"
      fill={`${color}22`}
      stroke={color}
      strokeWidth="5"
    />
  </svg>
);

const IconShell: React.FC<{
  size: number;
  accent: string;
  roundness?: string;
  opacity?: number;
  children: React.ReactNode;
}> = ({ size, accent, roundness = "36%", opacity = 1, children }) => (
  <div
    style={{
      position: "relative",
      width: size,
      height: size,
      opacity,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: -size * 0.18,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}26, transparent 72%)`,
        opacity: 0.9,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: roundness,
        background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.12), rgba(13,11,36,0.94) 68%)`,
        border: `1px solid ${accent}66`,
        boxShadow: `0 30px 90px rgba(4,0,24,0.55), 0 0 40px ${accent}28`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  </div>
);

const EnergyBeam: React.FC<{
  start: { x: number; y: number };
  end: { x: number; y: number };
  progress: number;
  accent: string;
  thickness: number;
  pulseSize: number;
}> = ({ start, end, progress, accent, thickness, pulseSize }) => {
  if (progress <= 0) {
    return null;
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const pulseX = start.x + dx * progress;
  const pulseY = start.y + dy * progress;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: start.x,
          top: start.y,
          width: distance,
          height: thickness,
          borderRadius: 999,
          transform: `translateY(-50%) rotate(${angle}deg) scaleX(${progress})`,
          transformOrigin: "0 50%",
          background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.96))`,
          boxShadow: `0 0 24px ${accent}, 0 0 42px ${accent}44`,
          zIndex: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: pulseX - pulseSize / 2,
          top: pulseY - pulseSize / 2,
          width: pulseSize,
          height: pulseSize,
          borderRadius: "50%",
          background: accent,
          boxShadow: `0 0 28px ${accent}, 0 0 44px ${accent}55`,
          zIndex: 9,
        }}
      />
    </>
  );
};

const OrbitBubble: React.FC<{
  angle: number;
  distance: number;
  size: number;
  accent: string;
  center: number;
  centerY: number;
  icon: React.ReactNode;
}> = ({ angle, distance, size, accent, center, centerY, icon }) => {
  const radians = (angle * Math.PI) / 180;

  return (
    <div
      style={{
        position: "absolute",
        left: center + Math.cos(radians) * distance - size / 2,
        top: centerY + Math.sin(radians) * distance - size / 2,
        width: size,
        height: size,
        borderRadius: "36%",
        background: `linear-gradient(145deg, rgba(10,12,30,0.92), rgba(24,12,48,0.88))`,
        border: `1px solid ${accent}58`,
        boxShadow: `0 16px 50px rgba(0,0,0,0.42), 0 0 26px ${accent}22`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
  );
};

const RepoCore: React.FC<{
  x: number;
  y: number;
  size: number;
  labelSize: number;
  reveal: number;
  split: number;
  frame: number;
}> = ({ x, y, size, labelSize, reveal, split, frame }) => {
  if (reveal <= 0) {
    return null;
  }

  const spin = frame * 1.2;
  const opacity =
    reveal *
    clamp01(
      interpolate(split, [0, 0.58, 0.82], [1, 0.72, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
  const scale = mix(0.78, 1, reveal) * mix(1, 0.9, split);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        zIndex: 4,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -size * 0.12,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,93,162,0.16), rgba(127,232,255,0.06) 48%, transparent 72%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: size * 0.03,
          borderRadius: "50%",
          background: `conic-gradient(from ${spin}deg, ${NIX_ORANGE}00 0deg, ${NIX_ORANGE}aa 68deg, transparent 108deg, ${NEUTRAL_BLUE}aa 188deg, transparent 276deg, ${HOT_PINK}88 336deg, transparent 360deg)`,
          boxShadow: "0 0 36px rgba(255,255,255,0.08)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: size * 0.12,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 32% 30%, rgba(255,255,255,0.16), rgba(10,10,30,0.96) 68%)",
          border: "1px solid rgba(255,255,255,0.12)",
          overflow: "hidden",
          boxShadow: "0 40px 120px rgba(4,0,20,0.72)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,159,74,0.16) 0%, rgba(255,159,74,0.12) 48%, rgba(127,232,255,0.12) 52%, rgba(127,232,255,0.16) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "16%",
            bottom: "16%",
            width: size * 0.016,
            transform: `translateX(-50%) scaleY(${mix(0.2, 1, split)})`,
            borderRadius: 999,
            background:
              "linear-gradient(180deg, rgba(255,159,74,0.92), rgba(255,255,255,0.9), rgba(127,232,255,0.92))",
            boxShadow:
              "0 0 24px rgba(255,159,74,0.26), 0 0 24px rgba(127,232,255,0.26)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "34%",
            transform: "translate(-50%, -50%)",
            width: size * 0.34,
            height: size * 0.34,
          }}
        >
          <IconShell
            size={size * 0.34}
            accent={SOFT_WHITE}
            roundness="30%"
            opacity={1}
          >
            <FolderSplitIcon colorLeft={NIX_ORANGE} colorRight={NEUTRAL_BLUE} />
          </IconShell>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "16%",
            transform: "translateX(-50%)",
            fontSize: labelSize,
            lineHeight: 0.9,
            fontWeight: 800,
            letterSpacing: 1.6,
            color: SOFT_WHITE,
            textAlign: "center",
            textShadow: "0 18px 40px rgba(0,0,0,0.42)",
            whiteSpace: "nowrap",
          }}
        >
          repo/
        </div>
      </div>
    </div>
  );
};

const WorldPlanet: React.FC<{
  label: "hosts/" | "home/";
  accent: string;
  x: number;
  y: number;
  size: number;
  reveal: number;
  focus: number;
  orbitFrame: number;
  icon: React.ReactNode;
  orbiters: React.ReactNode[];
  orbitAngles: number[];
  labelSize: number;
  kind: "system" | "user";
}> = ({
  label,
  accent,
  x,
  y,
  size,
  reveal,
  focus,
  orbitFrame,
  icon,
  orbiters,
  orbitAngles,
  labelSize,
  kind,
}) => {
  if (reveal <= 0) {
    return null;
  }

  const floatY = Math.sin(orbitFrame / 18) * 12;
  const shellSpin = kind === "system" ? orbitFrame * 0.9 : -orbitFrame * 0.8;
  const scale = mix(0.18, 1, reveal) * mix(1, 1.05, focus);
  const opacity = clamp01(reveal * 1.08);
  const center = size / 2;
  const orbitDistance = size * 0.39;
  const orbitSize = size * 0.17;
  const patternPulse = 0.6 + Math.sin(orbitFrame / 12) * 0.12;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) translateY(${mix(140, 0, reveal) + floatY}px) scale(${scale})`,
        opacity,
        zIndex: 6 + Math.round(focus * 3),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -size * 0.16,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}22, transparent 70%)`,
          opacity: 0.85,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from ${shellSpin}deg, ${accent}00 0deg, ${accent}aa 54deg, transparent 112deg, rgba(255,255,255,0.1) 180deg, transparent 245deg, ${accent}88 320deg, transparent 360deg)`,
          opacity: 0.86,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: size * 0.1,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.14), rgba(11,10,30,0.96) 68%)`,
          border: `1px solid ${accent}50`,
          boxShadow: `0 40px 120px rgba(4,0,20,0.76), 0 0 54px ${accent}18`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0) 30%, rgba(255,255,255,0.02) 70%, rgba(0,0,0,0.18) 100%)",
          }}
        />

        {kind === "system" ? (
          <>
            {[0, 1, 2, 3].map((index) => (
              <div
                key={`system-bar-${index}`}
                style={{
                  position: "absolute",
                  left: "18%",
                  top: `${22 + index * 11}%`,
                  width: `${48 + index * 8}%`,
                  height: size * 0.022,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.12))`,
                  boxShadow: `0 0 16px ${accent}22`,
                  opacity: patternPulse - index * 0.08,
                }}
              />
            ))}
          </>
        ) : (
          <>
            {[
              { left: "18%", top: "24%" },
              { left: "48%", top: "24%" },
              { left: "18%", top: "50%" },
              { left: "48%", top: "50%" },
            ].map((tile, index) => (
              <div
                key={`user-tile-${index}`}
                style={{
                  position: "absolute",
                  left: tile.left,
                  top: tile.top,
                  width: "22%",
                  height: "16%",
                  borderRadius: size * 0.03,
                  background: `linear-gradient(145deg, ${accent}1f, rgba(255,255,255,0.05))`,
                  border: `1px solid ${accent}3e`,
                  opacity:
                    0.7 + Math.sin((orbitFrame + index * 12) / 11) * 0.12,
                }}
              />
            ))}
          </>
        )}

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "41%",
            transform: "translate(-50%, -50%)",
            width: size * 0.31,
            height: size * 0.31,
          }}
        >
          <IconShell size={size * 0.31} accent={accent} roundness="32%">
            {icon}
          </IconShell>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "14%",
            transform: "translateX(-50%)",
            fontSize: labelSize * 0.9,
            lineHeight: 0.88,
            fontWeight: 800,
            color: SOFT_WHITE,
            letterSpacing: label === "home/" ? 0.6 : 1.1,
            textAlign: "center",
            textShadow: `0 18px 40px ${accent}30`,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>

      {orbiters.map((orbiter, index) => (
        <OrbitBubble
          key={`${label}-orbiter-${index}`}
          angle={
            orbitAngles[index] + Math.sin((orbitFrame + index * 15) / 18) * 10
          }
          distance={orbitDistance}
          size={orbitSize}
          accent={accent}
          center={center}
          centerY={center}
          icon={orbiter}
        />
      ))}
    </div>
  );
};

const FlakeBeacon: React.FC<{
  x: number;
  y: number;
  size: number;
  labelSize: number;
  reveal: number;
  frame: number;
}> = ({ x, y, size, labelSize, reveal, frame }) => {
  if (reveal <= 0) {
    return null;
  }

  const spin = frame * 1.6;
  const pulse = 0.94 + Math.sin(frame / 10) * 0.04;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 0.88,
        transform: `translate(-50%, -50%) translateY(${mix(-220, 0, reveal)}px) scale(${mix(
          0.42,
          1,
          reveal,
        )})`,
        opacity: clamp01(reveal * 1.08),
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: size * 0.18,
          width: size * 0.58,
          height: size * 0.58,
          transform: `translate(-50%, -50%) rotate(${spin}deg) scale(${pulse})`,
          borderRadius: "34%",
          background: `conic-gradient(from 0deg, ${HOT_PINK}00 0deg, ${HOT_PINK}aa 60deg, transparent 120deg, rgba(255,255,255,0.12) 180deg, transparent 240deg, ${HOT_PINK}aa 300deg, transparent 360deg)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: size * 0.18,
          transform: "translate(-50%, -50%)",
          width: size * 0.38,
          height: size * 0.38,
        }}
      >
        <IconShell size={size * 0.38} accent={HOT_PINK} roundness="30%">
          <FlakeIcon color={HOT_PINK} rotation={-spin * 0.6} />
        </IconShell>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          fontSize: labelSize,
          lineHeight: 0.88,
          fontWeight: 800,
          color: SOFT_WHITE,
          letterSpacing: 1,
          textAlign: "center",
          textShadow: `0 18px 40px ${HOT_PINK}34`,
          whiteSpace: "nowrap",
        }}
      >
        flake.nix
      </div>
    </div>
  );
};

const BuildHub: React.FC<{
  x: number;
  y: number;
  size: number;
  reveal: number;
  frame: number;
}> = ({ x, y, size, reveal, frame }) => {
  if (reveal <= 0) {
    return null;
  }

  const ringSpin = frame * 1.4;
  const pulse = 0.94 + Math.sin(frame / 12) * 0.05;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) scale(${mix(0.32, pulse, reveal)})`,
        opacity: clamp01(reveal * 1.08),
        zIndex: 9,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -size * 0.24,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12), rgba(255,93,162,0.1) 42%, transparent 72%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from ${ringSpin}deg, ${NIX_ORANGE}00 0deg, ${NIX_ORANGE}aa 58deg, transparent 126deg, ${NEUTRAL_BLUE}aa 196deg, transparent 264deg, ${HOT_PINK}aa 332deg, transparent 360deg)`,
          boxShadow:
            "0 0 36px rgba(255,159,74,0.16), 0 0 36px rgba(127,232,255,0.16)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: size * 0.18,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 38% 30%, rgba(255,255,255,0.86), rgba(255,93,162,0.36) 36%, rgba(127,232,255,0.18) 60%, rgba(8,8,24,0.9) 100%)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow:
            "0 0 50px rgba(255,255,255,0.18), inset 0 0 50px rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FlakeIcon color={SOFT_WHITE} rotation={-ringSpin * 0.4} />
      </div>
    </div>
  );
};

export const FlakeEntryGraphScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const scaleValue = (value: number) => value * (width / BASE_WIDTH);
  const layout = {
    frame: {
      paddingX: scaleValue(BASE_LAYOUT.frame.paddingX),
      paddingY: scaleValue(BASE_LAYOUT.frame.paddingY),
    },
    stage: {
      width: scaleValue(BASE_LAYOUT.stage.width),
      height: scaleValue(BASE_LAYOUT.stage.height),
    },
    size: {
      repo: scaleValue(BASE_LAYOUT.size.repo),
      world: scaleValue(BASE_LAYOUT.size.world),
      worldFinal: scaleValue(BASE_LAYOUT.size.worldFinal),
      orbit: scaleValue(BASE_LAYOUT.size.orbit),
      flake: scaleValue(BASE_LAYOUT.size.flake),
      hub: scaleValue(BASE_LAYOUT.size.hub),
      beam: scaleValue(BASE_LAYOUT.size.beam),
      pulse: scaleValue(BASE_LAYOUT.size.pulse),
    },
    text: {
      repo: scaleValue(BASE_LAYOUT.text.repo),
      world: scaleValue(BASE_LAYOUT.text.world),
      flake: scaleValue(BASE_LAYOUT.text.flake),
    },
  };

  const stageReveal = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 120, mass: 1 },
  });

  const repoReveal = spring({
    fps,
    frame: frame - 4,
    config: { damping: 16, stiffness: 135, mass: 0.9 },
  });

  const splitProgress = spring({
    fps,
    frame: frame - 54,
    config: { damping: 16, stiffness: 112, mass: 1 },
  });

  const settleProgress = progressBetween(frame, 356, 500);
  const hostsFocus = presenceBetween(frame, 134, 186, 210, 252);
  const homeFocus = presenceBetween(frame, 204, 258, 288, 338);
  const flakeReveal = spring({
    fps,
    frame: frame - 252,
    config: { damping: 15, stiffness: 132, mass: 0.92 },
  });
  const flakeLinks = progressBetween(frame, 292, 360);
  const hubReveal = spring({
    fps,
    frame: frame - 392,
    config: { damping: 15, stiffness: 116, mass: 1 },
  });
  const hubLinks = progressBetween(frame, 428, 514);

  const stageCenterX = layout.stage.width * 0.5;
  const rootY = layout.stage.height * 0.52;
  const leftX = mix(stageCenterX, layout.stage.width * 0.24, splitProgress);
  const rightX = mix(stageCenterX, layout.stage.width * 0.76, splitProgress);
  const leftY = mix(
    rootY,
    mix(layout.stage.height * 0.58, layout.stage.height * 0.75, settleProgress),
    splitProgress,
  );
  const rightY = mix(
    rootY,
    mix(layout.stage.height * 0.58, layout.stage.height * 0.75, settleProgress),
    splitProgress,
  );
  const worldSize = mix(
    layout.size.repo * 0.96,
    mix(layout.size.world, layout.size.worldFinal, settleProgress),
    splitProgress,
  );

  const flakeX = stageCenterX;
  const flakeY = layout.stage.height * 0.23;
  const hubX = stageCenterX;
  const hubY = layout.stage.height * 0.58;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />

      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 24% 64%, rgba(255,159,74,0.16), transparent 32%), radial-gradient(circle at 76% 64%, rgba(127,232,255,0.16), transparent 32%), radial-gradient(circle at 50% 16%, rgba(255,93,162,0.14), transparent 28%)",
        }}
      />

      <AbsoluteFill
        style={{
          padding: `${layout.frame.paddingY}px ${layout.frame.paddingX}px`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: layout.stage.width,
            height: layout.stage.height,
            opacity: clamp01(stageReveal * 1.08),
            transform: `translateY(${mix(28, 0, stageReveal)}px)`,
          }}
        >
          <RepoCore
            x={stageCenterX}
            y={rootY}
            size={layout.size.repo}
            labelSize={layout.text.repo}
            reveal={repoReveal}
            split={splitProgress}
            frame={frame}
          />

          <WorldPlanet
            label="hosts/"
            accent={NIX_ORANGE}
            x={leftX}
            y={leftY}
            size={worldSize}
            reveal={splitProgress}
            focus={hostsFocus}
            orbitFrame={frame}
            labelSize={layout.text.world}
            kind="system"
            icon={<GearIcon color={NIX_ORANGE} rotation={frame * 2.2} />}
            orbiters={[
              <ServerIcon color={NIX_ORANGE} />,
              <GearIcon color={NIX_ORANGE} rotation={-frame * 2} />,
              <FlakeIcon color={NIX_ORANGE} rotation={frame} />,
            ]}
            orbitAngles={[184, 278, 334]}
          />

          <WorldPlanet
            label="home/"
            accent={NEUTRAL_BLUE}
            x={rightX}
            y={rightY}
            size={worldSize}
            reveal={progressBetween(frame, 74, 164)}
            focus={homeFocus}
            orbitFrame={frame + 18}
            labelSize={layout.text.world}
            kind="user"
            icon={<HomeIcon color={NEUTRAL_BLUE} />}
            orbiters={[
              <HomeIcon color={NEUTRAL_BLUE} />,
              <WindowIcon color={NEUTRAL_BLUE} />,
              <FlakeIcon color={NEUTRAL_BLUE} rotation={-frame} />,
            ]}
            orbitAngles={[208, 278, 330]}
          />

          <FlakeBeacon
            x={flakeX}
            y={flakeY}
            size={layout.size.flake}
            labelSize={layout.text.flake}
            reveal={flakeReveal}
            frame={frame}
          />

          <EnergyBeam
            start={{
              x: flakeX - layout.size.flake * 0.12,
              y: flakeY + layout.size.flake * 0.15,
            }}
            end={{
              x: leftX + worldSize * 0.08,
              y: leftY - worldSize * 0.22,
            }}
            progress={flakeLinks}
            accent={NIX_ORANGE}
            thickness={layout.size.beam}
            pulseSize={layout.size.pulse}
          />

          <EnergyBeam
            start={{
              x: flakeX + layout.size.flake * 0.12,
              y: flakeY + layout.size.flake * 0.15,
            }}
            end={{
              x: rightX - worldSize * 0.08,
              y: rightY - worldSize * 0.22,
            }}
            progress={flakeLinks}
            accent={NEUTRAL_BLUE}
            thickness={layout.size.beam}
            pulseSize={layout.size.pulse}
          />

          <BuildHub
            x={hubX}
            y={hubY}
            size={layout.size.hub}
            reveal={hubReveal}
            frame={frame}
          />

          <EnergyBeam
            start={{
              x: leftX + worldSize * 0.17,
              y: leftY - worldSize * 0.08,
            }}
            end={{
              x: hubX - layout.size.hub * 0.22,
              y: hubY,
            }}
            progress={hubLinks}
            accent={NIX_ORANGE}
            thickness={layout.size.beam}
            pulseSize={layout.size.pulse}
          />

          <EnergyBeam
            start={{
              x: rightX - worldSize * 0.17,
              y: rightY - worldSize * 0.08,
            }}
            end={{
              x: hubX + layout.size.hub * 0.22,
              y: hubY,
            }}
            progress={hubLinks}
            accent={NEUTRAL_BLUE}
            thickness={layout.size.beam}
            pulseSize={layout.size.pulse}
          />

          <EnergyBeam
            start={{
              x: flakeX,
              y: flakeY + layout.size.flake * 0.2,
            }}
            end={{
              x: hubX,
              y: hubY - layout.size.hub * 0.26,
            }}
            progress={hubReveal * 0.9}
            accent={HOT_PINK}
            thickness={layout.size.beam}
            pulseSize={layout.size.pulse}
          />
        </div>
        <SceneProgressBar colors={["#ff5da2", "#7fe8ff"]} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
