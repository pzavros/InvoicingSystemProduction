import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Stack,
} from '@mui/material';
import {
  Payment,
  Lock,
  CheckCircle,
  Star,
  CreditCard,
} from '@mui/icons-material';
import { subscriptionAPI } from './subscriptionAPI';

const MONTHLY_PRICE = parseFloat(import.meta.env.VITE_SUBSCRIPTION_MONTHLY_PRICE || '13.99');

const PaymentDialog = ({ open, onClose, amount, isTrial = false, onSuccess, onError }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleProceed = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Create checkout session for both trial and regular payment
      const successUrl = `${window.location.origin}/app/subscription?payment_success=true`;
      const cancelUrl = `${window.location.origin}/app/subscription`;
      
      const { data } = await subscriptionAPI.createCheckoutSession({
        successUrl,
        cancelUrl,
        isTrial, // Pass trial flag to backend
      });

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to start checkout. Please try again.';
      setError(errorMessage);
      onError(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: isTrial 
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0',
        m: 0,
        p: 3
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          {isTrial ? <Star sx={{ fontSize: 28 }} /> : <Payment sx={{ fontSize: 28 }} />}
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {isTrial ? 'Start Your 7-Day Free Trial' : 'Upgrade to Premium'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4, mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Payment Summary */}
        <Card 
          elevation={3}
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            background: isTrial 
              ? 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)'
              : 'linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 100%)',
            border: isTrial 
              ? '2px solid rgba(16, 185, 129, 0.3)'
              : '2px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
              Payment Summary
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {isTrial ? '7-Day Free Trial' : 'Monthly Subscription'}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                €{amount.toFixed(2)}
              </Typography>
            </Box>
            {isTrial && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                You'll enter your card details to verify your account. After 7 days, you'll be charged €{MONTHLY_PRICE.toFixed(2)}/month unless you cancel.
              </Typography>
            )}
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {isTrial ? 'Due Today' : 'Total Due Today'}
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: isTrial ? '#059669' : '#8b5cf6' 
                }}
              >
                €{amount.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {isTrial && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
            icon={<Star />}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              🎉 You won't be charged today! Enjoy 7 days of Premium access completely free.
            </Typography>
          </Alert>
        )}

        {/* Security Info */}
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            '& .MuiAlert-icon': {
              color: '#3b82f6'
            }
          }}
          icon={<Lock />}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Secure Checkout by Stripe
          </Typography>
          <Typography variant="body2">
            You'll be redirected to Stripe's secure checkout page to complete your payment. Your card details are never stored on our servers.
          </Typography>
        </Alert>

        {/* Features List */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: '#6d28d9', mb: 2 }}>
            What you'll get:
          </Typography>
          <Stack spacing={1.5}>
            {[
              '∞ Unlimited clients, categories & products',
              '📄 Unlimited invoices every month',
              '🎨 Custom invoice templates',
              '✨ Professional PDFs with no watermarks',
              '📊 Advanced dashboard analytics',
              '⚡ Priority email support'
            ].map((feature, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  background: 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                  }
                }}
              >
                <CheckCircle sx={{ color: '#059669', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                  {feature}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          By continuing, you agree to our terms of service. Cancel anytime from your account settings.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <Button 
          onClick={onClose} 
          disabled={processing}
          variant="outlined"
          size="large"
          sx={{ 
            textTransform: 'none', 
            borderRadius: 2,
            fontWeight: 600,
            px: 3,
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleProceed}
          variant="contained"
          disabled={processing}
          startIcon={processing ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <CreditCard />}
          size="large"
          sx={{ 
            minWidth: 200,
            background: isTrial
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            '&:hover': {
              background: isTrial
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
              boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
            },
            transition: 'all 0.2s ease'
          }}
        >
          {processing 
            ? 'Redirecting to Stripe...' 
            : isTrial 
              ? 'Start Free Trial' 
              : `Pay €${amount.toFixed(2)}`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;