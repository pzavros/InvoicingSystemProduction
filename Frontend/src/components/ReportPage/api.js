import axios from 'axios';

// API Base URL Configuration
// Development: empty string uses Vite proxy (/api -> http://localhost:5088)
// Production: /api routed through Caddy reverse proxy to backend container
const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL || '';

const reportApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 second timeout
});

// Request interceptor with authentication
reportApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with error handling
reportApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Don't auto-redirect to login from reports page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get invoice reports using existing invoice endpoint and filter on frontend
export const getInvoiceReport = async (startDate, endDate, status = 'all') => {
  // Check if user is authenticated first to avoid 401 calls
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    // Use the existing invoices endpoint - it already filters by logged-in user
    const response = await reportApi.get('/api/Invoices');
    let invoices = response.data || [];
    
    // Transform and filter real data
    return processInvoiceData(invoices, startDate, endDate, status);
  } catch (error) {
    console.error('Error fetching invoice report data:', error);
    throw error;
  }
};

// Helper function to process real invoice data from backend
const processInvoiceData = (invoices, startDate, endDate, status) => {
  // Transform the data - flatten invoice items to create one row per item
  const transformedInvoices = [];
  
  invoices.forEach(invoice => {
    // If invoice has items, create a row for each item
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach(item => {
        const itemSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
        const itemVat = item.isTaxable ? itemSubtotal * ((item.taxRate || 0) / 100) : 0;
        
        transformedInvoices.push({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber || 'N/A',
          date: invoice.dateOfIssue || invoice.date || 'N/A',
          dueDate: invoice.dueDate || 'N/A',
          status: invoice.statusName || 'Unknown',
          totalAmount: parseFloat(invoice.total || 0),
          invoiceNotes: invoice.notes || 'N/A',
          // Customer columns
          customer: invoice.billTo || 'Unknown Client',
          billToEmail: invoice.billToEmail || 'N/A',
          billToAddress: invoice.billToAddress || 'N/A',
          // Item-specific columns
          itemTitle: item.title || item.productName || 'N/A',
          itemDescription: item.description || 'N/A',
          quantity: item.quantity || 0,
          unitPrice: parseFloat(item.unitPrice || 0),
          subtotal: itemSubtotal,
          vatAmount: itemVat,
          discountAmount: 0 // Not available in current schema
        });
      });
    } else {
      // If no items, create a single row for the invoice
      transformedInvoices.push({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber || 'N/A',
        date: invoice.dateOfIssue || invoice.date || 'N/A',
        dueDate: invoice.dueDate || 'N/A',
        status: invoice.statusName || 'Unknown',
        totalAmount: parseFloat(invoice.total || 0),
        invoiceNotes: invoice.notes || 'N/A',
        // Customer columns
        customer: invoice.billTo || 'Unknown Client',
        billToEmail: invoice.billToEmail || 'N/A',
        billToAddress: invoice.billToAddress || 'N/A',
        // Empty item columns
        itemTitle: 'N/A',
        itemDescription: 'N/A',
        quantity: 0,
        unitPrice: 0,
        subtotal: 0,
        vatAmount: 0,
        discountAmount: 0
      });
    }
  });
  
  // Apply filters
  let filteredInvoices = [...transformedInvoices];
  
  // Filter by date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    filteredInvoices = filteredInvoices.filter(invoice => {
      if (!invoice.date || invoice.date === 'N/A') return false;
      const invoiceDate = new Date(invoice.date);
      return !isNaN(invoiceDate.getTime()) && invoiceDate >= start && invoiceDate <= end;
    });
  }
  
  // Filter by status
  if (status && status !== 'all') {
    filteredInvoices = filteredInvoices.filter(invoice => 
      invoice.status?.toLowerCase().includes(status.toLowerCase())
    );
  }
  
  return filteredInvoices;
};

// Get all available invoice statuses
export const getInvoiceStatuses = async () => {
  try {
    const response = await reportApi.get('/api/Invoices/statuses');
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice statuses:', error);
    // Return default statuses if the endpoint fails
    return [
      { statusId: 1, name: 'Draft' },
      { statusId: 2, name: 'Pending' },
      { statusId: 3, name: 'Paid' },
      { statusId: 4, name: 'Overdue' }
    ];
  }
};

