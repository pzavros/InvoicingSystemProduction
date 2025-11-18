// src/components/ReportPage/useInvoiceReportData.js
import { useState, useCallback } from 'react';
import { getInvoiceReport } from './api';

const useInvoiceReportData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (startDate, endDate, statuses = ['paid', 'unpaid'], groupBy = 'invoices') => {
    setLoading(true);
    setError(null);

    try {
      const invoiceData = await getInvoiceReport(startDate, endDate, statuses, groupBy);
      setData(invoiceData || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch invoice data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData
  };
};

export default useInvoiceReportData;
