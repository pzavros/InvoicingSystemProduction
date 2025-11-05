// src/components/UserProfilePage/PreferencesCard.jsx
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { 
  Save as SaveIcon
} from '@mui/icons-material';

const PreferencesCard = ({ 
  preferences, 
  setPreferences, 
  onSavePreferences, 
  showNotification,
  showButton = true 
}) => {
  const [updating, setUpdating] = useState(false);

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const result = await onSavePreferences(preferences);
    
    if (result.success) {
      showNotification('Preferences updated successfully!', 'success');
    } else {
      showNotification(result.error || 'Failed to update preferences', 'error');
    }
    
    setUpdating(false);
  };

  const currencies = [
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'CAD', label: 'Canadian Dollar ($)' },
    { value: 'AUD', label: 'Australian Dollar ($)' }
  ];



  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' }
  ];

  return (
    <Grid container spacing={3}>
      {/* Title Row - Full Width */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937", mb: 2 }}>
          Preferences
        </Typography>
      </Grid>

      {/* First Row - Currency and Date Format */}
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          select
          name="currency"
          label="Default Currency"
          value={preferences?.currency || 'EUR'}
          onChange={handlePreferenceChange}
          disabled={updating}
          size="small"
        >
          {currencies.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          select
          name="dateFormat"
          label="Date Format"
          value={preferences?.dateFormat || 'MM/DD/YYYY'}
          onChange={handlePreferenceChange}
          disabled={updating}
          size="small"
        >
          {dateFormats.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
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
            {updating ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default PreferencesCard;
