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
logs = cursor.execute("""
    SELECT l.id, l.user_id, u.name, l.timestamp, l.confidence_score, l.model_used 
    FROM attendance_logs l 
    LEFT JOIN users u ON l.user_id = u.id 
    ORDER BY l.timestamp DESC LIMIT 20
""").fetchall()
if logs:
    for idx, l in enumerate(logs, start=1):
        name_str = l[2] if l[2] else f"User #{l[1]}"
        print(f"STT: #{idx} | Ten: {name_str} | Thoi gian: {l[3]} | Score L2: {l[4]:.4f} | Model: {l[5]}")
else:
    print("(Chua co lich su cham cong nao)")

print("\n==================================================")
conn.close()
