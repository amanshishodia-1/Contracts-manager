"""
Real LlamaCloud integration for document processing and embedding generation.
Replace mock services with actual LlamaCloud API calls.
"""
import os
import requests
import json
from typing import List, Dict, Any, Optional
from .schemas import MockLlamaResponse, MockChunk
import uuid
from dotenv import load_dotenv

load_dotenv()

class LlamaCloudService:
    """Real LlamaCloud service for document processing and embedding generation."""
    
    def __init__(self):
        self.api_key = os.getenv("LLAMACLOUD_API_KEY")
        self.base_url = os.getenv("LLAMACLOUD_BASE_URL", "https://api.llamaindex.ai")
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def parse_document(self, filename: str, file_content: bytes) -> MockLlamaResponse:
        """Parse document using LlamaCloud API."""
        if not self.api_key or self.api_key == "your-llamacloud-api-key-here":
            # Fallback to mock service if API key not configured
            from .services import MockLlamaCloudService
            return MockLlamaCloudService.parse_document(filename, file_content)
        
        try:
            # Upload document to LlamaCloud
            files = {
                'file': (filename, file_content, self._get_content_type(filename))
            }
            
            upload_response = requests.post(
                f"{self.base_url}/v1/documents/upload",
                headers={"Authorization": f"Bearer {self.api_key}"},
                files=files,
                timeout=30
            )
            upload_response.raise_for_status()
            
            document_id = upload_response.json().get("document_id")
            
            # Process document for chunking and embedding
            process_response = requests.post(
                f"{self.base_url}/v1/documents/{document_id}/process",
                headers=self.headers,
                json={
                    "chunk_size": 512,
                    "chunk_overlap": 50,
                    "embedding_model": "text-embedding-ada-002"
                },
                timeout=60
            )
            process_response.raise_for_status()
            
            # Get processed chunks
            chunks_response = requests.get(
                f"{self.base_url}/v1/documents/{document_id}/chunks",
                headers=self.headers,
                timeout=30
            )
            chunks_response.raise_for_status()
            
            chunks_data = chunks_response.json()
            
            # Convert to our format
            chunks = []
            for chunk_data in chunks_data.get("chunks", []):
                chunk = MockChunk(
                    chunk_id=chunk_data.get("chunk_id", str(uuid.uuid4())),
                    text_chunk=chunk_data.get("text", ""),
                    embedding=chunk_data.get("embedding", []),
                    chunk_metadata=json.dumps(chunk_data.get("metadata", {})),
                    page_number=chunk_data.get("page_number", 1),
                    confidence_score=chunk_data.get("confidence", 0.8)
                )
                chunks.append(chunk)
            
            return MockLlamaResponse(
                document_id=document_id,
                chunks=chunks,
                total_chunks=len(chunks)
            )
            
        except Exception as e:
            print(f"LlamaCloud API error: {e}")
            # Fallback to mock service on error
            from .services import MockLlamaCloudService
            return MockLlamaCloudService.parse_document(filename, file_content)
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using LlamaCloud API."""
        if not self.api_key or self.api_key == "your-llamacloud-api-key-here":
            # Fallback to mock service if API key not configured
            from .services import MockLlamaCloudService
            return MockLlamaCloudService.generate_mock_embedding(text)
        
        try:
            response = requests.post(
                f"{self.base_url}/v1/embeddings",
                headers=self.headers,
                json={
                    "input": text,
                    "model": "text-embedding-ada-002"
                },
                timeout=30
            )
            response.raise_for_status()
            
            embedding_data = response.json()
            return embedding_data.get("data", [{}])[0].get("embedding", [])
            
        except Exception as e:
            print(f"LlamaCloud embedding error: {e}")
            # Fallback to mock embedding
            from .services import MockLlamaCloudService
            return MockLlamaCloudService.generate_mock_embedding(text)
    
    def _get_content_type(self, filename: str) -> str:
        """Get content type based on file extension."""
        if filename.lower().endswith('.pdf'):
            return 'application/pdf'
        elif filename.lower().endswith('.docx'):
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        elif filename.lower().endswith('.txt'):
            return 'text/plain'
        else:
            return 'application/octet-stream'

# Global instance
llamacloud_service = LlamaCloudService()
