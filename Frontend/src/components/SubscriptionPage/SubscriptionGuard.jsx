import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Box,
  Card,
  CardContent
} from '@mui/material';
import { Lock, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { useSubscription } from '../../utils/SubscriptionContext';

const SubscriptionGuard = ({ children, requiredAccess = true }) => {
  const { authenticated } = useAuth();
  const { loading, error, refreshStatus } = useSubscription();
  const navigate = useNavigate();

  // If user is not authenticated, redirect to login
  if (!authenticated) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refreshStatus}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // In freemium model, everyone has access!
  // Limits are enforced at the API level, not at the route level
  return children;
};

export default SubscriptionGuard;
