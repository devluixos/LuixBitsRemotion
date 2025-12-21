import type { ComponentType } from "react";

export type CompositionConfig = {
  id: string;
  component: ComponentType;
  durationInFrames: number;
  fps?: number;
  width?: number;
  height?: number;
};

export type RemotionModule = {
  id: string;
  title: string;
  compositions: CompositionConfig[];
};
