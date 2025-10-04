import React from 'react';
import { Box } from '@mui/material';

const Row = ({ children, gap = 2, alignItems = 'center', justifyContent = 'flex-start', ...props }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: { xs: 1, sm: 2, md: gap },
        alignItems,
        justifyContent,
        flexWrap: 'wrap',
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Row;
