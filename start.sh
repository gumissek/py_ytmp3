#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  py_ytmp3 – Start script (macOS / Linux)
#  Usage: ./start.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# ── Helpers ─────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

error() { echo -e "${RED}Error:${NC} $1" >&2; }
info()  { echo -e "${GREEN}▶${NC} $1"; }
warn()  { echo -e "${YELLOW}Warning:${NC} $1"; }

# ── Pre-flight checks ────────────────────────────────────────

if ! command -v docker &>/dev/null; then
    error "Docker is not installed."
    echo  "  Install it from: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &>/dev/null 2>&1; then
    error "Docker daemon is not running."
    echo  "  • macOS / Windows: start Docker Desktop"
    echo  "  • Linux:           sudo systemctl start docker"
    exit 1
fi

if ! docker compose version &>/dev/null 2>&1; then
    error "Docker Compose plugin (v2) is not available."
    echo  "  Update Docker Desktop or run: sudo apt install docker-compose-plugin"
    exit 1
fi

# ── Go to project root (same directory as this script) ───────

cd "$(dirname "$0")"

# ── Start containers ─────────────────────────────────────────

info "Building and starting containers (first run may take a few minutes)..."
docker compose up --build &
COMPOSE_PID=$!

# ── Wait for frontend ─────────────────────────────────────────

info "Waiting for http://localhost:3000 ..."
MAX_WAIT=120
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    if curl -sf --max-time 2 http://localhost:3000 &>/dev/null; then
        break
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    warn "App did not respond within ${MAX_WAIT}s. Opening browser anyway..."
fi

# ── Open browser ──────────────────────────────────────────────

info "Opening http://localhost:3000 ..."
if command -v open &>/dev/null; then          # macOS
    open http://localhost:3000
elif command -v xdg-open &>/dev/null; then    # Linux with desktop
    xdg-open http://localhost:3000
else
    warn "Cannot open browser automatically. Navigate to: http://localhost:3000"
fi

echo ""
info "App is running. Press Ctrl+C once to stop all containers."
echo ""

# ── Keep running ──────────────────────────────────────────────
wait $COMPOSE_PID
