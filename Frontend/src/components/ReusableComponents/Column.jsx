import React from 'react';
import { Box } from '@mui/material';

const Column = ({ children, gap = 2, alignItems = 'flex-start', justifyContent = 'flex-start', ...props }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap * 8}px`,
        alignItems,
        justifyContent,
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Column;
