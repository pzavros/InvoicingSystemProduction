// src/components/UserManagementPage/UserFormPage.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import Section from '../ReusableComponents/Section';

const UserFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isActive: true,
    isAdmin: false,
    subscriptionPlan: 'Free'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isEditing && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!isEditing && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Here you would make API calls to create/update user
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  return (
    <Section>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {isEditing ? 'Edit User' : 'Add New User'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isEditing ? 'Update user information and permissions' : 'Create a new user account'}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ p: 3, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                User Information
              </Typography>
            </Box>
          </Box>

          <Box sx={{ px: 3, pb: 3 }}>
            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                User {isEditing ? 'updated' : 'created'} successfully! Redirecting...
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={loading || isEditing}
                          helperText={isEditing ? "Email cannot be changed" : ""}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Authentication */}
              {!isEditing && (
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Authentication
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            helperText="Minimum 6 characters"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Permissions & Status */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Permissions & Status
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            name="isActive"
                            color="success"
                            disabled={loading}
                          />
                        }
                        label="Active User"
                        disabled={loading}
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isAdmin}
                            onChange={handleInputChange}
                            name="isAdmin"
                            color="warning"
                            disabled={loading}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AdminIcon fontSize="small" />
                            Administrator
                          </Box>
                        }
                        disabled={loading}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                startIcon={<CancelIcon />}
                sx={{ minWidth: 120 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Section>
  );
};

export default UserFormPage;
