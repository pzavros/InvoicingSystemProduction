import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Lock,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LimitReachedModal = ({ open, onClose, resource, limitInfo }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription');
  };

  const getResourceInfo = () => {
    switch (resource) {
      case 'clients':
        return {
          title: 'Client Limit Reached',
          description: 'You have reached the maximum number of clients for the free tier.',
          limit: '1 client',
        };
      case 'categories':
        return {
          title: 'Category Limit Reached',
          description: 'You have reached the maximum number of categories for the free tier.',
          limit: '1 category',
        };
      case 'products':
        return {
          title: 'Product Limit Reached',
          description: 'You have reached the maximum number of products for the free tier.',
          limit: '1 product',
        };
      case 'invoices':
        return {
          title: 'Monthly Invoice Limit Reached',
          description: `You have used all ${limitInfo?.max || 3} invoices for this month.`,
          limit: `${limitInfo?.max || 3} invoices per month`,
          resetInfo: limitInfo?.resetDate ? `Resets on ${new Date(limitInfo.resetDate).toLocaleDateString()}` : null,
        };
      case 'templates':
        return {
          title: 'Premium Feature',
          description: 'Template creation is exclusively available for premium users.',
          limit: 'Premium only',
          premiumOnly: true,
        };
      default:
        return {
          title: 'Limit Reached',
          description: 'You have reached a limit for the free tier.',
          limit: 'Upgrade required',
        };
    }
  };

  const info = getResourceInfo();

  const premiumFeatures = [
    'Unlimited clients, products, categories',
    'Unlimited invoices every month',
    'Custom invoice templates',
    'No watermarks on PDFs',
    'Priority support',
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Lock color="warning" sx={{ mr: 1 }} />
          {info.title}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {info.description}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Free tier limit: <strong>{info.limit}</strong>
          </Typography>
          {info.resetInfo && (
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              {info.resetInfo}
            </Typography>
          )}
        </Alert>

        {info.premiumOnly && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This feature is designed for businesses that need advanced customization. 
            Upgrade to premium to unlock template creation.
          </Typography>
        )}

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
          Upgrade to Premium for:
        </Typography>
        
        <List dense>
          {premiumFeatures.map((feature, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={feature} />
            </ListItem>
          ))}
        </List>

        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            color: 'white',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            €20/month
          </Typography>
          <Typography variant="body2">
            Cancel anytime. No hidden fees.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Maybe Later
        </Button>
        <Button 
          onClick={handleUpgrade} 
          variant="contained"
          startIcon={<TrendingUp />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            }
          }}
        >
          Upgrade Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LimitReachedModal;
