import React from "react";
import {
  Dialog,
  DialogContent,
  Grid,
  Box,
  Button,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Divider,
  Link,
  useMediaQuery,
  useTheme,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import { BiPaperPlane, BiCloudDownload } from "react-icons/bi";
import CloseIcon from '@mui/icons-material/Close';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { COLOR_THEMES } from "../../utils/colorThemes";
import InvoiceTemplatePreview from "../InvoiceTemplatesPage/InvoiceTemplatePreview";
import { generateInvoicePdf } from "./api";

// Inject print-specific CSS
const printStyles = `
  @media print {
    @page {
      margin: 0.5in;
      size: A4;
    }
    
    body {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    
    #invoiceCapture {
      background: white !important;
      color: black !important;
      font-family: Arial, sans-serif !important;
    }
    
    .MuiDialog-root,
    .MuiDialog-container,
    .MuiDialog-paper {
      position: static !important;
      transform: none !important;
      margin: 0 !important;
      padding: 0 !important;
      max-width: none !important;
      max-height: none !important;
      width: 100% !important;
      height: auto !important;
      background: white !important;
      box-shadow: none !important;
      border-radius: 0 !important;
    }
    
    .MuiDialogContent-root {
      padding: 0 !important;
      margin: 0 !important;
    }
  }
`;

// Inject styles into document head only once
if (typeof document !== 'undefined' && !document.head.querySelector('#invoice-modal-print-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.id = 'invoice-modal-print-styles';
  styleSheet.innerText = printStyles;
  document.head.appendChild(styleSheet);
}

const GenerateInvoice = (invoiceNumber) => {
  const invoiceElement = document.querySelector("#invoiceCapture");
  
  // Store original styles
  const originalMinWidth = invoiceElement.style.minWidth;
  const originalOverflow = invoiceElement.style.overflow;
  const originalWidth = invoiceElement.style.width;
  
  // Temporarily force desktop width for PDF capture
  invoiceElement.style.minWidth = '800px';
  invoiceElement.style.width = '800px';
  invoiceElement.style.overflow = 'visible';
  
  // Small delay to ensure styles are applied
  setTimeout(() => {
    html2canvas(invoiceElement, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      windowWidth: 800,
    }).then((canvas) => {
      // Restore original styles immediately after capture
      invoiceElement.style.minWidth = originalMinWidth;
      invoiceElement.style.overflow = originalOverflow;
      invoiceElement.style.width = originalWidth;
      
      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // A4 dimensions in points (1 point = 1/72 inch)
      const A4_WIDTH = 612;
      const A4_HEIGHT = 792;
      const FOOTER_HEIGHT = 50; // Space reserved for footer
      const CONTENT_HEIGHT = A4_HEIGHT - FOOTER_HEIGHT; // Available space for content
      const MARGIN = 40;
      
      // Calculate scaling to fit A4 width
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = A4_WIDTH / imgWidth;
      const scaledHeight = imgHeight * ratio;
      
      // Create PDF with A4 pages
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      
      // Calculate how many pages we need (using content height, not full page height)
      const pageCount = Math.ceil(scaledHeight / CONTENT_HEIGHT);
      
      // Helper function to add footer with page numbers
      const addFooter = (pdf, currentPage, totalPages) => {
        const footerY = A4_HEIGHT - 25; // 25pt from bottom
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        
        // Page number (centered)
        if (totalPages > 1) {
          const pageText = `Page ${currentPage} of ${totalPages}`;
          const textWidth = pdf.getTextWidth(pageText);
          pdf.text(pageText, (A4_WIDTH - textWidth) / 2, footerY);
        }
        
        // Generated date (left side) - smaller and less intrusive
        pdf.setFontSize(7);
        const dateText = `Generated: ${new Date().toLocaleDateString()}`;
        pdf.text(dateText, MARGIN, footerY);
      };
      
      if (pageCount === 1) {
        // Single page - add image and footer
        pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH, scaledHeight);
        addFooter(pdf, 1, 1);
      } else {
        // Multi-page - split content across pages with footer space reserved
        for (let page = 0; page < pageCount; page++) {
          if (page > 0) {
            pdf.addPage();
          }
          
          const sourceY = (page * CONTENT_HEIGHT) / ratio;
          const sourceHeight = Math.min(CONTENT_HEIGHT / ratio, imgHeight - sourceY);
          
          // Use canvas slicing for each page
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sourceHeight;
          
          const pageCtx = pageCanvas.getContext('2d');
          pageCtx.drawImage(
            canvas,
            0, sourceY,           // source x, y
            imgWidth, sourceHeight, // source width, height
            0, 0,                 // dest x, y
            imgWidth, sourceHeight  // dest width, height
          );
          
          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          const destHeight = sourceHeight * ratio;
          
          pdf.addImage(pageImgData, "PNG", 0, 0, A4_WIDTH, destHeight);
          
          // Add footer with page numbers
          addFooter(pdf, page + 1, pageCount);
        }
      }
      
      const safeInvoiceNumber = String(invoiceNumber).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`invoice_${safeInvoiceNumber || 'download'}.pdf`);
    }).catch((error) => {
      // Restore styles even if capture fails
      invoiceElement.style.minWidth = originalMinWidth;
      invoiceElement.style.overflow = originalOverflow;
      invoiceElement.style.width = originalWidth;
      console.error('PDF generation failed:', error);
    });
  }, 100);
};

