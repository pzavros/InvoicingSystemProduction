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
  Avatar,
  Divider,
  Link,
} from "@mui/material";
import { BiPaperPlane, BiCloudDownload } from "react-icons/bi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { COLOR_THEMES } from "../../utils/colorThemes";

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

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = printStyles;
  document.head.appendChild(styleSheet);
}

const GenerateInvoice = (invoiceNumber) => {
  html2canvas(document.querySelector("#invoiceCapture")).then((canvas) => {
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [612, 792],
    });
    pdf.internal.scaleFactor = 1;
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const safeInvoiceNumber = String(invoiceNumber).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    pdf.save(`invoice_${safeInvoiceNumber || 'download'}.pdf`);
  });
};

const InvoiceModal = (props) => {
  const companyInfo = props.companyInfo || {
    name: props.info.billFrom || "Uknown",
    companyNo: props.info.companyNo || "Uknown",
    vatNo: "6789456",
    ticNo: "1234563",
    website: "https://www.i-spiral.com",
    email: "info@i-spiral.com",
  };

  const logoSrc = props.info.logo
    ? `data:image/png;base64,${props.info.logo}`
    : "https://via.placeholder.com/120x120?text=Company+Logo";

  const bankInfo = props.bankInfo || {
    bankName: "Hellenic Bank",
    accountName: "PRIMELEGACY SERVICES LTD",
    accountNo: "350-01-H01712-01",
    swift: "HEBACY2N",
    iban: "CY87 0050 0350 0003 5001 H017 1201",
  };

  const isInvoiceCanceled = props.info.isDeleted || props.info.statusId === 4;
  const invoiceTitle = isInvoiceCanceled ? "CANCELED INVOICE" : "CASH INVOICE";

  const templateTheme = React.useMemo(() => {
    const config = props.templateConfig || {};
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

    const sections = {
      showCompanyLogo: config.sections?.showCompanyLogo ?? true,
      showCompanyDetails: config.sections?.showCompanyDetails ?? true,
      showBankDetails: config.sections?.showBankDetails ?? true,
      showNotes: config.sections?.showNotes ?? true,
      showTerms: config.sections?.showTerms ?? true,
      highlightTotals: config.sections?.highlightTotals ?? true,
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
  }, [props.templateConfig]);

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
        scroll="paper"
        PaperProps={{
          sx: {
            background: surfaceColor,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            borderRadius,
            overflow: 'hidden',
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
        <DialogContent sx={{ 
          p: 0,
          '@media print': {
            padding: '0 !important',
            margin: '0 !important'
          }
        }}>
          {/* Invoice Capture Section */}
          <Box
            id="invoiceCapture"
            sx={{ 
              background: backgroundColor, 
              color: templateColors.text,
              fontFamily,
              '@media print': {
                background: '#ffffff !important',
                color: '#000000 !important',
                margin: 0,
                padding: 0,
                width: '100%',
                minHeight: 'auto'
              }
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                background: headerBackground,
                color: headerTextColor,
                width: "100%",
                p: spacingUnit,
                borderBottom: `1px solid ${templateColors.subtleBorder}`,
                '@media print': {
                  borderBottom: '1px solid #000000'
                }
              }}
            >
              {/* Left side - INVOICE title and details */}
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "50%" }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "700",
                    color: isInvoiceCanceled ? "#dc2626" : headerTextColor,
                    mb: 3,
                    fontFamily,
                    fontSize: { xs: '1.75rem', md: '2.25rem' }
                  }}
                >
                  {invoiceTitle}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ 
                    fontWeight: 500, 
                    color: headerTextColor,
                    mb: 1,
                    fontSize: '0.95rem',
                    fontFamily
                  }}
                >
                  Invoice No.: {props.info.invoiceNumber || ""}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ 
                    fontWeight: 500, 
                    color: headerTextColor,
                    fontSize: '0.95rem',
                    fontFamily
                  }}
                >
                  Date Of Issue: {props.info.dateOfIssue || ""}
                </Typography>
                {templateName && (
                  <Typography
                    variant="body2"
                    sx={{ 
                      fontWeight: 500,
                      color: headerTextColor,
                      fontFamily,
                      opacity: 0.85
                    }}
                  >
                    Using template: {templateName}
                  </Typography>
                )}
              </Box>

              {/* Right side - Company details */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "50%" }}>
                {/* Company Name */}
                <Typography
                  variant="h5"
                  sx={{ 
                    fontWeight: "600", 
                    color: templateColors.text,
                    mb: 2,
                    fontSize: '1.25rem',
                    fontFamily
                  }}
                >
                  {companyInfo.name}
                </Typography>

                {/* Company Details */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  {companyInfo.companyNo && (
                    <Typography variant="body2" sx={{ mb: 0.5, color: templateColors.textSecondary, fontWeight: 400, fontSize: '0.85rem', fontFamily }}>
                      Company No: {companyInfo.companyNo}
                    </Typography>
                  )}
                  {companyInfo.vatNo && (
                    <Typography variant="body2" sx={{ mb: 0.5, color: templateColors.textSecondary, fontWeight: 400, fontSize: '0.85rem', fontFamily }}>
                      VAT No: {companyInfo.vatNo}
                    </Typography>
                  )}
                  {companyInfo.ticNo && (
                    <Typography variant="body2" sx={{ mb: 0.5, color: templateColors.textSecondary, fontWeight: 400, fontSize: '0.85rem', fontFamily }}>
                      TIC No: {companyInfo.ticNo}
                    </Typography>
                  )}
                  {companyInfo.website && (
                    <Typography variant="body2" sx={{ mb: 0.5, color: templateColors.textSecondary, fontWeight: 400, fontSize: '0.85rem', fontFamily }}>
                      Website: <Link href={companyInfo.website} target="_blank" rel="noopener" sx={{ color: templateColors.accent, fontWeight: 500, textDecoration: 'none' }}>{companyInfo.website}</Link>
                    </Typography>
                  )}
                  {companyInfo.email && (
                    <Typography variant="body2" sx={{ color: templateColors.textSecondary, fontWeight: 400, fontSize: '0.85rem', fontFamily }}>
                      Email: <Link href={`mailto:${companyInfo.email}`} sx={{ color: templateColors.accent, fontWeight: 500, textDecoration: 'none' }}>{companyInfo.email}</Link>
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>{/* Body Section */}
            <Box sx={{ p: 4, color: templateColors.text, background: surfaceColor }}>              {/* First Row: Billed From and Billed To */}
              <Grid container spacing={2} sx={{ mb: 3 }}>                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    px: 8, 
                    py: 4,
                    borderRadius: borderRadius,
                    border: `1px solid ${templateColors.subtleBorder}`,
                    minHeight: '120px',
                    minWidth: '100%',
                    width: '100%',
                    '@media print': {
                      border: '1px solid #000000'
                    }
                  }}>
                    <Typography sx={{ 
                      fontWeight: "bold", 
                      mb: 2,
                      color: templateColors.text,
                      fontSize: '0.95rem',
                      fontFamily
                    }}>
                      Billed From:
                    </Typography>
                    <Typography sx={{ color: templateColors.text, fontWeight: 500, mb: 1, fontSize: '0.9rem', fontFamily }}>{props.info.billFrom || ""}</Typography>
                    <Typography sx={{ color: templateColors.textSecondary, fontWeight: 400, mb: 1, fontSize: '0.85rem', fontFamily }}>{props.info.billFromAddress || ""}</Typography>
                    <Typography sx={{ color: templateColors.textSecondary, fontWeight: 400, fontSize: '0.85rem', fontFamily }}>{props.info.billFromEmail || ""}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    px: 8, 
                    py: 4,
                    borderRadius: borderRadius,
                    border: `1px solid ${templateColors.subtleBorder}`,
                    minHeight: '120px',
                    minWidth: '100%',
                    width: '100%',
                    '@media print': {
                      border: '1px solid #000000'
                    }
                  }}>
                    <Typography sx={{ 
                      fontWeight: "bold", 
                      mb: 2,
                      color: templateColors.text,
                      fontSize: '0.95rem',
                      fontFamily
                    }}>
                      Billed To:
                    </Typography>
                    <Typography sx={{ color: templateColors.text, fontWeight: 500, mb: 1, fontSize: '0.9rem', fontFamily }}>{props.info.billTo || ""}</Typography>
                    <Typography sx={{ color: templateColors.textSecondary, fontWeight: 400, mb: 1, fontSize: '0.85rem', fontFamily }}>{props.info.billToAddress || ""}</Typography>
                    <Typography sx={{ color: templateColors.textSecondary, fontWeight: 400, fontSize: '0.85rem', fontFamily }}>{props.info.billToEmail || ""}</Typography>
                  </Box>
                </Grid>
              </Grid>              {/* Second Row: Amount Due */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: borderRadius,
                    border: `1px solid ${templateColors.subtleBorder}`,
                    backgroundColor: surfaceColor,
                    '@media print': {
                      border: '1px solid #000000'
                    }
                  }}>
                    <Typography sx={{ 
                      fontWeight: "bold", 
                      mb: 2,
                      color: templateColors.text,
                      fontSize: '0.95rem',
                      fontFamily
                    }}>
                      Amount Due:
                    </Typography>
                    <Typography
                      sx={{ 
                        fontWeight: "600", 
                        color: templateColors.text,
                        fontSize: '1.25rem',
                        fontFamily
                      }}
                    >
                      {props.currency} {props.total}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>{/* Items Table */}
              <TableContainer
                component={Paper}
                sx={{
                  background: surfaceColor,
                  boxShadow: 'none',
                  border: `1px solid ${templateColors.subtleBorder}`,
                  borderRadius: borderRadius,
                  overflow: 'hidden',
                  '@media print': {
                    border: '1px solid #000000',
                    boxShadow: 'none'
                  }
                }}
              >
                <Table>
                  <TableHead sx={{ background: tableHeaderBackground }}>
                    <TableRow sx={sections.highlightTotals ? { background: totalBackgroundColor } : undefined}>
                      <TableCell sx={{ 
                        width: "70px", 
                        color: tableHeaderTextColor, 
                        fontWeight: "600",
                        fontSize: '0.9rem',
                        py: 2,
                        fontFamily,
                        border: `1px solid ${templateColors.subtleBorder}`,
                        '@media print': {
                          border: '1px solid #000000',
                          backgroundColor: surfaceColor
                        }
                      }}>
                        QTY
                      </TableCell>
                      <TableCell sx={{ 
                        color: tableHeaderTextColor, 
                        fontWeight: "600",
                        fontSize: '0.9rem',
                        py: 2,
                        fontFamily,
                        border: `1px solid ${templateColors.subtleBorder}`,
                        '@media print': {
                          border: '1px solid #000000',
                          backgroundColor: surfaceColor
                        }
                      }}>
                        DESCRIPTION
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        width: "100px", 
                        color: tableHeaderTextColor, 
                        fontWeight: "600",
                        fontSize: '0.9rem',
                        py: 2,
                        fontFamily,
                        border: `1px solid ${templateColors.subtleBorder}`,
                        '@media print': {
                          border: '1px solid #000000',
                          backgroundColor: surfaceColor
                        }
                      }}>
                        UNIT PRICE
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        width: "120px", 
                        color: tableHeaderTextColor, 
                        fontWeight: "600",
                        fontSize: '0.9rem',
                        py: 2,
                        fontFamily,
                        border: `1px solid ${templateColors.subtleBorder}`,
                        '@media print': {
                          border: '1px solid #000000',
                          backgroundColor: surfaceColor
                        }
                      }}>
                        TOTAL
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {props.items.map((item, i) => (
                      <TableRow key={i} sx={{
                        '&:nth-of-type(even)': {
                          background: `${templateColors.accent}10`,
                          '@media print': {
                            background: surfaceColor
                          }
                        }
                      }}>
                        <TableCell sx={{ 
                          width: "70px",
                          fontWeight: 500,
                          color: templateColors.text,
                          py: 2,
                          fontSize: '0.9rem',
                          fontFamily,
                          border: `1px solid ${templateColors.subtleBorder}`,
                          '@media print': {
                            border: '1px solid #000000'
                          }
                        }}>
                          {item.itemQuantity}
                        </TableCell>
                        <TableCell sx={{
                          color: templateColors.text,
                          fontWeight: 400,
                          py: 2,
                          fontSize: '0.9rem',
                          fontFamily,
                          border: `1px solid ${templateColors.subtleBorder}`,
                          '@media print': {
                            border: '1px solid #000000'
                          }
                        }}>
                          {item.itemName}
                          {item.itemDescription && item.itemDescription.trim().length > 0 ? ` - ${item.itemDescription}` : null}
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          width: "100px",
                          fontWeight: 500,
                          color: templateColors.text,
                          py: 2,
                          fontSize: '0.9rem',
                          fontFamily,
                          border: `1px solid ${templateColors.subtleBorder}`,
                          '@media print': {
                            border: '1px solid #000000'
                          }
                        }}>
                          {props.currency} {item.itemPrice}
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          width: "120px",
                          fontWeight: 600,
                          color: templateColors.text,
                          py: 2,
                          fontSize: '0.9rem',
                          fontFamily,
                          border: `1px solid ${templateColors.subtleBorder}`,
                          '@media print': {
                            border: '1px solid #000000'
                          }
                        }}>
                          {props.currency} {item.itemPrice * item.itemQuantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>              {/* Summary Table */}
              <TableContainer
                component={Paper}
                sx={{
                  mt: 3,
                  background: surfaceColor,
                  boxShadow: 'none',
                  border: `1px solid ${templateColors.subtleBorder}`,
                  borderRadius: borderRadius,
                  overflow: 'hidden',
                  '@media print': {
                    border: '1px solid #000000'
                  }
                }}
              >
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ borderBottom: 'none' }}>&nbsp;</TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>&nbsp;</TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}>&nbsp;</TableCell>
                    </TableRow>
                    {parseFloat(props.info.taxRate) > 0 && (
                      <TableRow>
                        <TableCell />
                        <TableCell
                          align="right"
                          sx={{ 
                            fontWeight: "600", 
                            width: "100px",
                            color: templateColors.text,
                            fontSize: '0.9rem',
                            fontFamily
                          }}
                        >
                          TAX
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          width: "120px",
                          fontWeight: 500,
                          color: templateColors.text,
                          fontSize: '0.9rem',
                          fontFamily
                        }}>
                          <span style={{ fontSize: "0.8rem", marginRight: '4px', color: templateColors.textSecondary }}>
                            ({props.info.taxRate || 0}%)
                          </span>
                          {props.currency} {props.taxAmount}
                        </TableCell>
                      </TableRow>
                    )}
                    {props.discountAmount !== 0.0 && (
                      <TableRow>
                        <TableCell sx={{ borderBottom: 'none' }} />
                        <TableCell
                          align="right"
                          sx={{ 
                            fontWeight: "600", 
                            width: "100px", 
                            borderBottom: 'none',
                            color: templateColors.text,
                            fontSize: '0.9rem',
                            fontFamily
                          }}
                        >
                          DISCOUNT
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          width: "120px", 
                          borderBottom: 'none',
                          fontWeight: 500,
                          color: '#dc2626',
                          fontSize: '0.9rem',
                          fontFamily
                        }}>
                          <span style={{ fontSize: "0.8rem", marginRight: '4px', color: templateColors.textSecondary }}>
                            ({props.info.discountRate || 0}%)
                          </span>
                          {props.currency} {props.discountAmount}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell sx={{ borderBottom: 'none' }} />
                      <TableCell
                        align="right"
                        sx={{ 
                          fontWeight: "700", 
                          width: "100px", 
                          borderBottom: 'none',
                          color: templateColors.text,
                          fontSize: '1rem',
                          fontFamily
                        }}
                      >
                        TOTAL
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          width: "120px",
                          color: templateColors.text,
                          fontWeight: "700",
                          borderBottom: 'none',
                          fontSize: '1.1rem',
                          fontFamily
                        }}
                      >
                        {props.currency} {props.total}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>              {/* Notes Section */}
              {sections.showNotes && props.info.notes && props.info.notes.trim().length > 0 && (
                <Box
                  sx={{
                    background: surfaceColor,
                    border: `1px solid ${templateColors.subtleBorder}`,
                    py: 3,
                    px: 4,
                    borderRadius: borderRadius, 
                    mt: 3,
                    '@media print': {
                      border: '1px solid #000000'
                    }
                  }}
                >
                  <Typography sx={{ 
                    fontWeight: '600',
                    color: templateColors.text,
                    mb: 2,
                    fontSize: '0.95rem',
                    fontFamily
                  }}>
                    Notes:
                  </Typography>
                  <Typography sx={{ 
                    color: templateColors.text,
                    lineHeight: 1.6,
                    fontWeight: 400,
                    fontSize: '0.9rem',
                    fontFamily
                  }}>
                    {props.info.notes}
                  </Typography>
                </Box>
              )}
              {/* Banking Information */}
              {sections.showBankDetails && (
              <Box
                sx={{
                  mt: 4,
                  pt: 4,
                  borderTop: `1px solid ${templateColors.subtleBorder}`,
                  background: surfaceColor,
                  border: `1px solid ${templateColors.subtleBorder}`,
                  borderRadius: borderRadius,
                  p: 4,
                  '@media print': {
                    border: '1px solid #000000',
                    borderTop: '1px solid #000000'
                  }
                }}
              >
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: "600", 
                  mb: 3,
                  color: templateColors.text,
                  fontSize: '1rem',
                  fontFamily
                }}>
                  Please send your payment to one of the bank accounts listed below:
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: "600", 
                      minWidth: "120px",
                      color: templateColors.text,
                      fontSize: '0.9rem',
                      fontFamily
                    }}>
                      Bank Name:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: templateColors.text, 
                      fontWeight: 400,
                      fontSize: '0.9rem',
                      fontFamily
                    }}>
                      {bankInfo.bankName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: "600", 
                      minWidth: "120px",
                      color: templateColors.text,
                      fontSize: '0.9rem',
                      fontFamily
                    }}>
                      Account Name:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: templateColors.text, 
                      fontWeight: 400,
                      fontSize: '0.9rem',
                      fontFamily
                    }}>
                      {bankInfo.accountName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: "600", 
                      minWidth: "120px",
                      color: templateColors.text,
                      fontSize: '0.9rem',
                      fontFamily
                    }}>
                      Account No:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: templateColors.text, 
                      fontWeight: 400,
                      fontSize: '0.9rem',
                      fontFamily
                    }}>
                      {bankInfo.accountNo}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: "600", 
                      minWidth: "120px",
                      color: templateColors.text,
                      fontSize: '0.9rem',
                      fontFamily
                    }}>
                      Swift:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: templateColors.text, 
                      fontWeight: 400,
                      fontSize: '0.9rem',
                      fontFamily
                    }}>
                      {bankInfo.swift}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: "600", 
                      minWidth: "120px",
                      color: templateColors.text,
                      fontSize: '0.9rem',
                      fontFamily
                    }}>
                      IBAN No:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      wordBreak: "break-word",
                      color: templateColors.text, 
                      fontWeight: 400,
                      fontSize: '0.9rem',
                      fontFamily
                    }}>
                      {bankInfo.iban}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              )}
            </Box>
          </Box>          {/* Action Buttons */}
          <Box sx={{ 
            pb: 4, 
            px: 4,
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
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    borderRadius: borderRadius,
                    py: 1.5,
                    border: 'none',
                    fontFamily,
                    boxShadow: `0 4px 15px ${templateColors.accent}55`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${templateColors.accent} 0%, ${templateColors.primary} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${templateColors.accent}66`
                    }
                  }}
                  onClick={() => GenerateInvoice(props.info.invoiceNumber)}
                >
                  <BiCloudDownload
                    style={{
                      width: "18px",
                      height: "18px",
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
