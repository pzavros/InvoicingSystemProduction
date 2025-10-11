// src/components/UserManagementPage/UsersDataGrid.jsx
import React, { useState } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarColumnsButton
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
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { updateUserAdminStatus } from './api';

const CustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
};

const UsersDataGrid = ({ 
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

  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 70,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {params.row?.firstName?.charAt(0)?.toUpperCase() || '?'}
        </Avatar>
      )
    },
    {
      field: 'fullName',
      headerName: 'Name',
      width: 200,
      valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim(),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
    },
    {
      field: 'isAdmin',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <AdminIcon /> : <PersonIcon />}
          label={params.value ? 'Admin' : 'User'}
          color={params.value ? 'warning' : 'default'}
          variant="outlined"
          size="small"
        />
      )
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'error'}
          variant="outlined"
          size="small"
        />
      )
    },
    {
      field: 'subscriptionPlan',
      headerName: 'Subscription',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value || 'Free'}
          color={params.value === 'Premium' ? 'primary' : 'default'}
          variant="outlined"
          size="small"
        />
      )
    },
    {
      field: 'lastLoginDate',
      headerName: 'Last Login',
      width: 180,
      valueFormatter: (value) => {
        if (!value) return 'Never';
        return new Date(value).toLocaleDateString();
      }
    },
    {
      field: 'dateEntered',
      headerName: 'Joined',
      width: 150,
      valueFormatter: (value) => {
        if (!value) return 'N/A';
        return new Date(value).toLocaleDateString();
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={
            <Tooltip title="Edit User">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => onEditUser && onEditUser(params.row)}
        />,
        <GridActionsCellItem
          key="admin"
          icon={
            <Tooltip title={params.row.isAdmin ? "Remove Admin" : "Make Admin"}>
              <SecurityIcon />
            </Tooltip>
          }
          label="Admin Status"
          onClick={() => handleAdminStatusClick(params.row)}
        />
      ]
    }
  ];

  return (
    <>
      <Box sx={{ height: 600, width: '100%' }}>
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
          pageSizeOptions={[5, 10, 25]}
          sx={{
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-main': {
              borderRadius: 2,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#fafafa',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
        />
      </Box>

      {/* Admin Status Change Dialog */}
      <Dialog
        open={adminDialog.open}
        onClose={() => !adminDialog.loading && setAdminDialog({ open: false, user: null, loading: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon color="warning" />
            Change Admin Status
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to {adminDialog.user?.isAdmin ? 'remove admin privileges from' : 'grant admin privileges to'}{' '}
            <strong>{adminDialog.user?.firstName} {adminDialog.user?.lastName}</strong>?
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {adminDialog.user?.isAdmin 
                ? 'This user will lose access to admin features and user management capabilities.'
                : 'This user will gain access to admin features including user management, system settings, and advanced reports.'
              }
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAdminDialog({ open: false, user: null, loading: false })}
            disabled={adminDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleAdminStatusUpdate(!adminDialog.user?.isAdmin)}
            disabled={adminDialog.loading}
            variant="contained"
            color={adminDialog.user?.isAdmin ? 'error' : 'warning'}
          >
            {adminDialog.loading ? 'Updating...' : (adminDialog.user?.isAdmin ? 'Remove Admin' : 'Make Admin')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersDataGrid;
