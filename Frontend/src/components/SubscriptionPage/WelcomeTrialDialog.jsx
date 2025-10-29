import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Star,
  CheckCircle,
  Receipt,
  Dashboard,
  Inventory,
  Assessment,
  Close as CloseIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { subscriptionAPI } from './subscriptionAPI';
import { useSubscription } from '../../utils/SubscriptionContext';

const MONTHLY_PRICE = parseFloat(import.meta.env.VITE_SUBSCRIPTION_MONTHLY_PRICE || '13.99');

function WelcomeTrialDialog({ open, onClose, onStartTrial }) {
  const [starting, setStarting] = useState(false);
  const { refreshStatus } = useSubscription();

  const handleStartTrial = async () => {
    try {
      setStarting(true);
      await subscriptionAPI.startTrial();
      await refreshStatus();
      onClose();
    } catch (error) {
      console.error('Error starting trial:', error);
    } finally {
      setStarting(false);
    }
  };

  const features = [
    { icon: <Receipt />, text: 'Create unlimited invoices' },
    { icon: <Dashboard />, text: 'Dashboard analytics' },
    { icon: <Inventory />, text: 'Product catalog management' },
    { icon: <Assessment />, text: 'Financial reports' },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
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
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0',
        m: 0,
        p: 3
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Star />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Welcome to the Invoicing System!
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Card 
          elevation={6}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
              borderRadius: '8px 8px 0 0'
            }
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--color-primary)', mb: 1 }}>
              7-Day Free Trial
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              Then €{MONTHLY_PRICE.toFixed(2)}/month
            </Typography>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              Start your free trial today and explore all the features our invoicing system has to offer.
              No credit card required for the trial.
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)', mb: 2 }}>
          What's included in your trial:
        </Typography>
        
        <Card 
          elevation={3}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <List>
              {features.map((feature, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#059669' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {feature.text}
                      </Typography>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        {React.cloneElement(feature.icon, { 
                          fontSize: 'small', 
                          sx: { color: 'var(--color-primary)' } 
                        })}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" align="center" sx={{ 
          p: 2,
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          borderRadius: 2,
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          After your trial ends, continue with full access for just €{MONTHLY_PRICE.toFixed(2)}/month.
          Cancel anytime during or after the trial period.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={starting}
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 600,
            px: 3
          }}
        >
          Maybe Later
        </Button>
        <Button
          variant="contained"
          onClick={handleStartTrial}
          disabled={starting}
          size="large"
          startIcon={<Star />}
          sx={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
            }
          }}
        >
          {starting ? 'Starting Trial...' : 'Start Free Trial'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeTrialDialog;