// Note: These functions are placeholders for future backend implementation
// For now, they use the invoice endpoint and filter data on frontend

// Get sales reports (placeholder - uses invoice data)
export const getSalesReport = async (startDate, endDate) => {
  return getInvoiceReport(startDate, endDate, 'paid');
};

// Get client reports (placeholder - uses invoice data)
export const getClientReport = async (startDate, endDate) => {
  const invoices = await getInvoiceReport(startDate, endDate);
  // Group by client and aggregate
  const clientMap = {};
  
  invoices.forEach(invoice => {
    const clientKey = invoice.customer || 'Unknown Client';
    if (!clientMap[clientKey]) {
      clientMap[clientKey] = {
        name: invoice.customer,
        email: invoice.billToEmail,
        totalInvoices: 0,
        totalAmount: 0,
        lastInvoiceDate: null
      };
    }
    
    clientMap[clientKey].totalInvoices++;
    clientMap[clientKey].totalAmount += invoice.totalAmount || 0;
    
    const invoiceDate = new Date(invoice.date);
    if (!clientMap[clientKey].lastInvoiceDate || invoiceDate > new Date(clientMap[clientKey].lastInvoiceDate)) {
      clientMap[clientKey].lastInvoiceDate = invoice.date;
    }
  });
  
  return Object.values(clientMap);
};

// Get product reports (placeholder)
export const getProductReport = async (startDate, endDate) => {
  // This would need product/invoice items data from backend
  throw new Error('Product reports are not yet implemented - requires backend support');
};

// Get financial summary report (placeholder)
export const getFinancialSummaryReport = async (startDate, endDate) => {
  const invoices = await getInvoiceReport(startDate, endDate);
  
  const currentPeriodRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const currentPeriodCount = invoices.length;
  const avgInvoiceValue = currentPeriodCount > 0 ? currentPeriodRevenue / currentPeriodCount : 0;
  
  return [
    {
      metric: 'Total Revenue',
      currentPeriod: currentPeriodRevenue,
      previousPeriod: 0, // Would need previous period data
      change: 0
    },
    {
      metric: 'Invoice Count',
      currentPeriod: currentPeriodCount,
      previousPeriod: 0,
      change: 0
    },
    {
      metric: 'Average Invoice Value',
      currentPeriod: avgInvoiceValue,
      previousPeriod: 0,
      change: 0
    }
  ];
};

// Export report to PDF (placeholder)
export const exportReportToPDF = async (reportType, startDate, endDate) => {
  throw new Error('PDF export is not yet implemented - requires backend support');
};

// Export report to Excel using backend Reports service
export const exportReportToExcel = async (reportType, startDate, endDate, statusIds = [1,2,3,4], columns = []) => {
  try {
    const params = new URLSearchParams();
    
    // Convert dates to UTC ISO format to avoid timezone issues with PostgreSQL
    const fromDateObj = new Date(startDate);
    const toDateObj = new Date(endDate);
    
    // Set to start of day UTC
    fromDateObj.setUTCHours(0, 0, 0, 0);
    // Set to end of day UTC
    toDateObj.setUTCHours(23, 59, 59, 999);
    
    params.append('from', fromDateObj.toISOString());
    params.append('to', toDateObj.toISOString());
    
    // Add status IDs
    if (statusIds && statusIds.length > 0) {
      statusIds.forEach(id => params.append('statusIds', id.toString()));
    } else {
      // Default to all statuses
      [1, 2, 3, 4].forEach(id => params.append('statusIds', id.toString()));
    }
    
    // Add selected columns if provided
    if (columns && columns.length > 0) {
      columns.forEach(col => params.append('columns', col));
    }

    const response = await reportApi.get(`/api/Reports/logistics?${params.toString()}`, {
      responseType: 'blob',
      timeout: 30000 // 30 second timeout for large reports
    });

    // Create a download link
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename using formatted dates
    const fromDateStr = new Date(startDate).toISOString().split('T')[0];
    const toDateStr = new Date(endDate).toISOString().split('T')[0];
    link.download = `LogisticsReport_${fromDateStr}_${toDateStr}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error exporting report to Excel:', error);
    throw new Error('Failed to export report: ' + (error.response?.data?.message || error.message));
  }
};

export default reportApi;