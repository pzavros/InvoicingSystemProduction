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
        gap: { xs: 2.5, sm: 3 },
        mb: 4,
        p: { xs: 3.5, md: 4.5 },
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(124, 58, 237, 0.06) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.08)',
        boxShadow: '0 1px 2px rgba(139, 92, 246, 0.04)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.03) 0%, transparent 60%)',
          pointerEvents: 'none'
        }
      }}
    >
      {/* Left Side - Title and Description */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, position: 'relative', zIndex: 1 }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            fontSize: '1.5rem',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
            border: '2.5px solid rgba(255, 255, 255, 0.6)'
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
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              mb: 0.5
            }}
          >
            Profile Settings
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(15, 23, 42, 0.6)',
              fontSize: '0.9375rem',
              fontWeight: 500,
              letterSpacing: '-0.01em'
            }}
          >
            {profile?.email}
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Subscription Status */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1.25, 
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Chip
          icon={profile?.isTrialUser ? <TrialIcon sx={{ fontSize: 16 }} /> : <VerifiedIcon sx={{ fontSize: 16 }} />}
          label={getSubscriptionLabel()}
          color={getSubscriptionColor()}
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            height: '28px',
            borderRadius: '8px',
            px: 0.5,
            '& .MuiChip-icon': {
              fontSize: 16
            }
          }}
        />
        {profile?.subscriptionExpiryDate && (
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(15, 23, 42, 0.6)',
              fontSize: '0.8125rem',
              fontWeight: 500
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
