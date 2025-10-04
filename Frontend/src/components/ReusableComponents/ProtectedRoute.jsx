import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
