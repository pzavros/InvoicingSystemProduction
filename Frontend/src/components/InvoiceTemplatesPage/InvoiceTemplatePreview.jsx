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
import { useSubscription } from '../../utils/SubscriptionContext';

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
  companyLogo = undefined, // undefined = template preview mode, null or string = actual invoice mode
  logoMimeType = null,
  companyInfo = null,
  bankInfo = null
}) => {
  const sections = useMemo(
    () => buildSectionsConfig(templateConfig.sections),
    [templateConfig.sections]
  );
  
  // Determine if we're in template preview mode (showing sample data)
  const isTemplatePreview = companyLogo === undefined;

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
    // Calculate totals treating prices as GROSS (including VAT)
    let totalGross = 0;
    let totalNet = 0;
    const vatBreakdown = {};

    displayItems.forEach((item) => {
      const grossPrice = parseAmount(item.itemPrice);
      const itemQuantity = parseAmount(item.itemQuantity ?? 1);
      const itemTaxRate = item.itemTaxRate !== undefined && item.itemTaxRate !== null 
        ? parseAmount(item.itemTaxRate) 
        : 0;

      // Line total (gross) - price already includes VAT
      const lineGross = grossPrice * itemQuantity;
      totalGross += lineGross;

      // Extract VAT amount from gross price
      // VAT = gross × (taxRate / (100 + taxRate))
      const itemVatAmount = itemTaxRate > 0 
        ? lineGross * (itemTaxRate / (100 + itemTaxRate))
        : 0;

      // Net amount = Gross - VAT
      const lineNet = lineGross - itemVatAmount;
      totalNet += lineNet;

      // Group VAT by rate
      if (itemTaxRate > 0) {
        if (!vatBreakdown[itemTaxRate]) {
          vatBreakdown[itemTaxRate] = 0;
        }
        vatBreakdown[itemTaxRate] += itemVatAmount;
      }
    });

    // Calculate discount on net amount
    const discountRate = parseAmount(displayData.discountRate);
    const rateDiscount = discountRate > 0 ? totalNet * (discountRate / 100) : 0;
    const providedDiscount = parseAmount(displayData.discountAmount);
    const discountAmount = Math.min(
      totalNet,
      providedDiscount > 0 ? providedDiscount : rateDiscount
    );

    // Calculate total VAT amount
    const totalTaxAmount = Object.values(vatBreakdown).reduce((sum, amount) => sum + amount, 0);

    // Total = Gross - Discount
    const total = Math.max(totalGross - discountAmount, 0);

    return {
      subtotal: totalNet, // Net amount (excluding VAT)
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

  // Get subscription status for watermark
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  
  // Show watermark if not premium and subscription data is loaded
  const showWatermark = !subscriptionLoading && !isPremium;

  const containerStyles = {
    maxWidth: 800,
    mx: 'auto',
    backgroundColor: '#ffffff',
    borderRadius,
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
    border: '1px solid #e2e8f0',
    p: { xs: 3, md: 4 },
    fontFamily,
    position: 'relative', // Add position relative for watermark
  };

  return (
    <Box sx={{ ...containerStyles, ...containerSx }}>
      {/* Free Tier Watermark */}
      {showWatermark && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            opacity: 0.3,
          }}
        >
          {/* E-Invoicing Brand Name */}
          <Typography
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#7c3aed',
              letterSpacing: '-0.5px',
              fontFamily: 'Inter, Arial, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            E-Invoicing
          </Typography>
          <Box
            sx={{
              width: 2,
              height: 28,
              backgroundColor: '#c4b5fd',
            }}
          />
          <Typography
            sx={{
              fontSize: '1.3rem',
              fontWeight: 600,
              color: '#1f2937',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              fontFamily: 'Arial, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            Free Tier
          </Typography>
        </Box>
      )}
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
                    : templateConfig.type === 'cash'
                      ? 'CASH INVOICE'
                      : 'INVOICE'}
            </Typography>
            <Typography variant="h6" sx={{ color: textSecondary, mt: 1 }}>
              #{displayData.invoiceNumber}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            {logoSettings.showLogo && sections.showCompanyLogo !== false && (isTemplatePreview || companyLogo) && (
              <Box
                sx={{
                  width: logoDimension,
                  height: logoDimension,
                  backgroundColor: (isTemplatePreview && !companyLogo) ? '#f0f0f0' : 'transparent',
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
            {displayData.billFrom && (
              <Typography variant="body2">{displayData.billFrom}</Typography>
            )}
            {companyInfo?.name && !displayData.billFrom && (
              <Typography variant="body2">{companyInfo.name}</Typography>
            )}
            {companyInfo?.companyNo && (
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Company No: {companyInfo.companyNo}
              </Typography>
            )}
            {companyInfo?.vatNo && (
              <Typography variant="body2" sx={{ color: textSecondary }}>
                VAT No: {companyInfo.vatNo}
              </Typography>
            )}
            {companyInfo?.ticNo && (
              <Typography variant="body2" sx={{ color: textSecondary }}>
                TIC No: {companyInfo.ticNo}
              </Typography>
            )}
            {displayData.billFromEmail && (
              <Typography variant="body2" sx={{ color: textSecondary }}>
                {displayData.billFromEmail}
              </Typography>
            )}
            {companyInfo?.email && !displayData.billFromEmail && (
              <Typography variant="body2" sx={{ color: textSecondary }}>
                {companyInfo.email}
              </Typography>
            )}
            {companyInfo?.website && (
              <Typography variant="body2" sx={{ color: textSecondary }}>
                {companyInfo.website}
              </Typography>
            )}
            {displayData.address && (
              <Typography variant="body2" sx={{ color: textSecondary }}>
                {displayData.address}
              </Typography>
            )}
          </Grid>
          {sections.showClientDetails !== false && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: primary }}>
                To:
              </Typography>
              {displayData.billTo && (
                <Typography variant="body2">{displayData.billTo}</Typography>
              )}
              {displayData.billToEmail && (
                <Typography variant="body2" sx={{ color: textSecondary }}>
                  {displayData.billToEmail}
                </Typography>
              )}
              {displayData.billToAddress && (
                <Typography variant="body2" sx={{ color: textSecondary }}>
                  {displayData.billToAddress}
                </Typography>
              )}
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

      {sections.showNotes !== false && displayData.notes && displayData.notes.trim() && (
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
        isTemplatePreview || (bankInfo && (bankInfo.bankName || bankInfo.accountName || bankInfo.accountNo || bankInfo.swift || bankInfo.iban))
      ) && (
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
          {(isTemplatePreview || bankInfo?.bankName) && (
            <Typography variant="body2" sx={{ color: text }}>
              Bank Name: {bankInfo?.bankName || 'Sample Bank'}
            </Typography>
          )}
          {(isTemplatePreview || bankInfo?.accountName) && (
            <Typography variant="body2" sx={{ color: text }}>
              Account Name: {bankInfo?.accountName || 'Your Company Name'}
            </Typography>
          )}
          {(isTemplatePreview || bankInfo?.accountNo) && (
            <Typography variant="body2" sx={{ color: text }}>
              Account Number: {bankInfo?.accountNo || '123456789'}
            </Typography>
          )}
          {(isTemplatePreview || bankInfo?.swift) && (
            <Typography variant="body2" sx={{ color: text }}>
              Swift: {bankInfo?.swift || 'SAMPUS33'}
            </Typography>
          )}
          {(isTemplatePreview || bankInfo?.iban) && (
            <Typography variant="body2" sx={{ color: text }}>
              IBAN: {bankInfo?.iban || 'US12 3456 7890 1234 5678 90'}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default InvoiceTemplatePreview;
