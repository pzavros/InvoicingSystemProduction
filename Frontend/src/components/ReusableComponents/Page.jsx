import React from 'react';
import { Box } from '@mui/material';

const Page = ({ children, ...props }) => {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden', 
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Page;
