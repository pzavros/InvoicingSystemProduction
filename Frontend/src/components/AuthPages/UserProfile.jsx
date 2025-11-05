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
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  AccessTime as TrialIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { getUserProfile, updateUserProfile } from './api';
import { useSubscription } from '../../utils/SubscriptionContext';
import Section from '../ReusableComponents/Section';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const { subscriptionStatus, loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const profileData = await getUserProfile();
      
      setProfile(profileData);
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

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
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
      <Section>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Section>
    );
  }

  return (
    <Section>
      <Fade in={true} timeout={800}>
        <Grid container spacing={3}>
          {/* Header Row */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box 
                sx={{ 
                  width: 48,
                  height: 48,
                  borderRadius: 2,
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
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                  User Profile
                </Typography>
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                  Manage your personal information and security
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Profile Summary Card */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        margin: '0 auto',
                        mb: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </Avatar>
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: -4,
                        backgroundColor: '#667eea',
                        color: 'white',
                        width: 28,
                        height: 28,
                        '&:hover': { backgroundColor: '#5a67d8' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
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
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatDate(profile?.dateEntered)}
                    </Typography>
                  </Grid>
                  {profile?.subscriptionExpiryDate && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Subscription
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatDate(profile?.subscriptionExpiryDate)}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Tab Navigation */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { key: 'profile', label: 'Profile', icon: PersonIcon },
                { key: 'security', label: 'Security', icon: SecurityIcon }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Grid item xs={6} key={tab.key}>
                    <Button
                      fullWidth
                      variant={activeTab === tab.key ? 'contained' : 'outlined'}
                      startIcon={<IconComponent />}
                      onClick={() => setActiveTab(tab.key)}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        ...(activeTab === tab.key ? {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                          border: 'none'
                        } : {
                          color: '#6b7280',
                          borderColor: 'rgba(148, 163, 184, 0.3)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.04)',
                            borderColor: '#667eea'
                          }
                        })
                      }}
                    >
                      {tab.label}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>

          {/* Tab Content */}
          <Grid item xs={12} md={8}>
            {activeTab === 'profile' && (
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box 
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <EditIcon sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Profile Information
                    </Typography>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                      {success}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="firstName"
                          label="First Name"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: 'action.active' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#10b981'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#10b981'
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#10b981'
                            }
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
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: 'action.active' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#10b981'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#10b981'
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#10b981'
                            }
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
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon sx={{ color: 'action.active' }} />
                              </InputAdornment>
                            )
                          }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#10b981'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#10b981'
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#10b981'
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={updating}
                          startIcon={<SaveIcon />}
                          sx={{
                            backgroundColor: '#10b981',
                            backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            '&:hover': {
                              backgroundColor: '#059669',
                              backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            },
                            '&:disabled': {
                              backgroundColor: '#9ca3af',
                              color: 'white'
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
            )}

            {activeTab === 'security' && (
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box 
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <SecurityIcon sx={{ color: 'white', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Security Settings
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        label="Current Password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('current')}
                                edge="end"
                                size="small"
                              >
                                {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        label="New Password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('new')}
                                edge="end"
                                size="small"
                              >
                                {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        label="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('confirm')}
                                edge="end"
                                size="small"
                              >
                                {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<LockIcon />}
                        sx={{
                          backgroundColor: '#ef4444',
                          backgroundImage: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: '#dc2626'
                          }
                        }}
                      >
                        Update Password
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Subscription Status Warning - Full Width */}
          {!subscriptionStatus?.isActive && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '1px solid #f59e0b'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box 
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrialIcon sx={{ color: 'white', fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#92400e' }}>
                      Subscription Expired
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a16207' }}>
                      Your subscription has expired. Please renew to continue using all features.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#f59e0b',
                    backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#d97706'
                    }
                  }}
                >
                  Renew Subscription
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Fade>
    </Section>
  );
};

export default UserProfile;
