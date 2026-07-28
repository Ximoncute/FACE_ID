@echo off
title Start Project TTNT
echo ==========================================
echo       Khoi chay Du an Face Recognition
echo ==========================================
echo.

echo [1/2] Dang khoi chay Backend (FastAPI)...
start "Backend FastAPI" cmd /k "cd /d "%~dp0backend" && call .\venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Dang khoi chay Frontend (React Vite)...
start "Frontend React" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==========================================
echo Da mo ca 2 cua so Backend va Frontend!
echo - Backend URL : http://127.0.0.1:8000
echo - API Docs    : http://127.0.0.1:8000/docs
echo - Frontend URL: http://localhost:5173
echo ==========================================
echo.
pause
