FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginxinc/nginx-unprivileged:mainline
ENV LOAD_DIR=/app
USER root
RUN mkdir -p ${LOAD_DIR}
RUN chown -R nginx:nginx ${LOAD_DIR}
USER nginx
WORKDIR ${LOAD_DIR}
COPY --from=build-stage /app/dist ${LOAD_DIR}