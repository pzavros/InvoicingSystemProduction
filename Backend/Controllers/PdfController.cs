using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Services;
using InvoicingBackend.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace InvoicingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PdfController : ControllerBase
    {
        private readonly IPdfGenerationService _pdfService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PdfController> _logger;
        private readonly IInvoiceTemplateService _templateService;

        public PdfController(
            IPdfGenerationService pdfService,
            ApplicationDbContext context,
            ILogger<PdfController> logger,
            IInvoiceTemplateService templateService)
        {
            _pdfService = pdfService;
            _context = context;
            _logger = logger;
            _templateService = templateService;
        }

        [HttpPost("generate-invoice/{invoiceId}")]
        public async Task<IActionResult> GenerateInvoicePdf(int invoiceId)
        {
            try
            {
                _logger.LogInformation("PDF generation requested for invoice {InvoiceId}", invoiceId);
                
                // Get user ID using the same pattern as other controllers
                var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    _logger.LogWarning("Unable to retrieve user ID from claims for invoice {InvoiceId}", invoiceId);
                    return Unauthorized(new { message = "User authentication failed" });
                }
                
                _logger.LogInformation("User ID: {UserId}", userId);
                
                // Fetch invoice with all related data
                var invoice = await _context.Invoices
                    .Include(i => i.Items)
                    .Include(i => i.Currency)
                    .Include(i => i.DocumentType)
                    .Include(i => i.Template)
                    .Include(i => i.User)  // Include user for company details
                    .FirstOrDefaultAsync(i => i.Id == invoiceId && i.UserId == userId);

                if (invoice == null)
                {
                    _logger.LogWarning("Invoice {InvoiceId} not found for user {UserId}", invoiceId, userId);
                    return NotFound(new { message = "Invoice not found" });
                }

                _logger.LogInformation("Invoice found: {InvoiceNumber} with {ItemCount} items", 
                    invoice.InvoiceNumber, invoice.Items?.Count ?? 0);
                _logger.LogInformation("Document Type: {DocumentType}, Display Name: {DisplayName}", 
                    invoice.DocumentType?.Name ?? "NULL", invoice.DocumentType?.DisplayName ?? "NULL");

                // Fetch SystemSetup for company details, logo, and bank info
                var systemSetup = await _context.SystemSetups
                    .FirstOrDefaultAsync(s => s.UserId == userId);

                // Fetch the current active template for this document type
                var activeTemplate = await _templateService.GetActiveTemplateByDocumentTypeAsync(userId, invoice.DocumentType?.Id);
                if (activeTemplate != null)
                {
                    _logger.LogInformation("Using active template: {TemplateName} for document type: {DocumentType}", 
                        activeTemplate.Name, invoice.DocumentType?.DisplayName ?? "Unknown");
                    
                    // Create a template entity with the active template data
                    invoice.Template = new Models.InvoiceTemplate
                    {
                        Id = activeTemplate.Id,
                        Name = activeTemplate.Name,
                        TemplateData = activeTemplate.TemplateData
                    };
                }

                // Generate HTML content from invoice data
                var htmlContent = GenerateInvoiceHtml(invoice, systemSetup);
                _logger.LogInformation("HTML content generated, length: {Length}", htmlContent.Length);

                // Generate PDF
                _logger.LogInformation("Starting PDF generation...");
                var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(htmlContent);
                _logger.LogInformation("PDF generated successfully, size: {Size} bytes", pdfBytes.Length);

                // Return PDF as file
                var fileName = $"Invoice_{invoice.InvoiceNumber}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF for invoice {InvoiceId}: {ErrorMessage}", invoiceId, ex.Message);
                return StatusCode(500, new { message = "Failed to generate PDF", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpPost("preview-invoice")]
        public async Task<IActionResult> PreviewInvoicePdf([FromBody] InvoicePreviewRequest request)
        {
            try
            {
                _logger.LogInformation("PDF preview requested for invoice {InvoiceNumber}", request?.InvoiceNumber ?? "unknown");
                
                // Validate request
                if (request == null)
                {
                    _logger.LogWarning("Preview request is null");
                    return BadRequest(new { message = "Invalid request data" });
                }
                
                // Validate required fields
                if (string.IsNullOrEmpty(request.InvoiceNumber))
                {
                    _logger.LogWarning("Invoice number is missing in preview request");
                    return BadRequest(new { message = "Invoice number is required" });
                }
                
                if (request.Items == null || !request.Items.Any())
                {
                    _logger.LogWarning("No items provided in preview request");
                    return BadRequest(new { message = "At least one item is required" });
                }
                
                // Get user ID
                var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    _logger.LogWarning("User authentication failed for preview request");
                    return Unauthorized(new { message = "User authentication failed" });
                }
                
                _logger.LogInformation("User {UserId} requesting preview for invoice {InvoiceNumber} with {ItemCount} items", 
                    userId, request.InvoiceNumber, request.Items?.Count ?? 0);
                
                // Fetch SystemSetup for company details, logo, and bank info
                var systemSetup = await _context.SystemSetups
                    .FirstOrDefaultAsync(s => s.UserId == userId);

                // Fetch the actual DocumentType from database
                var documentType = await _context.DocumentTypes
                    .FirstOrDefaultAsync(dt => dt.Id == request.DocumentTypeId);
                
                if (documentType == null)
                {
                    _logger.LogWarning("Document type {DocumentTypeId} not found, using default", request.DocumentTypeId);
                }

                // Create invoice object from request data
                var invoice = new Models.Invoice
                {
                    InvoiceNumber = request.InvoiceNumber,
                    DateOfIssue = request.DateOfIssue,
                    DueDate = request.DueDate,
                    BillTo = request.BillTo,
                    BillToEmail = request.BillToEmail,
                    BillToAddress = request.BillToAddress,
                    BillFrom = request.BillFrom,
                    BillFromEmail = request.BillFromEmail,
                    BillFromAddress = request.BillFromAddress,
                    Notes = request.Notes,
                    DiscountAmount = request.DiscountAmount,
                    Currency = new Models.Currency { Symbol = request.CurrencySymbol },
                    DocumentType = documentType ?? new Models.DocumentType { DisplayName = request.DocumentTypeName ?? "INVOICE" },
                    Items = (request.Items ?? new List<InvoiceItemPreview>()).Select(item => new Models.InvoiceItem
                    {
                        Title = item.Title,
                        Description = item.Description,
                        Quantity = (int)item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TaxRate = item.TaxRate
                    }).ToList()
                };

                // Fetch the current active template for this document type
                var activeTemplate = await _templateService.GetActiveTemplateByDocumentTypeAsync(userId, request.DocumentTypeId);
                if (activeTemplate != null)
                {
                    _logger.LogInformation("Using active template: {TemplateName} for preview", activeTemplate.Name);
                    
                    // Create a template entity with the active template data
                    invoice.Template = new Models.InvoiceTemplate
                    {
                        Id = activeTemplate.Id,
                        Name = activeTemplate.Name,
                        TemplateData = activeTemplate.TemplateData
                    };
                }

                // Generate HTML content from invoice data
                var htmlContent = GenerateInvoiceHtml(invoice, systemSetup);
                
                // Generate PDF
                var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(htmlContent);
                
                // Return PDF as file
                var fileName = $"Invoice_{request.InvoiceNumber}_Preview.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating preview PDF: {ErrorMessage}", ex.Message);
                return StatusCode(500, new { message = "Failed to generate preview PDF", error = ex.Message });
            }
        }

        private string GenerateInvoiceHtml(Models.Invoice invoice, Models.SystemSetup? systemSetup)
        {
            var currencySymbol = invoice.Currency?.Symbol ?? "€";
            
            // Convert logo to base64 if available
            var logoBase64 = systemSetup?.Logo != null 
                ? $"data:image/png;base64,{Convert.ToBase64String(systemSetup.Logo)}"
                : null;
            
            // Calculate totals treating prices as GROSS (including VAT)
            decimal totalGross = 0;
            decimal totalNet = 0;
            var vatBreakdown = new Dictionary<decimal, decimal>();

            foreach (var item in invoice.Items ?? new List<Models.InvoiceItem>())
            {
                var grossPrice = item.UnitPrice;
                var itemQuantity = item.Quantity;
                var itemTaxRate = item.TaxRate ?? 0m; // Handle nullable decimal

                // Line total (gross) - price already includes VAT
                var lineGross = grossPrice * itemQuantity;
                totalGross += lineGross;

                // Extract VAT amount from gross price
                var itemVatAmount = itemTaxRate > 0 
                    ? lineGross * (itemTaxRate / (100 + itemTaxRate))
                    : 0;

                // Net amount = Gross - VAT
                var lineNet = lineGross - itemVatAmount;
                totalNet += lineNet;

                // Group VAT by rate
                if (itemTaxRate > 0)
                {
                    if (!vatBreakdown.ContainsKey(itemTaxRate))
                    {
                        vatBreakdown[itemTaxRate] = 0;
                    }
                    vatBreakdown[itemTaxRate] += itemVatAmount;
                }
            }

            var discountAmount = invoice.DiscountAmount;
            var totalTaxAmount = vatBreakdown.Values.Sum();
            var finalTotal = totalGross - discountAmount;
            var subtotal = totalNet;

            // Get template configuration if available
            var templateConfig = invoice.Template?.TemplateData != null 
                ? System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(invoice.Template.TemplateData)
                : (System.Text.Json.JsonElement?)null;
            
            var primaryColor = "#2563eb";
            var borderRadius = "12px";
            var fontFamily = "'Inter', 'Arial', 'Helvetica', sans-serif";
            var showLogo = true;
            var logoStyle = "square"; // square or circle
            var logoSize = 80; // medium
            var tableBorder = true;
            var tableStyle = "rounded";
            var alternateRowColors = true;
            var showBankInfo = true;
            var bankInfoBackground = true;
            var showCompanyInfo = true;
            var showClientDetails = true;
            var showDates = true;
            var showNotes = true;
            var showAmountDueBox = true;
            var showInvoiceHeader = true;
            var showItemsTable = true;
            var showTotals = true;
            var showDisclaimer = false;
            var disclaimer = "";
            
            // Parse template configuration
            if (templateConfig.HasValue)
            {
                var config = templateConfig.Value;
                
                // Extract primary color
                if (config.TryGetProperty("primaryColor", out var primaryColorProp))
                    primaryColor = primaryColorProp.GetString() ?? primaryColor;
                else if (config.TryGetProperty("colors", out var colorsProp) && colorsProp.TryGetProperty("primary", out var primaryProp))
                    primaryColor = primaryProp.GetString() ?? primaryColor;
                
                // Extract border radius
                if (config.TryGetProperty("layout", out var layoutProp) && layoutProp.TryGetProperty("borderRadius", out var borderRadiusProp))
                    borderRadius = borderRadiusProp.GetString() ?? borderRadius;
                else if (config.TryGetProperty("borderRadius", out var borderRadiusProp2))
                    borderRadius = borderRadiusProp2.GetString() ?? borderRadius;
                
                // Extract font family
                if (config.TryGetProperty("fontStyle", out var fontStyleProp))
                {
                    var fontStyle = fontStyleProp.GetString()?.ToLower();
                    fontFamily = fontStyle switch
                    {
                        "classic" => "'Times New Roman', Times, serif",
                        "elegant" => "'Georgia', serif",
                        "minimal" => "'Arial', sans-serif",
                        "modern" => "'Inter', 'Helvetica', sans-serif",
                        _ => fontFamily
                    };
                }
                else if (config.TryGetProperty("typography", out var typographyProp) && typographyProp.TryGetProperty("fontFamily", out var fontFamilyProp))
                {
                    fontFamily = fontFamilyProp.GetString() ?? fontFamily;
                }
                else if (config.TryGetProperty("fontFamily", out var fontFamilyProp2))
                {
                    fontFamily = fontFamilyProp2.GetString() ?? fontFamily;
                }
                
                // Extract logo settings
                if (config.TryGetProperty("logoSettings", out var logoSettingsProp))
                {
                    if (logoSettingsProp.TryGetProperty("showLogo", out var showLogoProp))
                        showLogo = showLogoProp.GetBoolean();
                    if (logoSettingsProp.TryGetProperty("style", out var logoStyleProp))
                        logoStyle = logoStyleProp.GetString() ?? logoStyle;
                    if (logoSettingsProp.TryGetProperty("size", out var logoSizeProp))
                    {
                        var sizeStr = logoSizeProp.GetString();
                        logoSize = sizeStr == "large" ? 120 : sizeStr == "small" ? 60 : 80;
                    }
                }
                
                // Extract sections configuration
                if (config.TryGetProperty("sections", out var sectionsProp))
                {
                    if (sectionsProp.TryGetProperty("showCompanyLogo", out var showCompanyLogoProp))
                        showLogo = showCompanyLogoProp.GetBoolean();
                    else if (sectionsProp.TryGetProperty("showLogo", out var showLogoProp2))
                        showLogo = showLogoProp2.GetBoolean();
                    
                    if (sectionsProp.TryGetProperty("showInvoiceHeader", out var showInvoiceHeaderProp))
                        showInvoiceHeader = showInvoiceHeaderProp.GetBoolean();
                    
                    if (sectionsProp.TryGetProperty("showCompanyInfo", out var showCompanyInfoProp))
                        showCompanyInfo = showCompanyInfoProp.GetBoolean();
                    else if (sectionsProp.TryGetProperty("showCompanyDetails", out var showCompanyDetailsProp))
                        showCompanyInfo = showCompanyDetailsProp.GetBoolean();
                    
                    if (sectionsProp.TryGetProperty("showClientDetails", out var showClientDetailsProp))
                        showClientDetails = showClientDetailsProp.GetBoolean();
                    
                    if (sectionsProp.TryGetProperty("showDates", out var showDatesProp))
                        showDates = showDatesProp.GetBoolean();
                    
                    if (sectionsProp.TryGetProperty("showItemsTable", out var showItemsTableProp))
                        showItemsTable = showItemsTableProp.GetBoolean();
                    
                    if (sectionsProp.TryGetProperty("showTotals", out var showTotalsProp))
                        showTotals = showTotalsProp.GetBoolean();
                    
                    if (sectionsProp.TryGetProperty("showNotes", out var showNotesProp))
                        showNotes = showNotesProp.GetBoolean();
                    
                    if (sectionsProp.TryGetProperty("showAmountDueBox", out var showAmountDueBoxProp))
                        showAmountDueBox = showAmountDueBoxProp.GetBoolean();
                    
                    if (sectionsProp.TryGetProperty("tableBorder", out var tableBorderProp))
                        tableBorder = tableBorderProp.GetBoolean();
                    if (sectionsProp.TryGetProperty("tableStyle", out var tableStyleProp))
                        tableStyle = tableStyleProp.GetString() ?? tableStyle;
                    if (sectionsProp.TryGetProperty("alternateRowColors", out var alternateRowColorsProp))
                        alternateRowColors = alternateRowColorsProp.GetBoolean();
                    if (sectionsProp.TryGetProperty("showBankInfo", out var showBankInfoProp))
                        showBankInfo = showBankInfoProp.GetBoolean();
                    else if (sectionsProp.TryGetProperty("showBankDetails", out var showBankDetailsProp))
                        showBankInfo = showBankDetailsProp.GetBoolean();
                    if (sectionsProp.TryGetProperty("bankInfoBackground", out var bankInfoBackgroundProp))
                        bankInfoBackground = bankInfoBackgroundProp.GetBoolean();
                }
                
                // Extract disclaimer text
                if (config.TryGetProperty("disclaimer", out var disclaimerProp))
                {
                    var disclaimerText = disclaimerProp.GetString();
                    _logger.LogInformation("Found disclaimer in template config: {Disclaimer}", disclaimerText ?? "NULL");
                    if (!string.IsNullOrWhiteSpace(disclaimerText))
                    {
                        showDisclaimer = true;
                        disclaimer = disclaimerText;
                    }
                }
            }
            else
            {
                _logger.LogInformation("No template configuration found");
            }
            
            // Show default disclaimer for quotations and proformas based on DocumentType
            if (!showDisclaimer && invoice.DocumentType != null)
            {
                if (invoice.DocumentType.IsQuotation)
                {
                    showDisclaimer = true;
                    disclaimer = "This quotation is valid for 30 days from the date of issue. Prices and availability are subject to change. This is not an invoice and does not constitute a binding agreement until accepted and confirmed by both parties.";
                    _logger.LogInformation("Set default disclaimer for Quotation document type");
                }
                else if (invoice.DocumentType.IsProforma)
                {
                    showDisclaimer = true;
                    disclaimer = "This is a Proforma Invoice and is provided for informational purposes only. It is not a tax invoice and should not be used for accounting or tax purposes. A final invoice will be issued upon completion of the transaction.";
                    _logger.LogInformation("Set default disclaimer for Proforma document type");
                }
            }
            
            
            // Apply logo settings
            var logoContainerStyle = logoStyle == "circle" ? "50%" : borderRadius;
            var shouldShowLogo = showLogo && logoBase64 != null;
            var tableBorderStyle = tableBorder ? "1px solid #e5e7eb" : "none";
            var tableRadiusStyle = tableStyle == "rounded" ? borderRadius : "0";
            var alternateRowStyle = alternateRowColors ? "rgba(0, 0, 0, 0.04)" : "transparent";
            var bankBackgroundStyle = bankInfoBackground ? "#f9f9f9" : "transparent";
            var bankBorderStyle = bankInfoBackground ? "none" : "1px solid #e0e0e0";

            // Build VAT breakdown HTML
            var vatBreakdownHtml = "";
            foreach (var vat in vatBreakdown.OrderByDescending(x => x.Key))
            {
                vatBreakdownHtml += $@"
                <div style=""display: flex; justify-content: space-between; margin-bottom: 6px;"">
                    <span style=""color: #6b7280; font-size: 0.75rem;"">VAT ({vat.Key:F0}%):</span>
                    <span style=""color: #1f2937; font-size: 0.75rem; font-weight: 500;"">{currencySymbol}{vat.Value:N2}</span>
                </div>";
            }

            if (vatBreakdown.Count == 0)
            {
                vatBreakdownHtml = $@"
                <div style=""display: flex; justify-content: space-between; margin-bottom: 6px;"">
                    <span style=""color: #6b7280; font-size: 0.75rem;"">VAT (0%):</span>
                    <span style=""color: #1f2937; font-size: 0.75rem; font-weight: 500;"">{currencySymbol}0.00</span>
                </div>";
            }

            // Build items table rows
            var itemsHtml = "";
            foreach (var item in invoice.Items ?? new List<Models.InvoiceItem>())
            {
                var amount = item.UnitPrice * item.Quantity;
                var itemVatRate = item.TaxRate ?? 0m;
                
                itemsHtml += $@"
                <tr style=""border-bottom: 1px solid #e5e7eb;"">
                    <td style=""padding: 10px; text-align: left;"">
                        <div style=""font-weight: 500; color: #1f2937; margin-bottom: 2px; font-size: 0.75rem;"">{System.Net.WebUtility.HtmlEncode(item.Title)}</div>
                        {(!string.IsNullOrEmpty(item.Description) ? $"<div style=\"font-size: 0.65rem; color: #6b7280;\">{System.Net.WebUtility.HtmlEncode(item.Description)}</div>" : "")}
                    </td>
                    <td style=""padding: 10px; text-align: center; color: #1f2937; font-size: 0.75rem;"">{item.Quantity}</td>
                    <td style=""padding: 10px; text-align: center; color: #1f2937; font-size: 0.75rem;"">{currencySymbol}{item.UnitPrice:N2}</td>
                    <td style=""padding: 10px; text-align: center; color: #1f2937; font-size: 0.75rem;"">{itemVatRate:F0}%</td>
                    <td style=""padding: 10px; text-align: center; color: #1f2937; font-weight: 500; font-size: 0.75rem;"">{currencySymbol}{amount:N2}</td>
                </tr>";
            }

            var discountHtml = discountAmount > 0 ? $@"
                <div style=""display: flex; justify-content: space-between; margin-bottom: 6px;"">
                    <span style=""color: #6b7280; font-size: 0.75rem;"">Discount:</span>
                    <span style=""color: #dc2626; font-size: 0.75rem; font-weight: 500;"">-{currencySymbol}{discountAmount:N2}</span>
                </div>" : "";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        html, body {{
            width: 100%;
            height: 100%;
        }}
        
        @page {{
            size: A4;
            margin: 0.4in;
        }}
        
        body {{
            font-family: {fontFamily};
            font-size: 0.75rem;
            line-height: 1.4;
            color: #1f2937;
            background: white;
        }}
        
        /* Prevent page breaks inside important elements */
        .invoice-header,
        .details-grid,
        .amount-due-box,
        .notes-section,
        .bank-details-section,
        .totals-container {{
            page-break-inside: avoid;
            break-inside: avoid;
        }}
        
        /* Explicitly allow table to span pages */
        table {{
            border-collapse: collapse;
            width: 100%;
        }}
        
        thead {{
            display: table-header-group;
        }}
        
        tfoot {{
            display: table-footer-group;
        }}
        
        tbody {{
            display: table-row-group;
        }}
        
        tr {{
            page-break-inside: avoid;
        }}
        
        .invoice-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }}
        .invoice-title {{
            font-size: 2.5rem;
            font-weight: 700;
            color: {primaryColor};
            margin-bottom: 8px;
        }}
        .invoice-number {{
            font-size: 1rem;
            color: #6b7280;
            margin-top: 8px;
        }}
        .company-info-section {{
            text-align: right;
        }}
        .logo-container {{
            width: {logoSize}px;
            height: {logoSize}px;
            margin: 0 0 16px auto;
            border-radius: {logoContainerStyle};
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        .logo-container img {{
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }}
        .company-details {{
            text-align: right;
            font-size: 0.75rem;
            color: #6b7280;
            line-height: 1.4;
        }}
        .section-title {{
            font-size: 0.75rem;
            font-weight: 700;
            color: {primaryColor};
            margin-bottom: 4px;
        }}
        .details-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 16px;
        }}
        .detail-section div {{
            margin-bottom: 2px;
            color: #1f2937;
            font-size: 0.75rem;
            line-height: 1.3;
        }}
        .detail-section .email {{
            color: #6b7280;
        }}
        table {{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 16px 0 16px 0;
            border: {tableBorderStyle};
            border-radius: {tableRadiusStyle};
            overflow: hidden;
        }}
        thead {{
            background-color: {primaryColor};
        }}
        thead th {{
            color: white;
            text-align: left;
            padding: 12px;
            font-weight: 600;
            font-size: 0.8rem;
            border-bottom: none;
        }}
        thead th:first-child {{
            border-top-left-radius: {tableRadiusStyle};
        }}
        thead th:last-child {{
            border-top-right-radius: {tableRadiusStyle};
        }}
        thead th.center {{
            text-align: center;
        }}
        tbody tr {{
            border-bottom: 1px solid #e5e7eb;
        }}
        tbody tr:last-child {{
            border-bottom: none;
        }}
        tbody tr:last-child td:first-child {{
            border-bottom-left-radius: {tableRadiusStyle};
        }}
        tbody tr:last-child td:last-child {{
            border-bottom-right-radius: {tableRadiusStyle};
        }}
        tbody tr:nth-child(odd) {{
            background-color: {alternateRowStyle};
        }}
        tbody td {{
            padding: 10px;
            color: #1f2937;
            font-size: 0.75rem;
        }}
        tbody td.center {{
            text-align: center;
        }}
        .item-title {{
            font-weight: 500;
            margin-bottom: 2px;
        }}
        .item-description {{
            font-size: 0.65rem;
            color: #6b7280;
        }}
        .totals-container {{
            display: flex;
            justify-content: flex-end;
            margin: 16px 0;
        }}
        .totals-box {{
            min-width: 250px;
        }}
        .total-row {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 0.75rem;
        }}
        .total-row .label {{
            color: #6b7280;
        }}
        .total-row .value {{
            color: #1f2937;
            font-weight: 500;
        }}
        .total-row.discount .value {{
            color: #dc2626;
        }}
        .total-divider {{
            border-top: 1px solid #e5e7eb;
            margin: 6px 0;
        }}
        .total-final {{
            display: flex;
            justify-content: space-between;
            font-size: 1.25rem;
            font-weight: 700;
            margin-top: 6px;
        }}
        .total-final .label {{
            color: #1f2937;
        }}
        .total-final .value {{
            color: {primaryColor};
        }}
        .amount-due-box {{
            max-width: 250px;
            padding: 16px;
            border-radius: {borderRadius};
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
            margin-bottom: 16px;
        }}
        .amount-due-title {{
            font-size: 0.75rem;
            font-weight: 600;
            color: {primaryColor};
            margin-bottom: 6px;
        }}
        .amount-due-value {{
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }}
        .amount-due-note {{
            font-size: 0.65rem;
            color: #6b7280;
        }}
        .notes-section {{
            margin-bottom: 16px;
        }}
        .notes-title {{
            font-size: 0.75rem;
            font-weight: 600;
            color: {primaryColor};
            margin-bottom: 6px;
        }}
        .notes-content {{
            font-size: 0.75rem;
            color: #6b7280;
            line-height: 1.4;
        }}
        .bank-details-section {{
            background-color: {bankBackgroundStyle};
            padding: 16px;
            border-radius: {borderRadius};
            border: {bankBorderStyle};
            margin-top: 12px;
        }}
        .bank-details-title {{
            font-size: 0.75rem;
            font-weight: 600;
            color: {primaryColor};
            margin-bottom: 8px;
        }}
        .bank-details-content {{
            font-size: 0.75rem;
            color: #1f2937;
            line-height: 1.5;
        }}
        .disclaimer-section {{
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            padding: 16px;
            border-radius: {borderRadius};
            margin-top: 24px;
            margin-bottom: 16px;
        }}
        .disclaimer-title {{
            font-size: 0.75rem;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
        }}
        .disclaimer-content {{
            font-size: 0.75rem;
            color: #78350f;
            line-height: 1.6;
        }}
    </style>
