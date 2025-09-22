FROM node:20-alpine
RUN apk add --update libc6-compat python3 make g++
# needed for pdfjs-dist
RUN apk add --no-cache build-base cairo-dev pango-dev

# Install Chromium
RUN apk add --no-cache chromium

RUN apk add --no-cache poppler-utils

#install PNPM globaly
RUN npm install -g pnpm

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV NODE_OPTIONS="--max-old-space-size=8192 --trace-warnings"

WORKDIR /usr/src

VOLUME /usr/src/data

# Copy dependency files first for better caching
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./ 

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy rest of the source code
COPY . .

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

RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "start" ]
