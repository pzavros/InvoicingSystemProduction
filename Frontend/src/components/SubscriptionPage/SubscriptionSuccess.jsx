import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  ArrowForward,
} from '@mui/icons-material';
import { useSubscription } from '../../utils/SubscriptionContext';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshStatus } = useSubscription();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Refresh subscription status from backend
        await refreshStatus();
        
        setVerifying(false);
      } catch (err) {
        console.error('Error verifying subscription:', err);
        setError('There was an issue verifying your subscription. Please contact support.');
        setVerifying(false);
      }
    };

    // Always verify subscription when landing on this page
    // Either from Stripe redirect with session_id or direct navigation
    verifySubscription();
  }, [refreshStatus]);

  if (verifying) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: '#10b981', mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          Verifying your subscription...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we confirm your payment
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Error sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Verification Issue
          </Typography>
          <Alert severity="warning" sx={{ mt: 2, mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/subscription')}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              px: 4,
              py: 1.5,
            }}
          >
            Go to Subscription Page
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper 
        elevation={6}
        sx={{ 
          p: 5,
          textAlign: 'center',
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '2px solid rgba(16, 185, 129, 0.2)',
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          }}
        >
          <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
        </Box>

        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Welcome to Premium!
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
          Your subscription has been activated successfully
        </Typography>

        <Box sx={{ mb: 4, p: 3, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
            🎉 You now have access to:
          </Typography>
          <Typography variant="body2" color="text.secondary" align="left" sx={{ ml: 3 }}>
            ✅ Unlimited invoices per month<br/>
            ✅ Unlimited products & categories<br/>
            ✅ Unlimited clients<br/>
            ✅ Custom invoice templates<br/>
            ✅ Advanced reporting & analytics<br/>
            ✅ Priority support
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForward />}
          onClick={() => navigate('/dashboard')}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
            borderRadius: 2,
            px: 6,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 12px 24px rgba(16, 185, 129, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Go to Dashboard
        </Button>

        <Button
          variant="text"
          onClick={() => navigate('/subscription')}
          sx={{ mt: 2, color: '#6b7280' }}
        >
          View Subscription Details
        </Button>
      </Paper>
    </Container>
  );
};

export default SubscriptionSuccess;
