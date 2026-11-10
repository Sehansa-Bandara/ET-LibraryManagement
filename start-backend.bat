@echo off
title AuraLib Backend (FastAPI)
echo ======================================================
echo    Starting AuraLib Backend API
echo ======================================================
echo.

cd /d "%~dp0backend"

if not exist ".env" (
    if exist ".env.example" (
        echo [.env missing] Copying .env.example to .env ...
        copy .env.example .env
    )
)

if not exist ".venv\Scripts\activate.bat" (
    echo Creating Python virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo Failed to create virtual environment with 'python'. Trying 'py'...
        py -m venv .venv
    )
    call .\.venv\Scripts\activate.bat
    echo Installing backend dependencies...
    pip install -r requirements.txt
) else (
    call .\.venv\Scripts\activate.bat
)

echo Starting FastAPI server at http://127.0.0.1:8000 ...
echo API Documentation will be at http://127.0.0.1:8000/docs
echo.

python -m uvicorn app.main:app --reload

pause

