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

  };  // Prepare data for the DataGrid
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
  ]; const getStockStatusChip = (product) => {
    if (!product.trackInventory) {
      return (
        <Chip
          label="Not Tracked"
          size="small"
          sx={{
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            color: '#4b5563',
            border: '1px solid rgba(107, 114, 128, 0.2)',
            fontWeight: 600,
            borderRadius: 2
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
            fontWeight: 600,
            borderRadius: 2
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
            fontWeight: 600,
            borderRadius: 2
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
            fontWeight: 600,
            borderRadius: 2
          }}
        />
      );
    }
  };

  const getStatusChip = (isActive) => {
    return (
      <Chip
        label={isActive ? "Active" : "Inactive"}
        size="small"
        sx={{
          backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          color: isActive ? '#059669' : '#4b5563',
          border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(107, 114, 128, 0.2)',
          fontWeight: 600,
          borderRadius: 2,
          minWidth: '70px'
        }}
      />
    );
  };

  const getCategoryChip = (categoryName) => {
    return (
      <Chip
        label={categoryName || "Uncategorized"}
        variant="outlined"
        size="small"
        sx={{
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          color: '#2563eb',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          fontWeight: 500,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }
        }}
      />
    );
  };
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Uncategorized";
  };
  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  // Check if any products in the current filtered list have stock tracking enabled
  const shouldShowStockColumn = filteredProducts.some(product => product.trackInventory);

  // Check if any products have stock tracking to show Low Stock filter option
  const hasStockTrackedProducts = products.some(product => product.trackInventory);
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          minHeight: 200,
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#10b981', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 500 }}>
            Loading products...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Enhanced Search and Filter Section */}
      <Box
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 4px 12px rgba(148, 163, 184, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(148, 163, 184, 0.15)',
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 'medium',
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <SearchIcon sx={{ color: '#6b7280' }} />
          Search & Filter Products
        </Typography>

        <Box sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <TextField
            label="Search Products"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              minWidth: 280,
              width: 280,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6b7280' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 160, width: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
              sx={{
                borderRadius: 2,
                '& .MuiSelect-select': {
                  minHeight: '1.4375em'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                }
              }}
            >              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140, width: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={handleStatusChange}
              sx={{
                borderRadius: 2,
                '& .MuiSelect-select': {
                  minHeight: '1.4375em'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#8b5cf6'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#8b5cf6'
                }
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              {hasStockTrackedProducts && (
                <MenuItem value="lowstock">Low Stock</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>
      </Box>      {/* Enhanced Products Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 4px 12px rgba(148, 163, 184, 0.1)',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(148, 163, 184, 0.15)',
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Table>
          <TableHead
            sx={{
              background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
              borderBottom: '2px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '0.95rem',
                  py: 2
                }}
              >
                Product
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '0.95rem'
                }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '0.95rem'
                }}
              >
                Price
              </TableCell>
              {shouldShowStockColumn && (
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    color: '#374151',
                    fontSize: '0.95rem'
                  }}
                >
                  Stock
                </TableCell>
              )}
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '0.95rem'
                }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '0.95rem'
                }}
              >
                Tax
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 'bold',
                  color: '#374151',
                  fontSize: '0.95rem'
                }}
              >
                Actions              </TableCell></TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={shouldShowStockColumn ? 7 : 6}
                  align="center"
                  sx={{
                    py: 8,
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                      No products found
                    </Typography>                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                      Try adjusting your search or filter criteria
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(16, 185, 129, 0.02)',
                      cursor: 'pointer',
                      '& .MuiTableCell-root': {
                        backgroundColor: 'transparent'
                      }
                    },
                    '&:nth-of-type(even)': {
                      backgroundColor: 'rgba(248, 250, 252, 0.5)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: '#1f2937',
                          mb: 0.5
                        }}
                      >
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#6b7280',
                            display: 'block',
                            lineHeight: 1.3
                          }}
                        >
                          {product.description.length > 50
                            ? `${product.description.substring(0, 50)}...`
                            : product.description
                          }
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {getCategoryChip(product.categoryName)}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      sx={{                        fontWeight: 600,
                        color: '#059669',
                        fontSize: '1rem'
                      }}
                    >
                      €{(product.unitPrice || 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  {shouldShowStockColumn && (
                    <TableCell>
                      {product.trackInventory ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: '#374151'
                            }}
                          >
                            {product.stockQuantity} {product.unit || 'units'}
                          </Typography>
                          {getStockStatusChip(product)}
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#9ca3af',
                            fontStyle: 'italic'
                          }}
                        >
                          Not tracked
                        </Typography>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    {getStatusChip(product.isActive)}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{                        fontWeight: 500,
                        color: product.isTaxable ? '#374151' : '#9ca3af'
                      }}
                    >
                      {product.isTaxable ? `${product.taxRate}%` : "No Tax"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Edit Product">
                        <IconButton
                          size="small"
                          onClick={() => onEditProduct(product)}
                          sx={{
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#2563eb',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                              transform: 'translateY(-1px)',                              boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
                            }
                          }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      {product.trackInventory && (
                        <Tooltip title="Manage Inventory">
                          <IconButton
                            size="small"
                            onClick={() => handleInventoryClick(product)}
                            sx={{
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: '#059669',
                              border: '1px solid rgba(16, 185, 129, 0.2)',
                              borderRadius: 2,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)'
                              }
                            }}
                          >
                            <InventoryIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Price History">
                        <IconButton
                          size="small"
                          onClick={() => handlePriceHistoryClick(product)}
                          sx={{
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            color: '#7c3aed',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(139, 92, 246, 0.2)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 8px rgba(139, 92, 246, 0.3)'
                            }
                          }}
                        >
                          <HistoryIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(product)}
                          sx={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#dc2626',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'rgba(239, 68, 68, 0.2)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            backgroundColor: 'rgba(248, 250, 252, 0.5)',
            '& .MuiTablePagination-toolbar': {
              paddingX: 3,
              paddingY: 2
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontWeight: 500,
              color: '#374151'
            },
            '& .MuiTablePagination-select': {
              borderRadius: 2,
              border: '1px solid rgba(148, 163, 184, 0.3)',
              paddingX: 1,
              '&:focus': {
                borderColor: '#10b981',
                borderRadius: 2
              }
            },
            '& .MuiIconButton-root': {
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#059669'
              }
            }
          }} />
      </TableContainer>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            color: '#dc2626',
            borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
            pb: 2
          }}
        >
          Delete Product
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText
            sx={{
              color: '#374151',
              fontSize: '1rem',
              lineHeight: 1.6
            }}
          >
            Are you sure you want to delete <strong>"{productToDelete?.name}"</strong>?
            This action cannot be undone and will permanently remove this product from your catalog.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              borderColor: '#d1d5db',
              color: '#6b7280',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: 'rgba(107, 114, 128, 0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            autoFocus
            sx={{
              backgroundColor: '#dc2626',
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#b91c1c',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
              }
            }}
          >
            Delete Product
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
        />)}
    </Box>
  );
};

export default ProductList;
