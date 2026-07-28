import sys
import os
os.environ["PYTHONIOENCODING"] = "utf-8"
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import cv2
import numpy as np
import base64
import json
import time
import datetime

from .database import engine, Base, get_db
from . import models, schemas
from .core.ai_models import face_recognizer
from .core.vector_search import vector_engines
from .core.evaluator import benchmark_models

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Face Recognition Attendance System")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def decode_image(base64_string):
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    img_data = base64.b64decode(base64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img

@app.on_event("startup")
def load_existing_embeddings():
    for name, vengine in vector_engines.items():
        vengine.reset()

    db_gen = get_db()
    db = next(db_gen)
    try:
        embeddings = db.query(models.FaceEmbedding).all()
        for emb in embeddings:
            vec = json.loads(emb.embedding_vector)
            if emb.model_name in vector_engines:
                vector_engines[emb.model_name].add_embedding(vec, emb.user_id)
        print(f"Loaded {len(embeddings)} embeddings into FAISS indices.")
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass

@app.post("/register", response_model=schemas.UserResponse)
def register_user(name: str = Form(...), image: str = Form(...), db: Session = Depends(get_db)):
    img = decode_image(image)
    if img is None:
        raise HTTPException(status_code=400, detail="Ảnh gửi lên không hợp lệ!")
        
    # Create user with local time
    new_user = models.User(name=name, created_at=datetime.datetime.now())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Extract embeddings for all models and save
    models_to_use = ["Facenet512", "ArcFace", "VGG-Face"]
    saved_count = 0
    for model in models_to_use:
        emb, _ = face_recognizer.extract_embedding(img, model_name=model)
        if emb:
            db_emb = models.FaceEmbedding(
                user_id=new_user.id,
                model_name=model,
                embedding_vector=json.dumps(emb)
            )
            db.add(db_emb)
            vector_engines[model].add_embedding(emb, new_user.id)
            saved_count += 1
            
    if saved_count == 0:
        db.delete(new_user)
        db.commit()
        raise HTTPException(status_code=400, detail="Không tìm thấy khuôn mặt trong ảnh. Vui lòng chụp rõ mặt hơn!")
        
    db.commit()
    return new_user

@app.post("/checkin", response_model=schemas.RecognitionResult)
def checkin(image: str = Form(...), model_name: str = Form("Facenet512"), db: Session = Depends(get_db)):
    start_time = time.time()
    img = decode_image(image)
    if img is None:
        raise HTTPException(status_code=400, detail="Dữ liệu ảnh không hợp lệ!")
        
    engine_obj = vector_engines.get(model_name)
    if not engine_obj:
        raise HTTPException(status_code=400, detail=f"Không tìm thấy engine cho model {model_name}")

    if engine_obj.current_count == 0:
        raise HTTPException(status_code=400, detail="Chưa có dữ liệu khuôn mặt nào trong hệ thống. Vui lòng đăng ký nhân viên trước!")

    emb, extract_time = face_recognizer.extract_embedding(img, model_name=model_name)
    if not emb:
        raise HTTPException(status_code=400, detail="Không tìm thấy khuôn mặt trong khung hình!")

    user_id, distance = engine_obj.search(emb)
    
    # Normalized L2 Distance thresholds:
    # Facenet512: ~ 1.15
    # ArcFace: ~ 1.20
    # VGG-Face: ~ 1.25
    threshold_map = {
        "Facenet512": 1.15,
        "ArcFace": 1.20,
        "VGG-Face": 1.25
    }
    threshold = threshold_map.get(model_name, 1.15)
    
    if user_id is None or distance is None or distance > threshold:
        dist_str = f"{distance:.2f}" if distance is not None else "N/A"
        raise HTTPException(status_code=404, detail=f"Không nhận diện được khuôn mặt (Sai lệch: {dist_str})")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng trong cơ sở dữ liệu")
        
    log = models.AttendanceLog(
        user_id=user.id,
        timestamp=datetime.datetime.now(),
        confidence_score=float(distance),
        model_used=model_name
    )
    db.add(log)
    db.commit()
    
    total_time = (time.time() - start_time) * 1000
    
    return schemas.RecognitionResult(
        user_id=user.id,
        name=user.name,
        confidence=float(distance),
        model_used=model_name,
        time_taken_ms=total_time
    )

@app.get("/analytics/compare")
def compare_models():
    results = benchmark_models()
    return {"data": results}

@app.get("/users", response_model=list[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).order_by(models.User.id.desc()).all()

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên trong cơ sở dữ liệu")

    user_name = user.name
    db.query(models.FaceEmbedding).filter(models.FaceEmbedding.user_id == user_id).delete()
    db.query(models.AttendanceLog).filter(models.AttendanceLog.user_id == user_id).delete()
    db.delete(user)
    db.commit()

    # Refresh FAISS vector search engines
    load_existing_embeddings()

    return {"message": f"Đã xóa thành công nhân viên #{user_id} - {user_name}"}

@app.get("/logs", response_model=list[schemas.AttendanceLogResponse])
def get_logs(db: Session = Depends(get_db)):
    logs = db.query(models.AttendanceLog).order_by(models.AttendanceLog.timestamp.desc()).limit(50).all()
    results = []
    for log in logs:
        user_name = log.user.name if log.user else f"User #{log.user_id}"
        results.append(schemas.AttendanceLogResponse(
            id=log.id,
            user_id=log.user_id,
            user_name=user_name,
            timestamp=log.timestamp,
            confidence_score=log.confidence_score,
            model_used=log.model_used
        ))
    return results

