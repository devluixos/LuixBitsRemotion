import { NixvimBlockBuildScene, NIXVIM_BLOCK_BUILD_DURATION } from "../scenes/Nixvim";
import type { RemotionModule } from "./types";

const BASE_WIDTH = 3440;
const BASE_HEIGHT = 1440;
const BASE_FPS = 30;

export const nixvimModule: RemotionModule = {
  id: "nixvim",
  title: "Nixvim Build",
  compositions: [
    {
      id: "nixvim-block-build",
      component: NixvimBlockBuildScene,
      durationInFrames: NIXVIM_BLOCK_BUILD_DURATION,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
  ],
};
