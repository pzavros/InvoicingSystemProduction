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

        public PdfController(
            IPdfGenerationService pdfService,
            ApplicationDbContext context,
            ILogger<PdfController> logger)
        {
            _pdfService = pdfService;
            _context = context;
            _logger = logger;
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

                // Fetch SystemSetup for company details, logo, and bank info
                var systemSetup = await _context.SystemSetups
                    .FirstOrDefaultAsync(s => s.UserId == userId);

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
            var showLogo = true;
            var logoStyle = "square"; // square or circle
            var logoSize = 80; // medium
            var tableBorder = true;
            var tableStyle = "rounded";
            var alternateRowColors = true;
            var showBankInfo = true;
            var bankInfoBackground = true;
            
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
                <div style=""display: flex; justify-content: space-between; margin-bottom: 8px;"">
                    <span style=""color: #6b7280; font-size: 14px;"">VAT ({vat.Key:F0}%):</span>
                    <span style=""color: #1f2937; font-size: 14px; font-weight: 500;"">{currencySymbol}{vat.Value:N2}</span>
                </div>";
            }

            if (vatBreakdown.Count == 0)
            {
                vatBreakdownHtml = $@"
                <div style=""display: flex; justify-content: space-between; margin-bottom: 8px;"">
                    <span style=""color: #6b7280; font-size: 14px;"">VAT (0%):</span>
                    <span style=""color: #1f2937; font-size: 14px; font-weight: 500;"">{currencySymbol}0.00</span>
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
                    <td style=""padding: 16px; text-align: left;"">
                        <div style=""font-weight: 500; color: #1f2937; margin-bottom: 4px;"">{System.Net.WebUtility.HtmlEncode(item.Title)}</div>
                        {(!string.IsNullOrEmpty(item.Description) ? $"<div style=\"font-size: 13px; color: #6b7280;\">{System.Net.WebUtility.HtmlEncode(item.Description)}</div>" : "")}
                    </td>
                    <td style=""padding: 16px; text-align: center; color: #1f2937;"">{item.Quantity}</td>
                    <td style=""padding: 16px; text-align: center; color: #1f2937;"">{currencySymbol}{item.UnitPrice:N2}</td>
                    <td style=""padding: 16px; text-align: center; color: #1f2937;"">{itemVatRate:F0}%</td>
                    <td style=""padding: 16px; text-align: center; color: #1f2937; font-weight: 500;"">{currencySymbol}{amount:N2}</td>
                </tr>";
            }

            var discountHtml = discountAmount > 0 ? $@"
                <div style=""display: flex; justify-content: space-between; margin-bottom: 8px;"">
                    <span style=""color: #6b7280; font-size: 14px;"">Discount:</span>
                    <span style=""color: #dc2626; font-size: 14px; font-weight: 500;"">-{currencySymbol}{discountAmount:N2}</span>
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
        body {{
            font-family: 'Inter', 'Arial', 'Helvetica', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 32px;
            max-width: 800px;
            margin: 0 auto;
        }}
        .invoice-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
        }}
        .invoice-title {{
            font-size: 40px;
            font-weight: 700;
            color: {primaryColor};
            margin-bottom: 8px;
        }}
        .invoice-number {{
            font-size: 20px;
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
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
        }}
        .section-title {{
            font-size: 14px;
            font-weight: 700;
            color: {primaryColor};
            margin-bottom: 8px;
        }}
        .details-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 32px;
        }}
        .detail-section div {{
            margin-bottom: 4px;
            color: #1f2937;
        }}
        .detail-section .email {{
            color: #6b7280;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 32px 0;
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
            padding: 16px;
            font-weight: 600;
            font-size: 16px;
        }}
        thead th.center {{
            text-align: center;
        }}
        tbody tr {{
            border-bottom: 1px solid #e5e7eb;
        }}
        tbody tr:nth-child(odd) {{
            background-color: {alternateRowStyle};
        }}
        tbody td {{
            padding: 16px;
            color: #1f2937;
        }}
        tbody td.center {{
            text-align: center;
        }}
        .item-title {{
            font-weight: 500;
            margin-bottom: 4px;
        }}
        .item-description {{
            font-size: 13px;
            color: #6b7280;
        }}
        .totals-container {{
            display: flex;
            justify-content: flex-end;
            margin: 32px 0;
        }}
        .totals-box {{
            min-width: 300px;
        }}
        .total-row {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
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
            margin: 8px 0;
        }}
        .total-final {{
            display: flex;
            justify-content: space-between;
            font-size: 24px;
            font-weight: 700;
            margin-top: 8px;
        }}
        .total-final .label {{
            color: #1f2937;
        }}
        .total-final .value {{
            color: {primaryColor};
        }}
        .amount-due-box {{
            max-width: 300px;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
            margin-bottom: 32px;
        }}
        .amount-due-title {{
            font-size: 14px;
            font-weight: 600;
            color: {primaryColor};
            margin-bottom: 8px;
        }}
        .amount-due-value {{
            font-size: 32px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }}
        .amount-due-note {{
            font-size: 12px;
            color: #6b7280;
        }}
        .notes-section {{
            margin-bottom: 32px;
        }}
        .notes-title {{
            font-size: 14px;
            font-weight: 600;
            color: {primaryColor};
            margin-bottom: 8px;
        }}
        .notes-content {{
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
        }}
        .bank-details-section {{
            background-color: {bankBackgroundStyle};
            padding: 24px;
            border-radius: {borderRadius};
            border: {bankBorderStyle};
            margin-top: 16px;
        }}
        .bank-details-title {{
            font-size: 14px;
            font-weight: 600;
            color: {primaryColor};
            margin-bottom: 12px;
        }}
        .bank-details-content {{
            font-size: 14px;
            color: #1f2937;
            line-height: 1.8;
        }}
    </style>
