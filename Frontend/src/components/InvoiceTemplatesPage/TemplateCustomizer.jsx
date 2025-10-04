import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Divider,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import LayoutSelector from './LayoutSelector';
import ColorThemeSelector from './ColorThemeSelector';
import { INVOICE_LAYOUTS } from '../../utils/invoiceLayouts';
import { COLOR_THEMES } from '../../utils/colorThemes';

const TemplateCustomizer = ({ open, onClose, onSave, editingTemplate = null }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedLayout, setSelectedLayout] = useState('classic');
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const steps = ['Choose Layout', 'Select Colors', 'Preview & Save'];

  useEffect(() => {
    if (editingTemplate) {
      // Load existing template data
      try {
        const templateData = typeof editingTemplate.templateData === 'string' 
          ? JSON.parse(editingTemplate.templateData) 
          : editingTemplate.templateData;
        
        setSelectedLayout(templateData.layout || 'classic');
        setSelectedTheme(templateData.theme || 'blue');
        setTemplateName(editingTemplate.name || '');
        setTemplateDescription(editingTemplate.description || '');
      } catch (error) {
        console.error('Error parsing template data:', error);
      }
    } else {
      // Reset for new template
      setSelectedLayout('classic');
      setSelectedTheme('blue');
      setTemplateName('');
      setTemplateDescription('');
    }
  }, [editingTemplate]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleLayoutSelect = (layoutId) => {
    setSelectedLayout(layoutId);
  };

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
  };

  const generateTemplateName = () => {
    const layout = INVOICE_LAYOUTS[selectedLayout];
    const theme = COLOR_THEMES[selectedTheme];
    return `${layout.name} - ${theme.name}`;
  };

  const generateTemplateDescription = () => {
    const layout = INVOICE_LAYOUTS[selectedLayout];
    const theme = COLOR_THEMES[selectedTheme];
    return `${layout.description} with ${theme.name.toLowerCase()} color scheme.`;
  };

  const handleSave = () => {
    const templateData = {
      layout: selectedLayout,
      theme: selectedTheme,
      layoutStructure: INVOICE_LAYOUTS[selectedLayout].structure,
      colorTheme: COLOR_THEMES[selectedTheme],
      customization: {
        name: templateName || generateTemplateName(),
        description: templateDescription || generateTemplateDescription(),
        createdAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    const templateToSave = {
      name: templateName || generateTemplateName(),
      description: templateDescription || generateTemplateDescription(),
      templateData: JSON.stringify(templateData)
    };

    console.log('Saving template with data:', templateToSave);
    console.log('Template data object:', templateData);
    
    onSave(templateToSave);
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <LayoutSelector 
            onSelectLayout={handleLayoutSelect}
            selectedLayout={selectedLayout}
          />
        );
      case 1:
        return (
          <ColorThemeSelector 
            onSelectTheme={handleThemeSelect}
            selectedTheme={selectedTheme}
            selectedLayout={INVOICE_LAYOUTS[selectedLayout]?.name}
          />
        );
      case 2:
        return renderPreviewStep();
      default:
        return null;
    }
  };

  const renderPreviewStep = () => {
    const layout = INVOICE_LAYOUTS[selectedLayout];
    const theme = COLOR_THEMES[selectedTheme];

    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 3 }}>
          Preview Your Template
        </Typography>

        {/* Template Summary */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {templateName || generateTemplateName()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {templateDescription || generateTemplateDescription()}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip label={layout.name} color="primary" variant="outlined" />
                <Chip 
                  label={theme.name} 
                  sx={{ 
                    backgroundColor: theme.colors.primary + '20',
                    color: theme.colors.primary,
                    border: `1px solid ${theme.colors.primary}`
                  }} 
                />
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Layout Preview */}
            <Box display="flex" gap={3}>
              <Box flex={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Layout Features:
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">• {layout.description}</Typography>
                  <Typography variant="body2">• Header Style: {layout.structure.header.style}</Typography>
                  <Typography variant="body2">• Company Info: {layout.structure.companyInfo.position}</Typography>
                  <Typography variant="body2">• Items Display: {layout.structure.itemsTable.style}</Typography>
                </Stack>
              </Box>

              <Box flex={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Color Scheme:
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">{theme.description}</Typography>
                  <Box display="flex" gap={1}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        background: theme.colors.primary,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        background: theme.colors.secondary,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        background: theme.colors.accent,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Template Preview */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            background: theme.colors.background,
            border: `2px solid ${theme.colors.primary}20`
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: theme.colors.primary }}>
            Invoice Preview
          </Typography>
          
          {/* Simulated Invoice Header */}
          <Box
            sx={{
              height: 80,
              background: theme.gradients.header,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              mb: 3,
              color: 'white'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              INVOICE
            </Typography>
            <Typography variant="h6">
              #INV-001
            </Typography>
          </Box>

          {/* Simulated Content */}
          <Box display="flex" gap={3} mb={3}>
            <Box flex={1}>
              <Typography variant="subtitle2" sx={{ color: theme.colors.primary, fontWeight: 'bold', mb: 1 }}>
                FROM
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Your Company</Typography>
              <Typography variant="body2" color="text.secondary">company@email.com</Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2" sx={{ color: theme.colors.primary, fontWeight: 'bold', mb: 1 }}>
                TO
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Client Company</Typography>
              <Typography variant="body2" color="text.secondary">client@email.com</Typography>
            </Box>
          </Box>

          {/* Simulated Items */}
          <Paper elevation={1} sx={{ p: 2, background: 'white', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Items
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Website Development</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>$2,500.00</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.colors.primary }}>
                TOTAL
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.colors.primary }}>
                $2,500.00
              </Typography>
            </Box>
          </Paper>
        </Paper>

        <Alert severity="info" sx={{ mt: 3 }}>
          This is a preview of how your template will look. You can always edit it later from your templates page.
        </Alert>
      </Box>
    );
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: '100%',
          maxWidth: 1200,
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 2 }}>
            {editingTemplate ? 'Edit Template' : 'Create Custom Template'}
          </Typography>
          
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {renderStepContent()}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Box display="flex" justifyContent="space-between">
            <Button
              onClick={onClose}
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            
            <Box display="flex" gap={2}>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  startIcon={<BackIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Back
                </Button>
              )}
              
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ForwardIcon />}
                  disabled={activeStep === 0 && !selectedLayout || activeStep === 1 && !selectedTheme}
                  sx={{ textTransform: 'none' }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  startIcon={<SaveIcon />}
                  sx={{ 
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  }}
                >
                  Save Template
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TemplateCustomizer;
