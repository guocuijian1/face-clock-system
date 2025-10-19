#!/bin/bash
set -euo pipefail

# Resolve the directory of this script and the project root (one level up)
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
PARENT_DIR="$(realpath "$SCRIPT_DIR/..")"
cd "$PARENT_DIR"

# Helper to print errors
err() {
  ts="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  # Print timestamp and all arguments to stderr, preserving argument boundaries
  printf '%s ERROR:' "$ts" >&2
  for a in "$@"; do
    printf ' %s' "$a" >&2
  done
  printf '\n' >&2
}

# Ensure required CLIs are available
missing=()
command -v docker >/dev/null || missing+=(docker)
command -v helm >/dev/null || missing+=(helm)
command -v kubectl >/dev/null || missing+=(kubectl)
if [ ${#missing[@]} -ne 0 ]; then
  err "Missing required command(s): ${missing[*]}. Please install them and re-run."
  exit 1
fi

# Ensure the backend Dockerfile and context exist
BACKEND_DOCKERFILE="$PARENT_DIR/backend/k8s/Dockerfile"
BACKEND_CONTEXT="$PARENT_DIR/backend"
if [ ! -f "$BACKEND_DOCKERFILE" ]; then
  err "Backend Dockerfile not found at $BACKEND_DOCKERFILE"
  exit 1
fi
if [ ! -d "$BACKEND_CONTEXT" ]; then
  err "Backend build context not found at $BACKEND_CONTEXT"
  exit 1
fi

# Ensure the frontend Dockerfile and context exist
FRONTEND_DOCKERFILE="$PARENT_DIR/frontend/k8s/Dockerfile"
FRONTEND_CONTEXT="$PARENT_DIR/frontend"
if [ ! -f "$FRONTEND_DOCKERFILE" ]; then
  err "Frontend Dockerfile not found at $FRONTEND_DOCKERFILE"
  exit 1
fi
if [ ! -d "$FRONTEND_CONTEXT" ]; then
  err "Frontend build context not found at $FRONTEND_CONTEXT"
  exit 1
fi

# Optionally install ingress-nginx if it's not present in the cluster
if ! helm status ingress-nginx -n ingress-nginx >/dev/null 2>&1; then
  echo "ingress-nginx release not found; attempting to add repo and install (namespace: ingress-nginx)"
  set +e
  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx >/dev/null 2>&1
  repo_add_rc=$?
  set -e
  if [ $repo_add_rc -ne 0 ]; then
    err "Failed to add ingress-nginx helm repo. You may be in an environment without outbound internet access. Skipping automatic install."
  else
    helm repo update
    helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
      --namespace ingress-nginx --create-namespace --wait
  fi
else
  echo "ingress-nginx already installed"
fi

# Build backend image
BACKEND_IMAGE_TAG="face-clock-backend:v1"
echo "Building backend image: $BACKEND_IMAGE_TAG"
docker build -t "$BACKEND_IMAGE_TAG" -f "$BACKEND_DOCKERFILE" "$BACKEND_CONTEXT"

# Build frontend image
FRONTEND_IMAGE_TAG="face-clock-frontend:v1"
echo "Building frontend image: $FRONTEND_IMAGE_TAG"
docker build -t "$FRONTEND_IMAGE_TAG" -f "$FRONTEND_DOCKERFILE" "$FRONTEND_CONTEXT"

# Install/upgrade the Helm chart for the application
CHART_DIR="$PARENT_DIR/k8s/helm"
if [ ! -d "$CHART_DIR" ]; then
  err "Helm chart directory not found at $CHART_DIR"
  exit 1
fi
helm upgrade --install face-clock-system "$CHART_DIR" --wait

echo "deploy.sh completed successfully"
