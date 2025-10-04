import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingSpinner = ({ size = 40, ...props }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
      {...props}
    >
      <CircularProgress size={size} sx={{ color: 'var(--color-primary)' }} />
    </Box>
  );
};

export default LoadingSpinner;
