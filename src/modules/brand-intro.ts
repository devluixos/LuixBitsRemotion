import { LuixBitsCubeIntroScene } from "../scenes/Intro/LuixBitsCubeIntroScene";
import type { RemotionModule } from "./types";

export const brandIntroModule: RemotionModule = {
  id: "brand-intro",
  title: "LuixBits Intro",
  compositions: [
    {
      id: "brand-intro-LuixBitsCubeIntro",
      component: LuixBitsCubeIntroScene,
      durationInFrames: 360, // 6s @60fps
      fps: 60,
      width: 3440,
      height: 1440,
    },
  ],
};
