import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, getCurrentUser } from '../components/AuthPages/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    const authStatus = isAuthenticated();
    const currentUser = getCurrentUser();
    
    setAuthenticated(authStatus);
    setUser(currentUser);
    setLoading(false);
  };

  useEffect(() => {
    // Initial check
    checkAuth();

    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for when auth state changes in the same tab
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authStateChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, []);

  const login = (authResponse) => {
    localStorage.setItem('authToken', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    
    setAuthenticated(true);
    setUser(authResponse.user);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChange'));
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthenticated(false);
    setUser(null);
    window.location.href = '/app/login';
  };

  const value = {
    authenticated,
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
