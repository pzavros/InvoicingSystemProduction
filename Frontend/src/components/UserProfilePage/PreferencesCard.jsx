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
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  borderRadius: '12px',
                  mt: 1,
                  boxShadow: '0 4px 24px rgba(15, 23, 42, 0.12)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  '& .MuiList-root': {
                    py: 1
                  },
                  '& .MuiMenuItem-root': {
                    mx: 1,
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    px: 2,
                    py: 1.5,
                    color: 'rgba(15, 23, 42, 0.8)',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.06)',
                      color: 'rgba(15, 23, 42, 0.95)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(15, 23, 42, 0.1)',
                      color: 'rgba(15, 23, 42, 0.95)',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(15, 23, 42, 0.12)'
                      }
                    }
                  }
                }
              }
            }
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
              },
              '& .MuiSelect-icon': {
                color: 'rgba(15, 23, 42, 0.45)',
                fontSize: '1.5rem',
                transition: 'all 0.2s ease'
              },
              '&.Mui-focused .MuiSelect-icon': {
                color: 'rgba(15, 23, 42, 0.65)'
              }
            },
            '& .MuiOutlinedInput-input': {
              padding: '13px 15px',
              fontWeight: 500
            }
          }}
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
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  borderRadius: '12px',
                  mt: 1,
                  boxShadow: '0 4px 24px rgba(15, 23, 42, 0.12)',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  '& .MuiList-root': {
                    py: 1
                  },
                  '& .MuiMenuItem-root': {
                    mx: 1,
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    px: 2,
                    py: 1.5,
                    color: 'rgba(15, 23, 42, 0.8)',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.06)',
                      color: 'rgba(15, 23, 42, 0.95)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(15, 23, 42, 0.1)',
                      color: 'rgba(15, 23, 42, 0.95)',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(15, 23, 42, 0.12)'
                      }
                    }
                  }
                }
              }
            }
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
              },
              '& .MuiSelect-icon': {
                color: 'rgba(15, 23, 42, 0.45)',
                fontSize: '1.5rem',
                transition: 'all 0.2s ease'
              },
              '&.Mui-focused .MuiSelect-icon': {
                color: 'rgba(15, 23, 42, 0.65)'
              }
            },
            '& .MuiOutlinedInput-input': {
              padding: '13px 15px',
              fontWeight: 500
            }
          }}
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
            {updating ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default PreferencesCard;
