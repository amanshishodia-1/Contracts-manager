export interface User {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Document {
  id: string;
  doc_id: string;
  filename: string;
  contract_name: string;
  parties?: string;
  uploaded_on: string;
  created_at: string;
  expiry_date?: string;
  status: 'active' | 'pending' | 'expired';
  risk_level: 'low' | 'medium' | 'high';
  risk_score: 'Low' | 'Medium' | 'High';
  file_size?: number;
  file_type: string;
}

export interface DocumentList {
  documents: Document[];
  total: number;
  page: number;
  per_page: number;
}

export interface ContractClause {
  title: string;
  text: string;
  confidence: number;
  page_number: number;
}

export interface ContractInsight {
  type: 'risk' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ContractDetail {
  document: Document;
  clauses: ContractClause[];
  insights: ContractInsight[];
  chunks_count: number;
}

export interface QueryResult {
  chunk_id: string;
  text_chunk: string;
  relevance_score: number;
  page_number?: number;
  contract_name: string;
  metadata?: Record<string, any>;
}

export interface QueryResponse {
  answer: string;
  results: QueryResult[];
  total_results: number;
}
