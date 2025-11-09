import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const SceneProgressBar: React.FC<{
  height?: number;
  colors?: [string, string];
}> = ({ height = 14, colors }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress =
    durationInFrames <= 1 ? 1 : Math.min(1, frame / (durationInFrames - 1));

  const [startColor, endColor] =
    colors ?? ["#ff5da2", "rgba(138,255,247,0.85)"];

  const glow = interpolate(progress, [0, 1], [0.25, 0.9]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: "5%",
        width: "90%",
        height,
        borderRadius: height,
        border: "1px solid rgba(255,255,255,0.3)",
        background: "rgba(0,0,0,0.3)",
        overflow: "hidden",
        boxShadow: `0 0 30px rgba(255,93,162,${glow * 0.4})`,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          borderRadius: height,
          background: `linear-gradient(90deg, ${startColor}, ${endColor})`,
          boxShadow: `0 0 35px rgba(138,255,247,${glow})`,
          transition: "width 0.2s linear",
        }}
      />
    </div>
  );
};
