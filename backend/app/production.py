"""
Production configuration for the FastAPI backend.
Handles PostgreSQL connection and production settings.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .database import Base, User, Document, Chunk
from dotenv import load_dotenv

load_dotenv()

# Production database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required for production")

# Create engine with production settings
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create database tables if they don't exist."""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
