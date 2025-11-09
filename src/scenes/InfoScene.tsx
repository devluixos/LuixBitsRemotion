import { AbsoluteFill } from "remotion";
import { VaporwaveBackground } from "../VaporwaveBackground";
import { VaporwaveInfoPanel, FileNode } from "../VaporwaveInfoPanel";

const FILE_TREE: FileNode[] = [
  {
    label: "home/",
    meta: "nixos@luix · vaporwave preset",
    children: [
      {
        label: "flakes/",
        meta: "nix + remotion + hm",
        children: [
          { label: "default.nix", meta: "entrypoint orchestrator" },
          {
            label: "profiles/",
            children: [
              { label: "studio.nix", meta: "obs / davinci stack" },
              { label: "terminal.nix", meta: "ghostty + theme inject" },
              { label: "vaporwave.nix", meta: "hyprland, waybar pulse" },
            ],
          },
        ],
      },
      {
        label: "scenes/",
        meta: "remotion outputs",
        children: [
          { label: "terminal-scene.tsx", meta: "typing hologram" },
          { label: "info-panel.tsx", meta: "listings showcase" },
          { label: "assets/", meta: "sun · palms · grids" },
        ],
      },
      {
        label: "secrets/",
        meta: "age encrypted drops",
        children: [
          { label: "tokens.age", meta: "gh + cachix" },
          { label: "artifacts.age", meta: "render credentials" },
        ],
      },
    ],
  },
];

const INFO_META_LINES = [
  "hyprland layout synced to vaporwave profile",
  "ghostty + jetbrains mono w/ custom ligatures",
  "obs neon overlay export scheduled for tonight",
];

export const InfoScene = () => {
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <VaporwaveBackground />
      <AbsoluteFill
        style={{
          padding: "2.5% 3%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", height: "92%" }}>
          <VaporwaveInfoPanel
            title="Neon Home Vault"
            tree={FILE_TREE}
            metaLines={INFO_META_LINES}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
