FROM node:16.17.0-buster-slim

RUN apt-get update && \
    apt-get install -y git build-essential python3 python3-pip pkg-config libssl-dev iputils-ping net-tools htop&& \
    apt-get clean

WORKDIR /livestream

ENV DEBUG=LIVESTREAM*

RUN npm install -g nodemon && \
    npm install -g concurrently

RUN touch /.yarnrc && mkdir -p /.yarn /.cache/yarn && chmod -R 775 /.yarn /.yarnrc /.cache

COPY docker-entrypoint.sh /

ENTRYPOINT ["/docker-entrypoint.sh"]
