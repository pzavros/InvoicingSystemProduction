import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { Box, Typography, Paper, Container } from '@mui/material';
import { AdminPanelSettings, Block } from '@mui/icons-material';

const AdminRoute = ({ children }) => {
  const { authenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Block sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="error.main" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You need administrator privileges to access this page.
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}>
            <AdminPanelSettings color="disabled" />
            <Typography variant="body2" color="text.disabled">
              Admin access required
            </Typography>
          </Box>
        </Paper>
      </Container>
    );
  }

  return children;
};

export default AdminRoute;
