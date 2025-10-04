// src/components/ProductCatalogPage/ProductForm.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  FormControlLabel,
  Switch,
  InputAdornment,
  Typography,
  Divider
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
  BusinessCenter as ServiceIcon
} from "@mui/icons-material";
import { createProduct, updateProduct } from "./api";

const ProductForm = ({ 
  open, 
  product, 
  categories, 
  onClose, 
  onSave, 
  showNotification 
}) => {  const [formData, setFormData] = useState({
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
    isService: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (product) {
      // Editing existing product
      setFormData({
        name: product.name || "",
        description: product.description || "",
        categoryId: product.categoryId ? product.categoryId.toString() : "",
        unitPrice: product.unitPrice?.toString() || "",
        unit: product.unit || "pcs",
        stockQuantity: product.stockQuantity?.toString() || "",
        minStockLevel: product.minStockLevel?.toString() || "10",
        isTaxable: product.isTaxable ?? true,
        taxRate: product.taxRate?.toString() || "19.00",
        isActive: product.isActive ?? true,
        isService: product.isService ?? false
      });
    } else {      // Creating new product - reset form
      setFormData({
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
        isService: true
      });
    }
    setErrors({});
  }, [product, open]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = "Valid price is required";
    }

    if (!formData.isService) {
      if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
        newErrors.stockQuantity = "Valid stock quantity is required";
      }
      
      if (!formData.minStockLevel || parseInt(formData.minStockLevel) < 0) {
        newErrors.minStockLevel = "Valid low stock threshold is required";
      }
    }

    if (formData.isTaxable && (!formData.taxRate || parseFloat(formData.taxRate) < 0)) {
      newErrors.taxRate = "Valid tax rate is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        unitPrice: parseFloat(formData.unitPrice),
        stockQuantity: formData.isService ? 0 : parseInt(formData.stockQuantity),
        minStockLevel: formData.isService ? 0 : parseInt(formData.minStockLevel),
        trackInventory: !formData.isService,
        isTaxable: formData.isTaxable,
        taxRate: formData.isTaxable ? parseFloat(formData.taxRate) : 0,
        isActive: formData.isActive,
        isService: formData.isService
      };

      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await createProduct(productData);
      }

      onSave();
    } catch (error) {
      showNotification(
        `Error ${product ? 'updating' : 'creating'} product: ${error.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };
  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
        }
      }}
    >
      <DialogTitle 
        sx={{
          background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          pb: 2,
          pt: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            sx={{ 
              width: 48,
              height: 48,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
            }}
          >
            {product ? <EditIcon sx={{ color: 'white', fontSize: 24 }} /> : <AddIcon sx={{ color: 'white', fontSize: 24 }} />}
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: '#1f2937',
                mb: 0.5
              }}
            >
              {product ? "Edit Product" : "Add New Product"}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6b7280'
              }}
            >
              {product ? "Update product information" : "Create a new product or service"}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Product/Service Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
                sx={{ 
                  height: '80px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981'
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981',
                        borderWidth: '2px'
                      }
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                sx={{ 
                  height: '56px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981'
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981',
                        borderWidth: '2px'
                      }
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981'
                  }
                }}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId || ""}
                  onChange={handleInputChange}
                  label="Category"
                  sx={{
                    minWidth: '200px',
                    '& .MuiSelect-select': {
                      minWidth: '200px'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        borderRadius: 8,
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                      },
                    },
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
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981'
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981',
                        borderWidth: '2px'
                      }
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981'
                  }
                }}
              />
            </Grid>

            {/* Service/Product Toggle */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                height: '56px',
                p: 2,
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: 2,
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.02)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box 
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      background: formData.isService 
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {formData.isService ? 
                      <ServiceIcon sx={{ color: 'white', fontSize: 18 }} /> : 
                      <InventoryIcon sx={{ color: 'white', fontSize: 18 }} />
                    }
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isService"
                        checked={formData.isService}
                        onChange={handleInputChange}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#10b981',
                            '&:hover': {
                              backgroundColor: 'rgba(16, 185, 129, 0.04)'
                            }
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#10b981'
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontWeight: 500, color: '#374151' }}>
                        This is a service (no inventory tracking)
                      </Typography>
                    }
                    sx={{ margin: 0 }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="unitPrice"
                label="Price"
                value={formData.unitPrice}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice}
                sx={{ 
                  height: '80px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981'
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#10b981',
                        borderWidth: '2px'
                      }
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981'
                  }
                }}
              />
            </Grid>

            {/* Tax Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                height: '56px',
                p: 2,
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: 2,
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.02)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box 
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      background: formData.isTaxable 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>%</Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isTaxable"
                        checked={formData.isTaxable}
                        onChange={handleInputChange}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#10b981',
                            '&:hover': {
                              backgroundColor: 'rgba(16, 185, 129, 0.04)'
                            }
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#10b981'
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontWeight: 500, color: '#374151' }}>
                        Taxable
                      </Typography>
                    }
                    sx={{ margin: 0 }}
                  />
                </Box>
              </Box>
            </Grid>

            {formData.isTaxable && (
              <Grid item xs={12} md={6}>
                <TextField
                  name="taxRate"
                  label="Tax Rate"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  error={!!errors.taxRate}
                  helperText={errors.taxRate}
                  sx={{ 
                    height: '80px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#10b981'
                        }
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#10b981',
                          borderWidth: '2px'
                        }
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#10b981'
                    }
                  }}
                />
              </Grid>
            )}

            {/* Inventory fields (only for products, not services) */}
            {!formData.isService && (
              <>
                <Grid item xs={12}>
                  <Box 
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: 'linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 100%)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      mb: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box 
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <InventoryIcon sx={{ color: 'white', fontSize: 18 }} />
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: '#166534'
                        }}
                      >
                        Inventory Management
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#15803d',
                        mb: 3
                      }}
                    >
                      Set stock quantities and monitoring thresholds for this product
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          name="stockQuantity"
                          label="Current Stock"
                          value={formData.stockQuantity}
                          onChange={handleInputChange}
                          fullWidth
                          required
                          type="number"
                          inputProps={{ min: 0 }}
                          error={!!errors.stockQuantity}
                          helperText={errors.stockQuantity}
                          sx={{ 
                            height: '80px',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#22c55e'
                                }
                              },
                              '&.Mui-focused': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#22c55e',
                                  borderWidth: '2px'
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#22c55e'
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          name="unit"
                          label="Unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          fullWidth
                          placeholder="e.g., pcs, kg, hrs"
                          sx={{ 
                            height: '80px',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#22c55e'
                                }
                              },
                              '&.Mui-focused': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#22c55e',
                                  borderWidth: '2px'
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#22c55e'
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          name="minStockLevel"
                          label="Low Stock Threshold"
                          value={formData.minStockLevel}
                          onChange={handleInputChange}
                          fullWidth
                          type="number"
                          inputProps={{ min: 0 }}
                          error={!!errors.minStockLevel}
                          helperText={errors.minStockLevel}
                          sx={{ 
                            height: '80px',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'white',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#22c55e'
                                }
                              },
                              '&.Mui-focused': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#22c55e',
                                  borderWidth: '2px'
                                }
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#22c55e'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                height: '56px',
                p: 2,
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: 2,
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                mt: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.02)'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box 
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      background: formData.isActive 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                      {formData.isActive ? '✓' : '✗'}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#10b981',
                            '&:hover': {
                              backgroundColor: 'rgba(16, 185, 129, 0.04)'
                            }
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#10b981'
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontWeight: 500, color: '#374151' }}>
                        Active (available for use in invoices)
                      </Typography>
                    }
                    sx={{ margin: 0 }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            color: '#6b7280',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              borderColor: '#94a3b8'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{
            backgroundColor: '#10b981',
            backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: '#059669',
              backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 12px 24px rgba(16, 185, 129, 0.4)'
            },
            '&:disabled': {
              backgroundColor: '#9ca3af',
              color: 'white',
              boxShadow: 'none'
            }
          }}
        >
          {loading ? "Saving..." : (product ? "Update Product" : "Create Product")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductForm;