// New function to generate PDF from backend with selectable text
const GenerateInvoiceFromBackend = async (invoiceId, invoiceNumber) => {
  if (!invoiceId) {
    console.error('Invoice ID is required to generate PDF from backend');
    alert('Cannot generate PDF: Invoice has not been saved yet. Please save the invoice first.');
    return;
  }

  try {
    console.log(`Requesting PDF generation for invoice ID: ${invoiceId}`);
    
    // Call backend API to generate PDF
    const pdfBlob = await generateInvoicePdf(invoiceId);
    
    console.log('PDF blob received:', pdfBlob);
    
    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const safeInvoiceNumber = String(invoiceNumber).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `invoice_${safeInvoiceNumber || 'download'}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    window.URL.revokeObjectURL(url);
    
    console.log('PDF download initiated successfully');
  } catch (error) {
    console.error('Backend PDF generation failed - Full error:', error);
    console.error('Error response:', error.response);
    console.error('Error message:', error.message);
    
    // More detailed error message
    let errorMessage = 'Backend PDF generation failed.\n\n';
    
    if (error.response) {
      errorMessage += `Status: ${error.response.status}\n`;
      errorMessage += `Message: ${error.response.data?.message || error.response.statusText}\n\n`;
      
      if (error.response.status === 401) {
        errorMessage += 'Authentication issue - please try logging in again.';
      } else if (error.response.status === 404) {
        errorMessage += 'Invoice not found or PDF endpoint not available.';
      } else if (error.response.status === 500) {
        errorMessage += `Server error: ${error.response.data?.error || 'Unknown error'}`;
      }
    } else if (error.request) {
      errorMessage += 'No response from server. Is the backend running?';
    } else {
      errorMessage += error.message;
    }
    
    errorMessage += '\n\nWould you like to use the fallback image-based PDF instead?';
    
    // Fallback to image-based PDF if backend fails
    const shouldFallback = window.confirm(errorMessage);
    
    if (shouldFallback) {
      GenerateInvoice(invoiceNumber);
    }
  }
};

const InvoiceModal = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Default props to avoid runtime errors
  const items = Array.isArray(props.items) ? props.items : [];
  const info = props.info || {};
  const companyInfo = props.companyInfo || {
    name: info.billFrom || "",
    companyNo: info.companyNo || "",
    vatNo: info.vatNo || "",
    ticNo: info.ticNo || "",
    website: info.website || "",
    email: info.companyEmail || info.billFromEmail || "",
  };

  const placeholderLogoSrc = "";
  const primaryLogoValue = typeof props.logo === 'string' && props.logo.trim().length > 0
    ? props.logo.trim()
    : typeof props.info?.logo === 'string' && props.info.logo.trim().length > 0
      ? props.info.logo.trim()
      : "";
  const parseNumericAmount = (value) => {
    if (value === undefined || value === null) {
      return 0;
    }
    const numeric = typeof value === "string" ? parseFloat(value) : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const rawMimeType = typeof props.logoMimeType === 'string' && props.logoMimeType.trim().length > 0
    ? props.logoMimeType.trim()
    : typeof props.info?.logoMimeType === 'string' && props.info.logoMimeType.trim().length > 0
      ? props.info.logoMimeType.trim()
      : "";

  const cleanedMimeType = rawMimeType
    ? rawMimeType.replace(/^data:/i, "").replace(/;base64$/i, "")
    : "image/png";

  const logoMimeType = cleanedMimeType.includes("/")
    ? cleanedMimeType
    : "image/png";

  const logoSrc = primaryLogoValue
    ? primaryLogoValue.startsWith("data:")
      ? primaryLogoValue
      : `data:${logoMimeType};base64,${primaryLogoValue}`
    : "";

  const bankInfo = props.bankInfo || null;

  const isInvoiceCanceled = props.info.isDeleted || props.info.statusId === 4;
  
  // Function to get document type title based on documentTypeId
  const getDocumentTypeTitle = (documentTypeId) => {
    switch (documentTypeId) {
      case 1: return "INVOICE";
      case 2: return "TAX INVOICE";
      case 3: return "PROFORMA INVOICE";
      case 4: return "QUOTATION";
      case 5: return "CASH INVOICE";
      default: return "INVOICE";
    }
  };

  // Function to map documentTypeId to template type
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
  
  const invoiceTitle = isInvoiceCanceled ? "CANCELED INVOICE" : getDocumentTypeTitle(props.info.documentTypeId);

  // Ensure templateConfig has the correct type based on documentTypeId
  const enhancedTemplateConfig = React.useMemo(() => {
    const config = props.templateConfig || {};
    const derivedType = getTemplateType(props.info.documentTypeId);
    
    return {
      ...config,
      type: config.type || derivedType
    };
  }, [props.templateConfig, props.info.documentTypeId]);

  const templateTheme = React.useMemo(() => {
    const config = enhancedTemplateConfig;
    const rawTheme = (config.theme || config.colorTheme?.id || config.colorTheme || '').toString().toLowerCase();

    let palette = null;
    if (config.colorTheme && typeof config.colorTheme === 'object' && config.colorTheme.colors) {
      palette = config.colorTheme;
    } else if (typeof config.colorTheme === 'string') {
      palette = COLOR_THEMES[config.colorTheme.toLowerCase()] || null;
    } else if (rawTheme && COLOR_THEMES[rawTheme]) {
      palette = COLOR_THEMES[rawTheme];
    }

    const styling = config.styling || {};

    const colors = {
      primary: config.primaryColor || palette?.colors?.primary || '#2563eb',
      secondary: config.secondaryColor || palette?.colors?.secondary || '#1e40af',
      accent: config.accentColor || palette?.colors?.accent || '#3b82f6',
      background: config.backgroundColor || palette?.colors?.background || '#f8fafc',
      surface: config.surfaceColor || palette?.colors?.surface || '#ffffff',
      text: styling.bodyTextColor || config.bodyTextColor || palette?.colors?.text || '#1f2937',
      textSecondary: styling.labelColor || config.labelColor || palette?.colors?.textSecondary || '#6b7280',
      subtleBorder: styling.borderColor || 'rgba(15, 23, 42, 0.08)'
    };

    const headerBackground = styling.headerBackground
      || config.headerBackground
      || config.headerGradient
      || palette?.gradients?.header
      || `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;

    const headerTextColor = styling.headerTextColor
      || config.headerTextColor
      || (rawTheme === 'minimal' ? colors.primary : '#ffffff');

    const tableHeaderBackground = styling.tableHeaderBackground || '#f3f4f6';
    const tableHeaderTextColor = styling.tableHeaderTextColor || (rawTheme === 'minimal' ? colors.primary : colors.textSecondary);
    const totalBackgroundColor = styling.totalBackgroundColor || `${colors.primary}15`;
    const fontFamily = config.fontFamily || config.typography?.fontFamily || '"Inter", "Arial", "Helvetica", sans-serif';
    const borderRadius = config.layout?.borderRadius || '12px';

    const sectionsConfig = config.sections || {};

    const sections = {
      showCompanyLogo: sectionsConfig.showCompanyLogo
        ?? sectionsConfig.showLogo
        ?? config.logoSettings?.showLogo
        ?? true,
      showCompanyDetails: sectionsConfig.showCompanyDetails
        ?? sectionsConfig.showCompanyInfo
        ?? true,
      showCompanyInfo: sectionsConfig.showCompanyInfo
        ?? sectionsConfig.showCompanyDetails
        ?? true,
      showBankDetails: sectionsConfig.showBankDetails
        ?? sectionsConfig.showBankInfo
        ?? true,
      showBankInfo: sectionsConfig.showBankInfo
        ?? sectionsConfig.showBankDetails
        ?? true,
      showNotes: sectionsConfig.showNotes ?? true,
      showTerms: sectionsConfig.showTerms ?? true,
      showDates: sectionsConfig.showDates ?? true,
      highlightTotals: sectionsConfig.highlightTotals ?? true,
      showAmountDueBox: sectionsConfig.showAmountDueBox ?? true,
      showTotals: sectionsConfig.showTotals ?? true,
      showTax: sectionsConfig.showTax ?? true,
      showDiscount: sectionsConfig.showDiscount ?? true,
      showItemsTable: sectionsConfig.showItemsTable ?? true,
    };

    return {
      colors,
      headerBackground,
      headerTextColor,
      tableHeaderBackground,
      tableHeaderTextColor,
      totalBackgroundColor,
      fontFamily,
      borderRadius,
      sections,
    };
  }, [enhancedTemplateConfig]);

  const {
    colors: templateColors,
    headerBackground,
    headerTextColor,
    tableHeaderBackground,
    tableHeaderTextColor,
    totalBackgroundColor,
    fontFamily,
    borderRadius,
    sections,
  } = templateTheme;

  const logoPositionRaw = typeof props.templateConfig?.logoPosition === "string"
    ? props.templateConfig.logoPosition.toLowerCase()
    : "right";

  const logoAlignment = logoPositionRaw === "left"
    ? "flex-start"
    : logoPositionRaw === "center"
      ? "center"
      : "flex-end";

  const logoTextAlign = logoAlignment === "flex-start"
    ? "left"
    : logoAlignment === "center"
      ? "center"
      : "right";

  const shouldRenderLogo = sections.showCompanyLogo && !!logoSrc;
  const hasCustomLogo = primaryLogoValue.length > 0;
  const locale = props.locale;
  const currencyCode = props.currencyCode ? props.currencyCode.toUpperCase() : null;
  const currencySymbol = props.currencySymbol || props.currency || "";
  const dateFormatRaw = props.dateFormat || "MM/DD/YYYY";
  const normalizedDateFormat = dateFormatRaw.toUpperCase().replace(/\s+/g, "");

  const formatCurrency = (value) => {
    const amount = parseNumericAmount(value);

    if (currencyCode) {
      try {
        return new Intl.NumberFormat(locale || undefined, {
          style: "currency",
          currency: currencyCode,
        }).format(amount);
      } catch (err) {
        console.warn("Failed to format currency with preferences:", err);
      }
    }

    const symbol = currencySymbol || "";
    const needsSpace = symbol && !/\s$/.test(symbol);
    return `${symbol}${needsSpace ? " " : ""}${amount.toFixed(2)}`.trim();
  };

  const formatDateWithPreference = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const pad = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    switch (normalizedDateFormat) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "YYYY/MM/DD":
        return `${year}/${month}/${day}`;
      case "DD-MM-YYYY":
        return `${day}-${month}-${year}`;
      case "MM-DD-YYYY":
        return `${month}-${day}-${year}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      default:
        try {
          return date.toLocaleDateString(locale || undefined);
        } catch {
          return `${month}/${day}/${year}`;
        }
    }
  };

  const discountAmountValue = parseNumericAmount(props.discountAmount);
  const showDiscountRow = discountAmountValue > 0;

  const templateName = props.templateMeta?.name || null;

  const spacingUnit = props.templateConfig?.layout?.spacing === 'compact'
    ? 2
    : props.templateConfig?.layout?.spacing === 'large'
      ? 4
      : 3;

  const surfaceColor = templateColors.surface;
  const backgroundColor = templateColors.background;

  return (
    <div>
      <Dialog
        open={props.showModal}
        onClose={props.closeModal}
        fullWidth
        maxWidth="lg"
        fullScreen={isMobile}
        scroll="paper"
        PaperProps={{
          sx: {
            background: surfaceColor,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            borderRadius: isMobile ? 0 : borderRadius,
            overflow: 'hidden',
            m: isMobile ? 0 : undefined,
            maxHeight: isMobile ? '100vh' : '90vh',
            '@media print': {
              boxShadow: 'none',
              borderRadius: 0,
              margin: 0,
              padding: 0,
              maxWidth: 'none',
              width: '100%',
              height: 'auto'
            }
          }
        }}
      >
        {/* Mobile AppBar with Close Button */}
        {isMobile && (
          <AppBar 
            position="sticky" 
            sx={{ 
              backgroundColor: templateColors.primary,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '@media print': {
                display: 'none'
              }
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
              <Typography variant="h6" sx={{ 
                color: 'white', 
                fontWeight: 600,
                fontSize: '1rem'
              }}>
                Invoice Preview
              </Typography>
              <IconButton
                edge="end"
                color="inherit"
                onClick={props.closeModal}
                aria-label="close"
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}
        
        <DialogContent sx={{ 
          p: 0,
          overflow: 'auto',
          '@media print': {
            padding: '0 !important',
            margin: '0 !important'
          }
        }}>
          {/* Invoice Capture Section - Using InvoiceTemplatePreview for identical rendering */}
          <Box
            id="invoiceCapture"
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, // Responsive padding for better mobile preview
              '@media print': {
                background: '#ffffff !important',
                color: '#000000 !important',
                margin: 0,
                padding: '32px',
                width: '100%',
                minHeight: 'auto',
                minWidth: 'auto',
                overflow: 'visible'
              }
            }}
          >
            <InvoiceTemplatePreview
              templateConfig={enhancedTemplateConfig}
              templateMeta={{
                ...props.templateMeta,
                documentTypeName: invoiceTitle
              }}
              invoiceData={{
                currencySymbol: currencySymbol,
                invoiceNumber: props.info.invoiceNumber,
                dateOfIssue: formatDateWithPreference(props.info.dateOfIssue),
                dueDate: formatDateWithPreference(props.info.dueDate),
                billTo: props.info.billTo,
                billToEmail: props.info.billToEmail,
                billToAddress: props.info.billToAddress,
                billFrom: props.info.billFrom,
                billFromEmail: props.info.billFromEmail,
                address: props.info.billFromAddress,
                notes: props.info.notes,
                total: parseNumericAmount(props.total),
                subTotal: parseNumericAmount(props.subTotal),
                taxRate: parseNumericAmount(props.info.taxRate),
                taxAmount: parseNumericAmount(props.taxAmount),
                discountAmount: parseNumericAmount(props.discountAmount),
              }}
              items={items}
              formatCurrency={formatCurrency}
              companyLogo={logoSrc}
              logoMimeType={logoMimeType}
              companyInfo={companyInfo}
              bankInfo={bankInfo}
              containerSx={{
                maxWidth: '100%',
                mx: 0,
                boxShadow: 'none',
                border: 'none',
                borderRadius: 0,
                p: 0,
              }}
            />
          </Box>
          {/* Action Buttons */}
          <Box sx={{ 
            pb: { xs: 2, sm: 3, md: 4 }, 
            px: { xs: 2, sm: 3, md: 4 },
            background: surfaceColor,
            borderTop: `1px solid ${templateColors.subtleBorder}`,
            '@media print': {
              display: 'none'
            }
          }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    background: `linear-gradient(135deg, ${templateColors.primary} 0%, ${templateColors.accent} 100%)`,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                    textTransform: 'none',
                    borderRadius: borderRadius,
                    py: { xs: 1.25, sm: 1.5 },
                    border: 'none',
                    fontFamily,
                    boxShadow: `0 4px 15px ${templateColors.accent}55`
                  }}
                  onClick={() => GenerateInvoiceFromBackend(props.info.id, props.info.invoiceNumber)}
                >
                  <BiCloudDownload
                    style={{
                      width: isMobile ? "16px" : "18px",
                      height: isMobile ? "16px" : "18px",
                      marginRight: "8px",
                    }}
                  />
                  Download Copy
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
      <Box component="hr" sx={{ mt: 4, mb: 3, borderColor: templateColors.subtleBorder }} />
    </div>
  );
};

export default InvoiceModal;
