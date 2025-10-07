import axios from 'axios';

// Use environment variables for API configuration
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:5088')
  : ''; // Use Vite proxy in development

const clientApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests if available
clientApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
clientApi.interceptors.response.use(
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

// Get all clients
export const getAllClients = async () => {
  try {
    const response = await clientApi.get('/api/clients');
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

// Search clients
export const searchClients = async (searchTerm) => {
  try {
    const response = await clientApi.get(`/api/clients?search=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching clients:', error);
    throw error;
  }
};

// Get client by ID
export const getClientById = async (id) => {
  try {
    const response = await clientApi.get(`/api/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
};

// Get client by email
export const getClientByEmail = async (email) => {
  try {
    const response = await clientApi.get(`/api/clients/email/${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Client not found
    }
    console.error('Error fetching client by email:', error);
    throw error;
  }
};

// Create client
export const createClient = async (clientData) => {
  try {
    const response = await clientApi.post('/api/clients', clientData);
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};

// Update client
export const updateClient = async (id, clientData) => {
  try {
    const response = await clientApi.put(`/api/clients/${id}`, { ...clientData, id });
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
};

// Delete client
export const deleteClient = async (id) => {
  try {
    await clientApi.delete(`/api/clients/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};
