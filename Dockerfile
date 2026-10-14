# syntax=docker/dockerfile:1

# Keep in sync with .nvmrc
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# lib/auth.ts validates these at import time; the real values are read at
# runtime, so build-only placeholders are enough and never reach the image.
RUN KEYCLOAK_CLIENT_ID=build \
    KEYCLOAK_CLIENT_SECRET=build \
    KEYCLOAK_ISSUER=http://localhost/realms/build \
    BETTER_AUTH_SECRET=build-only-placeholder-secret-0000 \
    BETTER_AUTH_URL=http://localhost:3000 \
    npm run build

FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
