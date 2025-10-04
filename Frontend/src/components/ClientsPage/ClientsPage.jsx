import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Fade,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Receipt as InvoiceIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { getAllClients, searchClients, deleteClient } from './api';
import ClientForm from './ClientForm';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await getAllClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      showNotification('Failed to load clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    try {
      const results = await searchClients(searchTerm);
      setFilteredClients(results);
    } catch (error) {
      console.error('Error searching clients:', error);
      setFilteredClients(clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
    }
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClient(clientToDelete.id);
      await loadClients();
      showNotification(`Client "${clientToDelete.name}" deleted successfully`, 'success');
    } catch (error) {
      console.error('Error deleting client:', error);
      showNotification('Failed to delete client', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedClient(null);
    loadClients();
    showNotification(
      selectedClient ? 'Client updated successfully' : 'Client created successfully',
      'success'
    );
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 3
    }}>
      {/* Header Section */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Client Management
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Manage your client relationships and contact information
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClient}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.45)'
                }
              }}
            >
              Add Client
            </Button>
          </Box>

          {/* Search Bar */}
          <Card elevation={3} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
            <CardContent sx={{ p: 2 }}>
              <TextField
                fullWidth
                placeholder="Search clients by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Fade in timeout={800}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent sx={{ color: 'white', textAlign: 'center', py: 3 }}>
                <PersonIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold">{clients.length}</Typography>
                <Typography variant="body1">Total Clients</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: '16px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
              <CardContent sx={{ color: 'white', textAlign: 'center', py: 3 }}>
                <BusinessIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold">
                  {clients.filter(c => c.isActive).length}
                </Typography>
                <Typography variant="body1">Active Clients</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: '16px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <CardContent sx={{ color: 'white', textAlign: 'center', py: 3 }}>
                <MoneyIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(clients.reduce((sum, client) => sum + client.totalInvoiceAmount, 0))}
                </Typography>
                <Typography variant="body1">Total Revenue</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3} sx={{ borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <CardContent sx={{ color: 'white', textAlign: 'center', py: 3 }}>
                <InvoiceIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold">
                  {clients.reduce((sum, client) => sum + client.totalInvoiceCount, 0)}
                </Typography>
                <Typography variant="body1">Total Invoices</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Fade>

      {/* Clients Grid */}
      <Grid container spacing={3}>
        {filteredClients.map((client, index) => (
          <Grow in timeout={600 + index * 100} key={client.id}>
            <Grid item xs={12} sm={6} lg={4}>
              <Card
                elevation={4}
                sx={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  background: 'rgba(255, 255, 255, 0.95)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
                    background: 'rgba(255, 255, 255, 1)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Client Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        mr: 2
                      }}
                    >
                      {client.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {client.name}
                      </Typography>
                      {client.company && (
                        <Typography variant="body2" color="text.secondary">
                          {client.company}
                        </Typography>
                      )}
                      <Chip
                        label={client.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={client.isActive ? 'success' : 'default'}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>

                  {/* Contact Info */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                        {client.email}
                      </Typography>
                    </Box>
                    {client.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{client.phone}</Typography>
                      </Box>
                    )}
                    {(client.city || client.country) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {[client.city, client.country].filter(Boolean).join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Stats */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    p: 2,
                    mb: 2
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {client.totalInvoiceCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Invoices
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {formatCurrency(client.totalInvoiceAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Revenue
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {formatDate(client.lastInvoiceDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Last Invoice
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit Client">
                      <IconButton
                        onClick={() => handleEditClient(client)}
                        sx={{
                          flex: 1,
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          color: '#667eea',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.2)',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Client">
                      <IconButton
                        onClick={() => handleDeleteClick(client)}
                        sx={{
                          flex: 1,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grow>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredClients.length === 0 && !loading && (
        <Fade in timeout={800}>
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            color: 'text.secondary' 
          }}>
            <PersonIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" gutterBottom>
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'Add your first client to get started'
              }
            </Typography>
            {!searchTerm && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddClient}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px'
                }}
              >
                Add Your First Client
              </Button>
            )}
          </Box>
        </Fade>
      )}

      {/* Client Form Dialog */}
      <ClientForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedClient(null);
        }}
        onSuccess={handleFormSuccess}
        client={selectedClient}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" component="div">
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{clientToDelete?.name}</strong>?
            This action cannot be undone.
          </Typography>
          {clientToDelete?.totalInvoiceCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This client has {clientToDelete.totalInvoiceCount} invoice(s) associated with them.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientsPage;
