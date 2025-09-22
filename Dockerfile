# Multi-stage build for better optimization
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --update --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    build-base \
    cairo-dev \
    pango-dev \
    chromium \
    poppler-utils

# Install pnpm globally
RUN npm install -g pnpm@latest

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Optimize Node.js memory settings
ENV NODE_OPTIONS="--max-old-space-size=8192 --trace-warnings"

WORKDIR /usr/src

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/*/

# Install dependencies with error handling
RUN pnpm install --frozen-lockfile --prefer-frozen-lockfile || \
    (echo "pnpm install failed, trying with --no-frozen-lockfile" && \
     pnpm install --no-frozen-lockfile)

# Copy source code
COPY . .

# Build stage
FROM base AS builder

# Set build arguments
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_GITHUB_CLIENT_ID=""
ARG VITE_THUB_WEB_SERVER_PROD_URL=""
ARG VITE_THUB_WEB_SERVER_DEMO_URL=""
ARG VITE_THUB_WEB_SERVER_LOCAL_URL=""
ARG VITE_TEST_ENV=""

# Set environment variables for build
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_GITHUB_CLIENT_ID=${VITE_GITHUB_CLIENT_ID}
ENV VITE_THUB_WEB_SERVER_PROD_URL=${VITE_THUB_WEB_SERVER_PROD_URL}
ENV VITE_THUB_WEB_SERVER_DEMO_URL=${VITE_THUB_WEB_SERVER_DEMO_URL}
ENV VITE_THUB_WEB_SERVER_LOCAL_URL=${VITE_THUB_WEB_SERVER_LOCAL_URL}
ENV VITE_TEST_ENV=${VITE_TEST_ENV}

# Enable build scripts for necessary packages
RUN pnpm config set enable-pre-post-scripts true

# Build with better error handling and logging
RUN echo "Starting build process..." && \
    pnpm build --verbose 2>&1 | tee build.log || \
    (echo "Build failed. Last 50 lines of build log:" && \
     tail -50 build.log && \
     echo "Full build log above. Checking memory usage:" && \
     free -h && \
     exit 1)

# Production stage
FROM node:20-alpine AS production

# Install only runtime dependencies
RUN apk add --update --no-cache \
    libc6-compat \
    chromium \
    poppler-utils

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

WORKDIR /usr/src

# Copy built application and necessary files
COPY --from=builder /usr/src/dist ./dist
COPY --from=builder /usr/src/packages ./packages
COPY --from=builder /usr/src/package.json ./
COPY --from=builder /usr/src/pnpm-lock.yaml ./
COPY --from=builder /usr/src/node_modules ./node_modules

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Create and set permissions for data volume
RUN mkdir -p /usr/src/data && \
    chown -R nextjs:nodejs /usr/src

USER nextjs

VOLUME /usr/src/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["pnpm", "start"]