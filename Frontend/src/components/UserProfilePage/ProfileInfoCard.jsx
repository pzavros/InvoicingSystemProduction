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
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: 'rgba(15, 23, 42, 0.9)', 
            mb: 2,
            fontSize: '1.125rem'
          }}
        >
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '&:hover fieldset': { 
                borderColor: '#8b5cf6' 
              },
              '&.Mui-focused fieldset': { 
                borderColor: '#8b5cf6' 
              }
            }
          }}
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '&:hover fieldset': { 
                borderColor: '#8b5cf6' 
              },
              '&.Mui-focused fieldset': { 
                borderColor: '#8b5cf6' 
              }
            }
          }}
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
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              px: 3,
              py: 1.25,
              fontSize: "0.875rem",
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: "none",
              boxShadow: 'none',
              "&:hover": {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: 'none'
              },
              "&:disabled": {
                backgroundColor: "rgba(15, 23, 42, 0.12)",
                background: "none",
                color: 'rgba(15, 23, 42, 0.4)'
              }
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
