# LuixBitsRemotion

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.gif">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

### Dockerized workflow (recommended on NixOS)

Remotion’s Chromium build expects an FHS-compliant Linux distribution.  
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

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
