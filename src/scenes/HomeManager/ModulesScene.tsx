/*
 * Layout checklist:
 * - 3440x1440 scale: +20-30% sizes
 * - No overlaps; keep safe margins
 * - Labels readable on mobile
 * - Tags/lines sit below icon baselines
 * - Recenter remaining element after fades
 * - Keep the sun bright; avoid heavy scrims
 */

import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { GlassCard } from "../../components/GlassCard";
import { SceneProgressBar } from "../../components/SceneProgressBar";
import { ModuleGrid } from "../../components/ModuleGrid";

type ModuleDetail = {
  name: string;
  description: ReactNode;
  samples: string[];
  note?: ReactNode;
};

const Highlight: React.FC<{ children: ReactNode }> = ({ children }) => (
  <span
    style={{
      background:
        "linear-gradient(120deg, rgba(255,93,162,0.35), rgba(138,255,247,0.35))",
      borderRadius: 10,
      padding: "0 8px",
      color: "#fff",
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);

const modules: ModuleDetail[] = [
  {
    name: "base.nix",
    description: (
      <>
        Keeps the bare essentials—downloaders, search tools, archive helpers—that
        every profile needs.
      </>
    ),
    samples: ["wget", "ripgrep", "unzip", "stow"],
  },
  {
    name: "applications.nix",
    description: (
      <>
        GUI workloads (Discord, browsers, IDEs, Steam) are declared here instead
        of system-wide, keeping the host flake minimal.
      </>
    ),
    samples: ["Discord", "Firefox", "Steam", "VS Code"],
  },
  {
    name: "cli.nix",
    description: (
      <>
        Enables the terminal ecosystem—git, tmux, Neovim—plus extras like Yazi for
        fast file work.
      </>
    ),
    samples: ["git", "tmux", "Neovim", "Yazi"],
  },
  {
    name: "media.nix",
    description: (
      <>
        Audio + video tooling for production jobs without installing into
        environment.systemPackages.
      </>
    ),
    samples: ["Audacity", "EasyEffects", "FFmpeg", "Orca Slicer"],
  },
  {
    name: "programming.nix",
    description: (
      <>
        Language runtimes, compilers, and DB clients—all scoped to the user so dev
        work stays isolated.
      </>
    ),
    samples: ["GCC", "Node.js", "Python", "DBeaver"],
  },
  {
    name: "kitty.nix",
    description: (
      <>
        Declarative Kitty theme: fonts, cursor behavior, tab fade, shell hook.
      </>
    ),
    samples: ["Fonts", "Cursor", "Tabs"],
    note: "More on this later.",
  },
  {
    name: "nixvim.nix",
    description: (
      <>
        Imports nixvim’s module and sets the base Neovim config (leader key,
        options, starter keymap).
      </>
    ),
    samples: ["Leader key", "Options", "Keymap"],
  },
  {
    name: "buildandpush.nix",
    description: (
      <>
        Drops custom scripts (buildall/flakeonly/etc.) onto PATH via
        writeShellScriptBin so they stay versioned.
      </>
    ),
    samples: ["buildall", "flakeonly", "pushonly", "pushconfigs"],
    note: "More about these scripts later.",
  },
  {
    name: "zsh.nix",
    description: (
      <>
        Full shell experience: Oh My Zsh, autosuggestions, syntax highlight,
        Kitty integration, aliases.
      </>
    ),
    samples: ["Oh My Zsh", "Autosuggestions", "Syntax highlight", "Aliases"],
  },
];

const OUTRO = [
  <>
    Because every module lives in user space, tweaking Kitty or Zsh no longer
    needs root access.
  </>,
  <>
    Neovim uses the regular plugin workflow, and Home Manager drops{" "}
    <Highlight>.hm-back</Highlight> backups if dotfiles overwrite existing paths.
  </>,
];

const OUTRO_POINTS = [
  {
    title: "User scope",
    text: "Desktop tweaks never need sudo.",
  },
  {
    title: "Editor ready",
    text: "Neovim + plugins update like normal.",
  },
  {
    title: "Safe writes",
    text: ".hm-back files protect existing dotfiles.",
  },
  {
    title: "Deployable",
    text: "Push the flake to reuse the exact profile elsewhere.",
  },
];

const SampleBadges: React.FC<{ samples?: string[] }> = ({ samples }) => {
  if (!samples || samples.length === 0) {
    return null;
  }
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 20,
        marginTop: 24,
      }}
    >
      {samples.map((sample) => (
        <span
          key={sample}
          style={{
            padding: "14px 26px",
            borderRadius: 999,
            fontSize: "clamp(24px, 2.6vw, 42px)",
            color: "#101122",
            fontWeight: 700,
            background:
              "linear-gradient(120deg, rgba(255,215,0,0.95), rgba(138,255,247,0.85))",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
          }}
        >
          {sample}
        </span>
      ))}
    </div>
  );
};

const SEGMENT_FRAMES = [
  (8 + 5) * 30,
  (10 + 5) * 30,
  (9 + 5) * 30,
  (8 + 5) * 30,
  (10 + 5) * 30,
  (7 + 5) * 30,
  (11 + 5) * 30,
  (15 + 5) * 30,
  (10 + 5) * 30,
  17 * 30,
]; // extend each module by ~5s

export const MODULES_SCENE_DURATION = SEGMENT_FRAMES.reduce(
  (sum, val) => sum + val,
  0,
);

