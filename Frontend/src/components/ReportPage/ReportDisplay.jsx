// src/components/ReportPage/ReportDisplay.jsx
import React from "react";
import {
  Grid,
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
  Box
} from "@mui/material";
import {
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon,
  TableChart as TableIcon
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
  // Use data prop, fallback to invoices for backwards compatibility
  const invoices = data || [];
  
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
      <Grid container justifyContent="center" alignItems="center" sx={{ height: '100%' }}>
        <Grid item sx={{ textAlign: 'center' }}>
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
        </Grid>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container sx={{ p: 4, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Grid item xs={12} md={8} lg={6}>
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
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container direction="column" sx={{ height: '100%' }}>
      {/* Report content */}
      <Grid item sx={{ flex: 1, overflow: 'auto' }}>
        {!invoices || invoices.length === 0 ? (
          <Grid container sx={{ p: 4, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Grid item xs={12} md={8} lg={6} sx={{ textAlign: 'center' }}>
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
            </Grid>
          </Grid>
        ) : (
          <TableContainer sx={{ height: '100%' }}>
            <Table stickyHeader size="small">
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
                        letterSpacing: '0.5px'
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
                          color: '#374151'
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
      </Grid>
    </Grid>
  );
};

export default ReportDisplay;
