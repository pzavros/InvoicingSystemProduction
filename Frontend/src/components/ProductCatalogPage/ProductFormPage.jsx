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
import LoadingOverlay from '../ReusableComponents/LoadingOverlay';

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
        <CircularProgress sx={{ color: "#8b5cf6" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
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
            {isEditing ? "Edit Product" : "Add New Product"}
          </Typography>
          <Typography variant="body2" sx={{
            color: 'rgba(15, 23, 42, 0.55)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            {isEditing ? "Update product information and settings" : "Create a new product for your catalog"}
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

        <FormGrid size={{ xs: 12, md: 8 }}>
          <FormLabel htmlFor="name" sx={{
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Product Name *
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
          <FormLabel htmlFor="categoryId" sx={{
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Category
          </FormLabel>
          <FormControl fullWidth size="small">
            <Select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange("categoryId")}
              displayEmpty
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
                '& .MuiSelect-select': {
                  padding: '9px 12px'
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '12px',
                    mt: 0.5,
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                    '& .MuiMenuItem-root': {
                      fontSize: '0.875rem',
                      borderRadius: '8px',
                      mx: 1,
                      my: 0.5,
                      '&:hover': {
                        backgroundColor: 'rgba(139, 92, 246, 0.04)'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(139, 92, 246, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(139, 92, 246, 0.12)'
                        }
                      }
                    }
                  }
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
          <FormLabel htmlFor="description" sx={{
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Description
          </FormLabel>
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

        {/* Pricing & Tax */}
        <SectionTitle>Pricing & Tax</SectionTitle>

        <FormGrid size={{ xs: 12, md: 6 }}>
          <FormLabel htmlFor="unitPrice" sx={{
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Unit Price *
          </FormLabel>
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
            startAdornment={<InputAdornment position="start" sx={{ color: '#8b5cf6' }}>€</InputAdornment>}
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
          {errors.unitPrice && (
            <Typography variant="caption" sx={{ 
              mt: 0.5, 
              display: 'block',
              color: '#ef4444',
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
              {errors.unitPrice}
            </Typography>
          )}
        </FormGrid>

        <FormGrid size={{ xs: 12, md: 6 }}>
          <FormLabel htmlFor="unit" sx={{
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.5,
            display: 'block'
          }}>
            Unit of Measure
          </FormLabel>
          <OutlinedInput
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange("unit")}
            placeholder="e.g., pcs, kg, hours"
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

        <FormGrid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isTaxable}
                onChange={handleChange("isTaxable")}
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
            label="Taxable Product"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'rgba(15, 23, 42, 0.75)'
              }
            }}
          />
        </FormGrid>

        {formData.isTaxable && (
          <FormGrid size={{ xs: 12, md: 6 }}>
            <FormLabel htmlFor="taxRate" sx={{
              color: 'rgba(15, 23, 42, 0.75)',
              fontWeight: 600,
              fontSize: '0.875rem',
              mb: 0.5,
              display: 'block'
            }}>
              Tax Rate
            </FormLabel>
            <OutlinedInput
              id="taxRate"
              name="taxRate"
              type="number"
              value={formData.taxRate}
              onChange={handleChange("taxRate")}
              error={!!errors.taxRate}
              size="small"
              fullWidth
              endAdornment={<InputAdornment position="end" sx={{ color: '#8b5cf6' }}>%</InputAdornment>}
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
            {errors.taxRate && (
              <Typography variant="caption" sx={{ 
                mt: 0.5, 
                display: 'block',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
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
            label="Track Inventory for this Product"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'rgba(15, 23, 42, 0.75)'
              }
            }}
          />
        </FormGrid>

        {formData.trackInventory && (
          <>
            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormLabel htmlFor="stockQuantity" sx={{
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 0.5,
                display: 'block'
              }}>
                Current Stock Quantity
              </FormLabel>
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
              {errors.stockQuantity && (
                <Typography variant="caption" sx={{ 
                  mt: 0.5, 
                  display: 'block',
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  {errors.stockQuantity}
                </Typography>
              )}
            </FormGrid>

            <FormGrid size={{ xs: 12, md: 6 }}>
              <FormLabel htmlFor="minStockLevel" sx={{
                color: 'rgba(15, 23, 42, 0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 0.5,
                display: 'block'
              }}>
                Minimum Stock Level
              </FormLabel>
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
              {errors.minStockLevel && (
                <Typography variant="caption" sx={{ 
                  mt: 0.5, 
                  display: 'block',
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
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
            label="Active Product"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'rgba(15, 23, 42, 0.75)'
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
            mt: 2,
            borderTop: "1px solid rgba(15, 23, 42, 0.08)",
            justifyContent: { xs: "stretch", sm: "flex-end" },
            flexDirection: { xs: "column", sm: "row" }
          }}>
            <Button
              onClick={handleBack}
              variant="outlined"
              disabled={saving}
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
              {saving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
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
      <LoadingOverlay open={loading} message={isEditing ? "Loading product..." : "Loading..."} />
    </Box>
  );
};

export default ProductFormPage;
