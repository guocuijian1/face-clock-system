#!/bin/bash
set -e

# Get the current shell script's absolute path
PARENT_DIR="$(realpath "$(dirname "$0")/..")"

cd "$PARENT_DIR"
# Build backend image
docker build -t face-clock-backend:v1 -f backend/k8s/Dockerfile backend

cd "$PARENT_DIR"
# Build frontend image
docker build -t face-clock-frontend:v1 -f frontend/k8s/Dockerfile frontend

# Install helm chart
type helm >/dev/null 2>&1 || { echo "Helm not found, please install helm first."; exit 1; }
helm upgrade --install face-clock-system k8s/helm
