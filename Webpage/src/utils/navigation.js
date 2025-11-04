/**
 * Navigation utility functions
 * Handles navigation to app routes, preventing double /app/app paths
 */

/**
 * Navigate to the app (main invoicing system)
 * @param {string} path - Path within the app (e.g., '/login', '/register', or '' for home)
 */
export const navigateToApp = (path = '') => {
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // In production, paths are absolute from domain root
  // In development, we might be on different ports
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    // In development, assume frontend is on port 5173
    const appUrl = `http://localhost:5173/${cleanPath}`;
    window.location.href = appUrl;
  } else {
    // In production, use /app prefix
    const appPath = cleanPath ? `/app/${cleanPath}` : '/app';
    window.location.href = appPath;
  }
};

/**
 * Get the app URL for a specific path
 * @param {string} path - Path within the app (e.g., 'login', 'register')
 * @returns {string} - Full URL to the app path
 */
export const getAppUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    return `http://localhost:5173/${cleanPath}`;
  } else {
    return cleanPath ? `/app/${cleanPath}` : '/app';
  }
};
