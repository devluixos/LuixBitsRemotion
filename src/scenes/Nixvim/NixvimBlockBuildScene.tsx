/*
 * Layout checklist:
 * - 3440x1440 scale: +20-30% sizes
 * - No overlaps; keep safe margins
 * - Labels readable on mobile
 * - Tags/lines sit below icon baselines
 * - Recenter remaining element after fades
 * - Keep the sun bright; avoid heavy scrims
 */

import React, { useMemo } from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { VaporwaveBackground } from "../../VaporwaveBackground";
import { SceneProgressBar } from "../../components/SceneProgressBar";
import { Terminal, type TerminalLine } from "../../Terminal";

type Stage = {
  label: string;
  color: string;
  appearAt: number;
  height: number;
  note: string;
};

type Satellite = {
  label: string;
  color: string;
  appearAt: number;
  angleOffset?: number;
};

const STAGES: Stage[] = [
  {
    label: "NixVim flake",
    color: "#7fb5ff",
    appearAt: 0,
    height: 1,
    note: "Import the flake module so the Nixvim module is available.",
  },
  {
    label: "Home-manager",
    color: "#8cf7a1",
    appearAt: 40,
    height: 1.2,
    note: "Bring nixvim into Home Manager; set default editor + aliases.",
  },
  {
    label: "nixvim.nix",
    color: "#d6a6ff",
    appearAt: 80,
    height: 1,
    note: "",
  },
  {
    label: "Plugins",
    color: "#ffc98b",
    appearAt: 120,
    height: 1.1,
    note: "Now add the plugin stack onto the config base.",
  },
];

const SATELLITES: Satellite[] = [
  { label: "LSP + cmp", color: "#8AFFCF", appearAt: 140 },
  { label: "GitSigns", color: "#FFB347", appearAt: 160 },
  { label: "Treesitter", color: "#80B3FF", appearAt: 170 },
  { label: "Telescope", color: "#FF9AF2", appearAt: 180 },
];

const easeClamp = (v: number) => Math.max(0, Math.min(1, v));

const LabelSprite: React.FC<{
  text: string;
  color: string;
  position: [number, number, number];
  scale?: number;
}> = ({ text, color, position, scale = 1 }) => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const padding = 18;
    ctx.font = "bold 56px 'Inter', 'Arial', sans-serif";
    const textWidth = ctx.measureText(text).width;
    canvas.width = textWidth + padding * 2;
    canvas.height = 108;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "rgba(18,12,40,0.9)");
    gradient.addColorStop(1, "rgba(30,24,68,0.85)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#fefbff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "bold 56px 'Inter', 'Arial', sans-serif";
    ctx.fillText(text, padding, canvas.height / 2);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeText(text, padding, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [text, color]);

  if (!texture) return null;

  return (
    <sprite position={position} scale={[3.4 * scale, 1.15 * scale, 1]}>
      <spriteMaterial attach="material" map={texture} transparent opacity={0.92} />
    </sprite>
  );
};

const StageBlock: React.FC<{
  stage: Stage;
  x: number;
  startFrame: number;
  frameOverride?: number;
}> = ({ stage, x, startFrame, frameOverride }) => {
  const liveFrame = useCurrentFrame();
  const frame = frameOverride ?? liveFrame;
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    damping: 12,
    stiffness: 140,
    mass: 0.9,
    overshootClamping: true,
  });
  const scaled = easeClamp(progress);
  const bob = Math.sin((frame + startFrame) / 50) * 0.05;

  return (
    <group position={[x, stage.height / 2 + bob, 0]} scale={[1, scaled, 1]}>
      <mesh rotation={[0, Math.PI / 6, 0]}>
        <dodecahedronGeometry args={[1.4]} />
        <meshStandardMaterial
          color={stage.color}
          emissive={stage.color}
          emissiveIntensity={1.05 * scaled + 0.25}
          metalness={0.35}
          roughness={0.16}
        />
      </mesh>
      <mesh rotation={[0, Math.PI / 4, 0]} scale={[1.2, 1.6, 1.2]}>
        <icosahedronGeometry args={[1.15]} />
        <meshStandardMaterial
          color={stage.color}
          transparent
          opacity={0.16 + 0.22 * scaled}
          emissive={stage.color}
          emissiveIntensity={0.25}
          metalness={0.22}
          roughness={0.4}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.OctahedronGeometry(1.55)]} />
        <lineBasicMaterial attach="material" color="#ffffff" transparent opacity={0.32} />
      </lineSegments>
      <pointLight color={stage.color} intensity={0.85} distance={8} />
      <LabelSprite
        text={stage.label}
        color={stage.color}
        position={[0, stage.height / 2 + 1.2, 1.9]}
        scale={0.75}
      />
    </group>
  );
};

