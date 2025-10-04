import React, { useState } from 'react';
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
  Grow
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { loginUser } from './api';
import { useAuth } from '../../utils/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      login(response);
      navigate('/dashboard');
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
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
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
      </Container>
    </Box>
  );
};

export default LoginForm;
