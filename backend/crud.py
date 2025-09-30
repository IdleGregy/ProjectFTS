# backend/crud.py
from sqlalchemy.orm import Session
from backend import models, schemas

# ===========================
# USER CRUD
# ===========================

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        username=user.username,
        hashed_password=user.password,  # 🔑 dapat hashed na bago ipasa (from server.py)
        role=user.role if user.role else "user"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: dict):
    """Update user fields dynamically (username, role, password, etc.)."""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    for key, value in user_update.items():
        if hasattr(db_user, key) and value is not None:
            setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    """Delete user by ID."""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    db.delete(db_user)
    db.commit()
    return db_user
