// src/components/ReportPage/ReportGrid.jsx
import React from "react";
import {
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grow
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from "@mui/icons-material";

const ReportGrid = ({ reportData, reportType, loading, onRefresh }) => {
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

  const renderTableHeaders = () => {
    switch (reportType) {
      case 'sales':
        return (
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
          </TableRow>
        );
      case 'clients':
        return (
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Client Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Total Invoices</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Last Invoice</TableCell>
          </TableRow>
        );
      case 'invoices':
        return (
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Invoice #</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
          </TableRow>
        );
      case 'products':
        return (
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Quantity Sold</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Total Revenue</TableCell>
          </TableRow>
        );
      case 'financial':
        return (
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Metric</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Current Period</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Previous Period</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Change</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trend</TableCell>
          </TableRow>
        );
      default:
        return null;
    }
  };

  const renderTableRows = () => {
    if (!reportData || !reportData.length) {
      return (
        <TableRow>
          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No data available for the selected period
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return reportData.map((row, index) => {
      switch (reportType) {
        case 'sales':
          return (
            <TableRow key={index} hover>
              <TableCell>{formatDate(row.date)}</TableCell>
              <TableCell>{row.invoiceNumber}</TableCell>
              <TableCell>{row.clientName}</TableCell>
              <TableCell>{formatCurrency(row.amount)}</TableCell>
              <TableCell>
                <Chip 
                  label={row.status} 
                  size="small" 
                  color={row.status === 'Paid' ? 'success' : row.status === 'Pending' ? 'warning' : 'error'}
                />
              </TableCell>
            </TableRow>
          );
        case 'clients':
          return (
            <TableRow key={index} hover>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.totalInvoices}</TableCell>
              <TableCell>{formatCurrency(row.totalAmount)}</TableCell>
              <TableCell>{formatDate(row.lastInvoiceDate)}</TableCell>
            </TableRow>
          );
        case 'invoices':
          return (
            <TableRow key={index} hover>
              <TableCell>{row.invoiceNumber}</TableCell>
              <TableCell>{formatDate(row.date)}</TableCell>
              <TableCell>{row.clientName}</TableCell>
              <TableCell>{formatCurrency(row.amount)}</TableCell>
              <TableCell>
                <Chip 
                  label={row.status} 
                  size="small" 
                  color={row.status === 'Paid' ? 'success' : row.status === 'Pending' ? 'warning' : 'error'}
                />
              </TableCell>
              <TableCell>{formatDate(row.dueDate)}</TableCell>
            </TableRow>
          );
        case 'products':
          return (
            <TableRow key={index} hover>
              <TableCell>{row.productName}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{row.quantitySold}</TableCell>
              <TableCell>{formatCurrency(row.unitPrice)}</TableCell>
              <TableCell>{formatCurrency(row.totalRevenue)}</TableCell>
            </TableRow>
          );
        case 'financial':
          return (
            <TableRow key={index} hover>
              <TableCell>{row.metric}</TableCell>
              <TableCell>{formatCurrency(row.currentPeriod)}</TableCell>
              <TableCell>{formatCurrency(row.previousPeriod)}</TableCell>
              <TableCell>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <Typography 
                      variant="body2" 
                      color={row.change >= 0 ? 'success.main' : 'error.main'}
                    >
                      {row.change >= 0 ? '+' : ''}{row.change}%
                    </Typography>
                  </Grid>
                </Grid>
              </TableCell>
              <TableCell>
                <TrendingUpIcon 
                  sx={{ 
                    color: row.change >= 0 ? 'success.main' : 'error.main',
                    transform: row.change < 0 ? 'rotate(180deg)' : 'none'
                  }} 
                />
              </TableCell>
            </TableRow>
          );
        default:
          return null;
      }
    });
  };

  if (loading) {
    return (
      <Grow in={true} timeout={1000}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(168, 85, 247, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300
          }}
        >
          <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item>
              <CircularProgress size={48} sx={{ color: '#a855f7' }} />
            </Grid>
            <Grid item>
              <Typography variant="body1" color="text.secondary">
                Generating report...
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grow>
    );
  }

  return (
    <Grow in={true} timeout={1000}>
      <Paper
        elevation={4}
        sx={{
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(168, 85, 247, 0.1)',
          overflow: 'hidden'
        }}
      >
        <Grid container sx={{ p: 3, pb: 1 }} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <AssessmentIcon sx={{ color: '#a855f7', fontSize: 24 }} />
              </Grid>
              <Grid item>
                <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                  Report Data
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Button
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              size="small"
              sx={{
                color: '#a855f7',
                '&:hover': {
                  backgroundColor: 'rgba(168, 85, 247, 0.1)'
                }
              }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>

        {!reportData || reportData.length === 0 ? (
          <Grid container sx={{ p: 3 }}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No data available for the selected report type and date range. Try adjusting your filters.
              </Alert>
            </Grid>
          </Grid>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                {renderTableHeaders()}
              </TableHead>
              <TableBody>
                {renderTableRows()}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Grow>
  );
};

export default ReportGrid;
