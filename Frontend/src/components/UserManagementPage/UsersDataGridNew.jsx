// src/components/UserManagementPage/UsersDataGridNew.jsx
import React, { useState } from 'react';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter
} from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Star as StarIcon,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { updateUserAdminStatus, grantPremiumAccess } from './api';

const CustomToolbar = () => {
  return (
    <GridToolbarContainer
      sx={{
        p: 2.5,
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: '#ffffff',
      }}
    >
      <GridToolbarQuickFilter
        placeholder="Search users..."
        sx={{
          flex: 1,
          maxWidth: 400,
          '& .MuiInputBase-root': {
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            borderRadius: '8px',
            fontSize: '0.875rem',
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
              padding: '9px 12px',
              '&::placeholder': {
                color: 'rgba(15, 23, 42, 0.4)',
                fontWeight: 400,
              },
            },
          },
        }}
      />
    </GridToolbarContainer>
  );
};

const UsersDataGridNew = ({ 
  users, 
  loading, 
  onEditUser, 
  onReloadUsers,
  onNotification 
}) => {
  const [adminDialog, setAdminDialog] = useState({
    open: false,
    user: null,
    loading: false
  });
  
  const [premiumDialog, setPremiumDialog] = useState({
    open: false,
    user: null,
    loading: false,
    months: 1
  });

  const handleAdminStatusClick = (user) => {
    setAdminDialog({
      open: true,
      user: user,
      loading: false
    });
  };

  const handleAdminStatusUpdate = async (newAdminStatus) => {
    try {
      setAdminDialog(prev => ({ ...prev, loading: true }));
      
      await updateUserAdminStatus(adminDialog.user.id, newAdminStatus);
      
      setAdminDialog({ open: false, user: null, loading: false });
      
      if (onReloadUsers) {
        await onReloadUsers();
      }
      
      if (onNotification) {
        onNotification(
          `Admin status ${newAdminStatus ? 'granted to' : 'removed from'} ${adminDialog.user.firstName} ${adminDialog.user.lastName}`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error updating admin status:', error);
      setAdminDialog(prev => ({ ...prev, loading: false }));
      
      if (onNotification) {
        onNotification('Failed to update admin status', 'error');
      }
    }
  };
  
  const handlePremiumClick = (user) => {
    setPremiumDialog({
      open: true,
      user: user,
      loading: false,
      months: 1
    });
  };
  
  const handleGrantPremium = async () => {
    try {
      setPremiumDialog(prev => ({ ...prev, loading: true }));
      
      await grantPremiumAccess(premiumDialog.user.id, premiumDialog.months);
      
      setPremiumDialog({ open: false, user: null, loading: false, months: 1 });
      
      if (onReloadUsers) {
        await onReloadUsers();
      }
      
      if (onNotification) {
        onNotification(
          `Premium access granted to ${premiumDialog.user.firstName} ${premiumDialog.user.lastName} for ${premiumDialog.months} month(s)`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error granting premium access:', error);
      setPremiumDialog(prev => ({ ...prev, loading: false }));
      
      if (onNotification) {
        onNotification('Failed to grant premium access', 'error');
      }
    }
  };

  const columns = [
    {
      field: 'user',
      headerName: 'User',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              bgcolor: '#8b5cf6',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            {params.row?.firstName?.charAt(0)?.toUpperCase() || '?'}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'rgba(15, 23, 42, 0.95)',
                letterSpacing: '-0.01em',
                mb: 0.25
              }}
            >
              {`${params.row.firstName || ''} ${params.row.lastName || ''}`.trim()}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.8125rem',
                color: 'rgba(15, 23, 42, 0.5)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'isAdmin',
      headerName: 'Role',
      width: 130,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <AdminIcon sx={{ fontSize: '1rem' }} /> : <PersonIcon sx={{ fontSize: '1rem' }} />}
          label={params.value ? 'Admin' : 'User'}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: '24px',
            borderRadius: '6px',
            letterSpacing: '-0.01em',
            backgroundColor: params.value ? 'rgba(245, 158, 11, 0.1)' : 'rgba(15, 23, 42, 0.08)',
            color: params.value ? '#d97706' : 'rgba(15, 23, 42, 0.7)',
            border: 'none',
            '& .MuiChip-icon': {
              color: params.value ? '#d97706' : 'rgba(15, 23, 42, 0.5)'
            }
          }}
        />
      )
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <CheckCircle sx={{ fontSize: '1rem' }} /> : <Cancel sx={{ fontSize: '1rem' }} />}
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: '24px',
            borderRadius: '6px',
            letterSpacing: '-0.01em',
            backgroundColor: params.value ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: params.value ? '#059669' : '#dc2626',
            border: 'none',
            '& .MuiChip-icon': {
              color: params.value ? '#059669' : '#dc2626'
            }
          }}
        />
      )
    },
    {
      field: 'subscriptionStatus',
      headerName: 'Subscription',
      width: 180,
      renderCell: (params) => {
        const status = params.value || 'Free';
        const config = {
          'Admin': { color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)' },
          'Premium': { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
          'Premium (Granted)': { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
          'Trial': { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
          'Free': { color: 'rgba(15, 23, 42, 0.7)', bg: 'rgba(15, 23, 42, 0.08)' }
        };
        
        const { color, bg } = config[status] || config['Free'];
        
        return (
          <Chip
            label={status}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              borderRadius: '6px',
              letterSpacing: '-0.01em',
              backgroundColor: bg,
              color: color,
              border: 'none'
            }}
          />
        );
      }
    },
    {
      field: 'lastLoginDate',
      headerName: 'Last Login',
      width: 140,
      valueFormatter: (value) => {
        if (!value) return 'Never';
        return new Date(value).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      },
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8125rem',
            color: 'rgba(15, 23, 42, 0.6)',
            fontWeight: 500
          }}
        >
          {params.formattedValue}
        </Typography>
      )
    },
    {
      field: 'dateEntered',
      headerName: 'Joined',
      width: 140,
      valueFormatter: (value) => {
        if (!value) return 'N/A';
        return new Date(value).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      },
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.8125rem',
            color: 'rgba(15, 23, 42, 0.6)',
            fontWeight: 500
          }}
        >
          {params.formattedValue}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit User" arrow>
            <IconButton
              size="small"
              onClick={() => onEditUser && onEditUser(params.row)}
              sx={{
                color: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                borderRadius: '8px',
                width: 32,
                height: 32,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.15)',
                }
              }}
            >
              <EditIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.isAdmin ? "Remove Admin" : "Make Admin"} arrow>
            <IconButton
              size="small"
              onClick={() => handleAdminStatusClick(params.row)}
              sx={{
                color: params.row.isAdmin ? '#dc2626' : '#f59e0b',
                backgroundColor: params.row.isAdmin ? 'rgba(220, 38, 38, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                borderRadius: '8px',
                width: 32,
                height: 32,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: params.row.isAdmin ? 'rgba(220, 38, 38, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                }
              }}
            >
              <SecurityIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Grant Premium" arrow>
            <IconButton
              size="small"
              onClick={() => handlePremiumClick(params.row)}
              sx={{
                color: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                borderRadius: '8px',
                width: 32,
                height: 32,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                }
              }}
            >
              <StarIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'white',
          border: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          slots={{ toolbar: CustomToolbar }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          autoHeight
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
      </Paper>

      {/* Admin Status Dialog */}
      <Dialog
        open={adminDialog.open}
        onClose={() => !adminDialog.loading && setAdminDialog({ open: false, user: null, loading: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b'
              }}
            >
              <SecurityIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
              Change Admin Status
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2.5, color: 'rgba(15, 23, 42, 0.8)' }}>
            Are you sure you want to {adminDialog.user?.isAdmin ? 'remove admin privileges from' : 'grant admin privileges to'}{' '}
            <strong>{adminDialog.user?.firstName} {adminDialog.user?.lastName}</strong>?
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: 'rgba(245, 158, 11, 0.05)', 
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.1)'
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(15, 23, 42, 0.7)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {adminDialog.user?.isAdmin 
                ? 'This user will lose access to admin features and user management capabilities.'
                : 'This user will gain access to admin features including user management, system settings, and advanced reports.'
              }
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button 
            onClick={() => setAdminDialog({ open: false, user: null, loading: false })}
            disabled={adminDialog.loading}
            sx={{
              color: 'rgba(15, 23, 42, 0.7)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9375rem',
              px: 2.5,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleAdminStatusUpdate(!adminDialog.user?.isAdmin)}
            disabled={adminDialog.loading}
            variant="contained"
            sx={{
              background: adminDialog.user?.isAdmin 
                ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9375rem',
              px: 2.5,
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': {
                background: adminDialog.user?.isAdmin 
                  ? 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)'
                  : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                boxShadow: 'none'
              }
            }}
          >
            {adminDialog.loading ? 'Updating...' : (adminDialog.user?.isAdmin ? 'Remove Admin' : 'Make Admin')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Premium Dialog */}
      <Dialog
        open={premiumDialog.open}
        onClose={() => !premiumDialog.loading && setPremiumDialog({ open: false, user: null, loading: false, months: 1 })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6'
              }}
            >
              <StarIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
              Grant Premium Access
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: 'rgba(15, 23, 42, 0.8)' }}>
            Grant premium access to <strong>{premiumDialog.user?.firstName} {premiumDialog.user?.lastName}</strong>
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: 'rgba(15, 23, 42, 0.7)', fontSize: '0.875rem' }}>
              Duration (months)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[1, 2, 3, 6, 12].map((months) => (
                <Button
                  key={months}
                  variant={premiumDialog.months === months ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setPremiumDialog(prev => ({ ...prev, months }))}
                  disabled={premiumDialog.loading}
                  sx={{
                    minWidth: '60px',
                    background: premiumDialog.months === months 
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                      : 'transparent',
                    borderColor: premiumDialog.months === months ? 'transparent' : 'rgba(139, 92, 246, 0.3)',
                    color: premiumDialog.months === months ? 'white' : '#8b5cf6',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    '&:hover': {
                      background: premiumDialog.months === months 
                        ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                        : 'rgba(139, 92, 246, 0.08)',
                      borderColor: premiumDialog.months === months ? 'transparent' : '#8b5cf6',
                      boxShadow: 'none'
                    }
                  }}
                >
                  {months}
                </Button>
              ))}
            </Box>
          </Box>
          
          <Box sx={{ 
            p: 2.5, 
            bgcolor: 'rgba(139, 92, 246, 0.05)', 
            borderRadius: '12px', 
            border: '1px solid rgba(139, 92, 246, 0.1)' 
          }}>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: 'rgba(15, 23, 42, 0.7)', fontSize: '0.875rem' }}>
              This will grant the user:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              <Typography component="li" variant="body2" sx={{ color: 'rgba(15, 23, 42, 0.7)', mb: 0.5, fontSize: '0.875rem' }}>
                Unlimited clients, categories, products
              </Typography>
              <Typography component="li" variant="body2" sx={{ color: 'rgba(15, 23, 42, 0.7)', mb: 0.5, fontSize: '0.875rem' }}>
                Unlimited invoices per month
              </Typography>
              <Typography component="li" variant="body2" sx={{ color: 'rgba(15, 23, 42, 0.7)', mb: 0.5, fontSize: '0.875rem' }}>
                Access to custom templates
              </Typography>
              <Typography component="li" variant="body2" sx={{ color: 'rgba(15, 23, 42, 0.7)', fontSize: '0.875rem' }}>
                PDF exports without watermarks
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button 
            onClick={() => setPremiumDialog({ open: false, user: null, loading: false, months: 1 })}
            disabled={premiumDialog.loading}
            sx={{
              color: 'rgba(15, 23, 42, 0.7)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9375rem',
              px: 2.5,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGrantPremium}
            disabled={premiumDialog.loading}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9375rem',
              px: 2.5,
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                boxShadow: 'none'
              }
            }}
          >
            {premiumDialog.loading ? 'Granting...' : `Grant ${premiumDialog.months} Month${premiumDialog.months > 1 ? 's' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersDataGridNew;
