import axios from 'axios';

// API Base URL Configuration
// Development: empty string uses Vite proxy (/api -> http://localhost:5088)
// Production: /api routed through Caddy reverse proxy to backend container
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests if available
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
authApi.interceptors.response.use(
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

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await authApi.post("/api/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await authApi.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Verify email with OTP
export const verifyEmail = async (verificationData) => {
  try {
    const response = await authApi.post("/api/auth/verify-email", verificationData);
    return response.data;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
};

// Resend verification code
export const resendVerification = async (emailData) => {
  try {
    const response = await authApi.post("/api/auth/resend-verification", emailData);
    return response.data;
  } catch (error) {
    console.error("Error resending verification:", error);
    throw error;
  }
};

// Forgot password - send reset code
export const forgotPassword = async (emailData) => {
  try {
    const response = await authApi.post("/api/auth/forgot-password", emailData);
    return response.data;
  } catch (error) {
    console.error("Error sending reset code:", error);
    const message = error.response?.data?.message || error.message || 'Failed to send reset code';
    throw new Error(message);
  }
};

// Reset password with code
export const resetPassword = async (resetData) => {
  try {
    const response = await authApi.post("/api/auth/reset-password", resetData);
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    const message = error.response?.data?.message || error.message || 'Failed to reset password';
    throw new Error(message);
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await authApi.get("/api/auth/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    console.log('Sending user data to backend:', userData);
    const response = await authApi.put("/api/auth/profile", userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw error;
  }
};

// Get subscription status
export const getSubscriptionStatus = async () => {
  try {
    const response = await authApi.get("/api/auth/subscription-status");
    return response.data;
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    throw error;
  }
};

// Logout user (client-side)
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('hadSubscriptionAccess'); // Clear subscription access flag
  window.location.href = '/app/login';
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return !!token && !!user;
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Store auth data
export const storeAuthData = (authResponse) => {
  localStorage.setItem('authToken', authResponse.token);
  localStorage.setItem('user', JSON.stringify(authResponse.user));
};

export default authApi;
