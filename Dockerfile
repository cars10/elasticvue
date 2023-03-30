FROM node:14.18-alpine AS builder
WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn install --ignore-optional
COPY . .
RUN yarn build

FROM nginx:1.23-alpine
ARG ELASTICVUE_PORT=${ELASTICVUE_PORT:-8080}
ARG ELASTICSEARCH_HOST=${ELASTICSEARCH_HOST:-localhost}
ARG ELASTICSEARCH_PORT=${ELASTICSEARCH_PORT:-9200}
ARG ELASTIC_CLIENT_TYPE=${ELASTIC_CLIENT_TYPE:-default}
ARG ELASTIC_USERNAME=${ELASTIC_USERNAME:-}
ARG ELASTIC_PASSWORD=${ELASTIC_PASSWORD:-}
ENV ELASTICVUE_PORT=${ELASTICVUE_PORT}
ENV ELASTICSEARCH_HOST=${ELASTICSEARCH_HOST}
ENV ELASTICSEARCH_PORT=${ELASTICSEARCH_PORT}
ENV ELASTIC_CLIENT_TYPE=${ELASTIC_CLIENT_TYPE}
ENV ELASTIC_USERNAME=${ELASTIC_USERNAME}
ENV ELASTIC_PASSWORD=${ELASTIC_PASSWORD}

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
RUN mkdir /original
COPY --from=builder /usr/src/app/dist/assets/js/app*.js /original/
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/100-replace-enviroment.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/100-replace-enviroment.sh
COPY nginx/elasticvue.conf ${NGINX_ENVSUBST_TEMPLATE_DIR:-/etc/nginx/templates}/default.conf.template
EXPOSE 8080
