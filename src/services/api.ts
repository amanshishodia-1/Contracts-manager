import axios from 'axios';
import type { AuthResponse, User, Document, DocumentList, ContractDetail, QueryResponse } from '../types';
import { config } from '../config/environment';

const API_BASE_URL = config.apiUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (username: string, email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const documentsAPI = {
  upload: async (
    file: File,
    contractName: string,
    parties: string[] = [],
    expiryDate?: string
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contract_name', contractName);
    formData.append('parties', JSON.stringify(parties));
    if (expiryDate) {
      formData.append('expiry_date', expiryDate);
    }

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  list: async (
    page: number = 1,
    perPage: number = 10,
    search?: string,
    status?: string,
    risk?: string
  ): Promise<DocumentList> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (risk) params.append('risk', risk);

    const response = await api.get(`/documents?${params}`);
    return response.data;
  },

  getDetail: async (docId: string): Promise<ContractDetail> => {
    const response = await api.get(`/documents/${docId}`);
    return response.data;
  },
};

export const queryAPI = {
  search: async (question: string, limit: number = 5): Promise<QueryResponse> => {
    const response = await api.post('/query', { question, limit });
    return response.data;
  },
};

export default api;
