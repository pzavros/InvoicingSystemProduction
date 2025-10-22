// src/components/ReportPage/InvoiceReportDisplay.jsx
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
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Toolbar
} from "@mui/material";
import {
  Print as PrintIcon,
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

const InvoiceReportDisplay = ({ 
  invoices, 
  selectedColumns, 
  filters, 
  loading, 
  error, 
  onRefresh 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
      invoiceNumber: 'Invoice #',
      clientName: 'Client Name',
      clientEmail: 'Client Email',
      date: 'Invoice Date',
      dueDate: 'Due Date',
      amount: 'Amount',
      status: 'Status',
      paymentMethod: 'Payment Method',
      description: 'Description',
      taxAmount: 'Tax Amount',
      totalAmount: 'Total Amount'
    };
    return labels[columnId] || columnId;
  };

  const renderCellContent = (invoice, columnId) => {
    switch (columnId) {
      case 'amount':
      case 'taxAmount':
      case 'totalAmount':
        return formatCurrency(invoice[columnId] || 0);
      case 'date':
      case 'dueDate':
        return invoice[columnId] ? formatDate(invoice[columnId]) : '-';
      case 'status':
        return (
          <Chip
            label={invoice[columnId] || 'Unknown'}
            size="small"
            color={getStatusColor(invoice[columnId])}
            variant="filled"
          />
        );
      default:
        return invoice[columnId] || '-';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create CSV content
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
    a.href = url;
    a.download = `invoice-report-${filters.startDate}-to-${filters.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ height: '50vh' }}>
        <Grid item>
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
            Loading invoice data...
          </Typography>
        </Grid>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container sx={{ p: 3 }}>
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading invoice data: {error}
          </Alert>
          <Button onClick={onRefresh} startIcon={<RefreshIcon />}>
            Retry
          </Button>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container direction="column" sx={{ height: '100vh' }}>
      {/* Header with actions */}
      <Grid item>
        <Toolbar sx={{ px: 3, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 'bold' }}>
            Invoice Report ({invoices?.length || 0} invoices)
          </Typography>
          <IconButton onClick={onRefresh} title="Refresh">
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleExport} title="Export CSV">
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={handlePrint} title="Print">
            <PrintIcon />
          </IconButton>
        </Toolbar>
      </Grid>

      {/* Report content */}
      <Grid item sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {!invoices || invoices.length === 0 ? (
          <Alert severity="info">
            No invoices found for the selected filters. Try adjusting your date range or status filter.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {selectedColumns.map((columnId) => (
                    <TableCell 
                      key={columnId}
                      sx={{ 
                        fontWeight: 'bold',
                        backgroundColor: '#f9fafb',
                        borderBottom: '2px solid #e5e7eb'
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
                      }
                    }}
                  >
                    {selectedColumns.map((columnId) => (
                      <TableCell key={columnId}>
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

export default InvoiceReportDisplay;
