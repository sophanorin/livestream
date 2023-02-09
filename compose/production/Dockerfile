FROM node:16.17.0-buster-slim AS livestream-builder
# FROM node:16.17.0 AS livestream-builder

WORKDIR /livestream

RUN apt-get update && \
    apt-get install -y git build-essential python3 python3-pip pkg-config libssl-dev && \
    apt-get clean

RUN npm install -g nodemon && \
    npm install -g concurrently

RUN touch /.yarnrc && mkdir -p /.yarn /.cache/yarn && chmod -R 775 /.yarn /.yarnrc /.cache

RUN concurrently --name "app,server" \
    "cd app && yarn" \
    "cd server && yarn"

ENV DEBUG=LIVESTREAM*,mediasoup*

RUN mkdir -p /livestream/server/public
RUN mkdir -p /livestream/app/node_modules/latex.js/dist/packages /livestream/app/node_modules/latex.js/dist/documentclasses

RUN cd app && yarn build

FROM node:16.17.0-buster-slim

COPY --from=livestream-builder /livestream/server /livestream/server

# Web PORTS
EXPOSE 80 443 
EXPOSE 40000-49999/udp

WORKDIR /livestream/server

CMD [ "yarn", "start:dev" ]