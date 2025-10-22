// src/components/ReportPage/ReportPage.jsx
import React, { useState } from 'react';
import { Grid, Typography, Box, Button, Snackbar, Alert, Drawer, IconButton, Divider, Fade, Grow, Paper } from '@mui/material';
import { Assessment as ReportIcon, ChevronLeft, ChevronRight, Settings, TrendingUp, FileDownload as DownloadIcon } from '@mui/icons-material';
import ColumnSelector from './ColumnSelector';
import ReportFilters from './ReportFilters';
import ReportDisplay from './ReportDisplay';
import ReportExports from './ReportExports';
import useInvoiceReportData from './useInvoiceReportData';
import { exportReportToExcel } from './api';

const DRAWER_WIDTH = 340;

const ReportPage = () => {
  // Set default filter values for testing
  const [filters, setFilters] = useState({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'all'
  });

  const { data, loading, error, fetchData } = useInvoiceReportData();
  const [exportLoading, setExportLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [showReport, setShowReport] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const [selectedColumns, setSelectedColumns] = useState([
    'invoiceNumber',
    'date',
    'customer',
    'billToEmail',
    'status',
    'totalAmount'
  ]);

  const handleRunReport = () => {
    setShowReport(true);
    fetchData(filters.startDate, filters.endDate, filters.status);
  };

  // Convert status filter to status IDs for backend
  const getStatusIds = (status) => {
    const statusMap = {
      'all': [1, 2, 3, 4],
      'draft': [1],
      'pending': [2],
      'paid': [3],
      'overdue': [4]
    };
    return statusMap[status] || [1, 2, 3, 4];
  };

  const handleExport = async (format) => {
    if (format === 'pdf') {
      setNotification({
        open: true,
        message: 'PDF export is not yet implemented',
        severity: 'warning'
      });
      return;
    }

    if (format === 'excel') {
      if (selectedColumns.length === 0) {
        setNotification({
          open: true,
          message: 'Please select at least one column to export',
          severity: 'warning'
        });
        return;
      }

      setExportLoading(true);
      try {
        const statusIds = getStatusIds(filters.status);
        await exportReportToExcel(
          'logistics',
          filters.startDate,
          filters.endDate,
          statusIds,
          selectedColumns
        );
        setNotification({
          open: true,
          message: 'Excel report exported successfully!',
          severity: 'success'
        });
      } catch (error) {
        console.error('Export failed:', error);
        setNotification({
          open: true,
          message: error.message || 'Failed to export report',
          severity: 'error'
        });
      } finally {
        setExportLoading(false);
      }
    }
  };

  // Don't auto-run report - let user click "Run Report" button
  // React.useEffect(() => {
  //   handleRunReport();
  // }, []);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100%', 
      position: 'relative',
      backgroundColor: '#f8fafc'
    }}>
      {/* Collapsible Drawer - Column Selector & Export */}
      <Fade in={drawerOpen} timeout={300}>
        <Box
          sx={{
            width: drawerOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            borderRight: drawerOpen ? '1px solid rgba(79, 70, 229, 0.1)' : 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            position: 'relative',
            zIndex: 1300,
            boxShadow: drawerOpen ? '4px 0 12px rgba(79, 70, 229, 0.08)' : 'none'
          }}
        >
          {drawerOpen && (
            <>
              {/* Drawer Header */}
              <Box sx={{ 
                p: 2.5, 
                pl: 3,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(79, 70, 229, 0.1)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                minHeight: '72px',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #3b82f6 100%)',
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                    }}
                  >
                    <Settings sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    color: '#000000',
                  }}>
                    Report Settings
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => setDrawerOpen(false)}
                  size="small"
                  sx={{ 
                    backgroundColor: '#f3f4f6',
                    '&:hover': { 
                      backgroundColor: '#e5e7eb',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <ChevronLeft />
                </IconButton>
              </Box>

              {/* Scrollable Content */}
              <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                {/* Column Selector Section */}
                <Box sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 1.5, 
                    fontWeight: 'bold', 
                    color: '#000000',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem'
                  }}>
                    Select Columns
                  </Typography>
                  <ColumnSelector 
                    selectedColumns={selectedColumns}
                    onColumnsChange={setSelectedColumns}
                  />
                </Box>

                <Divider sx={{ borderColor: 'rgba(79, 70, 229, 0.08)' }} />

                {/* Export Section */}
                <Box sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2, 
                    fontWeight: 'bold', 
                    color: '#4f46e5',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem'
                  }}>
                    Export Options
                  </Typography>
                  <ReportExports 
                    onExport={handleExport}
                    loading={exportLoading}
                    reportType="logistics"
                  />
                </Box>
              </Box>

              {/* Selected Info Footer */}
              <Box sx={{ 
                p: 2.5, 
                background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
                borderTop: '1px solid rgba(79, 70, 229, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: selectedColumns.length > 0 ? '#10b981' : '#94a3b8',
                    boxShadow: selectedColumns.length > 0 ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                  }}
                />
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 'medium'
                }}>
                  {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''} selected
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Fade>

      {/* Main Content Area */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Toggle Button (when drawer is closed) */}
        {!drawerOpen && (
          <Fade in={!drawerOpen} timeout={300}>
            <Box sx={{ 
              position: 'absolute', 
              left: 16, 
              top: '50%', 
              transform: 'translateY(-50%)',
              zIndex: 1200
            }}>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 32px rgba(79, 70, 229, 0.5)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <ChevronRight />
              </IconButton>
            </Box>
          </Fade>
        )}

        {/* Filters Section */}
        <Grow in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              borderBottom: '1px solid rgba(79, 70, 229, 0.08)',
              borderRadius: 0,
              backgroundColor: '#ffffff'
            }}
          >
            <ReportFilters 
              filters={filters}
              onFiltersChange={setFilters}
              onRunReport={handleRunReport}
              loading={loading}
            />
          </Paper>
        </Grow>

        {/* Report Display Section */}
        <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
          <Fade in={true} timeout={1000}>
            <Paper
              elevation={2}
              sx={{
                height: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid rgba(79, 70, 229, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.12)'
                }
              }}
            >
              <ReportDisplay 
                data={data}
                selectedColumns={selectedColumns}
                loading={loading}
                error={error}
                showReport={showReport}
                onRefresh={handleRunReport}
              />
            </Paper>
          </Fade>
        </Box>

        {/* Status Footer */}
        <Fade in={true} timeout={1200}>
          <Box sx={{ 
            p: 2, 
            background: 'linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)',
            borderTop: '1px solid rgba(79, 70, 229, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: data?.length > 0 ? '#10b981' : '#94a3b8',
                    boxShadow: data?.length > 0 ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                  {data?.length || 0} records loaded
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(79, 70, 229, 0.1)' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                {selectedColumns.length} columns selected
              </Typography>
              {error && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(239, 68, 68, 0.2)' }} />
                  <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 'medium' }}>
                    Error: {error}
                  </Typography>
                </>
              )}
              {loading && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(79, 70, 229, 0.1)' }} />
                  <Typography variant="caption" sx={{ color: '#4f46e5', fontWeight: 'medium' }}>
                    Loading...
                  </Typography>
                </>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleRunReport}
                startIcon={<ChevronRight />}
                sx={{
                  borderColor: '#4f46e5',
                  color: '#4f46e5',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'medium',
                  '&:hover': {
                    borderColor: '#4338ca',
                    backgroundColor: 'rgba(79, 70, 229, 0.04)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                Reload Data
              </Button>
              <Button 
                size="small" 
                variant="contained"
                onClick={() => {
                  const headers = selectedColumns.map(col => {
                    const labels = {
                      invoiceNumber: 'Invoice #',
                      date: 'Invoice Date',
                      dueDate: 'Due Date',
                      status: 'Status',
                      totalAmount: 'Total Amount',
                      invoiceNotes: 'Notes',
                      customer: 'Customer',
                      billToEmail: 'Customer Email',
                      billToAddress: 'Customer Address',
                      itemTitle: 'Item Title',
                      itemDescription: 'Item Description',
                      quantity: 'Quantity',
                      unitPrice: 'Unit Price',
                      subtotal: 'Subtotal',
                      vatAmount: 'VAT Amount',
                      discountAmount: 'Discount Amount'
                    };
                    return labels[col] || col;
                  });
                  const rows = (data || []).map(invoice => 
                    selectedColumns.map(col => {
                      if (col === 'totalAmount' || col === 'vatAmount' || col === 'discountAmount' || col === 'unitPrice' || col === 'subtotal') {
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
                }}
                startIcon={<DownloadIcon />}
                disabled={!data || data.length === 0}
                sx={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: 'white',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'medium',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                    color: 'white',
                    opacity: 0.7
                  },
                  transition: 'all 0.2s'
                }}
              >
                Export CSV
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportPage;
