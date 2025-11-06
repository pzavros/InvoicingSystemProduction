// src/components/UserProfilePage/UserProfilePageHeader.jsx
import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  AccessTime as TrialIcon
} from '@mui/icons-material';
import { useSubscription } from '../../utils/SubscriptionContext';

const UserProfilePageHeader = ({ profile }) => {
  const { subscriptionStatus } = useSubscription();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionColor = () => {
    if (!subscriptionStatus?.isActive) return 'error';
    if (profile?.isTrialUser) return 'warning';
    return 'success';
  };

  const getSubscriptionLabel = () => {
    if (!subscriptionStatus?.isActive) return 'Expired';
    if (profile?.isTrialUser) return 'Trial';
    return profile?.subscriptionPlan || 'Active';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 3 },
        mb: 3,
        pb: 3,
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
      }}
    >
      {/* Left Side - Title and Description */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          {profile?.firstName?.[0]}{profile?.lastName?.[0]}
        </Avatar>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              mb: 0.5
            }}
          >
            Profile Settings
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(15, 23, 42, 0.5)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}
          >
            {profile?.email}
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Subscription Status */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
        <Chip
          icon={profile?.isTrialUser ? <TrialIcon /> : <VerifiedIcon />}
          label={getSubscriptionLabel()}
          color={getSubscriptionColor()}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: '24px',
            borderRadius: '6px',
          }}
        />
        {profile?.subscriptionExpiryDate && (
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(15, 23, 42, 0.5)',
              fontSize: '0.8125rem',
            }}
          >
            Expires: {formatDate(profile?.subscriptionExpiryDate)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default UserProfilePageHeader;
