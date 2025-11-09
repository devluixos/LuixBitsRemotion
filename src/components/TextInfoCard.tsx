import type { ReactNode } from "react";

type TextInfoCardProps = {
  title: ReactNode;
  items: ReactNode[];
  startIndex?: number;
  markerColor?: string;
  gap?: number;
  style?: React.CSSProperties;
};

export const TextInfoCard: React.FC<TextInfoCardProps> = ({
  title,
  items,
  startIndex = 1,
  markerColor = "#8afff7",
  gap = 28,
  style,
}) => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap,
        paddingTop: 56,
        paddingBottom: 46,
        ...style,
      }}
    >
      <div
        style={{
          fontSize: "clamp(48px, 4.5vw, 102px)",
          fontWeight: 700,
          color: "#ffe7ff",
          lineHeight: 1.05,
          textShadow: "0 8px 35px rgba(255, 93, 162, 0.35)",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {items.map((node, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: 24,
              alignItems: "flex-start",
              fontSize: "clamp(28px, 2.8vw, 48px)",
              color: "#f7f4ff",
              lineHeight: 1.45,
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.7)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(18px, 2vw, 28px)",
                color: markerColor,
                marginTop: 6,
              }}
            >
              {index + startIndex}
            </span>
            <div style={{ flex: 1 }}>{node}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
