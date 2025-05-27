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

`Dockerfile` is also provided.

## Development

Frontend sends API requests to its own base URL (`<base>/api/v1`) by default. When served via Vite, it is automatically
proxied to `localhost:4000`. Proxy target could be changed in `vite.config.mts`.

## Compatibility and Versioning

Please refer to the [Explorer Backend documentation](https://github.com/soramitsu/iroha2-block-explorer-backend#compatibility-and-versioning).
