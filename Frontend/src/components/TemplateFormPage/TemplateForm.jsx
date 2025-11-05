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
    <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937", mb: 2 }}>
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
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50.2%), radial-gradient(circle at 80% 20%, rgba(120, 119, 198, 0.15), transparent 50.2%), radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.1), transparent 50.2%)',
      py: 3,
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4, 
        maxWidth: '1000px', 
        margin: '0 auto',
        px: { xs: 0, sm: 2 }
      }}>
        <IconButton 
          onClick={handleBack}
          sx={{ 
            mr: 2,
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#4a5568',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.35)'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: "#1f2937",
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <PaletteIcon sx={{ color: '#667eea' }} />
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </Typography>
          <Typography variant="body1" sx={{ color: "#6b7280", mt: 0.5 }}>
            {isEditing ? 'Update your custom invoice template' : 'Design a custom invoice template for your business'}
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Box sx={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        px: { xs: 0, sm: 2 }
      }}>
        <Box
          component="form"
          sx={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '20px',
            p: { xs: 3, md: 4 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Basic Information */}
            <SectionTitle>📝 Basic Information</SectionTitle>
            
            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormLabel sx={{ 
                display: "block", 
                mb: 1, 
                fontWeight: 600, 
                color: "#374151" 
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
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "12px",
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.name ? '#ef4444' : 'rgba(0, 0, 0, 0.12)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.name ? '#ef4444' : '#667eea',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.name ? '#ef4444' : '#667eea',
                  }
                }}
              />
              {errors.name && (
                <Typography variant="caption" sx={{ color: '#ef4444', mt: 0.5, display: 'block' }}>
                  {errors.name}
                </Typography>
              )}
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormLabel sx={{ 
                display: "block", 
                mb: 1, 
                fontWeight: 600, 
                color: "#374151" 
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
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px"
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
                <Typography variant="caption" sx={{ color: '#ef4444', mt: 0.5, display: 'block' }}>
                  {errors.documentTypeId}
                </Typography>
              )}
            </FormGrid>

            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormLabel sx={{ 
                display: "block", 
                mb: 1, 
                fontWeight: 600, 
                color: "#374151" 
              }}>
                Color Theme
              </FormLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.colorTheme}
                  onChange={(e) => handleInputChange('colorTheme', e.target.value)}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px"
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
                display: "block", 
                mb: 1, 
                fontWeight: 600, 
                color: "#374151" 
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
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "12px"
                }}
              />
            </FormGrid>

            {/* Design Settings */}
            <SectionTitle>🎨 Design Settings</SectionTitle>
            
            <FormGrid size={{ xs: 12, sm: 6 }}>
              <FormLabel sx={{ 
                display: "block", 
                mb: 1, 
                fontWeight: 600, 
                color: "#374151" 
              }}>
                Font Family
              </FormLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.fontStyle}
                  onChange={(e) => handleInputChange('fontStyle', e.target.value)}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px"
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
                display: "block", 
                mb: 1, 
                fontWeight: 600, 
                color: "#374151" 
              }}>
                Border Radius
              </FormLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.borderRadius}
                  onChange={(e) => handleInputChange('borderRadius', e.target.value)}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px"
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
            <SectionTitle>👁️ Sections to Include</SectionTitle>
            
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
                <SectionTitle>⚠️ Disclaimer Settings</SectionTitle>
                
                <FormGrid size={{ xs: 12 }}>
                  <FormLabel sx={{ 
                    display: "block", 
                    mb: 1, 
                    fontWeight: 600, 
                    color: "#374151" 
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
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "12px"
                    }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', color: '#6b7280', mt: 0.5 }}>
                    This disclaimer will appear at the bottom of {formData.type === 'quote' ? 'quotation' : 'proforma invoice'} documents
                  </Typography>
                </FormGrid>
              </>
            )}

            {/* Status */}
            <SectionTitle>⚡ Template Status</SectionTitle>
            
            <FormGrid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#22c55e',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#22c55e',
                      },
                    }}
                  />
                }
                label="Set as Active Template"
                sx={{ color: "#374151", fontWeight: 500 }}
              />
              <Typography variant="caption" sx={{ display: 'block', color: '#6b7280', mt: 0.5 }}>
                The active template will be used by default for new invoices
              </Typography>
            </FormGrid>
          </Grid>

          {/* Preview Section */}
          <Box sx={{ 
            mt: 4,
            pt: 4,
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937", display: 'flex', alignItems: 'center', gap: 1 }}>
                <PreviewIcon sx={{ color: '#667eea' }} />
                Preview
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
                See how your template will look in real invoices
              </Typography>
            </Box>

            {/* Preview Container */}
            <Box
              sx={{
                border: '2px solid rgba(102, 126, 234, 0.2)',
                borderRadius: formData.borderRadius,
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                p: 4
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

          {/* Actions */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2, 
            mt: 4,
            pt: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Button
              onClick={handleBack}
              disabled={saving}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                color: '#6b7280',
                borderColor: '#d1d5db',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: 'rgba(107, 114, 128, 0.1)'
                }
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={saving}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                },
                '&:disabled': {
                  background: '#9ca3af'
                }
              }}
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : (isEditing ? 'Update Template' : 'Create Template')}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Notification */}
      {notification.show && (
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, show: false })}
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            borderRadius: '12px'
          }}
        >
          {notification.message}
        </Alert>
      )}
    </Box>
  );
};

export default TemplateForm;
