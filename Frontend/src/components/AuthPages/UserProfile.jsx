import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  Chip,
  Divider,
  Grid,
  Paper,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  AccessTime as TrialIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { getUserProfile, updateUserProfile, getSubscriptionStatus } from './api';
import Page from '../ReusableComponents/Page';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [profileData, subscriptionData] = await Promise.all([
        getUserProfile(),
        getSubscriptionStatus()
      ]);
      
      setProfile(profileData);
      setSubscriptionStatus(subscriptionData);
      setFormData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email
      });
    } catch (error) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully');
      await fetchUserData(); // Refresh data
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

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

  if (loading) {
    return (
      <Page>
        <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Fade in={true} timeout={800}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 4,
                textAlign: 'center'
              }}
            >
              User Profile
            </Typography>

            <Grid container spacing={3}>
              {/* Profile Information Card */}
              <Grid item xs={12} md={4}>
                <Card elevation={4} sx={{ borderRadius: 3, height: 'fit-content' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        margin: '0 auto',
                        mb: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '2rem'
                      }}
                    >
                      {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </Avatar>
                    
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {profile?.firstName} {profile?.lastName}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {profile?.email}
                    </Typography>

                    <Chip
                      icon={profile?.isTrialUser ? <TrialIcon /> : <VerifiedIcon />}
                      label={getSubscriptionLabel()}
                      color={getSubscriptionColor()}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" />
                        {formatDate(profile?.dateEntered)}
                      </Typography>

                      {profile?.subscriptionExpiryDate && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Subscription {subscriptionStatus?.isActive ? 'Expires' : 'Expired'}
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon fontSize="small" />
                            {formatDate(profile?.subscriptionExpiryDate)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Edit Profile Form */}
              <Grid item xs={12} md={8}>
                <Card elevation={4} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                      Edit Profile
                    </Typography>

                    {error && (
                      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                      </Alert>
                    )}

                    {success && (
                      <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                        {success}
                      </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name="firstName"
                            label="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            InputProps={{
                              startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            name="lastName"
                            label="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            InputProps={{
                              startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            name="email"
                            type="email"
                            label="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            InputProps={{
                              startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={updating}
                            startIcon={<SaveIcon />}
                            sx={{
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                              }
                            }}
                          >
                            {updating ? 'Updating...' : 'Update Profile'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Subscription Status */}
            {!subscriptionStatus?.isActive && (
              <Fade in={true} timeout={1200}>
                <Paper
                  elevation={4}
                  sx={{
                    mt: 3,
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)',
                    border: '1px solid #f59e0b'
                  }}
                >
                  <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Subscription Expired
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your subscription has expired. Please renew to continue using the system.
                  </Typography>
                </Paper>
              </Fade>
            )}
          </Box>
        </Fade>
      </Container>
    </Page>
  );
};

export default UserProfile;
