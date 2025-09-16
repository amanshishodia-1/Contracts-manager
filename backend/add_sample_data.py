#!/usr/bin/env python3
"""
Script to add sample contract data to the database for testing purposes.
"""
import os
import sys
from datetime import datetime, date
from sqlalchemy.orm import Session

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database_fallback import SessionLocal, Document, ContractStatus, RiskScore

def add_sample_contracts():
    """Add sample contract data to the database for all users."""
    db = SessionLocal()
    
    try:
        from app.database import User
        
        # Get all users
        users = db.query(User).all()
        if not users:
            print("No users found. Please create a user first.")
            return
        
        # Clear existing sample data
        db.query(Document).filter(Document.doc_id.in_(["c1", "c2"])).delete()
        db.commit()
        
        contracts_added = 0
        
        # Add sample contracts for each user
        for user in users:
            # Sample contract 1
            contract1 = Document(
                doc_id=f"c1_u{user.user_id}",
                filename="MSA 2025.pdf",
                contract_name="MSA 2025",
                parties="Microsoft & ABC Corp",
                uploaded_on=datetime.now(),
                expiry_date=datetime(2025, 12, 31),
                status=ContractStatus.ACTIVE,
                risk_score=RiskScore.MEDIUM,
                file_size=1024000,  # 1MB
                file_type="pdf",
                user_id=user.user_id
            )
            
            # Sample contract 2
            contract2 = Document(
                doc_id=f"c2_u{user.user_id}",
                filename="Network Services Agreement.pdf",
                contract_name="Network Services Agreement",
                parties="TelNet & ABC Corp",
                uploaded_on=datetime.now(),
                expiry_date=datetime(2025, 10, 10),
                status=ContractStatus.RENEWAL_DUE,
                risk_score=RiskScore.HIGH,
                file_size=856000,  # 856KB
                file_type="pdf",
                user_id=user.user_id
            )
            
            # Add to database
            db.add(contract1)
            db.add(contract2)
            contracts_added += 2
            
            print(f"Added contracts for user: {user.username} (ID: {user.user_id})")
        
        db.commit()
        print(f"\nSample contracts added successfully! Total: {contracts_added} contracts")
        
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_contracts()
