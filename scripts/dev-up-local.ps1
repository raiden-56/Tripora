<#
.SYNOPSIS
    One-command local dev environment with NO Docker at all: the API runs natively
    against SQLite (default DATABASE_URL) using the existing .venv - packages are
    only installed the first time this is run, not on every startup - and Redis is
    optional (rate limiting/caching just degrade to "disabled" without it). The
    frontend runs natively too, same as dev-up.ps1.

.USAGE
    powershell -ExecutionPolicy Bypass -File scripts\dev-up-local.ps1

    Stop the frontend with Ctrl+C - the API server started by this script is
    stopped automatically at the same time (unlike dev-up.ps1's Docker services,
    which keep running in the background).

    Use this instead of dev-up.ps1 when you don't want Docker running at all, or
    want faster restarts by reusing an already-installed .venv. Use dev-up.ps1
    when you want Postgres/Redis/Celery parity with the deployed stack.
#>

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

$venvPython = "$repoRoot\.venv\Scripts\python.exe"
$apiProcess = $null

function Stop-LocalApi {
    if ($null -ne $apiProcess -and -not $apiProcess.HasExited) {
        Write-Host ""
        Write-Host "Stopping the local API server (pid $($apiProcess.Id))..." -ForegroundColor Yellow
        Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    }
}

try {
    try {
        $existing = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 3
        if ($existing) {
            Write-Host "Something is already answering on http://localhost:8000 - if that's the" -ForegroundColor Red
            Write-Host "Docker stack from dev-up.ps1, stop it first with: docker compose down" -ForegroundColor Red
            exit 1
        }
    } catch {
        # Nothing answering on :8000 - good, proceed.
    }

    Write-Host "==> Setting up the Python virtual environment..." -ForegroundColor Cyan
    if (-not (Test-Path ".venv")) {
        Write-Host "    Creating .venv (first run only)..."
        python -m venv .venv
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Could not create .venv. Is Python installed and on PATH?" -ForegroundColor Red
            exit 1
        }
    }

    & $venvPython -c "import fastapi" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    Dependencies already installed - skipping pip install." -ForegroundColor Green
    } else {
        Write-Host "    Installing backend dependencies (first run only)..." -ForegroundColor Cyan
        & $venvPython -m pip install -e ".[dev]"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "pip install failed. See the output above." -ForegroundColor Red
            exit 1
        }
    }

    if (-not (Test-Path ".env")) {
        Write-Host "==> Creating .env from .env.example..." -ForegroundColor Cyan
        Copy-Item ".env.example" ".env"
    }

    Write-Host "==> Running database migrations..." -ForegroundColor Cyan
    & $venvPython -m alembic upgrade head
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Migrations failed. See the output above." -ForegroundColor Red
        exit 1
    }

    Write-Host "==> Seeding demo data (safe to re-run - skips if already seeded)..." -ForegroundColor Cyan
    & $venvPython -m scripts.seed
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Seeding failed. See the output above." -ForegroundColor Red
        exit 1
    }

    Write-Host "==> Starting the API server (uvicorn --reload)..." -ForegroundColor Cyan
    $apiProcess = Start-Process -FilePath $venvPython `
        -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000" `
        -NoNewWindow -PassThru -WorkingDirectory $repoRoot

    Write-Host "==> Waiting for the API to become healthy..." -ForegroundColor Cyan
    $healthy = $false
    for ($i = 0; $i -lt 30; $i++) {
        if ($apiProcess.HasExited) {
            Write-Host "The API server exited unexpectedly. Check the output above for the error." -ForegroundColor Red
            exit 1
        }
        try {
            $resp = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 3
            if ($resp) { $healthy = $true; break }
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    if (-not $healthy) {
        Write-Host "API did not become healthy in time." -ForegroundColor Red
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
    Write-Host " Ctrl+C stops both the frontend and the local API server." -ForegroundColor Green
    Write-Host "==================================================================" -ForegroundColor Green
    Write-Host ""

    Push-Location web
    try {
        npm run dev
    } finally {
        Pop-Location
    }
} finally {
    Stop-LocalApi
    Pop-Location
}
