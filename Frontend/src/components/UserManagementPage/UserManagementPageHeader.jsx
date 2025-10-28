// src/components/UserManagementPage/UserManagementPageHeader.jsx
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 3
      }}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Manage system users and their permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={!isMobile && <PersonAdd />}
          onClick={onAddUser}
          fullWidth={isMobile}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: 2
          }}
        >
          Add New User
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ borderRadius: { xs: 2, md: 3 } }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
                <Box sx={{ color: 'primary.main' }}>
                  <People fontSize={isMobile ? "medium" : "large"} />
                </Box>
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                    {totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ borderRadius: { xs: 2, md: 3 } }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
                <Box sx={{ color: 'success.main' }}>
                  <Person fontSize={isMobile ? "medium" : "large"} />
                </Box>
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                    {activeUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                    Active Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={3} sx={{ borderRadius: { xs: 2, md: 3 } }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
                <Box sx={{ color: 'warning.main' }}>
                  <AdminPanelSettings fontSize={isMobile ? "medium" : "large"} />
                </Box>
                <Box>
                  <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                    {adminUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
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
