import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
  Stack,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { COLOR_THEMES } from '../../utils/colorThemes';
import { getTemplateById } from './api';

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
          console.log('Preview Modal - Fresh template loaded:', freshTemplate);
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
      console.log('Preview Modal - Parsed template config:', templateConfig);
    }
  } catch (error) {
    console.error('Error parsing template data:', error);
    templateConfig = {};
  }

  const rawLayout = (templateConfig.layout || templateConfig.layoutId || '').toString().toLowerCase();
  
  // Fix theme parsing - support both old and new formats
  let rawTheme = '';
  if (templateConfig.colorTheme) {
    // New format: colorTheme is the ID string
    rawTheme = templateConfig.colorTheme.toString().toLowerCase();
  } else if (templateConfig.theme) {
    // Legacy format: theme could be name or ID
    rawTheme = templateConfig.theme.toString().toLowerCase();
  }
  
  const palette = COLOR_THEMES?.[rawTheme] || null;
  console.log('Preview Modal - Theme parsing:', { rawTheme, palette, availableThemes: Object.keys(COLOR_THEMES) });

  const colors = {
    primary: templateConfig.colors?.primary || palette?.colors?.primary || palette?.primary || '#2563eb',
    secondary: templateConfig.colors?.secondary || palette?.colors?.secondary || palette?.secondary || '#1e40af',
    accent: templateConfig.colors?.accent || palette?.colors?.accent || palette?.primary || '#3b82f6',
    background: templateConfig.colors?.background || palette?.colors?.background || '#f8fafc',
    surface: templateConfig.colors?.surface || palette?.colors?.surface || '#ffffff',
    text: templateConfig.colors?.text || palette?.colors?.text || '#1f2937',
    textSecondary: templateConfig.colors?.textSecondary || palette?.colors?.textSecondary || '#6b7280'
  };

  const previewVariant = (() => {
    const themeName = rawTheme;
    if (['creative', 'bold'].includes(rawLayout) || themeName === 'creative') return 'creative';
    if (['minimal', 'modern', 'simple'].includes(rawLayout) || ['minimal', 'modern'].includes(themeName)) return 'minimal';
    return 'classic';
  })();

  const headerGradient = templateConfig.headerGradient
    || palette?.gradients?.header
    || `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;

  const tableHeaderBackground = templateConfig.tableHeaderBackground
    || (previewVariant === 'creative'
      ? `linear-gradient(90deg, ${colors.primary}15, ${colors.accent}15)`
      : '#f8fafc');

  const totalsBackground = templateConfig.totalBackgroundColor
    || (previewVariant === 'creative'
      ? `linear-gradient(90deg, ${colors.primary}10, ${colors.accent}10)`
      : `${colors.secondary}20`);

  const chipLabel = palette?.name || (rawTheme ? `${rawTheme.charAt(0).toUpperCase()}${rawTheme.slice(1)}` : 'Custom');
  const layoutLabel = rawLayout ? `${rawLayout.charAt(0).toUpperCase()}${rawLayout.slice(1)}` : 'Classic';

  const headerBackground = templateConfig.headerBackground
    || (previewVariant === 'minimal' ? colors.surface : headerGradient);
  const headerTextColor = templateConfig.headerTextColor
    || (previewVariant === 'minimal' ? colors.primary : '#fff');

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

        {/* Full Invoice Preview */}
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            minHeight: 600,
            borderRadius: 2,
            overflow: 'hidden',
            border: `2px solid ${colors.primary}`
          }}
        >
          {/* Invoice Header */}
          <Box
            sx={{
              height: 120,
              background: headerBackground,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 4,
              py: 3,
              color: headerTextColor
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {(() => {
                  console.log('Preview Modal - Template config type:', templateConfig.type);
                  console.log('Preview Modal - Full template config:', templateConfig);
                  if (templateConfig.type === 'tax') return 'TAX INVOICE';
                  if (templateConfig.type === 'proforma') return 'PROFORMA INVOICE';
                  if (templateConfig.type === 'quote') return 'QUOTATION';
                  return 'INVOICE';
                })()}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {(templateConfig.type === 'quote' || templateToUse.name?.toLowerCase().includes('quotation')) 
                  ? 'Quote #QUO-2024-001' 
                  : 'Invoice #INV-2024-001'}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                $2,500.00
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Due: Oct 27, 2024
              </Typography>
            </Box>
          </Box>

          {/* Invoice Body */}
          <Box sx={{ p: 4 }}>
            {/* Company and Client Info */}
            <Box display="flex" justifyContent="space-between" mb={4}>
              <Box>
                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 'bold', mb: 2 }}>
                  FROM
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <BusinessIcon sx={{ color: colors.primary, fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Your Company Name
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                  123 Business Street
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  City, State 12345
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <EmailIcon sx={{ color: colors.accent, fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    hello@yourcompany.com
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon sx={{ color: colors.accent, fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    (555) 123-4567
                  </Typography>
                </Box>
              </Box>

              <Box textAlign="right">
                <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 'bold', mb: 2 }}>
                  BILL TO
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Client Company Inc.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                  456 Client Avenue
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Client City, State 67890
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  client@clientcompany.com
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  (555) 987-6543
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Invoice Details */}
            <Box display="flex" justifyContent="space-between" mb={4}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Invoice Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  September 27, 2024
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Due Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  October 27, 2024
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Payment Terms
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Net 30
                </Typography>
              </Box>
            </Box>

            {/* Items Table */}
            <Paper
              elevation={1}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                mb: 3
              }}
            >
              {/* Table Header */}
              <Box
                sx={{
                  background: tableHeaderBackground,
                  p: 2,
                  borderBottom: '1px solid #e2e8f0'
                }}
              >
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 2 }}>
                    Description
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, width: 80, textAlign: 'center' }}>
                    Qty
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, width: 100, textAlign: 'right' }}>
                    Rate
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, width: 120, textAlign: 'right' }}>
                    Amount
                  </Typography>
                </Box>
              </Box>

              {/* Table Rows */}
              <Box sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ flex: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Website Development
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Custom website with modern design and responsive layout
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ width: 80, textAlign: 'center' }}>1</Typography>
                  <Typography variant="body1" sx={{ width: 100, textAlign: 'right' }}>$1,500.00</Typography>
                  <Typography variant="body1" sx={{ width: 120, textAlign: 'right', fontWeight: 600 }}>$1,500.00</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ flex: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      SEO Optimization
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Search engine optimization and performance improvements
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ width: 80, textAlign: 'center' }}>1</Typography>
                  <Typography variant="body1" sx={{ width: 100, textAlign: 'right' }}>$500.00</Typography>
                  <Typography variant="body1" sx={{ width: 120, textAlign: 'right', fontWeight: 600 }}>$500.00</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box sx={{ flex: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Content Management Setup
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      CMS configuration and training
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ width: 80, textAlign: 'center' }}>1</Typography>
                  <Typography variant="body1" sx={{ width: 100, textAlign: 'right' }}>$500.00</Typography>
                  <Typography variant="body1" sx={{ width: 120, textAlign: 'right', fontWeight: 600 }}>$500.00</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Totals */}
            <Box display="flex" justifyContent="flex-end">
              <Box sx={{ width: 300 }}>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body1">Subtotal:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>$2,500.00</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body1">Tax (0%):</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>$0.00</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: totalsBackground
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.primary }}>
                    TOTAL:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.primary }}>
                    $2,500.00
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Payment Terms */}
            <Box mt={4} p={3} sx={{ background: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: colors.primary }}>
                Payment Terms & Notes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Payment is due within 30 days of invoice date. Late payments may incur additional fees. 
                Please include invoice number in payment reference. Thank you for your business!
              </Typography>
            </Box>
          </Box>

          {/* Theme Decorative Elements */}
          {previewVariant === 'creative' && (
            <>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 60,
                  height: 60,
                  background: colors.accent,
                  clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
                  opacity: 0.8
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: 40,
                  height: 40,
                  background: colors.secondary,
                  clipPath: 'polygon(0 100%, 0 0, 100% 100%)',
                  opacity: 0.8
                }}
              />
            </>
          )}
        </Paper>
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
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
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
