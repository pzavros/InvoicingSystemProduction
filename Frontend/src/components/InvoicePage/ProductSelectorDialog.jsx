import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Box,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import { getAllProducts, getAllCategories } from '../ProductCatalogPage/api';

const ProductSelectorDialog = ({ 
  open, 
  onClose, 
  onProductSelect, 
  multipleSelection = false,
  currency = '$' 
}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch products and categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleProductSelect = (product) => {
    if (multipleSelection) {
      setSelectedProducts(prev => {
        const isSelected = prev.find(p => p.id === product.id);
        if (isSelected) {
          return prev.filter(p => p.id !== product.id);
        } else {
          return [...prev, product];
        }
      });    } else {
      // Single selection - immediately add to invoice
      const invoiceItem = {
        itemId: `product-${product.id}-${Date.now()}`,
        itemName: product.name,
        itemDescription: product.description || '',
        itemPrice: (product.unitPrice || 0).toFixed(2),
        itemQuantity: 1,
        itemTaxRate: product.taxRate || 0,
        productId: product.id,
        isCustomItem: false
      };
      onProductSelect(invoiceItem);
      onClose();
    }
  };

  const handleAddSelectedProducts = () => {
    const invoiceItems = selectedProducts.map(product => ({
      itemId: `product-${product.id}-${Date.now()}`,
      itemName: product.name,
      itemDescription: product.description || '',
      itemPrice: (product.unitPrice || 0).toFixed(2),
      itemQuantity: 1,
      itemTaxRate: product.taxRate || 0,
      productId: product.id,
      isCustomItem: false
    }));
    
    onProductSelect(invoiceItems);
    setSelectedProducts([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedProducts([]);
    setSearchTerm('');
    setSelectedCategory('');
    onClose();
  };
  const getStockStatusColor = (stock, minStockLevel) => {
    if (stock <= 0) return 'error';
    if (stock <= minStockLevel) return 'warning';
    return 'success';
  };

  const getStockStatusText = (stock, minStockLevel) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= minStockLevel) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(15, 23, 42, 0.4)'
          }
        }
      }}
      PaperProps={{
        sx: {
          height: isMobile ? '100vh' : '85vh',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(15, 23, 42, 0.12)',
          borderRadius: isMobile ? 0 : '20px',
          border: '1px solid rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
          m: isMobile ? 0 : undefined
        }
      }}
    >
      <DialogTitle sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        py: { xs: 2.5, sm: 3 },
        px: { xs: 2.5, sm: 4 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" component="div" sx={{
              fontWeight: 700,
              color: 'rgba(15, 23, 42, 0.95)',
              fontSize: { xs: '1.125rem', sm: '1.375rem' },
              letterSpacing: '-0.02em',
              mb: 0.5
            }}>
              Select Products
            </Typography>
            <Typography variant="body2" sx={{
              color: 'rgba(15, 23, 42, 0.55)',
              fontSize: '0.875rem',
              fontWeight: 500
            }}>
              {multipleSelection ? 'Choose one or more products to add' : 'Choose a product to add to invoice'}
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose} 
            size="small"
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
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle><DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search and Filter Section */}
        <Box sx={{ 
          mb: 3, 
          p: { xs: 2.5, sm: 3 },
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '16px',
          border: '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
        }}>
          <Typography variant="subtitle2" sx={{ 
            mb: 2.5, 
            fontWeight: 600,
            color: 'rgba(15, 23, 42, 0.75)',
            fontSize: '0.8125rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Search & Filter
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
            <TextField
              placeholder="Search by name or description..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth={isMobile}
              sx={{ 
                flexGrow: 1, 
                minWidth: { xs: '100%', sm: 300 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  '& fieldset': {
                    borderColor: 'rgba(15, 23, 42, 0.08)',
                    borderWidth: '1px'
                  },
                  '&:hover': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(15, 23, 42, 0.15)'
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(15, 23, 42, 0.25)',
                      borderWidth: '1.5px'
                    }
                  }
                },
                '& .MuiInputBase-input': {
                  padding: '9px 12px'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ 
                      color: '#8b5cf6',
                      fontSize: '1.125rem'
                    }} />
                  </InputAdornment>
                ),
              }}
            />
          
            <FormControl 
              size="small" 
              fullWidth={isMobile}
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  '& fieldset': {
                    borderColor: 'rgba(15, 23, 42, 0.08)',
                    borderWidth: '1px'
                  },
                  '&:hover': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(15, 23, 42, 0.15)'
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(15, 23, 42, 0.25)',
                      borderWidth: '1.5px'
                    }
                  }
                },
                '& .MuiInputBase-input': {
                  padding: '9px 12px'
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  color: 'rgba(15, 23, 42, 0.55)',
                  '&.Mui-focused': {
                    color: '#8b5cf6'
                  }
                }
              }}
            >
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>        {/* Products Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>          <CircularProgress />
          </Box>
        ) : isMobile ? (
          // Mobile Card Layout
          <Stack spacing={2} sx={{ maxHeight: 'calc(100vh - 380px)', overflow: 'auto', pb: 2 }}>
            {filteredProducts.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                px: 2
              }}>
                <Typography sx={{
                  color: 'rgba(15, 23, 42, 0.45)',
                  fontSize: '0.9375rem',
                  fontWeight: 500
                }}>
                  {searchTerm || selectedCategory 
                    ? 'No products found matching your criteria.'
                    : 'No products available.'
                  }
                </Typography>
              </Box>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = multipleSelection && 
                  selectedProducts.find(p => p.id === product.id);
                const category = categories.find(c => c.id === product.categoryId);
                
                return (
                  <Card
                    key={product.id}
                    onClick={!multipleSelection ? () => handleProductSelect(product) : undefined}
                    sx={{
                      borderRadius: '14px',
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(99, 102, 241, 0.06) 100%)'
                        : 'white',
                      boxShadow: isSelected 
                        ? '0 2px 8px rgba(139, 92, 246, 0.15), inset 0 0 0 1.5px #8b5cf6'
                        : '0 1px 3px rgba(15, 23, 42, 0.06)',
                      border: isSelected 
                        ? 'none'
                        : '1px solid rgba(15, 23, 42, 0.06)',
                      cursor: !multipleSelection ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      '&:active': {
                        transform: 'scale(0.99)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Header with checkbox and product name */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
                        {multipleSelection && (
                          <Checkbox
                            checked={!!isSelected}
                            onChange={() => handleProductSelect(product)}
                            sx={{ 
                              p: 0,
                              mt: -0.25,
                              color: 'rgba(15, 23, 42, 0.25)',
                              '&.Mui-checked': {
                                color: '#8b5cf6'
                              },
                              '& .MuiSvgIcon-root': {
                                fontSize: '1.375rem'
                              }
                            }}
                          />
                        )}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 600,
                              color: 'rgba(15, 23, 42, 0.95)',
                              mb: 0.75,
                              fontSize: '1rem',
                              letterSpacing: '-0.01em',
                              lineHeight: 1.3
                            }}
                          >
                            {product.name}
                          </Typography>
                          {product.description && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'rgba(15, 23, 42, 0.55)',
                                fontSize: '0.8125rem',
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {product.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Product details grid */}
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2.5,
                        pt: 2.5,
                        borderTop: '1px solid rgba(15, 23, 42, 0.06)'
                      }}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(15, 23, 42, 0.45)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontSize: '0.6875rem',
                              display: 'block',
                              mb: 0.75
                            }}
                          >
                            Category
                          </Typography>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontWeight: 500,
                              color: 'rgba(15, 23, 42, 0.75)',
                              fontSize: '0.875rem',
                              lineHeight: 1.3
                            }}
                          >
                            {category?.name || 'Uncategorized'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(15, 23, 42, 0.45)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontSize: '0.6875rem',
                              display: 'block',
                              mb: 0.75
                            }}
                          >
                            Price
                          </Typography>
                          <Typography 
                            variant="h6"
                            sx={{ 
                              fontWeight: 600,
                              color: '#8b5cf6',
                              fontSize: '1.125rem',
                              letterSpacing: '-0.01em'
                            }}
                          >
                            {currency}{(product.unitPrice || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Stock status */}
                      <Box sx={{ mt: 2.5 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'rgba(15, 23, 42, 0.45)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '0.6875rem',
                            display: 'block',
                            mb: 0.75
                          }}
                        >
                          Stock Status
                        </Typography>
                        {product.trackInventory ? (
                          <Chip
                            label={`${product.stockQuantity} - ${getStockStatusText(product.stockQuantity, product.minStockLevel)}`}
                            color={getStockStatusColor(product.stockQuantity, product.minStockLevel)}
                            size="small"
                            sx={{ 
                              fontWeight: 500,
                              fontSize: '0.75rem',
                              height: 24,
                              borderRadius: '6px'
                            }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(15, 23, 42, 0.55)',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}>
                            Service
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Stack>
        ) : (
          // Desktop Table Layout
          <TableContainer
            component={Paper} 
            sx={{ 
              maxHeight: 420,
              borderRadius: '14px',
              background: 'white',
              border: '1px solid rgba(15, 23, 42, 0.06)',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              overflow: 'hidden',
              '& .MuiTable-root': {
                minWidth: 650
              },
              '& .MuiTableCell-root': {
                borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                py: 1.75,
                px: 2.5,
                fontSize: '0.875rem'
              },
              '& .MuiTableHead-root .MuiTableCell-root': {
                backgroundColor: 'rgba(249, 250, 251, 0.8)',
                fontWeight: 600,
                color: 'rgba(15, 23, 42, 0.75)',
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
                borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                position: 'sticky',
                top: 0,
                zIndex: 2
              },
              '& .MuiTableBody-root .MuiTableRow-root': {
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.02)',
                  cursor: 'pointer'
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(139, 92, 246, 0.04)',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 92, 246, 0.06)'
                  }
                }
              }
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {multipleSelection && (
                    <TableCell padding="checkbox" sx={{ width: '60px' }}>
                      Select
                    </TableCell>
                  )}
                  <TableCell sx={{ width: '40%' }}>
                    Product
                  </TableCell>
                  <TableCell sx={{ width: '20%' }}>
                    Category
                  </TableCell>
                  <TableCell align="right" sx={{ width: '15%' }}>
                    Price
                  </TableCell>
                  <TableCell sx={{ width: '25%' }}>
                    Stock
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={multipleSelection ? 5 : 4} 
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <Typography sx={{
                        color: 'rgba(15, 23, 42, 0.45)',
                        fontSize: '0.9375rem',
                        fontWeight: 500
                      }}>
                        {searchTerm || selectedCategory 
                          ? 'No products found matching your criteria.'
                          : 'No products available.'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = multipleSelection && 
                      selectedProducts.find(p => p.id === product.id);
                    const category = categories.find(c => c.id === product.categoryId);
                    
                    return (
                      <TableRow 
                        key={product.id}
                        hover
                        selected={isSelected}
                        onClick={!multipleSelection ? () => handleProductSelect(product) : undefined}
                        sx={{
                          cursor: !multipleSelection ? 'pointer' : 'default'
                        }}
                      >
                        {multipleSelection && (
                          <TableCell padding="checkbox" sx={{ width: '60px' }}>
                            <Checkbox
                              checked={!!isSelected}
                              onChange={() => handleProductSelect(product)}
                              sx={{
                                color: 'rgba(15, 23, 42, 0.25)',
                                '&.Mui-checked': {
                                  color: '#8b5cf6'
                                }
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ width: '40%' }}>
                          <Box>
                            <Typography variant="body2" sx={{
                              fontWeight: 600,
                              color: 'rgba(15, 23, 42, 0.95)',
                              mb: 0.25,
                              letterSpacing: '-0.01em'
                            }}>
                              {product.name}
                            </Typography>
                            {product.description && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  display: 'block',
                                  color: 'rgba(15, 23, 42, 0.55)',
                                  mt: 0.25,
                                  lineHeight: 1.4
                                }}
                              >
                                {product.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ width: '20%' }}>
                          <Typography variant="body2" sx={{
                            color: 'rgba(15, 23, 42, 0.75)',
                            fontWeight: 500
                          }}>
                            {category?.name || 'Uncategorized'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ width: '15%' }}>
                          <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: '#8b5cf6',
                            letterSpacing: '-0.01em'
                          }}>
                            {currency}{(product.unitPrice || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '25%' }}>
                          {product.trackInventory ? (
                            <Chip
                              label={`${product.stockQuantity} - ${getStockStatusText(product.stockQuantity, product.minStockLevel)}`}
                              color={getStockStatusColor(product.stockQuantity, product.minStockLevel)}
                              size="small"
                              sx={{ 
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                height: 24,
                                borderRadius: '6px'
                              }}
                            />
                          ) : (
                            <Typography variant="body2" sx={{
                              color: 'rgba(15, 23, 42, 0.55)',
                              fontWeight: 500
                            }}>
                              Service
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>      <DialogActions sx={{ 
        p: { xs: 2.5, sm: 3 }, 
        background: 'rgba(249, 250, 251, 0.6)',
        borderTop: '1px solid rgba(15, 23, 42, 0.08)',
        gap: 2,
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        justifyContent: 'flex-end'
      }}>
        <Button 
          onClick={handleClose}
          fullWidth={isMobile}
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
        {multipleSelection && (
          <Button
            variant="contained"
            onClick={handleAddSelectedProducts}
            disabled={selectedProducts.length === 0}
            startIcon={<AddShoppingCartIcon sx={{ fontSize: '1.125rem' }} />}
            fullWidth={isMobile}
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
            Add {selectedProducts.length > 0 ? `${selectedProducts.length} ` : ''}Product{selectedProducts.length !== 1 ? 's' : ''}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProductSelectorDialog;
