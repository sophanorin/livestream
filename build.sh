#!/bin/sh

bold=$(tput bold)
normal=$(tput sgr0)
IMAGE_TAG=latest
PLATFORM=amd64

set -e

usage() { 
  echo "Usage: $0 [ -n <string> ${bold}required*${normal} ] || [ -t optional <string> ]

Available options: 
    -n      Ex: [ -n sophanorin/livestream ]
    -t      Ex: [ -t beta1.0.0 ]
    -p      Ex: [ -p amd64 | arm64 ]
" 1>&2; exit 1; }

[ $# -eq 0 ] && usage

while getopts ":n:t:p:" option; do
    case "${option}" in
        n)
            IMAGE_NAME=${OPTARG}
            ;;
        t)
            IMAGE_TAG="${OPTARG}"
            ;;
        p)
            PLATFORM=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done

echo "Starts building Docker image $IMAGE_NAME:$IMAGE_TAG for ${bold}$PLATFORM${normal} architecture..." 

if [ -z "$IMAGE_NAME" ]
then
  echo "
\033[31mError occure while building image:

    Docker image [${IMAGE_NAME:=______}:$IMAGE_TAG].
    You are missing docker IMAGE_NAME.
  "
  echo "Docker IMAGE_NAME is required.\n"
  usage
else
    if [ -z "$PLATFORM" ]
    then
        docker build -t "$IMAGE_NAME:$IMAGE_TAG" .
    else
        docker buildx build --platform "linux/$PLATFORM" -t "$IMAGE_NAME:$IMAGE_TAG" .
    fi
fi

