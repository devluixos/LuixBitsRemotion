import type { CSSProperties, ReactNode } from "react";

type SplitPanelProps = {
  left: ReactNode;
  right: ReactNode;
  gap?: number;
  leftFlex?: number;
  rightFlex?: number;
  style?: CSSProperties;
  leftWrapperStyle?: CSSProperties;
  rightWrapperStyle?: CSSProperties;
};

export const SplitPanel: React.FC<SplitPanelProps> = ({
  left,
  right,
  gap = 32,
  leftFlex = 1,
  rightFlex = 1,
  style,
  leftWrapperStyle,
  rightWrapperStyle,
}) => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        gap,
        ...style,
      }}
    >
      <div style={{ flex: leftFlex, width: "100%", ...leftWrapperStyle }}>
        {left}
      </div>
      <div style={{ flex: rightFlex, width: "100%", ...rightWrapperStyle }}>
        {right}
      </div>
    </div>
  );
};
