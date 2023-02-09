#!/bin/bash 

echo "Container starting up..." 
set -e 

concurrently --names "server,app" \
    "cd server && yarn && yarn dev" \
    "cd app && yarn && yarn start"

exec "$@"