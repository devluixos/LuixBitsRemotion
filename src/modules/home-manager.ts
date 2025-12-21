import {
  BringingItTogetherScene,
  BRINGING_SCENE_DURATION,
  FlakeInfoScene,
  HomeManagerScene,
  KittyShowcaseScene,
  KITTY_SHOWCASE_DURATION,
  ModulesScene,
  MODULES_SCENE_DURATION,
  ModulesShowcaseScene,
  MODULES_SHOWCASE_DURATION,
  SystemConfigScene,
  TerminalMigrationScene,
} from "../scenes/HomeManager";
import type { RemotionModule } from "./types";

const BASE_WIDTH = 3440;
const BASE_HEIGHT = 1440;
const BASE_FPS = 30;

export const homeManagerModule: RemotionModule = {
  id: "home-manager",
  title: "Home Manager Series",
  compositions: [
    {
      id: "home-manager-terminal-migration",
      component: TerminalMigrationScene,
      durationInFrames: 1260,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
    {
      id: "home-manager-flake-info",
      component: FlakeInfoScene,
      durationInFrames: 900,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
    {
      id: "home-manager-system-config",
      component: SystemConfigScene,
      durationInFrames: 1530,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
    {
      id: "home-manager-overview",
      component: HomeManagerScene,
      durationInFrames: 1380,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
    {
      id: "home-manager-modules",
      component: ModulesScene,
      durationInFrames: MODULES_SCENE_DURATION,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
    {
      id: "home-manager-bringing-it-together",
      component: BringingItTogetherScene,
      durationInFrames: BRINGING_SCENE_DURATION,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
    {
      id: "home-manager-modulesShowcase",
      component: ModulesShowcaseScene,
      durationInFrames: MODULES_SHOWCASE_DURATION,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
    {
      id: "home-manager-kitty-showcase",
      component: KittyShowcaseScene,
      durationInFrames: KITTY_SHOWCASE_DURATION,
      fps: BASE_FPS,
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    },
  ],
};
