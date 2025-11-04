import axios from 'axios';

// API Base URL Configuration
// Development: empty string uses Vite proxy (/api -> http://localhost:5088)
// Production: /api routed through Caddy reverse proxy to backend container
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

// Create axios instance with interceptors for authentication
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fetch all invoices
export const getAllInvoices = async () => {
  const response = await apiClient.get('/api/Invoices');
  return response.data;
};

// Delete a specific invoice by ID
export const deleteInvoice = async (invoiceId) => {
  const response = await apiClient.delete(`/api/Invoices/${invoiceId}`);
  return response.data;
};

// Fetch all available statuses
export const getAllStatuses = async () => {
  const response = await apiClient.get('/api/Invoices/statuses');
  return response.data;
};
