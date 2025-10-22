import { Box } from '@mui/material';
import Text from './Text.jsx';

const Section = ({ 
  children, 
  title, 
  subtitle, 
  variant = 'default',
  spacing = 'normal',
  sx = {},
  ...otherProps
}) => {
  const spacingMap = {
    compact: { xs: 3, md: 4 },
    normal: { xs: 3, md: 6 },
    large: { xs: 6, md: 12 }
  };

  const variants = {
    default: {},
    
    gradient: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    },
    
    light: {
      background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
      mx: 0 // Ensure no horizontal margins
    },
    
    hero: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: { xs: 2, md: 4 },
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      px: { xs: 3, sm: 4, md: 6 },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }
    },
    
    cta: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: { xs: 2, md: 4 },
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      px: { xs: 3, sm: 4, md: 6 },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)',
      }
    }
  };

  const variantStyles = variants[variant] || variants.default;

  return (
    <Box
      component="section"
      {...otherProps}
      sx={{
        width: '100%',
        py: spacingMap[spacing],
        px: 0, // Remove inconsistent padding - let Page handle all horizontal spacing
        mb: { xs: 4, md: 6 },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...variantStyles,
        ...sx
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1400px', mx: 'auto' }}>
        {title && (
          <Box sx={{ textAlign: 'center', mb: subtitle ? { xs: 1.5, md: 2 } : { xs: 3, md: 4 } }}>
            <Text 
              variant="h2" 
              weight="bold" 
              align="center" 
              sx={{ 
                mb: { xs: 2, md: 3 },
                color: variant === 'gradient' || variant === 'hero' || variant === 'cta' ? 'white' : 'inherit',
                ...(variant === 'default' && {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                })
              }}
            >
              {title}
            </Text>
          </Box>
        )}
        
        {subtitle && (
          <Text 
            variant="h6" 
            align="center" 
            sx={{ 
              mb: { xs: 4, md: 6 },
              color: variant === 'gradient' || variant === 'hero' || variant === 'cta' 
                ? 'rgba(255,255,255,0.9)' 
                : 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              px: { xs: 1, md: 0 }, // Add small padding on mobile
              lineHeight: { xs: 1.5, md: 1.6 }
            }}
          >
            {subtitle}
          </Text>
        )}
        
        {children}
      </Box>
    </Box>
  );
};

export default Section;
