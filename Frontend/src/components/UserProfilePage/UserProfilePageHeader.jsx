// src/components/UserProfilePage/UserProfilePageHeader.jsx
import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
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
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PersonIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            User Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>
      </Box>

      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}
              >
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </Avatar>
            </Grid>
            
            <Grid item xs>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {profile?.firstName} {profile?.lastName}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile?.email}
              </Typography>

              <Chip
                icon={profile?.isTrialUser ? <TrialIcon /> : <VerifiedIcon />}
                label={getSubscriptionLabel()}
                color={getSubscriptionColor()}
                size="small"
              />
            </Grid>

            <Grid item>
              <Typography variant="caption" color="text.secondary" display="block">
                Member Since
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatDate(profile?.dateEntered)}
              </Typography>
            </Grid>

            {profile?.subscriptionExpiryDate && (
              <Grid item>
                <Typography variant="caption" color="text.secondary" display="block">
                  Subscription Expires
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatDate(profile?.subscriptionExpiryDate)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfilePageHeader;
