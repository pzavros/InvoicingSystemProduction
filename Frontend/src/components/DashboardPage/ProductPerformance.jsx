import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  TrendingUp,
  ShoppingCart,
  Category
} from '@mui/icons-material';
import { getProductPerformanceStats } from './api';

const ProductPerformance = ({ topCount = 10 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await getProductPerformanceStats(topCount);
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load product performance data');
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [topCount]);

  if (loading) {
    return (
      <Paper
        sx={{
          p: 3,
          borderRadius: '12px',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400
        }}
      >
        <CircularProgress size={32} sx={{ color: '#8b5cf6' }} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          p: 3,
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          backgroundColor: 'rgba(254, 226, 226, 0.3)'
        }}
      >
        <Typography variant="body2" color="error" sx={{ fontSize: '0.9375rem' }}>
          {error}
        </Typography>
      </Paper>
    );
  }

  const currencySymbol = data?.currencySymbol || '€';

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: '12px',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: 'white',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'rgba(139, 92, 246, 0.2)',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <InventoryIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.125rem',
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.01em',
              mb: 0.25
            }}
          >
            Product Performance
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(15, 23, 42, 0.5)',
              fontSize: '0.875rem',
              fontWeight: 400
            }}
          >
            Top selling products and services
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
            border: '1px solid rgba(59, 130, 246, 0.12)'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(15, 23, 42, 0.5)',
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'block',
              mb: 0.5
            }}
          >
            Total Products
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.02em'
            }}
          >
            {data?.totalProducts || 0}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            backgroundColor: 'rgba(34, 197, 94, 0.04)',
            border: '1px solid rgba(34, 197, 94, 0.12)'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(15, 23, 42, 0.5)',
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'block',
              mb: 0.5
            }}
          >
            Active Products
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.02em'
            }}
          >
            {data?.activeProducts || 0}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            backgroundColor: 'rgba(139, 92, 246, 0.04)',
            border: '1px solid rgba(139, 92, 246, 0.12)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <ShoppingCart sx={{ fontSize: 12, color: 'rgba(15, 23, 42, 0.5)' }} />
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(15, 23, 42, 0.5)',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Product Revenue
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.02em'
            }}
          >
            {currencySymbol}{(data?.totalProductRevenue || 0).toFixed(0)}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: '8px',
            backgroundColor: 'rgba(251, 146, 60, 0.04)',
            border: '1px solid rgba(251, 146, 60, 0.12)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Category sx={{ fontSize: 12, color: 'rgba(15, 23, 42, 0.5)' }} />
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(15, 23, 42, 0.5)',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Service Revenue
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'rgba(15, 23, 42, 0.95)',
              letterSpacing: '-0.02em'
            }}
          >
            {currencySymbol}{(data?.totalServiceRevenue || 0).toFixed(0)}
          </Typography>
        </Box>
      </Box>

      {/* Top Products Table */}
      {data?.topProductsByRevenue && data.topProductsByRevenue.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    color: 'rgba(15, 23, 42, 0.5)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                    py: 1.5
                  }}
                >
                  Product/Service
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: 'rgba(15, 23, 42, 0.5)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                    py: 1.5,
                    display: { xs: 'none', sm: 'table-cell' }
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: 'rgba(15, 23, 42, 0.5)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                    py: 1.5
                  }}
                >
                  Revenue
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: 'rgba(15, 23, 42, 0.5)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                    py: 1.5,
                    display: { xs: 'none', md: 'table-cell' }
                  }}
                >
                  Quantity Sold
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: 'rgba(15, 23, 42, 0.5)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                    py: 1.5,
                    display: { xs: 'none', lg: 'table-cell' }
                  }}
                >
                  Avg. Price
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.topProductsByRevenue.map((product, index) => (
                <TableRow
                  key={product.productId}
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': {
                      backgroundColor: 'rgba(139, 92, 246, 0.02)'
                    },
                    transition: 'all 0.15s ease'
                  }}
                >
                  <TableCell
                    sx={{
                      borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                      py: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: index < 3 
                            ? 'rgba(139, 92, 246, 0.12)' 
                            : 'rgba(15, 23, 42, 0.08)',
                          color: index < 3 ? '#8b5cf6' : 'rgba(15, 23, 42, 0.6)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            color: 'rgba(15, 23, 42, 0.95)',
                            mb: product.categoryName ? 0.25 : 0
                          }}
                        >
                          {product.productName}
                        </Typography>
                        {product.categoryName && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(15, 23, 42, 0.5)',
                              fontSize: '0.8125rem'
                            }}
                          >
                            {product.categoryName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                      py: 2,
                      display: { xs: 'none', sm: 'table-cell' }
                    }}
                  >
                    <Chip
                      label={product.isService ? 'Service' : 'Product'}
                      size="small"
                      sx={{
                        backgroundColor: product.isService 
                          ? 'rgba(251, 146, 60, 0.08)' 
                          : 'rgba(59, 130, 246, 0.08)',
                        color: product.isService ? '#ea580c' : '#3b82f6',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        height: 24,
                        borderRadius: '6px'
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                      py: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      <TrendingUp sx={{ fontSize: 14, color: '#16a34a' }} />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'rgba(15, 23, 42, 0.95)'
                        }}
                      >
                        {currencySymbol}{product.totalRevenue.toFixed(2)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                      py: 2,
                      display: { xs: 'none', md: 'table-cell' }
                    }}
                  >
                    <Chip
                      label={product.quantitySold}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(34, 197, 94, 0.08)',
                        color: '#16a34a',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        height: 24,
                        borderRadius: '6px'
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                      py: 2,
                      display: { xs: 'none', lg: 'table-cell' }
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'rgba(15, 23, 42, 0.7)'
                      }}
                    >
                      {currencySymbol}{product.averagePrice.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            color: 'rgba(15, 23, 42, 0.5)'
          }}
        >
          <Typography variant="body2" sx={{ fontSize: '0.9375rem' }}>
            No product data available yet
          </Typography>
        </Box>
      )}

      {/* Low Stock Warning */}
      {data?.lowStockProducts > 0 && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <InventoryIcon sx={{ fontSize: 16, color: '#dc2626' }} />
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#dc2626',
                mb: 0.25
              }}
            >
              Low Stock Alert
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(15, 23, 42, 0.6)',
                fontSize: '0.8125rem'
              }}
            >
              {data.lowStockProducts} {data.lowStockProducts === 1 ? 'product is' : 'products are'} running low on stock
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ProductPerformance;
