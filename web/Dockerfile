# syntax=docker/dockerfile:1

# ---- build stage ---------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Build the SPA. Build-time config is injected via ARG -> ENV so the same
# image recipe works for any deployment (host/domain/api base).
ARG VITE_STRATUM_HOST=new.mining-pool.io
ARG VITE_API_BASE=/api
ENV VITE_STRATUM_HOST=$VITE_STRATUM_HOST
ENV VITE_API_BASE=$VITE_API_BASE

COPY . .
RUN npm run build

# ---- runtime stage -------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# SPA-aware nginx config (history fallback + asset caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
