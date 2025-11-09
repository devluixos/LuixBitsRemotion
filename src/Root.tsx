import "./index.css";
import { Composition } from "remotion";
import { TerminalMigrationScene } from "./scenes/TerminalMigrationScene";
import { FlakeInfoScene } from "./scenes/FlakeInfoScene";
import { SystemConfigScene } from "./scenes/SystemConfigScene";
import { HomeManagerScene } from "./scenes/HomeManagerScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TerminalMigrationScene"
        component={TerminalMigrationScene}
        durationInFrames={1260}
        fps={30}
        width={3440}
        height={1440}
      />
      <Composition
        id="FlakeInfoScene"
        component={FlakeInfoScene}
        durationInFrames={900}
        fps={30}
        width={3440}
        height={1440}
      />
      <Composition
        id="SystemConfigScene"
        component={SystemConfigScene}
        durationInFrames={1530}
        fps={30}
        width={3440}
        height={1440}
      />
      <Composition
        id="HomeManagerScene"
        component={HomeManagerScene}
        durationInFrames={1200}
        fps={30}
        width={3440}
        height={1440}
      />
    </>
  );
};
