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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We'll send a 6-digit verification code to your email address to confirm the password change.
            </Typography>
          </>
        );

      case 2:
        return (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the 6-digit verification code sent to your email address.
            </Typography>
            
            {/* Individual OTP Input Boxes */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Verification Code
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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
                        padding: '12px'
                      }
                    }}
                    sx={{
                      width: '50px',
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: 2
                        }
                      }
                    }}
                    error={!!errors.otp}
                  />
                ))}
              </Box>
              {errors.otp && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  {errors.otp}
                </Typography>
              )}
            </Box>

            {countdown > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Code expires in: {formatCountdown(countdown)}
              </Typography>
            )}
          </>
        );

      case 3:
        return (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              OTP verified successfully! Now set your new password.
            </Typography>
            
            <Grid container spacing={2}>
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
                      >
                        {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
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
                      >
                        {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
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
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 4,
              "&:hover": {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
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
                size="large"
                sx={{ mr: 1 }}
              >
                Resend Code
              </Button>
            )}
            <Button
              onClick={handleVerifyOtp}
              variant="contained"
              disabled={loading || passwordData.otp.join('').length !== 6}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                "&:hover": {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
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
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 4,
              "&:hover": {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
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
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 'bold' }}>
        {getStepTitle()}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {/* Step Indicator */}
        <Stepper activeStep={step - 1} sx={{ mb: 3 }}>
          {[1, 2, 3].map((stepNumber) => (
            <Step key={stepNumber}>
              <StepLabel 
                icon={getStepIcon(stepNumber)}
                sx={{
                  '& .MuiStepIcon-root': {
                    color: step >= stepNumber ? 'primary.main' : 'grey.300',
                  }
                }}
              >
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
          <Alert severity="error" sx={{ mt: 2 }}>
            Please fix the errors above before continuing.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          size="large"
        >
          Cancel
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
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
              size="large"
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
