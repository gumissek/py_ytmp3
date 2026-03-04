@echo off
:: ─────────────────────────────────────────────────────────────
::  py_ytmp3 – Start script (Windows Command Prompt)
::  Usage: Double-click start.bat  OR  run from cmd
:: ─────────────────────────────────────────────────────────────

title py_ytmp3

:: ── Pre-flight: Docker installed? ────────────────────────────

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Docker is not installed.
    echo  Install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

:: ── Pre-flight: Docker daemon running? ───────────────────────

docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Docker daemon is not running.
    echo  Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

:: ── Pre-flight: Docker Compose v2 plugin? ────────────────────

docker compose version >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Docker Compose plugin ^(v2^) is not available.
    echo  Please update Docker Desktop.
    echo.
    pause
    exit /b 1
)

:: ── Move to project root ──────────────────────────────────────

cd /d "%~dp0"

:: ── Open browser after a short delay (background) ────────────

echo.
echo  Building and starting containers...
echo  (first run may take a few minutes)
echo.
echo  The app will open automatically at http://localhost:3000
echo  Press Ctrl+C to stop all containers.
echo.

:: Launch a background CMD that waits 20 s then opens the browser
start /min "" cmd /c "timeout /t 20 /nobreak >nul & start http://localhost:3000"

:: ── Start containers (foreground – Ctrl+C stops everything) ──

docker compose up --build

:: If docker compose exits (e.g. Ctrl+C), pause so the window doesn't close instantly
echo.
echo  Containers stopped.
pause
