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
    <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937", mb: 2 }}>
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
    isActive: true,
    defaultPaymentTerms: 30,
    preferredCurrencyId: null
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
        isActive: client.isActive ?? true,
        defaultPaymentTerms: client.defaultPaymentTerms || 30,
        preferredCurrencyId: client.preferredCurrencyId || null
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
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {/* Header */}
      <FormGrid size={{ xs: 12 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {isEditing ? "Edit Client" : "Add New Client"}
          </Typography>
        </Box>
      </FormGrid>

      {/* Notification */}
      {notification.show && (
        <FormGrid size={{ xs: 12 }}>
          <Alert
            severity={notification.severity}
            onClose={() => setNotification({ ...notification, show: false })}
            sx={{ mb: 2 }}
          >
            {notification.message}
          </Alert>
        </FormGrid>
      )}

      {/* Form */}
      <Grid container spacing={{ xs: 2, md: 3 }} component="form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <SectionTitle>Basic Information</SectionTitle>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="name">Full Name *</FormLabel>
          <OutlinedInput
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            required
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
          {errors.name && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.name}
            </Typography>
          )}
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="email">Email Address *</FormLabel>
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
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
          {errors.email && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.email}
            </Typography>
          )}
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="company">Company</FormLabel>
          <OutlinedInput
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange("company")}
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="phone">Phone Number</FormLabel>
          <OutlinedInput
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange("phone")}
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="website">Website</FormLabel>
          <OutlinedInput
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange("website")}
            placeholder="https://example.com"
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="taxNumber">Tax Number</FormLabel>
          <OutlinedInput
            id="taxNumber"
            name="taxNumber"
            value={formData.taxNumber}
            onChange={handleChange("taxNumber")}
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        {/* Address */}
        <SectionTitle>Address</SectionTitle>

        <FormGrid size={{ xs: 12, md: 6 }}>
          <FormLabel htmlFor="address">Address</FormLabel>
          <OutlinedInput
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange("address")}
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 6 }}>
          <FormLabel htmlFor="city">City</FormLabel>
          <OutlinedInput
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange("city")}
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="state">State/Province</FormLabel>
          <OutlinedInput
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange("state")}
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="postalCode">Postal Code</FormLabel>
          <OutlinedInput
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange("postalCode")}
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="country">Country</FormLabel>
          <OutlinedInput
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange("country")}
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
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
              />
            }
            label="Active Client"
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="defaultPaymentTerms">Default Payment Terms (days)</FormLabel>
          <OutlinedInput
            id="defaultPaymentTerms"
            name="defaultPaymentTerms"
            type="number"
            value={formData.defaultPaymentTerms}
            onChange={handleChange("defaultPaymentTerms")}
            inputProps={{ min: 0 }}
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormLabel htmlFor="preferredCurrencyId">Preferred Currency (ID)</FormLabel>
          <OutlinedInput
            id="preferredCurrencyId"
            name="preferredCurrencyId"
            value={formData.preferredCurrencyId ?? ""}
            onChange={handleChange("preferredCurrencyId")}
            placeholder="e.g., 978 (EUR)"
            size="small"
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        {/* Notes */}
        <SectionTitle>Notes</SectionTitle>

        <FormGrid size={{ xs: 12 }}>
          <FormLabel htmlFor="notes">Notes</FormLabel>
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
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#d1d5db',
                borderWidth: '1.5px'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9ca3af'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3b82f6',
                borderWidth: '2px'
              }
            }}
          />
        </FormGrid>

        {/* Actions */}
        <FormGrid size={{ xs: 12 }}>
          <Box sx={{ 
            display: "flex", 
            gap: 3, 
            pt: 6,
            mt: 2,
            borderTop: "2px solid #e5e7eb",
            justifyContent: { xs: "stretch", sm: "flex-start" },
            flexDirection: { xs: "column", sm: "row" }
          }}>
            <Button
              onClick={handleBack}
              variant="outlined"
              disabled={saving}
              size="large"
              sx={{
                borderColor: "#d1d5db",
                color: "#6b7280",
                borderWidth: 2,
                px: 5,
                py: 1.5,
                fontSize: "0.95rem",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                },
                "&:active": {
                  transform: "translateY(0)"
                },
                transition: "all 0.2s ease"
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              size="large"
              sx={{
                backgroundColor: "#3b82f6",
                px: 5,
                py: 1.5,
                fontSize: "0.95rem",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                "&:hover": {
                  backgroundColor: "#2563eb",
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4)"
                },
                "&:active": {
                  transform: "translateY(0)"
                },
                "&:disabled": {
                  backgroundColor: "#9ca3af",
                  boxShadow: "none",
                  transform: "none"
                },
                transition: "all 0.2s ease"
              }}
            >
              {saving ? "Saving..." : isEditing ? "Update Client" : "Create Client"}
            </Button>
          </Box>
        </FormGrid>
      </Grid>
      
      {/* Freemium Limit Reached Modal */}
      <LimitReachedModal
        open={limitModalOpen}
        onClose={closeLimitModal}
        resource={limitModalResource}
      />
    </Grid>
  );
};

export default ClientFormPage;
