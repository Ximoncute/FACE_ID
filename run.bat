@echo off
title Start Project TTNT - Face Recognition
echo ==================================================
echo       Khoi chay Du an Face Recognition (AI)
echo ==================================================
echo.

set "ROOT_DIR=%~dp0"

:: 1. Kiem tra va cai dat Backend Python & Dependencies
if not exist "%ROOT_DIR%backend\venv" (
    echo [!] Chua tim thay moi truong venv. Dang tao backend\venv...
    python -m venv "%ROOT_DIR%backend\venv"
    echo [!] Dang cai dat pip va thu vien Python (requirements.txt)...
    call "%ROOT_DIR%backend\venv\Scripts\activate"
    python -m pip install --upgrade pip
    python -m pip install "numpy<2"
    python -m pip install -r "%ROOT_DIR%backend\requirements.txt"
) else (
    echo [OK] Mien truong backend\venv da san sang.
)

:: 2. Kiem tra va cai dat Frontend npm dependencies
if not exist "%ROOT_DIR%frontend\node_modules" (
    echo [!] Chua tim thay node_modules. Dang chay npm install cho Frontend...
    cd /d "%ROOT_DIR%frontend"
    call npm install
    cd /d "%ROOT_DIR%"
) else (
    echo [OK] Thu muc frontend\node_modules da san sang.
)

echo.
echo [1/2] Dang khoi chay Backend (FastAPI)...
start "Backend FastAPI" cmd /k "cd /d "%~dp0backend" && call .\venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Dang khoi chay Frontend (React Vite)...
start "Frontend React" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==================================================
echo Da khoi chay ca Backend va Frontend thanh cong!
echo - Backend API : http://127.0.0.1:8000
echo - Swagger Docs: http://127.0.0.1:8000/docs
echo - Frontend Web: http://localhost:5173
echo ==================================================
echo.
pause
