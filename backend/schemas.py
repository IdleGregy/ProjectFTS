# backend/schemas.py
from pydantic import BaseModel
from typing import Optional

# ===== Captcha =====
class CaptchaResponse(BaseModel):
    id: str
    word: str

# ===== User Schemas =====
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user"

class User(UserBase):
    id: int
    role: str

    class Config:  # ✅ mas standard kaysa model_config
        from_attributes = True

# ===== Login =====
class LoginRequest(BaseModel):
    username: str
    password: str
    captcha: str
    captcha_id: Optional[str] = None
    remember: Optional[bool] = False
