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

To interact with the backend, assuming you'll add an API proxy as described below, write:

```
VITE_API_URL=http://localhost:5173/api-proxy
```

### Connecting to a BCE backend

One may want to see to see how the backend responds in the real time,
but pointing the API endpoint directly in the `VITE_API_URL` property of an `.env` file
would lead to a lot of errors like this one:

    Access to fetch at 'http://localhost:port_A/...' from origin 'http://localhost:port_B' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.

Vite can be configured to proxy the responses.

So, we first return to the `.env` file and configure `VITE_API_URL` property as `http://localhost:5173/api-proxy`, if our `dev` shows the port as 5173.

Then we go to the Vite configuration in `vite.config.js` and add a new part in our `defineConfig` section,
where our `target` points to the host and the port of our BCE backend instance.

```js
export default defineConfig({
  server: {
    proxy: {
      '/api-proxy': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
        ws: false,
        rewrite: (path) => '/api/v1' + path.replace(/api-proxy\//, ''),
      },
    },
  },
});
```
