<#
.SYNOPSIS
    One-command local dev environment: Postgres + Redis + API + Celery worker in
    Docker (migrations and seeding run automatically inside the API container),
    then the frontend dev server natively for fast hot-reload.

.USAGE
    powershell -ExecutionPolicy Bypass -File scripts\dev-up.ps1

    (If your machine's execution policy blocks local scripts, the -ExecutionPolicy
    Bypass flag above runs just this script without changing any system setting.)

    Stop the frontend with Ctrl+C. The Docker services keep running in the
    background afterwards - stop them with: docker compose down
#>

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

try {
    Write-Host "==> Checking Docker..." -ForegroundColor Cyan
    docker info *>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker doesn't appear to be running. Start Docker Desktop and try again." -ForegroundColor Red
        exit 1
    }

    Write-Host "==> Starting Postgres, Redis, API, and worker (docker compose)..." -ForegroundColor Cyan
    docker compose --env-file .env.development up -d --build postgres redis api worker
    if ($LASTEXITCODE -ne 0) {
        Write-Host "docker compose failed to start the backend services. Run 'docker compose logs' to investigate." -ForegroundColor Red
        exit 1
    }

    Write-Host "==> Waiting for the API to become healthy (it runs migrations + seeding on first boot)..." -ForegroundColor Cyan
    $healthy = $false
    for ($i = 0; $i -lt 60; $i++) {
        try {
            $resp = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 3
            if ($resp) { $healthy = $true; break }
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    if (-not $healthy) {
        Write-Host "API did not become healthy in time. Run 'docker compose logs api' to investigate." -ForegroundColor Red
        exit 1
    }
    Write-Host "    API is healthy." -ForegroundColor Green

    if (-not (Test-Path "web/node_modules")) {
        Write-Host "==> Installing frontend dependencies (first run)..." -ForegroundColor Cyan
        Push-Location web
        npm install
        Pop-Location
    }

    Write-Host ""
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host " Backend:    http://localhost:8000  (docs at /docs, health at /health)" -ForegroundColor Green
    Write-Host " Frontend:   http://localhost:5173  (starting now...)" -ForegroundColor Green
    Write-Host " Demo login: demo@traveldiaries.com / Travel@123" -ForegroundColor Green
    Write-Host " Stop the frontend with Ctrl+C. Stop the backend with: docker compose down" -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host ""

    Push-Location web
    try {
        npm run dev
    } finally {
        Pop-Location
        Write-Host ""
        Write-Host "Frontend dev server stopped. Backend containers are still running - stop them with: docker compose down" -ForegroundColor Yellow
    }
} finally {
    Pop-Location
}
