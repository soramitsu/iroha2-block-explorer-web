FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginxinc/nginx-unprivileged:mainline
ENV LOAD_DIR=/app
RUN adduser --disabled-password --gecos "" iroha && \
    mkdir -p ${LOAD_DIR} && \
    chown -R iroha ${LOAD_DIR}
COPY --from=build-stage /app/dist ${LOAD_DIR}