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
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <InventoryIcon color="primary" />
          <Box>
            <Typography variant="h6">Manage Inventory</Typography>
            <Typography variant="body2" color="text.secondary">
              {product.name}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Current Stock Info */}
        <Box sx={{ 
          p: 2, 
          mb: 3, 
          backgroundColor: 'grey.50', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Stock
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {product.stockQuantity} {product.unit || 'units'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Minimum threshold: {product.minStockLevel} {product.unit || 'units'}
          </Typography>
        </Box>

        {/* Adjustment Type */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Adjustment Type</InputLabel>
          <Select
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value)}
            label="Adjustment Type"
          >
            <MenuItem value="add">Add Stock</MenuItem>
            <MenuItem value="subtract">Remove Stock</MenuItem>
            <MenuItem value="set">Set Exact Amount</MenuItem>
          </Select>
        </FormControl>

        {/* Quantity Input */}
        <TextField
          label={adjustmentType === "set" ? "Set to this amount" : "Quantity"}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
          type="number"
          inputProps={{ min: adjustmentType === "set" ? 0 : 1 }}
          error={!!error}
          helperText={error}
          sx={{ mb: 3 }}
          placeholder={adjustmentType === "set" ? "0" : "1"}
        />

        {/* New Stock Preview */}
        {quantity && (
          <Box sx={{ 
            p: 2, 
            mb: 3, 
            backgroundColor: getNewStock() <= product.minStockLevel ? 'warning.light' : 'success.light',
            borderRadius: 1,
            border: '1px solid',
            borderColor: getNewStock() <= product.minStockLevel ? 'warning.main' : 'success.main'
          }}>
            <Typography variant="body2" gutterBottom>
              New Stock Amount: <strong>{getNewStock()} {product.unit || 'units'}</strong>
            </Typography>
            {getNewStock() <= product.minStockLevel && (
              <Typography variant="body2" color="warning.dark">
                ⚠️ This will put the product below the minimum threshold!
              </Typography>
            )}
          </Box>
        )}

        {/* Reason Input */}
        <TextField
          label="Reason (Optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder="e.g., Received shipment, Damaged goods, Inventory correction"
        />
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !quantity}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? "Updating..." : "Update Inventory"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductInventoryDialog;
