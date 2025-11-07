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
            color: 'rgba(15, 23, 42, 0.95)', 
            mb: 3,
            fontSize: '1.125rem',
            letterSpacing: '-0.015em'
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
              transition: 'all 0.2s ease',
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
              transition: 'all 0.2s ease',
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
              px: 4,
              py: 1.75,
              fontSize: "0.9375rem",
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: "none",
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
              letterSpacing: '-0.01em',
              "&:hover": {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: '0 6px 16px rgba(139, 92, 246, 0.3)',
                transform: 'translateY(-1px)'
              },
              "&:disabled": {
                backgroundColor: "rgba(15, 23, 42, 0.12)",
                background: "none",
                color: 'rgba(15, 23, 42, 0.4)',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease'
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
