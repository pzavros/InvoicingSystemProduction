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
  Link,
  InputAdornment,
  IconButton,
  Fade,
  Grow,
  Stack
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  VpnKey as VpnKeyIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from './api';

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    resetToken: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.resetToken.length !== 6) {
      setError('Reset code must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email: formData.email,
        resetToken: formData.resetToken,
        newPassword: formData.newPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true} timeout={800}>
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {success ? (
                // Success State
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 3,
                      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <CheckCircleIcon sx={{ color: 'white', fontSize: 40 }} />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}
                  >
                    Password Reset Successful!
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: 'text.primary' }}>
                    Your password has been reset successfully. You can now log in with your new password.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #63408b 100%)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                      }
                    }}
                  >
                    Go to Login
                  </Button>
                </Box>
              ) : (
                // Form State
                <>
                  <Grow in={true} timeout={1000}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          mb: 3,
                          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        <VpnKeyIcon sx={{ color: 'white', fontSize: 32 }} />
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 1
                        }}
                      >
                        Reset Your Password
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Enter the code from your email and choose a new password
                      </Typography>
                    </Box>
                  </Grow>

                  {error && (
                    <Fade in={true}>
                      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      name="email"
                      type="email"
                      label="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      sx={{ mb: 3 }}
                    />

                    <TextField
                      fullWidth
                      name="resetToken"
                      label="6-Digit Reset Code"
                      value={formData.resetToken}
                      onChange={handleChange}
                      required
                      inputProps={{ maxLength: 6, pattern: '[0-9]{6}' }}
                      placeholder="000000"
                      sx={{ mb: 3 }}
                      helperText="Enter the 6-digit code sent to your email"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <VpnKeyIcon color="action" />
                          </InputAdornment>
                        ),
                        style: {
                          fontSize: '20px',
                          letterSpacing: '8px',
                          fontWeight: 'bold'
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      label="New Password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      helperText="Minimum 6 characters"
                    />

                    <TextField
                      fullWidth
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      sx={{ mb: 4 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        mb: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                          boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                        }
                      }}
                    >
                      {loading ? 'Resetting Password...' : 'Reset Password'}
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                      <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={() => navigate('/forgot-password')}
                        sx={{
                          color: '#667eea',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        Didn't receive a code? Request a new one
                      </Link>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default ResetPasswordForm;
