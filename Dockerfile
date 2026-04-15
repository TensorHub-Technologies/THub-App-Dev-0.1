FROM node:20-alpine

RUN apk add --update libc6-compat python3 make g++
RUN apk add --no-cache build-base cairo-dev pango-dev
RUN apk add --no-cache chromium
RUN apk add --no-cache curl

# install pnpm globally (pinned for deterministic CI builds)
RUN npm install -g pnpm@10.28.2

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_OPTIONS=--max-old-space-size=8192

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

RUN pnpm build --concurrency=1

EXPOSE 3000

CMD ["pnpm", "start"]
