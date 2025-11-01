// src/components/ProductCatalogPage/ProductFormPage.jsx
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
  OutlinedInput,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from "@mui/icons-material";
import { createProduct, updateProduct, getProductById, getAllCategories } from "./api";
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

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  // Freemium limit checking
  const { checkLimit, limitModalOpen, limitModalResource, closeLimitModal } = useLimit();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    unitPrice: "",
    unit: "pcs",
    stockQuantity: "",
    minStockLevel: "10",
    isTaxable: false,
    taxRate: "19.00",
    isActive: true,
    trackInventory: false
  });
  
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    loadCategories();
    if (isEditing) loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const loadCategories = async () => {
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      setNotification({
        show: true,
        message: "Error loading categories: " + error.message,
        severity: "error"
      });
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await getProductById(id);
      setFormData({
        name: productData.name || "",
        description: productData.description || "",
        categoryId: productData.categoryId || "",
        unitPrice: productData.unitPrice?.toString() || "",
        unit: productData.unit || "pcs",
        stockQuantity: productData.stockQuantity?.toString() || "",
        minStockLevel: productData.minStockLevel?.toString() || "10",
        isTaxable: productData.isTaxable || false,
        taxRate: productData.taxRate?.toString() || "19.00",
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        trackInventory: productData.trackInventory || false
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Error loading product: " + error.message,
        severity: "error"
      });
      navigate('/products');
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

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.unitPrice || isNaN(formData.unitPrice) || parseFloat(formData.unitPrice) < 0) {
      newErrors.unitPrice = "Valid unit price is required";
    }

    if (formData.trackInventory) {
      if (!formData.stockQuantity || isNaN(formData.stockQuantity) || parseInt(formData.stockQuantity) < 0) {
        newErrors.stockQuantity = "Valid stock quantity is required when tracking inventory";
      }
      if (!formData.minStockLevel || isNaN(formData.minStockLevel) || parseInt(formData.minStockLevel) < 0) {
        newErrors.minStockLevel = "Valid minimum stock level is required when tracking inventory";
      }
    }

    if (formData.isTaxable && (!formData.taxRate || isNaN(formData.taxRate) || parseFloat(formData.taxRate) < 0)) {
      newErrors.taxRate = "Valid tax rate is required when taxable";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    
    // For new products (not edits), check the limit first
    if (!isEditing) {
      const canCreate = checkLimit('product');
      if (!canCreate) {
        // Limit modal will be shown automatically by useLimit hook
        return;
      }
    }

    try {
      setSaving(true);
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        unitPrice: parseFloat(formData.unitPrice),
        unit: formData.unit,
        stockQuantity: formData.trackInventory ? parseInt(formData.stockQuantity) : 0,
        minStockLevel: formData.trackInventory ? parseInt(formData.minStockLevel) : 0,
        trackInventory: formData.trackInventory,
        isTaxable: formData.isTaxable,
        taxRate: formData.isTaxable ? parseFloat(formData.taxRate) : 0,
        isActive: formData.isActive
      };

      if (isEditing) {
        await updateProduct(id, productData);
        setNotification({
          show: true,
          message: "Product updated successfully!",
          severity: "success"
        });
      } else {
        await createProduct(productData);
        setNotification({
          show: true,
          message: "Product created successfully!",
          severity: "success"
        });
      }

      setTimeout(() => navigate("/products"), 1200);
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
          message: `Error ${isEditing ? "updating" : "creating"} product: ${
            error.message
          }`,
          severity: "error"
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => navigate("/products");

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
            {isEditing ? "Edit Product" : "Add New Product"}
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

        <FormGrid size={{ xs: 12, md: 8 }}>
          <FormLabel htmlFor="name">Product Name *</FormLabel>
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
          <FormLabel htmlFor="categoryId">Category</FormLabel>
          <FormControl fullWidth size="small">
            <Select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange("categoryId")}
              displayEmpty
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
            >
              <MenuItem value="">None</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FormGrid>

        <FormGrid size={{ xs: 12 }}>
          <FormLabel htmlFor="description">Description</FormLabel>
          <OutlinedInput
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange("description")}
            placeholder="Product description..."
            multiline
            rows={3}
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

        {/* Pricing & Tax */}
        <SectionTitle>Pricing & Tax</SectionTitle>

        <FormGrid size={{ xs: 12, md: 6 }}>
          <FormLabel htmlFor="unitPrice">Unit Price *</FormLabel>
          <OutlinedInput
            id="unitPrice"
            name="unitPrice"
            type="number"
            value={formData.unitPrice}
            onChange={handleChange("unitPrice")}
            error={!!errors.unitPrice}
            required
            size="small"
            fullWidth
            startAdornment={<InputAdornment position="start">€</InputAdornment>}
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
          {errors.unitPrice && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.unitPrice}
            </Typography>
          )}
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 6 }}>
          <FormLabel htmlFor="unit">Unit of Measure</FormLabel>
          <OutlinedInput
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange("unit")}
            placeholder="e.g., pcs, kg, hours"
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
          <FormControlLabel
            control={
              <Switch
                checked={formData.isTaxable}
                onChange={handleChange("isTaxable")}
              />
            }
            label="Taxable Product"
          />
        </FormGrid>

        {formData.isTaxable && (
          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel htmlFor="taxRate">Tax Rate</FormLabel>
            <OutlinedInput
              id="taxRate"
              name="taxRate"
              type="number"
              value={formData.taxRate}
              onChange={handleChange("taxRate")}
              error={!!errors.taxRate}
              size="small"
              fullWidth
              endAdornment={<InputAdornment position="end">%</InputAdornment>}
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
            {errors.taxRate && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.taxRate}
              </Typography>
            )}
          </FormGrid>
        )}

        {/* Inventory Management */}
        <SectionTitle>Inventory Management</SectionTitle>

        <FormGrid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.trackInventory}
                onChange={handleChange("trackInventory")}
              />
            }
            label="Track Inventory for this Product"
          />
        </FormGrid>

        {formData.trackInventory && (
          <>
            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormLabel htmlFor="stockQuantity">Current Stock Quantity</FormLabel>
              <OutlinedInput
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={handleChange("stockQuantity")}
                error={!!errors.stockQuantity}
                size="small"
                fullWidth
                inputProps={{ min: 0 }}
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
              {errors.stockQuantity && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.stockQuantity}
                </Typography>
              )}
            </FormGrid>

            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormLabel htmlFor="minStockLevel">Minimum Stock Level</FormLabel>
              <OutlinedInput
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                value={formData.minStockLevel}
                onChange={handleChange("minStockLevel")}
                error={!!errors.minStockLevel}
                size="small"
                fullWidth
                inputProps={{ min: 0 }}
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
              {errors.minStockLevel && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.minStockLevel}
                </Typography>
              )}
            </FormGrid>
          </>
        )}

        {/* Status */}
        <SectionTitle>Status</SectionTitle>

        <FormGrid size={{ xs: 12, md: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange("isActive")}
              />
            }
            label="Active Product"
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
              {saving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
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

export default ProductFormPage;
