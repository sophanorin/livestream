FROM node:16.17.0-buster-slim AS livestream-builder

# Args
ARG BASEDIR=/opt
ARG LIVESTREAM=livestream
ARG NODE_ENV=development
ARG SERVER_DEBUG=LIVESTREAM*
ARG REACT_APP_DEBUG=''

WORKDIR ${BASEDIR}

RUN apt-get update;DEBIAN_FRONTEND=noninteractive apt-get install -yq git bash jq build-essential python3 python3-pip openssl libssl-dev pkg-config;apt-get clean

COPY . ./${LIVESTREAM}

#install app dep
WORKDIR ${BASEDIR}/${LIVESTREAM}/app
RUN yarn

RUN mkdir -p ${BASEDIR}/${LIVESTREAM}/app/node_modules/latex.js/dist/packages ${BASEDIR}/${LIVESTREAM}/app/node_modules/latex.js/dist/documentclasses

#set and build app in producion mode/minified/.
ENV NODE_ENV ${NODE_ENV}
ENV REACT_APP_DEBUG=${REACT_APP_DEBUG}
RUN yarn build

#install server dep
WORKDIR ${BASEDIR}/${LIVESTREAM}/server
RUN yarn

FROM node:16.17.0-buster-slim


ARG BASEDIR=/opt
ARG LIVESTREAM=livestream
ARG NODE_ENV=development
ARG SERVER_DEBUG=''

WORKDIR ${BASEDIR}

COPY --from=livestream-builder ${BASEDIR}/${LIVESTREAM}/server  ${BASEDIR}/${LIVESTREAM}/server

WORKDIR ${BASEDIR}/${LIVESTREAM}/server

# Web PORTS
EXPOSE 80 443 
EXPOSE 40000-49999/udp

## run server 
ENV DEBUG ${SERVER_DEBUG}
ENV BASEDIR ${BASEDIR}
ENV LIVESTREAM ${LIVESTREAM}

CMD [ "yarn", "start:dev" ]