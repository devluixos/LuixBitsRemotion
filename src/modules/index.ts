import type { RemotionModule } from "./types";
import { currentSetupModule } from "./current-setup";
import { nixvimModule } from "./nixvim";
// import { brandIntroModule } from "./brand-intro";
// import { homeManagerModule } from "./home-manager";
// import { starculatorModule } from "./starculator";

export const modules: RemotionModule[] = [
  currentSetupModule,
  nixvimModule,
  // brandIntroModule,
  // homeManagerModule,
  // starculatorModule,
];