</head>
<body>
    <!-- Invoice Header -->
    {(showInvoiceHeader ? $@"
    <div class=""invoice-header"">
        <div>
            <div class=""invoice-title"">{invoice.DocumentType?.DisplayName ?? "INVOICE"}</div>
            <div class=""invoice-number"">#{invoice.InvoiceNumber}</div>
        </div>
        <div class=""company-info-section"">
            {(shouldShowLogo ? $@"
            <div class=""logo-container"">
                <img src=""{logoBase64}"" alt=""Company Logo"" />
            </div>" : "")}
            {(showCompanyInfo && (systemSetup != null && (!string.IsNullOrEmpty(systemSetup.CompanyNo) || !string.IsNullOrEmpty(systemSetup.VatNo) || !string.IsNullOrEmpty(systemSetup.TicNo) || !string.IsNullOrEmpty(systemSetup.Website))) ? $@"
            <div class=""company-details"">
                {(!string.IsNullOrEmpty(systemSetup?.CompanyNo) ? $"<div>Company No: {systemSetup.CompanyNo}</div>" : "")}
                {(!string.IsNullOrEmpty(systemSetup?.VatNo) ? $"<div>VAT No: {systemSetup.VatNo}</div>" : "")}
                {(!string.IsNullOrEmpty(systemSetup?.TicNo) ? $"<div>TIC No: {systemSetup.TicNo}</div>" : "")}
                {(!string.IsNullOrEmpty(systemSetup?.Website) ? $"<div>{systemSetup.Website}</div>" : "")}
            </div>" : "")}
        </div>
    </div>" : "")}

    <!-- From/To Details -->
    {(showClientDetails ? $@"
    <div class=""details-grid"">
        <div class=""detail-section"">
            <div class=""section-title"">From:</div>
            <div><strong>{System.Net.WebUtility.HtmlEncode(invoice.BillFrom)}</strong></div>
            <div class=""email"">{System.Net.WebUtility.HtmlEncode(invoice.BillFromEmail)}</div>
            {(!string.IsNullOrEmpty(invoice.BillFromAddress) ? $"<div class=\"email\">{System.Net.WebUtility.HtmlEncode(invoice.BillFromAddress)}</div>" : "")}
        </div>
        <div class=""detail-section"">
            <div class=""section-title"">To:</div>
            <div><strong>{System.Net.WebUtility.HtmlEncode(invoice.BillTo)}</strong></div>
            <div class=""email"">{System.Net.WebUtility.HtmlEncode(invoice.BillToEmail)}</div>
            {(!string.IsNullOrEmpty(invoice.BillToAddress) ? $"<div class=\"email\">{System.Net.WebUtility.HtmlEncode(invoice.BillToAddress)}</div>" : "")}
        </div>
    </div>" : "")}

    <!-- Dates -->
    {(showDates ? $@"
    <div class=""details-grid"">
        <div>
            <span style=""color: #6b7280; font-size: 0.75rem;""><strong>Date Issued:</strong> {invoice.DateOfIssue:dd/MM/yyyy}</span>
        </div>
        <div>
            <span style=""color: #6b7280; font-size: 0.75rem;""><strong>Due Date:</strong> {invoice.DueDate:dd/MM/yyyy}</span>
        </div>
    </div>" : "")}

    <!-- Items Table -->
    {(showItemsTable ? $@"
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th class=""center"">Qty</th>
                <th class=""center"">Rate</th>
                <th class=""center"">VAT %</th>
                <th class=""center"">Amount</th>
            </tr>
        </thead>
        <tbody>
            {itemsHtml}
        </tbody>
    </table>" : "")}

    <!-- Totals -->
    {(showTotals ? $@"
    <div class=""totals-container"">
        <div class=""totals-box"">
            <div class=""total-row"">
                <span class=""label"">Subtotal:</span>
                <span class=""value"">{currencySymbol}{subtotal:N2}</span>
            </div>
            {discountHtml}
            {vatBreakdownHtml}
            <div class=""total-divider""></div>
            <div class=""total-final"">
                <span class=""label"">Total:</span>
                <span class=""value"">{currencySymbol}{finalTotal:N2}</span>
            </div>
        </div>
    </div>" : "")}

    <!-- Amount Due Box -->
    {(showAmountDueBox ? $@"
    <div class=""amount-due-box"">
        <div class=""amount-due-title"">Amount Due</div>
        <div class=""amount-due-value"">{currencySymbol}{finalTotal:N2}</div>
        <div class=""amount-due-note"">Due upon receipt</div>
    </div>" : "")}

    <!-- Notes -->
    {(showNotes && !string.IsNullOrEmpty(invoice.Notes) ? $@"
    <div class=""notes-section"">
        <div class=""notes-title"">Notes:</div>
        <div class=""notes-content"">{System.Net.WebUtility.HtmlEncode(invoice.Notes)}</div>
    </div>" : "")}

    <!-- Disclaimer -->
    {(showDisclaimer ? $@"
    <div class=""disclaimer-section"">
        <div class=""disclaimer-title"">⚠️ Disclaimer:</div>
        <div class=""disclaimer-content"">{System.Net.WebUtility.HtmlEncode(disclaimer)}</div>
    </div>" : "")}

    <!-- Bank Details -->
    {(showBankInfo && systemSetup != null && (!string.IsNullOrEmpty(systemSetup.BankName) || !string.IsNullOrEmpty(systemSetup.AccountName) || !string.IsNullOrEmpty(systemSetup.AccountNo) || !string.IsNullOrEmpty(systemSetup.Swift) || !string.IsNullOrEmpty(systemSetup.Iban)) ? $@"
    <div class=""bank-details-section"">
        <div class=""bank-details-title"">Banking Details:</div>
        <div class=""bank-details-content"">
            {(!string.IsNullOrEmpty(systemSetup.BankName) ? $"<div>Bank Name: {System.Net.WebUtility.HtmlEncode(systemSetup.BankName)}</div>" : "")}
            {(!string.IsNullOrEmpty(systemSetup.AccountName) ? $"<div>Account Name: {System.Net.WebUtility.HtmlEncode(systemSetup.AccountName)}</div>" : "")}
            {(!string.IsNullOrEmpty(systemSetup.AccountNo) ? $"<div>Account Number: {System.Net.WebUtility.HtmlEncode(systemSetup.AccountNo)}</div>" : "")}
            {(!string.IsNullOrEmpty(systemSetup.Swift) ? $"<div>Swift: {System.Net.WebUtility.HtmlEncode(systemSetup.Swift)}</div>" : "")}
            {(!string.IsNullOrEmpty(systemSetup.Iban) ? $"<div>IBAN: {System.Net.WebUtility.HtmlEncode(systemSetup.Iban)}</div>" : "")}
        </div>
    </div>" : "")}
</body>
</html>";
        }
    }

    // DTOs for invoice preview
    public class InvoicePreviewRequest
    {
        public string InvoiceNumber { get; set; } = string.Empty;
        public DateTime DateOfIssue { get; set; }
        public DateTime DueDate { get; set; }
        public string BillTo { get; set; } = string.Empty;
        public string BillToEmail { get; set; } = string.Empty;
        public string BillToAddress { get; set; } = string.Empty;
        public string BillFrom { get; set; } = string.Empty;
        public string BillFromEmail { get; set; } = string.Empty;
        public string BillFromAddress { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public string CurrencySymbol { get; set; } = "€";
        public string? DocumentTypeName { get; set; }
        public int? DocumentTypeId { get; set; }
        public List<InvoiceItemPreview> Items { get; set; } = new();
    }

    public class InvoiceItemPreview
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal? TaxRate { get; set; }
    }
}
