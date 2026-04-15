FROM node:20-bookworm-slim

# Native/build dependencies needed by workspace packages and headless browser features.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    chromium \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# install pnpm globally (pinned for deterministic CI builds)
RUN npm install -g pnpm@10.28.2

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_OPTIONS=--max-old-space-size=8192
# Disable Husky install inside container build context.
ENV HUSKY=0

WORKDIR /usr/src

# Copy lockfile first for caching
COPY pnpm-lock.yaml ./

# Copy source
COPY . .

# IMPORTANT FIX:
# Do NOT reinstall node_modules separately in production.
# Keep the monorepo structure exactly as local.
RUN pnpm install --frozen-lockfile

# Set environment variables
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GITHUB_CLIENT_ID
ARG VITE_THUB_WEB_SERVER_PROD_URL
ARG VITE_THUB_WEB_SERVER_DEMO_URL
ARG VITE_THUB_WEB_SERVER_QA_URL
ARG VITE_THUB_WEB_SERVER_LOCAL_URL
ARG VITE_TEST_ENV

ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_GITHUB_CLIENT_ID=${VITE_GITHUB_CLIENT_ID}
ENV VITE_THUB_WEB_SERVER_PROD_URL=${VITE_THUB_WEB_SERVER_PROD_URL}
ENV VITE_THUB_WEB_SERVER_DEMO_URL=${VITE_THUB_WEB_SERVER_DEMO_URL}
ENV VITE_THUB_WEB_SERVER_LOCAL_URL=${VITE_THUB_WEB_SERVER_LOCAL_URL}
ENV VITE_THUB_WEB_SERVER_QA_URL=${VITE_THUB_WEB_SERVER_QA_URL}
ENV VITE_TEST_ENV=${VITE_TEST_ENV}

RUN pnpm --filter ./packages/components... run build \
    && pnpm --filter ./packages/ui... run build \
    && pnpm --filter ./packages/server... run build

EXPOSE 3000

CMD ["pnpm", "start"]
