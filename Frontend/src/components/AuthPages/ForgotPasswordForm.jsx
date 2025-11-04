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
  InputAdornment,
  Fade,
  Grow
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from './api';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToReset = () => {
    navigate('/reset-password', { state: { email } });
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
                    <EmailIcon sx={{ color: 'white', fontSize: 40 }} />
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
                    Check Your Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1, color: 'text.primary' }}>
                    If an account exists with <strong>{email}</strong>, we've sent a password reset code.
                  </Typography>
                  <Alert severity="info" sx={{ mb: 3, mt: 2, borderRadius: 2, textAlign: 'left' }}>
                    <strong>Next steps:</strong>
                    <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Copy the 6-digit reset code</li>
                      <li>Click the button below to enter the code</li>
                    </ol>
                  </Alert>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleGoToReset}
                    sx={{
                      py: 1.5,
                      mb: 2,
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
                    Enter Reset Code
                  </Button>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => navigate('/login')}
                    startIcon={<ArrowBackIcon />}
                    sx={{ color: '#667eea' }}
                  >
                    Back to Login
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
                        <LockResetIcon sx={{ color: 'white', fontSize: 32 }} />
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
                        Forgot Password?
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        No worries! Enter your email and we'll send you a reset code.
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
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
                      {loading ? 'Sending Code...' : 'Send Reset Code'}
                    </Button>

                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => navigate('/login')}
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        color: '#667eea',
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.04)'
                        }
                      }}
                    >
                      Back to Login
                    </Button>
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

export default ForgotPasswordForm;
