#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

log() {
  printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$1"
}

cleanup() {
  log "Shutting down..."
  if command -v kill >/dev/null 2>&1; then
    jobs -pr | xargs -r kill 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

install_deps() {
  local dir="$1"
  local name="$2"

  if [ ! -d "$dir" ]; then
    log "ERROR: $name directory not found at $dir"
    exit 1
  fi
  if [ ! -f "$dir/package.json" ]; then
    log "ERROR: no package.json in $dir"
    exit 1
  fi

  log "Installing $name dependencies..."
  (cd "$dir" && npm install)
}

log "Installing dependencies..."
install_deps "$BACKEND_DIR" "backend"
install_deps "$FRONTEND_DIR" "frontend"

log "Starting backend and frontend..."

(
  cd "$BACKEND_DIR"
  npm run dev
) &
BACKEND_PID=$!

(
  cd "$FRONTEND_DIR"
  npm run dev
) &
FRONTEND_PID=$!

wait "$BACKEND_PID" "$FRONTEND_PID"