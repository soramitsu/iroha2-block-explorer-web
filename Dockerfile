FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginxinc/nginx-unprivileged:mainline
USER nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html