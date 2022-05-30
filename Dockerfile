FROM      node:18.2.0-bullseye
COPY      . /app
WORKDIR   /app
RUN       npm install && npm run build
USER      node
ENV       PORT=8080
CMD       ["node", "app"]