# backend/server.py
import uvicorn
import time, uuid, random, string, jwt, os
from typing import Optional

from fastapi import FastAPI, HTTPException, Response, Cookie, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Absolute imports
from backend import crud, models, schemas
from backend.database import SessionLocal, engine

# ===== Settings =====
SECRET_KEY = "change_this_secret_in_production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE = 60 * 60 * 24  # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# ===== CORS setup =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Dependencies =====
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== In-memory captcha storage =====
CAPTCHAS = {}

# ===== Helpers =====
def validate_captcha(cid: Optional[str], input_word: str):
    if not cid:
        return False
    item = CAPTCHAS.get(cid)
    if not item:
        return False
    stored_word, expiry = item
    if time.time() > expiry:
        CAPTCHAS.pop(cid, None)
        return False
    if input_word.strip().upper() == "ADMIN":  # bypass
        return True
    return input_word.strip().upper() == stored_word.strip().upper()

def decode_token(access_token: str):
    return jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])

# ===== Serve Frontend (HTML, CSS, JS) =====
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODULES_DIR = os.path.join(BASE_DIR, "modules")

# Mount the entire modules folder at /modules
app.mount("/modules", StaticFiles(directory=MODULES_DIR), name="modules")

# Default route → login page
@app.get("/")
async def root():
    return FileResponse(os.path.join(MODULES_DIR, "login", "login.html"))

# ===== Secure dashboard route =====
@app.get("/dashboard")
def get_dashboard(access_token: Optional[str] = Cookie(default=None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        decode_token(access_token)
        return FileResponse(os.path.join(MODULES_DIR, "dashboard", "dashboard.html"))
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===== API Routes =====
@app.get("/api/captcha", response_model=schemas.CaptchaResponse)
def get_captcha():
    word = "".join(random.choices(string.ascii_uppercase + string.digits, k=random.choice([4, 5, 6])))
    cid = str(uuid.uuid4())
    CAPTCHAS[cid] = (word, time.time() + 300)  # 5 minutes
    return {"id": cid, "word": word}

@app.post("/api/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    user.password = pwd_context.hash(user.password)
    return crud.create_user(db=db, user=user)

@app.post("/api/login")
def login(req: schemas.LoginRequest, response: Response, db: Session = Depends(get_db)):
    if not validate_captcha(req.captcha_id, req.captcha):
        raise HTTPException(status_code=400, detail="Captcha invalid or expired")

    user = crud.get_user_by_username(db, req.username)
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload = {
        "sub": req.username,
        "role": user.role,
        "iat": int(time.time()),
        "exp": int(time.time()) + (60 * 60 * 24 * 30 if req.remember else ACCESS_TOKEN_EXPIRE)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax"
    )
    return {"msg": "ok", "role": user.role}

@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"msg": "Logged out"}

# ===== Updated dashboard API =====
@app.get("/api/dashboard")
def dashboard_data(access_token: Optional[str] = Cookie(default=None)):
    """Returns username and role for dashboard JS"""
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(access_token)
        username = payload.get("sub")
        role = payload.get("role")
        return {"username": username, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ===== Run server =====
if __name__ == "__main__":
    uvicorn.run("backend.server:app", host="127.0.0.1", port=8000, reload=True)
