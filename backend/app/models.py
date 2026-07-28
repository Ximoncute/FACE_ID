from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.now)

    embeddings = relationship("FaceEmbedding", back_populates="user")
    logs = relationship("AttendanceLog", back_populates="user")

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    model_name = Column(String) # e.g. 'Facenet', 'ArcFace'
    embedding_vector = Column(Text) # Stored as JSON string
    
    user = relationship("User", back_populates="embeddings")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.datetime.now)
    confidence_score = Column(Float)
    model_used = Column(String)
    
    user = relationship("User", back_populates="logs")
