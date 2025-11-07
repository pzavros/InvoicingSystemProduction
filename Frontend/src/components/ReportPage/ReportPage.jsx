// src/components/ReportPage/ReportPage.jsx
import React, { useState } from 'react';
import { Grid, Typography, Box, Button, Snackbar, Alert, Drawer, IconButton, Divider, Fade, Grow, Paper, useMediaQuery, useTheme } from '@mui/material';
import { Assessment as ReportIcon, ChevronLeft, ChevronRight, Settings, TrendingUp, FileDownload as DownloadIcon } from '@mui/icons-material';
import ColumnSelector from './ColumnSelector';
import ReportFilters from './ReportFilters';
import ReportDisplay from './ReportDisplay';
import ReportExports from './ReportExports';
import useInvoiceReportData from './useInvoiceReportData';
import { exportReportToExcel } from './api';
import PageHelper from '../ReusableComponents/PageHelper';
import { pageHelpContent } from '../../config/pageHelpContent';

const DRAWER_WIDTH = 340;

const ReportPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get first day of current month and today's date
  const getDefaultDates = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      startDate: formatDate(firstDayOfMonth),
      endDate: formatDate(today)
    };
  };
  
  const defaultDates = getDefaultDates();
  
  // Set default filter values
  const [filters, setFilters] = useState({
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    status: 'all'
  });

  const { data, loading, error, fetchData } = useInvoiceReportData();
  const [exportLoading, setExportLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [showReport, setShowReport] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile); // Closed by default on mobile

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
      height: { xs: 'auto', md: '100vh' },
      minHeight: { xs: '100vh', md: 'auto' },
      width: '100%', 
      position: 'relative',
      backgroundColor: '#ffffff',
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      {/* Collapsible Drawer - Column Selector & Export */}
      {isMobile ? (
        /* Mobile: Full-screen Drawer */
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: '100%',
              maxWidth: '100vw',
              backgroundColor: '#ffffff'
            }
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box sx={{ 
              p: 2,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
              backgroundColor: 'white',
              minHeight: '64px'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: 'rgba(15, 23, 42, 0.95)',
                  fontSize: '1.125rem',
                  letterSpacing: '-0.02em'
                }}>
                  Report Settings
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setDrawerOpen(false)}
                size="small"
                sx={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.06)',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    backgroundColor: 'rgba(15, 23, 42, 0.12)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <ChevronLeft />
              </IconButton>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              {/* Column Selector Section */}
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ 
                  mb: 1.5, 
                  fontWeight: 600, 
                  color: 'rgba(15, 23, 42, 0.75)',
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

              <Divider sx={{ borderColor: 'rgba(15, 23, 42, 0.08)' }} />

              {/* Export Section */}
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: 'rgba(15, 23, 42, 0.75)',
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
              p: 2, 
              backgroundColor: 'rgba(15, 23, 42, 0.02)',
              borderTop: '1px solid rgba(15, 23, 42, 0.08)',
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
                color: 'rgba(15, 23, 42, 0.65)',
                fontWeight: 500
              }}>
                {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''} selected
              </Typography>
            </Box>

            {/* Close Button */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setDrawerOpen(false)}
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: 'white',
                  borderRadius: '10px',
                  px: 3,
                  py: 1.25,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  }
                }}
              >
                Apply & Close
              </Button>
            </Box>
          </Box>
        </Drawer>
      ) : (
        /* Desktop: Side Drawer */
      <Fade in={drawerOpen} timeout={300}>
        <Box
          sx={{
            width: drawerOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            borderRight: drawerOpen ? '1px solid rgba(15, 23, 42, 0.08)' : 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            position: 'relative',
            zIndex: 1300,
            boxShadow: drawerOpen ? '4px 0 12px rgba(15, 23, 42, 0.06)' : 'none'
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
                borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                backgroundColor: 'white',
                minHeight: '72px'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700,
                    color: 'rgba(15, 23, 42, 0.95)',
                    letterSpacing: '-0.02em'
                  }}>
                    Report Settings
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => setDrawerOpen(false)}
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.06)',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      backgroundColor: 'rgba(15, 23, 42, 0.12)',
                      transform: 'scale(1.05)'
                    }
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
                    fontWeight: 600, 
                    color: 'rgba(15, 23, 42, 0.75)',
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

                <Divider sx={{ borderColor: 'rgba(15, 23, 42, 0.08)' }} />

                {/* Export Section */}
                <Box sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2, 
                    fontWeight: 600, 
                    color: 'rgba(15, 23, 42, 0.75)',
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
                backgroundColor: 'rgba(15, 23, 42, 0.02)',
                borderTop: '1px solid rgba(15, 23, 42, 0.08)',
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
                  color: 'rgba(15, 23, 42, 0.65)',
                  fontWeight: 500
                }}>
                  {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''} selected
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Fade>
      )}

      {/* Main Content Area */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: { xs: 'auto', md: '100%' },
        minHeight: { xs: 'calc(100vh - 64px)', md: 'auto' },
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Toggle Button (when drawer is closed) */}
        {!drawerOpen && (
          <Fade in={!drawerOpen} timeout={300}>
            <Box sx={{ 
              position: { xs: 'fixed', md: 'absolute' },
              right: { xs: 16, md: 16 },
              top: { xs: 16, md: 16 },
              transform: 'none',
              zIndex: 1200
            }}>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  color: 'rgba(15, 23, 42, 0.75)',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: { xs: '10px', md: '12px' },
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                    borderColor: 'rgba(15, 23, 42, 0.15)',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Settings />
              </IconButton>
            </Box>
          </Fade>
        )}

        {/* Filters Section */}
        <Grow in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
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
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: { xs: 1, sm: 2 },
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Fade in={true} timeout={1000}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: { xs: '12px', md: '14px' },
                overflow: 'hidden',
                backgroundColor: 'white',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: { xs: 'none', md: '0 4px 12px rgba(15, 23, 42, 0.08)' }
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
            p: { xs: 1.5, sm: 2 },
            backgroundColor: 'rgba(15, 23, 42, 0.02)',
            borderTop: '1px solid rgba(15, 23, 42, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1.5, sm: 2 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, sm: 2 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
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
                <Typography variant="caption" sx={{ 
                  color: 'rgba(15, 23, 42, 0.65)',
                  fontWeight: 500,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}>
                  {data?.length || 0} records
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(15, 23, 42, 0.08)', display: { xs: 'none', sm: 'block' } }} />
              <Typography variant="caption" sx={{ 
                color: 'rgba(15, 23, 42, 0.65)',
                fontWeight: 500,
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}>
                {selectedColumns.length} columns
              </Typography>
              {error && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(239, 68, 68, 0.2)', display: { xs: 'none', sm: 'block' } }} />
                  <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Error: {error}
                  </Typography>
                </>
              )}
              {loading && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(15, 23, 42, 0.08)', display: { xs: 'none', sm: 'block' } }} />
                  <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Loading...
                  </Typography>
                </>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleRunReport}
                startIcon={<ChevronRight sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                fullWidth={isMobile}
                sx={{
                  borderColor: 'rgba(15, 23, 42, 0.15)',
                  color: 'rgba(15, 23, 42, 0.85)',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.75, sm: 1 },
                  transition: 'all 0.2s ease',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: 'rgba(15, 23, 42, 0.25)',
                    backgroundColor: 'rgba(15, 23, 42, 0.04)',
                    transform: { xs: 'none', md: 'translateY(-1px)' },
                    boxShadow: { xs: 'none', md: '0 2px 8px rgba(15, 23, 42, 0.08)' }
                  }
                }}
              >
                {isMobile ? 'Reload' : 'Reload Data'}
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
                startIcon={<DownloadIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                disabled={!data || data.length === 0}
                fullWidth={isMobile}
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: 'white',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.75, sm: 1 },
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                    transform: { xs: 'none', md: 'translateY(-2px)' },
                    boxShadow: { xs: 'none', md: '0 4px 12px rgba(139, 92, 246, 0.3)' }
                  },
                  '&:disabled': {
                    background: 'rgba(15, 23, 42, 0.12)',
                    color: 'rgba(15, 23, 42, 0.4)',
                    boxShadow: 'none'
                  }
                }}
              >
                {isMobile ? 'CSV' : 'Export CSV'}
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
      
      <PageHelper {...pageHelpContent.reports} />
    </Box>
  );
};

export default ReportPage;
