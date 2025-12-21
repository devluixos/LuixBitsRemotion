import { Day1LearningsScene, DAY1_LEARNINGS_DURATION } from "../scenes/Day1";
import type { RemotionModule } from "./types";

const BASE_WIDTH = 3440;
const BASE_HEIGHT = 1440;
const BASE_FPS = 30;

export const day1Module: RemotionModule = {
  id: "day1-learnings",
  title: "Day 1 Learnings",
  compositions: [
    {
      id: "day1-learnings-vaporwave",
      component: Day1LearningsScene,
      durationInFrames: DAY1_LEARNINGS_DURATION,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
  ],
};
