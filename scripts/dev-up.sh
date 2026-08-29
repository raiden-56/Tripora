#!/usr/bin/env bash
#
# One-command local dev environment: Postgres + Redis + API + Celery worker in
# Docker (migrations and seeding run automatically inside the API container),
# then the frontend dev server natively for fast hot-reload.
#
# Usage:
#   ./scripts/dev-up.sh
#   bash scripts/dev-up.sh
#
# (Make it executable once with: chmod +x scripts/dev-up.sh)
#
# Stop the frontend with Ctrl+C. The Docker services keep running in the
# background afterwards - stop them with: docker compose down

set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

on_exit() {
    echo ""
    echo -e "${YELLOW}Frontend dev server stopped. Backend containers are still running - stop them with: docker compose down${NC}"
}

echo -e "${CYAN}==> Checking Docker...${NC}"
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}Docker doesn't appear to be running. Start Docker Desktop and try again.${NC}"
    exit 1
fi

echo -e "${CYAN}==> Starting Postgres, Redis, API, and worker (docker compose)...${NC}"
if ! docker compose --env-file .env.development up -d --build postgres redis api worker; then
    echo -e "${RED}docker compose failed to start the backend services. Run 'docker compose logs' to investigate.${NC}"
    exit 1
fi

echo -e "${CYAN}==> Waiting for the API to become healthy (it runs migrations + seeding on first boot)...${NC}"
healthy=false
for _ in $(seq 1 60); do
    if curl -fsS "http://localhost:8000/health" >/dev/null 2>&1; then
        healthy=true
        break
    fi
    sleep 2
done

if [ "$healthy" != true ]; then
    echo -e "${RED}API did not become healthy in time. Run 'docker compose logs api' to investigate.${NC}"
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
echo -e "${GREEN} Stop the frontend with Ctrl+C. Stop the backend with: docker compose down${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo ""

trap on_exit EXIT
(cd web && npm run dev)
