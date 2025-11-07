// src/components/ClientsPage/ClientFormPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  CircularProgress,
  IconButton,
  Alert,
  FormLabel,
  OutlinedInput
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from "@mui/icons-material";
import { createClient, updateClient, getClientById } from "./api";
import LimitReachedModal from "../SubscriptionPage/LimitReachedModal";
import { useLimit } from "../../utils/useLimit";

/** ---------- Form Components ---------- **/
const FormGrid = ({ size, children }) => (
  <Grid size={size}>
    {children}
  </Grid>
);

const SectionTitle = ({ children }) => (
  <FormGrid size={{ xs: 12 }}>
    <Typography variant="h6" sx={{ 
      fontWeight: 600, 
      color: 'rgba(15, 23, 42, 0.95)', 
      mb: 2,
      mt: 3,
      fontSize: '1rem',
      letterSpacing: '-0.02em',
      borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
      pb: 1.5
    }}>
      {children}
    </Typography>
  </FormGrid>
);
/** -------------------------------------------------------------------- **/

const ClientFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  // Freemium limit checking
  const { checkLimit, limitModalOpen, limitModalResource, closeLimitModal } = useLimit();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    website: "",
    taxNumber: "",
    notes: "",
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    if (isEditing) loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const client = await getClientById(id);
      setFormData({
        name: client.name || "",
        email: client.email || "",
        company: client.company || "",
        phone: client.phone || "",
        address: client.address || "",
        city: client.city || "",
        state: client.state || "",
        postalCode: client.postalCode || "",
        country: client.country || "",
        website: client.website || "",
        taxNumber: client.taxNumber || "",
        notes: client.notes || "",
        isActive: client.isActive ?? true
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Error loading client: " + error.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // normalize website if user typed without protocol
    if (formData.website && !/^https?:\/\//i.test(formData.website)) {
      if (formData.website.trim()) {
        setFormData((prev) => ({
          ...prev,
          website: `https://${formData.website}`
        }));
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    
    // For new clients (not edits), check the limit first
    if (!isEditing) {
      const canCreate = checkLimit('client');
      if (!canCreate) {
        // Limit modal will be shown automatically by useLimit hook
        return;
      }
    }

    try {
      setSaving(true);
      if (isEditing) {
        await updateClient(id, formData);
        setNotification({
          show: true,
          message: "Client updated successfully!",
          severity: "success"
        });
      } else {
        await createClient(formData);
        setNotification({
          show: true,
          message: "Client created successfully!",
          severity: "success"
        });
      }

      setTimeout(() => navigate("/clients"), 1200);
    } catch (error) {
      // Check if it's a limit error from the backend
      if (error.response?.status === 403 && error.response?.data?.limitReached) {
        setNotification({
          show: true,
          message: error.response.data.message || "You have reached your limit for this resource.",
          severity: "error"
        });
      } else {
        setNotification({
          show: true,
          message: `Error ${isEditing ? "updating" : "creating"} client: ${
            error.message
          }`,
          severity: "error"
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => navigate("/clients");

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
        <CircularProgress sx={{ color: "#10b981" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        pb: 2,
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
      }}>
        <IconButton 
          onClick={handleBack}
          sx={{ 
            mr: 2,
            width: 40,
            height: 40,
            borderRadius: '10px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.02)',
            color: 'rgba(15, 23, 42, 0.65)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.06)',
              borderColor: 'rgba(15, 23, 42, 0.12)',
              color: 'rgba(15, 23, 42, 0.85)'
            }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            color: 'rgba(15, 23, 42, 0.95)',
            fontSize: { xs: '1.5rem', sm: '2rem' },
            letterSpacing: '-0.02em',
            mb: 0.5
          }}>
            {isEditing ? 'Edit Client' : 'Add New Client'}
          </Typography>
          <Typography variant="body2" sx={{
            color: 'rgba(15, 23, 42, 0.55)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            {isEditing ? 'Update client information' : 'Create a new client for your invoices'}
          </Typography>
        </Box>
      </Box>

      {/* Notification */}
      {notification.show && (
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, show: false })}
          sx={{ 
            mb: 2,
            borderRadius: '12px',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            '& .MuiAlert-icon': {
              color: notification.severity === 'success' ? '#10b981' : 
                     notification.severity === 'error' ? '#ef4444' : '#8b5cf6'
            }
          }}
        >
          {notification.message}
        </Alert>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
        {/* Basic Information */}
        <SectionTitle>Basic Information</SectionTitle>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Full Name *
          </FormLabel>
          <OutlinedInput
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            required
            size="small"
            fullWidth
            placeholder="John Doe"
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: errors.name ? '#ef4444' : 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: errors.name ? '#ef4444' : 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: errors.name ? '#ef4444' : 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
          {errors.name && (
            <Typography variant="caption" sx={{ 
              mt: 0.5, 
              display: 'block',
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
              {errors.name}
            </Typography>
          )}
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Email Address *
          </FormLabel>
          <OutlinedInput
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            error={!!errors.email}
            required
            size="small"
            fullWidth
            placeholder="john@example.com"
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: errors.email ? '#ef4444' : 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: errors.email ? '#ef4444' : 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: errors.email ? '#ef4444' : 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
          {errors.email && (
            <Typography variant="caption" sx={{ 
              mt: 0.5, 
              display: 'block',
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
              {errors.email}
            </Typography>
          )}
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Company
          </FormLabel>
          <OutlinedInput
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange("company")}
            size="small"
            fullWidth
            placeholder="Acme Inc."
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Phone Number
          </FormLabel>
          <OutlinedInput
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange("phone")}
            size="small"
            fullWidth
            placeholder="+1 (555) 123-4567"
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Website
          </FormLabel>
          <OutlinedInput
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange("website")}
            placeholder="https://example.com"
            size="small"
            fullWidth
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Tax Number
          </FormLabel>
          <OutlinedInput
            id="taxNumber"
            name="taxNumber"
            value={formData.taxNumber}
            onChange={handleChange("taxNumber")}
            size="small"
            fullWidth
            placeholder="123-45-6789"
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
        </FormGrid>

        {/* Address */}
        <SectionTitle>Address</SectionTitle>

        <FormGrid size={{ xs: 12, md: 6 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Address
          </FormLabel>
          <OutlinedInput
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange("address")}
            size="small"
            fullWidth
            placeholder="123 Main Street"
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 6 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            City
          </FormLabel>
          <OutlinedInput
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange("city")}
            size="small"
            fullWidth
            placeholder="New York"
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            State/Province
          </FormLabel>
          <OutlinedInput
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange("state")}
            size="small"
            fullWidth
            placeholder="NY"
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Postal Code
          </FormLabel>
          <OutlinedInput
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange("postalCode")}
            size="small"
            fullWidth
            placeholder="10001"
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Country
          </FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange("country")}
            size="small"
            fullWidth
            placeholder="United States"
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '9px 12px'
              }
            }}
          />
        </FormGrid>

        {/* Settings */}
        <SectionTitle>Settings</SectionTitle>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange("isActive")}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#8b5cf6'
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#8b5cf6'
                  }
                }}
              />
            }
            label="Active Client"
            sx={{ 
              color: 'rgba(15, 23, 42, 0.75)', 
              fontWeight: 500,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.875rem'
              }
            }}
          />
        </FormGrid>

        {/* Notes */}
        <SectionTitle>Notes</SectionTitle>

        <FormGrid size={{ xs: 12 }}>
          <FormLabel sx={{ 
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Notes
          </FormLabel>
          <OutlinedInput
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange("notes")}
            placeholder="Additional notes about this client..."
            multiline
            rows={4}
            fullWidth
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.08)',
                borderWidth: '1px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.15)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(15, 23, 42, 0.25)',
                borderWidth: '1.5px'
              },
              '& .MuiInputBase-input': {
                padding: '12px'
              }
            }}
          />
        </FormGrid>

        {/* Actions */}
        <FormGrid size={{ xs: 12 }}>
          <Box sx={{ 
            display: "flex", 
            gap: 2, 
            pt: 2.5,
            mt: 4,
            mb: 3,
            borderTop: '1px solid rgba(15, 23, 42, 0.08)',
            justifyContent: { xs: 'stretch', sm: 'flex-end' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Button
              onClick={handleBack}
              disabled={saving}
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SaveIcon sx={{ fontSize: '1.125rem' }} />}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '-0.01em',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 1px 3px rgba(139, 92, 246, 0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)',
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
            >
              {saving ? "Saving..." : isEditing ? "Update Client" : "Create Client"}
            </Button>
          </Box>
        </FormGrid>
        </Grid>
      </Box>
      
      {/* Freemium Limit Reached Modal */}
      <LimitReachedModal
        open={limitModalOpen}
        onClose={closeLimitModal}
        resource={limitModalResource}
      />
    </Box>
  );
};

export default ClientFormPage;
