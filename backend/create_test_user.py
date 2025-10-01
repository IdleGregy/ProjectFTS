# backend/create_test_user.py
from backend import crud, database
from backend.schemas import UserCreate

db = database.SessionLocal()

username = "testuser"
password = "123456"
role = "user"

existing_user = crud.get_user_by_username(db, username)
if existing_user:
    print(f"User '{username}' already exists.")
else:
    user_obj = UserCreate(username=username, password=password, role=role)
    user = crud.create_user(db, user_obj)
    print(f"Created user '{user.username}' with password '{password}'")

db.close()
