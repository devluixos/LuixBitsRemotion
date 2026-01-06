/*
 * Layout checklist:
 * - 3440x1440 scale: +20-30% sizes
 * - No overlaps; keep safe margins
 * - Labels readable on mobile
 * - Tags/lines sit below icon baselines
 * - Recenter remaining element after fades
 * - Keep the sun bright; avoid heavy scrims
 */

import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { SceneProgressBar } from "../../components/SceneProgressBar";

const NIX_ORANGE = "#ff9f4a";
const NEON_BLUE = "#7fe8ff";
const ACCENT_GREEN = "#8affcf";
const HOT_PINK = "#ff7eb6";
const LILAC = "#b47cff";
const SOFT_WHITE = "#f7f4ff";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const fadeInOut = (frame: number, start: number, end: number, fadeIn = 12, fadeOut = 12) =>
  interpolate(frame, [start, start + fadeIn, end - fadeOut, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const typewriter = (text: string, progress: number) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor(text.length * clamp01(progress)))));

const NIX_SNIPPET_KEYWORDS = [
  { token: "nixvim", color: ACCENT_GREEN },
  { token: "\"tokyonight\"", color: LILAC },
];

const highlightSnippet = (text: string): ReactNode[] => {
  let nodes: ReactNode[] = [text];
  NIX_SNIPPET_KEYWORDS.forEach((rule, ruleIdx) => {
    nodes = nodes.flatMap((segment, segmentIdx) => {
      if (typeof segment !== "string") return [segment];
      const parts = segment.split(rule.token);
      if (parts.length === 1) return [segment];
      const result: ReactNode[] = [];
      parts.forEach((part, partIdx) => {
        if (part) result.push(part);
        if (partIdx < parts.length - 1) {
          result.push(
            <span
              key={`hl-${ruleIdx}-${segmentIdx}-${partIdx}`}
              style={{
                color: rule.color,
                textShadow: `0 0 8px ${rule.color}66`,
              }}
            >
              {rule.token}
            </span>,
          );
        }
      });
      return result;
    });
  });
  return nodes;
};

const IconShell: React.FC<{
  size?: number | string;
  accent: string;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ size = "clamp(200px, 13vw, 360px)", accent, style, children }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 34,
      background: `linear-gradient(150deg, rgba(10,12,30,0.92), rgba(26,14,52,0.85)), radial-gradient(circle at 20% 20%, ${accent}40, transparent 65%)`,
      border: `1px solid ${accent}66`,
      boxShadow: `0 26px 90px rgba(0,0,0,0.65), 0 0 60px ${accent}99`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

const NixHexIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "72%", height: "72%" }}>
    <polygon
      points="50,6 92,26 92,74 50,94 8,74 8,26"
      fill="rgba(255,159,74,0.18)"
      stroke={color}
      strokeWidth="6"
    />
    <text
      x="50"
      y="58"
      textAnchor="middle"
      fontFamily="'JetBrains Mono', 'Fira Code', monospace"
      fontSize="26"
      fill={SOFT_WHITE}
      fontWeight="700"
    >
      NIX
    </text>
  </svg>
);

const NeovimDiamondIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "72%", height: "72%" }}>
    <polygon
      points="50,6 94,50 50,94 6,50"
      fill="rgba(127,232,255,0.16)"
      stroke={color}
      strokeWidth="6"
    />
    <text
      x="50"
      y="58"
      textAnchor="middle"
      fontFamily="'JetBrains Mono', 'Fira Code', monospace"
      fontSize="26"
      fill={SOFT_WHITE}
      fontWeight="700"
    >
      NV
    </text>
  </svg>
);

const LuaIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "72%", height: "72%" }}>
    <circle cx="50" cy="50" r="32" fill="rgba(127,232,255,0.14)" stroke={color} strokeWidth="6" />
    <circle cx="66" cy="34" r="12" fill={color} opacity="0.85" />
  </svg>
);

const PaletteIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "72%", height: "72%" }}>
    <circle cx="50" cy="50" r="34" fill="rgba(255,159,74,0.12)" stroke={color} strokeWidth="6" />
    <circle cx="36" cy="42" r="6" fill="#ffb347" />
    <circle cx="54" cy="34" r="6" fill="#ff7eb6" />
    <circle cx="64" cy="52" r="6" fill="#7fe8ff" />
    <circle cx="42" cy="62" r="6" fill="#8affcf" />
  </svg>
);

const ServerIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "72%", height: "72%" }}>
    <rect x="22" y="22" width="56" height="18" rx="6" fill="rgba(138,255,207,0.12)" stroke={color} strokeWidth="5" />
    <rect x="22" y="44" width="56" height="18" rx="6" fill="rgba(138,255,207,0.12)" stroke={color} strokeWidth="5" />
    <rect x="22" y="66" width="56" height="12" rx="6" fill="rgba(138,255,207,0.12)" stroke={color} strokeWidth="5" />
    <circle cx="32" cy="31" r="4" fill={color} />
    <circle cx="32" cy="53" r="4" fill={color} />
    <circle cx="32" cy="72" r="4" fill={color} />
  </svg>
);

const PuzzleIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "72%", height: "72%" }}>
    <rect x="24" y="24" width="52" height="52" rx="12" fill="rgba(127,232,255,0.12)" stroke={color} strokeWidth="5" />
    <circle cx="50" cy="24" r="8" fill={color} opacity="0.7" />
    <circle cx="76" cy="50" r="8" fill={color} opacity="0.7" />
  </svg>
);

const FlakeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "72%", height: "72%" }}>
    <g stroke={color} strokeWidth="6" strokeLinecap="round">
      <line x1="50" y1="12" x2="50" y2="88" />
      <line x1="12" y1="50" x2="88" y2="50" />
      <line x1="20" y1="20" x2="80" y2="80" />
      <line x1="80" y1="20" x2="20" y2="80" />
    </g>
  </svg>
);

const HomeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "72%", height: "72%" }}>
    <polygon
      points="50,16 86,44 86,84 14,84 14,44"
      fill="rgba(138,255,207,0.12)"
      stroke={color}
      strokeWidth="6"
    />
    <rect x="40" y="56" width="20" height="28" rx="4" fill={color} opacity="0.65" />
  </svg>
);

const NixOsIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg viewBox="0 0 100 100" style={{ width: "72%", height: "72%" }}>
    <polygon
      points="50,6 92,26 92,74 50,94 8,74 8,26"
      fill="rgba(127,232,255,0.12)"
      stroke={color}
      strokeWidth="6"
    />
    <g stroke={color} strokeWidth="5" strokeLinecap="round">
      <line x1="50" y1="26" x2="50" y2="74" />
      <line x1="30" y1="38" x2="70" y2="62" />
      <line x1="70" y1="38" x2="30" y2="62" />
    </g>
  </svg>
);

const IconBadge: React.FC<{
  label: string;
  accent: string;
  size?: number | string;
  children: ReactNode;
  labelStyle?: CSSProperties;
}> = ({ label, accent, size, children, labelStyle }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
    <IconShell size={size} accent={accent}>
      {children}
    </IconShell>
    <div
      style={{
        fontSize: "clamp(34px, 2.4vw, 56px)",
        fontWeight: 600,
        letterSpacing: 1,
        color: SOFT_WHITE,
        textAlign: "center",
        ...labelStyle,
      }}
    >
      {label}
    </div>
  </div>
);

export const NIXVIM_DEFINITION_DURATION = 1020;

