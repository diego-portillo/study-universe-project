# syntax=docker/dockerfile:1

# Multi-stage build for Next.js 16 with output: "standalone".
# Stage 1 (deps):    install with a clean lockfile.
# Stage 2 (builder): run tests, then next build → emits .next/standalone.
# Stage 3 (runner):  minimal runtime image with only the traced files.

FROM node:20-alpine AS base

# Pick up patched OS packages (e.g. OpenSSL) on top of the pinned base image.
RUN apk update && apk upgrade --no-cache

# --- deps ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_BASE_PATH=""
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_TELEMETRY_DISABLED=1

# Run tests before building — if any test fails, the image build fails too.
# No API keys are needed: tests mock external providers.
RUN npm run test:run

RUN npm run build

# --- runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime only needs `node server.js` — strip npm/yarn/corepack (unused build
# tooling from the base image) to drop their vulnerable bundled dependencies.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    /opt/yarn-* /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn* \
    /usr/local/bin/corepack

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
