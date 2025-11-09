type ModuleGridProps = {
  modules: string[];
  columns?: number;
};

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  modules,
  columns = 3,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 18,
        width: "100%",
      }}
    >
      {modules.map((module) => (
        <div
          key={module}
          style={{
            padding: "18px 22px",
            borderRadius: 18,
            background:
              "linear-gradient(135deg, rgba(255,93,162,0.25), rgba(138,255,247,0.18))",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fef2ff",
            fontSize: "clamp(20px, 1.8vw, 32px)",
            textTransform: "lowercase",
            letterSpacing: 0.5,
            boxShadow: "0 12px 40px rgba(4,0,24,0.45)",
            textAlign: "center",
          }}
        >
          {module}
        </div>
      ))}
    </div>
  );
};
