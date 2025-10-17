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
  InputLabel
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
  Description as DocumentIcon
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

const InvoiceTemplatesPage = () => {
  const navigate = useNavigate();
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
    setEditingCustomTemplate(template);
    setCustomizerOpen(true);
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
    try {
      await setActiveTemplate(templateId);
      const template = templates.find(t => t.id === templateId);
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
    const color = isSystem ? '#3b82f6' : '#8b5cf6';
    
    return (
      <Avatar
        sx={{
          backgroundColor: color,
          color: 'white',
          width: 44,
          height: 44,
          fontSize: '0.75rem',
          fontWeight: 700
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
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%', py: 1 }}>
          {getTemplateTypeIcon(params.row.template)}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827', fontSize: '1rem' }}>
              {params.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {params.row.description}
            </Typography>
          </Box>
        </Box>
      ),
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
            color={params.row.isSystemTemplate ? 'primary' : 'secondary'}
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem'
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
            color="info"
            variant="filled"
            icon={<DocumentIcon fontSize="inherit" />}
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem'
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
            color={params.value ? 'success' : 'default'}
            variant={params.value ? 'filled' : 'outlined'}
            icon={params.value ? <ActiveIcon fontSize="inherit" /> : undefined}
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem'
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
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          {!params.row.template.isActive && (
            <Button
              size="small"
              variant="contained"
              onClick={() => handleSetActive(params.row.template.id)}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                px: 1.5,
                py: 0.5,
                fontSize: '0.75rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                minWidth: 'auto'
              }}
            >
              Use
            </Button>
          )}
          
          <Tooltip title="Preview Template">
            <IconButton
              size="small"
              onClick={() => handlePreviewTemplate(params.row.template)}
              sx={{
                color: '#1d4ed8',
                backgroundColor: 'rgba(29, 78, 216, 0.08)',
                '&:hover': { backgroundColor: 'rgba(29, 78, 216, 0.16)' }
              }}
            >
              <PreviewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {!params.row.isSystemTemplate && (
            <Tooltip title="Edit Template">
              <IconButton
                size="small"
                onClick={() => navigate(`/templates/edit/${params.row.template.id}`)}
                sx={{
                  color: '#f59e0b',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.16)' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {!params.row.isSystemTemplate && (
            <Tooltip title="Delete Template">
              <IconButton
                size="small"
                onClick={() => handleDeleteTemplate(params.row.template.id)}
                sx={{
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.16)' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
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
            background: 'linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #8b5cf6 100%)',
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
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(59, 130, 246, 0.35)'
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
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/templates/add')}
            sx={{
              backgroundColor: '#1d4ed8',
              backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
              boxShadow: '0 8px 16px rgba(59, 130, 246, 0.35)',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 24px rgba(37, 99, 235, 0.45)'
              }
            }}
          >
            Create Template
          </Button>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderColor: 'rgba(148, 163, 184, 0.6)',
              color: '#334155',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'rgba(59, 130, 246, 0.6)',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.15)'
              }
            }}
          >
            Advanced Mode
          </Button>
        </Stack>
      </Box>

      {/* Templates DataGrid */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
            {selectedDocumentType === 'all' 
              ? `All Templates (${templates.length})`
              : `${getDocumentTypeName(selectedDocumentType)} Templates (${templates.length})`
            }
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedDocumentType === 'all' 
              ? 'Manage your professional and custom invoice templates across all document types'
              : `Manage templates for ${getDocumentTypeName(selectedDocumentType)} documents`
            }
          </Typography>
        </Box>

        {templates.length === 0 && !loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Templates Available
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create your first custom invoice template to get started.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/templates/add')}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                }}
              >
                Create Template
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleOpenDialog()}
                sx={{ color: '#6b7280', borderColor: '#d1d5db' }}
              >
                Advanced Mode
              </Button>
            </Stack>
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
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: '#f8fafc',
                  color: '#374151',
                  fontWeight: 600,
                  borderBottom: '2px solid rgba(148, 163, 184, 0.2)',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.04)',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '2px solid rgba(148, 163, 184, 0.1)',
                  backgroundColor: '#f8fafc'
                },
                '& .MuiDataGrid-toolbarContainer': {
                  padding: '16px',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                  backgroundColor: '#f8fafc'
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
    </Box>
  );
};

export default InvoiceTemplatesPage;
