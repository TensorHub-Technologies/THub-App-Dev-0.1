# Use Node 22 for better compatibility
FROM node:22.14.0-alpine

# Install dependencies needed for building packages and PDF support
RUN apk add --no-cache libc6-compat python3 make g++ build-base cairo-dev pango-dev chromium curl

# Install pnpm globally
RUN npm install -g pnpm

# Puppeteer settings
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Increase Node memory
ENV NODE_OPTIONS=--max-old-space-size=8192

# Set working directory
WORKDIR /usr/src

# Copy root package.json and lockfile first for caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies (monorepo aware)
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Set build environment variables (can be overridden during build)
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GITHUB_CLIENT_ID
ARG VITE_THUB_WEB_SERVER_PROD_URL
ARG VITE_THUB_WEB_SERVER_DEMO_URL
ARG VITE_THUB_WEB_SERVER_LOCAL_URL
ARG VITE_TEST_ENV

ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_GITHUB_CLIENT_ID=${VITE_GITHUB_CLIENT_ID}
ENV VITE_THUB_WEB_SERVER_PROD_URL=${VITE_THUB_WEB_SERVER_PROD_URL}
ENV VITE_THUB_WEB_SERVER_DEMO_URL=${VITE_THUB_WEB_SERVER_DEMO_URL}
ENV VITE_THUB_WEB_SERVER_LOCAL_URL=${VITE_THUB_WEB_SERVER_LOCAL_URL}
ENV VITE_TEST_ENV=${VITE_TEST_ENV}

# Build all packages recursively (monorepo-safe)
RUN pnpm -r build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
