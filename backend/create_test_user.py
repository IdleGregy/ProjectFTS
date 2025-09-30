# backend/create_test_user.py

from backend import crud, database
from backend.schemas import UserCreate
from passlib.context import CryptContext

# Password hashing context (same as server.py)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# DB session
db = database.SessionLocal()

# Test user data
username = "testuser"
password = "123456"
role = "user"

# Check if user already exists
existing_user = crud.get_user_by_username(db, username)
if existing_user:
    print(f"User '{username}' already exists.")
else:
    # Hash password
    hashed_password = pwd_context.hash(password)
    
    # Create user object
    user_obj = UserCreate(username=username, password=hashed_password, role=role)
    user = crud.create_user(db, user_obj)
    
    print(f"Created user '{user.username}' with password '{password}'")

db.close()
