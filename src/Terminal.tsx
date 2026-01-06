import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

export type LineMode = "type" | "paste";

export type TerminalLine = {
  prompt: string;
  text: string;
  startFrame: number;
  mode: LineMode;
  speed?: number;
  color?: string;
  glow?: string;
};

type TerminalProps = {
  lines: TerminalLine[];
  fontSize?: number;
  promptWidth?: number;
  style?: React.CSSProperties;
};

const charactersRevealed = (
  frame: number,
  line: TerminalLine,
  defaultSpeed = 3,
) => {
  const speed = line.speed ?? defaultSpeed;
  const elapsed = Math.max(0, frame - line.startFrame);
  if (line.mode === "paste") {
    const reveal = interpolate(
      frame,
      [line.startFrame, line.startFrame + 12],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return Math.floor(reveal * line.text.length);
  }

  return Math.min(line.text.length, Math.floor(elapsed / speed));
};

const Cursor = ({
  visible,
  height,
}: {
  visible: boolean;
  height: number;
}) => (
  <span
    style={{
      display: "inline-block",
      width: 14,
      height,
      backgroundColor: "#ff89ff",
      marginLeft: 6,
      opacity: visible ? 0.85 : 0,
      boxShadow: "0 0 16px rgba(255, 137, 255, 0.9)",
    }}
  />
);

const Line: React.FC<{
  line: TerminalLine;
  fontSize: number;
  promptWidth: number;
}> = ({ line, fontSize, promptWidth }) => {
  const frame = useCurrentFrame();
  const chars = charactersRevealed(frame, line);
  const content = line.text.slice(0, chars);
  const isTyping = chars < line.text.length && frame >= line.startFrame;
  const presence = interpolate(
    frame - line.startFrame,
    [0, 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const flashOpacity =
    line.mode === "paste"
      ? interpolate(
          frame - line.startFrame,
          [0, 8, 40],
          [1, 0.2, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 16,
        width: "100%",
        color: "#f8e9ff",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize,
        lineHeight: 1.35,
        opacity: presence,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            flashOpacity > 0
              ? "linear-gradient(90deg, rgba(255,137,255,0.15), rgba(0,0,0,0))"
              : "transparent",
          opacity: flashOpacity,
          filter: "blur(3px)",
          borderRadius: 10,
        }}
      />
      <span
        style={{
          color: "#a786ff",
          minWidth: line.prompt ? promptWidth : 0,
        }}
      >
        {line.prompt}
      </span>
      <span
        style={{
          whiteSpace: "pre",
          color: line.color ?? "#f8e9ff",
          textShadow: line.glow ? `0 0 18px ${line.glow}` : undefined,
        }}
      >
        {content}
        <Cursor
          height={fontSize * 0.7}
          visible={isTyping && Math.floor(frame / 10) % 2 === 0}
        />
      </span>
    </div>
  );
};

export const Terminal: React.FC<TerminalProps> = ({
  lines,
  fontSize = 60,
  promptWidth = 420,
  style,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 36,
        background:
          "linear-gradient(135deg, rgba(18,8,48,0.9), rgba(66,16,102,0.85))",
        border: "1px solid rgba(255,137,255,0.25)",
        backdropFilter: "blur(10px)",
        boxShadow:
          "0 40px 120px rgba(8,0,24,0.8), inset 0 0 80px rgba(255,137,255,0.2)",
        padding: "48px 64px",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 36,
        }}
      >
        {["#ff5da2", "#ffbdde", "#8afff7"].map((color) => (
          <span
            key={color}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 16px ${color}55`,
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {lines.map((line) => (
          <Line
            key={`${line.prompt}-${line.startFrame}`}
            line={line}
            fontSize={fontSize}
            promptWidth={promptWidth}
          />
        ))}
      </div>
    </div>
  );
};
