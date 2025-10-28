import React from 'react';
import { Box, Container, Fade } from '@mui/material';

/**
 * Section component for content areas within pages
 * Provides consistent max-width and padding for content sections
 * @param {boolean} animated - Whether to apply fade-in animation (default: true)
 * @param {number} animationTimeout - Animation duration in ms (default: 800)
 */
const Section = ({
  children,
  backgroundColor = 'transparent',
  maxWidth = 'xl',
  animated = true,
  animationTimeout = 800,
  ...props
}) => {
  const content = (
    <Box
      sx={{
        backgroundColor,
        width: '100%',
        py: { xs: 2, sm: 3, md: 4 },
        ...props.sx,
      }}
      {...props}
    >
      <Container
        maxWidth={maxWidth}
        sx={{
          px: { xs: 2, sm: 3, md: 3 },
        }}
      >
        {children}
      </Container>
    </Box>
  );

  if (!animated) {
    return content;
  }

  return (
    <Fade in={true} timeout={animationTimeout}>
      {content}
    </Fade>
  );
};

export default Section;
