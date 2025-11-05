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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, height: '100%', py: 1 }}>
            {getTemplateTypeIcon(params.row.template)}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '1rem', mb: 0.5 }}>
                  {params.value}
                </Typography>
                {isLocked && (
                  <Tooltip title="This template is locked. Upgrade to premium to edit or use it.">
                    <LockIcon sx={{ fontSize: '1rem', color: '#9ca3af' }} />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.4 }}>
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
              backgroundColor: params.row.isSystemTemplate ? '#f0f4ff' : '#f3e8ff',
              color: params.row.isSystemTemplate ? '#6366f1' : '#8b5cf6',
              border: params.row.isSystemTemplate ? '1.5px solid #c7d2fe' : '1.5px solid #ddd6fe',
              '& .MuiChip-label': {
                px: 1.5
              }
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
              backgroundColor: '#fef3c7',
              color: '#d97706',
              border: '1.5px solid #fde68a',
              '& .MuiChip-icon': {
                color: '#d97706'
              },
              '& .MuiChip-label': {
                px: 1.5
              }
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
              backgroundColor: params.value ? '#d1fae5' : '#f3f4f6',
              color: params.value ? '#059669' : '#6b7280',
              border: params.value ? '1.5px solid #a7f3d0' : '1.5px solid #e5e7eb',
              '& .MuiChip-icon': {
                color: '#059669'
              },
              '& .MuiChip-label': {
                px: 1.5
              }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
            {!params.row.template.isActive && (
              <Tooltip title={isLocked ? "Upgrade to premium to use custom templates" : ""}>
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
                      background: isLocked 
                        ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: isLocked ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.25)',
                      minWidth: 'auto',
                      '&:hover': isLocked ? {} : {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                      },
                      '&.Mui-disabled': {
                        color: 'white',
                        opacity: 0.7
                      }
                    }}
                  >
                    {isLocked ? <LockIcon fontSize="small" sx={{ mr: 0.5 }} /> : null}
                    Use
                  </Button>
                </span>
              </Tooltip>
            )}
            
            <Tooltip title="Preview Template">
              <IconButton
                size="small"
                onClick={() => handlePreviewTemplate(params.row.template)}
                sx={{
                  color: '#6366f1',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '8px',
                  '&:hover': { 
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <PreviewIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {!params.row.isSystemTemplate && (
              <Tooltip title={isLocked ? "Upgrade to premium to edit custom templates" : "Edit Template"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/templates/edit/${params.row.template.id}`)}
                    disabled={isLocked}
                    sx={{
                      color: isLocked ? '#9ca3af' : '#f59e0b',
                      backgroundColor: isLocked ? 'rgba(156, 163, 175, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '8px',
                      '&:hover': isLocked ? {} : { 
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.2s ease',
                      '&.Mui-disabled': {
                        color: '#9ca3af',
                        opacity: 0.5
                      }
                    }}
                  >
                    {isLocked ? <LockIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {!params.row.isSystemTemplate && (
              <Tooltip title={isLocked ? "Upgrade to premium to delete custom templates" : "Delete Template"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTemplate(params.row.template.id)}
                    disabled={isLocked}
                    sx={{
                      color: isLocked ? '#9ca3af' : '#ef4444',
                      backgroundColor: isLocked ? 'rgba(156, 163, 175, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '8px',
                      '&:hover': isLocked ? {} : { 
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.2s ease',
                      '&.Mui-disabled': {
                        color: '#9ca3af',
                        opacity: 0.5
                      }
                    }}
                  >
                    {isLocked ? <LockIcon fontSize="small" /> : <DeleteIcon fontSize="small" />}
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
    <Fade in={true} timeout={800}>
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Grow in={true} timeout={600}>
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
          border: '1px solid rgba(59, 130, 246, 0.15)',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #14b8a6 0%, #0d9488 100%)',
            borderRadius: '3px 3px 0 0'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 280 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(20, 184, 166, 0.35)'
            }}
          >
            <DocumentIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              Invoice Template Management
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.secondary',
                fontWeight: 'medium'
              }}
            >
              Create and manage your invoice templates. Set one active template per document type.
            </Typography>
          </Box>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: { xs: '100%', md: 200 },
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: { xs: '0 4px 8px rgba(148, 163, 184, 0.15)', md: 'none' }
            }}
          >
            <InputLabel>Document Type</InputLabel>
            <Select
              value={selectedDocumentType}
              label="Document Type"
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: 'white'
              }}
            >
              <MenuItem value="all">All Document Types</MenuItem>
              {documentTypes.map((docType) => (
                <MenuItem key={docType.id} value={docType.id}>
                  {docType.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip
            title={!canCreateTemplate ? "Templates are a premium feature. Upgrade to premium to create custom templates." : ""}
            arrow
          >
            <span>
              <Button
                variant="contained"
                startIcon={canCreateTemplate ? <AddIcon /> : <LockIcon />}
                onClick={handleNavigateToAdd}
                disabled={!canCreateTemplate}
                sx={{
                  backgroundColor: canCreateTemplate ? '#10b981' : '#9ca3af',
                  backgroundImage: canCreateTemplate 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  boxShadow: canCreateTemplate ? '0 8px 16px rgba(16, 185, 129, 0.35)' : 'none',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': canCreateTemplate ? {
                    backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(16, 185, 129, 0.45)'
                  } : {},
                  '&.Mui-disabled': {
                    color: 'white',
                    opacity: 0.7
                  }
                }}
              >
                {canCreateTemplate ? 'Create Template' : 'Premium Only'}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>
      </Grow>

      {/* Usage Indicator for Free Tier - Below Header */}
      <Box sx={{ mb: 3 }}>
        <UsageIndicator resource="template" label="Templates" />
      </Box>

      {/* Templates DataGrid */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}
      >
        <Box sx={{ 
          p: 3, 
          borderBottom: '2px solid #f3f4f6',
          background: 'linear-gradient(to right, #fafafa 0%, #ffffff 100%)'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            {selectedDocumentType === 'all' 
              ? `All Templates (${templates.length})`
              : `${getDocumentTypeName(selectedDocumentType)} Templates (${templates.length})`
            }
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {selectedDocumentType === 'all' 
              ? 'Manage your professional and custom invoice templates across all document types'
              : `Manage templates for ${getDocumentTypeName(selectedDocumentType)} documents`
            }
          </Typography>
        </Box>

        {templates.length === 0 && !loading ? (
          <Box sx={{ 
            p: 8, 
            textAlign: 'center',
            background: 'linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)'
          }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto 24px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            >
              <DocumentIcon sx={{ fontSize: 40, color: '#9ca3af' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#4b5563', fontWeight: 600, mb: 1 }}>
              No Templates Available
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af', mb: 4, maxWidth: 400, mx: 'auto' }}>
              Create your first custom invoice template to get started. Templates help you maintain consistent branding across all your documents.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/templates/add')}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)',
                }
              }}
            >
              Create Template
            </Button>
          </Box>
        ) : (
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: { sortModel: [] }, // Disable default sorting
              }}
              pageSizeOptions={[5, 10, 25]}
              rowHeight={80}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: '#fafafa',
                  color: '#374151',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderBottom: '2px solid #e5e7eb',
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#fafafa',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '2px solid #e5e7eb',
                  backgroundColor: '#fafafa'
                },
                '& .MuiDataGrid-toolbarContainer': {
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: '#fafafa',
                  '& .MuiButton-root': {
                    color: '#6b7280',
                    '&:hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }
                }
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
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <PageHelper {...pageHelpContent.templates} />
    </Box>
    </Fade>
  );
};

export default InvoiceTemplatesPage;
