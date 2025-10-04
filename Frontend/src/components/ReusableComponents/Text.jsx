import React from 'react';
import { Typography } from '@mui/material';

const Text = ({
  children,
  variant = 'body1',
  align = 'left',
  gutterBottom = false,
  color = 'var(--text-color)',
  ...props
}) => {
  return (
    <Typography
      variant={variant}
      align={align}
      gutterBottom={gutterBottom}
      sx={{
        color,
        ...(variant === 'h1' && { fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }),
        ...(variant === 'h2' && { fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' } }),
        ...(variant === 'h3' && { fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }),
        ...(variant === 'h4' && { fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.25rem' } }),
        ...(variant === 'h5' && { fontSize: { xs: '1.125rem', sm: '1.5rem', md: '2rem' } }),
        ...(variant === 'h6' && { fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }),
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default Text;
