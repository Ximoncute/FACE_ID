from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str

class UserResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    class Config:
        from_attributes = True
        orm_mode = True

class AttendanceLogResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    timestamp: datetime
    confidence_score: float
    model_used: str
    class Config:
        from_attributes = True
        orm_mode = True

class RecognitionResult(BaseModel):
    user_id: int
    name: str
    confidence: float
    model_used: str
    time_taken_ms: float
