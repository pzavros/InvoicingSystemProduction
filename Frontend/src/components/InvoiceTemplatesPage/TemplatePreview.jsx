import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import {
  Business as BusinessIcon,
  Palette as PaletteIcon,
  MinimizeOutlined as MinimalIcon
} from '@mui/icons-material';

const TemplatePreview = ({ template, isActive = false }) => {
  const theme = useTheme();
  
  // Debug logging
  console.log('Template received:', template);
  console.log('Template data:', template?.templateData);
  
  // Parse template data with better error handling
  let templateConfig = {};
  try {
    if (template?.templateData) {
      if (typeof template.templateData === 'string') {
        templateConfig = JSON.parse(template.templateData);
      } else if (typeof template.templateData === 'object') {
        templateConfig = template.templateData;
      }
    }
    console.log('Parsed template config:', templateConfig);
  } catch (error) {
    console.error('Error parsing template data:', error, 'Raw data:', template?.templateData);
    // Provide fallback config
    templateConfig = {
      theme: 'modern',
      primaryColor: '#2563eb',
      secondaryColor: '#f8fafc'
    };
  }

  // Get template icon and preview colors
  const getTemplateIcon = (themeName) => {
    switch (themeName) {
      case 'modern':
        return <BusinessIcon sx={{ fontSize: 40, color: templateConfig.primaryColor || '#2563eb' }} />;
      case 'creative':
        return <PaletteIcon sx={{ fontSize: 40, color: templateConfig.primaryColor || '#7c3aed' }} />;
      case 'minimal':
        return <MinimalIcon sx={{ fontSize: 40, color: templateConfig.primaryColor || '#000000' }} />;
      default:
        return <BusinessIcon sx={{ fontSize: 40, color: '#6b7280' }} />;
    }
  };

  const getPreviewCard = () => {
    const primaryColor = templateConfig.primaryColor || '#2563eb';
    const secondaryColor = templateConfig.secondaryColor || '#f8fafc';
    const themeName = templateConfig.theme || 'modern';

    return (
      <Card
        elevation={3}
        sx={{
          width: '100%',
          height: 200,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          border: isActive ? `2px solid ${primaryColor}` : '1px solid #e2e8f0',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            height: 60,
            background: themeName === 'creative' 
              ? templateConfig.headerGradient || 'linear-gradient(135deg, #7c3aed 0%, #f59e0b 50%, #10b981 100%)'
              : themeName === 'modern' 
                ? templateConfig.headerGradient || `linear-gradient(135deg, ${primaryColor} 0%, #1e40af 100%)`
                : secondaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            color: themeName === 'minimal' ? '#000' : '#fff'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
            INVOICE
          </Typography>
          <Box sx={{ fontSize: '12px', opacity: 0.9 }}>
            #{Math.floor(Math.random() * 10000)}
          </Box>
        </Box>

        {/* Content Section */}
        <CardContent sx={{ p: 2, height: 'calc(100% - 60px)' }}>
          <Stack spacing={1}>
            {/* Company Info Section */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="caption" sx={{ color: templateConfig.labelColor || '#6b7280', fontSize: '10px' }}>
                  FROM
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', color: templateConfig.bodyTextColor || '#374151' }}>
                  Your Company
                </Typography>
                <Typography variant="caption" sx={{ color: templateConfig.labelColor || '#6b7280', fontSize: '9px' }}>
                  company@email.com
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="caption" sx={{ color: templateConfig.labelColor || '#6b7280', fontSize: '10px' }}>
                  TO
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11px', color: templateConfig.bodyTextColor || '#374151' }}>
                  Client Name
                </Typography>
                <Typography variant="caption" sx={{ color: templateConfig.labelColor || '#6b7280', fontSize: '9px' }}>
                  client@email.com
                </Typography>
              </Box>
            </Box>

            {/* Items Table Preview */}
            <Box
              sx={{
                mt: 1,
                border: '1px solid #e2e8f0',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  background: templateConfig.tableHeaderBackground || '#f3f4f6',
                  p: 0.5,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 600, color: templateConfig.tableHeaderTextColor || '#374151' }}>
                  Item
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 600, color: templateConfig.tableHeaderTextColor || '#374151' }}>
                  Total
                </Typography>
              </Box>
              <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontSize: '9px', color: templateConfig.bodyTextColor || '#374151' }}>
                  Service Item
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '9px', color: templateConfig.bodyTextColor || '#374151' }}>
                  $500.00
                </Typography>
              </Box>
            </Box>

            {/* Total Section */}
            <Box
              sx={{
                background: templateConfig.totalBackgroundColor?.includes('gradient') 
                  ? templateConfig.totalBackgroundColor
                  : templateConfig.totalBackgroundColor || '#f9fafb',
                p: 0.5,
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 700, color: templateConfig.bodyTextColor || '#374151' }}>
                TOTAL
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 700, color: primaryColor }}>
                $500.00
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        {/* Template Theme Indicator */}
        {themeName === 'creative' && (
          <>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 20,
                height: 20,
                background: 'linear-gradient(45deg, #f59e0b, #10b981)',
                clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: 15,
                height: 15,
                background: 'linear-gradient(45deg, #7c3aed, #f59e0b)',
                clipPath: 'polygon(0 100%, 0 0, 100% 100%)'
              }}
            />
          </>
        )}
      </Card>
    );
  };

  // Handle case where template is not provided
  if (!template) {
    return (
      <Box sx={{ width: '100%', p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Template not available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Template Icon and Name */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        {getTemplateIcon(templateConfig.theme)}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '18px' }}>
            {template.name || 'Unknown Template'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            {templateConfig.theme || 'modern'} theme
          </Typography>
        </Box>
      </Box>

      {/* Template Preview */}
      {getPreviewCard()}

      {/* Template Features */}
      <Box mt={2}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {templateConfig.theme === 'modern' && (
            <>
              <Chip label="Professional" size="small" color="primary" variant="outlined" />
              <Chip label="Gradient Header" size="small" color="primary" variant="outlined" />
              <Chip label="Clean Layout" size="small" color="primary" variant="outlined" />
            </>
          )}
          {templateConfig.theme === 'creative' && (
            <>
              <Chip label="Colorful" size="small" color="secondary" variant="outlined" />
              <Chip label="Dynamic Design" size="small" color="secondary" variant="outlined" />
              <Chip label="Eye-catching" size="small" color="secondary" variant="outlined" />
            </>
          )}
          {templateConfig.theme === 'minimal' && (
            <>
              <Chip label="Minimalist" size="small" variant="outlined" />
              <Chip label="Clean Lines" size="small" variant="outlined" />
              <Chip label="Simple" size="small" variant="outlined" />
            </>
          )}
        </Stack>
      </Box>

      {/* Template Description */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '14px', lineHeight: 1.5 }}>
        {template.description || 'No description available'}
      </Typography>
    </Box>
  );
};

export default TemplatePreview;
