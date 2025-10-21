// components/DashboardPage/api.js
import axios from "axios";

// API Base URL Configuration
// Development: empty string uses Vite proxy (/api -> http://localhost:5088)
// Production: /api routed through Caddy reverse proxy to backend container
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

const dashboardApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests if available
dashboardApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
dashboardApi.interceptors.response.use(
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

/**
 * Fetch overall dashboard stats.
 */
export const getDashboardStats = async () => {
  try {
    const response = await dashboardApi.get("/api/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

/**
 * Fetch stats for a specific month/year.
 * @param {number} month 1–12
 * @param {number} year  YYYY
 */
export const getDashboardStatsForMonthYear = async (month, year) => {
  try {
    const response = await dashboardApi.get(`/api/dashboard/stats/monthly?month=${month}&year=${year}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly dashboard stats:", error);
    throw error;
  }
};

/**
 * Fetch annual earnings breakdown for a specific year.
 * @param {number} year YYYY
 */
export const getAnnualEarningsBreakdown = async (year) => {
  try {
    const response = await dashboardApi.get(`/api/dashboard/annual-earnings/${year}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching annual earnings:", error);
    throw error;
  }
};

/**
 * Fetch annual invoice count breakdown for a specific year.
 * @param {number} year YYYY
 */
export const getAnnualInvoiceCountBreakdown = async (year) => {
  try {
    const response = await dashboardApi.get(`/api/dashboard/annual-invoice-counts/${year}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching annual invoice counts:", error);
    throw error;
  }
};

export default dashboardApi;
