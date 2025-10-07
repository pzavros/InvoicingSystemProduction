// src/components/ClientsPage/ClientList.jsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Language as WebsiteIcon,
  LocationOn as LocationIcon
} from "@mui/icons-material";
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import { deleteClient } from "./api";

const ClientList = ({ clients, loading, onEditClient, onDeleteClient, onReloadClients }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      setDeleting(true);
      await deleteClient(clientToDelete.id);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      onDeleteClient();
    } catch (error) {
      console.error('Error deleting client:', error);
      // Handle error notification here if needed
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // Prepare data for the DataGrid
  const rows = useMemo(() => {
    return clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company || 'Individual',
      phone: client.phone || '',
      address: `${client.city || ''} ${client.state || ''}`.trim() || client.address || '',
      website: client.website || '',
      isActive: client.isActive,
      totalInvoiceAmount: client.totalInvoiceAmount || 0,
      totalInvoiceCount: client.totalInvoiceCount || 0,
      lastInvoiceDate: client.lastInvoiceDate,
      client: client // Keep reference to full client object
    }));
  }, [clients]);

  // Define columns for the DataGrid - Following MUI Documentation Pattern
  const columns = [
    {
      field: 'name',
      headerName: 'Client',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%', py: 1 }}>
          <Avatar
            sx={{
              backgroundColor: '#10b981',
              color: 'white',
              width: 44,
              height: 44,
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {getInitials(params.value)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827', fontSize: '1rem' }}>
              {params.value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmailIcon sx={{ fontSize: 14, color: '#6b7280' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {params.row.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'company',
      headerName: 'Company',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {params.value !== 'Individual' ? (
              <>
                <BusinessIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                <Typography variant="body1" color="text.primary" sx={{ fontSize: '0.95rem' }}>
                  {params.value}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {params.value}
              </Typography>
            )}
          </Box>
          {params.row.website && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <WebsiteIcon sx={{ fontSize: 14, color: '#6b7280' }} />
              <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.875rem' }}>
                {params.row.website}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Contact',
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5, height: '100%', py: 1 }}>
          {params.value && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 14, color: '#6b7280' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {params.value}
              </Typography>
            </Box>
          )}
          {params.row.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationIcon sx={{ fontSize: 14, color: '#6b7280' }} />
              <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.875rem' }}>
                {params.row.address}
              </Typography>
            </Box>
          )}
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Chip
            label={params.value ? "Active" : "Inactive"}
            size="medium"
            sx={{
              backgroundColor: params.value ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)',
              color: params.value ? '#059669' : '#6b7280',
              fontWeight: 500,
              fontSize: '0.875rem',
              border: `1px solid ${params.value ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)'}`,
            }}
          />
        </Box>
      ),
      type: 'boolean',
    },

    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, height: '100%' }}>
          <Tooltip title="Edit Client">
            <IconButton
              size="medium"
              onClick={() => onEditClient(params.row.client)}
              sx={{
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Client">
            <IconButton
              size="medium"
              onClick={() => handleDeleteClick(params.row.client)}
              sx={{
                color: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#10b981' }} />
      </Box>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No clients found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add your first client to get started with invoicing.
        </Typography>
      </Box>
    );
  }

  // Calculate dynamic height based on number of records
  const calculateGridHeight = () => {
    const headerHeight = 64;
    const toolbarHeight = 60;
    const footerHeight = 52;
    const rowHeight = 80;
    const minHeight = 400;
    const maxHeight = 800;
    
    const contentHeight = headerHeight + toolbarHeight + footerHeight + (rows.length * rowHeight);
    return Math.min(Math.max(contentHeight, minHeight), maxHeight);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        checkboxSelection={false}
        disableRowSelectionOnClick
        rowHeight={80}
        headerHeight={64}
        autoHeight={rows.length <= 10}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { 
              debounceMs: 500,
              placeholder: 'Search clients by name, email, or company...'
            },
            csvOptions: {
              fileName: 'clients-export',
              delimiter: ',',
              includeHeaders: true,
            },
            printOptions: {
              hideFooter: true,
              hideToolbar: true,
            },
          },
        }}
        sx={{
          height: rows.length <= 10 ? 'auto' : calculateGridHeight(),
          minHeight: 400,
          maxHeight: 800,
          boxShadow: '0 20px 35px -8px rgba(0, 0, 0, 0.12), 0 15px 20px -6px rgba(0, 0, 0, 0.08), 0 6px 12px -2px rgba(0, 0, 0, 0.06)',
          borderRadius: '16px',
          border: 'none',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          position: 'relative',
          '& .MuiDataGrid-main': {
            borderRadius: '16px',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#ffffff',
            borderBottom: 'none',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: '1rem',
              fontWeight: 600,
              color: '#111827',
            },
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: '24px 28px',
            backgroundColor: '#ffffff',
            borderBottom: 'none',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            '& .MuiInputBase-root': {
              fontSize: '0.95rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid rgba(209, 213, 219, 0.6)',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              minWidth: '280px',
              height: '40px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'rgba(16, 185, 129, 0.5)',
                boxShadow: '0 2px 6px 0 rgba(16, 185, 129, 0.15)',
              },
              '&.Mui-focused': {
                borderColor: '#10b981',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.12), 0 2px 6px 0 rgba(0, 0, 0, 0.1)',
              },
              '& .MuiInputBase-input': {
                padding: '8px 12px',
                '&::placeholder': {
                  color: '#9ca3af',
                  fontWeight: 400,
                },
              },
            },
            '& .MuiButton-root': {
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: '#ffffff',
              border: '1px solid rgba(209, 213, 219, 0.6)',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              padding: '8px 16px',
              minWidth: 'auto',
              height: '40px',
              color: '#374151',
              textTransform: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#ffffff',
                borderColor: '#10b981',
                color: '#10b981',
                boxShadow: '0 2px 6px 0 rgba(16, 185, 129, 0.2)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                backgroundColor: '#f3f4f6',
                borderColor: 'rgba(209, 213, 219, 0.4)',
                color: '#9ca3af',
                boxShadow: 'none',
              },
              '& .MuiButton-startIcon': {
                marginRight: '6px',
                '& svg': {
                  fontSize: '18px',
                },
              },
            },
            '& .MuiButtonBase-root[title*="Density"]': {
              '& svg': {
                color: '#6b7280',
              },
              '&:hover svg': {
                color: '#10b981',
              },
            },
            '& .MuiButtonBase-root[title*="Export"]': {
              '& svg': {
                color: '#6b7280',
              },
              '&:hover svg': {
                color: '#10b981',
              },
            },
            '& .MuiButtonBase-root[title*="Filter"]': {
              '& svg': {
                color: '#6b7280',
              },
              '&:hover svg': {
                color: '#10b981',
              },
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: '#ffffff',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          },
          '& .MuiDataGrid-row': {
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(16, 185, 129, 0.03)',
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(243, 244, 246, 0.8)',
            },
          },
          '& .MuiDataGrid-cell': {
            borderRight: 'none',
          },
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: '#dc2626', fontWeight: 600 }}>
          Delete Client
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete{" "}
            <strong>{clientToDelete?.name}</strong>? This action cannot be undone.
            All associated data will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ 
              borderColor: '#d1d5db',
              color: '#6b7280',
              '&:hover': { borderColor: '#9ca3af', backgroundColor: 'rgba(156, 163, 175, 0.1)' }
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{ 
              backgroundColor: '#dc2626',
              '&:hover': { backgroundColor: '#b91c1c' }
            }}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientList;
