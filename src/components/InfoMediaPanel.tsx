import type { ReactNode } from "react";
import { Img } from "remotion";
import { CodeBlock } from "./CodeBlock";
import { GlassCard } from "./GlassCard";

export type InfoMediaContent =
  | { kind: "error"; lines: string[] }
  | { kind: "code"; code: string }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | {
      kind: "compare";
      columns: { title: string; items: ReactNode[] }[];
    };

type InfoMediaPanelProps = {
  content: InfoMediaContent;
};

export const InfoMediaPanel: React.FC<InfoMediaPanelProps> = ({ content }) => {
  if (content.kind === "error") {
    return (
      <GlassCard
        style={{
          background:
            "linear-gradient(135deg, rgba(60,0,20,0.85), rgba(140,20,50,0.7))",
          color: "#ffd6df",
          fontSize: "clamp(26px, 2.5vw, 44px)",
          lineHeight: 1.5,
        }}
      >
        {content.lines.map((line) => (
          <div key={line} style={{ marginBottom: 14 }}>
            {line}
          </div>
        ))}
      </GlassCard>
    );
  }

  if (content.kind === "code") {
    return (
      <GlassCard style={{ padding: "18px 24px" }}>
        <CodeBlock code={content.code} />
      </GlassCard>
    );
  }

  if (content.kind === "image") {
    return (
      <GlassCard
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Img
          src={content.src}
          alt={content.alt}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "100%",
            objectFit: "contain",
            borderRadius: 30,
            border: "1px solid rgba(255,255,255,0.18)",
            flex: 1,
          }}
        />
        {content.caption ? (
          <p
            style={{
              margin: "18px 0 0 0",
              fontSize: "clamp(20px, 1.8vw, 32px)",
              color: "#d9d3ff",
              textAlign: "center",
            }}
          >
            {content.caption}
          </p>
        ) : null}
      </GlassCard>
    );
  }

  return (
    <GlassCard style={{ display: "flex", gap: 28 }}>
      {content.columns.map((column) => (
        <div key={column.title} style={{ flex: 1 }}>
          <h3
            style={{
              margin: "0 0 20px 0",
              fontSize: "clamp(34px, 3vw, 58px)",
              color: "#ffe7ff",
            }}
          >
            {column.title}
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: "#f1efff",
              fontSize: "clamp(28px, 2.6vw, 46px)",
              lineHeight: 1.45,
            }}
          >
            {column.items.map((item, idx) => (
              <li key={`${column.title}-${idx}`} style={{ marginBottom: 12 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </GlassCard>
  );
};
