import { Button as MuiButton } from '@mui/material';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'large', 
  fullWidth = false, 
  startIcon,
  endIcon,
  disabled = false,
  sx = {} 
}) => {
  const buttonVariants = {
    // Standard variants
    primary: {
      variant: 'contained',
      color: 'primary',
      sx: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
        }
      }
    },
    secondary: {
      variant: 'outlined',
      color: 'primary',
      sx: {
        borderColor: '#667eea',
        color: '#667eea',
        borderWidth: 2,
        '&:hover': {
          borderColor: '#5a67d8',
          background: 'rgba(102, 126, 234, 0.05)',
          transform: 'translateY(-1px)'
        }
      }
    },
    
    // Special effect variants
    glass: {
      variant: 'contained',
      sx: {
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.3)',
        color: 'white',
        '&:hover': {
          background: 'rgba(255,255,255,0.3)',
          transform: 'translateY(-2px)',
        }
      }
    },
    
    outline: {
      variant: 'outlined',
      sx: {
        background: 'transparent',
        border: '2px solid rgba(255,255,255,0.5)',
        color: 'white',
        '&:hover': {
          background: 'rgba(255,255,255,0.1)',
          borderColor: 'rgba(255,255,255,0.8)',
        }
      }
    },
    
    gradient: {
      variant: 'contained',
      sx: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        '&:hover': {
          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
        }
      }
    }
  };

  const config = buttonVariants[variant] || buttonVariants.primary;

  return (
    <MuiButton
      variant={config.variant}
      color={config.color}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      disabled={disabled}
      sx={{
        textTransform: 'none',
        borderRadius: 2,
        py: { xs: 1.5, md: 2 },
        px: { xs: 3, md: 4 },
        fontWeight: 600,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...config.sx,
        ...sx
      }}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
