FROM nginxinc/nginx-unprivileged:mainline
USER nginx
COPY ./build /usr/share/nginx/html