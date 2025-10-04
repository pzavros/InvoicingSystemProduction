import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Warning,
  Star,
  Payment,
  Close,
  Schedule,
} from '@mui/icons-material';
import { useSubscription } from '../../utils/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

const SubscriptionBanner = ({ onClose }) => {
  const { subscriptionStatus, loading } = useSubscription();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Don't show banner if loading or dismissed
  if (loading || dismissed) {
    return null;
  }

  // Don't show banner if user has active subscription
  if (subscriptionStatus?.isActive && !subscriptionStatus?.isTrialActive) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (onClose) onClose();
  };

  const handleSubscribeClick = () => {
    navigate('/subscription');
  };

  // Show trial warning if trial is active but expiring soon
  if (subscriptionStatus?.isTrialActive && subscriptionStatus?.daysUntilExpiry <= 3) {
    return (
      <Collapse in={!dismissed}>
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleSubscribeClick}
                startIcon={<Payment />}
              >
                Subscribe Now
              </Button>
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleDismiss}
              >
                <Close fontSize="inherit" />
              </IconButton>
            </Box>
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule />
            <Typography variant="body2">
              Your free trial expires in {subscriptionStatus.daysUntilExpiry} day{subscriptionStatus.daysUntilExpiry !== 1 ? 's' : ''}! 
              Subscribe now to continue using all features.
            </Typography>
          </Box>
        </Alert>
      </Collapse>
    );
  }

  // Show expired subscription warning
  if (subscriptionStatus?.status === 'Expired') {
    return (
      <Collapse in={!dismissed}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleSubscribeClick}
                startIcon={<Payment />}
              >
                Renew Now
              </Button>
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleDismiss}
              >
                <Close fontSize="inherit" />
              </IconButton>
            </Box>
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning />
            <Typography variant="body2">
              Your subscription has expired. Renew now to regain access to all features.
            </Typography>
          </Box>
        </Alert>
      </Collapse>
    );
  }

  // Show no subscription warning
  if (subscriptionStatus?.status === 'No Subscription') {
    return (
      <Collapse in={!dismissed}>
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleSubscribeClick}
                startIcon={<Star />}
              >
                Start Free Trial
              </Button>
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleDismiss}
              >
                <Close fontSize="inherit" />
              </IconButton>
            </Box>
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star />
            <Typography variant="body2">
              Start your 7-day free trial to unlock all features!
            </Typography>
          </Box>
        </Alert>
      </Collapse>
    );
  }

  return null;
};

export default SubscriptionBanner;
