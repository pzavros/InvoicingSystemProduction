import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper,
  Stack,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
  Grow
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Visibility as PreviewIcon,
  Star as StarIcon,
  Description as DocumentIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setActiveTemplate,
  getDocumentTypes,
  getTemplatesByDocumentType,
  getActiveTemplateByDocumentType
} from './api';
import LoadingOverlay from '../ReusableComponents/LoadingOverlay';
import SimpleTemplatePreview from './SimpleTemplatePreview';
import TemplatePreviewModal from './TemplatePreviewModal';
import TemplateCustomizer from './TemplateCustomizer';
import { useSubscription } from '../../utils/SubscriptionContext';
import UsageIndicator from '../SubscriptionPage/UsageIndicator';
import PageLoader from '../ReusableComponents/PageLoader';
import PageHelper from '../ReusableComponents/PageHelper';
import { pageHelpContent } from '../../config/pageHelpContent';

const InvoiceTemplatesPage = () => {
  const navigate = useNavigate();
  const { canCreate, isPremium } = useSubscription();
  const [templates, setTemplates] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateData: '',
    documentTypeId: null
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [previewModal, setPreviewModal] = useState({
    open: false,
    template: null
  });
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [editingCustomTemplate, setEditingCustomTemplate] = useState(null);

  const canCreateTemplate = canCreate?.template !== false;

  const systemTemplates = templates.filter((t) => t.isSystemTemplate);
  const customTemplates = templates.filter((t) => !t.isSystemTemplate);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [selectedDocumentType]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [templatesData, documentTypesData] = await Promise.all([
        getAllTemplates(),
        getDocumentTypes()
      ]);
      setTemplates(templatesData);
      setDocumentTypes(documentTypesData);
    } catch (error) {
      showNotification('Error fetching data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const documentTypeId = selectedDocumentType === 'all' ? null : selectedDocumentType;
      const data = selectedDocumentType === 'all' 
        ? await getAllTemplates()
        : await getTemplatesByDocumentType(documentTypeId);
      setTemplates(data);
    } catch (error) {
      showNotification('Error fetching templates: ' + error.message, 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleOpenDialog = (template = null) => {
    // Check if user can create/edit templates (premium only)
    if (!canCreateTemplate) {
      showNotification('Templates are a premium feature. Upgrade to premium to create and edit custom templates.', 'warning');
      return;
    }
    
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description,
        templateData: template.templateData,
        documentTypeId: template.documentTypeId
      });
    } else {
      setEditingTemplate(null);
      setFormData({ 
        name: '', 
        description: '', 
        templateData: '', 
        documentTypeId: selectedDocumentType === 'all' ? (documentTypes.length > 0 ? documentTypes[0].id : null) : selectedDocumentType 
      });
    }
    setOpenDialog(true);
  };

  const handleOpenCustomizer = (template = null) => {
    // Check if user can create/edit templates (premium only)
    if (!canCreateTemplate) {
      showNotification('Templates are a premium feature. Upgrade to premium to create and edit custom templates.', 'warning');
      return;
    }
    
    setEditingCustomTemplate(template);
    setCustomizerOpen(true);
  };

  const handleNavigateToAdd = () => {
    if (canCreateTemplate) {
      navigate('/templates/add');
    } else {
      showNotification('Templates are a premium feature. Upgrade to premium to create custom templates.', 'warning');
    }
  };

  const handleCloseCustomizer = () => {
    setCustomizerOpen(false);
    setEditingCustomTemplate(null);
  };

  const handleSaveCustomTemplate = async (templateData) => {
    try {
      if (editingCustomTemplate) {
        await updateTemplate(editingCustomTemplate.id, templateData);
        showNotification('Template updated successfully!');
      } else {
        await createTemplate(templateData);
        showNotification('Custom template created successfully!');
      }
      fetchTemplates();
    } catch (error) {
      showNotification('Error saving template: ' + error.message, 'error');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTemplate(null);
    setFormData({ name: '', description: '', templateData: '', documentTypeId: null });
  };

  const handleSaveTemplate = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        showNotification('Template name is required', 'error');
        return;
      }
      if (!formData.documentTypeId) {
        showNotification('Document type is required', 'error');
        return;
      }

      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
        showNotification('Template updated successfully!');
      } else {
        await createTemplate(formData);
        showNotification('Template created successfully!');
      }
      fetchTemplates();
      handleCloseDialog();
    } catch (error) {
      showNotification('Error saving template: ' + error.message, 'error');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
        showNotification('Template deleted successfully!');
        fetchTemplates();
      } catch (error) {
        showNotification('Error deleting template: ' + error.message, 'error');
      }
    }
  };

  const handleSetActive = async (templateId) => {
    // Prevent free users from activating custom templates
    const template = templates.find(t => t.id === templateId);
    if (!template.isSystemTemplate && !canCreateTemplate) {
      showNotification('You need a premium subscription to use custom templates. Upgrade to premium to activate this template.', 'warning');
      return;
    }
    
    try {
      await setActiveTemplate(templateId);
      const docTypeName = getDocumentTypeName(template?.documentTypeId);
      showNotification(`Template set as active for ${docTypeName} successfully!`);
      fetchTemplates();
    } catch (error) {
      showNotification('Error setting active template: ' + error.message, 'error');
    }
  };

  const handlePreviewTemplate = (template) => {
    setPreviewModal({
      open: true,
      template: template
    });
  };

  const handleClosePreview = () => {
    setPreviewModal({
      open: false,
      template: null
    });
  };

  const getTemplateTypeIcon = (template) => {
    const isSystem = template.isSystemTemplate;
    const initials = isSystem ? 'PRO' : 'CT';
    const color = isSystem ? '#6366f1' : '#8b5cf6';
    
    return (
      <Avatar
        sx={{
          backgroundColor: color,
          color: 'white',
          width: 48,
          height: 48,
          fontSize: '0.75rem',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
        }}
      >
        {initials}
      </Avatar>
    );
  };

  const getDocumentTypeName = (documentTypeId) => {
    if (!documentTypeId) return 'All Types';
    const docType = documentTypes.find(dt => dt.id === documentTypeId);
    return docType ? docType.displayName : 'Unknown';
  };

  const rows = templates
    .sort((a, b) => a.id - b.id) // Maintain consistent order by ID
    .map((template) => ({
      id: template.id,
      name: template.name || 'Unnamed Template',
      description: template.description || 'No description',
      type: template.isSystemTemplate ? 'Professional' : 'Custom',
      documentType: getDocumentTypeName(template.documentTypeId),
      documentTypeId: template.documentTypeId,
      isSystemTemplate: template.isSystemTemplate,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      template: template
    }));

  const columns = [
    {
      field: 'name',
      headerName: 'Template',
      width: 300,
      sortable: false,
      renderCell: (params) => {
        const isCustomTemplate = !params.row.isSystemTemplate;
        const isLocked = isCustomTemplate && !canCreateTemplate;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%', py: 1 }}>
            {getTemplateTypeIcon(params.row.template)}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'rgba(15, 23, 42, 0.95)', fontSize: '0.9375rem', mb: 0.25, letterSpacing: '-0.01em' }}>
                  {params.value}
                </Typography>
                {isLocked && (
                  <Tooltip title="This template is locked. Upgrade to premium to edit or use it." arrow>
                    <LockIcon sx={{ fontSize: '1rem', color: 'rgba(15, 23, 42, 0.4)' }} />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'rgba(15, 23, 42, 0.5)', lineHeight: 1.3 }}>
                {params.row.description}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Chip
            label={params.value}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              borderRadius: '6px',
              letterSpacing: '-0.01em',
              backgroundColor: params.row.isSystemTemplate ? 'rgba(99, 102, 241, 0.08)' : 'rgba(139, 92, 246, 0.08)',
              color: params.row.isSystemTemplate ? '#6366f1' : '#8b5cf6',
              border: 'none',
            }}
          />
        </Box>
      ),
    },
    {
      field: 'documentType',
      headerName: 'Document Type',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Chip
            label={params.value}
            size="small"
            icon={<DocumentIcon fontSize="inherit" />}
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              borderRadius: '6px',
              letterSpacing: '-0.01em',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#d97706',
              border: 'none',
              '& .MuiChip-icon': {
                color: '#d97706'
              },
            }}
          />
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Chip
            label={params.value ? 'Active' : 'Inactive'}
            size="small"
            icon={params.value ? <ActiveIcon fontSize="inherit" /> : undefined}
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              borderRadius: '6px',
              letterSpacing: '-0.01em',
              backgroundColor: params.value ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.08)',
              color: params.value ? '#059669' : '#6b7280',
              border: 'none',
              '& .MuiChip-icon': {
                color: '#059669'
              },
            }}
          />
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const isCustomTemplate = !params.row.isSystemTemplate;
        const isLocked = isCustomTemplate && !canCreateTemplate;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, height: '100%' }}>
            {!params.row.template.isActive && (
              <Tooltip title={isLocked ? "Upgrade to premium to use custom templates" : "Set as active template"} arrow>
                <span>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleSetActive(params.row.template.id)}
                    disabled={isLocked}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      px: 2,
                      py: 0.75,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      minHeight: 32,
                      boxShadow: 'none',
                      background: isLocked 
                        ? 'rgba(15, 23, 42, 0.3)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      minWidth: 'auto',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': isLocked ? {} : {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        boxShadow: 'none',
                      },
                      '&.Mui-disabled': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        opacity: 1
                      }
                    }}
                  >
                    {isLocked ? <LockIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} /> : null}
                    Use
                  </Button>
                </span>
              </Tooltip>
            )}
            
            <Tooltip title="Preview Template" arrow>
              <IconButton
                size="small"
                onClick={() => handlePreviewTemplate(params.row.template)}
                sx={{
                  color: '#6366f1',
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    color: '#4f46e5',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <PreviewIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            {!params.row.isSystemTemplate && (
              <Tooltip title={isLocked ? "Upgrade to premium to edit custom templates" : "Edit Template"} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/templates/edit/${params.row.template.id}`)}
                    disabled={isLocked}
                    sx={{
                      color: isLocked ? 'rgba(15, 23, 42, 0.4)' : '#f59e0b',
                      backgroundColor: isLocked ? 'rgba(15, 23, 42, 0.06)' : 'rgba(245, 158, 11, 0.08)',
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': isLocked ? {} : { 
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: '#d97706',
                        transform: 'translateY(-1px)',
                      },
                      '&.Mui-disabled': {
                        color: 'rgba(15, 23, 42, 0.25)',
                        opacity: 0.5
                      }
                    }}
                  >
                    {isLocked ? <LockIcon sx={{ fontSize: 16 }} /> : <EditIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {!params.row.isSystemTemplate && (
              <Tooltip title={isLocked ? "Upgrade to premium to delete custom templates" : "Delete Template"} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTemplate(params.row.template.id)}
                    disabled={isLocked}
                    sx={{
                      color: isLocked ? 'rgba(15, 23, 42, 0.4)' : '#dc2626',
                      backgroundColor: isLocked ? 'rgba(15, 23, 42, 0.06)' : 'rgba(239, 68, 68, 0.08)',
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': isLocked ? {} : { 
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#b91c1c',
                        transform: 'translateY(-1px)',
                      },
                      '&.Mui-disabled': {
                        color: 'rgba(15, 23, 42, 0.25)',
                        opacity: 0.5
                      }
                    }}
                  >
                    {isLocked ? <LockIcon sx={{ fontSize: 16 }} /> : <DeleteIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  if (loading) {
    return <PageLoader color="#14b8a6" />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Clean Header - Matching Home/Products Style */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 3 },
          mb: 3,
          pb: 3,
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              mb: 0.5
            }}
          >
            Templates
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(15, 23, 42, 0.5)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}
          >
            Create and manage invoice templates
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(15, 23, 42, 0.04)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                height: 40,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(15, 23, 42, 0.06)',
                  borderColor: 'rgba(15, 23, 42, 0.12)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  borderColor: '#8b5cf6',
                  boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                },
                '& fieldset': {
                  border: 'none'
                }
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.875rem',
                fontWeight: 400,
                color: 'rgba(15, 23, 42, 0.6)',
                '&.Mui-focused': {
                  color: '#8b5cf6'
                }
              },
              '& .MuiSelect-icon': {
                color: 'rgba(15, 23, 42, 0.6)'
              }
            }}
          >
            <InputLabel>Document Type</InputLabel>
            <Select
              value={selectedDocumentType}
              label="Document Type"
              onChange={(e) => setSelectedDocumentType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              {documentTypes.map((docType) => (
                <MenuItem key={docType.id} value={docType.id}>
                  {docType.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Tooltip
            title={!canCreateTemplate ? "Upgrade to premium to create templates" : ""}
            arrow
          >
            <span>
              <Button
                variant="contained"
                startIcon={canCreateTemplate ? <AddIcon /> : <LockIcon />}
                onClick={handleNavigateToAdd}
                disabled={!canCreateTemplate}
                fullWidth={{ xs: true, sm: false }}
                sx={{
                  background: canCreateTemplate 
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
                    : 'rgba(15, 23, 42, 0.3)',
                  color: 'white',
                  boxShadow: 'none',
                  borderRadius: '8px',
                  px: 2.5,
                  py: 1,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: '-0.01em',
                  minWidth: { xs: 'auto', sm: 140 },
                  transition: 'all 0.15s ease',
                  '&:hover': canCreateTemplate ? { 
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    boxShadow: 'none',
                  } : {},
                  '&.Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    opacity: 1
                  }
                }}
              >
                {canCreateTemplate ? 'New Template' : 'Premium Only'}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Usage Indicator for Free Tier */}
      {!isPremium && (
        <Box sx={{ mb: 3 }}>
          <UsageIndicator resource="template" label="Templates" />
        </Box>
      )}

      {/* Templates DataGrid - Modern Clean Style */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'white',
          border: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        {templates.length === 0 && !loading ? (
          <Box sx={{ 
            p: 8, 
            textAlign: 'center',
          }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto 24px',
                borderRadius: '20px',
                background: 'rgba(139, 92, 246, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DocumentIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
            </Box>
            <Typography variant="h6" sx={{ color: 'rgba(15, 23, 42, 0.9)', fontWeight: 600, mb: 1 }}>
              No Templates Available
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(15, 23, 42, 0.5)', mb: 4, maxWidth: 400, mx: 'auto' }}>
              Create your first custom invoice template to get started. Templates help you maintain consistent branding across all your documents.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/templates/add')}
              disabled={!canCreateTemplate}
              sx={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                boxShadow: 'none',
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  boxShadow: 'none',
                }
              }}
            >
              Create Template
            </Button>
          </Box>
        ) : (
          <Box sx={{ height: 700, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { 
                    debounceMs: 500,
                    placeholder: 'Search templates...'
                  },
                },
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: { sortModel: [] },
              }}
              pageSizeOptions={[5, 10, 25]}
              rowHeight={80}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                  minHeight: '56px !important',
                  maxHeight: '56px !important',
                  '& .MuiDataGrid-columnHeader': {
                    '&:focus, &:focus-within': {
                      outline: 'none',
                    },
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'rgba(15, 23, 42, 0.7)',
                    letterSpacing: '-0.01em'
                  },
                },
                '& .MuiDataGrid-columnSeparator': {
                  display: 'none',
                },
                '& .MuiDataGrid-toolbarContainer': {
                  padding: '20px 24px',
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  '& .MuiInputBase-root': {
                    fontSize: '0.875rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    minWidth: '300px',
                    height: '40px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& fieldset': {
                      border: 'none'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.06)',
                      borderColor: 'rgba(15, 23, 42, 0.12)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                      borderColor: '#8b5cf6',
                      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
                    },
                    '& .MuiInputBase-input': {
                      padding: '10px 14px',
                      '&::placeholder': {
                        color: 'rgba(15, 23, 42, 0.4)',
                        fontWeight: 400,
                      },
                    },
                  },
                  '& .MuiButton-root': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    padding: '8px 12px',
                    minWidth: 'auto',
                    height: '40px',
                    color: 'rgba(15, 23, 42, 0.6)',
                    textTransform: 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.06)',
                      color: 'rgba(15, 23, 42, 0.8)',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'transparent',
                      color: 'rgba(15, 23, 42, 0.25)',
                    },
                  },
                },
                '& .MuiDataGrid-row': {
                  borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.02)',
                    cursor: 'pointer',
                  },
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: 'none',
                  '&:focus, &:focus-within': {
                    outline: 'none',
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid rgba(15, 23, 42, 0.08)',
                  backgroundColor: '#ffffff',
                  minHeight: '56px',
                  '& .MuiTablePagination-root': {
                    color: 'rgba(15, 23, 42, 0.7)',
                    fontSize: '0.875rem',
                  },
                  '& .MuiTablePagination-select': {
                    borderRadius: '6px',
                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                    padding: '4px 8px',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 23, 42, 0.08)',
                    },
                  },
                  '& .MuiIconButton-root': {
                    color: 'rgba(15, 23, 42, 0.6)',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.08)',
                      color: '#8b5cf6',
                    },
                    '&.Mui-disabled': {
                      color: 'rgba(15, 23, 42, 0.25)',
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Edit Template' : 'Create New Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Document Type *</InputLabel>
              <Select
                value={formData.documentTypeId || ''}
                label="Document Type *"
                onChange={(e) => setFormData({ ...formData, documentTypeId: e.target.value })}
                required
              >
                <MenuItem value="" disabled>Select Document Type</MenuItem>
                {documentTypes.map((docType) => (
                  <MenuItem key={docType.id} value={docType.id}>
                    {docType.displayName}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                Each template must be assigned to a specific document type
              </Typography>
            </FormControl>
            <TextField
              fullWidth
              label="Template Data (JSON)"
              value={formData.templateData}
              onChange={(e) => setFormData({ ...formData, templateData: e.target.value })}
              margin="normal"
              multiline
              rows={8}
              placeholder="Enter template configuration as JSON..."
              helperText="This will store the invoice form configuration for this template."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveTemplate}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Customizer */}
      <TemplateCustomizer
        open={customizerOpen}
        onClose={handleCloseCustomizer}
        onSave={handleSaveCustomTemplate}
        editingTemplate={editingCustomTemplate}
      />

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        open={previewModal.open}
        onClose={handleClosePreview}
        template={previewModal.template}
        onSetActive={handleSetActive}
      />

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ 
            width: "100%",
            borderRadius: '10px',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            backdropFilter: 'blur(20px)',
            ...(notification.severity === 'success' && {
              backgroundColor: 'rgba(139, 92, 246, 0.95)',
              color: 'white',
              border: 'none',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }),
            ...(notification.severity === 'error' && {
              backgroundColor: 'rgba(220, 38, 38, 0.95)',
              color: 'white',
              border: 'none',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }),
            ...(notification.severity === 'warning' && {
              backgroundColor: 'rgba(217, 119, 6, 0.95)',
              color: 'white',
              border: 'none',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            })
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <PageHelper {...pageHelpContent.templates} />
      <LoadingOverlay open={loading} message="Loading templates..." />
    </Box>
  );
};

export default InvoiceTemplatesPage;
