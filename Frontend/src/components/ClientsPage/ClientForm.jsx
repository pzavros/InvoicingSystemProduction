import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { createClient, updateClient } from './api';
import { getAllCurrencies } from '../InvoicePage/api';

const ClientForm = ({ open, onClose, onSuccess, client = null }) => {
  const isEditing = Boolean(client);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    website: '',
    taxNumber: '',
    notes: '',
    isActive: true,
    defaultPaymentTerms: 30,
    preferredCurrencyId: null
  });

  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCurrencies();
  }, []);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        company: client.company || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        postalCode: client.postalCode || '',
        country: client.country || '',
        website: client.website || '',
        taxNumber: client.taxNumber || '',
        notes: client.notes || '',
        isActive: client.isActive ?? true,
        defaultPaymentTerms: client.defaultPaymentTerms || 30,
        preferredCurrencyId: client.preferredCurrencyId || null
      });
    } else {
      // Reset form for new client
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        website: '',
        taxNumber: '',
        notes: '',
        isActive: true,
        defaultPaymentTerms: 30,
        preferredCurrencyId: null
      });
    }
    setError('');
    setErrors({});
  }, [client, open]);

  const loadCurrencies = async () => {
    try {
      const data = await getAllCurrencies();
      setCurrencies(data);
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.defaultPaymentTerms < 1 || formData.defaultPaymentTerms > 365) {
      newErrors.defaultPaymentTerms = 'Payment terms must be between 1 and 365 days';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Clean up the data
      const cleanFormData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        company: formData.company.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        postalCode: formData.postalCode.trim() || null,
        country: formData.country.trim() || null,
        website: formData.website.trim() || null,
        taxNumber: formData.taxNumber.trim() || null,
        notes: formData.notes.trim() || null,
        preferredCurrencyId: formData.preferredCurrencyId || null
      };

      if (isEditing) {
        await updateClient(client.id, cleanFormData);
      } else {
        await createClient(cleanFormData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving client:', error);
      if (error.message.includes('already exists')) {
        setErrors({ email: 'A client with this email already exists' });
      } else {
        setError(error.message || 'Failed to save client. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Typography 
          variant="h5" 
          component="div"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isEditing ? 'Edit Client' : 'Add New Client'}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pb: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                Address Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleInputChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State/Province"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                error={!!errors.website}
                helperText={errors.website || "Include http:// or https://"}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            {/* Business Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
                Business Settings
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax Number"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={handleInputChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Default Payment Terms (days)"
                name="defaultPaymentTerms"
                type="number"
                inputProps={{ min: 1, max: 365 }}
                value={formData.defaultPaymentTerms}
                onChange={handleInputChange}
                error={!!errors.defaultPaymentTerms}
                helperText={errors.defaultPaymentTerms}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Preferred Currency</InputLabel>
                <Select
                  name="preferredCurrencyId"
                  value={formData.preferredCurrencyId || ''}
                  onChange={handleInputChange}
                  label="Preferred Currency"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {currencies.map((currency) => (
                    <MenuItem key={currency.id} value={currency.id}>
                      {currency.name} ({currency.symbol})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="Active Client"
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes about this client..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            sx={{ borderRadius: '12px' }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minWidth: '120px',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              isEditing ? 'Update Client' : 'Create Client'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ClientForm;
