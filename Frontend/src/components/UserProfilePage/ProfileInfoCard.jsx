// src/components/UserProfilePage/ProfileInfoCard.jsx
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon
} from '@mui/icons-material';

const ProfileInfoCard = ({ 
  formData, 
  setFormData, 
  onUpdate, 
  showNotification,
  showButton = true 
}) => {
  const [updating, setUpdating] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const result = await onUpdate(formData);
    
    if (result.success) {
      showNotification('Profile updated successfully!', 'success');
    } else {
      showNotification(result.error || 'Failed to update profile', 'error');
    }
    
    setUpdating(false);
  };

  return (
    <Grid container spacing={3}>
      {/* Title Row - Full Width */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937", mb: 2 }}>
          Profile Information
        </Typography>
      </Grid>

      {/* First Row - 2 Fields */}
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          name="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
          disabled={updating}
          size="small"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          name="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
          disabled={updating}
          size="small"
        />
      </Grid>

      {/* Button Row - Full Width */}
      {showButton && (
        <Grid size={{ xs: 12 }} component="form" onSubmit={handleSubmit}>
          <Button
            type="submit"
            variant="contained"
            disabled={updating}
            startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
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
            {updating ? 'Updating...' : 'Update Profile'}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default ProfileInfoCard;
