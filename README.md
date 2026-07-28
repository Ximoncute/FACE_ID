# 📸 Face Recognition Attendance System (Hệ Thống Chấm Công Khuôn Mặt AI)

Hệ thống chấm công và nhận diện khuôn mặt thời gian thực sử dụng **FastAPI**, **DeepFace**, **FAISS Vector Search** và **React (Vite)**. Hệ thống trích xuất đặc trưng khuôn mặt đa mô hình (Facenet512, ArcFace, VGG-Face) và thực hiện tìm kiếm vector tốc độ cao bằng FAISS.

Repository: [https://github.com/Ximoncute/FACE_ID.git](https://github.com/Ximoncute/FACE_ID.git)

---

## ✨ Tính Năng Nổi Bật

- **Trích xuất đa đặc trưng (Multi-model Embeddings)**: Tự động tổng hợp và lưu trữ đặc trưng khuôn mặt từ 3 mô hình hàng đầu (**Facenet512**, **ArcFace**, **VGG-Face**).
- **Tìm kiếm Vector siêu tốc (FAISS)**: Tìm kiếm đồng dạng khuôn mặt bằng thuật toán **FAISS (Facebook AI Similarity Search)** với độ trễ tính bằng millisecond.
- **Chấm công thời gian thực**: Quét khuôn mặt trực tiếp từ Webcam, nhận diện thông tin nhân viên và tính điểm sai lệch ($L_2$ distance).
- **Giao diện hiện đại (Glassmorphism UI)**: Xây dựng trên nền **React 19** + **Vite**, hỗ trợ biểu đồ so sánh hiệu năng các mô hình (Chart.js).
- **Khởi chạy 1-Click (`run.bat`)**: Tự động mở Backend & Frontend chỉ với 1 cú click trên Windows.

---

## 🛠️ Công Nghệ Sử Dụng

### **Backend**
- **Framework**: Python 3.10+, FastAPI, Uvicorn
- **AI & Computer Vision**: DeepFace, OpenCV (`opencv-python`), TensorFlow / Keras
- **Vector Search Engine**: FAISS (`faiss-cpu`)
- **Database**: SQLite, SQLAlchemy, Pydantic v2

### **Frontend**
- **Framework**: React 19, Vite
- **Webcam Integration**: `react-webcam`
- **Visualization**: `chart.js`, `react-chartjs-2`
- **HTTP Client**: `axios`

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Windows - 1 Click)

Nếu bạn đang sử dụng hệ điều hành **Windows**, bạn chỉ cần:

1. Clone dự án về máy:
   ```bash
   git clone https.github.com/Ximoncute/FACE_ID.git
   cd FACE_ID
   ```
2. Click đúp chuột vào file **`run.bat`** (hoặc gõ `.\run.bat` trên Terminal).
3. Script sẽ tự động:
   - Kích hoạt môi trường ảo Python `venv` & khởi chạy Backend FastAPI tại `http://127.0.0.1:8000`.
   - Khởi chạy Frontend React tại `http://localhost:5173`.

---

## 📦 Hướng Dẫn Cài Đặt Chi Tiết (Thủ Công)

Nếu bạn muốn cài đặt và chạy từng phần thủ công (trên Windows, Linux hoặc macOS):

### 1. Cài đặt Backend (FastAPI)

```bash
# 1. Chuyển vào thư mục backend
cd backend

# 2. Tạo môi trường ảo (Virtual Environment)
python -m venv venv

# 3. Kích hoạt môi trường ảo
# Trên Windows (PowerShell / CMD):
.\venv\Scripts\activate
# Trên Linux / macOS:
source venv/bin/activate

# 4. Cài đặt các thư viện cần thiết
pip install -r requirements.txt

# 5. Khởi chạy Backend Server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> **Backend API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2. Cài đặt Frontend (React + Vite)

```bash
# 1. Mở terminal mới và chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các gói phụ thuộc (Dependencies)
npm install

# 3. Chạy môi trường phát triển (Dev Server)
npm run dev
```

> **Frontend Web App**: [http://localhost:5173](http://localhost:5173)

---

## 📡 Danh Sách API Endpoints (Backend)

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/register` | Đăng ký nhân viên mới & trích xuất vector khuôn mặt |
| `POST` | `/checkin` | Nhận diện khuôn mặt từ ảnh webcam & ghi log chấm công |
| `GET` | `/logs` | Lấy danh sách lịch sử chấm công mới nhất |
| `GET` | `/analytics/compare` | Chạy benchmark so sánh thời gian xử lý của các mô hình |

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
FACE_ID/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── ai_models.py      # Trích xuất đặc trưng khuôn mặt DeepFace
│   │   │   ├── vector_search.py  # Động cơ tìm kiếm FAISS Index
│   │   │   └── evaluator.py      # Đánh giá so sánh các mô hình AI
│   │   ├── database.py           # Kết nối CSDL SQLite
│   │   ├── models.py             # ORM Models (User, FaceEmbedding, AttendanceLog)
│   │   ├── schemas.py            # Pydantic Schemas
│   │   └── main.py               # Các API Endpoints FastAPI
│   └── requirements.txt          # Các thư viện Python cần thiết
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Register.jsx      # Giao diện Đăng ký nhân viên
│   │   │   ├── CheckIn.jsx       # Giao diện Chấm công thời gian thực
│   │   │   └── Analytics.jsx     # Giao diện Biểu đồ phân tích mô hình
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── run.bat                       # File script chạy nhanh trên Windows
├── .gitignore
└── README.md
```

---

## 💡 Lưu Ý Khi Sử Dụng

1. **Chuẩn hóa Vector**: Tất cả các đặc trưng khuôn mặt trích xuất bởi DeepFace đều được chuẩn hóa $L_2$ (`norm = 1.0`). Khoảng cách tìm kiếm trong FAISS là Euclidean Squared Distance ($[0.0 - 2.0]$).
2. **Webcam**: Đảm bảo trình duyệt đã cấp quyền truy cập vị trí / camera cho thiết bị.

---

## 📜 Giấy Phép (License)

Dự án phát triển phục vụ mục đích nghiên cứu và học tập.
Distributed under the MIT License.
