import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider
} from '@mui/material';
import { COLOR_THEMES } from '../../utils/colorThemes';

const DEFAULT_PRIMARY = '#667eea';
const DEFAULT_SECONDARY = '#4338ca';
const DEFAULT_TEXT = '#1f2937';
const DEFAULT_TEXT_SECONDARY = '#6b7280';

const deriveFontFamily = (fontStyleRaw) => {
  const fontStyle = (fontStyleRaw || '').toString().toLowerCase();
  switch (fontStyle) {
    case 'classic':
      return '"Times New Roman", Times, serif';
    case 'elegant':
      return '"Georgia", serif';
    case 'minimal':
      return '"Arial", sans-serif';
    case 'modern':
      return '"Inter", "Helvetica", sans-serif';
    default:
      return '"Inter", "Helvetica", sans-serif';
  }
};

const resolveThemePalette = (templateConfig) => {
  const themeKeyRaw = templateConfig?.colorTheme || templateConfig?.theme;
  const themeKey = themeKeyRaw ? themeKeyRaw.toString().toLowerCase() : 'blue';
  const palette = COLOR_THEMES?.[themeKey] || {};

  const primary =
    templateConfig?.customColors?.primary ||
    templateConfig?.colors?.primary ||
    templateConfig?.primaryColor ||
    palette.colors?.primary ||
    palette.primary ||
    DEFAULT_PRIMARY;

  const secondary =
    templateConfig?.colors?.secondary ||
    templateConfig?.secondaryColor ||
    palette.colors?.secondary ||
    palette.secondary ||
    DEFAULT_SECONDARY;

  const text =
    templateConfig?.colors?.text ||
    palette.colors?.text ||
    DEFAULT_TEXT;

  const textSecondary =
    templateConfig?.colors?.textSecondary ||
    palette.colors?.textSecondary ||
    DEFAULT_TEXT_SECONDARY;

  return {
    themeKey,
    palette,
    primary,
    secondary,
    text,
    textSecondary,
  };
};

const buildSectionsConfig = (sectionsRaw = {}) => ({
  showLogo: sectionsRaw.showLogo ?? sectionsRaw.showCompanyLogo ?? true,
  showCompanyLogo: sectionsRaw.showCompanyLogo ?? sectionsRaw.showLogo ?? true,
  showInvoiceHeader: sectionsRaw.showInvoiceHeader ?? true,
  showCompanyInfo: sectionsRaw.showCompanyInfo ?? sectionsRaw.showCompanyDetails ?? true,
  showCompanyDetails: sectionsRaw.showCompanyDetails ?? sectionsRaw.showCompanyInfo ?? true,
  showClientDetails: sectionsRaw.showClientDetails ?? true,
  showBankInfo: sectionsRaw.showBankInfo ?? sectionsRaw.showBankDetails ?? true,
  showBankDetails: sectionsRaw.showBankDetails ?? sectionsRaw.showBankInfo ?? true,
  showNotes: sectionsRaw.showNotes ?? true,
  showDates: sectionsRaw.showDates ?? true,
  showItemsTable: sectionsRaw.showItemsTable ?? true,
  showTotals: sectionsRaw.showTotals ?? true,
  showTax: sectionsRaw.showTax ?? true,
  showDiscount: sectionsRaw.showDiscount ?? true,
  showAmountDueBox: sectionsRaw.showAmountDueBox ?? true,
  tableBorder: sectionsRaw.tableBorder ?? true,
  tableStyle: sectionsRaw.tableStyle || 'rounded',
  alternateRowColors: sectionsRaw.alternateRowColors ?? true,
  bankInfoBackground: sectionsRaw.bankInfoBackground ?? true,
});

