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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get all user templates (including system templates)
export const getAllTemplates = async () => {
  try {
    const response = await api.get('/api/invoicetemplates');
    return response.data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
};

// Get template by ID
export const getTemplateById = async (id) => {
  try {
    const response = await api.get(`/api/invoicetemplates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
};

// Get active template
export const getActiveTemplate = async () => {
  try {
    const response = await api.get('/api/invoicetemplates/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active template:', error);
    throw error;
  }
};

// Create new template
export const createTemplate = async (templateData) => {
  try {
    const response = await api.post('/api/invoicetemplates', templateData);
    return response.data;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

// Update template
export const updateTemplate = async (id, templateData) => {
  try {
    const response = await api.put(`/api/invoicetemplates/${id}`, templateData);
    return response.data;
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

// Delete template
export const deleteTemplate = async (id) => {
  try {
    const response = await api.delete(`/api/invoicetemplates/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
};

// Set template as active
export const setActiveTemplate = async (id) => {
  try {
    const response = await api.post(`/api/invoicetemplates/${id}/set-active`);
    return response.data;
  } catch (error) {
    console.error('Error setting active template:', error);
    throw error;
  }
};

// Get system templates
export const getSystemTemplates = async () => {
  try {
    const response = await api.get('/api/invoicetemplates/system');
    return response.data;
  } catch (error) {
    console.error('Error fetching system templates:', error);
    throw error;
  }
};

// Get all document types
export const getDocumentTypes = async () => {
  try {
    const response = await api.get('/api/documenttypes');
    return response.data;
  } catch (error) {
    console.error('Error fetching document types:', error);
    throw error;
  }
};

// Get templates by document type
export const getTemplatesByDocumentType = async (documentTypeId = null) => {
  try {
    const url = documentTypeId 
      ? `/api/invoicetemplates/by-document-type?documentTypeId=${documentTypeId}`
      : '/api/invoicetemplates/by-document-type';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching templates by document type:', error);
    throw error;
  }
};

// Get active template by document type
export const getActiveTemplateByDocumentType = async (documentTypeId = null) => {
  try {
    const url = documentTypeId 
      ? `/api/invoicetemplates/active/document-type?documentTypeId=${documentTypeId}`
      : '/api/invoicetemplates/active/document-type';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching active template by document type:', error);
    throw error;
  }
};

export default api;
