// src/components/UserProfilePage/SecurityCard.jsx
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const SecurityCard = ({ 
  passwordData, 
  setPasswordData, 
  onPasswordUpdate, 
  showNotification 
}) => {
  const [updating, setUpdating] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

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
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showNotification('Please fill in all password fields', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotification('New password must be at least 6 characters long', 'error');
      return;
    }

    setUpdating(true);

    const result = await onPasswordUpdate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    if (result.success) {
      showNotification('Password updated successfully!', 'success');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      showNotification(result.error || 'Failed to update password', 'error');
    }
    
    setUpdating(false);
  };

  return (
    <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
      {/* Title Row - Full Width */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937", mb: 2 }}>
          Security Settings
        </Typography>
      </Grid>

      {/* Alert Row - Full Width */}
      <Grid size={{ xs: 12 }}>
        <Alert severity="info">
          For your security, please enter your current password to make changes.
        </Alert>
      </Grid>

      {/* Current Password Row - Full Width */}
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          name="currentPassword"
          type={showPasswords.current ? 'text' : 'password'}
          label="Current Password"
          value={passwordData.currentPassword}
          onChange={handlePasswordChange}
          disabled={updating}
          required
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
        />
      </Grid>
      
      {/* New Password Fields Row - 2 Fields */}
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          name="newPassword"
          type={showPasswords.new ? 'text' : 'password'}
          label="New Password"
          value={passwordData.newPassword}
          onChange={handlePasswordChange}
          disabled={updating}
          required
          helperText="Minimum 6 characters"
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
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          name="confirmPassword"
          type={showPasswords.confirm ? 'text' : 'password'}
          label="Confirm New Password"
          value={passwordData.confirmPassword}
          onChange={handlePasswordChange}
          disabled={updating}
          required
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
        />
      </Grid>
      
      {/* Button Row - Full Width */}
      <Grid size={{ xs: 12 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={updating}
          startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
          size="large"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            px: 5,
            py: 1.5,
            fontSize: "0.95rem",
            fontWeight: 600,
            borderRadius: 2,
            textTransform: "none",
            "&:hover": {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              transform: "translateY(-1px)"
            },
            "&:active": {
              transform: "translateY(0)"
            },
            "&:disabled": {
              backgroundColor: "#9ca3af",
              background: "none",
              transform: "none"
            },
            transition: "all 0.2s ease"
          }}
        >
          {updating ? 'Updating...' : 'Update Password'}
        </Button>
      </Grid>
    </Grid>
  );
};

export default SecurityCard;
