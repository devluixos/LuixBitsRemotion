import {
  StarculatorOutroScene,
  STAR_OUTRO_DURATION,
  StarculatorTrailerScene,
  TRAILER_DURATION,
} from "../scenes/Starculator";
import type { RemotionModule } from "./types";

const BASE_WIDTH = 3440;
const BASE_HEIGHT = 1440;
const BASE_FPS = 30;

export const starculatorModule: RemotionModule = {
  id: "starculator",
  title: "Starculator Trailer",
  compositions: [
    {
      id: "starculator-trailer",
      component: StarculatorTrailerScene,
      durationInFrames: TRAILER_DURATION,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
    {
      id: "starculator-outro",
      component: StarculatorOutroScene,
      durationInFrames: STAR_OUTRO_DURATION,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
  ],
};
