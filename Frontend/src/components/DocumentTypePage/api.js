import axios from 'axios';

// API Base URL Configuration
// Development: empty string uses Vite proxy (/api -> http://localhost:5088)
// Production: /api routed through Caddy reverse proxy to backend container
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/app/login';
    }
    return Promise.reject(error);
  }
);

// Get all document types
export const getAllDocumentTypes = async () => {
  try {
    const response = await api.get('/api/documenttypes');
    return response.data;
  } catch (error) {
    console.error('Error fetching document types:', error);
    throw error;
  }
};

// Get document type by ID
export const getDocumentTypeById = async (id) => {
  try {
    const response = await api.get(`/api/documenttypes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document type:', error);
    throw error;
  }
};

// Get document type by code
export const getDocumentTypeByCode = async (code) => {
  try {
    const response = await api.get(`/api/documenttypes/by-code/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document type:', error);
    throw error;
  }
};
