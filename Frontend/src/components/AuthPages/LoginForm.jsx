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
  Divider,
  InputAdornment,
  IconButton,
  Fade,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, verifyEmail, resendVerification } from './api';
import { useAuth } from '../../utils/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, authenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP Verification State
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  // Redirect to dashboard if already authenticated (but don't logout)
  useEffect(() => {
    if (authenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authenticated, navigate]);
  
  // Pre-fill email if coming from registration
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
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser(formData);
      
      // Check for verification required flag
      if (response.message === 'VERIFICATION_REQUIRED') {
        setShowOtpDialog(true);
        setLoading(false);
        return;
      }
      
      // Check for deactivated account
      if (response.message === 'ACCOUNT_DEACTIVATED') {
        setError('Your account has been deactivated. Please contact support.');
        setLoading(false);
        return;
      }
      
      // Normal login success
      if (response.token) {
        login(response);
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP input backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    const digits = pasteData.slice(0, 6).split('');
    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    setOtp(newOtp);
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      await verifyEmail({ email: formData.email, verificationCode: otpCode });
      
      // Email verified successfully, now login
      const response = await loginUser(formData);
      
      if (response.token) {
        login(response);
        navigate('/dashboard');
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Invalid or expired verification code');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setResendMessage('');
    setOtpError('');
    
    try {
      await resendVerification({ email: formData.email });
      setResendMessage('Verification code resent! Please check your email.');
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Failed to resend code');
    }
  };

  const handleCloseOtpDialog = () => {
    setShowOtpDialog(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setResendMessage('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xs">
        <Fade in={true} timeout={600}>
          <Box>
            {/* Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                {/* Logo/Icon */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                    }}
                  >
                    <LoginIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      fontWeight: 600,
                      color: '#1d1d1f',
                      letterSpacing: '-0.02em',
                      mb: 0.5
                    }}
                  >
                    Sign in
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: '#86868b',
                      fontSize: '0.9375rem',
                      fontWeight: 400
                    }}
                  >
                    to continue to Invoicing System
                  </Typography>
                </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#fff0f0',
                    color: '#c41e1e',
                    fontSize: '0.875rem',
                    '& .MuiAlert-icon': {
                      color: '#c41e1e'
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  size="small"
                  sx={{ 
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      fontSize: '0.9375rem',
                      fontWeight: 400,
                      '& input': {
                        padding: '10px 14px'
                      },
                      '& fieldset': {
                        borderColor: '#d2d2d7',
                      },
                      '&:hover fieldset': {
                        borderColor: '#86868b',
                      },
                      '&.Mui-focused': {
                        '& fieldset': {
                          borderColor: '#0071e3',
                          borderWidth: '2px'
                        }
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#86868b',
                      fontSize: '0.9375rem'
                    }
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  size="small"
                  sx={{ 
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      fontSize: '0.9375rem',
                      fontWeight: 400,
                      '& input': {
                        padding: '10px 14px'
                      },
                      '& fieldset': {
                        borderColor: '#d2d2d7',
                      },
                      '&:hover fieldset': {
                        borderColor: '#86868b',
                      },
                      '&.Mui-focused': {
                        '& fieldset': {
                          borderColor: '#0071e3',
                          borderWidth: '2px'
                        }
                      }
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: '#86868b',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ textAlign: 'right', mb: 2 }}>
                  <Link
                    component="button"
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    sx={{
                      color: '#0071e3',
                      textDecoration: 'none',
                      fontWeight: 400,
                      fontSize: '0.8125rem',
                      transition: 'opacity 0.2s ease',
                      '&:hover': {
                        opacity: 0.7
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.25,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    background: '#0071e3',
                    boxShadow: 'none',
                    '&:hover': {
                      background: '#0077ed',
                      boxShadow: 'none'
                    },
                    '&:active': {
                      background: '#006edb'
                    },
                    '&.Mui-disabled': {
                      background: '#86868b',
                      color: '#ffffff',
                      opacity: 0.5
                    },
                    mb: 2.5
                  }}
                >
                  {loading ? 'Signing in...' : 'Continue'}
                </Button>

                <Divider sx={{ 
                  my: 2.5,
                  '&::before, &::after': {
                    borderColor: 'rgba(0, 0, 0, 0.06)'
                  }
                }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#86868b',
                      fontSize: '0.8125rem',
                      mb: 1
                    }}
                  >
                    Don't have an account?
                  </Typography>
                  <Link
                    component="button"
                    type="button"
                    onClick={() => navigate('/register')}
                    sx={{
                      color: '#0071e3',
                      fontWeight: 400,
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      transition: 'opacity 0.2s ease',
                      '&:hover': {
                        opacity: 0.7
                      }
                    }}
                  >
                    Create one now
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Free Trial Notice */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography 
              sx={{ 
                color: '#86868b',
                fontSize: '0.8125rem',
                lineHeight: 1.6
              }}
            >
              Start your 30-day free trial
            </Typography>
          </Box>
        </Box>
        </Fade>

        {/* OTP Verification Dialog */}
        <Dialog
          open={showOtpDialog}
          onClose={handleCloseOtpDialog}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '18px',
              p: { xs: 2, sm: 3 },
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 2, pt: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
              }}
            >
              <VerifiedIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography 
              sx={{ 
                fontWeight: 600,
                fontSize: '1.375rem',
                letterSpacing: '-0.01em',
                color: '#1d1d1f',
                mb: 1
              }}
            >
              Verify your email
            </Typography>
            <Typography 
              sx={{ 
                color: '#86868b',
                fontSize: '0.875rem',
                fontWeight: 400,
                lineHeight: 1.5
              }}
            >
              Enter the 6-digit code sent to<br />
              <strong style={{ color: '#1d1d1f' }}>{formData.email}</strong>
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 2, pb: 3 }}>
            {otpError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2.5, 
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#fff0f0',
                  color: '#c41e1e',
                  fontSize: '0.875rem'
                }}
              >
                {otpError}
              </Alert>
            )}

            {resendMessage && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 2.5, 
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  fontSize: '0.875rem'
                }}
              >
                {resendMessage}
              </Alert>
            )}

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="center"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <TextField
                    key={index}
                    id={`otp-input-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    inputProps={{
                      maxLength: 1,
                      style: {
                        textAlign: 'center',
                        fontSize: '24px',
                        fontWeight: 600,
                        padding: '14px 0',
                        color: '#1d1d1f'
                      }
                    }}
                    sx={{
                      width: '44px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#f5f5f7',
                        '& fieldset': {
                          borderColor: '#d2d2d7',
                        },
                        '&:hover fieldset': {
                          borderColor: '#86868b',
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                          '& fieldset': {
                            borderColor: '#0071e3',
                            borderWidth: 2
                          }
                        }
                      }
                    }}
                    autoFocus={index === 0}
                  />
                ))}
              </Stack>
              <Typography 
                sx={{ 
                  mt: 2, 
                  color: '#86868b',
                  fontSize: '0.75rem'
                }}
              >
                Code expires in 48 hours
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 0, flexDirection: 'column', gap: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              sx={{
                py: 1.25,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.9375rem',
                fontWeight: 500,
                background: '#0071e3',
                boxShadow: 'none',
                '&:hover': {
                  background: '#0077ed',
                  boxShadow: 'none'
                },
                '&:active': {
                  background: '#006edb'
                }
              }}
            >
              {otpLoading ? 'Verifying...' : 'Verify'}
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={handleResendCode}
              disabled={otpLoading}
              sx={{
                py: 1,
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 400,
                color: '#0071e3',
                '&:hover': {
                  background: 'rgba(0, 113, 227, 0.04)'
                }
              }}
            >
              Resend code
            </Button>

            <Button
              onClick={handleCloseOtpDialog}
              sx={{ 
                color: '#86868b',
                textTransform: 'none',
                fontSize: '0.8125rem',
                fontWeight: 400,
                '&:hover': {
                  background: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default LoginForm;
