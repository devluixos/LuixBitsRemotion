import { interpolate, useCurrentFrame } from "remotion";

export type FileNode = {
  label: string;
  meta?: string;
  accent?: string;
  children?: FileNode[];
};

type PanelSection =
  | { type: "tree"; nodes: FileNode[] }
  | { type: "list"; title: string; bullets: string[] };

type VaporwaveInfoPanelProps = {
  title: string;
  sections: PanelSection[];
  subtitle?: string;
  activeSectionIndex?: number;
};

const COLORS = ["#ff5da2", "#8afff7", "#ffd580", "#bd9bff"];

const GlassShell: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      position: "relative",
      borderRadius: 32,
      padding: "32px 36px",
      background: "rgba(8, 0, 32, 0.55)",
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 20px 60px rgba(5,0,24,0.65)",
      backdropFilter: "blur(12px)",
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 4,
        borderRadius: 28,
        border: "1px solid rgba(255,255,255,0.08)",
        opacity: 0.7,
        pointerEvents: "none",
      }}
    />
    <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
  </div>
);

const TreeNode: React.FC<{
  node: FileNode;
  depth: number;
  index: number;
}> = ({ node, depth, index }) => {
  const frame = useCurrentFrame();
  const delay = depth * 12 + index * 8;
  const reveal = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const accentColor =
    node.accent ?? COLORS[(depth + index) % COLORS.length] ?? "#ffbef8";

  const fontSize =
    depth === 0
      ? "clamp(34px, 3vw, 62px)"
      : depth === 1
        ? "clamp(28px, 2.4vw, 44px)"
        : "clamp(24px, 2vw, 34px)";

  return (
    <div
      style={{
        marginLeft: depth === 0 ? 0 : 28,
        paddingLeft: depth === 0 ? 0 : 24,
        borderLeft:
          depth === 0 ? "none" : `1px dashed ${accentColor}40`,
        position: "relative",
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 20}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          padding: "12px 0",
        }}
      >
        <span
          style={{
            minWidth: 28,
            height: 28,
            borderRadius: "50%",
            border: `2px solid ${accentColor}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: accentColor,
            fontSize: "clamp(18px, 1.6vw, 24px)",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {depth === 0 ? "~" : depth === 1 ? "▸" : "∙"}
        </span>
        <div>
          <div
            style={{
              fontSize,
              fontWeight: depth <= 1 ? 600 : 400,
              color: "#fef2ff",
              fontFamily: "'Space Grotesk', 'Sora', sans-serif",
              lineHeight: 1.2,
            }}
          >
            {node.label}
          </div>
          {node.meta ? (
            <div
              style={{
                fontSize: "clamp(18px, 1.7vw, 28px)",
                color: "rgba(255,255,255,0.7)",
                marginTop: 6,
              }}
            >
              {node.meta}
            </div>
          ) : null}
        </div>
      </div>
      {node.children?.map((child, childIndex) => (
        <TreeNode
          key={`${node.label}-${childIndex}`}
          node={child}
          depth={depth + 1}
          index={childIndex}
        />
      ))}
    </div>
  );
};

const renderSection = (
  section: PanelSection,
  helpers: { float: number }
) => {
  if (section.type === "tree") {
    return (
      <div
        style={{
          flex: 1,
          overflow: "auto",
          paddingRight: 12,
          transform: `translateY(${helpers.float}px)`,
        }}
      >
        {section.nodes.map((node, index) => (
          <TreeNode key={node.label} node={node} depth={0} index={index} />
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "clamp(30px, 3vw, 56px)",
          fontWeight: 600,
          color: "#ffd8ff",
        }}
      >
        {section.title}
      </p>
      {section.bullets.map((line, index) => (
        <div
          key={line}
          style={{
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
            fontSize: "clamp(22px, 2.4vw, 38px)",
            color: "#eef1ff",
            lineHeight: 1.4,
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: COLORS[index % COLORS.length],
              boxShadow: `0 0 12px ${COLORS[index % COLORS.length]}66`,
              marginTop: 12,
            }}
          />
          <span style={{ flex: 1 }}>{line}</span>
        </div>
      ))}
    </div>
  );
};

export const VaporwaveInfoPanel: React.FC<VaporwaveInfoPanelProps> = ({
  title,
  sections,
  subtitle = "curated dotfiles vault",
  activeSectionIndex = 0,
}) => {
  const frame = useCurrentFrame();
  const float = Math.sin(frame / 40) * 6;
  const activeSection = sections[activeSectionIndex] ?? sections[0];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      <GlassShell
        style={{
          padding: "32px 48px",
          background: "rgba(20,4,60,0.45)",
        }}
      >
        <div
          style={{
            fontSize: "clamp(42px, 4vw, 88px)",
            fontWeight: 700,
            margin: 0,
            color: "#ffe7ff",
            letterSpacing: 3,
            fontFamily: "'Space Grotesk', 'Sora', sans-serif",
            textShadow: "0 0 30px rgba(255,135,255,0.35)",
          }}
        >
          {title}
        </div>
        <p
          style={{
            marginTop: 10,
            fontSize: "clamp(22px, 2vw, 34px)",
            color: "#b9c7ff",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </p>
      </GlassShell>
      <GlassShell style={{ flex: 1, minHeight: 0 }}>
        {renderSection(activeSection, { float })}
      </GlassShell>
    </div>
  );
};