const SatelliteCube: React.FC<{
  sat: Satellite;
  center: THREE.Vector3;
  radius: number;
  height: number;
  angle: number;
  startFrame: number;
  frameOverride?: number;
}> = ({ sat, center, radius, height, angle, startFrame, frameOverride }) => {
  const liveFrame = useCurrentFrame();
  const frame = frameOverride ?? liveFrame;
  const { fps } = useVideoConfig();
  const t = spring({
    frame: frame - startFrame,
    fps,
    damping: 10,
    stiffness: 130,
    mass: 0.8,
    overshootClamping: true,
  });
  const progress = easeClamp(t);
  const anchor = new THREE.Vector3(center.x, center.y, center.z);
  const dest = new THREE.Vector3(
    center.x + Math.cos(angle) * radius,
    center.y + height + Math.sin((frame + sat.appearAt) / 32) * 0.25,
    center.z + Math.sin(angle) * radius,
  );
  const pos = anchor.clone().lerp(dest, progress);
  const scale = 0.35 + 0.65 * progress;

  return (
    <group position={[pos.x, pos.y, pos.z]} scale={scale}>
      <mesh rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <octahedronGeometry args={[0.9]} />
        <meshStandardMaterial
          color={sat.color}
          emissive={sat.color}
          emissiveIntensity={0.5 + 0.5 * progress}
          metalness={0.35}
          roughness={0.25}
        />
      </mesh>
      <LabelSprite text={sat.label} color={sat.color} position={[0, 1.05, 0]} scale={0.55} />
    </group>
  );
};

const INTRO_DURATION = 120;
const POST_INTRO_GAP = 24; // wait after terminal fades before blocks grow
const ANIM_FREEZE_FRAME = INTRO_DURATION + POST_INTRO_GAP + 240;
const HOLD_EXTRA = 300; // 10s at 30fps
export const NIXVIM_BLOCK_BUILD_DURATION =
  ANIM_FREEZE_FRAME + HOLD_EXTRA; // ~22.8s @30fps

