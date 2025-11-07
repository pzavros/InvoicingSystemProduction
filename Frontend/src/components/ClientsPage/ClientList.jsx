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
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  useMediaQuery,
  useTheme
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
            size="small"
            sx={{
              backgroundColor: params.value ? 'rgba(16, 185, 129, 0.08)' : 'rgba(156, 163, 175, 0.08)',
              color: params.value ? '#059669' : '#6b7280',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              borderRadius: '6px',
              border: 'none',
              letterSpacing: '-0.01em',
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
              size="small"
              onClick={() => onEditClient(params.row.client)}
              sx={{
                width: 32,
                height: 32,
                color: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(6, 182, 212, 0.16)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Client">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row.client)}
              sx={{
                width: 32,
                height: 32,
                color: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                borderRadius: '8px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(220, 38, 38, 0.16)',
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

  // Mobile Card View
  if (isMobile) {
    return (
      <Box sx={{ width: '100%' }}>
        {clients.map((client) => (
          <Card 
            key={client.id}
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }
            }}
          >
            <CardContent sx={{ pb: 1 }}>
              {/* Client Header with Avatar and Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flex: 1 }}>
                  <Avatar
                    sx={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      width: 48,
                      height: 48,
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  >
                    {getInitials(client.name)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
                      {client.name}
                    </Typography>
                    {client.company && client.company !== 'Individual' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 14, color: '#6b7280' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }} noWrap>
                          {client.company}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                <Chip
                  label={client.isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    backgroundColor: client.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                    color: client.isActive ? '#059669' : '#6b7280',
                    border: client.isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(156, 163, 175, 0.2)',
                    fontWeight: 500,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>

              {/* Contact Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
                {client.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.85rem', 
                        color: '#374151',
                        wordBreak: 'break-all'
                      }}
                    >
                      {client.email}
                    </Typography>
                  </Box>
                )}
                
                {client.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#374151' }}>
                      {client.phone}
                    </Typography>
                  </Box>
                )}

                {client.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationIcon sx={{ fontSize: 16, color: '#6b7280', mt: 0.2 }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.85rem', 
                        color: '#374151',
                        flex: 1
                      }}
                    >
                      {client.city && client.state 
                        ? `${client.city}, ${client.state}` 
                        : client.address}
                    </Typography>
                  </Box>
                )}

                {client.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WebsiteIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.85rem', 
                        color: '#2563eb',
                        wordBreak: 'break-all'
                      }}
                    >
                      {client.website}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>

            {/* Invoice Stats (if available) - Outside CardContent for full width */}
            {(client.totalInvoiceCount > 0 || client.totalInvoiceAmount > 0 || client.lastInvoiceDate) && (
              <>
                <Divider />
                <Box sx={{ py: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 1.5,
                      width: '100%',
                      px: 2
                    }}
                  >
                    {client.totalInvoiceCount > 0 && (
                      <Box 
                        sx={{ 
                          textAlign: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: 'rgba(16, 185, 129, 0.05)',
                          border: '1px solid rgba(16, 185, 129, 0.1)',
                          width: '100%'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                          Invoices
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#10b981' }}>
                          {client.totalInvoiceCount}
                        </Typography>
                      </Box>
                    )}
                    {client.totalInvoiceAmount > 0 && (
                      <Box 
                        sx={{ 
                          textAlign: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: 'rgba(16, 185, 129, 0.05)',
                          border: '1px solid rgba(16, 185, 129, 0.1)',
                          width: '100%'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                          Total Amount
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#10b981' }}>
                          {formatCurrency(client.totalInvoiceAmount)}
                        </Typography>
                      </Box>
                    )}
                    {client.lastInvoiceDate && (
                      <Box 
                        sx={{ 
                          textAlign: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: 'rgba(16, 185, 129, 0.05)',
                          border: '1px solid rgba(16, 185, 129, 0.1)',
                          width: '100%'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                          Last Invoice
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#374151' }}>
                          {formatDate(client.lastInvoiceDate)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </>
            )}

            <Divider />

            {/* Action Buttons */}
            <CardActions sx={{ justifyContent: 'center', p: 1.5, gap: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEditClient(client)}
                sx={{
                  color: '#10b981',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  flex: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: '#10b981',
                  },
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteClick(client)}
                sx={{
                  color: '#dc2626',
                  borderColor: 'rgba(220, 38, 38, 0.3)',
                  backgroundColor: 'rgba(220, 38, 38, 0.05)',
                  flex: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderColor: '#dc2626',
                  },
                }}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        ))}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          fullScreen={isMobile}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : '20px',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)'
            }
          }}
          slotProps={{
            backdrop: {
              sx: {
                backdropFilter: 'blur(12px)',
                backgroundColor: 'rgba(15, 23, 42, 0.4)'
              }
            }
          }}
        >
          <DialogTitle id="delete-dialog-title" sx={{ 
            color: 'rgba(15, 23, 42, 0.95)', 
            fontWeight: 700,
            fontSize: '1.5rem',
            letterSpacing: '-0.02em',
            pt: 3,
            px: 3,
            pb: 1
          }}>
            Delete Client
          </DialogTitle>
          <DialogContent sx={{ px: 3, py: 2 }}>
            <DialogContentText id="delete-dialog-description" sx={{
              color: 'rgba(15, 23, 42, 0.65)',
              fontSize: '0.9375rem',
              lineHeight: 1.6
            }}>
              Are you sure you want to delete{" "}
              <Box component="strong" sx={{ 
                color: 'rgba(15, 23, 42, 0.95)',
                fontWeight: 600
              }}>
                "{clientToDelete?.name}"
              </Box>? This action cannot be undone and will permanently remove this client and all associated data.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            pt: 2,
            gap: 1.5,
            borderTop: '1px solid rgba(15, 23, 42, 0.08)',
            justifyContent: 'flex-end'
          }}>
            <Button 
              onClick={handleDeleteCancel}
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
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              sx={{ 
                px: 3,
                py: 1.25,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '-0.01em',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 1px 3px rgba(239, 68, 68, 0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
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
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
            >
              {deleting ? "Deleting..." : "Delete Client"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Desktop DataGrid View

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
          borderRadius: '12px',
          border: 'none',
          backgroundColor: '#ffffff',
          boxShadow: 'none',
          overflow: 'hidden',
          '& .MuiDataGrid-main': {
            borderRadius: '12px',
          },
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
            '& .MuiTablePagination-actions button': {
              color: 'rgba(15, 23, 42, 0.6)',
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        fullScreen={isMobile}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : '20px',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)'
          }
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(15, 23, 42, 0.4)'
            }
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ 
          color: 'rgba(15, 23, 42, 0.95)', 
          fontWeight: 700,
          fontSize: '1.5rem',
          letterSpacing: '-0.02em',
          pt: 3,
          px: 3,
          pb: 1
        }}>
          Delete Client
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <DialogContentText id="delete-dialog-description" sx={{
            color: 'rgba(15, 23, 42, 0.65)',
            fontSize: '0.9375rem',
            lineHeight: 1.6
          }}>
            Are you sure you want to delete{" "}
            <Box component="strong" sx={{ 
              color: 'rgba(15, 23, 42, 0.95)',
              fontWeight: 600
            }}>
              "{clientToDelete?.name}"
            </Box>? This action cannot be undone and will permanently remove this client and all associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          gap: 1.5,
          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
          justifyContent: 'flex-end'
        }}>
          <Button 
            onClick={handleDeleteCancel}
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
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{ 
              px: 3,
              py: 1.25,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 1px 3px rgba(239, 68, 68, 0.2)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
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
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
          >
            {deleting ? "Deleting..." : "Delete Client"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientList;
