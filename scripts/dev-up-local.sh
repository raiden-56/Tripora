#!/usr/bin/env bash
#
# One-command local dev environment with NO Docker at all: the API runs natively
# against SQLite (default DATABASE_URL) using the existing .venv — packages are
# only installed the first time this is run, not on every startup — and Redis is
# optional (rate limiting/caching just degrade to "disabled" without it). The
# frontend runs natively too, same as dev-up.sh.
#
# Usage:
#   ./scripts/dev-up-local.sh
#   bash scripts/dev-up-local.sh
#
# (Make it executable once with: chmod +x scripts/dev-up-local.sh)
#
# Stop the frontend with Ctrl+C — the API server started by this script is
# stopped automatically at the same time (unlike dev-up.sh's Docker services,
# which keep running in the background).
#
# Use this instead of dev-up.sh when you don't want Docker running at all, or
# want faster restarts by reusing an already-installed .venv. Use dev-up.sh
# when you want Postgres/Redis/Celery parity with the deployed stack.

set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

API_PID=""

cleanup() {
    echo ""
    if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
        echo -e "${YELLOW}Stopping the local API server (pid $API_PID)...${NC}"
        kill "$API_PID" 2>/dev/null || true
        wait "$API_PID" 2>/dev/null || true
    fi
    echo -e "${YELLOW}Dev environment stopped.${NC}"
}
trap cleanup EXIT

if curl -fsS "http://localhost:8000/health" >/dev/null 2>&1; then
    echo -e "${RED}Something is already answering on http://localhost:8000 — if that's the${NC}"
    echo -e "${RED}Docker stack from dev-up.sh, stop it first with: docker compose down${NC}"
    exit 1
fi

echo -e "${CYAN}==> Setting up the Python virtual environment...${NC}"
if [ ! -d ".venv" ]; then
    echo "    Creating .venv (first run only)..."
    python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

if python -c "import fastapi" >/dev/null 2>&1; then
    echo "    Dependencies already installed — skipping pip install."
else
    echo "    Installing backend dependencies (first run only)..."
    pip install -e ".[dev]"
fi

if [ ! -f ".env" ]; then
    echo -e "${CYAN}==> Creating .env from .env.example...${NC}"
    cp .env.example .env
fi

echo -e "${CYAN}==> Running database migrations...${NC}"
alembic upgrade head

echo -e "${CYAN}==> Seeding demo data (safe to re-run — skips if already seeded)...${NC}"
python -m scripts.seed

echo -e "${CYAN}==> Starting the API server (uvicorn --reload)...${NC}"
uvicorn app.main:app --reload --port 8000 &
API_PID=$!

echo -e "${CYAN}==> Waiting for the API to become healthy...${NC}"
healthy=false
for _ in $(seq 1 30); do
    if curl -fsS "http://localhost:8000/health" >/dev/null 2>&1; then
        healthy=true
        break
    fi
    if ! kill -0 "$API_PID" 2>/dev/null; then
        echo -e "${RED}The API server exited unexpectedly. Check the output above for the error.${NC}"
        exit 1
    fi
    sleep 1
done

if [ "$healthy" != true ]; then
    echo -e "${RED}API did not become healthy in time.${NC}"
    exit 1
fi
echo -e "${GREEN}    API is healthy.${NC}"

if [ ! -d "web/node_modules" ]; then
    echo -e "${CYAN}==> Installing frontend dependencies (first run)...${NC}"
    (cd web && npm install)
fi

echo ""
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN} Backend:    http://localhost:8000  (docs at /docs, health at /health)${NC}"
echo -e "${GREEN} Frontend:   http://localhost:5173  (starting now...)${NC}"
echo -e "${GREEN} Demo login: demo@traveldiaries.com / Travel@123${NC}"
echo -e "${GREEN} Ctrl+C stops both the frontend and the local API server.${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo ""

(cd web && npm run dev)
