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
  keyframes,
  CircularProgress
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from './api';
import { useAuth } from '../../utils/AuthContext';

// Animation for success state
const scaleIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const RegisterForm = () => {
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (authenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [authenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      // Check if registration requires email verification
      if (response.message === 'REGISTRATION_SUCCESS') {
        setRegisteredEmail(formData.email);
        setRegistrationSuccess(true);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoToLogin = () => {
    navigate('/login', { state: { email: registeredEmail } });
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
                    <PersonAddIcon sx={{ color: 'white', fontSize: 28 }} />
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
                    Create Account
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: '#86868b',
                      fontSize: '0.9375rem',
                      fontWeight: 400
                    }}
                  >
                    Start your 30-day free trial
                  </Typography>
                </Box>

              {/* Success State */}
              {registrationSuccess ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: '#34c759',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2.5,
                      boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)',
                      animation: `${scaleIn} 0.5s ease`
                    }}
                  >
                    <CheckCircleIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.5rem',
                      color: '#1d1d1f',
                      mb: 2,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Account Created
                  </Typography>
                  <Typography 
                    sx={{ 
                      mb: 1.5, 
                      color: '#1d1d1f', 
                      fontWeight: 400,
                      fontSize: '0.9375rem'
                    }}
                  >
                    Verification code sent to
                  </Typography>
                  <Typography 
                    sx={{ 
                      mb: 3, 
                      color: '#0071e3', 
                      fontWeight: 500,
                      fontSize: '0.9375rem'
                    }}
                  >
                    {registeredEmail}
                  </Typography>
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: '10px', 
                      textAlign: 'left',
                      border: 'none',
                      backgroundColor: '#e8f4fd',
                      color: '#1d1d1f',
                      fontSize: '0.875rem',
                      '& .MuiAlert-icon': {
                        color: '#0071e3'
                      }
                    }}
                  >
                    Check your email inbox and click <strong>Login</strong> below to enter your verification code.
                  </Alert>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleGoToLogin}
                    sx={{
                      py: 1.5,
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontSize: '1.0625rem',
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
                    Continue to Login
                  </Button>
                </Box>
              ) : (
                <>
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
                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                  <TextField
                    fullWidth
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    size="small"
                    sx={{
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
                  />
                  <TextField
                    fullWidth
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    size="small"
                    sx={{
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
                  />
                </Box>

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

                <TextField
                  fullWidth
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  size="small"
                  sx={{ 
                    mb: 2.5,
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: '#86868b',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

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
                    letterSpacing: '-0.01em',
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
                  {loading ? <CircularProgress size={22} sx={{ color: '#ffffff' }} /> : 'Continue'}
                </Button>

                <Divider sx={{ 
                  my: 2,
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
                      mb: 1.5
                    }}
                  >
                    Already have an account?
                  </Typography>
                  <Link
                    component="button"
                    type="button"
                    onClick={() => navigate('/login')}
                    sx={{
                      color: '#0071e3',
                      fontWeight: 400,
                      fontSize: '0.8125rem',
                      textDecoration: 'none',
                      transition: 'opacity 0.2s ease',
                      '&:hover': {
                        opacity: 0.7
                      }
                    }}
                  >
                    Sign in
                  </Link>
                </Box>
              </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Container>
    </Box>
  );
};

export default RegisterForm;
