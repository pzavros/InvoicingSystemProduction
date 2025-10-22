// src/components/ReportPage/useReportsData.js
import { useState, useEffect, useCallback } from 'react';
import {
  getSalesReport,
  getClientReport,
  getInvoiceReport,
  getProductReport,
  getFinancialSummaryReport,
  exportReportToPDF,
  exportReportToExcel
} from './api';

const useReportsData = (reportType, startDate, endDate) => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReportData = useCallback(async () => {
    if (!reportType || !startDate || !endDate) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let data;
      switch (reportType) {
        case 'sales':
          data = await getSalesReport(startDate, endDate);
          break;
        case 'clients':
          data = await getClientReport(startDate, endDate);
          break;
        case 'invoices':
          data = await getInvoiceReport(startDate, endDate);
          break;
        case 'products':
          data = await getProductReport(startDate, endDate);
          break;
        case 'financial':
          data = await getFinancialSummaryReport(startDate, endDate);
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      setReportData(data || []);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to fetch report data');
      // Set mock data for development purposes
      setReportData(getMockData(reportType));
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate]);

  const refreshReportData = useCallback(() => {
    fetchReportData();
  }, [fetchReportData]);

  const exportToPDF = useCallback(async () => {
    try {
      const blob = await exportReportToPDF(reportType, startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportType}-report-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      throw new Error('Failed to export report to PDF');
    }
  }, [reportType, startDate, endDate]);

  const exportToExcel = useCallback(async () => {
    try {
      const blob = await exportReportToExcel(reportType, startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportType}-report-${startDate}-to-${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      throw new Error('Failed to export report to Excel');
    }
  }, [reportType, startDate, endDate]);

  // Mock data generator for development
  const getMockData = (type) => {
    switch (type) {
      case 'sales':
        return [
          {
            date: '2024-10-15',
            invoiceNumber: 'INV-001',
            clientName: 'Acme Corp',
            amount: 1500.00,
            status: 'Paid'
          },
          {
            date: '2024-10-16',
            invoiceNumber: 'INV-002',
            clientName: 'Tech Solutions Ltd',
            amount: 2750.00,
            status: 'Pending'
          },
          {
            date: '2024-10-18',
            invoiceNumber: 'INV-003',
            clientName: 'Global Industries',
            amount: 980.00,
            status: 'Paid'
          }
        ];
      case 'clients':
        return [
          {
            name: 'Acme Corp',
            email: 'contact@acme.com',
            totalInvoices: 5,
            totalAmount: 7500.00,
            lastInvoiceDate: '2024-10-15'
          },
          {
            name: 'Tech Solutions Ltd',
            email: 'info@techsolutions.com',
            totalInvoices: 3,
            totalAmount: 4200.00,
            lastInvoiceDate: '2024-10-16'
          }
        ];
      case 'invoices':
        return [
          {
            invoiceNumber: 'INV-001',
            date: '2024-10-15',
            clientName: 'Acme Corp',
            amount: 1500.00,
            status: 'Paid',
            dueDate: '2024-11-15'
          },
          {
            invoiceNumber: 'INV-002',
            date: '2024-10-16',
            clientName: 'Tech Solutions Ltd',
            amount: 2750.00,
            status: 'Pending',
            dueDate: '2024-11-16'
          }
        ];
      case 'products':
        return [
          {
            productName: 'Web Development Service',
            category: 'Services',
            quantitySold: 5,
            unitPrice: 1500.00,
            totalRevenue: 7500.00
          },
          {
            productName: 'Mobile App Development',
            category: 'Services',
            quantitySold: 2,
            unitPrice: 5000.00,
            totalRevenue: 10000.00
          }
        ];
      case 'financial':
        return [
          {
            metric: 'Total Revenue',
            currentPeriod: 15750.00,
            previousPeriod: 12300.00,
            change: 28.0
          },
          {
            metric: 'Invoice Count',
            currentPeriod: 8,
            previousPeriod: 6,
            change: 33.3
          },
          {
            metric: 'Average Invoice Value',
            currentPeriod: 1968.75,
            previousPeriod: 2050.00,
            change: -4.0
          }
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  return {
    reportData,
    loading,
    error,
    refreshReportData,
    exportToPDF,
    exportToExcel
  };
};

export default useReportsData;
