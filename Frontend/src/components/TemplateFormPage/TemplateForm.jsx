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
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Divider
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
      showCompanyInfo: true,
      showCompanyDetails: true,
      showBankDetails: true,
      showBankInfo: true,
      showDates: true,
      showItemsTable: true,
      showTotals: true,
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
    }
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

  // Sample data for preview
  const sampleInvoiceData = {
    isOpen: true,
    id: "preview-001",
    currency: "$",
    currentDate: new Date().toISOString().split('T')[0],
    invoiceNumber: "001",
    dateOfIssue: new Date().toISOString().split('T')[0],
    billTo: "John Smith",
    billToEmail: "john.smith@example.com",
    billToAddress: "123 Main Street, New York, NY 10001",
    billFrom: "Your Company Name",
    billFromEmail: "hello@yourcompany.com",
    address: "456 Business Ave, Suite 100, New York, NY 10002",
    notes: "Thank you for your business! Payment is due within 30 days.",
    total: "1,150.00",
    subTotal: "1,000.00",
    taxRate: 10,
    taxAmount: "100.00",
    discountRate: 5,
    discountAmount: "50.00",
    logo: "https://via.placeholder.com/120x120?text=Logo"
  };

  const sampleItems = [
    {
      itemId: 1,
      itemName: "Web Design Services",
      itemDescription: "Complete website redesign and development",
      itemPrice: "500.00",
      itemQuantity: 1,
    },
    {
      itemId: 2,
      itemName: "SEO Optimization",
      itemDescription: "3-month SEO campaign and optimization",
      itemPrice: "300.00",
      itemQuantity: 1,
    },
    {
      itemId: 3,
      itemName: "Content Creation",
      itemDescription: "Blog posts and marketing content",
      itemPrice: "250.00",
      itemQuantity: 1,
    },
  ];

  const sampleCompanyInfo = {
    name: formData.name ? `${formData.name} Preview` : "Your Company Name",
    companyNo: "12345678",
    vatNo: "VAT123456789",
    ticNo: "TIC987654321",
    website: "https://www.yourcompany.com",
    email: "hello@yourcompany.com",
  };

  const sampleBankInfo = {
    bankName: "Sample Bank",
    accountName: "Your Company Name",
    accountNo: "123456789",
    swift: "SAMPUS33",
    iban: "US12 3456 7890 1234 5678 90",
  };

  useEffect(() => {
    const initializeData = async () => {
      const types = await fetchDocumentTypes();
      if (isEditing) await loadTemplate(types);
    };
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

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
          'Quotation': 'quote'
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
            'Quotation': 'quote'
          };
          mappedType = typeMapping[docType.displayName] || mappedType;
        }
      }

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
          showLogo: parsedConfig.sections?.showLogo ?? true,
          showCompanyInfo: parsedConfig.sections?.showCompanyInfo ?? true,
          showCompanyDetails: parsedConfig.sections?.showCompanyDetails ?? true,
          showBankDetails: parsedConfig.sections?.showBankDetails ?? true,
          showBankInfo: parsedConfig.sections?.showBankInfo ?? true,
          showDates: parsedConfig.sections?.showDates ?? true,
          showItemsTable: parsedConfig.sections?.showItemsTable ?? true,
          showTotals: parsedConfig.sections?.showTotals ?? true,
          showTax: parsedConfig.sections?.showTax ?? true,
          showDiscount: parsedConfig.sections?.showDiscount ?? true,
          showNotes: parsedConfig.sections?.showNotes ?? true,
          tableBorder: parsedConfig.sections?.tableBorder ?? true,
          tableStyle: parsedConfig.sections?.tableStyle || "rounded",
          alternateRowColors: parsedConfig.sections?.alternateRowColors ?? true,
          bankInfoBackground: parsedConfig.sections?.bankInfoBackground ?? true
        },
        logoSettings: {
          showLogo: parsedConfig.logoSettings?.showLogo ?? true,
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
        }
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
    setFormData(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [field]: value
      }
    }));
  };

  const handleLogoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      logoSettings: {
        ...prev.logoSettings,
        [field]: value
      }
    }));
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

  // Helper function to get theme color
  const getThemeColor = () => {
    return formData.customColors?.primary || COLOR_THEMES[formData.colorTheme]?.colors?.primary || '#667eea';
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
        showLogo: formData.sections?.showLogo ?? true,
        showCompanyInfo: formData.sections?.showCompanyInfo ?? true,
        showCompanyDetails: formData.sections?.showCompanyDetails ?? true,
        showBankDetails: formData.sections?.showBankDetails ?? true,
        showBankInfo: formData.sections?.showBankInfo ?? true,
        showDates: formData.sections?.showDates ?? true,
        showItemsTable: formData.sections?.showItemsTable ?? true,
        showTotals: formData.sections?.showTotals ?? true,
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
      }
    };
  };

  const handleSave = async () => {
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
                        'Quotation': 'quote'
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
                    checked={formData.sections?.showCompanyInfo ?? true}
                    onChange={(e) => handleSectionChange('showCompanyInfo', e.target.checked)}
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
                    checked={formData.sections?.showBankInfo ?? true}
                    onChange={(e) => handleSectionChange('showBankInfo', e.target.checked)}
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
              {/* Inline Invoice Preview */}
              <Box sx={{ 
                maxWidth: '800px', 
                mx: 'auto', 
                backgroundColor: 'white',
                fontFamily: formData.fontStyle === 'classic' ? 'serif' : 
                           formData.fontStyle === 'elegant' ? 'Georgia, serif' : 
                           formData.fontStyle === 'minimal' ? 'Arial, sans-serif' : 
                           'Roboto, sans-serif'
              }}>
                {/* Invoice Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: getThemeColor(),
                        fontSize: formData.fontStyle === 'minimal' ? '2rem' : '2.5rem'
                      }}
                    >
                      {formData.type === 'tax' ? 'TAX INVOICE' : 
                       formData.type === 'proforma' ? 'PROFORMA INVOICE' : 
                       formData.type === 'quote' ? 'QUOTATION' : 'INVOICE'}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#666', mt: 1 }}>
                      #{sampleInvoiceData.invoiceNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    {formData.logoSettings?.showLogo !== false && (
                      <Box sx={{ 
                        width: formData.logoSettings?.size === 'large' ? 120 : 
                               formData.logoSettings?.size === 'small' ? 60 : 80, 
                        height: formData.logoSettings?.size === 'large' ? 120 : 
                                formData.logoSettings?.size === 'small' ? 60 : 80, 
                        backgroundColor: '#f0f0f0', 
                        borderRadius: formData.logoSettings?.style === 'circle' ? '50%' : formData.borderRadius, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        <Typography variant="caption" sx={{ color: '#999' }}>Logo</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Company & Client Info */}
                {formData.sections?.showCompanyInfo !== false && (
                  <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1, 
                          color: getThemeColor()
                        }}
                      >
                        From:
                      </Typography>
                      <Typography variant="body2">{sampleCompanyInfo.name}</Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>{sampleCompanyInfo.email}</Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>{sampleCompanyInfo.website}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1, 
                          color: getThemeColor()
                        }}
                      >
                        To:
                      </Typography>
                      <Typography variant="body2">{sampleInvoiceData.billTo}</Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>{sampleInvoiceData.billToEmail}</Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>{sampleInvoiceData.billToAddress}</Typography>
                    </Grid>
                  </Grid>
                )}

                {/* Invoice Details */}
                {formData.sections?.showDates !== false && (
                  <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        <strong>Date Issued:</strong> {sampleInvoiceData.dateOfIssue}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        <strong>Due Date:</strong> {sampleInvoiceData.dueDate}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {/* Items Table */}
                {formData.sections?.showItemsTable !== false && (
                  <TableContainer 
                    component={Paper} 
                    elevation={0} 
                    sx={{ 
                      mb: 4, 
                      border: formData.sections?.tableBorder !== false ? '1px solid #e0e0e0' : 'none',
                      borderRadius: formData.sections?.tableStyle === 'rounded' ? formData.borderRadius : 0
                    }}
                  >
                    <Table>
                      <TableHead 
                        sx={{ 
                          backgroundColor: getThemeColor(),
                          '& .MuiTableCell-root': {
                            fontSize: formData.fontStyle === 'minimal' ? '0.875rem' : '1rem'
                          }
                        }}
                      >
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Qty</TableCell>
                          <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Rate</TableCell>
                          <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sampleItems.map((item, index) => (
                          <TableRow 
                            key={index}
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: formData.sections?.alternateRowColors !== false ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                              },
                            }}
                          >
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="center">${item.price}</TableCell>
                            <TableCell align="center">${(item.quantity * item.price).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Totals */}
                {formData.sections?.showTotals !== false && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                    <Box sx={{ minWidth: 200 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">$1,000.00</Typography>
                      </Box>
                      {formData.sections?.showTax !== false && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Tax:</Typography>
                          <Typography variant="body2">$100.00</Typography>
                        </Box>
                      )}
                      {formData.sections?.showDiscount !== false && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Discount:</Typography>
                          <Typography variant="body2">-$50.00</Typography>
                        </Box>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: getThemeColor()
                          }}
                        >
                          $1,150.00
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Notes */}
                {formData.sections?.showNotes !== false && sampleInvoiceData.notes && (
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: 1,
                        color: getThemeColor()
                      }}
                    >
                      Notes:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>{sampleInvoiceData.notes}</Typography>
                  </Box>
                )}

                {/* Bank Info */}
                {formData.sections?.showBankInfo !== false && (
                  <Box sx={{ 
                    backgroundColor: formData.sections?.bankInfoBackground !== false ? '#f9f9f9' : 'transparent', 
                    p: formData.sections?.bankInfoBackground !== false ? 3 : 2, 
                    borderRadius: formData.borderRadius,
                    border: formData.sections?.bankInfoBackground === false ? '1px solid #e0e0e0' : 'none'
                  }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: 2, 
                        color: getThemeColor()
                      }}
                    >
                      Banking Details:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#666' }}>Bank Name:</Typography>
                        <Typography variant="body2">{sampleBankInfo.bankName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#666' }}>Account Name:</Typography>
                        <Typography variant="body2">{sampleBankInfo.accountName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#666' }}>IBAN:</Typography>
                        <Typography variant="body2">{sampleBankInfo.iban}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#666' }}>SWIFT:</Typography>
                        <Typography variant="body2">{sampleBankInfo.swift}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Footer */}
                {formData.footerSettings?.showFooter !== false && formData.footerSettings?.text && (
                  <Box sx={{ 
                    mt: 4, 
                    pt: 2, 
                    borderTop: '1px solid #e0e0e0',
                    textAlign: formData.footerSettings?.alignment || 'center'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666',
                        fontStyle: formData.footerSettings?.style === 'italic' ? 'italic' : 'normal'
                      }}
                    >
                      {formData.footerSettings?.text || ""}
                    </Typography>
                  </Box>
                )}
              </Box>
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
