#!/usr/bin/env python3
"""
Production backend runner with PostgreSQL and real LlamaCloud integration.
"""
import uvicorn
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Use production database configuration
import app.production as production
sys.modules['app.database'] = production

if __name__ == "__main__":
    print("Starting Contract Management API (Production Mode)")
    print("Database: PostgreSQL with pgvector")
    print("Document Processing: LlamaCloud API")
    print("API Documentation: http://localhost:8000/docs")
    print("-" * 50)
    
    # Create tables
    production.create_tables()
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 10000)),
        reload=False,
        log_level="info"
    )
