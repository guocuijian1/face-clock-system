#!/bin/bash
set -e

SCRIPT_DIR=$(dirname "$0")
DOCKERFILE_PATH="$SCRIPT_DIR/Dockerfile-test"
IMAGE_NAME="face-clock-frontend:v1"

if [ ! -f "$DOCKERFILE_PATH" ]; then
  echo "Dockerfile-Base not found in $SCRIPT_DIR"
  exit 1
fi

docker build -f "$DOCKERFILE_PATH" -t "$IMAGE_NAME" "$SCRIPT_DIR/.."
echo "Image $IMAGE_NAME built successfully."
