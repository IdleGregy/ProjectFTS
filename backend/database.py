# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from urllib.parse import quote_plus  # 🔑 para i-encode ang password

# Load environment variables mula sa .env
load_dotenv()

# DB credentials (may default fallback)
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD", "P@ssw0rd"))  # encode special chars
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_NAME = os.getenv("DB_NAME", "project")

# Connection string para sa MySQL
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# ⚡ Optimized SQLAlchemy engine settings
engine = create_engine(
    DATABASE_URL,
    echo=False,          # wag na mag-log ng lahat ng SQL queries (optional)
    pool_pre_ping=True,  # check connection bago gamitin
    pool_recycle=3600    # recycle connections every hour (to avoid MySQL timeout)
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class para sa models
Base = declarative_base()