const InvoiceTemplatePreview = ({ 
  templateConfig = {}, 
  templateMeta = null, 
  containerSx = {},
  invoiceData = null,
  items = null,
  formatCurrency = null,
  companyLogo = null,
  logoMimeType = null
}) => {
  const sections = useMemo(
    () => buildSectionsConfig(templateConfig.sections),
    [templateConfig.sections]
  );

  const {
    themeKey,
    primary,
    secondary,
    text,
    textSecondary,
  } = useMemo(() => resolveThemePalette(templateConfig), [templateConfig]);

  const fontFamily = deriveFontFamily(templateConfig.fontStyle || templateConfig.typography?.fontFamily);
  const borderRadius = templateConfig.layout?.borderRadius || templateConfig.borderRadius || '12px';
  const logoSettings = {
    showLogo: templateConfig.logoSettings?.showLogo
      ?? templateConfig.sections?.showCompanyLogo
      ?? templateConfig.sections?.showLogo
      ?? true,
    size: templateConfig.logoSettings?.size || 'medium',
    style: templateConfig.logoSettings?.style || 'square',
  };

  const computeLogoDimensions = () => {
    switch (logoSettings.size) {
      case 'large':
        return 120;
      case 'small':
        return 60;
      default:
        return 80;
    }
  };

  const sampleInvoiceData = {
    isOpen: true,
    id: 'preview-001',
    currencyCode: templateConfig.currencyCode || 'EUR',
    currencySymbol: templateConfig.currencySymbol || templateConfig.currency || '€',
    invoiceNumber: '001',
    dateOfIssue: new Date().toLocaleDateString('en-GB'),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
    billTo: 'John Smith',
    billToEmail: 'john.smith@example.com',
    billToAddress: '123 Main Street, London, UK',
    billFrom: 'Your Company Name',
    billFromEmail: 'hello@yourcompany.com',
    address: '456 Business Avenue, Limassol, Cyprus',
    notes: 'Thank you for your business! Payment is due within 30 days.',
    total: '1,150.00',
    subTotal: '1,000.00',
    taxRate: 10,
    taxAmount: '100.00',
    discountRate: 5,
    discountAmount: '50.00',
  };

  const sampleItems = [
    {
      itemId: 1,
      itemName: 'Web Design Services',
      itemDescription: 'Complete website redesign and development',
      itemPrice: '500.00',
      itemQuantity: 1,
      itemTaxRate: 10,
    },
    {
      itemId: 2,
      itemName: 'SEO Optimization',
      itemDescription: '3-month SEO campaign and optimization',
      itemPrice: '300.00',
      itemQuantity: 1,
      itemTaxRate: 10,
    },
    {
      itemId: 3,
      itemName: 'Content Creation',
      itemDescription: 'Blog posts and marketing content',
      itemPrice: '250.00',
      itemQuantity: 1,
      itemTaxRate: 10,
    },
  ];

  // Use provided data if available, otherwise use sample data
  const displayData = invoiceData || sampleInvoiceData;
  const displayItems = items || sampleItems;

  const parseAmount = (value) => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === 'string') {
      const normalized = value.replace(/[^0-9.\-]+/g, '');
      const parsed = parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const calculateTotals = () => {
    const subtotal = displayItems.reduce((sum, item) => {
      const price = parseAmount(item.itemPrice);
      const quantity = parseAmount(item.itemQuantity ?? 1);
      return sum + price * quantity;
    }, 0);

    const discountRate = parseAmount(displayData.discountRate);
    const rateDiscount = discountRate > 0 ? subtotal * (discountRate / 100) : 0;
    const providedDiscount = parseAmount(displayData.discountAmount);
    const discountAmount = Math.min(
      subtotal,
      providedDiscount > 0 ? providedDiscount : rateDiscount
    );

    // Calculate VAT breakdown by rate
    const vatBreakdown = {};
    let totalTaxAmount = 0;

    displayItems.forEach((item) => {
      const itemPrice = parseAmount(item.itemPrice);
      const itemQuantity = parseAmount(item.itemQuantity ?? 1);
      const itemTotal = itemPrice * itemQuantity;
      const itemTaxRate = item.itemTaxRate !== undefined && item.itemTaxRate !== null 
        ? parseAmount(item.itemTaxRate) 
        : 0;

      if (itemTaxRate > 0) {
        // Apply discount proportionally to this item
        const itemDiscountAmount = discountAmount > 0 ? (itemTotal / subtotal) * discountAmount : 0;
        const itemNetAmount = itemTotal - itemDiscountAmount;
        const itemVatAmount = itemNetAmount * (itemTaxRate / 100);

        if (!vatBreakdown[itemTaxRate]) {
          vatBreakdown[itemTaxRate] = 0;
        }
        vatBreakdown[itemTaxRate] += itemVatAmount;
        totalTaxAmount += itemVatAmount;
      }
    });

    const total = Math.max(subtotal - discountAmount + totalTaxAmount, 0);

    return {
      subtotal,
      discountAmount,
      taxAmount: totalTaxAmount,
      vatBreakdown,
      total,
    };
  };

  const { subtotal, discountAmount, taxAmount, vatBreakdown, total } = calculateTotals();

  const defaultFormatCurrency = (value) => {
    const numeric = Number.isFinite(value) ? value : parseAmount(value);
    if (displayData.currencyCode) {
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: displayData.currencyCode.toUpperCase(),
        }).format(numeric);
      } catch (error) {
        console.warn('Failed to format currency with code:', error);
      }
    }

    const symbol = displayData.currencySymbol || '$';
    const needsSpace = symbol && !/\s$/.test(symbol);
    return `${symbol}${needsSpace ? ' ' : ''}${numeric.toFixed(2)}`.trim();
  };

  // Use provided formatCurrency if available, otherwise use default
  const currencyFormatter = formatCurrency || defaultFormatCurrency;

  const tableBorderStyle = sections.tableBorder !== false ? '1px solid #e0e0e0' : 'none';
  const tableRadius = sections.tableStyle === 'rounded' ? borderRadius : 0;
  const logoDimension = computeLogoDimensions();

  const containerStyles = {
    maxWidth: 800,
    mx: 'auto',
    backgroundColor: '#ffffff',
    borderRadius,
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
    border: '1px solid #e2e8f0',
    p: { xs: 3, md: 4 },
    fontFamily,
  };

  return (
    <Box sx={{ ...containerStyles, ...containerSx }}>
      {sections.showInvoiceHeader !== false && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: primary,
                fontSize: templateConfig.fontStyle === 'minimal' ? '2rem' : '2.5rem',
              }}
            >
              {templateConfig.type === 'tax'
                ? 'TAX INVOICE'
                : templateConfig.type === 'proforma'
                  ? 'PROFORMA INVOICE'
                  : templateConfig.type === 'quote'
                    ? 'QUOTATION'
                    : 'INVOICE'}
            </Typography>
            <Typography variant="h6" sx={{ color: textSecondary, mt: 1 }}>
              #{displayData.invoiceNumber}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            {logoSettings.showLogo && sections.showCompanyLogo !== false && (
              <Box
                sx={{
                  width: logoDimension,
                  height: logoDimension,
                  backgroundColor: companyLogo ? 'transparent' : '#f0f0f0',
                  borderRadius: logoSettings.style === 'circle' ? '50%' : borderRadius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  overflow: 'hidden',
                }}
              >
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Logo
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {((templateMeta && templateMeta.name) || templateConfig?.customization?.name) && (
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: textSecondary,
              opacity: 0.85
            }}
          >
            Using template: {templateMeta?.name || templateConfig.customization?.name}
          </Typography>
        </Box>
      )}

      {sections.showCompanyInfo !== false && (
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: primary }}>
              From:
            </Typography>
            <Typography variant="body2">{displayData.billFrom}</Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              {displayData.billFromEmail}
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              {displayData.address}
            </Typography>
          </Grid>
          {sections.showClientDetails !== false && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: primary }}>
                To:
              </Typography>
              <Typography variant="body2">{displayData.billTo}</Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                {displayData.billToEmail}
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                {displayData.billToAddress}
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {sections.showDates !== false && (
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              <strong>Date Issued:</strong> {displayData.dateOfIssue}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              <strong>Due Date:</strong> {displayData.dueDate}
            </Typography>
          </Grid>
        </Grid>
      )}

      {sections.showItemsTable !== false && (
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            border: tableBorderStyle,
            borderRadius: tableRadius,
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead
              sx={{
                backgroundColor: primary,
                '& .MuiTableCell-root': {
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: templateConfig.fontStyle === 'minimal' ? '0.875rem' : '1rem',
                },
              }}
            >
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell align="center">Rate</TableCell>
                <TableCell align="center">VAT %</TableCell>
                <TableCell align="center">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayItems.map((item) => {
                const amount = parseAmount(item.itemPrice) * parseAmount(item.itemQuantity ?? 1);
                const itemVatRate = item.itemTaxRate !== undefined && item.itemTaxRate !== null 
                  ? parseAmount(item.itemTaxRate) 
                  : 0;
                
                return (
                  <TableRow
                    key={item.itemId}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: sections.alternateRowColors !== false
                          ? 'rgba(0, 0, 0, 0.04)'
                          : 'transparent',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: text }}>
                        {item.itemName}
                      </Typography>
                      {item.itemDescription && (
                        <Typography variant="caption" sx={{ color: textSecondary }}>
                          {item.itemDescription}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">{item.itemQuantity}</TableCell>
                    <TableCell align="center">{currencyFormatter(item.itemPrice)}</TableCell>
                    <TableCell align="center">{itemVatRate}%</TableCell>
                    <TableCell align="center">{currencyFormatter(amount)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {sections.showTotals !== false && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Box sx={{ minWidth: 240 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2">{currencyFormatter(subtotal)}</Typography>
            </Box>
            {sections.showDiscount !== false && discountAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Discount:</Typography>
                <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 500 }}>
                  -{currencyFormatter(discountAmount)}
                </Typography>
              </Box>
            )}
            {sections.showTax !== false && Object.keys(vatBreakdown).length > 0 && (
              <>
                {Object.entries(vatBreakdown)
                  .sort(([rateA], [rateB]) => parseFloat(rateB) - parseFloat(rateA))
                  .map(([rate, amount]) => (
                    <Box key={rate} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        VAT ({rate}%):
                      </Typography>
                      <Typography variant="body2">{currencyFormatter(amount)}</Typography>
                    </Box>
                  ))}
              </>
            )}
            {sections.showTax !== false && Object.keys(vatBreakdown).length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  VAT (0%):
                </Typography>
                <Typography variant="body2">{currencyFormatter(0)}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: primary }}>
                {currencyFormatter(total)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {sections.showAmountDueBox && (
        <Box
          sx={{
            mb: 4,
            p: 3,
            maxWidth: 300,
            borderRadius,
            border: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: primary, mb: 1 }}>
            Amount Due
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, color: text }}>
            {currencyFormatter(total)}
          </Typography>
          <Typography variant="caption" sx={{ color: textSecondary }}>
            Due upon receipt
          </Typography>
        </Box>
      )}

      {sections.showNotes !== false && displayData.notes && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: primary }}>
            Notes:
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            {displayData.notes}
          </Typography>
        </Box>
      )}

      {(templateConfig.type === 'quote' || templateConfig.type === 'proforma') && (
        <Box 
          sx={{ 
            mb: 4, 
            p: 3, 
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#92400e' }}>
            ⚠️ Disclaimer:
          </Typography>
          <Typography variant="body2" sx={{ color: '#78350f', fontSize: '0.875rem', lineHeight: 1.6 }}>
            {templateConfig.disclaimer || (templateConfig.type === 'quote' 
              ? 'This quotation is valid for 30 days from the date of issue. Prices and availability are subject to change. This is not an invoice and does not constitute a binding agreement until accepted and confirmed by both parties.'
              : 'This is a Proforma Invoice and is provided for informational purposes only. It is not a tax invoice and should not be used for accounting or tax purposes. A final invoice will be issued upon completion of the transaction.')}
          </Typography>
        </Box>
      )}

      {(sections.showBankInfo || sections.showBankDetails) && (
        <Box
          sx={{
            backgroundColor: sections.bankInfoBackground !== false ? '#f9f9f9' : 'transparent',
            p: sections.bankInfoBackground !== false ? 3 : 2,
            borderRadius,
            border: sections.bankInfoBackground === false ? '1px solid #e0e0e0' : 'none',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: primary }}>
            Banking Details:
          </Typography>
          <Typography variant="body2" sx={{ color: text }}>
            Bank Name: Sample Bank
          </Typography>
          <Typography variant="body2" sx={{ color: text }}>
            Account Name: Your Company Name
          </Typography>
          <Typography variant="body2" sx={{ color: text }}>
            Account Number: 123456789
          </Typography>
          <Typography variant="body2" sx={{ color: text }}>
            Swift: SAMPUS33
          </Typography>
          <Typography variant="body2" sx={{ color: text }}>
            IBAN: US12 3456 7890 1234 5678 90
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default InvoiceTemplatePreview;
