# iroha2-block-explorer-web

This repository is managed by Terraform!

## Build

Node v20+ with Corepack is required.

```bash
corepack enable
pnpm i
pnpm build
```

Build artifacts will be located at `dist` dir.

### Docker

`Dockerfile` with `nginx.conf` are also provided. Based on [Deployment > Docker (nginx)](https://cli.vuejs.org/guide/deployment.html#docker-nginx).

## Development

Frontend sends API requests to its own base URL (`<base>/api/v1`) by default. When served via Vite, it is automatically
proxied to `localhost:4000`. Proxy target could be changed in `vite.config.mts`.
