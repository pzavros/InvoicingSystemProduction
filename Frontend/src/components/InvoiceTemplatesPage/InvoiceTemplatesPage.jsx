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
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Visibility as PreviewIcon,
  Star as StarIcon
} from '@mui/icons-material';
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setActiveTemplate
} from './api';
import SimpleTemplatePreview from './SimpleTemplatePreview';
import TemplatePreviewModal from './TemplatePreviewModal';
import TemplateCustomizer from './TemplateCustomizer';

const InvoiceTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateData: ''
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
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (error) {
      showNotification('Error fetching templates: ' + error.message, 'error');
    } finally {
      setLoading(false);
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
        templateData: template.templateData
      });
    } else {
      setEditingTemplate(null);
      setFormData({ name: '', description: '', templateData: '' });
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
    setFormData({ name: '', description: '', templateData: '' });
  };

  const handleSaveTemplate = async () => {
    try {
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
      showNotification('Template set as active successfully!');
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

  const renderTemplateCard = (template, { isSystem = false } = {}) => {
    const typeChipProps = isSystem
      ? { label: 'Professional', color: 'primary' }
      : { label: 'Custom', color: 'secondary' };

    return (
      <Box
        key={template.id}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
          border: template.isActive ? '2px solid #22c55e' : '1px solid rgba(226, 232, 240, 0.6)',
          backgroundColor: '#fff',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 32px rgba(15, 23, 42, 0.12)'
          }
        }}
        onClick={() => handlePreviewTemplate(template)}
      >
        <Box
          sx={{
            px: 1.5,
            pt: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#111827',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {template.name || 'Unnamed Template'}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {template.description || 'Tap to preview'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip
              label={typeChipProps.label}
              size="small"
              color={typeChipProps.color}
              variant="outlined"
              sx={{
                height: 22,
                fontSize: '0.625rem',
                backdropFilter: 'blur(4px)'
              }}
            />
            {template.isActive && (
              <Chip
                label="Active"
                size="small"
                color="success"
                variant="filled"
                icon={<ActiveIcon fontSize="inherit" />}
                sx={{
                  height: 22,
                  fontSize: '0.625rem'
                }}
              />
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            p: 1.5,
            pt: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(148, 163, 184, 0.08)'
          }}
        >
          <SimpleTemplatePreview
            template={template}
            isActive={template.isActive}
            variant="compact"
          />
        </Box>

        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            px: 1.5,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)'
          }}
        >
          {template.isActive ? (
            <Chip
              label="Active"
              size="small"
              color="success"
              sx={{
                height: 26,
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            />
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                handleSetActive(template.id);
              }}
              sx={{
                textTransform: 'none',
                borderRadius: '999px',
                px: 2,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                }
              }}
            >
              Use Template
            </Button>
          )}

          <Stack direction="row" spacing={0.75} alignItems="center">
            <Tooltip title="Preview Template">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewTemplate(template);
                }}
                sx={{
                  color: '#1d4ed8',
                  backgroundColor: 'rgba(29, 78, 216, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(29, 78, 216, 0.16)'
                  }
                }}
              >
                <PreviewIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {!isSystem && (
              <Tooltip title="Edit Template">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCustomizer(template);
                  }}
                  sx={{
                    color: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(245, 158, 11, 0.16)'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {!isSystem && (
              <Tooltip title="Delete Template">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTemplate(template.id);
                  }}
                  sx={{
                    color: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.16)'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Box>
    );
  };

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
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: '#1f2937',
                mb: 1
              }}
            >
              Invoice Templates
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create and manage your invoice templates. Set one as active to use it for new invoices.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCustomizer()}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
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
                borderColor: '#d1d5db',
                color: '#6b7280',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: 'rgba(107, 114, 128, 0.1)'
                }
              }}
            >
              Advanced Mode
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* System Templates Section */}
      {systemTemplates.length > 0 && (
        <Box mb={4}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <StarIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}
                >
                  Professional Templates
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose from our professionally designed templates
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, minmax(0, 1fr))',
                  sm: 'repeat(2, minmax(0, 1fr))'
                },
                gap: 2
              }}
            >
              {systemTemplates.map((template) => renderTemplateCard(template, { isSystem: true }))}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Custom Templates Section */}
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: '#1f2937'
            }}
          >
            Your Custom Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({customTemplates.length} templates)
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))'
            },
            gap: 2
          }}
        >
          {customTemplates.length === 0 ? (
            <Box>
              <Paper
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '2px dashed #e2e8f0'
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Custom Templates Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Create your own custom invoice template to get started.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenCustomizer()}
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
                    Advanced
                  </Button>
                </Stack>
              </Paper>
            </Box>
          ) : (
            customTemplates.map((template) => renderTemplateCard(template))
          )}
        </Box>
      </Box>

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
