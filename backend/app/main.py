from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime, timedelta

from .database_fallback import get_db, User, Document, Chunk, Base, engine, ContractStatus, RiskScore
from .auth import (
    authenticate_user, create_access_token, get_current_user, 
    get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
)
from .schemas import (
    UserCreate, UserLogin, UserResponse, Token, DocumentResponse, 
    DocumentList, QueryRequest, QueryResponse, ContractDetail,
    ContractInsight, ContractClause
)
from .services import MockLlamaCloudService, DocumentService, QueryService
from .llamacloud import llamacloud_service

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Contract Management API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "https://contracts-manager-13.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Authentication endpoints
@app.post("/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token."""
    authenticated_user = authenticate_user(db, user.username, user.password)
    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(authenticated_user.user_id)}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

# Document endpoints
@app.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    contract_name: str = Form(...),
    parties: str = Form("[]"),
    expiry_date: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and process a contract document."""
    
    try:
        # Validate file type
        allowed_types = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="File type not supported")
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Parse parties JSON
        try:
            parties_list = json.loads(parties)
        except json.JSONDecodeError:
            parties_list = []
        
        # Parse expiry date
        expiry_datetime = None
        if expiry_date:
            try:
                expiry_datetime = datetime.fromisoformat(expiry_date.replace('Z', '+00:00'))
            except ValueError:
                pass
        
        # Process document with LlamaCloud (falls back to mock if API key not configured)
        llama_response = llamacloud_service.parse_document(file.filename, file_content)
        
        # Store document and chunks
        document = DocumentService.store_document_chunks(
            db=db,
            user_id=current_user.user_id,
            doc_id=llama_response.document_id,
            filename=file.filename,
            contract_name=contract_name,
            parties=parties_list,
            expiry_date=expiry_datetime,
            llama_response=llama_response,
            file_size=file_size,
            file_type=file.content_type
        )
        
        return document
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/documents", response_model=DocumentList)
def list_documents(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    risk: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's documents with pagination and filters."""
    
    query = db.query(Document).filter(Document.user_id == current_user.user_id)
    
    # Apply filters
    if search:
        query = query.filter(
            (Document.contract_name.ilike(f"%{search}%")) |
            (Document.parties.ilike(f"%{search}%"))
        )
    
    if status:
        query = query.filter(Document.status == status)
    
    if risk:
        query = query.filter(Document.risk_score == risk)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    documents = query.offset(offset).limit(per_page).all()
    
    return DocumentList(
        documents=documents,
        total=total,
        page=page,
        per_page=per_page
    )

@app.get("/documents/{doc_id}", response_model=ContractDetail)
def get_document_detail(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific document."""
    
    document = db.query(Document).filter(
        Document.doc_id == doc_id,
        Document.user_id == current_user.user_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get chunks for this document
    chunks = db.query(Chunk).filter(Chunk.doc_id == doc_id).all()
    
    # Generate mock clauses from chunks
    clauses = []
    for chunk in chunks[:5]:  # Limit to 5 clauses
        clause = ContractClause(
            title=f"Clause {chunk.page_number or 1}",
            text=chunk.text_chunk,
            confidence=chunk.confidence_score,
            page_number=chunk.page_number or 1
        )
        clauses.append(clause)
    
    # Generate mock insights
    insights = [
        ContractInsight(
            type="risk",
            title="Termination Notice Period",
            description="The 90-day termination notice period is longer than industry standard (30-60 days).",
            severity="medium"
        ),
        ContractInsight(
            type="recommendation",
            title="Liability Cap Review",
            description="Consider reviewing the liability limitation clause to ensure adequate protection.",
            severity="low"
        )
    ]
    
    return ContractDetail(
        document=document,
        clauses=clauses,
        insights=insights,
        chunks_count=len(chunks)
    )

# Query endpoints
@app.post("/query", response_model=QueryResponse)
def query_contracts(
    query: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Query contracts using natural language."""
    
    # Generate embedding for the query
    query_embedding = llamacloud_service.generate_embedding(query.question)
    
    # Perform vector search
    results = QueryService.vector_search(
        db=db,
        user_id=current_user.user_id,
        query_embedding=query_embedding,
        limit=query.limit
    )
    
    # Generate mock AI answer
    answer = QueryService.generate_mock_answer(query.question, results)
    
    return QueryResponse(
        answer=answer,
        results=results,
        total_results=len(results)
    )

# Health check
@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
