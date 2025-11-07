// src/components/ProductCatalogPage/ProductInventoryDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress
} from "@mui/material";
import {
  Close as CloseIcon,
  Inventory as InventoryIcon
} from "@mui/icons-material";
import { updateProductInventory } from "./api";

const ProductInventoryDialog = ({ 
  open, 
  product, 
  onClose, 
  onInventoryUpdated 
}) => {
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    setLoading(true);
    setError("");    try {
      let newQuantity;
      if (adjustmentType === "add") {
        newQuantity = product.stockQuantity + parseInt(quantity);
      } else if (adjustmentType === "subtract") {
        newQuantity = Math.max(0, product.stockQuantity - parseInt(quantity));
      } else {
        newQuantity = parseInt(quantity);
      }

      await updateProductInventory(product.id, newQuantity);
      onInventoryUpdated();
      onClose();
    } catch (error) {
      setError("Error updating inventory: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    if (!loading) {
      setQuantity("");
      setReason("");
      setError("");
      onClose();
    }
  };

  const getNewStock = () => {
    if (!quantity || isNaN(parseInt(quantity))) return product.stockQuantity;
    
    switch (adjustmentType) {
      case "add":
        return product.stockQuantity + parseInt(quantity);
      case "subtract":
        return Math.max(0, product.stockQuantity - parseInt(quantity));
      case "set":
        return parseInt(quantity);
      default:
        return product.stockQuantity;
    }
  };

  if (!product) return null;
  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)'
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(15, 23, 42, 0.4)'
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        pb: 2,
        pt: 3,
        px: 3
      }}>
        <Box>
          <Typography variant="h5" sx={{
            fontWeight: 700,
            color: 'rgba(15, 23, 42, 0.95)',
            fontSize: '1.5rem',
            letterSpacing: '-0.02em',
            mb: 0.5
          }}>
            Manage Inventory
          </Typography>
          <Typography variant="body2" sx={{
            color: 'rgba(15, 23, 42, 0.55)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            {product.name}
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
          disabled={loading}
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            backgroundColor: 'rgba(15, 23, 42, 0.02)',
            color: 'rgba(15, 23, 42, 0.65)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.06)',
              borderColor: 'rgba(15, 23, 42, 0.12)',
              color: 'rgba(15, 23, 42, 0.85)'
            },
            '&:disabled': {
              opacity: 0.5
            }
          }}
        >
          <CloseIcon sx={{ fontSize: '1.125rem' }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, px: 3, pb: 0 }}>
        {/* Current Stock Info */}
        <Box sx={{ 
          p: 2.5, 
          mb: 2.5, 
          backgroundColor: 'white', 
          borderRadius: '14px',
          border: '1px solid rgba(15, 23, 42, 0.08)'
        }}>
          <Typography variant="body2" sx={{
            color: 'rgba(15, 23, 42, 0.55)',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            mb: 1
          }}>
            Current Stock
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: 'rgba(15, 23, 42, 0.95)',
              fontSize: '2rem',
              letterSpacing: '-0.02em'
            }}>
              {product.stockQuantity}
            </Typography>
            <Typography variant="body1" sx={{ 
              color: 'rgba(15, 23, 42, 0.55)',
              fontWeight: 500
            }}>
              {product.unit || 'units'}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ 
            color: 'rgba(15, 23, 42, 0.55)',
            fontSize: '0.875rem'
          }}>
            Min. threshold: {product.minStockLevel} {product.unit || 'units'}
          </Typography>
        </Box>

        {/* Adjustment Type */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.75,
            display: 'block'
          }}>
            Adjustment Type
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
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
              <MenuItem value="add">Add Stock</MenuItem>
              <MenuItem value="subtract">Remove Stock</MenuItem>
              <MenuItem value="set">Set Exact Amount</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Quantity Input */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.75,
            display: 'block'
          }}>
            {adjustmentType === "set" ? "Set to this amount" : "Quantity"}
          </Typography>
          <TextField
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            type="number"
            size="small"
            inputProps={{ min: adjustmentType === "set" ? 0 : 1 }}
            error={!!error}
            helperText={error}
            placeholder={adjustmentType === "set" ? "0" : "1"}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '12px',
                fontSize: '0.875rem',
                '& fieldset': {
                  borderColor: 'rgba(15, 23, 42, 0.08)',
                  borderWidth: '1px'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(15, 23, 42, 0.15)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(15, 23, 42, 0.25)',
                  borderWidth: '1.5px'
                },
                '& input': {
                  padding: '9px 12px'
                }
              },
              '& .MuiFormHelperText-root': {
                fontSize: '0.75rem',
                marginTop: '6px',
                marginLeft: '2px'
              }
            }}
          />
        </Box>

        {/* New Stock Preview */}
        {quantity && (
          <Box sx={{ 
            p: 2, 
            mb: 2.5, 
            backgroundColor: getNewStock() <= product.minStockLevel 
              ? 'rgba(251, 191, 36, 0.08)' 
              : 'rgba(16, 185, 129, 0.08)',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: getNewStock() <= product.minStockLevel 
              ? 'rgba(251, 191, 36, 0.3)' 
              : 'rgba(16, 185, 129, 0.3)'
          }}>
            <Typography variant="body2" sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'rgba(15, 23, 42, 0.85)',
              mb: getNewStock() <= product.minStockLevel ? 0.75 : 0
            }}>
              New Stock: <Box component="span" sx={{ 
                color: getNewStock() <= product.minStockLevel ? '#f59e0b' : '#10b981'
              }}>
                {getNewStock()} {product.unit || 'units'}
              </Box>
            </Typography>
            {getNewStock() <= product.minStockLevel && (
              <Typography variant="body2" sx={{
                fontSize: '0.8125rem',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                ⚠️ Below minimum threshold
              </Typography>
            )}
          </Box>
        )}

        {/* Reason Input */}
        <Box>
          <Typography variant="body2" sx={{
            color: 'rgba(15, 23, 42, 0.75)',
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 0.75,
            display: 'block'
          }}>
            Reason (Optional)
          </Typography>
          <TextField
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="e.g., Received shipment, Damaged goods, Inventory correction"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: '12px',
                fontSize: '0.875rem',
                '& fieldset': {
                  borderColor: 'rgba(15, 23, 42, 0.08)',
                  borderWidth: '1px'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(15, 23, 42, 0.15)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(15, 23, 42, 0.25)',
                  borderWidth: '1.5px'
                },
                '& textarea': {
                  padding: '9px 12px'
                }
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        gap: 1.5,
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        justifyContent: 'flex-end'
      }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
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
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !quantity}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
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
          {loading ? "Updating..." : "Update Inventory"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductInventoryDialog;
