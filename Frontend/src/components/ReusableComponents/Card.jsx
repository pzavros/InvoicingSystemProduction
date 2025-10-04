import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const Card = ({
  children,
  padding = '16px',
  elevation = 4, 
  header = null,
  footer = null,
  ...props
}) => {
  return (
    <Paper
      elevation={elevation}
      sx={{
        minHeight: '150px',
        width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.33% - 16px)' },
        backgroundColor: 'var(--color-card-background)',
        color: 'var(--color-text-primary)',
        mb: 2,
        borderRadius: '16px',
        overflow: 'hidden', 
        transition: 'transform 0.2s ease, box-shadow 0.2s ease', 
        '&:hover': {
          transform: 'translateY(-4px)', 
          boxShadow: `0px 8px 16px var(--color-shadow)`, 
        },
      }}
      {...props}
    >
      {/* Optional Header */}
      {header && (
        <Box
          sx={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            borderBottom: `1px solid var(--color-border)`,
          }}
        >
          <Typography variant="h6" component="div">
            {header}
          </Typography>
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          padding,
        }}
      >
        {children}
      </Box>

      {/* Optional Footer */}
      {footer && (
        <Box
          sx={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-background-light)',
            borderTop: `1px solid var(--color-border)`,
          }}
        >
          {footer}
        </Box>
      )}
    </Paper>
  );
};

export default Card;
