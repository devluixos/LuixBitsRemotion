/**
 * Note: When using the Node.js APIs, the config file doesn't apply.
 * Pass options directly to the APIs instead.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import fs from "node:fs";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);

const chromiumCandidates = [
  process.env.REMOTION_CHROMIUM_EXECUTABLE,
  "/run/current-system/sw/bin/chromium",
  "/home/luix/.nix-profile/bin/chromium",
].filter((candidate): candidate is string => Boolean(candidate));

const resolvedChromium = chromiumCandidates.find((candidate) =>
  fs.existsSync(candidate),
);

if (resolvedChromium) {
  Config.setBrowserExecutable(resolvedChromium);
} else {
  console.warn(
    `[remotion.config] Chromium executable not found in: ${chromiumCandidates.join(
      ", ",
    )}. Falling back to Remotion's bundled Chrome download.`,
  );
  Config.setBrowserExecutable(null);
}

const desiredConcurrency = Number(process.env.REMOTION_CONCURRENCY ?? "24");
if (!Number.isNaN(desiredConcurrency) && desiredConcurrency > 0) {
  Config.setConcurrency(desiredConcurrency);
}

const rendererPreference =
  (process.env.REMOTION_CHROMIUM_OPENGL as
    | "swangle"
    | "angle"
    | "egl"
    | "swiftshader"
    | "vulkan"
    | "angle-egl") ?? "vulkan";
Config.setChromiumOpenGlRenderer(rendererPreference);

process.env.PUPPETEER_HEADLESS_MODE =
  process.env.PUPPETEER_HEADLESS_MODE ?? "new";
Config.setChromiumHeadlessMode(true);
