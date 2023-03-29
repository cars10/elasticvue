FROM node:14.18-alpine AS builder
WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn install --ignore-optional
COPY . .
RUN yarn build

FROM nginx:1.23-alpine
ARG ELASTICSEARCH_HOST=${ELASTICSEARCH_HOST:-localhost}
ARG ELASTICSEARCH_PORT=${ELASTICSEARCH_PORT:-9200}
ARG ELASTIC_CLIENT_TYPE=${ELASTIC_CLIENT_TYPE:-default}
ENV ELASTICSEARCH_HOST=${ELASTICSEARCH_HOST}
ENV ELASTICSEARCH_PORT=${ELASTICSEARCH_PORT}
ENV ELASTIC_CLIENT_TYPE=${ELASTIC_CLIENT_TYPE}

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
RUN mkdir /original
COPY --from=builder /usr/src/app/dist/assets/js/app*.js /original/
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/100-replace-enviroment.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/100-replace-enviroment.sh
COPY nginx/elasticvue.conf /etc/nginx/conf.d/default.conf.template
