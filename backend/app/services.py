import json
import uuid
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database_fallback import Document, Chunk, User, ContractStatus, RiskScore
from .schemas import MockLlamaResponse, MockChunk, QueryResult
import random
from datetime import datetime, timedelta

class MockLlamaCloudService:
    """Mock service to simulate LlamaCloud document parsing and embedding generation."""
    
    @staticmethod
    def generate_mock_embedding(text: str, dim: int = 384) -> List[float]:
        """Generate a mock embedding vector based on text content."""
        # Use text hash as seed for reproducible embeddings
        seed = hash(text) % (2**32)
        np.random.seed(seed)
        embedding = np.random.normal(0, 1, dim)
        # Normalize the embedding
        embedding = embedding / np.linalg.norm(embedding)
        return embedding.tolist()
    
    @staticmethod
    def parse_document(filename: str, file_content: bytes) -> MockLlamaResponse:
        """Mock document parsing that returns chunks with embeddings."""
        doc_id = str(uuid.uuid4())
        
        # Mock text extraction based on file type
        if filename.lower().endswith('.pdf'):
            mock_text = f"This is a mock PDF contract content for {filename}. "
        elif filename.lower().endswith('.docx'):
            mock_text = f"This is a mock DOCX contract content for {filename}. "
        else:
            mock_text = f"This is a mock TXT contract content for {filename}. "
        
        # Generate mock contract clauses
        mock_clauses = [
            "Termination clause: Either party may terminate this agreement with 90 days written notice.",
            "Liability limitation: Total liability shall not exceed the fees paid in the preceding 12 months.",
            "Confidentiality: Both parties agree to maintain confidentiality of proprietary information.",
            "Payment terms: Invoices are due within 30 days of receipt.",
            "Force majeure: Neither party shall be liable for delays due to circumstances beyond their control.",
            "Governing law: This agreement shall be governed by the laws of the jurisdiction specified herein.",
            "Intellectual property: Each party retains ownership of their respective intellectual property.",
            "Data protection: Personal data shall be processed in accordance with applicable privacy laws."
        ]
        
        chunks = []
        for i, clause in enumerate(mock_clauses[:6]):  # Limit to 6 chunks
            chunk_id = f"c{i+1}"
            embedding = MockLlamaCloudService.generate_mock_embedding(clause)
            
            chunk = MockChunk(
                chunk_id=chunk_id,
                text=clause,
                embedding=embedding,
                metadata={
                    "page": (i // 2) + 1,
                    "contract_name": filename,
                    "clause_type": "standard"
                }
            )
            chunks.append(chunk)
        
        return MockLlamaResponse(document_id=doc_id, chunks=chunks)

class DocumentService:
    """Service for document management operations."""
    
    @staticmethod
    def store_document_chunks(db: Session, user_id: int, doc_id: str, filename: str, 
                            contract_name: str, parties: List[str], expiry_date: Optional[datetime],
                            llama_response: MockLlamaResponse, file_size: int, file_type: str) -> Document:
        """Store document and its chunks in the database."""
        
        # Determine risk score based on mock analysis
        risk_score = random.choice([RiskScore.LOW, RiskScore.MEDIUM, RiskScore.HIGH])
        
        # Determine status based on expiry date
        status = ContractStatus.ACTIVE
        if expiry_date:
            days_until_expiry = (expiry_date - datetime.now()).days
            if days_until_expiry < 0:
                status = ContractStatus.EXPIRED
            elif days_until_expiry < 90:
                status = ContractStatus.RENEWAL_DUE
        
        # Create document record
        document = Document(
            doc_id=doc_id,
            user_id=user_id,
            filename=filename,
            contract_name=contract_name,
            parties=json.dumps(parties) if parties else None,
            expiry_date=expiry_date,
            status=status,
            risk_score=risk_score,
            file_size=file_size,
            file_type=file_type
        )
        db.add(document)
        
        # Store chunks
        for chunk_data in llama_response.chunks:
            chunk = Chunk(
                chunk_id=f"{doc_id}_{chunk_data.chunk_id}",
                doc_id=doc_id,
                user_id=user_id,
                text_chunk=chunk_data.text,
                embedding=json.dumps(chunk_data.embedding),  # Convert list to JSON string for SQLite
                chunk_metadata=json.dumps(chunk_data.metadata),
                page_number=chunk_data.metadata.get("page", 1),
                confidence_score=random.uniform(0.7, 0.95)
            )
            db.add(chunk)
        
        db.commit()
        db.refresh(document)
        return document

class QueryService:
    """Service for RAG-based querying."""
    
    @staticmethod
    def vector_search(db: Session, user_id: int, query_embedding: List[float], limit: int = 5) -> List[QueryResult]:
        """Perform vector similarity search using pgvector."""
        
        # Convert query embedding to string format for SQL
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        # SQL query for vector similarity search
        sql = text("""
            SELECT 
                c.chunk_id,
                c.text_chunk,
                c.page_number,
                c.chunk_metadata,
                d.contract_name,
                (c.embedding <-> :query_embedding::vector) as distance
            FROM chunks c
            JOIN documents d ON c.doc_id = d.doc_id
            WHERE c.user_id = :user_id
            ORDER BY c.embedding <-> :query_embedding::vector
            LIMIT :limit
        """)
        
        try:
            result = db.execute(sql, {
                "query_embedding": embedding_str,
                "user_id": user_id,
                "limit": limit
            })
            
            results = []
            for row in result:
                # Convert distance to relevance score (lower distance = higher relevance)
                relevance_score = max(0, 1 - row.distance)
                
                metadata = json.loads(row.chunk_metadata) if row.chunk_metadata else {}
                
                query_result = QueryResult(
                    chunk_id=row.chunk_id,
                    text_chunk=row.text_chunk,
                    relevance_score=relevance_score,
                    page_number=row.page_number,
                    contract_name=row.contract_name,
                    metadata=metadata
                )
                results.append(query_result)
            
            return results
            
        except Exception as e:
            # Fallback to simple text search if vector search fails
            print(f"Vector search failed: {e}")
            return QueryService._fallback_text_search(db, user_id, query_embedding, limit)
    
    @staticmethod
    def _fallback_text_search(db: Session, user_id: int, query_embedding: List[float], limit: int) -> List[QueryResult]:
        """Fallback text-based search when vector search is not available."""
        chunks = db.query(Chunk).filter(Chunk.user_id == user_id).limit(limit).all()
        
        results = []
        for chunk in chunks:
            # Mock relevance score
            relevance_score = random.uniform(0.3, 0.8)
            
            metadata = json.loads(chunk.chunk_metadata) if chunk.chunk_metadata else {}
            
            query_result = QueryResult(
                chunk_id=chunk.chunk_id,
                text_chunk=chunk.text_chunk,
                relevance_score=relevance_score,
                page_number=chunk.page_number,
                contract_name=chunk.document.contract_name,
                metadata=metadata
            )
            results.append(query_result)
        
        return results
    
    @staticmethod
    def generate_mock_answer(question: str, results: List[QueryResult]) -> str:
        """Generate a mock AI answer based on the question and retrieved results."""
        if not results:
            return "I couldn't find relevant information in your contracts to answer this question."
        
        # Mock AI responses based on common contract questions
        question_lower = question.lower()
        
        if "termination" in question_lower or "terminate" in question_lower:
            return "Based on your contracts, termination clauses typically require 90 days written notice from either party. Some contracts may have different notice periods, so please review the specific terms in each agreement."
        
        elif "liability" in question_lower or "liable" in question_lower:
            return "Your contracts generally include liability limitations that cap total liability to the fees paid in the preceding 12 months. This helps protect both parties from excessive damages."
        
        elif "payment" in question_lower or "invoice" in question_lower:
            return "Payment terms across your contracts typically require invoices to be paid within 30 days of receipt. Some agreements may have different payment schedules."
        
        elif "confidential" in question_lower or "nda" in question_lower:
            return "Your contracts include confidentiality provisions requiring both parties to maintain the confidentiality of proprietary information shared during the business relationship."
        
        else:
            return f"Based on the retrieved contract sections, I found {len(results)} relevant clauses. The most relevant information suggests standard commercial terms are in place. Please review the specific contract sections below for detailed information."
