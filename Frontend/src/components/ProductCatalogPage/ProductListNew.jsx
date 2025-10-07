// src/components/ProductCatalogPage/ProductList.jsx
import React, { useState, useMemo } from "react";
import {
  Box,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import { deleteProduct } from "./api";
import ProductInventoryDialog from "./ProductInventoryDialog";
import ProductPriceHistoryDialog from "./ProductPriceHistoryDialog";

const ProductList = ({
  products,
  categories,
  loading,
  onEditProduct,
  onDeleteProduct,
  onReloadProducts
}) => {
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [priceHistoryDialogOpen, setPriceHistoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      await deleteProduct(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      onDeleteProduct();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleInventoryClick = (product) => {
    setSelectedProduct(product);
    setInventoryDialogOpen(true);
  };

  const handlePriceHistoryClick = (product) => {
    setSelectedProduct(product);
    setPriceHistoryDialogOpen(true);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Prepare data for the DataGrid
  const rows = useMemo(() => {
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      categoryName: getCategoryName(product.categoryId),
      unitPrice: product.unitPrice || 0,
      stockQuantity: product.stockQuantity || 0,
      minStockLevel: product.minStockLevel || 0,
      trackInventory: product.trackInventory,
      isActive: product.isActive,
      isTaxable: product.isTaxable,
      taxRate: product.taxRate || 0,
      unit: product.unit || 'units',
      product: product // Keep reference to full product object
    }));
  }, [products, categories]);

  const getStockStatusChip = (params) => {
    const product = params.row;
    if (!product.trackInventory) {
      return (
        <Chip
          label="Not Tracked"
          size="small"
          sx={{
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            color: '#4b5563',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      );
    }

    if (product.stockQuantity <= 0) {
      return (
        <Chip
          label="Out of Stock"
          size="small"
          sx={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      );
    } else if (product.stockQuantity <= product.minStockLevel) {
      return (
        <Chip
          label="Low Stock"
          size="small"
          sx={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            color: '#d97706',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      );
    } else {
      return (
        <Chip
          label="In Stock"
          size="small"
          sx={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      );
    }
  };

  // Define columns for the DataGrid
  const columns = [
    {
      field: 'name',
      headerName: 'Product',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
            {params.value}
          </Typography>
          {params.row.description && (
            <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: 1.2 }}>
              {params.row.description.length > 40
                ? `${params.row.description.substring(0, 40)}...`
                : params.row.description
              }
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'categoryName',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Chip
            label={params.value}
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              color: '#2563eb',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </Box>
      ),
    },
    {
      field: 'unitPrice',
      headerName: 'Price',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669', fontSize: '0.95rem' }}>
            €{(params.value || 0).toFixed(2)}
          </Typography>
        </Box>
      ),
      type: 'number',
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5, height: '100%', py: 1 }}>
          {params.row.trackInventory ? (
            <>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151', fontSize: '0.875rem' }}>
                {params.row.stockQuantity} {params.row.unit}
              </Typography>
              {getStockStatusChip(params)}
            </>
          ) : (
            <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.875rem' }}>
              Not tracked
            </Typography>
          )}
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Chip
            label={params.value ? "Active" : "Inactive"}
            size="small"
            sx={{
              backgroundColor: params.value ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
              color: params.value ? '#059669' : '#4b5563',
              border: params.value ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(107, 114, 128, 0.2)',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </Box>
      ),
      type: 'boolean',
    },
    {
      field: 'tax',
      headerName: 'Tax',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography variant="body2" sx={{ 
            fontWeight: 500,
            color: params.row.isTaxable ? '#374151' : '#9ca3af',
            fontSize: '0.875rem'
          }}>
            {params.row.isTaxable ? `${params.row.taxRate}%` : "No Tax"}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, height: '100%' }}>
          <Tooltip title="Edit Product">
            <IconButton
              size="small"
              onClick={() => onEditProduct(params.row.product)}
              sx={{
                color: '#2563eb',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          {params.row.trackInventory && (
            <Tooltip title="Manage Inventory">
              <IconButton
                size="small"
                onClick={() => handleInventoryClick(params.row.product)}
                sx={{
                  color: '#059669',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <InventoryIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Price History">
            <IconButton
              size="small"
              onClick={() => handlePriceHistoryClick(params.row.product)}
              sx={{
                color: '#7c3aed',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <HistoryIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Product">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row.product)}
              sx={{
                color: '#dc2626',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Calculate dynamic height based on number of records
  const calculateGridHeight = () => {
    const headerHeight = 64;
    const toolbarHeight = 60;
    const footerHeight = 52;
    const rowHeight = 80;
    const minHeight = 400;
    const maxHeight = 800;
    
    const contentHeight = headerHeight + toolbarHeight + footerHeight + (rows.length * rowHeight);
    return Math.min(Math.max(contentHeight, minHeight), maxHeight);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#10b981' }} />
      </Box>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No products found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add your first product to get started with your catalog.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        checkboxSelection={false}
        disableRowSelectionOnClick
        rowHeight={80}
        headerHeight={64}
        autoHeight={rows.length <= 10}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { 
              debounceMs: 500,
              placeholder: 'Search products by name, description, or category...'
            },
            csvOptions: {
              fileName: 'products-export',
              delimiter: ',',
              includeHeaders: true,
            },
            printOptions: {
              hideFooter: true,
              hideToolbar: true,
            },
          },
        }}
        sx={{
          height: rows.length <= 10 ? 'auto' : calculateGridHeight(),
          minHeight: 400,
          maxHeight: 800,
          boxShadow: '0 20px 35px -8px rgba(0, 0, 0, 0.12), 0 15px 20px -6px rgba(0, 0, 0, 0.08), 0 6px 12px -2px rgba(0, 0, 0, 0.06)',
          borderRadius: '16px',
          border: 'none',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          position: 'relative',
          '& .MuiDataGrid-main': {
            borderRadius: '16px',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#ffffff',
            borderBottom: 'none',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: '1rem',
              fontWeight: 600,
              color: '#111827',
            },
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: '24px 28px',
            backgroundColor: '#ffffff',
            borderBottom: 'none',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            '& .MuiInputBase-root': {
              fontSize: '0.95rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid rgba(209, 213, 219, 0.6)',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              minWidth: '280px',
              height: '40px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'rgba(16, 185, 129, 0.5)',
                boxShadow: '0 2px 6px 0 rgba(16, 185, 129, 0.15)',
              },
              '&.Mui-focused': {
                borderColor: '#10b981',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.12), 0 2px 6px 0 rgba(0, 0, 0, 0.1)',
              },
              '& .MuiInputBase-input': {
                padding: '8px 12px',
                '&::placeholder': {
                  color: '#9ca3af',
                  fontWeight: 400,
                },
              },
            },
            '& .MuiButton-root': {
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: '#ffffff',
              border: '1px solid rgba(209, 213, 219, 0.6)',
              borderRadius: '8px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              padding: '8px 16px',
              minWidth: 'auto',
              height: '40px',
              color: '#374151',
              textTransform: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#ffffff',
                borderColor: '#10b981',
                color: '#10b981',
                boxShadow: '0 2px 6px 0 rgba(16, 185, 129, 0.2)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                backgroundColor: '#f3f4f6',
                borderColor: 'rgba(209, 213, 219, 0.4)',
                color: '#9ca3af',
                boxShadow: 'none',
              },
              '& .MuiButton-startIcon': {
                marginRight: '6px',
                '& svg': {
                  fontSize: '18px',
                },
              },
            },
            '& .MuiButtonBase-root[title*="Density"]': {
              '& svg': {
                color: '#6b7280',
              },
              '&:hover svg': {
                color: '#10b981',
              },
            },
            '& .MuiButtonBase-root[title*="Export"]': {
              '& svg': {
                color: '#6b7280',
              },
              '&:hover svg': {
                color: '#10b981',
              },
            },
            '& .MuiButtonBase-root[title*="Filter"]': {
              '& svg': {
                color: '#6b7280',
              },
              '&:hover svg': {
                color: '#10b981',
              },
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: '#ffffff',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
          },
          '& .MuiDataGrid-row': {
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(16, 185, 129, 0.03)',
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(243, 244, 246, 0.8)',
            },
          },
          '& .MuiDataGrid-cell': {
            borderRight: 'none',
          },
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ color: '#dc2626', fontWeight: 600 }}>
          Delete Product
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete{" "}
            <strong>"{productToDelete?.name}"</strong>? This action cannot be undone and will permanently remove this product from your catalog.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ 
              borderColor: '#d1d5db',
              color: '#6b7280',
              '&:hover': { borderColor: '#9ca3af', backgroundColor: 'rgba(156, 163, 175, 0.1)' }
            }}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{ 
              backgroundColor: '#dc2626',
              '&:hover': { backgroundColor: '#b91c1c' }
            }}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? "Deleting..." : "Delete Product"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Management Dialog */}
      {inventoryDialogOpen && (
        <ProductInventoryDialog
          open={inventoryDialogOpen}
          product={selectedProduct}
          onClose={() => setInventoryDialogOpen(false)}
          onInventoryUpdated={onReloadProducts}
        />
      )}

      {/* Price History Dialog */}
      {priceHistoryDialogOpen && (
        <ProductPriceHistoryDialog
          open={priceHistoryDialogOpen}
          product={selectedProduct}
          onClose={() => setPriceHistoryDialogOpen(false)}
        />
      )}
    </Box>
  );
};

export default ProductList;
