// src/components/ReportPage/ReportDisplay.jsx
import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Box,
  Paper,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl
} from "@mui/material";
import {
  TableChart as TableIcon,
  ChevronLeft,
  ChevronRight,
  ErrorOutline as ErrorIcon
} from "@mui/icons-material";

const ReportDisplay = ({ 
  data, 
  selectedColumns, 
  filters, 
  loading, 
  error, 
  showReport,
  onRefresh 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Pagination state for mobile
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
  // Use data prop, fallback to invoices for backwards compatibility
  const invoices = data || [];
  
  // Reset page when data changes
  React.useEffect(() => {
    setPage(0);
  }, [data]);
  
  // Calculate paginated data for mobile
  const paginatedInvoices = isMobile 
    ? invoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : invoices;
  
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get user's currency preference from localStorage
  const getUserCurrency = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.currency || 'EUR';
      }
    } catch (error) {
      console.error('Error getting user currency:', error);
    }
    return 'EUR';
  };

  const formatCurrency = (amount) => {
    const currency = getUserCurrency();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { bg: '#34c759', text: '#ffffff' };
      case 'unpaid':
      case 'pending':
        return { bg: '#ff9500', text: '#ffffff' };
      case 'overdue':
        return { bg: '#ff3b30', text: '#ffffff' };
      case 'draft':
        return { bg: '#8e8e93', text: '#ffffff' };
      case 'deleted':
        return { bg: '#ff3b30', text: '#ffffff' };
      default:
        return { bg: '#d1d1d6', text: '#1d1d1f' };
    }
  };

  const getColumnLabel = (columnId) => {
    const labels = {
      invoiceNumber: 'Invoice #',
      date: 'Invoice Date',
      dueDate: 'Due Date',
      status: 'Status',
      documentType: 'Document Type',
      customer: 'Customer Name',
      billToEmail: 'Customer Email',
      billToAddress: 'Customer Address',
      items: 'Items',
      itemTitle: 'Item Title',
      itemDescription: 'Item Description',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      lineTotal: 'Line Total',
      itemCount: 'Number of Items',
      totalQuantity: 'Total Quantity',
      subtotal: 'Subtotal',
      vatAmount: 'VAT Amount',
      discountAmount: 'Discount Amount',
      totalAmount: 'Total Amount',
      invoiceNotes: 'Invoice Notes'
    };
    return labels[columnId] || columnId;
  };

  const renderCellContent = (invoice, columnId) => {
    switch (columnId) {
      case 'totalAmount':
      case 'vatAmount':
      case 'discountAmount':
      case 'subtotal':
        return (
          <Typography sx={{ 
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 500,
            color: '#1d1d1f',
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em'
          }}>
            {formatCurrency(invoice[columnId] || 0)}
          </Typography>
        );
      case 'itemCount':
      case 'totalQuantity':
        return (
          <Typography sx={{ 
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 400,
            color: '#1d1d1f',
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em',
            textAlign: 'center'
          }}>
            {invoice[columnId] || 0}
          </Typography>
        );
      case 'date':
      case 'dueDate':
        return (
          <Typography sx={{ 
            fontWeight: 400,
            color: '#1d1d1f',
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em'
          }}>
            {invoice[columnId] ? formatDate(invoice[columnId]) : '-'}
          </Typography>
        );
      case 'status':
        const statusColors = getStatusColor(invoice[columnId]);
        return (
          <Chip
            label={invoice[columnId] || 'Unknown'}
            size="small"
            sx={{
              backgroundColor: statusColors.bg,
              color: statusColors.text,
              fontWeight: 500,
              fontSize: '0.8125rem',
              letterSpacing: '-0.01em',
              borderRadius: '8px',
              height: '26px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              border: 'none'
            }}
          />
        );
      case 'documentType':
        return (
          <Chip
            label={invoice[columnId] || 'Invoice'}
            size="small"
            sx={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
              fontWeight: 500,
              fontSize: '0.8125rem',
              letterSpacing: '-0.01em',
              borderRadius: '8px',
              height: '26px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              border: 'none'
            }}
          />
        );
      case 'invoiceNotes':
        return (
          <Typography sx={{ 
            fontWeight: 400,
            color: '#86868b',
            fontSize: '0.875rem',
            letterSpacing: '-0.01em',
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {invoice[columnId] || '-'}
          </Typography>
        );
      case 'items':
        // Comma-separated items list (for groupBy=invoices)
        return (
          <Typography sx={{ 
            fontWeight: 400,
            color: '#1d1d1f',
            fontSize: '0.875rem',
            letterSpacing: '-0.01em',
            maxWidth: '400px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {invoice[columnId] || '-'}
          </Typography>
        );
      case 'itemTitle':
        // Item title (for groupBy=items)
        return (
          <Typography sx={{ 
            fontWeight: 500,
            color: '#1d1d1f',
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em'
          }}>
            {invoice[columnId] || '-'}
          </Typography>
        );
      case 'itemDescription':
        // Item description (for groupBy=items)
        return (
          <Typography sx={{ 
            fontWeight: 400,
            color: '#86868b',
            fontSize: '0.875rem',
            letterSpacing: '-0.01em',
            maxWidth: '300px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {invoice[columnId] || '-'}
          </Typography>
        );
      case 'quantity':
        // Quantity (for groupBy=items)
        return (
          <Typography sx={{ 
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 500,
            color: '#1d1d1f',
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em',
            textAlign: 'center'
          }}>
            {invoice[columnId] || 0}
          </Typography>
        );
      case 'unitPrice':
      case 'lineTotal':
        // Unit price and line total (for groupBy=items)
        return (
          <Typography sx={{ 
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 500,
            color: '#1d1d1f',
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em'
          }}>
            {formatCurrency(invoice[columnId] || 0)}
          </Typography>
        );
      default:
        return (
          <Typography sx={{ 
            fontWeight: 400,
            color: '#1d1d1f',
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em'
          }}>
            {invoice[columnId] || '-'}
          </Typography>
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                  transform: 'scale(1)'
                },
                '50%': {
                  opacity: 0.9,
                  transform: 'scale(1.05)'
                }
              }
            }}
          >
            <CircularProgress size={44} sx={{ color: 'white' }} thickness={3} />
          </Box>
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            color: '#1d1d1f', 
            mb: 1,
            fontSize: '1.5rem',
            letterSpacing: '-0.015em'
          }}>
            Loading data
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#86868b',
            fontSize: '1.0625rem',
            fontWeight: 400,
            letterSpacing: '-0.01em'
          }}>
            Please wait while we fetch your report
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 4, 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
      }}>
        <Box sx={{ maxWidth: { xs: '100%', md: '66.666667%', lg: '50%' }, width: '100%', textAlign: 'center' }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
              boxShadow: '0 8px 32px rgba(255, 59, 48, 0.25)'
            }}
          >
            <ErrorIcon sx={{ color: 'white', fontSize: 44 }} />
          </Box>
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            color: '#1d1d1f', 
            mb: 1,
            fontSize: '1.5rem',
            letterSpacing: '-0.015em'
          }}>
            Unable to load data
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#86868b',
            fontSize: '1.0625rem',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            mb: 3
          }}>
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif'
    }}>
      {/* Report content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f5f5f7',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.15)',
          borderRadius: '10px',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.2)',
          },
        },
      }}>
        {!invoices || invoices.length === 0 ? (
          <Box sx={{ p: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Box sx={{ textAlign: 'center', maxWidth: { xs: '100%', md: '66.666667%', lg: '50%' } }}>
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8e8e93 0%, #636366 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3,
                  boxShadow: '0 8px 32px rgba(142, 142, 147, 0.2)'
                }}
              >
                <TableIcon sx={{ color: 'white', fontSize: 44 }} />
              </Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                color: '#1d1d1f', 
                mb: 1.5,
                fontSize: '1.5rem',
                letterSpacing: '-0.015em'
              }}>
                No invoices found
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#86868b', 
                mb: 3,
                fontSize: '1.0625rem',
                fontWeight: 400,
                letterSpacing: '-0.01em'
              }}>
                Try adjusting your date range or status filter to see results
              </Typography>
              <Box sx={{
                p: 2.5,
                borderRadius: '12px',
                background: 'rgba(0, 122, 255, 0.06)',
                border: '0.5px solid rgba(0, 122, 255, 0.15)',
                textAlign: 'left'
              }}>
                <Typography variant="body2" sx={{ 
                  color: '#1d1d1f',
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  letterSpacing: '-0.01em'
                }}>
                  <strong style={{ fontWeight: 600 }}>Tip:</strong> Use a broader date range or select "All Statuses" to see more results.
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : isMobile ? (
          // Mobile Grid/Table View with Pagination
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f5f5f7',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 0, 0, 0.15)',
                borderRadius: '10px',
                '&:hover': {
                  background: 'rgba(0, 0, 0, 0.2)',
                },
              },
            }}>
              <TableContainer>
                <Table size="small" stickyHeader sx={{ minWidth: 300 }}>
                  <TableHead>
                    <TableRow>
                      {selectedColumns.map((columnId) => (
                        <TableCell 
                          key={columnId}
                          sx={{ 
                            fontWeight: 600,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
                            color: '#1d1d1f',
                            fontSize: '0.8125rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            padding: '14px 12px',
                            whiteSpace: 'nowrap',
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                          }}
                        >
                          {getColumnLabel(columnId)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedInvoices.map((invoice, index) => (
                      <TableRow 
                        key={invoice.id || index}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: '#fafafa'
                          },
                          '&:active': {
                            backgroundColor: 'rgba(139, 92, 246, 0.08)',
                          },
                          transition: 'background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {selectedColumns.map((columnId) => (
                          <TableCell 
                            key={columnId}
                            sx={{
                              fontSize: '0.875rem',
                              color: '#1d1d1f',
                              padding: '12px 12px',
                              whiteSpace: ['itemDescription', 'invoiceNotes', 'billToAddress'].includes(columnId) ? 'normal' : 'nowrap',
                              maxWidth: ['itemDescription', 'invoiceNotes', 'billToAddress'].includes(columnId) ? '200px' : 'none',
                              borderBottom: '0.5px solid rgba(0, 0, 0, 0.06)',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                            }}
                          >
                            {renderCellContent(invoice, columnId)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            
            {/* Mobile Pagination Controls */}
            <Box sx={{ 
              borderTop: '0.5px solid rgba(0, 0, 0, 0.1)',
              p: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.04)'
            }}>
              {/* Page Info and Navigation */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: 1.5
              }}>
                <IconButton
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 0}
                  size="medium"
                  sx={{
                    backgroundColor: page === 0 ? 'rgba(0, 0, 0, 0.04)' : 'rgba(139, 92, 246, 0.1)',
                    color: page === 0 ? '#d1d1d6' : '#8b5cf6',
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: page === 0 ? 'rgba(0, 0, 0, 0.04)' : 'rgba(139, 92, 246, 0.15)',
                    },
                    '&:active': {
                      transform: page === 0 ? 'none' : 'scale(0.96)'
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      color: '#d1d1d6',
                    }
                  }}
                >
                  <ChevronLeft fontSize="medium" />
                </IconButton>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  flex: 1,
                }}>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: '#1d1d1f', 
                    fontSize: '0.9375rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Page {page + 1} of {Math.ceil(invoices.length / rowsPerPage)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#86868b', 
                    fontSize: '0.8125rem',
                    fontWeight: 400,
                    letterSpacing: '-0.01em'
                  }}>
                    {invoices.length} total records
                  </Typography>
                </Box>

                <IconButton
                  onClick={() => handleChangePage(page + 1)}
                  disabled={page >= Math.ceil(invoices.length / rowsPerPage) - 1}
                  size="medium"
                  sx={{
                    backgroundColor: page >= Math.ceil(invoices.length / rowsPerPage) - 1 ? 'rgba(0, 0, 0, 0.04)' : 'rgba(139, 92, 246, 0.1)',
                    color: page >= Math.ceil(invoices.length / rowsPerPage) - 1 ? '#d1d1d6' : '#8b5cf6',
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: page >= Math.ceil(invoices.length / rowsPerPage) - 1 ? 'rgba(0, 0, 0, 0.04)' : 'rgba(139, 92, 246, 0.15)',
                    },
                    '&:active': {
                      transform: page >= Math.ceil(invoices.length / rowsPerPage) - 1 ? 'none' : 'scale(0.96)'
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      color: '#d1d1d6',
                    }
                  }}
                >
                  <ChevronRight fontSize="medium" />
                </IconButton>
              </Box>

              {/* Rows Per Page Selector */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 1.5
              }}>
                <Typography variant="body2" sx={{ 
                  color: '#86868b', 
                  fontWeight: 500, 
                  fontSize: '0.875rem',
                  letterSpacing: '-0.01em'
                }}>
                  Rows:
                </Typography>
                <FormControl size="small">
                  <Select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    sx={{
                      fontSize: '0.875rem',
                      minWidth: '70px',
                      height: '36px',
                      borderRadius: '10px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.2)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8b5cf6',
                        borderWidth: '2px'
                      }
                    }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        ) : (
          // Desktop Table View with Horizontal Scroll
          <TableContainer 
            component={Paper}
            elevation={0}
            sx={{ 
              height: '100%',
              maxHeight: '100%',
              overflow: 'auto',
              backgroundColor: 'transparent',
              '&::-webkit-scrollbar': {
                width: '10px',
                height: '10px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f5f5f7',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 0, 0, 0.15)',
                borderRadius: '10px',
                '&:hover': {
                  background: 'rgba(0, 0, 0, 0.2)',
                },
              },
            }}
          >
            <Table stickyHeader size="medium" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  {selectedColumns.map((columnId) => (
                    <TableCell 
                      key={columnId}
                      sx={{ 
                        fontWeight: 600,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
                        color: '#1d1d1f',
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        whiteSpace: 'nowrap',
                        padding: '16px 20px',
                        minWidth: ['status'].includes(columnId) ? '110px' : 
                                  ['invoiceNumber', 'date', 'dueDate', 'quantity'].includes(columnId) ? '130px' :
                                  ['totalAmount', 'vatAmount', 'discountAmount', 'unitPrice', 'subtotal'].includes(columnId) ? '150px' :
                                  ['customer', 'billToEmail', 'itemTitle'].includes(columnId) ? '200px' :
                                  ['billToAddress', 'itemDescription', 'invoiceNotes'].includes(columnId) ? '250px' : '160px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                      }}
                    >
                      {getColumnLabel(columnId)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice, index) => (
                  <TableRow 
                    key={invoice.id || index}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: '#fafafa'
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(139, 92, 246, 0.04)',
                        transform: 'scale(1.001)'
                      },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedColumns.map((columnId) => (
                      <TableCell 
                        key={columnId}
                        sx={{
                          fontSize: '0.9375rem',
                          color: '#1d1d1f',
                          padding: '16px 20px',
                          borderBottom: '0.5px solid rgba(0, 0, 0, 0.06)',
                          whiteSpace: ['itemDescription', 'invoiceNotes', 'billToAddress'].includes(columnId) ? 'normal' : 'nowrap',
                          maxWidth: ['itemDescription', 'invoiceNotes', 'billToAddress'].includes(columnId) ? '300px' : 'none',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                        }}
                      >
                        {renderCellContent(invoice, columnId)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default ReportDisplay;
