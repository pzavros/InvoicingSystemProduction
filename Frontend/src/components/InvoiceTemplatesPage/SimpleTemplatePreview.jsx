import React from 'react';
import { Box, Typography, Card, CardContent, Stack } from '@mui/material';
import {
  Business as BusinessIcon,
  Palette as PaletteIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { COLOR_THEMES } from '../../utils/colorThemes';

const SimpleTemplatePreview = ({ template, isActive = false, variant = 'default' }) => {
  if (!template) {
    return (
      <Box sx={{ width: '100%', p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Template not available
        </Typography>
      </Box>
    );
  }

  const normalizeTemplateData = (raw) => {
    let value = raw;
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (error) {
        console.error('Error parsing template data string:', error);
        return {};
      }
    }

    if (!value || typeof value !== 'object') {
      return {};
    }

    if (value.layout || value.theme || value.colorTheme) {
      return value;
    }

    const nestedKeys = ['templateData', 'data', 'config', 'template', 'payload'];
    for (const key of nestedKeys) {
      if (value[key]) {
        const nested = normalizeTemplateData(value[key]);
        if (Object.keys(nested).length > 0) {
          return { ...value, ...nested };
        }
      }
    }

    return value;
  };

  const resolveIdentifier = (value, fallback) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (value && typeof value === 'object') {
      if (typeof value.id === 'string') return value.id;
      if (typeof value.key === 'string') return value.key;
      if (typeof value.name === 'string') return value.name;
    }
    return fallback;
  };

  const templateConfig = normalizeTemplateData(template.templateData);
  const layoutKey = resolveIdentifier(
    templateConfig.layout ?? templateConfig.layoutId ?? templateConfig.layoutKey ?? templateConfig.layoutName,
    'classic'
  );
  const themeKey = resolveIdentifier(
    templateConfig.theme ?? templateConfig.themeId ?? templateConfig.themeKey ?? templateConfig.themeName,
    templateConfig.colorTheme?.id ?? 'blue'
  );

  const palette = templateConfig.colorTheme
    || (typeof themeKey === 'string' && COLOR_THEMES[themeKey.toLowerCase()])
    || null;

  const colors = {
    primary: palette?.colors?.primary || templateConfig.primaryColor || '#2563eb',
    secondary: palette?.colors?.secondary || templateConfig.secondaryColor || '#1e40af',
    accent: palette?.colors?.accent || templateConfig.accentColor || '#3b82f6',
    label: palette?.colors?.textSecondary || templateConfig.labelColor || '#6b7280',
    body: palette?.colors?.text || templateConfig.bodyTextColor || '#374151'
  };

  const layoutName = layoutKey.toString().toLowerCase();
  const themeName = (themeKey || 'blue').toString().toLowerCase();
  const isCompact = variant === 'compact';

  const headerBackground = templateConfig.headerBackground
    || palette?.gradients?.header
    || (themeName === 'creative'
      ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 60%, ${colors.accent} 100%)`
      : themeName === 'minimal'
        ? colors.secondary
        : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`);

  const headerTextColor = templateConfig.headerTextColor
    || (themeName === 'minimal' ? colors.primary : '#fff');
  const totalBackground = templateConfig.totalBackgroundColor
    || (themeName === 'creative'
      ? `linear-gradient(120deg, ${colors.primary}24, ${colors.accent}24)`
      : '#f8fafc');

  const getTemplateIcon = () => {
    switch (layoutName) {
      case 'creative':
        return <PaletteIcon sx={{ fontSize: isCompact ? 26 : 32, color: colors.primary }} />;
      case 'modern':
      case 'minimal':
        return <CircleIcon sx={{ fontSize: isCompact ? 26 : 32, color: colors.primary }} />;
      default:
        return <BusinessIcon sx={{ fontSize: isCompact ? 26 : 32, color: colors.primary }} />;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: isCompact ? 1 : 2
      }}
    >
      {!isCompact && (
        <Box display="flex" alignItems="center" gap={isCompact ? 1 : 2}>
          {getTemplateIcon()}
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                fontSize: '16px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {template.name || 'Unnamed Template'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: colors.label, textTransform: 'capitalize' }}
            >
              {layoutName} • {themeName} theme
            </Typography>
          </Box>
        </Box>
      )}

      <Card
        elevation={isCompact ? 0 : 3}
        sx={{
          flexGrow: 1,
          borderRadius: 2,
          border: isActive
            ? `2px solid ${colors.primary}`
            : '1px solid rgba(226, 232, 240, 0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff'
        }}
      >
        <Box
          sx={{
            height: isCompact ? 32 : 40,
            background: headerBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: isCompact ? 1.5 : 2,
            color: headerTextColor
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 'bold', fontSize: isCompact ? '10px' : '12px' }}
          >
            INVOICE
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: isCompact ? '9px' : '10px' }}>
            #001
          </Typography>
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            p: isCompact ? 1 : 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: isCompact ? 0.75 : 1.25
          }}
        >
          <Stack spacing={isCompact ? 0.75 : 1.25} sx={{ flexGrow: 1 }}>
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="caption" sx={{ color: colors.label, fontSize: isCompact ? '8px' : '9px' }}>
                  FROM
                </Typography>
                <Typography variant="body2" sx={{ fontSize: isCompact ? '10px' : '11px', fontWeight: 600, color: colors.body }}>
                  Your Company
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="caption" sx={{ color: colors.label, fontSize: isCompact ? '8px' : '9px' }}>
                  TO
                </Typography>
                <Typography variant="body2" sx={{ fontSize: isCompact ? '10px' : '11px', fontWeight: 600, color: colors.body }}>
                  Client Name
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ background: templateConfig.tableHeaderBackground || '#f3f4f6', p: isCompact ? 0.4 : 0.6 }}>
                <Typography variant="caption" sx={{ fontSize: isCompact ? '8px' : '9px', fontWeight: 600 }}>
                  Items
                </Typography>
              </Box>
              <Box sx={{ p: isCompact ? 0.4 : 0.6 }}>
                <Typography variant="caption" sx={{ fontSize: isCompact ? '8px' : '9px', color: colors.body }}>
                  Service • $500.00
                </Typography>
              </Box>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                background: totalBackground,
                p: isCompact ? 0.5 : 0.75,
                borderRadius: 1
              }}
            >
              <Typography variant="caption" sx={{ fontSize: isCompact ? '9px' : '10px', fontWeight: 700 }}>
                TOTAL
              </Typography>
              <Typography variant="caption" sx={{ fontSize: isCompact ? '9px' : '10px', fontWeight: 700, color: colors.primary }}>
                $500.00
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleTemplatePreview;
