# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /usr/src/app

# Install shared libraries Chromium Headless Shell requires plus dumb-init for signal handling.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      dumb-init \
      libnss3 \
      libdbus-1-3 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libasound2 \
      libxrandr2 \
      libxkbcommon0 \
      libxfixes3 \
      libxcomposite1 \
      libxdamage1 \
      libgbm1 \
      libcups2 \
      libcairo2 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development \
    PUPPETEER_HEADLESS_MODE=new \
    REMOTION_BROWSER=headless-shell

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Pre-fetch the Chrome Headless Shell so runtime containers don't download it again.
RUN npx remotion browser ensure --browser headless-shell

EXPOSE 3000 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "preview"]