export const ModulesScene = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  if (durationInFrames !== MODULES_SCENE_DURATION) {
    console.warn("ModulesScene expected duration:", MODULES_SCENE_DURATION);
  }

  let accumulated = 0;
  let index = 0;
  for (let i = 0; i < SEGMENT_FRAMES.length; i++) {
    if (frame >= accumulated && frame < accumulated + SEGMENT_FRAMES[i]) {
      index = i;
      break;
    }
    accumulated += SEGMENT_FRAMES[i];
  }

  const segmentStart = SEGMENT_FRAMES.slice(0, index).reduce(
    (sum, dur) => sum + dur,
    0,
  );
  const entries = [...modules, "outro"];
  const segmentStarts = SEGMENT_FRAMES.reduce<number[]>((acc, _, idx) => {
    if (idx === 0) {
      acc.push(0);
      return acc;
    }
    acc.push(acc[idx - 1] + SEGMENT_FRAMES[idx - 1]);
    return acc;
  }, []);
  const slideWidth = 36;
  const gap = 6;
  const progress = Math.min(
    1,
    Math.max(0, (frame - segmentStart) / SEGMENT_FRAMES[index]),
  );
  const offsetPercent =
    (Math.min(index, entries.length - 1) + progress) * (slideWidth + gap);
  const caretOpacity = interpolate(Math.sin(frame / 6), [-1, 1], [0.2, 1]);
  const typeDuration = Math.round(fps * 1.2);
  const getTypedText = (text: string, localFrame: number) => {
    const count = Math.max(
      0,
      Math.floor(
        interpolate(localFrame, [0, typeDuration], [0, text.length], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      ),
    );
    return text.slice(0, count);
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />
      <AbsoluteFill
        style={{
          padding: "4%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "90%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              height: "100%",
              gap: `${gap}%`,
              transform: `translateX(-${offsetPercent}%)`,
              transition: "transform 0.4s linear",
              paddingLeft: "18%",
            }}
          >
            {entries.map((entry, entryIndex) => {
              const isOutroCard = entry === "outro";
              const entryStart = segmentStarts[entryIndex] ?? 0;
              const entryFrame = frame - entryStart;
              const isActive = entryIndex === index;
              const titleText = isOutroCard ? "Why user modules?" : (entry as ModuleDetail).name;
              const typedTitle = isActive ? getTypedText(titleText, entryFrame) : titleText;
              const titleGradient =
                "linear-gradient(100deg, #f7f4ff 10%, #7fe8ff 40%, #ff9f4a 70%, #f7f4ff 90%)";
              return (
                <div
                  key={isOutroCard ? "outro" : (entry as ModuleDetail).name}
                  style={{
                    flex: `0 0 ${isOutroCard ? 100 : slideWidth}%`,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {isOutroCard ? (
                    <GlassCard
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 32,
                        width: "92%",
                        height: "100%",
                        padding: "48px 56px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "clamp(48px, 4vw, 82px)",
                          fontWeight: 700,
                          letterSpacing: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            background: titleGradient,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 18px 50px rgba(0,0,0,0.55)",
                          }}
                        >
                          {typedTitle}
                        </span>
                        {isActive ? (
                          <span style={{ color: "#f7f4ff", opacity: caretOpacity }}>|</span>
                        ) : null}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 32,
                          height: "100%",
                        }}
                      >
                        <div
                          style={{
                            flex: 0.55,
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                      }}
                    >
                          {OUTRO_POINTS.map((point, idx) => (
                            <div
                              key={point.title}
                              style={{
                                background:
                                  idx % 2 === 0
                                    ? "linear-gradient(135deg, rgba(90,0,120,0.45), rgba(255,93,162,0.35))"
                                    : "linear-gradient(135deg, rgba(0,60,120,0.45), rgba(138,255,247,0.35))",
                                border: "1px solid rgba(255,255,255,0.25)",
                                borderRadius: 20,
                                padding: "20px 22px",
                                boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "clamp(26px, 2.6vw, 46px)",
                                  color: "#ffe7ff",
                                  fontWeight: 600,
                                }}
                              >
                                {point.title}
                              </div>
                              <div
                                style={{
                                  marginTop: 6,
                                  fontSize: "clamp(22px, 2.2vw, 38px)",
                                  color: "#f7f4ff",
                                  lineHeight: 1.35,
                                }}
                              >
                                {point.text}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          style={{
                            flex: 0.45,
                            display: "flex",
                            flexDirection: "column",
                            gap: 18,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "clamp(24px, 2.4vw, 40px)",
                              color: "#ffd8ff",
                              letterSpacing: 1,
                            }}
                          >
                            Modules in this stack
                          </div>
                          <ModuleGrid modules={modules.map((m) => m.name)} columns={3} />
                          <div
                            style={{
                              marginTop: 18,
                              fontSize: "clamp(24px, 2.4vw, 40px)",
                              color: "#f7f4ff",
                              lineHeight: 1.4,
                            }}
                          >
                            {OUTRO}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ) : (
                    <GlassCard
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 40,
                        padding: "60px 66px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "clamp(60px, 5vw, 104px)",
                          fontWeight: 700,
                          letterSpacing: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            background: titleGradient,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 18px 50px rgba(0,0,0,0.55)",
                          }}
                        >
                          {typedTitle}
                        </span>
                        {isActive ? (
                          <span style={{ color: "#f7f4ff", opacity: caretOpacity }}>|</span>
                        ) : null}
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(34px, 3.2vw, 58px)",
                          color: "#f7f4ff",
                          lineHeight: 1.45,
                        }}
                      >
                        {(entry as ModuleDetail).description}
                      </div>
                      <SampleBadges samples={(entry as ModuleDetail).samples} />
                      {(entry as ModuleDetail).note ? (
                        <div
                          style={{
                            marginTop: 48,
                            fontSize: "clamp(30px, 2.8vw, 44px)",
                            color: "#ffd580",
                          }}
                        >
                          {(entry as ModuleDetail).note}
                        </div>
                      ) : null}
                    </GlassCard>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <SceneProgressBar />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
