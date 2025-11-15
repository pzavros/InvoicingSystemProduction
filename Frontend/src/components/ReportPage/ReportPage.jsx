// src/components/ReportPage/ReportPage.jsx
import React, { useState } from 'react';
import { Grid, Typography, Box, Button, Snackbar, Alert, Drawer, IconButton, Divider, Fade, Grow, Paper, useMediaQuery, useTheme } from '@mui/material';
import { Assessment as ReportIcon, ChevronLeft, ChevronRight, Settings, TrendingUp, FileDownload as DownloadIcon, Close } from '@mui/icons-material';
import ColumnSelector from './ColumnSelector';
import ReportFilters from './ReportFilters';
import ReportDisplay from './ReportDisplay';
import ReportExports from './ReportExports';
import useInvoiceReportData from './useInvoiceReportData';
import { exportReportToExcel } from './api';
import PageHelper from '../ReusableComponents/PageHelper';
import { pageHelpContent } from '../../config/pageHelpContent';
import LoadingOverlay from '../ReusableComponents/LoadingOverlay';

const DRAWER_WIDTH = 360;

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
      background: '#f5f5f7',
      flexDirection: { xs: 'column', md: 'row' },
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
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
              background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f7 100%)',
              backdropFilter: 'blur(20px)'
            }
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box sx={{ 
              p: 3,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '0.5px solid rgba(0, 0, 0, 0.06)',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px) saturate(180%)',
              minHeight: '76px'
            }}>
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600,
                  color: '#1d1d1f',
                  fontSize: '1.5rem',
                  letterSpacing: '-0.015em',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}>
                  Settings
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#86868b',
                  fontSize: '0.9375rem',
                  fontWeight: 400,
                  mt: 0.25,
                  letterSpacing: '-0.01em'
                }}>
                  Customize your report
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setDrawerOpen(false)}
                size="medium"
                sx={{ 
                  width: 36,
                  height: 36,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderRadius: '50%',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Close sx={{ fontSize: 20, color: '#1d1d1f' }} />
              </IconButton>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              {/* Column Selector Section */}
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ 
                  mb: 2, 
                  fontWeight: 600, 
                  color: '#1d1d1f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '0.6875rem'
                }}>
                  Columns
                </Typography>
                <ColumnSelector 
                  selectedColumns={selectedColumns}
                  onColumnsChange={setSelectedColumns}
                />
              </Box>

              <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.06)', mx: 3 }} />

              {/* Export Section */}
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ 
                  mb: 2.5, 
                  fontWeight: 600, 
                  color: '#1d1d1f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '0.6875rem'
                }}>
                  Export
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
              p: 3, 
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              borderTop: '0.5px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: selectedColumns.length > 0 ? '#34c759' : '#d1d1d6',
                  boxShadow: selectedColumns.length > 0 ? '0 0 10px rgba(52, 199, 89, 0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              <Typography variant="body2" sx={{ 
                color: '#1d1d1f',
                fontWeight: 500,
                fontSize: '0.9375rem',
                letterSpacing: '-0.01em'
              }}>
                {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''} selected
              </Typography>
            </Box>
          </Box>
        </Drawer>
      ) : (
        /* Desktop: Side Drawer */
      <Fade in={drawerOpen} timeout={400}>
        <Box
          sx={{
            width: drawerOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            borderRight: drawerOpen ? '0.5px solid rgba(0, 0, 0, 0.06)' : 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f7 100%)',
            position: 'relative',
            zIndex: 1300,
            boxShadow: drawerOpen ? '4px 0 24px rgba(0, 0, 0, 0.04)' : 'none'
          }}
        >
          {drawerOpen && (
            <>
              {/* Drawer Header */}
              <Box sx={{ 
                p: 3,
                pl: 3.5,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderBottom: '0.5px solid rgba(0, 0, 0, 0.06)',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                minHeight: '88px'
              }}>
                <Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600,
                    color: '#1d1d1f',
                    letterSpacing: '-0.015em',
                    fontSize: '1.75rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                  }}>
                    Settings
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#86868b',
                    fontSize: '0.9375rem',
                    fontWeight: 400,
                    mt: 0.5,
                    letterSpacing: '-0.01em'
                  }}>
                    Customize your report
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => setDrawerOpen(false)}
                  size="medium"
                  sx={{ 
                    width: 36,
                    height: 36,
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderRadius: '50%',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <ChevronLeft sx={{ fontSize: 22, color: '#1d1d1f' }} />
                </IconButton>
              </Box>

              {/* Scrollable Content */}
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.15)'
                  }
                }
              }}>
                {/* Column Selector Section */}
                <Box sx={{ p: 3, pt: 3.5 }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2.5, 
                    fontWeight: 600, 
                    color: '#1d1d1f',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontSize: '0.6875rem'
                  }}>
                    Columns
                  </Typography>
                  <ColumnSelector 
                    selectedColumns={selectedColumns}
                    onColumnsChange={setSelectedColumns}
                  />
                </Box>

                <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.06)', mx: 3 }} />

                {/* Export Section */}
                <Box sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2.5, 
                    fontWeight: 600, 
                    color: '#1d1d1f',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontSize: '0.6875rem'
                  }}>
                    Export
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
                p: 3, 
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                borderTop: '0.5px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: selectedColumns.length > 0 ? '#34c759' : '#d1d1d6',
                    boxShadow: selectedColumns.length > 0 ? '0 0 10px rgba(52, 199, 89, 0.4)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
                <Typography variant="body2" sx={{ 
                  color: '#1d1d1f',
                  fontWeight: 500,
                  fontSize: '0.9375rem',
                  letterSpacing: '-0.01em'
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
          <Fade in={!drawerOpen} timeout={400}>
            <Box sx={{ 
              position: { xs: 'fixed', md: 'absolute' },
              left: { xs: 16, md: 24 },
              top: { xs: 16, md: 24 },
              transform: 'none',
              zIndex: 1200
            }}>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  color: '#1d1d1f',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  borderRadius: '12px',
                  width: 44,
                  height: 44,
                  border: '0.5px solid rgba(0, 0, 0, 0.04)',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.06)',
                    transform: 'scale(1.05)'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                <Settings sx={{ fontSize: 22 }} />
              </IconButton>
            </Box>
          </Fade>
        )}

        {/* Filters Section */}
        <Grow in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              borderBottom: '0.5px solid rgba(0, 0, 0, 0.06)',
              borderRadius: 0,
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px) saturate(180%)'
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
          p: { xs: 2, sm: 3, md: 4 },
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
                borderRadius: { xs: '18px', md: '20px' },
                overflow: 'hidden',
                backgroundColor: 'white',
                border: '0.5px solid rgba(0, 0, 0, 0.04)',
                boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06), 0 0 0 0.5px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: { xs: '0 2px 16px rgba(0, 0, 0, 0.06)', md: '0 4px 24px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0, 0, 0, 0.03)' }
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
            p: { xs: 2, sm: 2.5, md: 3 },
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderTop: '0.5px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 3 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1.5, sm: 3 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: data?.length > 0 ? '#34c759' : '#d1d1d6',
                    boxShadow: data?.length > 0 ? '0 0 10px rgba(52, 199, 89, 0.4)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
                <Typography variant="body2" sx={{ 
                  color: '#1d1d1f',
                  fontWeight: 500,
                  fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                  letterSpacing: '-0.01em'
                }}>
                  {data?.length || 0} records
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(0, 0, 0, 0.06)', display: { xs: 'none', sm: 'block' } }} />
              <Typography variant="body2" sx={{ 
                color: '#86868b',
                fontWeight: 400,
                fontSize: { xs: '0.8125rem', sm: '0.9375rem' },
                letterSpacing: '-0.01em'
              }}>
                {selectedColumns.length} columns
              </Typography>
              {error && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 59, 48, 0.15)', display: { xs: 'none', sm: 'block' } }} />
                  <Typography variant="body2" sx={{ color: '#ff3b30', fontWeight: 500, fontSize: { xs: '0.8125rem', sm: '0.9375rem' } }}>
                    Error: {error}
                  </Typography>
                </>
              )}
              {loading && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(0, 0, 0, 0.06)', display: { xs: 'none', sm: 'block' } }} />
                  <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: 500, fontSize: { xs: '0.8125rem', sm: '0.9375rem' } }}>
                    Loading...
                  </Typography>
                </>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
              <Button 
                size="medium" 
                variant="outlined" 
                onClick={handleRunReport}
                startIcon={<ChevronRight sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                fullWidth={isMobile}
                sx={{
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  color: '#1d1d1f',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 1, sm: 1.125 },
                  letterSpacing: '-0.01em',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    transform: { xs: 'none', md: 'translateY(-1px)' },
                    boxShadow: 'none'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                {isMobile ? 'Reload' : 'Reload Data'}
              </Button>
              <Button 
                size="medium" 
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
                startIcon={<DownloadIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                disabled={!data || data.length === 0}
                fullWidth={isMobile}
                sx={{
                  background: '#8b5cf6',
                  color: 'white',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 1, sm: 1.125 },
                  letterSpacing: '-0.01em',
                  boxShadow: 'none',
                  border: 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: '#7c3aed',
                    transform: { xs: 'none', md: 'translateY(-1px)' },
                    boxShadow: 'none'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.06)',
                    color: 'rgba(0, 0, 0, 0.26)',
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
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
            border: '0.5px solid rgba(0, 0, 0, 0.04)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            fontSize: '0.9375rem',
            fontWeight: 400,
            letterSpacing: '-0.01em'
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <PageHelper {...pageHelpContent.reports} />
      <LoadingOverlay open={loading || exportLoading} message={exportLoading ? "Exporting report..." : "Loading report..."} />
    </Box>
  );
};

export default ReportPage;
