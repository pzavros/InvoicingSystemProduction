import React from 'react';
import { Box, Typography, Grow } from '@mui/material';

/**
 * Standardized page header component for consistent header styling across all pages
 * @param {string} title - Main title of the page
 * @param {string} subtitle - Subtitle/description of the page
 * @param {ReactNode} icon - Icon component to display
 * @param {string} gradientColors - Gradient colors for the icon background (e.g., '#4f46e5 0%, #7c3aed 100%')
 * @param {string} textGradientColors - Gradient colors for the title text (e.g., '#4338ca 0%, #7c3aed 100%')
 * @param {ReactNode} actions - Action buttons or components to display on the right
 * @param {ReactNode} extraContent - Additional content to display below title/subtitle
 * @param {boolean} animated - Whether to apply grow animation (default: true)
 * @param {number} animationTimeout - Animation duration in ms (default: 600)
 */
const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  gradientColors = '#4f46e5 0%, #7c3aed 100%',
  textGradientColors = '#4338ca 0%, #7c3aed 100%',
  borderGradientColors = '#4f46e5 0%, #7c3aed 50%, #3b82f6 100%',
  actions,
  extraContent,
  animated = true,
  animationTimeout = 600,
  sx = {},
  ...props
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 3,
        mb: 4,
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(79, 70, 229, 0.18)',
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${borderGradientColors})`,
          borderRadius: '3px 3px 0 0'
        },
        ...sx,
      }}
      {...props}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 280, flexGrow: 1 }}>
        {Icon && (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${gradientColors})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 18px rgba(79, 70, 229, 0.35)',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: 'white', fontSize: 26 }} />
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(135deg, ${textGradientColors})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: subtitle ? 0.5 : 0,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.secondary',
                fontWeight: 'medium'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {actions && (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {actions}
        </Box>
      )}

      {extraContent && (
        <Box sx={{ width: '100%', mt: 2 }}>
          {extraContent}
        </Box>
      )}
    </Box>
  );

  if (!animated) {
    return content;
  }

  return (
    <Grow in={true} timeout={animationTimeout}>
      {content}
    </Grow>
  );
};

export default PageHeader;
