// src/components/SystemSetupPage/api.js
import axios from "axios";

// API Base URL Configuration
// Development: empty string uses Vite proxy (/api -> http://localhost:5088)
// Production: /api routed through Caddy reverse proxy to backend container
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

const systemSetupApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests if available
systemSetupApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
systemSetupApi.interceptors.response.use(
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

// Get system setup data
export const getSystemSetup = async () => {
  try {
    const response = await systemSetupApi.get("/api/SystemSetup");
    return response.data;
  } catch (error) {
    console.error("Error fetching system setup:", error);
    throw error;
  }
};

// Update or insert system setup data
export const updateSystemSetup = async (setupData) => {
  try {
    // Remove the explicit headers config, Axios will default to application/json
    const response = await systemSetupApi.post("/api/SystemSetup", setupData);
    return response.data;
  } catch (error) {
    console.error("Error updating system setup:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export default systemSetupApi;
