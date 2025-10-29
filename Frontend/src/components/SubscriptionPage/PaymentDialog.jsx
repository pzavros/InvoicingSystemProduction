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
} from '@mui/material';
import {
  Payment,
  CreditCard,
  Lock,
} from '@mui/icons-material';
import { subscriptionAPI } from './subscriptionAPI';

const PaymentDialog = ({ open, onClose, amount, isTrial = false, onSuccess, onError }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      if (isTrial) {
        // For trial, call the trial endpoint with €0.00 authorization
        const paymentData = {
          amount: 0,
          currency: 'EUR',
          description: '7-day free trial - Card authorization',
        };
        
        // Process €0.00 payment to authorize card and start trial
        await subscriptionAPI.processPayment(paymentData);
      } else {
        // Regular payment processing
        const paymentData = {
          amount: amount,
          currency: 'EUR',
          description: `Monthly subscription payment - €${amount.toFixed(2)}`,
        };

        await subscriptionAPI.processPayment(paymentData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
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
          : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0',
        m: 0
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Payment />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {isTrial ? 'Start Your 7-Day Free Trial' : 'Complete Payment'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Card 
          elevation={3}
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            background: isTrial 
              ? 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: isTrial 
              ? '2px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
              Payment Summary
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">
                {isTrial ? '7-Day Free Trial (Card Authorization)' : 'Monthly Subscription'}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                €{amount.toFixed(2)}
              </Typography>
            </Box>
            {isTrial && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Your card will be authorized but not charged. After 7 days, you'll be automatically charged €20.00/month unless you cancel.
              </Typography>
            )}
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total Due Today</Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: isTrial ? '#059669' : 'var(--color-primary)' 
                }}
              >
                €{amount.toFixed(2)}
              </Typography>
            </Box>
            {isTrial && (
              <Alert 
                severity="success" 
                sx={{ 
                  mt: 2, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  🎉 You won't be charged today! Enjoy 7 days of Premium access completely free.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Alert 
          severity="info" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            '& .MuiAlert-icon': {
              color: '#3b82f6'
            }
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Lock fontSize="small" />
            <Typography variant="body2">
              This is a simulation. In production, this would integrate with Stripe for secure payment processing.
            </Typography>
          </Box>
        </Alert>

        <Card 
          elevation={3}
          sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CreditCard sx={{ color: 'var(--color-primary)' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                Payment Method
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              In the production version, you would enter your credit card details here.
              For now, clicking "Complete Payment" will simulate a successful transaction.
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'rgba(59, 130, 246, 0.05)', 
              borderRadius: 2,
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                **** **** **** 4242 (Demo Card)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expires: 12/25 | CVV: 123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={processing}
          sx={{ 
            textTransform: 'none', 
            borderRadius: 2,
            fontWeight: 600,
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handlePayment}
          disabled={processing}
          startIcon={processing ? <CircularProgress size={16} /> : <Payment />}
          sx={{ 
            minWidth: 160,
            background: isTrial
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              background: isTrial
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
            }
          }}
        >
          {processing 
            ? 'Processing...' 
            : isTrial 
              ? 'Authorize & Start Trial' 
              : `Pay €${amount.toFixed(2)}`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
