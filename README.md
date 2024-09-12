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

### Setting up the `.env` file

You need a file with environment variables to configure Vite for the frontend to properly interact with the backend.

Vite can be configured to proxy the responses.

To interact with the backend, assuming you'll add an API proxy as described below, write:

```
VITE_API_URL=http://localhost:5173/api/v1
```

If our `dev` shows the port as 5173.
