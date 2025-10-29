// src/components/ProductCatalogPage/LowStockAlert.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  AlertTitle
} from "@mui/material";
import {
  Warning as WarningIcon,
  Inventory as InventoryIcon
} from "@mui/icons-material";
import ProductInventoryDialog from "./ProductInventoryDialog";

const LowStockAlert = ({ lowStockProducts, onInventoryUpdated, showNotification }) => {
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleRestockClick = (product) => {
    setSelectedProduct(product);
    setInventoryDialogOpen(true);
  };

  const handleInventoryDialogClose = () => {
    setInventoryDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleInventoryUpdated = () => {
    onInventoryUpdated();
    handleInventoryDialogClose();
    showNotification(
      `Stock updated successfully for ${selectedProduct?.name}`,
      "success"
    );
  };
  const getStockLevel = (product) => {
    const percentage = (product.stockQuantity / product.minStockLevel) * 100;
    if (product.stockQuantity <= 0) return { level: "Out of Stock", color: "error" };
    if (percentage <= 50) return { level: "Critical", color: "error" };
    if (percentage <= 100) return { level: "Low", color: "warning" };
    return { level: "Normal", color: "success" };
  };
  if (lowStockProducts.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 6,
          px: 4,
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)'
        }}
      >
        <Box 
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)'
          }}
        >
          <InventoryIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#1f2937', 
            mb: 1,
            fontWeight: 'bold'
          }}
        >
          All Products Well Stocked!
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b7280',
            lineHeight: 1.6
          }}
        >
          No products are currently running low on stock.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>      {/* Enhanced Alert Header */}
      <Alert 
        severity="warning" 
        icon={
          <Box 
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(245, 158, 11, 0.3)'
            }}
          >
            <WarningIcon sx={{ color: 'white', fontSize: 18 }} />
          </Box>
        }
        sx={{ 
          mb: 3,
          borderRadius: 3,
          border: '1px solid rgba(245, 158, 11, 0.3)',
          backgroundColor: 'rgba(254, 243, 199, 0.5)',
          '& .MuiAlert-message': {
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            color: '#92400e',
            mb: 0.5
          }}
        >
          Low Stock Alert
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#b45309'
          }}
        >
          {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's are' : ' is'} running low on stock and may need restocking soon.
        </Typography>
      </Alert>      {/* Enhanced Low Stock Products Table */}
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
              background: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)',
              borderBottom: '2px solid rgba(245, 158, 11, 0.2)'
            }}
          >
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#92400e',
                  fontSize: '0.95rem',
                  py: 2
                }}
              >
                Product
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#92400e',
                  fontSize: '0.95rem'
                }}
              >
                Current Stock
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#92400e',
                  fontSize: '0.95rem'
                }}
              >
                Threshold
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#92400e',
                  fontSize: '0.95rem'
                }}
              >
                Status
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#92400e',
                  fontSize: '0.95rem'
                }}
              >
                Unit
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#92400e',
                  fontSize: '0.95rem'
                }}              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lowStockProducts.map((product) => {
              const stockLevel = getStockLevel(product);
              return (
                <TableRow 
                  key={product.id} 
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(245, 158, 11, 0.02)',
                      cursor: 'pointer',
                      '& .MuiTableCell-root': {
                        backgroundColor: 'transparent'
                      }
                    },
                    '&:nth-of-type(even)': {
                      backgroundColor: 'rgba(254, 249, 195, 0.3)'
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
                          color: '#1f2937'
                        }}
                      >
                        {product.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body1" 
                      sx={{
                        fontWeight: 'bold',
                        color: product.stockQuantity <= 0 ? '#dc2626' : '#d97706',
                        fontSize: '1.1rem'
                      }}
                    >
                      {product.stockQuantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#6b7280',
                        fontWeight: 500
                      }}
                    >
                      {product.minStockLevel}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={stockLevel.level}
                      size="small"
                      icon={product.stockQuantity <= 0 ? <WarningIcon sx={{ fontSize: 14 }} /> : undefined}
                      sx={{
                        backgroundColor: stockLevel.color === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: stockLevel.color === 'error' ? '#dc2626' : '#d97706',
                        border: `1px solid ${stockLevel.color === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        fontWeight: 600,
                        borderRadius: 2,
                        minWidth: '90px'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#6b7280',
                        fontWeight: 500
                      }}
                    >
                      {product.unit}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleRestockClick(product)}
                      sx={{
                        backgroundColor: '#10b981',
                        backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          backgroundColor: '#059669',
                          backgroundImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 12px rgba(16, 185, 129, 0.4)'
                        }
                      }}
                    >
                      Restock
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>      {/* Enhanced Summary Statistics */}
      <Box sx={{ mt: 4, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Paper 
          sx={{ 
            p: 3, 
            flex: 1, 
            minWidth: 200,
            borderRadius: 3,
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #fef2f2 100%)',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.15)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box 
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)'
              }}
            >
              <WarningIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#dc2626',
                fontWeight: 'bold'
              }}
            >
              {lowStockProducts.filter(p => p.stockQuantity <= 0).length}
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#6b7280',
              fontWeight: 500
            }}
          >
            Out of Stock
          </Typography>
        </Paper>
        
        <Paper 
          sx={{ 
            p: 3, 
            flex: 1, 
            minWidth: 200,
            borderRadius: 3,
            border: '1px solid rgba(245, 158, 11, 0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #fffbeb 100%)',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.15)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box 
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(245, 158, 11, 0.3)'
              }}
            >
              <InventoryIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#d97706',
                fontWeight: 'bold'
              }}
            >
              {lowStockProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length}
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#6b7280',
              fontWeight: 500
            }}
          >
            Low Stock
          </Typography>
        </Paper>
        
        <Paper 
          sx={{ 
            p: 3, 
            flex: 1, 
            minWidth: 200,
            borderRadius: 3,
            border: '1px solid rgba(59, 130, 246, 0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #eff6ff 100%)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.15)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box 
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>€</Typography>
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#2563eb',
                fontWeight: 'bold',
                fontSize: '1.8rem'
              }}
            >
              {lowStockProducts.reduce((total, product) => 
                total + (product.unitPrice * product.stockQuantity), 0
              ).toFixed(0)}
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#6b7280',
              fontWeight: 500
            }}
          >
            Total Value at Risk
          </Typography>        </Paper>
      </Box>

      {/* Product Inventory Dialog */}
      {inventoryDialogOpen && selectedProduct && (
        <ProductInventoryDialog
          open={inventoryDialogOpen}
          product={selectedProduct}
          onClose={handleInventoryDialogClose}
          onInventoryUpdated={handleInventoryUpdated}
        />
      )}
    </Box>
  );
};

export default LowStockAlert;
