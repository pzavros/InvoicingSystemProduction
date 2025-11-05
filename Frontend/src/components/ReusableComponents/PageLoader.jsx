// src/components/ReusableComponents/PageLoader.jsx
import React from 'react';
import { Box, CircularProgress, Fade } from '@mui/material';

/**
 * Standardized page loading indicator
 * Used across the application for consistent loading states
 */
const PageLoader = ({ size = 60, color = '#3b82f6', minHeight = '400px' }) => {
  return (
    <Fade in={true} timeout={300}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: minHeight,
          width: '100%'
        }}
      >
        <CircularProgress 
          size={size} 
          sx={{ 
            color: color,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
      </Box>
    </Fade>
  );
};

export default PageLoader;
