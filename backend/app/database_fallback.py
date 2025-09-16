"""
Fallback database configuration for development without Docker.
Uses SQLite with mock vector operations when PostgreSQL is not available.
"""
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import enum
import os
from dotenv import load_dotenv

load_dotenv()

# Use SQLite as fallback when PostgreSQL is not available
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./contract_db.sqlite")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class ContractStatus(enum.Enum):
    ACTIVE = "Active"
    RENEWAL_DUE = "Renewal Due"
    EXPIRED = "Expired"

class RiskScore(enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    documents = relationship("Document", back_populates="owner")
    chunks = relationship("Chunk", back_populates="owner")

class Document(Base):
    __tablename__ = "documents"
    
    doc_id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    filename = Column(String, nullable=False)
    contract_name = Column(String, nullable=False)
    parties = Column(Text)  # JSON string of parties involved
    uploaded_on = Column(DateTime(timezone=True), server_default=func.now())
    expiry_date = Column(DateTime(timezone=True))
    status = Column(Enum(ContractStatus), default=ContractStatus.ACTIVE)
    risk_score = Column(Enum(RiskScore), default=RiskScore.LOW)
    file_size = Column(Integer)
    file_type = Column(String)
    
    # Relationships
    owner = relationship("User", back_populates="documents")
    chunks = relationship("Chunk", back_populates="document")

class Chunk(Base):
    __tablename__ = "chunks"
    
    chunk_id = Column(String, primary_key=True, index=True)
    doc_id = Column(String, ForeignKey("documents.doc_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    text_chunk = Column(Text, nullable=False)
    embedding = Column(Text)  # Store as JSON string for SQLite compatibility
    chunk_metadata = Column(Text)  # JSON string for additional metadata
    page_number = Column(Integer)
    confidence_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    document = relationship("Document", back_populates="chunks")
    owner = relationship("User", back_populates="chunks")

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
