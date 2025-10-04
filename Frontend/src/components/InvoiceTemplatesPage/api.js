import axios from 'axios';

// Use empty string to rely on Vite proxy configuration in development
// In production, use the full API URL
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:5000')
  : ''; // Use Vite proxy in development

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

export default api;
