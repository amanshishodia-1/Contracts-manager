// Environment configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  environment: import.meta.env.MODE || 'development',
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
};

// API endpoints
export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    me: '/auth/me',
  },
  documents: {
    upload: '/documents/upload',
    list: '/documents',
    detail: (id: string) => `/documents/${id}`,
  },
  query: '/query',
  health: '/health',
};

export default config;
