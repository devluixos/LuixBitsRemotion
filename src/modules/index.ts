import type { RemotionModule } from "./types";
import { brandIntroModule } from "./brand-intro";
import { homeManagerModule } from "./home-manager";
import { nixvimModule } from "./nixvim";
import { starculatorModule } from "./starculator";

export const modules: RemotionModule[] = [
  brandIntroModule,
  homeManagerModule,
  nixvimModule,
  starculatorModule,
];
