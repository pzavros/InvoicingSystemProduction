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
  Toolbar,
  Box,
  Paper,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl
} from "@mui/material";
import {
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon,
  TableChart as TableIcon,
  ChevronLeft,
  ChevronRight
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
        return user.currency || 'EUR'; // Default to EUR
      }
    } catch (error) {
      console.error('Error getting user currency:', error);
    }
    return 'EUR'; // Default fallback
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
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getColumnLabel = (columnId) => {
    const labels = {
      // Invoice columns
      invoiceNumber: 'Invoice #',
      date: 'Invoice Date',
      dueDate: 'Due Date',
      status: 'Status',
      totalAmount: 'Total Amount',
      invoiceNotes: 'Notes',
      // Customer columns
      customer: 'Customer',
      billToEmail: 'Customer Email',
      billToAddress: 'Customer Address',
      // Item columns
      itemTitle: 'Item Title',
      itemDescription: 'Item Description',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      subtotal: 'Subtotal',
      vatAmount: 'VAT Amount',
      discountAmount: 'Discount Amount'
    };
    return labels[columnId] || columnId;
  };

  const renderCellContent = (invoice, columnId) => {
    switch (columnId) {
      // Currency fields
      case 'totalAmount':
      case 'vatAmount':
      case 'discountAmount':
      case 'unitPrice':
      case 'subtotal':
        return formatCurrency(invoice[columnId] || 0);
      // Number fields
      case 'quantity':
        return invoice[columnId] || 0;
      // Date fields
      case 'date':
      case 'dueDate':
        return invoice[columnId] ? formatDate(invoice[columnId]) : '-';
      // Status chip
      case 'status':
        return (
          <Chip
            label={invoice[columnId] || 'Unknown'}
            size="small"
            color={getStatusColor(invoice[columnId])}
            variant="filled"
          />
        );
      // Text fields
      case 'invoiceNumber':
      case 'customer':
      case 'billToEmail':
      case 'billToAddress':
      case 'itemTitle':
      case 'itemDescription':
      case 'invoiceNotes':
        return invoice[columnId] || '-';
      default:
        return invoice[columnId] || '-';
    }
  };

  const handleExport = () => {
    const headers = selectedColumns.map(col => getColumnLabel(col));
    const rows = invoices.map(invoice => 
      selectedColumns.map(col => {
        if (col === 'amount' || col === 'taxAmount' || col === 'totalAmount') {
          return invoice[col] || 0;
        }
        return invoice[col] || '';
      })
    );
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `invoice-report-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 2,
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          >
            <CircularProgress size={40} sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#4f46e5', mb: 0.5 }}>
            Loading invoice data...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we fetch your report
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: { xs: '100%', md: '66.666667%', lg: '50%' }, width: '100%' }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Error loading invoice data
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
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
      overflow: 'hidden'
    }}>
      {/* Report content */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f5f9',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#cbd5e1',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: '#94a3b8',
          },
        },
      }}>
        {!invoices || invoices.length === 0 ? (
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Box sx={{ textAlign: 'center', maxWidth: { xs: '100%', md: '66.666667%', lg: '50%' } }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3,
                  boxShadow: '0 8px 24px rgba(107, 114, 128, 0.2)'
                }}
              >
                <TableIcon sx={{ color: 'white', fontSize: 36 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
                No invoices found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your date range or status filter to see results
              </Typography>
              <Alert 
                severity="info"
                sx={{ 
                  borderRadius: 2,
                  textAlign: 'left',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <Typography variant="body2">
                  <strong>Tip:</strong> Use a broader date range or select "All Statuses" to see more results.
                </Typography>
              </Alert>
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
                backgroundColor: '#f1f5f9',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#cbd5e1',
                borderRadius: '3px',
                '&:hover': {
                  backgroundColor: '#94a3b8',
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
                            fontWeight: 'bold',
                            background: 'linear-gradient(145deg, #f9fafb 0%, #f3f4f6 100%)',
                            borderBottom: '2px solid rgba(79, 70, 229, 0.2)',
                            color: '#1f2937',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            padding: '12px 8px',
                            whiteSpace: 'nowrap',
                            position: 'sticky',
                            top: 0,
                            zIndex: 10
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
                            backgroundColor: 'rgba(79, 70, 229, 0.08)',
                          },
                          transition: 'background-color 0.15s'
                        }}
                      >
                        {selectedColumns.map((columnId) => (
                          <TableCell 
                            key={columnId}
                            sx={{
                              fontSize: '0.8rem',
                              color: '#374151',
                              padding: '10px 8px',
                              whiteSpace: ['itemDescription', 'invoiceNotes', 'billToAddress'].includes(columnId) ? 'normal' : 'nowrap',
                              maxWidth: ['itemDescription', 'invoiceNotes', 'billToAddress'].includes(columnId) ? '200px' : 'none',
                              borderBottom: '1px solid rgba(229, 231, 235, 0.8)'
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
              borderTop: '2px solid rgba(79, 70, 229, 0.1)',
              p: 1.5,
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              {/* Page Info and Navigation */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: 1
              }}>
                <IconButton
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 0}
                  size="small"
                  sx={{
                    backgroundColor: page === 0 ? '#f3f4f6' : 'rgba(79, 70, 229, 0.1)',
                    color: page === 0 ? '#9ca3af' : '#4f46e5',
                    padding: '8px',
                    '&:hover': {
                      backgroundColor: page === 0 ? '#f3f4f6' : 'rgba(79, 70, 229, 0.2)',
                    },
                    '&:disabled': {
                      backgroundColor: '#f3f4f6',
                      color: '#d1d5db',
                    }
                  }}
                >
                  <ChevronLeft fontSize="small" />
                </IconButton>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  flex: 1,
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.85rem' }}>
                    Page {page + 1} of {Math.ceil(invoices.length / rowsPerPage)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                    {invoices.length} total records
                  </Typography>
                </Box>

                <IconButton
                  onClick={() => handleChangePage(page + 1)}
                  disabled={page >= Math.ceil(invoices.length / rowsPerPage) - 1}
                  size="small"
                  sx={{
                    backgroundColor: page >= Math.ceil(invoices.length / rowsPerPage) - 1 ? '#f3f4f6' : 'rgba(79, 70, 229, 0.1)',
                    color: page >= Math.ceil(invoices.length / rowsPerPage) - 1 ? '#9ca3af' : '#4f46e5',
                    padding: '8px',
                    '&:hover': {
                      backgroundColor: page >= Math.ceil(invoices.length / rowsPerPage) - 1 ? '#f3f4f6' : 'rgba(79, 70, 229, 0.2)',
                    },
                    '&:disabled': {
                      backgroundColor: '#f3f4f6',
                      color: '#d1d5db',
                    }
                  }}
                >
                  <ChevronRight fontSize="small" />
                </IconButton>
              </Box>

              {/* Rows Per Page Selector */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 1
              }}>
                <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500, fontSize: '0.75rem' }}>
                  Rows:
                </Typography>
                <FormControl size="small">
                  <Select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    sx={{
                      fontSize: '0.8rem',
                      minWidth: '60px',
                      height: '32px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(79, 70, 229, 0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(79, 70, 229, 0.4)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4f46e5',
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
            sx={{ 
              height: '100%',
              maxHeight: '100%',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f5f9',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#cbd5e1',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#94a3b8',
                },
              },
            }}
          >
            <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  {selectedColumns.map((columnId) => (
                    <TableCell 
                      key={columnId}
                      sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(145deg, #f9fafb 0%, #f3f4f6 100%)',
                        borderBottom: '2px solid rgba(79, 70, 229, 0.2)',
                        color: '#000000',
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        minWidth: ['status'].includes(columnId) ? '100px' : 
                                  ['invoiceNumber', 'date', 'dueDate', 'quantity'].includes(columnId) ? '120px' :
                                  ['totalAmount', 'vatAmount', 'discountAmount', 'unitPrice', 'subtotal'].includes(columnId) ? '140px' :
                                  ['customer', 'billToEmail', 'itemTitle'].includes(columnId) ? '180px' :
                                  ['billToAddress', 'itemDescription', 'invoiceNotes'].includes(columnId) ? '220px' : '150px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
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
                        backgroundColor: 'rgba(79, 70, 229, 0.04)',
                        transform: 'scale(1.001)',
                        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.08)'
                      },
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedColumns.map((columnId) => (
                      <TableCell 
                        key={columnId}
                        sx={{
                          fontSize: '0.875rem',
                          color: '#374151',
                          whiteSpace: ['itemDescription', 'invoiceNotes', 'billToAddress'].includes(columnId) ? 'normal' : 'nowrap',
                          maxWidth: ['itemDescription', 'invoiceNotes', 'billToAddress'].includes(columnId) ? '300px' : 'none'
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
