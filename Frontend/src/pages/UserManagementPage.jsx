import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { Edit, AdminPanelSettings, Person } from '@mui/icons-material';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Placeholder for fetching users - will need to implement API endpoint
    setLoading(false);
    setUsers([
      {
        id: 1,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isAdmin: false,
        subscriptionPlan: 'Premium',
        dateEntered: '2024-01-15'
      },
      {
        id: 2,
        email: 'admin@invoicesystem.com',
        firstName: 'System',
        lastName: 'Administrator',
        isActive: true,
        isAdmin: true,
        subscriptionPlan: 'Admin',
        dateEntered: '2024-01-01'
      }
    ]);
  }, []);

  const handleAdminToggle = async (userId, currentStatus) => {
    try {
      // Placeholder for API call to toggle admin status
      console.log(`Toggling admin status for user ${userId} to ${!currentStatus}`);
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !currentStatus } : user
      ));
    } catch (error) {
      setError('Failed to update admin status');
    }
  };

  const handleActiveToggle = async (userId, currentStatus) => {
    try {
      // Placeholder for API call to toggle active status
      console.log(`Toggling active status for user ${userId} to ${!currentStatus}`);
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (error) {
      setError('Failed to update active status');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users and their permissions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subscription</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Joined</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {user.isAdmin ? (
                        <AdminPanelSettings color="error" />
                      ) : (
                        <Person color="action" />
                      )}
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        checked={user.isActive}
                        onChange={() => handleActiveToggle(user.id, user.isActive)}
                        size="small"
                      />
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        checked={user.isAdmin}
                        onChange={() => handleAdminToggle(user.id, user.isAdmin)}
                        size="small"
                        color="error"
                      />
                      <Chip
                        label={user.isAdmin ? 'Admin' : 'User'}
                        color={user.isAdmin ? 'error' : 'primary'}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={user.subscriptionPlan}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(user.dateEntered).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <IconButton size="small" color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Note:</strong> This is a placeholder implementation. 
            The actual user management functionality will require backend API endpoints to be implemented.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
};

export default UserManagementPage;
