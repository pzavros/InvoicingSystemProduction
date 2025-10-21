// API Configuration utility
// Development: empty string uses Vite proxy (/api -> http://localhost:5088)
// Production: /api routed through Caddy reverse proxy to backend container
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  ADMIN_ENDPOINT: import.meta.env.VITE_ADMIN_API_ENDPOINT || '/api',
  REGULAR_ENDPOINT: import.meta.env.VITE_REGULAR_API_ENDPOINT || '/api',
};

// API utility functions
export const apiCall = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('adminToken');
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    headers: defaultHeaders,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Specific API endpoints
export const API_ENDPOINTS = {
  // Admin Auth - Uses the same auth endpoint as regular users
  ADMIN_LOGIN: '/api/auth/login',
  
  // Waitlist
  WAITLIST: '/api/waitlist',
  WAITLIST_EXPORT: '/api/waitlist/export',
  
  // Contact Messages
  CONTACT_MESSAGES: '/api/contact',
  CONTACT_EXPORT: '/api/contact/export',
  
  // Admin Users
  ADMIN_USERS: '/api/admin/users',
  UPDATE_ADMIN_STATUS: (userId) => `/api/admin/users/${userId}/admin-status`,
};

export default API_CONFIG;