</head>
<body>
    <!-- Invoice Header -->
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
            <div class=""company-details"">
                {(!string.IsNullOrEmpty(systemSetup?.CompanyNo) ? $"<div>Company No: {systemSetup.CompanyNo}</div>" : "")}
                {(!string.IsNullOrEmpty(systemSetup?.VatNo) ? $"<div>VAT No: {systemSetup.VatNo}</div>" : "")}
                {(!string.IsNullOrEmpty(systemSetup?.TicNo) ? $"<div>TIC No: {systemSetup.TicNo}</div>" : "")}
                {(!string.IsNullOrEmpty(systemSetup?.Website) ? $"<div>{systemSetup.Website}</div>" : "")}
            </div>
        </div>
    </div>

    <!-- From/To Details -->
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
    </div>

    <!-- Dates -->
    <div class=""details-grid"">
        <div>
            <span style=""color: #6b7280; font-size: 14px;""><strong>Date Issued:</strong> {invoice.DateOfIssue:dd/MM/yyyy}</span>
        </div>
        <div>
            <span style=""color: #6b7280; font-size: 14px;""><strong>Due Date:</strong> {invoice.DueDate:dd/MM/yyyy}</span>
        </div>
    </div>

    <!-- Items Table -->
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
    </table>

    <!-- Totals -->
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
    </div>

    <!-- Amount Due Box -->
    <div class=""amount-due-box"">
        <div class=""amount-due-title"">Amount Due</div>
        <div class=""amount-due-value"">{currencySymbol}{finalTotal:N2}</div>
        <div class=""amount-due-note"">Due upon receipt</div>
    </div>

    <!-- Notes -->
    {(!string.IsNullOrEmpty(invoice.Notes) ? $@"
    <div class=""notes-section"">
        <div class=""notes-title"">Notes:</div>
        <div class=""notes-content"">{System.Net.WebUtility.HtmlEncode(invoice.Notes)}</div>
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
}
