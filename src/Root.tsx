import "./index.css";
import { Composition } from "remotion";
import { modules } from "./modules";

const DEFAULT_FPS = 30;
const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

export const RemotionRoot: React.FC = () => (
  <>
    {modules.flatMap((mod) =>
      mod.compositions.map((composition) => (
        <Composition
          key={composition.id}
          id={composition.id}
          component={composition.component}
          durationInFrames={composition.durationInFrames}
          fps={composition.fps ?? DEFAULT_FPS}
          width={composition.width ?? DEFAULT_WIDTH}
          height={composition.height ?? DEFAULT_HEIGHT}
        />
      )),
    )}
  </>
);
