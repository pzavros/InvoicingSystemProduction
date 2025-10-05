import { Box } from '@mui/material';

const IconBox = ({ 
  children, 
  variant = 'circular',
  size = 80,
  color = 'primary',
  sx = {}
}) => {
  const variants = {
    circular: {
      borderRadius: '50%',
    },
    
    rounded: {
      borderRadius: 2,
    },
    
    square: {
      borderRadius: 0,
    }
  };

  const colors = {
    primary: {
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      border: '2px solid rgba(102, 126, 234, 0.2)'
    },
    
    gradient: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    
    white: {
      background: 'rgba(255,255,255,0.2)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.3)'
    }
  };

  const colorStyles = colors[color] || colors.primary;
  const variantStyles = variants[variant] || variants.circular;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)'
        },
        ...variantStyles,
        ...colorStyles,
        ...sx
      }}
    >
      {children}
    </Box>
  );
};

export default IconBox;
