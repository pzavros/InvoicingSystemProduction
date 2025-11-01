import React from 'react';
import InvoiceTemplatePreview from '../InvoiceTemplatesPage/InvoiceTemplatePreview';

/**
 * Wrapper component that transforms actual invoice data into the format
 * expected by InvoiceTemplatePreview to ensure invoice previews match template previews exactly
 */
const InvoicePreviewWrapper = ({ 
  invoiceData, 
  items, 
  templateConfig, 
  templateMeta,
  currency,
  formatCurrency,
  formatDate 
}) => {
  // Transform actual invoice data to match the preview format
  const transformedConfig = {
    ...templateConfig,
    currencySymbol: currency || templateConfig?.currencySymbol || '€',
  };

  const transformedMeta = {
    ...templateMeta,
    documentTypeName: getDocumentTypeName(invoiceData.documentTypeId),
  };

  // Helper function to get document type name
  function getDocumentTypeName(documentTypeId) {
    switch (documentTypeId) {
      case 1: return "Invoice";
      case 2: return "Tax Invoice";
      case 3: return "Proforma Invoice";
      case 4: return "Quotation";
      default: return "Invoice";
    }
  }

  return (
    <InvoiceTemplatePreview
      templateConfig={transformedConfig}
      templateMeta={transformedMeta}
      invoiceData={{
        invoiceNumber: invoiceData.invoiceNumber,
        dateOfIssue: formatDate ? formatDate(invoiceData.dateOfIssue) : invoiceData.dateOfIssue,
        dueDate: formatDate ? formatDate(invoiceData.dueDate) : invoiceData.dueDate,
        billFrom: invoiceData.billFrom,
        billFromEmail: invoiceData.billFromEmail,
        address: invoiceData.billFromAddress,
        billTo: invoiceData.billTo,
        billToEmail: invoiceData.billToEmail,
        billToAddress: invoiceData.billToAddress,
        notes: invoiceData.notes,
        total: invoiceData.total,
        subTotal: invoiceData.subTotal,
        taxRate: invoiceData.taxRate,
        taxAmount: invoiceData.taxAmount,
        discountAmount: invoiceData.discountAmount,
      }}
      items={items || []}
      formatCurrency={formatCurrency}
    />
  );
};

export default InvoicePreviewWrapper;
