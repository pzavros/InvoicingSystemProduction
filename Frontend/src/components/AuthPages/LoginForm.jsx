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
  
  // Auto-logout if user is already authenticated
  useEffect(() => {
    if (authenticated) {
      logout();
    }
  }, [authenticated, logout]);
  
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
                    <LoginIcon sx={{ color: 'white', fontSize: 32 }} />
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
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sign in to your Invoicing System account
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
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
                />

                <Box sx={{ textAlign: 'right', mb: 3 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => navigate('/forgot-password')}
                    sx={{
                      color: '#667eea',
                      textDecoration: 'none',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#764ba2'
                      }
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                    },
                    mb: 3
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => navigate('/register')}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'medium',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Create a new account - Start your 30-day free trial
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* OTP Verification Dialog */}
        <Dialog
          open={showOtpDialog}
          onClose={handleCloseOtpDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: 2
            }
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2,
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
              }}
            >
              <VerifiedIcon sx={{ color: 'white', fontSize: 35 }} />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              Email Verification Required
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              A 6-digit code was sent to <strong>{formData.email}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Please check your email inbox (and spam folder)
            </Typography>
          </DialogTitle>

          <DialogContent>
            {otpError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {otpError}
              </Alert>
            )}

            {resendMessage && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                {resendMessage}
              </Alert>
            )}

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter verification code:
              </Typography>
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
                        fontWeight: 'bold',
                        padding: '16px 0'
                      }
                    }}
                    sx={{
                      width: '50px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                          borderWidth: 2
                        }
                      }
                    }}
                    autoFocus={index === 0}
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Code expires in 48 hours
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                }
              }}
            >
              {otpLoading ? 'Verifying...' : 'Verify & Login'}
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={handleResendCode}
              disabled={otpLoading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a67d8',
                  background: 'rgba(102, 126, 234, 0.04)'
                }
              }}
            >
              Resend Code
            </Button>

            <Button
              onClick={handleCloseOtpDialog}
              sx={{ mt: 1 }}
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
