import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import InvoiceViewForm from '../components/InvoiceViewPage/InvoiceViewForm';
import { getInvoiceById } from '../components/InvoicePage/api';

const InvoiceViewPage = () => {
  const { id } = useParams(); // Changed from invoiceNumber to id
  const location = useLocation();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isEditMode = location.pathname.includes('/edit/');

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const data = await getInvoiceById(id);
        setInvoice(data);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]); // Changed dependency from invoiceNumber to id

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <InvoiceViewForm invoice={invoice} isEditMode={isEditMode} invoiceId={id} />
  );
};

export default InvoiceViewPage;