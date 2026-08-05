FROM node:24.19.0-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY scripts/check-iroha-pin.mjs scripts/check-iroha-pin.mjs
COPY tests/mochi/explorer-profile.json tests/mochi/explorer-profile.json
RUN node scripts/check-iroha-pin.mjs
RUN pnpm fetch --frozen-lockfile

COPY src src
COPY public public
COPY *.json *.ts *.cjs *.mts *.html ./
RUN pnpm install --offline --frozen-lockfile
RUN pnpm build

FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /srv

RUN adduser -D -g '' caddy \
  && mkdir -p /data/caddy /config/caddy \
  && chown -R caddy /data/caddy /config/caddy
USER caddy

EXPOSE 8080

# NOTE: Supported env vars:
# - BACKEND_HOST - backend reverse-proxy host
# - BACKEND_PORT - backend reverse-proxy port
