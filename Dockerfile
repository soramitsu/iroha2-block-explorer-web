FROM nginxinc/nginx-unprivileged:mainline
USER nginx
COPY ./dist /usr/share/nginx/html