import { Card as MuiCard, CardContent, CardActionArea, Box } from '@mui/material';
import Text from './Text.jsx';

const Card = ({ 
  title, 
  children, 
  onClick, 
  icon,
  variant = 'default',
  elevation = 2,
  sx = {}
}) => {
  const CardWrapper = onClick ? CardActionArea : Box;

  const variants = {
    default: {
      background: 'white',
      borderRadius: 2,
      border: 'none'
    },
    
    feature: {
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: 3,
      border: '1px solid rgba(102, 126, 234, 0.1)',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
      }
    },
    
    step: {
      background: 'white',
      borderRadius: 3,
      border: '2px solid rgba(102, 126, 234, 0.1)',
      position: 'relative',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
        borderColor: 'rgba(102, 126, 234, 0.3)'
      }
    },
    
    glass: {
      background: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(10px)',
      borderRadius: 3,
      border: '1px solid rgba(255, 255, 255, 0.18)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.35)',
        transform: 'translateY(-4px)'
      }
    },
    
    gradient: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: 3,
      '&:hover': {
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
      }
    }
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <MuiCard
      elevation={elevation}
      sx={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'visible',
        ...variantStyles,
        ...sx
      }}
    >
      <CardWrapper onClick={onClick}>
        <CardContent
          sx={{
            p: { xs: 3, md: 4 },
            '&:last-child': { pb: { xs: 3, md: 4 } },
            textAlign: 'center'
          }}
        >
          {icon && (
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              {variant === 'feature' ? (
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    borderRadius: '50%',
                    width: 80,
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {icon}
                </Box>
              ) : variant === 'step' ? (
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {icon}
                </Box>
              ) : (
                icon
              )}
            </Box>
          )}
          
          {title && (
            <Text 
              variant={variant === 'feature' ? 'h5' : 'h6'} 
              weight="bold" 
              align="center" 
              sx={{ 
                mb: 2,
                color: variant === 'gradient' ? 'white' : 'inherit'
              }}
            >
              {title}
            </Text>
          )}
          
          {children && (
            <Box sx={{ 
              color: variant === 'gradient' ? 'rgba(255,255,255,0.9)' : 'text.secondary' 
            }}>
              {children}
            </Box>
          )}
        </CardContent>
      </CardWrapper>
    </MuiCard>
  );
};

export default Card;
