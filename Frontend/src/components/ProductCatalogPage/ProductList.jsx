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
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  useMediaQuery,
  useTheme
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
            backgroundColor: 'rgba(107, 114, 128, 0.08)',
            color: '#6b7280',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: '24px',
            borderRadius: '6px',
            letterSpacing: '-0.01em',
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
            border: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: '24px',
            borderRadius: '6px',
            letterSpacing: '-0.01em',
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
            border: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: '24px',
            borderRadius: '6px',
            letterSpacing: '-0.01em',
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
            border: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: '24px',
            borderRadius: '6px',
            letterSpacing: '-0.01em',
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
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'rgba(15, 23, 42, 0.95)', fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
            {params.value}
          </Typography>
          {params.row.description && (
            <Typography variant="caption" sx={{ color: 'rgba(15, 23, 42, 0.5)', fontSize: '0.8125rem', lineHeight: 1.3, mt: 0.25 }}>
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
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              color: '#2563eb',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              borderRadius: '6px',
              letterSpacing: '-0.01em',
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
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#059669', fontSize: '1rem', letterSpacing: '-0.02em' }}>
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
              backgroundColor: params.value ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.08)',
              color: params.value ? '#059669' : '#6b7280',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: '24px',
              borderRadius: '6px',
              letterSpacing: '-0.01em',
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
            fontWeight: 600,
            color: params.row.isTaxable ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.4)',
            fontSize: '0.875rem',
            letterSpacing: '-0.01em'
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, height: '100%' }}>
          <Tooltip title="Edit Product" arrow>
            <IconButton
              size="small"
              onClick={() => onEditProduct(params.row.product)}
              sx={{
                color: '#2563eb',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                width: 32,
                height: 32,
                borderRadius: '8px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#1d4ed8',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          {params.row.trackInventory && (
            <Tooltip title="Manage Inventory" arrow>
              <IconButton
                size="small"
                onClick={() => handleInventoryClick(params.row.product)}
                sx={{
                  color: '#059669',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#047857',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <InventoryIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Price History" arrow>
            <IconButton
              size="small"
              onClick={() => handlePriceHistoryClick(params.row.product)}
              sx={{
                color: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                width: 32,
                height: 32,
                borderRadius: '8px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  color: '#7c3aed',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <HistoryIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Product" arrow>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row.product)}
              sx={{
                color: '#dc2626',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                width: 32,
                height: 32,
                borderRadius: '8px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#b91c1c',
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

  // Mobile Card View
  if (isMobile) {
    return (
      <Box sx={{ width: '100%' }}>
        {products.map((product) => (
          <Card 
            key={product.id}
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }
            }}
          >
            <CardContent sx={{ pb: 1 }}>
              {/* Product Name & Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', flex: 1 }}>
                  {product.name}
                </Typography>
                <Chip
                  label={product.isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    backgroundColor: product.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    color: product.isActive ? '#059669' : '#4b5563',
                    border: product.isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(107, 114, 128, 0.2)',
                    fontWeight: 500,
                    fontSize: '0.7rem',
                  }}
                />
              </Box>

              {/* Description */}
              {product.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                  {product.description}
                </Typography>
              )}

              {/* Category & Price */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip
                  label={getCategoryName(product.categoryId)}
                  variant="outlined"
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    color: '#2563eb',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    fontSize: '0.7rem',
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669', fontSize: '1.1rem' }}>
                  €{(product.unitPrice || 0).toFixed(2)}
                </Typography>
              </Box>

              {/* Stock Info */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  Stock:
                </Typography>
                {product.trackInventory ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                      {product.stockQuantity} {product.unit}
                    </Typography>
                    {(() => {
                      if (product.stockQuantity <= 0) {
                        return (
                          <Chip
                            label="Out of Stock"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#dc2626',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              fontSize: '0.65rem',
                              height: '20px',
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
                              fontSize: '0.65rem',
                              height: '20px',
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
                              fontSize: '0.65rem',
                              height: '20px',
                            }}
                          />
                        );
                      }
                    })()}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    Not tracked
                  </Typography>
                )}
              </Box>

              {/* Tax Info */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  Tax:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontWeight: 500,
                  color: product.isTaxable ? '#374151' : '#9ca3af',
                  fontSize: '0.85rem'
                }}>
                  {product.isTaxable ? `${product.taxRate}%` : "No Tax"}
                </Typography>
              </Box>
            </CardContent>

            <Divider />

            {/* Action Buttons */}
            <CardActions sx={{ justifyContent: 'space-around', p: 1 }}>
              <IconButton
                size="small"
                onClick={() => onEditProduct(product)}
                sx={{
                  color: '#2563eb',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  },
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
              {product.trackInventory && (
                <IconButton
                  size="small"
                  onClick={() => handleInventoryClick(product)}
                  sx={{
                    color: '#059669',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    },
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() => handlePriceHistoryClick(product)}
                sx={{
                  color: '#7c3aed',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  },
                }}
              >
                <HistoryIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(product)}
                sx={{
                  color: '#dc2626',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  },
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </CardActions>
          </Card>
        ))}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          fullScreen={isMobile}
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
  }

  // Desktop DataGrid View

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
          borderRadius: '12px',
          border: 'none',
          backgroundColor: '#ffffff',
          boxShadow: 'none',
          overflow: 'hidden',
          '& .MuiDataGrid-main': {
            borderRadius: '12px',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#ffffff',
            borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
            minHeight: '56px !important',
            maxHeight: '56px !important',
            '& .MuiDataGrid-columnHeader': {
              '&:focus, &:focus-within': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'rgba(15, 23, 42, 0.7)',
              letterSpacing: '-0.01em'
            },
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: '20px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            '& .MuiInputBase-root': {
              fontSize: '0.875rem',
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              borderRadius: '8px',
              boxShadow: 'none',
              minWidth: '300px',
              height: '40px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& fieldset': {
                border: 'none'
              },
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.06)',
                borderColor: 'rgba(15, 23, 42, 0.12)',
              },
              '&.Mui-focused': {
                backgroundColor: 'white',
                borderColor: '#8b5cf6',
                boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
              },
              '& .MuiInputBase-input': {
                padding: '10px 14px',
                '&::placeholder': {
                  color: 'rgba(15, 23, 42, 0.4)',
                  fontWeight: 400,
                },
              },
            },
            '& .MuiButton-root': {
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              boxShadow: 'none',
              padding: '8px 12px',
              minWidth: 'auto',
              height: '40px',
              color: 'rgba(15, 23, 42, 0.6)',
              textTransform: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.06)',
                color: 'rgba(15, 23, 42, 0.8)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'transparent',
                color: 'rgba(15, 23, 42, 0.25)',
              },
            },
          },
          '& .MuiDataGrid-row': {
            borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.02)',
              cursor: 'pointer',
            },
            '&:last-child': {
              borderBottom: 'none',
            },
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
            '&:focus, &:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(15, 23, 42, 0.08)',
            backgroundColor: '#ffffff',
            minHeight: '56px',
            '& .MuiTablePagination-root': {
              color: 'rgba(15, 23, 42, 0.7)',
              fontSize: '0.875rem',
            },
            '& .MuiTablePagination-select': {
              borderRadius: '6px',
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              padding: '4px 8px',
              '&:hover': {
                backgroundColor: 'rgba(15, 23, 42, 0.08)',
              },
            },
            '& .MuiIconButton-root': {
              color: 'rgba(15, 23, 42, 0.6)',
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                color: '#8b5cf6',
              },
              '&.Mui-disabled': {
                color: 'rgba(15, 23, 42, 0.25)',
              },
            },
          },
          '& .MuiDataGrid-virtualScroller': {
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(15, 23, 42, 0.04)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(15, 23, 42, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(15, 23, 42, 0.3)',
              },
            },
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
