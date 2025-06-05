# Build local monorepo image
# docker build --no-cache -t  flowise .

# Run image
# docker run -d -p 3000:3000 flowise

FROM node:20-alpine
RUN apk add --update libc6-compat python3 make g++
# needed for pdfjs-dist
RUN apk add --no-cache build-base cairo-dev pango-dev

# Install Chromium
RUN apk add --no-cache chromium

#install PNPM globaly
RUN npm install -g pnpm

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV NODE_OPTIONS=--max-old-space-size=8192

WORKDIR /usr/src

VOLUME /usr/src/data

# Copy app source
COPY . .

RUN pnpm install

ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_THUB_WEB_SERVER_PROD_URL
ARG VITE_THUB_WEB_SERVER_DEMO_URL
ARG VITE_THUB_WEB_SERVER_LOCAL_URL
ARG VITE_TEST_ENV

ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_THUB_WEB_SERVER_PROD_URL=${VITE_THUB_WEB_SERVER_PROD_URL}
ENV VITE_THUB_WEB_SERVER_DEMO_URL=${VITE_THUB_WEB_SERVER_DEMO_URL}
ENV VITE_THUB_WEB_SERVER_LOCAL_URL=${VITE_THUB_WEB_SERVER_LOCAL_URL}
ENV VITE_TEST_ENV=${VITE_TEST_ENV}

RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "start" ]
