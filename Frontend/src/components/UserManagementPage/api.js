// src/components/UserManagementPage/api.js
import axios from 'axios';

// Use environment variables for API configuration
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:5088')
  : ''; // Use Vite proxy in development

// Create axios instance
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
adminApi.interceptors.response.use(
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

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await adminApi.get('/api/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Update user admin status
export const updateUserAdminStatus = async (userId, isAdmin) => {
  try {
    const response = await adminApi.put(`/api/admin/users/${userId}/admin-status`, {
      isAdmin: isAdmin
    });
    return response.data;
  } catch (error) {
    console.error('Error updating admin status:', error);
    throw error;
  }
};

// Update user profile (for editing user details)
export const updateUser = async (userId, userData) => {
  try {
    const response = await adminApi.put(`/api/auth/profile`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
