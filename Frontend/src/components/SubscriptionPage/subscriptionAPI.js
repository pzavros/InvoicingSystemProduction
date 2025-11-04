import axios from 'axios';

// API Base URL Configuration
// Development: empty string uses Vite proxy (/api -> http://localhost:5088)
// Production: /api routed through Caddy reverse proxy to backend container
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

// Create axios instance with authentication
const api = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const subscriptionAPI = {
  // Get subscription status
  getStatus: () => api.get('/api/subscription/status'),
  
  // Get user's subscription details
  getSubscription: () => api.get('/api/subscription'),
  
  // Start 7-day trial
  startTrial: () => api.post('/api/subscription/trial'),
  
  // Process payment
  processPayment: (paymentData) => api.post('/api/subscription/payment', paymentData),
  
  // Get payment history
  getPayments: () => api.get('/api/subscription/payments'),
  
  // Cancel subscription
  cancelSubscription: () => api.delete('/api/subscription'),
  
  // Extend subscription
  extendSubscription: (months = 1) => api.post(`/api/subscription/extend?months=${months}`),
  
  // Check access
  checkAccess: () => api.get('/api/subscription/check-access'),
  
  // ============= STRIPE ENDPOINTS =============
  
  // Create setup intent for trial (saves card without charging)
  createSetupIntent: () => api.post('/api/subscription/create-setup-intent'),
  
  // Create checkout session for paid subscription
  createCheckoutSession: (data) => api.post('/api/subscription/create-checkout-session', data),
  
  // Manually sync subscription from Stripe (for when webhooks aren't configured)
  syncSubscription: () => api.post('/api/subscription/sync-subscription'),
  
  // ============= FREEMIUM ENDPOINTS =============
  
  // Get user's subscription tier (free or premium)
  getTier: () => api.get('/api/subscription/tier'),
  
  // Get usage statistics and limits
  getUsage: () => api.get('/api/subscription/usage'),
  
  // Check if user can create a specific resource
  canCreateResource: (resource) => api.get(`/api/subscription/can-create/${resource}`),
};

export default subscriptionAPI;
