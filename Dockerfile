FROM node:20-alpine

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++ build-base cairo-dev pango-dev chromium curl git

# Install PNPM globally
RUN npm install -g pnpm

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_OPTIONS=--max-old-space-size=8192

WORKDIR /usr/src

# Copy root package files first for caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies including devDependencies
RUN pnpm install --frozen-lockfile

# Copy all sources
COPY . .

# Set build-time environment variables
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

# Ensure devDependencies are installed and path is correct for recursive build
# This runs build scripts for all packages, including thub-ui
RUN pnpm --recursive run build

EXPOSE 3000

CMD ["pnpm", "start"]
