// src/components/UserProfilePage/SubscriptionAlert.jsx
import React from 'react';
import {
  Alert,
  Typography,
  Button
} from '@mui/material';
import {
  AccessTime as TrialIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../utils/SubscriptionContext';

const SubscriptionAlert = () => {
  const navigate = useNavigate();
  const { subscriptionStatus } = useSubscription();

  // Don't show if subscription is active
  if (subscriptionStatus?.isActive) {
    return null;
  }

  const handleRenewSubscription = () => {
    navigate('/subscription');
  };

  return (
    <Alert
      severity="warning"
      sx={{ mb: 3 }}
      action={
        <Button
          onClick={handleRenewSubscription}
          variant="contained"
          color="warning"
          size="small"
        >
          Renew Subscription
        </Button>
      }
    >
      <Typography variant="body2" fontWeight="bold">
        Subscription Expired
      </Typography>
      Your subscription has expired. Please renew to continue using all features.
    </Alert>
  );
};

export default SubscriptionAlert;
