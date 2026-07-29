#!/usr/bin/env bash

# ==============================================================================
# Script khởi chạy tự động cả Backend (FastAPI) và Frontend (React Vite)
# Hỗ trợ hệ điều hành macOS và Linux
# ==============================================================================

echo "=========================================="
echo "       Khởi chạy Dự án Face Recognition"
echo "=========================================="
echo ""

# 1. Kiểm tra môi trường ảo Python của Backend
if [ ! -d "backend/venv" ]; then
    echo "[!] Chưa tìm thấy môi trường ảo backend/venv. Đang tự động khởi tạo..."
    python3 -m venv backend/venv
fi

echo "[!] Đang kiểm tra và đồng bộ các gói phụ thuộc Python (requirements.txt)..."
backend/venv/bin/pip install --upgrade pip --quiet
backend/venv/bin/pip uninstall -y opencv-python opencv-contrib-python opencv-contrib-python-headless >/dev/null 2>&1
backend/venv/bin/pip install -r backend/requirements.txt

# 2. Kiểm tra node_modules của Frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "[!] Chưa tìm thấy frontend/node_modules. Đang chạy npm install..."
    (cd frontend && npm install)
fi

echo "[1/2] Đang khởi chạy Backend (FastAPI)..."
(cd backend && source venv/bin/activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload) &
BACKEND_PID=$!

echo "[2/2] Đang khởi chạy Frontend (React Vite)..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo " Cả 2 dịch vụ đã được khởi chạy thành công!"
echo " - Backend API : http://127.0.0.1:8000"
echo " - Swagger Docs: http://127.0.0.1:8000/docs"
echo " - Frontend Web: http://localhost:5173"
echo "=========================================="
echo " Nhấn Ctrl+C để dừng cả Backend và Frontend."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM EXIT
wait
