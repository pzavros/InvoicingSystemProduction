// src/components/UserManagementPage/UserManagementPageHeader.jsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  PersonAdd,
  People,
  AdminPanelSettings,
  Person
} from '@mui/icons-material';

const UserManagementPageHeader = ({ 
  totalUsers, 
  adminUsers, 
  activeUsers,
  onAddUser 
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system users and their permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={onAddUser}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: 2
          }}
        >
          Add New User
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: 'primary.main' }}>
                  <People fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: 'success.main' }}>
                  <Person fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: 'warning.main' }}>
                  <AdminPanelSettings fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {adminUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admin Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserManagementPageHeader;
