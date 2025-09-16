from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ContractStatus(str, Enum):
    ACTIVE = "Active"
    RENEWAL_DUE = "Renewal Due"
    EXPIRED = "Expired"

class RiskScore(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

# User schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Document schemas
class DocumentUpload(BaseModel):
    contract_name: str
    parties: Optional[List[str]] = []
    expiry_date: Optional[datetime] = None

class DocumentResponse(BaseModel):
    doc_id: str
    filename: str
    contract_name: str
    parties: Optional[str]
    uploaded_on: datetime
    expiry_date: Optional[datetime]
    status: ContractStatus
    risk_score: RiskScore
    file_size: Optional[int]
    file_type: Optional[str]

    class Config:
        from_attributes = True

class DocumentList(BaseModel):
    documents: List[DocumentResponse]
    total: int
    page: int
    per_page: int

# Chunk schemas
class ChunkResponse(BaseModel):
    chunk_id: str
    text_chunk: str
    page_number: Optional[int]
    confidence_score: float
    metadata: Optional[str]

    class Config:
        from_attributes = True

# Query schemas
class QueryRequest(BaseModel):
    question: str
    limit: Optional[int] = 5

class QueryResult(BaseModel):
    chunk_id: str
    text_chunk: str
    relevance_score: float
    page_number: Optional[int]
    contract_name: str
    metadata: Optional[Dict[str, Any]]

class QueryResponse(BaseModel):
    answer: str
    results: List[QueryResult]
    total_results: int

# Mock LlamaCloud response schemas
class MockChunk(BaseModel):
    chunk_id: str
    text: str
    embedding: List[float]
    metadata: Dict[str, Any]

class MockLlamaResponse(BaseModel):
    document_id: str
    chunks: List[MockChunk]

# Dashboard schemas
class ContractInsight(BaseModel):
    type: str  # "risk" or "recommendation"
    title: str
    description: str
    severity: str  # "low", "medium", "high"

class ContractClause(BaseModel):
    title: str
    text: str
    confidence: float
    page_number: int

class ContractDetail(BaseModel):
    document: DocumentResponse
    clauses: List[ContractClause]
    insights: List[ContractInsight]
    chunks_count: int