export const NixvimBlockBuildScene: React.FC = () => {
  const rawFrame = useCurrentFrame();
  const frame = Math.min(rawFrame, ANIM_FREEZE_FRAME);
  const { width, height, fps } = useVideoConfig();

  const spacing = 5.9;
  const startX = -(STAGES.length - 1) * spacing * 0.5;
  const stack = useMemo(
    () =>
      STAGES.map((stage, idx) => ({
        stage,
        x: startX + idx * spacing,
        startFrame: stage.appearAt + INTRO_DURATION + POST_INTRO_GAP,
      })),
    [startX],
  );
  const stageProgress = useMemo(() => {
    const progress: Record<string, number> = {};
    STAGES.forEach((stage) => {
      const prog = spring({
        frame: frame - (stage.appearAt + INTRO_DURATION + POST_INTRO_GAP),
        fps,
        damping: 12,
        stiffness: 140,
        mass: 0.9,
        overshootClamping: true,
      });
      progress[stage.label] = easeClamp(prog);
    });
    return progress;
  }, [frame, fps]);

  const pluginStage = stack.find((s) => s.stage.label === "Plugins");

  const orbit = 0;
  const cameraY = 5 + Math.sin(frame / 120) * 0.3;
  const terminalLines: TerminalLine[] = useMemo(
    () => [
      {
        prompt: "λ luix@nixos",
        text: "mpv nixvim-plugins.mp4",
        startFrame: 10,
        mode: "type",
      },
      {
        prompt: "",
        text: "Playing clip........",
        startFrame: 70,
        mode: "paste",
      },
    ],
    [],
  );
  const terminalOpacity =
    rawFrame < INTRO_DURATION ? 1 : Math.max(0, 1 - (rawFrame - INTRO_DURATION) / 28);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          fov: 50,
          position: [0, cameraY, 13.2],
        }}
      >
        <ambientLight intensity={0.9} color="#cfe2ff" />
        <directionalLight position={[12, 12, 6]} intensity={1.4} color="#8afff7" />
        <pointLight position={[-10, 10, 8]} intensity={1.15} color="#ff8ad8" />
        <spotLight position={[0, 14, 10]} angle={0.95} penumbra={0.65} intensity={1.25} color="#ffd580" />

        <group rotation={[0, 0, 0]} position={[0, 0, 0]} scale={1.08}>
          {stack.map(({ stage, x, startFrame }) => (
            <StageBlock
              key={stage.label}
              stage={stage}
              x={x}
              startFrame={startFrame}
              frameOverride={frame}
            />
          ))}

          {stack.slice(0, -1).map((current, idx) => {
            const next = stack[idx + 1];
            const progCurrent = stageProgress[current.stage.label] ?? 0;
            const progNext = stageProgress[next.stage.label] ?? 0;
            if (progCurrent < 0.85 || progNext < 0.7) return null;

            const half = 2.1;
            const start = new THREE.Vector3(current.x + half, 0.9, 0);
            const end = new THREE.Vector3(next.x - half, 0.9, 0);
            const delta = end.clone().sub(start);
            const length = delta.length();
            if (length <= 0.01) return null;

            return (
              <mesh
                key={`connector-${current.stage.label}-${next.stage.label}`}
                position={start.clone().add(delta.clone().multiplyScalar(0.5))}
                quaternion={new THREE.Quaternion().setFromUnitVectors(
                  new THREE.Vector3(0, 1, 0),
                  delta.clone().normalize(),
                )}
              >
                <cylinderGeometry args={[0.08, 0.08, length, 18]} />
                <meshStandardMaterial
                  color={next.stage.color}
                  emissive={next.stage.color}
                  emissiveIntensity={0.65}
                  metalness={0.2}
                  roughness={0.3}
                />
              </mesh>
            );
          })}

          {pluginStage ? (
            <>
              {SATELLITES.map((sat, idx) => {
                const angle = (idx / SATELLITES.length) * Math.PI * 2 - Math.PI / 2;
                const target = new THREE.Vector3(
                  pluginStage.x + Math.cos(angle) * 2.2,
                  pluginStage.stage.height + 2.1,
                  Math.sin(angle) * 2.2,
                );
                const anchor = new THREE.Vector3(pluginStage.x, pluginStage.stage.height + 1.2, 0);
                const delta = target.clone().sub(anchor).multiplyScalar(
                  easeClamp(
                    spring({
                      frame: frame - (sat.appearAt + INTRO_DURATION + POST_INTRO_GAP),
                      fps,
                      damping: 10,
                      stiffness: 130,
                      mass: 0.8,
                      overshootClamping: true,
                    }),
                  ),
                );
                const lineLength = delta.length();
                const connectorVisible = lineLength > 0.01;
                return (
                  <React.Fragment key={sat.label}>
                    {connectorVisible ? (
                      <mesh
                        position={anchor.clone().add(delta.clone().multiplyScalar(0.5))}
                        quaternion={new THREE.Quaternion().setFromUnitVectors(
                          new THREE.Vector3(0, 1, 0),
                          delta.clone().normalize(),
                        )}
                      >
                        <cylinderGeometry args={[0.05, 0.05, lineLength, 16]} />
                        <meshStandardMaterial color={sat.color} emissive={sat.color} emissiveIntensity={0.6} />
                      </mesh>
                    ) : null}
                    <SatelliteCube
                      sat={sat}
                      center={new THREE.Vector3(pluginStage.x, pluginStage.stage.height + 2.3, 0)}
                      radius={2.2}
                      height={0.35}
                      angle={angle}
                      startFrame={sat.appearAt + INTRO_DURATION + POST_INTRO_GAP}
                      frameOverride={frame}
                    />
                  </React.Fragment>
                );
              })}
            </>
          ) : null}
        </group>
      </ThreeCanvas>

      <div
        style={{
          position: "absolute",
          inset: "6% 6% 12% 6%",
          pointerEvents: "none",
          opacity: terminalOpacity,
        }}
      >
        <Terminal
          lines={terminalLines}
          fontSize={48}
          promptWidth={360}
          style={{
            width: "100%",
            height: "100%",
            boxShadow: "0 30px 120px rgba(0,0,0,0.65)",
          }}
        />
      </div>

      {frame > INTRO_DURATION && (
        <div
          style={{
            position: "absolute",
            top: "4%",
            left: "3%",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            color: "#f7f4ff",
          }}
        >
          <div
            style={{
              fontSize: "clamp(48px, 4.4vw, 102px)",
              fontWeight: 900,
              letterSpacing: 2,
              textShadow:
                "0 0 22px rgba(255,93,162,0.6), 0 0 32px rgba(138,255,247,0.45), 0 12px 40px rgba(0,0,0,0.55)",
              background:
                "linear-gradient(120deg, rgba(255,93,162,0.4), rgba(138,255,247,0.35))",
              padding: "10px 16px",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            Adding plugins to Nixvim
          </div>
        </div>
      )}
      <SceneProgressBar />
    </AbsoluteFill>
  );
};
