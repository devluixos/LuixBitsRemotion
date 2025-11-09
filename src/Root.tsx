import "./index.css";
import { Composition } from "remotion";
import { TerminalScene } from "./scenes/TerminalScene";
import { InfoScene } from "./scenes/InfoScene";
import { TerminalMigrationScene } from "./scenes/TerminalMigrationScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TerminalScene"
        component={TerminalScene}
        durationInFrames={540}
        fps={30}
        width={3440}
        height={1440}
      />
      <Composition
        id="InfoScene"
        component={InfoScene}
        durationInFrames={360}
        fps={30}
        width={3440}
        height={1440}
      />
      <Composition
        id="TerminalMigrationScene"
        component={TerminalMigrationScene}
        durationInFrames={1260}
        fps={30}
        width={3440}
        height={1440}
      />
    </>
  );
};

