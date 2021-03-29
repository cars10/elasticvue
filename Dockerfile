FROM node:14.16-alpine3.10 AS builder
WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn install
COPY . .
RUN yarn build

FROM nginx:1.17.3-alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/elasticvue.conf /etc/nginx/conf.d/
