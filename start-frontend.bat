@echo off
title AuraLib 3D Library Frontend
echo ======================================================
echo    Starting AuraLib AI Smart Library (with Three.js)
echo ======================================================
echo.

cd /d "%~dp0"

if not exist ".env" (
    if exist ".env.example" (
        echo [.env missing] Copying .env.example to .env ...
        copy .env.example .env
    )
)

echo Starting Vite Dev Server...
echo Three.js 3D Library will be available at http://localhost:5173
echo.

start http://localhost:5173
call npm.cmd run dev

pause

