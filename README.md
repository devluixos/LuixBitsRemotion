# LuixBitsRemotion

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.gif">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

```txt
/*==================================================================*\
|  L U I X B I T S   R E M O T I O N  -  Scene + Clip Factory        |
\*==================================================================*/
```

Neon-first Remotion project to create scenes and clips for the LuixBits video universe.
Modular compositions, vaporwave UI, and cinematic gradients drive the look.

## Project Outline

- Purpose: build short scenes and clips for LuixBits episodes.
- Stack: Remotion + React + Tailwind (via `remotion.config.ts`) with inline styling.
- Output: rendered videos land in `out/`.
- Composition registry: `src/Root.tsx` pulls modules from `src/modules/`.
- Scenes: animation work lives under `src/scenes/`.
- UI blocks: reusable pieces live in `src/components/`.

## Scene Modules (Compositions)

- brand-intro: `LuixBitsCubeIntroScene`
- day1-learnings: `Day1LearningsScene`
- home-manager: `TerminalMigrationScene`, `FlakeInfoScene`, `SystemConfigScene`, `HomeManagerScene`, `ModulesScene`, `BringingItTogetherScene`, `ModulesShowcaseScene`, `KittyShowcaseScene`
- nixvim: `NixvimBlockBuildScene`
- starculator: `StarculatorTrailerScene`, `StarculatorOutroScene`

## Current Components

| Component | Purpose |
| --- | --- |
| `CodeBlock` | Neon code panel with line numbers and keyword highlights. |
| `GlassCard` | Frosted glass container for layered panels. |
| `InfoMediaPanel` | Switchable card for errors, code, images, or comparisons. |
| `ModuleGrid` | Simple grid of module labels. |
| `SceneProgressBar` | Timeline progress bar with glow. |
| `SplitPanel` | Two-column layout with flex controls. |
| `TextInfoCard` | Title + numbered bullet list layout. |
| `Terminal` | Animated terminal typing/paste sequences. |
| `VaporwaveBackground` | Animated sun, grid, stars, palms, and haze. |
| `VaporwaveInfoPanel` | Neon file-tree and bullet panel with reveal timing. |

## Color Theme (Vaporwave)

| Tone | Hex | Use |
| --- | --- | --- |
| Neon pink | `#ff5da2` | Titles, glows, progress accents. |
| Aqua | `#8afff7` | Highlights, UI chips, cool glow. |
| Sunset amber | `#ffd580` | Callouts, emphasis, warm blend. |
| Lavender | `#bd9bff` | Secondary accents, depth. |
| Midnight base | `#060012` / `#030008` | Background depth and contrast. |

Style notes:
- Glassy overlays with blur and soft borders.
- Gradients and neon glows over deep space backgrounds.
- Typography mix: Space Grotesk / Sora for titles, JetBrains Mono for code.

## Code Structure

```txt
.
|-- src/
|   |-- index.ts              Remotion entrypoint
|   |-- Root.tsx              Composition registry
|   |-- modules/              Composition groups
|   |-- scenes/               Animated scenes
|   |-- components/           Reusable UI blocks
|   |-- assets/               Images and media
|   `-- index.css             Global styles
|-- remotion.config.ts        Render + Chromium config
|-- public/                   Static assets
`-- out/                      Render outputs
```

## Commands

**Install dependencies**

```console
npm i
```

**Start preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

### Dockerized workflow (recommended on NixOS)

Remotion's Chromium build expects an FHS-compliant Linux distribution.
Use the provided Docker image to run previews and renders inside Debian:

```console
# Build the image (cached, re-run when dependencies change)
npm run docker:build

# Start the Studio/preview server on http://localhost:3001 inside the container
npm run docker:preview

# Render a composition (writes to ./out on the host)
npm run docker:render -- MyComp out/video.mp4
```

Both commands share the `./out` directory with the host, so rendered files appear locally.
To run an arbitrary command inside the container:

```console
docker run --rm -it -v "$PWD":/usr/src/app -p 3001:3001 remotion-nixos \
  bash -lc "npm run lint && npx remotion render MyComp out/video.mp4"
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs / Help / Issues / License

- Docs: https://www.remotion.dev/docs/the-fundamentals
- Help: https://discord.gg/6VzzNDwUwV
- Issues: https://github.com/remotion-dev/remotion/issues/new
- License: https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