export const NixvimDefinitionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t06 = 6 * fps;
  const t10 = 10 * fps;
  const t14 = 14 * fps;
  const t18 = 18 * fps;
  const t21 = 21 * fps;
  const t27 = 27 * fps;
  const t30 = 30 * fps;
  const t32 = 32 * fps;
  const t34 = 34 * fps;

  const introTitleOpacity = interpolate(frame, [0, 16, 48, 72], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const introUnderlineScale = 0.9 + Math.sin(frame / 10) * 0.08;
  const introScrimOpacity = interpolate(frame, [0, 14], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoStart = 2 * fps;
  const logoPop = spring({
    frame: frame - logoStart,
    fps,
    damping: 14,
    stiffness: 130,
  });
  const logoOpacity = fadeInOut(frame, logoStart - 12, t06, 16, 12);
  const logoX = interpolate(logoPop, [0, 1], [-260, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(logoPop, [0, 1], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoGlow = 0.35 + clamp01(logoPop) * 0.45;

  const subtitleStart = 5 * fps;
  const subtitleOpacity = fadeInOut(frame, subtitleStart, t06, 12, 10);
  const subtitleLift = interpolate(frame, [subtitleStart, subtitleStart + 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const terminalShift = Math.sin(frame / 40) * 40;
  const overlayFadeInEnd = subtitleStart + 18;
  const overlayHoldEnd = t06 - 8;
  const terminalOverlayOpacity = interpolate(frame, [subtitleStart, overlayFadeInEnd, overlayHoldEnd, t06], [0, 0.6, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const def1Opacity = fadeInOut(frame, t06, t10, 12, 10);
  const def1Scale = interpolate(
    spring({ frame: frame - t06, fps, damping: 14, stiffness: 120 }),
    [0, 1],
    [0.96, 1],
    { extrapolateRight: "clamp" },
  );
  const dottedProgress = clamp01((frame - t06) / 18);
  const dottedShift = frame * 6;

  const snippetOpacity = fadeInOut(frame, t10, t14, 12, 10);
  const snippetFrame = frame - t10;
  const lineOne = "programs.nixvim.enable = true;";
  const lineTwo = 'colorscheme = "tokyonight";';
  const lineOneProgress = clamp01(snippetFrame / 26);
  const lineTwoProgress = clamp01((snippetFrame - 26) / 30);
  const lineOneText = typewriter(lineOne, lineOneProgress);
  const lineTwoText = typewriter(lineTwo, lineTwoProgress);
  const lineOneNode = lineOneText.length === lineOne.length ? highlightSnippet(lineOneText) : lineOneText;
  const lineTwoNode = lineTwoText.length === lineTwo.length ? highlightSnippet(lineTwoText) : lineTwoText;
  const lineOneLabelOpacity = clamp01((snippetFrame - 14) / 10);
  const lineTwoLabelOpacity = clamp01((snippetFrame - 40) / 10);

  const pipelineOpacity = fadeInOut(frame, t14, t18, 12, 10);
  const pipelineSheen = frame * 3.2;
  const arrowOneProgress = clamp01((frame - (t14 + 10)) / 18);
  const arrowTwoProgress = clamp01((frame - (t14 + 24)) / 18);

  const summaryOpacity = fadeInOut(frame, t18, t21, 12, 10);
  const summaryScale = interpolate(
    spring({ frame: frame - t18, fps, damping: 16, stiffness: 120 }),
    [0, 1],
    [0.96, 1],
    { extrapolateRight: "clamp" },
  );
  const summarySheen = frame * 2.4;

  const convergeOpacity = fadeInOut(frame, t21, t27, 12, 12);
  const convergePop = spring({
    frame: frame - t21,
    fps,
    damping: 14,
    stiffness: 120,
  });
  const convergeProgress = clamp01(convergePop);
  const convergeArrowProgress = clamp01((frame - (t21 + 18)) / 18);
  const convergeGlow = interpolate(Math.sin(frame / 16), [-1, 1], [0.18, 0.5]);

  const envGlow = interpolate(Math.sin(frame / 18), [-1, 1], [0.15, 0.45]);
  const envLabelOpacity = fadeInOut(frame, t30, t34, 10, 10);

  const centerStage: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  };

  return (
    <AbsoluteFill
      style={{
        color: SOFT_WHITE,
        fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <VaporwaveBackground />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(4,4,18,0.82), rgba(4,4,18,0.55))",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          background:
            "radial-gradient(circle at 20% 20%, rgba(124,255,231,0.22), transparent 55%), radial-gradient(circle at 80% 20%, rgba(255,157,226,0.25), transparent 50%), radial-gradient(circle at 50% 80%, rgba(180,124,255,0.2), transparent 55%)",
          opacity: 0.5,
          transform: `translate(${Math.sin(frame / 60) * 30}px, ${Math.cos(frame / 70) * 20}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#050007",
          opacity: introScrimOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          background:
            "linear-gradient(120deg, rgba(10, 20, 40, 0.65), rgba(40, 10, 60, 0.7))",
          filter: "blur(80px)",
          opacity: terminalOverlayOpacity,
          transform: `translateX(${terminalShift}px)`,
        }}
      />

      <div style={{ ...centerStage, opacity: introTitleOpacity }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: "clamp(160px, 9vw, 280px)",
              fontWeight: 700,
              letterSpacing: 3,
              textShadow: "0 22px 70px rgba(0,0,0,0.7)",
              background: `linear-gradient(100deg, ${SOFT_WHITE} 10%, ${NIX_ORANGE} 40%, ${NEON_BLUE} 70%, ${SOFT_WHITE} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            What is Nixvim?
          </div>
          <div
            style={{
              marginTop: 26,
              height: 14,
              width: "76%",
              marginInline: "auto",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${NIX_ORANGE}, ${NEON_BLUE}, ${ACCENT_GREEN})`,
              transform: `scaleX(${introUnderlineScale})`,
              transformOrigin: "center",
              boxShadow: `0 0 40px ${NIX_ORANGE}aa`,
            }}
          />
        </div>
      </div>

      <div style={{ ...centerStage, opacity: logoOpacity }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 48,
            transform: `translateX(${logoX}px) scale(${logoScale})`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 54,
              padding: "36px 88px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg, rgba(8,10,26,0.92), rgba(18,12,40,0.75))",
              border: "1px solid rgba(255,255,255,0.26)",
              boxShadow: `0 30px 100px rgba(0,0,0,0.65), 0 0 70px rgba(255,159,74,${logoGlow})`,
            }}
          >
            <IconShell
              size="clamp(180px, 10vw, 260px)"
              accent={NIX_ORANGE}
              style={{ borderRadius: 26 }}
            >
              <NixHexIcon color={NIX_ORANGE} />
            </IconShell>
            <div
              style={{
                fontSize: "clamp(150px, 9.5vw, 260px)",
                fontWeight: 800,
                letterSpacing: 10,
                textShadow: "0 16px 50px rgba(0,0,0,0.45)",
              }}
            >
              <span style={{ color: SOFT_WHITE }}>NIX</span>
              <span style={{ color: NEON_BLUE }}>VIM</span>
            </div>
          </div>
          <div
            style={{
              fontSize: "clamp(40px, 3.2vw, 64px)",
              letterSpacing: 2,
              textTransform: "uppercase",
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleLift}px)`,
              padding: "20px 46px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.28)",
              background:
                "linear-gradient(120deg, rgba(255,159,74,0.3), rgba(127,232,255,0.2))",
              boxShadow: "0 0 30px rgba(255,159,74,0.35)",
            }}
          >
            Nix-driven Neovim config
          </div>
        </div>
      </div>

      <div style={{ ...centerStage, opacity: def1Opacity, transform: `scale(${def1Scale})` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 60, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 140 }}>
            <IconBadge label="Neovim" accent={NEON_BLUE}>
              <NeovimDiamondIcon color={NEON_BLUE} />
            </IconBadge>
            <div style={{ position: "relative", width: 520, height: 26 }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  width: "100%",
                  height: 7,
                  transform: `scaleX(${dottedProgress}) translateY(-50%)`,
                  transformOrigin: "left",
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(255,159,74,0.9) 0 8px, transparent 8px 16px)",
                  backgroundPosition: `${dottedShift}px 0`,
                  filter: "drop-shadow(0 0 16px rgba(255,159,74,0.75))",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "clamp(26px, 1.9vw, 38px)",
                  textTransform: "uppercase",
                  letterSpacing: 3,
                  color: "rgba(255,255,255,0.7)",
                  whiteSpace: "nowrap",
                }}
              >
                powered by
              </div>
            </div>
            <IconBadge label="Nix" accent={NIX_ORANGE}>
              <NixHexIcon color={NIX_ORANGE} />
            </IconBadge>
          </div>
          <div
            style={{
              fontSize: "clamp(64px, 4.2vw, 100px)",
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: SOFT_WHITE,
              background: `linear-gradient(100deg, ${SOFT_WHITE} 20%, ${NEON_BLUE} 60%, ${ACCENT_GREEN} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Nix modules -&gt; Neovim distro
          </div>
        </div>
      </div>

      <div style={{ ...centerStage, opacity: snippetOpacity }}>
        <div
          style={{
            width: "min(98vw, 3400px)",
            padding: "110px 160px",
            borderRadius: 64,
            background:
              "linear-gradient(135deg, rgba(10,12,26,0.96), rgba(22,12,44,0.8))",
            border: "1px solid rgba(255,255,255,0.28)",
            boxShadow: "0 46px 160px rgba(0,0,0,0.72), 0 0 90px rgba(127,232,255,0.32)",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: "clamp(64px, 3.8vw, 96px)",
            color: SOFT_WHITE,
            display: "flex",
            flexDirection: "column",
            gap: 52,
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span style={{ whiteSpace: "nowrap" }}>{lineOneNode || " "}</span>
            <span
              style={{
                fontSize: "clamp(38px, 2.4vw, 52px)",
                color: "rgba(255,255,255,0.65)",
                textTransform: "uppercase",
                letterSpacing: 2,
                opacity: lineOneLabelOpacity,
                whiteSpace: "nowrap",
                textAlign: "center",
                alignSelf: "center",
              }}
            >
              Editor options
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <span style={{ whiteSpace: "nowrap" }}>{lineTwoNode || " "}</span>
            <span
              style={{
                fontSize: "clamp(38px, 2.4vw, 52px)",
                color: "rgba(255,255,255,0.65)",
                textTransform: "uppercase",
                letterSpacing: 2,
                opacity: lineTwoLabelOpacity,
                whiteSpace: "nowrap",
                textAlign: "center",
                alignSelf: "center",
              }}
            >
              Plugin options
            </span>
          </div>
        </div>
      </div>

      <div style={{ ...centerStage, opacity: pipelineOpacity }}>
        <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
          {[
            {
              label: "Nix config",
              accent: NIX_ORANGE,
              icon: <NixHexIcon color={NIX_ORANGE} />,
            },
            {
              label: "Lua output",
              accent: NEON_BLUE,
              icon: <LuaIcon color={NEON_BLUE} />,
            },
            {
              label: "Neovim",
              accent: ACCENT_GREEN,
              icon: <NeovimDiamondIcon color={ACCENT_GREEN} />,
            },
          ].map((item, idx) => {
            const cardPop = spring({
              frame: frame - (t14 + idx * 8),
              fps,
              damping: 12,
              stiffness: 130,
            });
            const cardScale = interpolate(cardPop, [0, 1], [0.94, 1], {
              extrapolateRight: "clamp",
            });
            const cardFloat = Math.sin((frame + idx * 30) / 20) * 6;

            return (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 36 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                    transform: `translateY(${cardFloat}px) scale(${cardScale})`,
                  }}
                >
                  <IconShell accent={item.accent} style={{ backgroundPosition: `${pipelineSheen}px 0%` }}>
                    {item.icon}
                  </IconShell>
                  <div
                    style={{
                      fontSize: "clamp(34px, 2.6vw, 54px)",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      color: SOFT_WHITE,
                    }}
                  >
                    {item.label}
                  </div>
                </div>
                {idx < 2 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                    <div
                      style={{
                        width: 280,
                        height: 10,
                        borderRadius: 999,
                        background: `linear-gradient(90deg, ${NIX_ORANGE}, ${ACCENT_GREEN})`,
                        transform: `scaleX(${idx === 0 ? arrowOneProgress : arrowTwoProgress})`,
                        transformOrigin: "left",
                        boxShadow: `0 0 40px rgba(255,159,74,0.75)`,
                      }}
                    />
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderTop: "14px solid transparent",
                        borderBottom: "14px solid transparent",
                        borderLeft: `28px solid ${ACCENT_GREEN}`,
                        opacity: idx === 0 ? arrowOneProgress : arrowTwoProgress,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...centerStage, opacity: summaryOpacity }}>
        <div
          style={{
            padding: "56px 110px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.3)",
            background:
              `linear-gradient(120deg, rgba(14,14,30,0.9), rgba(40,16,70,0.78)), linear-gradient(90deg, ${HOT_PINK}33, ${LILAC}22)`,
            boxShadow: "0 34px 120px rgba(0,0,0,0.65), 0 0 60px rgba(255,126,182,0.35)",
            transform: `scale(${summaryScale})`,
            backgroundSize: "200% 100%",
            backgroundPosition: `${summarySheen}px 0%`,
          }}
        >
          <div
            style={{
              fontSize: "clamp(64px, 4.2vw, 104px)",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Declarative config -&gt; automatic setup
          </div>
        </div>
      </div>

      <div style={{ ...centerStage, opacity: convergeOpacity }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 3200, height: 860 }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "86%",
              height: "74%",
              transform: "translate(-50%, -50%)",
              borderRadius: "999px",
              background:
                `radial-gradient(circle at 50% 50%, rgba(255,159,74,0.22), transparent 62%), radial-gradient(circle at 35% 65%, ${LILAC}33, transparent 58%), radial-gradient(circle at 70% 35%, rgba(127,232,255,0.24), transparent 58%)`,
              opacity: convergeGlow,
            }}
          />
          {[
            {
              label: "Theme",
              accent: NIX_ORANGE,
              icon: <PaletteIcon color={NIX_ORANGE} />,
              startX: -1240,
              startY: -360,
              endX: -880,
              endY: -320,
            },
            {
              label: "LSP",
              accent: ACCENT_GREEN,
              icon: <ServerIcon color={ACCENT_GREEN} />,
              startX: 0,
              startY: 520,
              endX: 0,
              endY: 360,
            },
            {
              label: "Plugins",
              accent: NEON_BLUE,
              icon: <PuzzleIcon color={NEON_BLUE} />,
              startX: 1240,
              startY: -360,
              endX: 880,
              endY: -320,
            },
          ].map((item) => {
            const x = interpolate(convergeProgress, [0, 1], [item.startX, item.endX]);
            const y = interpolate(convergeProgress, [0, 1], [item.startY, item.endY]);
            const scale = 0.94 + convergeProgress * 0.06;
            const iconOpacity = interpolate(convergeProgress, [0, 1], [1, 0.9]);

            return (
              <div
                key={item.label}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
                  opacity: iconOpacity,
                  zIndex: 2,
                }}
              >
                <IconBadge label={item.label} accent={item.accent} size="clamp(240px, 13vw, 360px)">
                  {item.icon}
                </IconBadge>
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${0.9 + convergeProgress * 0.1})`,
              opacity: convergeProgress,
              zIndex: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "34px 52px",
                borderRadius: 50,
                background:
                  "linear-gradient(120deg, rgba(12, 12, 30, 0.88), rgba(44, 18, 74, 0.82))",
                border: "1px solid rgba(255,255,255,0.32)",
                boxShadow: "0 32px 100px rgba(0,0,0,0.65), 0 0 70px rgba(255,159,74,0.35)",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(40px, 3.2vw, 64px)",
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Nixvim config
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: 200,
                    height: 10,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${NIX_ORANGE}, ${ACCENT_GREEN})`,
                    transform: `scaleX(${convergeArrowProgress})`,
                    transformOrigin: "left",
                    boxShadow: "0 0 45px rgba(138,255,207,0.75)",
                  }}
                />
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: "14px solid transparent",
                    borderBottom: "14px solid transparent",
                    borderLeft: `30px solid ${ACCENT_GREEN}`,
                    opacity: convergeArrowProgress,
                  }}
                />
              </div>
              <IconShell size="clamp(200px, 11vw, 300px)" accent={ACCENT_GREEN}>
                <NeovimDiamondIcon color={ACCENT_GREEN} />
              </IconShell>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...centerStage, opacity: fadeInOut(frame, t27, t34, 10, 10) }}>
        <div
          style={{
            position: "absolute",
            inset: "18% 6% 26% 6%",
            borderRadius: 60,
            background:
              "radial-gradient(circle at 30% 40%, rgba(255,159,74,0.25), transparent 60%), radial-gradient(circle at 70% 30%, rgba(127,232,255,0.24), transparent 55%), radial-gradient(circle at 50% 70%, rgba(180,124,255,0.2), transparent 60%)",
            opacity: envGlow,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 160 }}>
            {[
              {
                label: "NixOS",
                accent: NEON_BLUE,
                icon: <NixOsIcon color={NEON_BLUE} />,
                start: t27,
              },
              {
                label: "Home Manager",
                accent: ACCENT_GREEN,
                icon: <HomeIcon color={ACCENT_GREEN} />,
                start: t30,
              },
              {
                label: "Standalone flake",
                accent: NIX_ORANGE,
                icon: <FlakeIcon color={NIX_ORANGE} />,
                start: t32,
              },
            ].map((item) => {
              const pop = spring({
                frame: frame - item.start,
                fps,
                damping: 12,
                stiffness: 120,
              });
              const iconScale = interpolate(pop, [0, 1], [0.9, 1], {
                extrapolateRight: "clamp",
              });
              const iconOpacity = interpolate(pop, [0, 1], [0, 1], {
                extrapolateRight: "clamp",
              });
              const float = Math.sin((frame + item.start) / 24) * 6;

              return (
                <div
                  key={item.label}
                  style={{
                    opacity: iconOpacity,
                    transform: `translateY(${float}px) scale(${iconScale})`,
                  }}
                >
                  <IconBadge label={item.label} accent={item.accent} size="clamp(220px, 12vw, 320px)">
                    {item.icon}
                  </IconBadge>
                </div>
              );
            })}
          </div>
          <div
            style={{
              fontSize: "clamp(44px, 3vw, 64px)",
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
              opacity: envLabelOpacity,
            }}
          >
            Flexible environments
          </div>
        </div>
      </div>

      <SceneProgressBar />
    </AbsoluteFill>
  );
};
