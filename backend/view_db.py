import sqlite3
import os
import sys

# Change output encoding for Windows terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

db_path = os.path.join(os.path.dirname(__file__), 'attendance.db')

if not os.path.exists(db_path):
    print(f"[!] Chua tim thay file CSDL tai: {db_path}")
    sys.exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("==================================================")
print("       CO SO DU LIEU: attendance.db")
print("==================================================")

# 1. Bang Users
print("\n--- 1. BANG DANH SACH NHAN VIEN (users) ---")
users = cursor.execute("SELECT id, name, created_at FROM users").fetchall()
if users:
    for u in users:
        print(f"ID: #{u[0]} | Ten: {u[1]} | Ngay tao: {u[2]}")
else:
    print("(Chua co nhan vien nao duoc dang ky)")

# 2. Bang Face Embeddings
print("\n--- 2. BANG VECTOR DAC TRUNG KHUON MAT (face_embeddings) ---")
embeddings = cursor.execute("SELECT id, user_id, model_name, created_at FROM face_embeddings").fetchall()
if embeddings:
    for e in embeddings:
        print(f"ID: #{e[0]} | User ID: #{e[1]} | Model: {e[2]} | Ngay tao: {e[3]}")
else:
    print("(Chua co vector dac trung nao)")

# 3. Bang Attendance Logs
print("\n--- 3. BANG LICH SU CHAM CONG (attendance_logs) ---")
logs = cursor.execute("SELECT id, user_id, timestamp, confidence_score, model_used FROM attendance_logs ORDER BY timestamp DESC LIMIT 20").fetchall()
if logs:
    for l in logs:
        print(f"Log #{l[0]} | User #{l[1]} | Thoi gian: {l[2]} | Score L2: {l[3]:.4f} | Model: {l[4]}")
else:
    print("(Chua co lich su cham cong nào)")

print("\n==================================================")
conn.close()
