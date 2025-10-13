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
      {/* Enhanced Header Section */}
      {/* <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            borderRadius: '3px 3px 0 0'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
            }}
          >
            <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #4338ca 0%, #667eea 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              User Profile
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 'medium'
              }}
            >
              Manage your account settings and preferences
            </Typography>
          </Box>
        </Box>

      </Box> */}

      {/* Enhanced User Information Card */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.12)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 32px rgba(99, 102, 241, 0.18)'
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                <Avatar
                  sx={{
                    width: 90,
                    height: 90,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '2.2rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                    border: '3px solid rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                </Avatar>
              </Box>
            </Grid>
            
            <Grid item xs>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #1f2937 0%, #4338ca 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}
                >
                  {profile?.firstName} {profile?.lastName}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 2
                  }}
                >
                  {profile?.email}
                </Typography>

                <Chip
                  icon={profile?.isTrialUser ? <TrialIcon /> : <VerifiedIcon />}
                  label={getSubscriptionLabel()}
                  color={getSubscriptionColor()}
                  size="medium"
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    height: 32,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </Box>
            </Grid>

            <Grid item>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}
                >
                  Member Since
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    mt: 0.5
                  }}
                >
                  {formatDate(profile?.dateEntered)}
                </Typography>
              </Box>
            </Grid>

            {profile?.subscriptionExpiryDate && (
              <Grid item>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(245, 101, 101, 0.05)',
                    border: '1px solid rgba(245, 101, 101, 0.1)'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}
                  >
                    Subscription Expires
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#f56565',
                      mt: 0.5
                    }}
                  >
                    {formatDate(profile?.subscriptionExpiryDate)}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfilePageHeader;
