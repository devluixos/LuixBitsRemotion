import type { RemotionModule } from "./types";
import { brandIntroModule } from "./brand-intro";
import { day1Module } from "./day1";
import { homeManagerModule } from "./home-manager";
import { nixvimModule } from "./nixvim";
import { starculatorModule } from "./starculator";

export const modules: RemotionModule[] = [
  brandIntroModule,
  day1Module,
  homeManagerModule,
  nixvimModule,
  starculatorModule,
];
