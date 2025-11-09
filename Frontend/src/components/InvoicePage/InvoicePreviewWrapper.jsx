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
  // Helper function to map documentTypeId to template type
  const getTemplateType = (documentTypeId) => {
    switch (documentTypeId) {
      case 1: return "standard";
      case 2: return "tax";
      case 3: return "proforma";
      case 4: return "quote";
      case 5: return "cash";
      default: return "standard";
    }
  };

  // Helper function to get document type name
  const getDocumentTypeTitle = (documentTypeId) => {
    switch (documentTypeId) {
      case 1: return "Invoice";
      case 2: return "Tax Invoice";
      case 3: return "Proforma Invoice";
      case 4: return "Quotation";
      case 5: return "Cash Invoice";
      default: return "Invoice";
    }
  };

  // Transform actual invoice data to match the preview format
  const transformedConfig = {
    ...templateConfig,
    type: getTemplateType(invoiceData.documentTypeId), // Override type based on document type
    currencySymbol: currency || templateConfig?.currencySymbol || '€',
  };

  const transformedMeta = {
    ...templateMeta,
    documentTypeName: getDocumentTypeTitle(invoiceData.documentTypeId),
  };

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
