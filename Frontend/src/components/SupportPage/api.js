// src/components/SupportPage/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

const supportApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests
supportApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
supportApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/app/login';
    }
    return Promise.reject(error);
  }
);

// Get all tickets for current user
export const getMyTickets = async () => {
  try {
    const response = await supportApi.get('/api/supporttickets');
    return response.data;
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
};

// Get all tickets (admin only)
export const getAllTickets = async (status = null) => {
  try {
    const url = status ? `/api/supporttickets/admin?status=${status}` : '/api/supporttickets/admin';
    const response = await supportApi.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    throw error;
  }
};

// Get single ticket by ID
export const getTicket = async (id) => {
  try {
    const response = await supportApi.get(`/api/supporttickets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
};

// Create new ticket
export const createTicket = async (ticketData) => {
  try {
    const response = await supportApi.post('/api/supporttickets', ticketData);
    return response.data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
};

// Update ticket (admin only)
export const updateTicket = async (id, updateData) => {
  try {
    const response = await supportApi.put(`/api/supporttickets/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
};

// Delete ticket (admin only)
export const deleteTicket = async (id) => {
  try {
    const response = await supportApi.delete(`/api/supporttickets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
};

export default supportApi;
