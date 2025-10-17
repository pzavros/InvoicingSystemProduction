import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';
import { COLOR_THEMES } from '../../utils/colorThemes';
import { getTemplateById } from './api';
import InvoiceTemplatePreview from './InvoiceTemplatePreview';

const TemplatePreviewModal = ({ open, onClose, template, onSetActive }) => {
  const [currentTemplate, setCurrentTemplate] = useState(template);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch fresh template data when modal opens
  useEffect(() => {
    const fetchFreshTemplate = async () => {
      if (open && template?.id) {
        setLoading(true);
        setError(null);
        try {
          const freshTemplate = await getTemplateById(template.id);
          setCurrentTemplate(freshTemplate);
        } catch (error) {
          console.error('Error fetching fresh template data:', error);
          setError('Failed to load latest template data. Showing cached version.');
          // Fallback to the passed template if fetch fails
          setCurrentTemplate(template);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFreshTemplate();
  }, [open, template?.id]);

  if (!template) return null;

  // Use currentTemplate for the preview content
  const templateToUse = currentTemplate || template;

  // Parse template data safely and support legacy & advanced formats
  let templateConfig = {};
  try {
    if (templateToUse.templateData) {
      templateConfig = typeof templateToUse.templateData === 'string'
        ? JSON.parse(templateToUse.templateData)
        : templateToUse.templateData;
    }
  } catch (error) {
    console.error('Error parsing template data:', error);
    templateConfig = {};
  }

  const layoutValue = templateConfig.layout?.id
    || templateConfig.layout?.key
    || templateConfig.layout
    || templateConfig.layoutKey
    || templateConfig.layoutName
    || '';
  const layoutKey = layoutValue ? layoutValue.toString().toLowerCase() : '';
  const layoutLabel = layoutKey ? `${layoutKey.charAt(0).toUpperCase()}${layoutKey.slice(1)}` : 'Classic';

  let themeValue = templateConfig.colorTheme || templateConfig.theme || '';
  if (themeValue && typeof themeValue === 'object') {
    themeValue = themeValue.id || themeValue.key || themeValue.name || '';
  }
  const themeKey = themeValue ? themeValue.toString().toLowerCase() : 'blue';
  const palette = COLOR_THEMES?.[themeKey] || {};

  const chipLabel = palette?.name || (themeKey ? `${themeKey.charAt(0).toUpperCase()}${themeKey.slice(1)}` : 'Custom');

  const primaryColor =
    templateConfig.customColors?.primary ||
    templateConfig.colors?.primary ||
    templateConfig.primaryColor ||
    palette.colors?.primary ||
    palette.primary ||
    '#2563eb';

  const secondaryColor =
    templateConfig.colors?.secondary ||
    templateConfig.secondaryColor ||
    palette.colors?.secondary ||
    palette.secondary ||
    '#1e40af';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
              {templateToUse.name} Preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {templateToUse.description}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        {loading ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading latest template data...
            </Typography>
          </Box>
        ) : (
          <>
            {error && (
              <Box mb={2}>
                <Chip 
                  label={error} 
                  color="warning" 
                  variant="outlined" 
                  sx={{ fontSize: '0.75rem' }} 
                />
              </Box>
            )}
            {/* Template Info */}
            <Box mb={3}>
              <Stack direction="row" spacing={1} mb={2}>
                <Chip 
                  label={`${chipLabel} theme`} 
                  color="primary" 
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
                <Chip
                  label={`${layoutLabel} layout`}
                  color="default"
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />
                {templateToUse.isSystemTemplate && (
                  <Chip label="System Template" color="info" variant="filled" />
                )}
                {templateToUse.isActive && (
                  <Chip label="Currently Active" color="success" variant="filled" />
                )}
              </Stack>
            </Box>

            <InvoiceTemplatePreview
              templateConfig={templateConfig}
              templateMeta={templateToUse}
              containerSx={{
                maxWidth: '100%',
                border: `2px solid ${primaryColor}`,
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                borderRadius: templateConfig.layout?.borderRadius || templateConfig.borderRadius || '12px'
              }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Close Preview
        </Button>
        {!templateToUse?.isActive && (
          <Button 
            variant="contained" 
            onClick={() => {
              onSetActive && onSetActive(templateToUse.id);
              onClose();
            }}
            sx={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              color: 'white'
            }}
          >
            Use This Template
          </Button>
        )}
        {templateToUse?.isActive && (
          <Button 
            variant="contained" 
            disabled
            sx={{
              background: '#22c55e',
              color: 'white',
              '&.Mui-disabled': {
                background: '#22c55e',
                color: 'white',
                opacity: 0.8
              }
            }}
          >
            Currently Active
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TemplatePreviewModal;
