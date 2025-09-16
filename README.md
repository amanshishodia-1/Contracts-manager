# Contract Management SaaS Prototype

A full-stack contract management application built with React, FastAPI, PostgreSQL, and LlamaCloud integration for intelligent document processing and RAG-based querying.

## 🚀 Features

- **Modern UI/UX**: Professional React frontend with Tailwind CSS
- **JWT Authentication**: Secure user registration and login
- **Document Processing**: Upload and parse PDF, DOCX, and TXT contracts
- **AI-Powered Analysis**: Contract clause extraction and risk assessment
- **Natural Language Queries**: RAG-based contract search with embeddings
- **Vector Search**: PostgreSQL with pgvector for similarity search
- **Real-time Processing**: LlamaCloud integration for document chunking
- **AI Document Processing**: Mock LlamaCloud integration for document parsing and chunking
- **Vector Search**: PostgreSQL + pgvector for semantic search capabilities
- **Natural Language Queries**: RAG-powered contract querying interface
- **Business Dashboard**: Contract insights, risk analysis, and reporting
- **Real-time Updates**: Live contract status and expiry tracking

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **FastAPI** with Python
- **SQLAlchemy** ORM with PostgreSQL
- **pgvector** for vector embeddings
- **JWT** authentication
- **Pydantic** for data validation

### Database
- **PostgreSQL 15** with pgvector extension
- **Docker Compose** for local development

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker and Docker Compose

### 1. Clone and Setup

```bash
git clone <repository-url>
cd assignmnet2
```

### 2. Start Database

```bash
docker-compose up -d
```

### 3. Setup Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Setup Frontend

```bash
npm install --legacy-peer-deps
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Database Schema

The application uses three main tables:

### Users Table
```sql
users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  created_at TIMESTAMP
)
```

### Documents Table
```sql
documents (
  doc_id VARCHAR PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  filename VARCHAR,
  contract_name VARCHAR,
  parties TEXT,
  uploaded_on TIMESTAMP,
  expiry_date TIMESTAMP,
  status ENUM('Active', 'Renewal Due', 'Expired'),
  risk_score ENUM('Low', 'Medium', 'High'),
  file_size INTEGER,
  file_type VARCHAR
)
```

### Chunks Table
```sql
chunks (
  chunk_id VARCHAR PRIMARY KEY,
  doc_id VARCHAR REFERENCES documents(doc_id),
  user_id INTEGER REFERENCES users(user_id),
  text_chunk TEXT,
  embedding VECTOR(384),
  metadata TEXT,
  page_number INTEGER,
  confidence_score FLOAT,
  created_at TIMESTAMP
)
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Documents
- `POST /documents/upload` - Upload contract
- `GET /documents` - List user documents (with pagination/filters)
- `GET /documents/{doc_id}` - Get document details

### Query
- `POST /query` - Natural language contract search

## Usage Guide

### 1. Register/Login
Create an account or login with existing credentials.

### 2. Upload Contracts
- Click "Upload Contract" button
- Drag & drop or select PDF/TXT/DOCX files
- Add contract metadata (name, parties, expiry date)
- System automatically processes and chunks the document

### 3. Browse Contracts
- View all contracts in the dashboard table
- Filter by status (Active/Renewal Due/Expired)
- Filter by risk level (Low/Medium/High)
- Search by contract name or parties

### 4. Analyze Contracts
- Click on any contract to view details
- See extracted key clauses with confidence scores
- Review AI-generated insights and recommendations
- View document statistics

### 5. Query Contracts
- Use natural language to ask questions
- Examples:
  - "What are the termination clauses?"
  - "Show me liability limitations"
  - "Which contracts expire this month?"
- Get AI answers with supporting evidence

## Mock LlamaCloud Integration

The system simulates LlamaCloud document processing:

```json
{
  "document_id": "doc123",
  "chunks": [
    {
      "chunk_id": "c1",
      "text": "Termination clause: Either party may terminate with 90 days' notice.",
      "embedding": [0.12, -0.45, 0.91, 0.33],
      "metadata": { "page": 2, "contract_name": "MSA.pdf" }
    }
  ]
}
```

## Deployment

### Backend Deployment (Render/Heroku/Fly.io)
1. Set environment variables:
   - `DATABASE_URL`
   - `SECRET_KEY`
2. Deploy using platform-specific instructions

### Frontend Deployment (Netlify)
1. Build the project: `npm run build`
2. Deploy `dist` folder to Netlify
3. Set environment variable: `VITE_API_URL`

### Database (Supabase)
1. Create Supabase project
2. Enable pgvector extension
3. Update `DATABASE_URL` in backend

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests  
npm test
```

### Code Structure
```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── database.py      # Database models
│   │   ├── auth.py          # Authentication
│   │   ├── services.py      # Business logic
│   │   └── schemas.py       # Pydantic models
│   └── requirements.txt
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── contexts/           # React contexts
│   └── types/              # TypeScript types
└── docker-compose.yml      # Database setup
```

## Business User Evaluation

This prototype enables non-technical users to:

1. **Upload Flow**: Intuitive drag-and-drop interface with progress indicators
2. **Query Flow**: Natural language search with suggested questions
3. **Dashboard Clarity**: Clean table view with status indicators and filters
4. **Insights Readability**: AI-generated summaries with risk assessments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
