# Build elasticvue
FROM node:22.5.1-bookworm AS builder
RUN mkdir /app
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install
COPY . .
RUN VITE_APP_BUILD_MODE=docker yarn build


# Create lightweight nginx image
FROM nginxinc/nginx-unprivileged:mainline-alpine
ENV CONFIG_FILE_DIR=/usr/share/nginx/html/api
COPY --from=builder /app/dist /usr/share/nginx/html
USER root
RUN mkdir -p $CONFIG_FILE_DIR
RUN chown -R nginx:nginx $CONFIG_FILE_DIR
USER nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx/elasticvue.conf /etc/nginx/conf.d/
COPY docker/nginx/99_default_clusters.sh /docker-entrypoint.d
