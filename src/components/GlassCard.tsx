import type { ReactNode, CSSProperties } from "react";

type GlassCardProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => (
  <div
    style={{
      position: "relative",
      borderRadius: 40,
      padding: "42px 48px",
      background: "rgba(6, 0, 26, 0.7)",
      border: "1px solid rgba(255,255,255,0.16)",
      boxShadow: "0 30px 100px rgba(4,0,24,0.75)",
      backdropFilter: "blur(12px)",
      overflow: "hidden",
      width: "100%",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 6,
        borderRadius: 32,
        border: "1px solid rgba(255,255,255,0.08)",
        opacity: 0.6,
        pointerEvents: "none",
      }}
    />
    <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
      {children}
    </div>
  </div>
);
