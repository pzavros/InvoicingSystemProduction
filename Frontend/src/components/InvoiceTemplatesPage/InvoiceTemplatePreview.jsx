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

const InvoiceTemplatePreview = ({ templateConfig = {}, templateMeta = null, containerSx = {} }) => {
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
    currencyCode: templateConfig.currencyCode || undefined,
    currencySymbol: templateConfig.currencySymbol || templateConfig.currency || '$',
    invoiceNumber: '001',
    dateOfIssue: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    billTo: 'John Smith',
    billToEmail: 'john.smith@example.com',
    billToAddress: '123 Main Street, New York, NY 10001',
    billFrom: 'Your Company Name',
    billFromEmail: 'hello@yourcompany.com',
    address: '456 Business Ave, Suite 100, New York, NY 10002',
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
    },
    {
      itemId: 2,
      itemName: 'SEO Optimization',
      itemDescription: '3-month SEO campaign and optimization',
      itemPrice: '300.00',
      itemQuantity: 1,
    },
    {
      itemId: 3,
      itemName: 'Content Creation',
      itemDescription: 'Blog posts and marketing content',
      itemPrice: '250.00',
      itemQuantity: 1,
    },
  ];

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
    const subtotal = sampleItems.reduce((sum, item) => {
      const price = parseAmount(item.itemPrice);
      const quantity = parseAmount(item.itemQuantity ?? 1);
      return sum + price * quantity;
    }, 0);

    const discountRate = parseAmount(sampleInvoiceData.discountRate);
    const rateDiscount = discountRate > 0 ? subtotal * (discountRate / 100) : 0;
    const providedDiscount = parseAmount(sampleInvoiceData.discountAmount);
    const discountAmount = Math.min(
      subtotal,
      providedDiscount > 0 ? providedDiscount : rateDiscount
    );

    const taxRate = parseAmount(sampleInvoiceData.taxRate);
    const taxAmount = taxRate > 0
      ? (subtotal - discountAmount) * (taxRate / 100)
      : 0;

    const total = Math.max(subtotal - discountAmount + taxAmount, 0);

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
    };
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  const formatCurrency = (value) => {
    const numeric = Number.isFinite(value) ? value : parseAmount(value);
    if (sampleInvoiceData.currencyCode) {
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: sampleInvoiceData.currencyCode.toUpperCase(),
        }).format(numeric);
      } catch (error) {
        console.warn('Failed to format currency with code:', error);
      }
    }

    const symbol = sampleInvoiceData.currencySymbol || '$';
    const needsSpace = symbol && !/\s$/.test(symbol);
    return `${symbol}${needsSpace ? ' ' : ''}${numeric.toFixed(2)}`.trim();
  };

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
              #{sampleInvoiceData.invoiceNumber}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            {logoSettings.showLogo && sections.showCompanyLogo !== false && (
              <Box
                sx={{
                  width: logoDimension,
                  height: logoDimension,
                  backgroundColor: '#f0f0f0',
                  borderRadius: logoSettings.style === 'circle' ? '50%' : borderRadius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <Typography variant="caption" sx={{ color: '#999' }}>
                  Logo
                </Typography>
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
            <Typography variant="body2">{sampleInvoiceData.billFrom}</Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              {sampleInvoiceData.billFromEmail}
            </Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              {sampleInvoiceData.address}
            </Typography>
          </Grid>
          {sections.showClientDetails !== false && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: primary }}>
                To:
              </Typography>
              <Typography variant="body2">{sampleInvoiceData.billTo}</Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                {sampleInvoiceData.billToEmail}
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                {sampleInvoiceData.billToAddress}
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {sections.showDates !== false && (
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              <strong>Date Issued:</strong> {sampleInvoiceData.dateOfIssue}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              <strong>Due Date:</strong> {sampleInvoiceData.dueDate}
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
                <TableCell align="center">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleItems.map((item) => {
                const amount = parseAmount(item.itemPrice) * parseAmount(item.itemQuantity ?? 1);
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
                    <TableCell align="center">{formatCurrency(item.itemPrice)}</TableCell>
                    <TableCell align="center">{formatCurrency(amount)}</TableCell>
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
              <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
            </Box>
            {sections.showTax !== false && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Tax ({sampleInvoiceData.taxRate}%):
                </Typography>
                <Typography variant="body2">{formatCurrency(taxAmount)}</Typography>
              </Box>
            )}
            {sections.showDiscount !== false && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Discount:</Typography>
                <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 500 }}>
                  {formatCurrency(discountAmount)}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: primary }}>
                {formatCurrency(total)}
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
            {formatCurrency(total)}
          </Typography>
          <Typography variant="caption" sx={{ color: textSecondary }}>
            Due upon receipt
          </Typography>
        </Box>
      )}

      {sections.showNotes !== false && sampleInvoiceData.notes && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: primary }}>
            Notes:
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            {sampleInvoiceData.notes}
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
