// src/components/UserProfilePage/ChangePasswordDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Close as CloseIcon,
  Security,
  Email,
  Lock
} from '@mui/icons-material';

const ChangePasswordDialog = ({ open, onClose, onChangePassword, showNotification }) => {
  const [step, setStep] = useState(1);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    otp: ['', '', '', '', '', ''] // Array for individual OTP digits
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateNewPassword = () => {
    const newErrors = {};

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};
    const otpString = passwordData.otp.join('');
    if (otpString.length !== 6) {
      newErrors.otp = 'Please enter all 6 digits';
    } else if (!/^\d+$/.test(otpString)) {
      newErrors.otp = 'OTP must contain only numbers';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    
    // Clear errors as user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow single digits
    if (value.length > 1) return;
    if (value !== '' && !/^\d$/.test(value)) return;

    const newOtp = [...passwordData.otp];
    newOtp[index] = value;
    setPasswordData({ ...passwordData, otp: newOtp });

    // Clear errors when user types
    if (errors.otp) {
      setErrors({ ...errors, otp: '' });
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !passwordData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleRequestOtp = async () => {
    setLoading(true);
    
    try {
      const result = await onChangePassword.requestOtp({});
      
      if (result.success) {
        setStep(2);
        setCountdown(300); // 5 minutes countdown
        showNotification('OTP sent to your email address!', 'success');
      } else {
        showNotification(result.error || 'Failed to send OTP', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while requesting OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await onChangePassword.verifyOtp({
        otp: passwordData.otp.join('')
      });
      
      if (result.success) {
        setOtpVerified(true);
        setStep(3); // Move to password setup step
        showNotification('OTP verified successfully!', 'success');
      } else {
        showNotification(result.error || 'Invalid or expired OTP', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while verifying OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validateOtp() || !validateNewPassword()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await onChangePassword.changePassword({
        otp: passwordData.otp.join(''),
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        showNotification('Password changed successfully!', 'success');
        handleClose();
      } else {
        showNotification(result.error || 'Failed to change password', 'error');
      }
    } catch (error) {
      showNotification('An error occurred while changing password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
      otp: ['', '', '', '', '', '']
    });
    setErrors({});
    setShowPasswords({
      new: false,
      confirm: false
    });
    setCountdown(0);
    setOtpVerified(false);
    onClose();
  };

  const getStepIcon = (stepNumber) => {
    switch (stepNumber) {
      case 1: return <Email />;
      case 2: return <Security />;
      case 3: return <Lock />;
      default: return null;
    }
  };

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3,
                color: 'rgba(15, 23, 42, 0.65)',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                letterSpacing: '-0.01em'
              }}
            >
              We'll send a 6-digit verification code to your email address to confirm the password change.
            </Typography>
          </>
        );

      case 2:
        return (
          <>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3,
                color: 'rgba(15, 23, 42, 0.65)',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                letterSpacing: '-0.01em'
              }}
            >
              Enter the 6-digit verification code sent to your email address.
            </Typography>
            
            {/* Individual OTP Input Boxes */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 2,
                  color: 'rgba(15, 23, 42, 0.55)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  letterSpacing: '-0.01em'
                }}
              >
                Verification Code
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                {passwordData.otp.map((digit, index) => (
                  <TextField
                    key={index}
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={loading}
                    autoFocus={index === 0}
                    inputProps={{
                      maxLength: 1,
                      style: { 
                        textAlign: 'center', 
                        fontSize: '1.5rem',
                        padding: '14px 8px',
                        fontWeight: 600
                      }
                    }}
                    sx={{
                      width: '52px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        '& fieldset': {
                          borderColor: 'rgba(15, 23, 42, 0.12)',
                          transition: 'all 0.2s ease'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(15, 23, 42, 0.2)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(15, 23, 42, 0.3)',
                          borderWidth: '1.5px'
                        },
                        '&.Mui-error fieldset': {
                          borderColor: '#dc2626'
                        }
                      }
                    }}
                    error={!!errors.otp}
                  />
                ))}
              </Box>
              {errors.otp && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 1.5, 
                    display: 'block', 
                    textAlign: 'center',
                    color: '#dc2626',
                    fontSize: '0.8125rem'
                  }}
                >
                  {errors.otp}
                </Typography>
              )}
            </Box>

            {countdown > 0 && (
              <Typography 
                variant="body2" 
                sx={{ 
                  textAlign: 'center',
                  color: 'rgba(15, 23, 42, 0.5)',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Code expires in: {formatCountdown(countdown)}
              </Typography>
            )}
          </>
        );

      case 3:
        return (
          <>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3,
                color: 'rgba(15, 23, 42, 0.65)',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                letterSpacing: '-0.01em'
              }}
            >
              OTP verified successfully! Now set your new password.
            </Typography>
            
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={handleChange}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword || 'Must be at least 6 characters'}
                  disabled={loading}
                  autoFocus
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                        size="small"
                        sx={{
                          color: 'rgba(15, 23, 42, 0.45)',
                          '&:hover': {
                            backgroundColor: 'rgba(15, 23, 42, 0.06)',
                            color: 'rgba(15, 23, 42, 0.7)'
                          }
                        }}
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: 'rgba(15, 23, 42, 0.55)',
                      '&.Mui-focused': {
                        color: 'rgba(15, 23, 42, 0.75)',
                        fontWeight: 600
                      }
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.9375rem',
                      '& fieldset': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        transition: 'all 0.2s ease'
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '& fieldset': { 
                          borderColor: 'rgba(15, 23, 42, 0.15)' 
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '& fieldset': { 
                          borderColor: 'rgba(15, 23, 42, 0.25)',
                          borderWidth: '1.5px'
                        }
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '13px 15px',
                      fontWeight: 500
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: '0.8125rem',
                      marginLeft: '2px'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                        size="small"
                        sx={{
                          color: 'rgba(15, 23, 42, 0.45)',
                          '&:hover': {
                            backgroundColor: 'rgba(15, 23, 42, 0.06)',
                            color: 'rgba(15, 23, 42, 0.7)'
                          }
                        }}
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: 'rgba(15, 23, 42, 0.55)',
                      '&.Mui-focused': {
                        color: 'rgba(15, 23, 42, 0.75)',
                        fontWeight: 600
                      }
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.9375rem',
                      '& fieldset': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        transition: 'all 0.2s ease'
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '& fieldset': { 
                          borderColor: 'rgba(15, 23, 42, 0.15)' 
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '& fieldset': { 
                          borderColor: 'rgba(15, 23, 42, 0.25)',
                          borderWidth: '1.5px'
                        }
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '13px 15px',
                      fontWeight: 500
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: '0.8125rem',
                      marginLeft: '2px'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Request Verification Code';
      case 2: return 'Enter Verification Code';
      case 3: return 'Set New Password';
      default: return 'Change Password';
    }
  };

  const getActionButton = () => {
    switch (step) {
      case 1:
        return (
          <Button
            onClick={handleRequestOtp}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              px: 3.5,
              py: 1.25,
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: '10px',
              textTransform: "none",
              boxShadow: '0 1px 3px rgba(139, 92, 246, 0.15), 0 0 0 0.5px rgba(139, 92, 246, 0.1)',
              letterSpacing: '-0.01em',
              border: 'none',
              "&:hover": {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.2), 0 0 0 0.5px rgba(139, 92, 246, 0.15)',
                transform: 'translateY(-1px)'
              },
              "&:active": {
                transform: 'translateY(0px)',
                boxShadow: '0 1px 2px rgba(139, 92, 246, 0.15)'
              },
              "&:disabled": {
                backgroundColor: "rgba(15, 23, 42, 0.08)",
                background: "rgba(15, 23, 42, 0.08)",
                color: 'rgba(15, 23, 42, 0.3)',
                boxShadow: 'none'
              },
              transition: 'all 0.15s ease'
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                Sending Code...
              </>
            ) : (
              'Send Verification Code'
            )}
          </Button>
        );

      case 2:
        return (
          <>
            {countdown === 0 && (
              <Button
                onClick={handleRequestOtp}
                disabled={loading}
                sx={{
                  mr: 1.5,
                  px: 3,
                  py: 1.25,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  borderRadius: '10px',
                  textTransform: "none",
                  borderColor: 'rgba(15, 23, 42, 0.12)',
                  color: 'rgba(15, 23, 42, 0.65)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                  "&:hover": {
                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                    borderColor: 'rgba(15, 23, 42, 0.2)',
                    boxShadow: '0 2px 4px rgba(15, 23, 42, 0.08)',
                    transform: 'translateY(-1px)'
                  },
                  "&:active": {
                    transform: 'translateY(0px)',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
                  },
                  transition: 'all 0.15s ease'
                }}
              >
                Resend Code
              </Button>
            )}
            <Button
              onClick={handleVerifyOtp}
              variant="contained"
              disabled={loading || passwordData.otp.join('').length !== 6}
              sx={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                px: 3.5,
                py: 1.25,
                fontSize: "0.875rem",
                fontWeight: 600,
                borderRadius: '10px',
                textTransform: "none",
                boxShadow: '0 1px 3px rgba(139, 92, 246, 0.15), 0 0 0 0.5px rgba(139, 92, 246, 0.1)',
                letterSpacing: '-0.01em',
                border: 'none',
                "&:hover": {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  boxShadow: '0 2px 6px rgba(139, 92, 246, 0.2), 0 0 0 0.5px rgba(139, 92, 246, 0.15)',
                  transform: 'translateY(-1px)'
                },
                "&:active": {
                  transform: 'translateY(0px)',
                  boxShadow: '0 1px 2px rgba(139, 92, 246, 0.15)'
                },
                "&:disabled": {
                  backgroundColor: "rgba(15, 23, 42, 0.08)",
                  background: "rgba(15, 23, 42, 0.08)",
                  color: 'rgba(15, 23, 42, 0.3)',
                  boxShadow: 'none'
                },
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </>
        );

      case 3:
        return (
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              px: 3.5,
              py: 1.25,
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: '10px',
              textTransform: "none",
              boxShadow: '0 1px 3px rgba(139, 92, 246, 0.15), 0 0 0 0.5px rgba(139, 92, 246, 0.1)',
              letterSpacing: '-0.01em',
              border: 'none',
              "&:hover": {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 2px 6px rgba(139, 92, 246, 0.2), 0 0 0 0.5px rgba(139, 92, 246, 0.15)',
                transform: 'translateY(-1px)'
              },
              "&:active": {
                transform: 'translateY(0px)',
                boxShadow: '0 1px 2px rgba(139, 92, 246, 0.15)'
              },
              "&:disabled": {
                backgroundColor: "rgba(15, 23, 42, 0.08)",
                background: "rgba(15, 23, 42, 0.08)",
                color: 'rgba(15, 23, 42, 0.3)',
                boxShadow: 'none'
              },
              transition: 'all 0.15s ease'
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)'
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(8px)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        pt: 3.5,
        px: 4,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        fontWeight: 600,
        fontSize: '1.25rem',
        letterSpacing: '-0.02em',
        color: 'rgba(15, 23, 42, 0.95)'
      }}>
        {getStepTitle()}
        <IconButton 
          onClick={handleClose} 
          size="small"
          sx={{
            color: 'rgba(15, 23, 42, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.06)',
              color: 'rgba(15, 23, 42, 0.7)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 2, px: 4 }}>
        {/* Step Indicator */}
        <Stepper 
          activeStep={step - 1} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-label': {
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'rgba(15, 23, 42, 0.5)',
              '&.Mui-active': {
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600
              },
              '&.Mui-completed': {
                color: 'rgba(15, 23, 42, 0.6)'
              }
            },
            '& .MuiStepIcon-root': {
              color: 'rgba(15, 23, 42, 0.12)',
              '&.Mui-active': {
                color: '#8b5cf6'
              },
              '&.Mui-completed': {
                color: 'rgba(139, 92, 246, 0.7)'
              }
            },
            '& .MuiStepConnector-line': {
              borderColor: 'rgba(15, 23, 42, 0.1)'
            }
          }}
        >
          {[1, 2, 3].map((stepNumber) => (
            <Step key={stepNumber}>
              <StepLabel icon={getStepIcon(stepNumber)}>
                {stepNumber === 1 && 'Send Code'}
                {stepNumber === 2 && 'Verify OTP'}
                {stepNumber === 3 && 'New Password'}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mt: 2 }}>
          {renderStepContent()}
        </Box>

        {/* Errors */}
        {Object.keys(errors).length > 0 && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3,
              borderRadius: '12px',
              backgroundColor: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              color: '#dc2626',
              fontSize: '0.875rem',
              '& .MuiAlert-icon': {
                color: '#dc2626'
              }
            }}
          >
            Please fix the errors above before continuing.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3.5, pt: 2, justifyContent: 'space-between' }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{
            px: 3,
            py: 1.25,
            fontSize: "0.875rem",
            fontWeight: 600,
            borderRadius: '10px',
            textTransform: "none",
            color: 'rgba(15, 23, 42, 0.65)',
            letterSpacing: '-0.01em',
            "&:hover": {
              backgroundColor: 'rgba(15, 23, 42, 0.06)',
              color: 'rgba(15, 23, 42, 0.8)'
            },
            transition: 'all 0.15s ease'
          }}
        >
          Cancel
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {step > 1 && (
            <Button
              onClick={() => {
                if (step === 3) {
                  setStep(2);
                } else {
                  setStep(step - 1);
                }
              }}
              disabled={loading}
              sx={{
                px: 3,
                py: 1.25,
                fontSize: "0.875rem",
                fontWeight: 600,
                borderRadius: '10px',
                textTransform: "none",
                color: 'rgba(15, 23, 42, 0.65)',
                letterSpacing: '-0.01em',
                "&:hover": {
                  backgroundColor: 'rgba(15, 23, 42, 0.06)',
                  color: 'rgba(15, 23, 42, 0.8)'
                },
                transition: 'all 0.15s ease'
              }}
            >
              Back
            </Button>
          )}
          {getActionButton()}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
