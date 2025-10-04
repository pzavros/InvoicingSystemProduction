import React from 'react';
import { Box } from '@mui/material';

const Section = ({
  children,
  backgroundColor = 'transparent',
  padding = '32px 16px',
  ...props
}) => {
  return (
    <Box
      sx={{
        backgroundColor,
        width: '100%',
        py: { xs: 2, sm: 4, md: 6 },
        ...props.sx,
      }}
      {...props}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Section;
