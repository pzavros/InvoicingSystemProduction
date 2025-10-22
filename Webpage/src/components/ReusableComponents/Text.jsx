import { Typography } from '@mui/material';

const Text = ({ children, variant = 'body1', weight = 'normal', align = 'left', gutter = false, sx = {} }) => {
  const fontWeight = {
    light: 300,
    normal: 400,
    medium: 500,
    bold: 700
  };

  // Mobile-friendly responsive font sizes for hero/cta sections
  const responsiveFontSizes = {
    h1: {
      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' }
    },
    h2: {
      fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.25rem', lg: '2.5rem' }
    },
    h3: {
      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.875rem', lg: '2rem' }
    },
    h4: {
      fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' }
    },
    h5: {
      fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }
    },
    h6: {
      fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' }
    }
  };

  return (
    <Typography
      variant={variant}
      align={align}
      gutterBottom={gutter}
      sx={{
        fontWeight: fontWeight[weight] || fontWeight.normal,
        margin: 0,
        ...(responsiveFontSizes[variant] || {}),
        ...sx
      }}
    >
      {children}
    </Typography>
  );
};

export default Text;
