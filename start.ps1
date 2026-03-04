# ─────────────────────────────────────────────────────────────
#  py_ytmp3 – Start script (Windows PowerShell)
#  Usage: Right-click → "Run with PowerShell"
#         or from terminal: .\start.ps1
# ─────────────────────────────────────────────────────────────

# Allow running the script (only needed if execution policy blocks it)
# Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

$ErrorActionPreference = "Stop"

# ── Helpers ─────────────────────────────────────────────────

function Write-Info  { param($msg) Write-Host "▶ $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "Warning: $msg" -ForegroundColor Yellow }
function Write-Err   { param($msg) Write-Host "Error: $msg" -ForegroundColor Red }

# ── Pre-flight checks ────────────────────────────────────────

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Err "Docker is not installed."
    Write-Host "  Install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    Read-Host "Press Enter to exit"
    exit 1
}

docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker daemon is not running. Please start Docker Desktop."
    Read-Host "Press Enter to exit"
    exit 1
}

docker compose version 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Err "Docker Compose plugin (v2) is not available. Please update Docker Desktop."
    Read-Host "Press Enter to exit"
    exit 1
}

# ── Go to project root ───────────────────────────────────────

Set-Location $PSScriptRoot

# ── Start containers ─────────────────────────────────────────

Write-Info "Building and starting containers (first run may take a few minutes)..."

# Run docker compose in a background job so we can open the browser later
$job = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot
    docker compose up --build
}

# ── Wait for frontend ─────────────────────────────────────────

Write-Info "Waiting for http://localhost:3000 ..."
$maxWait = 120
$elapsed = 0
$ready   = $false

while ($elapsed -lt $maxWait) {
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:3000" `
                                 -TimeoutSec 2 `
                                 -UseBasicParsing `
                                 -ErrorAction Stop
        if ($res.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Start-Sleep -Seconds 2
    $elapsed += 2
}

if (-not $ready) {
    Write-Warn "App did not respond within ${maxWait}s. Opening browser anyway..."
}

# ── Open browser ──────────────────────────────────────────────

Write-Info "Opening http://localhost:3000 ..."
Start-Process "http://localhost:3000"

Write-Host ""
Write-Info "App is running. Close this window or press Ctrl+C to stop all containers."
Write-Host ""

# ── Forward output and wait ───────────────────────────────────

try {
    while ($true) {
        Receive-Job $job
        if ($job.State -in @("Completed","Failed","Stopped")) { break }
        Start-Sleep -Seconds 1
    }
} finally {
    # On Ctrl+C – bring everything down gracefully
    Write-Host ""
    Write-Info "Stopping containers..."
    Set-Location $PSScriptRoot
    docker compose down
    Remove-Job $job -Force -ErrorAction SilentlyContinue
}
