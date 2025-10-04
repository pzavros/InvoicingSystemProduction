import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Paper,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { COLOR_THEMES } from '../../utils/colorThemes';

const ColorThemeSelector = ({ onSelectTheme, selectedTheme, selectedLayout }) => {
  const [hoveredTheme, setHoveredTheme] = useState(null);

  const getThemePreviewColors = (theme) => {
    return [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.background
    ];
  };

  const getThemeCategory = (themeId) => {
    const categories = {
      blue: 'Corporate',
      indigo: 'Corporate', 
      gray: 'Corporate',
      green: 'Creative',
      purple: 'Creative',
      orange: 'Creative',
      teal: 'Modern',
      red: 'Bold'
    };
    return categories[themeId] || 'Standard';
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
          Choose Your Colors
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a color scheme that matches your brand and business personality
        </Typography>
        {selectedLayout && (
          <Chip 
            label={`Applied to: ${selectedLayout} layout`} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      <Grid container spacing={2}>
        {Object.values(COLOR_THEMES).map((theme) => (
          <Grid item xs={12} sm={6} md={3} key={theme.id}>
            <Card
              elevation={selectedTheme === theme.id ? 6 : 2}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedTheme === theme.id 
                  ? `3px solid ${theme.colors.primary}` 
                  : '2px solid transparent',
                background: selectedTheme === theme.id
                  ? theme.colors.background
                  : 'white',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 24px ${theme.colors.primary}25`
                }
              }}
              onMouseEnter={() => setHoveredTheme(theme.id)}
              onMouseLeave={() => setHoveredTheme(null)}
              onClick={() => onSelectTheme(theme.id)}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Theme Header with Selection Status */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PaletteIcon 
                      sx={{ 
                        color: theme.colors.primary,
                        fontSize: 24
                      }} 
                    />
                    <Chip
                      label={getThemeCategory(theme.id)}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.7rem',
                        height: 20,
                        color: theme.colors.primary,
                        borderColor: theme.colors.primary
                      }}
                    />
                  </Box>
                  {selectedTheme === theme.id && (
                    <CheckIcon 
                      sx={{ 
                        color: theme.colors.primary,
                        fontSize: 28
                      }} 
                    />
                  )}
                </Box>

                {/* Color Preview Circles */}
                <Box display="flex" gap={0.5} mb={2} justifyContent="center">
                  {getThemePreviewColors(theme).map((color, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: color,
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  ))}
                </Box>

                {/* Theme Name */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    fontSize: '1rem',
                    textAlign: 'center',
                    color: selectedTheme === theme.id ? theme.colors.primary : '#1f2937'
                  }}
                >
                  {theme.name}
                </Typography>

                {/* Theme Description */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                    textAlign: 'center',
                    minHeight: 35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {theme.description}
                </Typography>

                {/* Color Gradient Preview */}
                <Paper
                  elevation={1}
                  sx={{
                    height: 40,
                    mb: 2,
                    borderRadius: 2,
                    background: theme.gradients.header,
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Simulated header text */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    INVOICE HEADER
                  </Box>
                </Paper>

                {/* Primary Colors Display */}
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Tooltip title="Primary Color">
                    <Box
                      sx={{
                        width: '30%',
                        height: 20,
                        background: theme.colors.primary,
                        borderRadius: 1,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Secondary Color">
                    <Box
                      sx={{
                        width: '30%',
                        height: 20,
                        background: theme.colors.secondary,
                        borderRadius: 1,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Accent Color">
                    <Box
                      sx={{
                        width: '30%',
                        height: 20,
                        background: theme.colors.accent,
                        borderRadius: 1,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                  </Tooltip>
                </Box>

                {/* Select Button */}
                <Button
                  variant={selectedTheme === theme.id ? "contained" : "outlined"}
                  fullWidth
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTheme(theme.id);
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: selectedTheme === theme.id ? theme.colors.primary : 'transparent',
                    borderColor: theme.colors.primary,
                    color: selectedTheme === theme.id ? 'white' : theme.colors.primary,
                    '&:hover': {
                      backgroundColor: selectedTheme === theme.id ? theme.colors.secondary : `${theme.colors.primary}15`,
                      borderColor: theme.colors.secondary
                    }
                  }}
                >
                  {selectedTheme === theme.id ? 'Selected' : 'Select'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ColorThemeSelector;
