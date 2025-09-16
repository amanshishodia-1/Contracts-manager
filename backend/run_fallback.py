#!/usr/bin/env python3
"""
Fallback backend runner for development without Docker.
Uses SQLite database and mock vector operations.
"""
import uvicorn
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Override database import to use fallback
import app.database_fallback as database_fallback
sys.modules['app.database'] = database_fallback

if __name__ == "__main__":
    print("Starting Contract Management API (Fallback Mode)")
    print("Database: SQLite (fallback)")
    print("Vector Search: Mock implementation")
    print("API Documentation: http://localhost:8000/docs")
    print("-" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
