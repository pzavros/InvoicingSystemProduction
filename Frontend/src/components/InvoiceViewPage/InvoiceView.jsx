import React from 'react';
import InvoiceViewForm from './InvoiceViewForm';
import { useParams, useLocation } from 'react-router-dom';

const InvoiceView = ({ invoice }) => {
  const { invoiceNumber } = useParams();
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit/');

  return (
    <InvoiceViewForm 
      invoice={invoice} 
      isEditMode={isEditMode} 
    />
  );
};

export default InvoiceView;