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
  const { subscriptionStatus, loading, error, refreshStatus } = useSubscription();
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
          Verifying subscription status...
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

  // If requiredAccess is false, always allow access (for subscription page itself)
  if (!requiredAccess) {
    return children;
  }

  // Check if user has active subscription or trial
  const hasAccess = subscriptionStatus?.isActive || subscriptionStatus?.isTrialActive;

  if (!hasAccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card elevation={6} sx={{ textAlign: 'center' }}>
          <CardContent sx={{ p: 4 }}>
            <Lock color="warning" sx={{ fontSize: 64, mb: 2 }} />
            
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Subscription Required
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {subscriptionStatus?.status === 'No Subscription' 
                ? 'You need an active subscription or free trial to access this feature.'
                : 'Your subscription has expired. Please renew to continue using this feature.'
              }
            </Typography>

            <Box sx={{ mb: 3 }}>
              {subscriptionStatus?.status === 'No Subscription' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <Star sx={{ verticalAlign: 'middle', mr: 1, fontSize: 'small' }} />
                    Start with a 7-day free trial to explore all features!
                  </Typography>
                </Alert>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/subscription')}
                sx={{
                  minWidth: 200,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  }
                }}
              >
                {subscriptionStatus?.status === 'No Subscription' ? 'Start Free Trial' : 'Renew Subscription'}
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ minWidth: 150 }}
              >
                Go to Dashboard
              </Button>
            </Box>

            {subscriptionStatus?.daysUntilExpiry !== undefined && subscriptionStatus.daysUntilExpiry > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {subscriptionStatus.isTrialActive 
                  ? `Trial expires in ${subscriptionStatus.daysUntilExpiry} day${subscriptionStatus.daysUntilExpiry !== 1 ? 's' : ''}`
                  : `Subscription expires in ${subscriptionStatus.daysUntilExpiry} day${subscriptionStatus.daysUntilExpiry !== 1 ? 's' : ''}`
                }
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>
    );
  }

  // User has valid subscription or trial, allow access
  return children;
};

export default SubscriptionGuard;
