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

  return (    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? '100vh' : '80vh',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          borderRadius: isMobile ? 0 : '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          m: isMobile ? 0 : undefined
        }
      }}
    >
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
        borderBottom: '1px solid rgba(102, 126, 234, 0.15)',
        position: 'relative',
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{
            fontWeight: 700,
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}>
            <Box sx={{
              width: { xs: 28, sm: 32 },
              height: { xs: 28, sm: 32 },
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: { xs: '14px', sm: '16px' }
            }}>
              🛍️
            </Box>
            Select Products{isMobile ? '' : ' for Invoice'}
          </Typography>
          <IconButton 
            onClick={handleClose} 
            size="small"
            sx={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              '&:hover': {
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CloseIcon fontSize={isMobile ? 'small' : 'medium'} />
          </IconButton>
        </Box>
      </DialogTitle><DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Search and Filter Section */}        <Box sx={{ 
          mb: { xs: 2, sm: 3 }, 
          p: { xs: 2, sm: 3 },
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(102, 126, 234, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="subtitle1" sx={{ 
            mb: 2, 
            fontWeight: 600,
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}>
            🔍 Search & Filter Products
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2, 
            flexWrap: 'wrap' 
          }}>          <TextField
            label="Search Products"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth={isMobile}
            sx={{ 
              flexGrow: 1, 
              minWidth: { xs: '100%', sm: 250 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-1px)'
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#667eea' }} />
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
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-1px)'
                }
              }
            }}
          >
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >              <MenuItem value="">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📂 All Categories
                </Box>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🏷️ {category.name}
                  </Box>
                </MenuItem>
              ))}</Select>
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
                py: 4,
                px: 2
              }}>
                <Typography color="textSecondary">
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
                      borderRadius: '16px',
                      overflow: 'hidden',
                      background: isSelected 
                        ? 'linear-gradient(145deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))'
                        : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
                      backdropFilter: 'blur(20px)',
                      boxShadow: isSelected 
                        ? '0 4px 20px rgba(102, 126, 234, 0.3)'
                        : '0 4px 16px rgba(0, 0, 0, 0.08)',
                      border: isSelected 
                        ? '2px solid #667eea'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      cursor: !multipleSelection ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      '&:active': {
                        transform: 'scale(0.98)'
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Header with checkbox and product name */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                        {multipleSelection && (
                          <Checkbox
                            checked={!!isSelected}
                            onChange={() => handleProductSelect(product)}
                            sx={{ 
                              p: 0,
                              mt: 0.5,
                              '& .MuiSvgIcon-root': {
                                fontSize: '1.5rem'
                              }
                            }}
                          />
                        )}
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 700,
                              color: '#2d3748',
                              mb: 0.5,
                              fontSize: '1rem'
                            }}
                          >
                            📦 {product.name}
                          </Typography>
                          {product.description && (
                            <Typography 
                              variant="body2" 
                              color="textSecondary"
                              sx={{ 
                                fontSize: '0.8125rem',
                                lineHeight: 1.4
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
                        gap: 2,
                        pt: 2,
                        borderTop: '1px solid rgba(102, 126, 234, 0.1)'
                      }}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#667eea',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              fontSize: '0.65rem',
                              display: 'block',
                              mb: 0.5
                            }}
                          >
                            🏷️ Category
                          </Typography>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontWeight: 600,
                              color: '#2d3748',
                              fontSize: '0.875rem'
                            }}
                          >
                            {category?.name || 'Uncategorized'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#667eea',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              fontSize: '0.65rem',
                              display: 'block',
                              mb: 0.5
                            }}
                          >
                            💰 Price
                          </Typography>
                          <Typography 
                            variant="h6"
                            sx={{ 
                              fontWeight: 700,
                              color: '#667eea',
                              fontSize: '1.1rem'
                            }}
                          >
                            {currency}{(product.unitPrice || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Stock status */}
                      <Box sx={{ mt: 2 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#667eea',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontSize: '0.65rem',
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          📊 Stock Status
                        </Typography>
                        {product.trackInventory ? (
                          <Chip
                            label={`${product.stockQuantity} - ${getStockStatusText(product.stockQuantity, product.minStockLevel)}`}
                            color={getStockStatusColor(product.stockQuantity, product.minStockLevel)}
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
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
              maxHeight: 400,
              borderRadius: '16px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                zIndex: 1
              },
              '& .MuiTable-root': {
                minWidth: 650
              },
              '& .MuiTableCell-root': {
                borderBottom: '1px solid rgba(224, 224, 224, 0.3)',
                py: 1.5,
                transition: 'all 0.2s ease'
              },
              '& .MuiTableHead-root .MuiTableCell-root': {
                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                fontWeight: 'bold',
                color: '#2d3748',
                borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
              },
              '& .MuiTableRow-root:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }
            }}          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {multipleSelection && (
                    <TableCell padding="checkbox" sx={{ width: '60px' }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        ✅ Select
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell sx={{ width: '40%' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      📦 Product
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '20%' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      🏷️ Category
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ width: '15%' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                      💰 Price
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '25%' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>                      📊 Stock Status
                    </Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={multipleSelection ? 5 : 4} 
                      align="center"
                      sx={{ py: 4 }}
                    >
                      <Typography color="textSecondary">
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
                          cursor: !multipleSelection ? 'pointer' : 'default',
                          '&:hover': !multipleSelection ? {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          } : {}
                        }}
                      >{multipleSelection && (
                          <TableCell padding="checkbox" sx={{ width: '60px' }}>
                            <Checkbox
                              checked={!!isSelected}
                              onChange={() => handleProductSelect(product)}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ width: '40%' }}>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {product.name}
                            </Typography>
                            {product.description && (
                              <Typography 
                                variant="caption" 
                                color="textSecondary"
                                sx={{ display: 'block', mt: 0.5 }}
                              >
                                {product.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ width: '20%' }}>
                          <Typography variant="body2">
                            {category?.name || 'Uncategorized'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ width: '15%' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {currency}{(product.unitPrice || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: '25%' }}>
                          {product.trackInventory ? (
                            <Chip
                              label={`${product.stockQuantity} - ${getStockStatusText(product.stockQuantity, product.minStockLevel)}`}
                              color={getStockStatusColor(product.stockQuantity, product.minStockLevel)}
                              size="small"
                              sx={{ maxWidth: '100%' }}
                            />
                          ) : (
                            <Typography variant="body2" color="textSecondary">
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
        p: { xs: 2, sm: 3 }, 
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
        borderTop: '1px solid rgba(102, 126, 234, 0.1)',
        gap: { xs: 1, sm: 2 },
        flexDirection: { xs: 'column-reverse', sm: 'row' }
      }}>
        <Button 
          onClick={handleClose}
          fullWidth={isMobile}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: { xs: 1.25, sm: 1.5 },
            color: '#64748b',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            '&:hover': {
              backgroundColor: 'rgba(100, 116, 139, 0.05)',
              borderColor: 'rgba(100, 116, 139, 0.3)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          ❌ Cancel
        </Button>
        {multipleSelection && (
          <Button
            variant="contained"
            onClick={handleAddSelectedProducts}
            disabled={selectedProducts.length === 0}
            startIcon={<AddShoppingCartIcon />}
            fullWidth={isMobile}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
              },
              '&:disabled': {
                background: 'rgba(102, 126, 234, 0.3)',
                color: 'rgba(255, 255, 255, 0.7)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            🛒 Add {selectedProducts.length > 0 ? `${selectedProducts.length} ` : ''}Products
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProductSelectorDialog;
