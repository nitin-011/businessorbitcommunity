#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

USE_NGROK=0
INSTALL_DEPS=0
for arg in "$@"; do
  if [ "$arg" = "--ngrok" ]; then
    USE_NGROK=1
  elif [ "$arg" = "-i" ] || [ "$arg" = "--install" ]; then
    INSTALL_DEPS=1
  fi
done

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

if [ "$INSTALL_DEPS" = 1 ]; then
  log "Installing dependencies..."
  install_deps "$BACKEND_DIR" "backend"
  install_deps "$FRONTEND_DIR" "frontend"
fi

if [ "$USE_NGROK" = 1 ]; then
  log "Starting ngrok..."
  if ! command -v ngrok >/dev/null 2>&1; then
    log "ERROR: ngrok is not installed or not in PATH"
    exit 1
  fi
  
  # Load env for NGROK_AUTHTOKEN if present
  if [ -f "$BACKEND_DIR/.env" ]; then
    # We use grep to avoid reading comments, but env files might have spaces or weird characters.
    # To be safe, we just source it if we can or extract specifically NGROK_AUTHTOKEN
    TOKEN=$(grep '^NGROK_AUTHTOKEN=' "$BACKEND_DIR/.env" | cut -d '=' -f2- | tr -d ' ' | tr -d '"' | tr -d "'" || true)
    if [ -n "$TOKEN" ]; then
      export NGROK_AUTHTOKEN="$TOKEN"
    fi
  fi

  if [ -n "${NGROK_AUTHTOKEN:-}" ]; then
    ngrok config add-authtoken "$NGROK_AUTHTOKEN" >/dev/null 2>&1
  fi

  # Kill any existing ngrok process to avoid session limits on free accounts
  pkill -f ngrok || true
  sleep 1

  ngrok http 8001 > /dev/null &
  NGROK_PID=$!
  
  log "Waiting for ngrok to initialize..."
  sleep 3
  
  # Fetch the public URL from ngrok's local API
  NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o '[^"]*$' | grep 'https' | head -n1 || true)
  
  if [ -z "$NGROK_URL" ]; then
    log "ERROR: Failed to get ngrok URL"
    exit 1
  fi
  
  log "Ngrok is running at $NGROK_URL"
  export API_URL="$NGROK_URL"
  export NEXT_PUBLIC_API_URL="$NGROK_URL"
else
  export API_URL="http://localhost:8001"
  export NEXT_PUBLIC_API_URL="http://localhost:8001"
fi

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