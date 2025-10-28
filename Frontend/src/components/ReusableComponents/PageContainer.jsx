import React from 'react';
import { Container, Fade, Box } from '@mui/material';

/**
 * Standardized page container component for consistent margins and max-width across all pages
 * Use this as the root container for all pages to ensure consistent spacing
 * @param {boolean} animated - Whether to apply fade-in animation (default: true)
 * @param {number} animationTimeout - Animation duration in ms (default: 800)
 */
const PageContainer = ({ 
  children, 
  maxWidth = 'xl', 
  disableGutters = false, 
  animated = true,
  animationTimeout = 800,
  sx = {}, 
  ...props 
}) => {
  const content = (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 3 },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Container>
  );

  if (!animated) {
    return content;
  }

  return (
    <Fade in={true} timeout={animationTimeout}>
      <Box>
        {content}
      </Box>
    </Fade>
  );
};

export default PageContainer;
