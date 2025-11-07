// src/components/TemplateFormPage/TemplateForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  CircularProgress,
  IconButton,
  Alert,
  FormLabel,
  OutlinedInput,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Palette as PaletteIcon,
  Visibility as PreviewIcon
} from "@mui/icons-material";
import { 
  createTemplate, 
  updateTemplate, 
  getTemplateById,
  getDocumentTypes
} from "../InvoiceTemplatesPage/api";
import { COLOR_THEMES } from "../../utils/colorThemes";
import InvoiceTemplatePreview from "../InvoiceTemplatesPage/InvoiceTemplatePreview";
import { useSubscription } from "../../utils/SubscriptionContext";

/** ---------- Form Components ---------- **/
const FormGrid = ({ size, children }) => (
  <Grid size={size}>
    {children}
  </Grid>
);

const SectionTitle = ({ children }) => (
  <FormGrid size={{ xs: 12 }}>
    <Typography variant="h6" sx={{ 
      fontWeight: 600, 
      color: 'rgba(15, 23, 42, 0.95)', 
      mb: 2,
      mt: 3,
      fontSize: '1rem',
      letterSpacing: '-0.02em',
      borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
      pb: 1.5
    }}>
      {children}
    </Typography>
  </FormGrid>
);

/** -------------------------------------------------------------------- **/

const TemplateForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { canCreate } = useSubscription();
  const canCreateTemplate = canCreate?.template !== false;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "standard",
    colorTheme: "blue",
    fontStyle: "modern",
    borderRadius: "12px",
    documentTypeId: null,
    isActive: false,
    sections: {
      showLogo: true,
      showCompanyLogo: true,
      showInvoiceHeader: true,
      showCompanyInfo: true,
      showCompanyDetails: true,
      showClientDetails: true,
      showBankDetails: true,
      showBankInfo: true,
      showDates: true,
      showItemsTable: true,
      showTotals: true,
      showAmountDueBox: true,
      showTax: true,
      showDiscount: true,
      showNotes: true,
      tableBorder: true,
      tableStyle: "rounded",
      alternateRowColors: true,
      bankInfoBackground: true
    },
    logoSettings: {
      showLogo: true,
      size: "medium",
      style: "square"
    },
    footerSettings: {
      showFooter: false,
      text: "",
      alignment: "center",
      style: "normal"
    },
    customColors: {
      primary: ""
    },
    disclaimer: ""
  });

  const [documentTypes, setDocumentTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    severity: "success"
  });


  useEffect(() => {
    // Check if user has permission to create/edit templates
    if (!canCreateTemplate) {
      setNotification({
        show: true,
        message: "Templates are a premium feature. Upgrade to premium to create and edit custom templates.",
        severity: "warning"
      });
      setTimeout(() => {
        navigate("/templates");
      }, 2000);
      return;
    }
    
    const initializeData = async () => {
      const types = await fetchDocumentTypes();
      if (isEditing) await loadTemplate(types);
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing, canCreateTemplate]);

  const fetchDocumentTypes = async () => {
    try {
      const types = await getDocumentTypes();
      setDocumentTypes(types);
      // Set default document type if creating new template
      if (!isEditing && types.length > 0) {
        const defaultDocType = types[0];
        const typeMapping = {
          'Invoice': 'standard',
          'Tax Invoice': 'tax', 
          'Proforma': 'proforma',
          'Quotation': 'quote',
          'Cash Invoice': 'cash'
        };
        const mappedType = typeMapping[defaultDocType.displayName] || 'standard';
        
        setFormData(prev => ({
          ...prev,
          documentTypeId: defaultDocType.id,
          type: mappedType
        }));
      }
      return types;
    } catch (error) {
      setNotification({
        show: true,
        message: "Error loading document types: " + error.message,
        severity: "error"
      });
      return [];
    }
  };

  const loadTemplate = async (types = documentTypes) => {
    try {
      setLoading(true);
      const template = await getTemplateById(id);
      console.log('Loaded template:', template);
      
      // Parse the template data if it exists
      let parsedConfig = {};
      if (template.templateData) {
        try {
          parsedConfig = typeof template.templateData === 'string'
            ? JSON.parse(template.templateData)
            : template.templateData;
          console.log('Parsed config:', parsedConfig);
        } catch (e) {
          console.warn('Failed to parse template data:', e);
        }
      }

      // Map documentTypeId to type for consistency
      let mappedType = parsedConfig.type || "standard";
      if (template.documentTypeId && types.length > 0) {
        const docType = types.find(dt => dt.id === template.documentTypeId);
        if (docType) {
          const typeMapping = {
            'Invoice': 'standard',
            'Tax Invoice': 'tax', 
            'Proforma': 'proforma',
            'Quotation': 'quote',
            'Cash Invoice': 'cash'
          };
          mappedType = typeMapping[docType.displayName] || mappedType;
        }
      }

      const showInvoiceHeader = parsedConfig.sections?.showInvoiceHeader ?? true;
      const showCompanyDetails = parsedConfig.sections?.showCompanyDetails ?? parsedConfig.sections?.showCompanyInfo ?? true;
      const showClientDetails = parsedConfig.sections?.showClientDetails ?? true;
      const showBankDetails = parsedConfig.sections?.showBankDetails ?? parsedConfig.sections?.showBankInfo ?? true;
      const showLogo = parsedConfig.sections?.showLogo ?? parsedConfig.sections?.showCompanyLogo ?? parsedConfig.logoSettings?.showLogo ?? true;

      setFormData({
        name: template.name || "",
        description: template.description || "",
        type: mappedType,
        colorTheme: parsedConfig.colorTheme || parsedConfig.theme || "blue",
        fontStyle: parsedConfig.fontStyle || parsedConfig.typography?.fontFamily || "modern",
        borderRadius: parsedConfig.layout?.borderRadius || "12px",
        documentTypeId: template.documentTypeId || null,
        isActive: template.isActive || false,
        sections: {
          showLogo: showLogo,
          showCompanyLogo: parsedConfig.sections?.showCompanyLogo ?? showLogo,
          showInvoiceHeader,
          showCompanyInfo: showCompanyDetails,
          showCompanyDetails: showCompanyDetails,
          showClientDetails,
          showBankDetails: showBankDetails,
          showBankInfo: showBankDetails,
          showDates: parsedConfig.sections?.showDates ?? true,
          showItemsTable: parsedConfig.sections?.showItemsTable ?? true,
          showTotals: parsedConfig.sections?.showTotals ?? true,
          showAmountDueBox: parsedConfig.sections?.showAmountDueBox ?? true,
          showTax: parsedConfig.sections?.showTax ?? true,
          showDiscount: parsedConfig.sections?.showDiscount ?? true,
          showNotes: parsedConfig.sections?.showNotes ?? true,
          tableBorder: parsedConfig.sections?.tableBorder ?? true,
          tableStyle: parsedConfig.sections?.tableStyle || "rounded",
          alternateRowColors: parsedConfig.sections?.alternateRowColors ?? true,
          bankInfoBackground: parsedConfig.sections?.bankInfoBackground ?? true
        },
        logoSettings: {
          showLogo: showLogo,
          size: parsedConfig.logoSettings?.size || "medium",
          style: parsedConfig.logoSettings?.style || "square"
        },
        footerSettings: {
          showFooter: parsedConfig.footerSettings?.showFooter ?? false,
          text: parsedConfig.footerSettings?.text || "",
          alignment: parsedConfig.footerSettings?.alignment || "center",
          style: parsedConfig.footerSettings?.style || "normal"
        },
        customColors: {
          primary: parsedConfig.customColors?.primary || ""
        },
        disclaimer: parsedConfig.disclaimer || ""
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Error loading template: " + error.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Handle nested object updates
  const handleSectionChange = (field, value) => {
    setFormData(prev => {
      const updatedSections = {
        ...prev.sections,
        [field]: value
      };

      if (field === 'showCompanyInfo' || field === 'showCompanyDetails') {
        updatedSections.showCompanyInfo = value;
        updatedSections.showCompanyDetails = value;
      }

      if (field === 'showBankInfo' || field === 'showBankDetails') {
        updatedSections.showBankInfo = value;
        updatedSections.showBankDetails = value;
      }

      if (field === 'showLogo' || field === 'showCompanyLogo') {
        updatedSections.showLogo = value;
        updatedSections.showCompanyLogo = value;
      }

      return {
        ...prev,
        sections: updatedSections
      };
    });
  };

  const handleLogoChange = (field, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        logoSettings: {
          ...prev.logoSettings,
          [field]: value
        }
      };

      if (field === 'showLogo') {
        updated.sections = {
          ...prev.sections,
          showLogo: value,
          showCompanyLogo: value
        };
      }

      return updated;
    });
  };

  const handleFooterChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      footerSettings: {
        ...prev.footerSettings,
        [field]: value
      }
    }));
  };

  const handleColorChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }

    if (!formData.documentTypeId) {
      newErrors.documentTypeId = "Document type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateTemplateData = () => {
    const selectedTheme = COLOR_THEMES[formData.colorTheme];
    
    return {
      type: formData.type,
      colorTheme: formData.colorTheme,
      fontStyle: formData.fontStyle,
      theme: selectedTheme?.name || 'Professional Blue',
      colors: {
        primary: selectedTheme?.colors?.primary || selectedTheme?.primary || '#2563eb',
        secondary: selectedTheme?.colors?.secondary || selectedTheme?.secondary || '#1e40af',
        accent: selectedTheme?.colors?.primary || selectedTheme?.primary || '#2563eb',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#1f2937',
        textSecondary: '#6b7280'
      },
      typography: {
        fontFamily: formData.fontStyle
      },
      sections: {
        showLogo: formData.sections?.showLogo ?? formData.sections?.showCompanyLogo ?? formData.logoSettings?.showLogo ?? true,
        showCompanyLogo: formData.sections?.showCompanyLogo ?? formData.sections?.showLogo ?? formData.logoSettings?.showLogo ?? true,
        showInvoiceHeader: formData.sections?.showInvoiceHeader ?? true,
        showCompanyInfo: formData.sections?.showCompanyDetails ?? formData.sections?.showCompanyInfo ?? true,
        showCompanyDetails: formData.sections?.showCompanyDetails ?? formData.sections?.showCompanyInfo ?? true,
        showClientDetails: formData.sections?.showClientDetails ?? true,
        showBankDetails: formData.sections?.showBankDetails ?? formData.sections?.showBankInfo ?? true,
        showBankInfo: formData.sections?.showBankInfo ?? formData.sections?.showBankDetails ?? true,
        showDates: formData.sections?.showDates ?? true,
        showItemsTable: formData.sections?.showItemsTable ?? true,
        showTotals: formData.sections?.showTotals ?? true,
        showAmountDueBox: formData.sections?.showAmountDueBox ?? true,
        showTax: formData.sections?.showTax ?? true,
        showDiscount: formData.sections?.showDiscount ?? true,
        showNotes: formData.sections?.showNotes ?? true,
        tableBorder: formData.sections?.tableBorder ?? true,
        tableStyle: formData.sections?.tableStyle || "rounded",
        alternateRowColors: formData.sections?.alternateRowColors ?? true,
        bankInfoBackground: formData.sections?.bankInfoBackground ?? true
      },
      logoSettings: {
        showLogo: formData.logoSettings?.showLogo ?? true,
        size: formData.logoSettings?.size || "medium",
        style: formData.logoSettings?.style || "square"
      },
      footerSettings: {
        showFooter: formData.footerSettings?.showFooter ?? false,
        text: formData.footerSettings?.text || "",
        alignment: formData.footerSettings?.alignment || "center",
        style: formData.footerSettings?.style || "normal"
      },
      customColors: {
        primary: formData.customColors?.primary || ""
      },
      layout: {
        borderRadius: formData.borderRadius,
        spacing: formData.spacing
      },
      disclaimer: formData.disclaimer || ""
    };
  };

  const previewConfig = generateTemplateData();

  const handleSave = async () => {
    // Check if user has permission to create/edit templates
    if (!canCreateTemplate) {
      setNotification({
        show: true,
        message: "Templates are a premium feature. Upgrade to premium to create and edit custom templates.",
        severity: "error"
      });
      return;
    }
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      const templateData = generateTemplateData();
      console.log('Generated template data:', templateData);
      
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        templateData: JSON.stringify(templateData),
        documentTypeId: formData.documentTypeId,
        isActive: formData.isActive
      };
      console.log('Save payload:', payload);
      console.log('Template data being saved:', templateData);

      if (isEditing) {
        await updateTemplate(id, payload);
        setNotification({
          show: true,
          message: "Template updated successfully! 🎨",
          severity: "success"
        });
      } else {
        await createTemplate(payload);
        setNotification({
          show: true,
          message: "Template created successfully! 🎨",
          severity: "success"
        });
      }

      // Navigate back after short delay
      setTimeout(() => {
        navigate("/templates");
      }, 1500);
    } catch (error) {
      setNotification({
        show: true,
        message: `Failed to ${isEditing ? 'update' : 'create'} template: ${error.message}`,
        severity: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/templates");
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pl: 3, pt: 3, pr: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        pb: 2,
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
      }}>
        <IconButton 
          onClick={handleBack}
          sx={{ 
            mr: 2,
            width: 40,
            height: 40,
            borderRadius: '10px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.02)',
            color: 'rgba(15, 23, 42, 0.65)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.06)',
              borderColor: 'rgba(15, 23, 42, 0.12)',
              color: 'rgba(15, 23, 42, 0.85)'
            }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            color: 'rgba(15, 23, 42, 0.95)',
            fontSize: { xs: '1.5rem', sm: '2rem' },
            letterSpacing: '-0.02em',
            mb: 0.5
          }}>
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </Typography>
          <Typography variant="body2" sx={{
            color: 'rgba(15, 23, 42, 0.55)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            {isEditing ? 'Update your custom invoice template' : 'Design a custom invoice template for your business'}
          </Typography>
        </Box>
      </Box>

      {/* Notification */}
      {notification.show && (
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, show: false })}
          sx={{ 
            mb: 2,
            borderRadius: '12px',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            '& .MuiAlert-icon': {
              color: notification.severity === 'success' ? '#10b981' : 
                     notification.severity === 'error' ? '#ef4444' : '#8b5cf6'
            }
          }}
        >
          {notification.message}
        </Alert>
      )}

      {/* Form */}
      <Box component="form">
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
            {/* Basic Information */}
            <SectionTitle>Basic Information</SectionTitle>
            
            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormLabel sx={{ 
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 0.5,
                display: 'block'
              }}>
                Template Name *
              </FormLabel>
              <OutlinedInput
                fullWidth
                size="small"
                placeholder="e.g., Professional Blue Template"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.name ? '#ef4444' : 'rgba(15, 23, 42, 0.08)',
                    borderWidth: '1px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.name ? '#ef4444' : 'rgba(15, 23, 42, 0.15)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.name ? '#ef4444' : 'rgba(15, 23, 42, 0.25)',
                    borderWidth: '1.5px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '9px 12px'
                  }
                }}
              />
              {errors.name && (
                <Typography variant="caption" sx={{ 
                  mt: 0.5, 
                  display: 'block',
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  {errors.name}
                </Typography>
              )}
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormLabel sx={{ 
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 0.5,
                display: 'block'
              }}>
                Document Type *
              </FormLabel>
              <FormControl fullWidth size="small" error={!!errors.documentTypeId}>
                <Select
                  value={formData.documentTypeId || ''}
                  onChange={(e) => {
                    const selectedDocType = documentTypes.find(dt => dt.id === e.target.value);
                    handleInputChange('documentTypeId', e.target.value);
                    // Update the type field based on document type for backward compatibility
                    if (selectedDocType) {
                      const typeMapping = {
                        'Invoice': 'standard',
                        'Tax Invoice': 'tax', 
                        'Proforma': 'proforma',
                        'Quotation': 'quote',
                        'Cash Invoice': 'cash'
                      };
                      const mappedType = typeMapping[selectedDocType.displayName] || 'standard';
                      handleInputChange('type', mappedType);
                    }
                  }}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.08)',
                      borderWidth: '1px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.15)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.25)',
                      borderWidth: '1.5px'
                    },
                    '& .MuiSelect-select': {
                      padding: '9px 12px'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: '12px',
                        mt: 0.5,
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                        border: '1px solid rgba(15, 23, 42, 0.06)',
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          borderRadius: '8px',
                          mx: 1,
                          my: 0.5,
                          '&:hover': {
                            backgroundColor: 'rgba(139, 92, 246, 0.04)'
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(139, 92, 246, 0.12)'
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="" disabled>Select Document Type</MenuItem>
                  {documentTypes.map((docType) => (
                    <MenuItem key={docType.id} value={docType.id}>
                      {docType.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.documentTypeId && (
                <Typography variant="caption" sx={{ 
                  mt: 0.5, 
                  display: 'block',
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  {errors.documentTypeId}
                </Typography>
              )}
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormLabel sx={{ 
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 0.5,
                display: 'block'
              }}>
                Color Theme
              </FormLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.colorTheme}
                  onChange={(e) => handleInputChange('colorTheme', e.target.value)}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.08)',
                      borderWidth: '1px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.15)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.25)',
                      borderWidth: '1.5px'
                    },
                    '& .MuiSelect-select': {
                      padding: '9px 12px'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: '12px',
                        mt: 0.5,
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                        border: '1px solid rgba(15, 23, 42, 0.06)',
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          borderRadius: '8px',
                          mx: 1,
                          my: 0.5,
                          '&:hover': {
                            backgroundColor: 'rgba(139, 92, 246, 0.04)'
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(139, 92, 246, 0.12)'
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  {Object.values(COLOR_THEMES).map((theme) => (
                    <MenuItem key={theme.id} value={theme.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '4px',
                            background: theme.gradients.header
                          }}
                        />
                        {theme.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FormGrid>



            <FormGrid size={{ xs: 12 }}>
              <FormLabel sx={{ 
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 0.5,
                display: 'block'
              }}>
                Description
              </FormLabel>
              <OutlinedInput
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder="Describe this template's style and when to use it..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(15, 23, 42, 0.08)',
                    borderWidth: '1px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(15, 23, 42, 0.15)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(15, 23, 42, 0.25)',
                    borderWidth: '1.5px'
                  },
                  '& .MuiInputBase-input': {
                    padding: '9px 12px'
                  }
                }}
              />
            </FormGrid>

            {/* Design Settings */}
            <SectionTitle>Design Settings</SectionTitle>
            
            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormLabel sx={{ 
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 0.5,
                display: 'block'
              }}>
                Font Family
              </FormLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.fontStyle}
                  onChange={(e) => handleInputChange('fontStyle', e.target.value)}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.08)',
                      borderWidth: '1px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.15)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.25)',
                      borderWidth: '1.5px'
                    },
                    '& .MuiSelect-select': {
                      padding: '9px 12px'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: '12px',
                        mt: 0.5,
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                        border: '1px solid rgba(15, 23, 42, 0.06)',
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          borderRadius: '8px',
                          mx: 1,
                          my: 0.5,
                          '&:hover': {
                            backgroundColor: 'rgba(139, 92, 246, 0.04)'
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(139, 92, 246, 0.12)'
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="modern">Modern (Inter)</MenuItem>
                  <MenuItem value="classic">Classic (Times New Roman)</MenuItem>
                  <MenuItem value="elegant">Elegant (Georgia)</MenuItem>
                  <MenuItem value="minimal">Minimal (Arial)</MenuItem>
                </Select>
              </FormControl>
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormLabel sx={{ 
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 0.5,
                display: 'block'
              }}>
                Border Radius
              </FormLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.borderRadius}
                  onChange={(e) => handleInputChange('borderRadius', e.target.value)}
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.08)',
                      borderWidth: '1px'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.15)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(15, 23, 42, 0.25)',
                      borderWidth: '1.5px'
                    },
                    '& .MuiSelect-select': {
                      padding: '9px 12px'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: '12px',
                        mt: 0.5,
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                        border: '1px solid rgba(15, 23, 42, 0.06)',
                        '& .MuiMenuItem-root': {
                          fontSize: '0.875rem',
                          borderRadius: '8px',
                          mx: 1,
                          my: 0.5,
                          '&:hover': {
                            backgroundColor: 'rgba(139, 92, 246, 0.04)'
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(139, 92, 246, 0.12)'
                            }
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="0px">Sharp (0px)</MenuItem>
                  <MenuItem value="8px">Subtle (8px)</MenuItem>
                  <MenuItem value="12px">Modern (12px)</MenuItem>
                  <MenuItem value="16px">Rounded (16px)</MenuItem>
                </Select>
              </FormControl>
            </FormGrid>

            {/* Section Visibility */}
            <SectionTitle>Sections to Include</SectionTitle>
            
            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.logoSettings?.showLogo ?? true}
                    onChange={(e) => handleLogoChange('showLogo', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Company Logo"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sections?.showInvoiceHeader ?? true}
                    onChange={(e) => handleSectionChange('showInvoiceHeader', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Invoice Header"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sections?.showCompanyDetails ?? true}
                    onChange={(e) => handleSectionChange('showCompanyDetails', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Company Details"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sections?.showClientDetails ?? true}
                    onChange={(e) => handleSectionChange('showClientDetails', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Client Details"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sections?.showBankDetails ?? true}
                    onChange={(e) => handleSectionChange('showBankDetails', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Bank Details"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sections?.showNotes ?? true}
                    onChange={(e) => handleSectionChange('showNotes', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Notes Section"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sections?.showDates ?? true}
                    onChange={(e) => handleSectionChange('showDates', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Invoice Dates"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sections?.showItemsTable ?? true}
                    onChange={(e) => handleSectionChange('showItemsTable', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Items Table"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sections?.showTotals ?? true}
                    onChange={(e) => handleSectionChange('showTotals', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Totals Section"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sections?.showAmountDueBox ?? true}
                    onChange={(e) => handleSectionChange('showAmountDueBox', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Amount Due Summary"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sections?.tableBorder ?? true}
                    onChange={(e) => handleSectionChange('tableBorder', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#667eea',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#667eea',
                      },
                    }}
                  />
                }
                label="Show Table Borders"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
            </FormGrid>

            {/* Disclaimer Customization - Only for Quotation and Proforma */}
            {(formData.type === 'quote' || formData.type === 'proforma') && (
              <>
                <SectionTitle>Disclaimer Settings</SectionTitle>
                
                <FormGrid size={{ xs: 12 }}>
                  <FormLabel sx={{ 
                    color: 'rgba(15, 23, 42, 0.75)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    mb: 0.5,
                    display: 'block'
                  }}>
                    Disclaimer Text
                  </FormLabel>
                  <OutlinedInput
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    placeholder={formData.type === 'quote' 
                      ? "Enter disclaimer text for quotations (e.g., validity period, terms & conditions)..." 
                      : "Enter disclaimer text for proforma invoices (e.g., informational purposes, not a tax invoice)..."}
                    value={formData.disclaimer}
                    onChange={(e) => handleInputChange('disclaimer', e.target.value)}
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        borderWidth: '1px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.15)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(15, 23, 42, 0.25)',
                        borderWidth: '1.5px'
                      },
                      '& .MuiInputBase-input': {
                        padding: '9px 12px'
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ 
                    display: 'block', 
                    color: 'rgba(15, 23, 42, 0.55)', 
                    mt: 0.5,
                    fontSize: '0.75rem'
                  }}>
                    This disclaimer will appear at the bottom of {formData.type === 'quote' ? 'quotation' : 'proforma invoice'} documents
                  </Typography>
                </FormGrid>
              </>
            )}

            {/* Status */}
            <SectionTitle>Template Status</SectionTitle>
            
            <FormGrid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8b5cf6'
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8b5cf6'
                      }
                    }}
                  />
                }
                label="Set as Active Template"
                sx={{ 
                  color: 'rgba(15, 23, 42, 0.75)', 
                  fontWeight: 500,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem'
                  }
                }}
              />
              <Typography variant="caption" sx={{ 
                display: 'block', 
                color: 'rgba(15, 23, 42, 0.55)', 
                mt: 0.5,
                fontSize: '0.75rem'
              }}>
                The active template will be used by default for new invoices
              </Typography>
            </FormGrid>
          </Grid>

          {/* Preview Section */}
          <Box sx={{ 
            mt: 4,
            pt: 4,
            borderTop: '1px solid rgba(15, 23, 42, 0.08)'
          }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: 'rgba(15, 23, 42, 0.95)',
                fontSize: '1rem',
                letterSpacing: '-0.02em'
              }}>
                Preview
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(15, 23, 42, 0.55)', 
                mt: 0.5,
                fontSize: '0.875rem'
              }}>
                See how your template will look in real invoices
              </Typography>
            </Box>

            {/* Preview Container */}
            <Box
              sx={{
                border: '1px solid rgba(15, 23, 42, 0.08)',
                borderRadius: '14px',
                overflow: 'hidden',
                backgroundColor: '#f8fafc',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                p: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
              }}
            >
              <Box
                sx={{
                  transform: 'scale(0.85)',
                  transformOrigin: 'top center',
                  width: '117.647%', // 100% / 0.85 to account for scale
                  maxWidth: '850px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                  overflow: 'hidden',
                  p: 3
                }}
              >
                <InvoiceTemplatePreview
                  templateConfig={previewConfig}
                  templateMeta={{ name: formData.name || '' }}
                  containerSx={{
                    maxWidth: '100%',
                    boxShadow: 'none',
                    border: 'none',
                    p: 0,
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            pt: 2.5,
            mt: 4,
            mb: 3,
            borderTop: '1px solid rgba(15, 23, 42, 0.08)',
            justifyContent: { xs: 'stretch', sm: 'flex-end' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Button
              onClick={handleBack}
              disabled={saving}
              variant="outlined"
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(15, 23, 42, 0.12)',
                backgroundColor: 'white',
                letterSpacing: '-0.01em',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(15, 23, 42, 0.02)',
                  borderColor: 'rgba(15, 23, 42, 0.2)',
                  color: 'rgba(15, 23, 42, 0.85)'
                }
              }}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SaveIcon sx={{ fontSize: '1.125rem' }} />}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '-0.01em',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 1px 3px rgba(139, 92, 246, 0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)',
                  transform: 'translateY(-1px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                },
                '&:disabled': {
                  background: 'rgba(15, 23, 42, 0.08)',
                  color: 'rgba(15, 23, 42, 0.35)',
                  boxShadow: 'none'
                }
              }}
            >
              {saving ? 'Saving...' : (isEditing ? 'Update Template' : 'Create Template')}
            </Button>
          </Box>
      </Box>
    </Box>
  );
};

export default TemplateForm;
