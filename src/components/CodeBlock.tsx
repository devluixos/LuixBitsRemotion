import type { ReactNode } from "react";

const HIGHLIGHT_KEYWORDS = [
  "nixpkgs",
  "inputs",
  "overlays",
  "default",
  "final",
  "prev",
  "atopile",
  "writeShellScriptBin",
  "home-manager",
];

const highlightLine = (line: string) => {
  let segments: ReactNode[] = [line];
  HIGHLIGHT_KEYWORDS.forEach((keyword) => {
    segments = segments.flatMap((segment, idx) => {
      if (typeof segment !== "string") {
        return [segment];
      }
      const parts = segment.split(keyword);
      if (parts.length === 1) {
        return [segment];
      }
      const result: ReactNode[] = [];
      parts.forEach((part, partIdx) => {
        if (part) {
          result.push(part);
        }
        if (partIdx < parts.length - 1) {
          result.push(
            <span key={`${keyword}-${idx}-${partIdx}`} style={{ color: "#8afff7" }}>
              {keyword}
            </span>,
          );
        }
      });
      return result;
    });
  });
  return segments;
};

type CodeBlockProps = {
  code: string;
  lineNumberStart?: number;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  lineNumberStart = 1,
}) => {
  const lines = code.trim().split("\n");
  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(135deg, rgba(10,0,35,0.85), rgba(40,0,65,0.7))",
        borderRadius: 28,
        border: "1px solid rgba(255,255,255,0.16)",
        padding: "28px 32px",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: "clamp(22px, 2vw, 36px)",
        color: "#f7f4ff",
        lineHeight: 1.6,
        boxShadow: "0 30px 90px rgba(4,0,24,0.7)",
      }}
    >
      {lines.map((line, idx) => (
        <div key={idx} style={{ display: "flex", gap: 18 }}>
          <span
            style={{
              width: 32,
              textAlign: "right",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {(idx + lineNumberStart).toString().padStart(2, "0")}
          </span>
          <span style={{ whiteSpace: "pre" }}>{highlightLine(line)}</span>
        </div>
      ))}
    </div>
  );
};
