using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Services;
using InvoicingBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reports;
        private readonly IPdfGenerationService _pdfService;
        private readonly ILogger<ReportsController> _logger;
        private readonly ApplicationDbContext _context;
        
        public ReportsController(
            IReportService reports, 
            IPdfGenerationService pdfService,
            ILogger<ReportsController> logger,
            ApplicationDbContext context)
        {
            _reports = reports;
            _pdfService = pdfService;
            _logger = logger;
            _context = context;
        }

        [HttpGet("logistics-data")]
        [Produces("application/json")]
        public async Task<IActionResult> GetLogisticsData([FromQuery] ReportFilterDto filter)
        {
            // Get the logged-in user's ID from the JWT token
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            try
            {
                // Ensure dates are in UTC for PostgreSQL
                var fromDate = filter.From.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(filter.From, DateTimeKind.Utc) 
                    : filter.From.ToUniversalTime();
                    
                var toDate = filter.To.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(filter.To, DateTimeKind.Utc) 
                    : filter.To.ToUniversalTime();

                // Fetch matching invoices with their items and status
                // Exclude deleted invoices and only include document types that count for logistics
                var invoices = await _context.Invoices
                    .Where(i =>
                        i.UserId == userId &&
                        !i.IsDeleted &&
                        i.DateOfIssue.Date >= fromDate.Date &&
                        i.DateOfIssue.Date <= toDate.Date &&
                        (i.StatusId == null || filter.StatusIds.Contains(i.StatusId.Value))
                    )
                    .Include(i => i.Items)
                    .Include(i => i.Currency)
                    .Include(i => i.DocumentType)
                    .Where(i => i.DocumentType == null || i.DocumentType.CountsForLogistics)
                    .ToListAsync();

                // Get status names
                var statusDict = await _context.Statuses.ToDictionaryAsync(s => s.StatusId, s => s.Name);

                // Group by Invoices (default) or Items
                if (filter.GroupBy?.ToLower() == "items")
                {
                    // Group by Items: One row per item
                    var itemRows = invoices
                        .SelectMany(invoice => invoice.Items.Select(item => new
                        {
                            InvoiceId = invoice.Id,
                            invoice.InvoiceNumber,
                            invoice.DateOfIssue,
                            invoice.DueDate,
                            invoice.BillTo,
                            invoice.BillToEmail,
                            invoice.BillToAddress,
                            invoice.SubTotal,
                            invoice.TaxAmount,
                            invoice.DiscountAmount,
                            invoice.Total,
                            invoice.Notes,
                            invoice.DocumentTypeId,
                            DocumentTypeName = invoice.DocumentType != null ? invoice.DocumentType.DisplayName : "Invoice",
                            StatusName = invoice.StatusId.HasValue && statusDict.ContainsKey(invoice.StatusId.Value) 
                                ? statusDict[invoice.StatusId.Value] 
                                : "No Status",
                            invoice.StatusId,
                            CurrencySymbol = invoice.Currency != null ? invoice.Currency.Symbol : "€",
                            // Item-specific fields
                            ItemId = item.Id,
                            ItemTitle = item.Title,
                            ItemDescription = item.Description,
                            ItemQuantity = item.Quantity,
                            ItemUnitPrice = item.UnitPrice,
                            ItemTaxRate = item.TaxRate,
                            ItemIsTaxable = item.IsTaxable,
                            ItemLineTotal = item.Quantity * item.UnitPrice
                        }))
                        .OrderBy(x => x.InvoiceNumber)
                        .ThenBy(x => x.ItemId)
                        .ToList();

                    return Ok(itemRows);
                }
                else
                {
                    // Group by Invoices: One row per invoice with items as comma-separated list
                    var invoiceRows = invoices
                        .Select(invoice => new
                        {
                            invoice.Id,
                            invoice.InvoiceNumber,
                            invoice.DateOfIssue,
                            invoice.DueDate,
                            invoice.BillTo,
                            invoice.BillToEmail,
                            invoice.BillToAddress,
                            invoice.SubTotal,
                            invoice.TaxAmount,
                            invoice.DiscountAmount,
                            invoice.Total,
                            invoice.Notes,
                            invoice.DocumentTypeId,
                            DocumentTypeName = invoice.DocumentType != null ? invoice.DocumentType.DisplayName : "Invoice",
                            StatusName = invoice.StatusId.HasValue && statusDict.ContainsKey(invoice.StatusId.Value) 
                                ? statusDict[invoice.StatusId.Value] 
                                : "No Status",
                            invoice.StatusId,
                            CurrencySymbol = invoice.Currency != null ? invoice.Currency.Symbol : "€",
                            ItemCount = invoice.Items.Count,
                            // Items as comma-separated list
                            ItemsList = string.Join(", ", invoice.Items.Select(item => item.Title)),
                            Items = invoice.Items.Select(item => new
                            {
                                item.Id,
                                item.Title,
                                item.Description,
                                item.Quantity,
                                item.UnitPrice,
                                item.TaxRate,
                                item.IsTaxable
                            }).ToList()
                        })
                        .OrderBy(x => x.InvoiceNumber)
                        .ToList();

                    return Ok(invoiceRows);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating logistics data");
                return StatusCode(500, new { message = "Failed to retrieve logistics data", error = ex.Message });
            }
        }

        [HttpGet("logistics")]
        [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
        public async Task<IActionResult> GetLogistics([FromQuery] ReportFilterDto filter)
        {
            // Get the logged-in user's ID from the JWT token
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            // Pass the userId to the report service
            Stream excel = await _reports.GenerateLogisticsReportAsync(filter, userId);

            string filename =
                $"LogisticsReport_{filter.From:yyyyMMdd}_{filter.To:yyyyMMdd}.xlsx";

            return File(
                excel,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename
            );
        }

        [HttpGet("logistics-pdf")]
        [Produces("application/pdf")]
        public async Task<IActionResult> GetLogisticsPdf([FromQuery] ReportFilterDto filter)
        {
            try
            {
                _logger.LogInformation("PDF report generation requested for logistics report");
                
                // Get the logged-in user's ID from the JWT token
                var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Fetch matching invoices with their items and status
                // Exclude deleted invoices and only include document types that count for logistics
                var invoicesWithStatus = await _context.Invoices
                    .Where(i =>
                        i.UserId == userId &&
                        !i.IsDeleted &&
                        i.DateOfIssue.Date >= filter.From.Date &&
                        i.DateOfIssue.Date <= filter.To.Date &&
                        (i.StatusId == null || filter.StatusIds.Contains(i.StatusId.Value))
                    )
                    .Include(i => i.Items)
                    .Include(i => i.Currency)
                    .Include(i => i.DocumentType)
                    .Where(i => i.DocumentType == null || i.DocumentType.CountsForLogistics) // Only logistics-relevant document types
                    .GroupJoin(_context.Statuses,
                        invoice => invoice.StatusId,
                        status => status.StatusId,
                        (invoice, statuses) => new { Invoice = invoice, StatusName = statuses.Select(s => s.Name).FirstOrDefault() ?? "No Status" })
                    .ToListAsync();
                
                if (invoicesWithStatus == null || invoicesWithStatus.Count == 0)
                {
                    _logger.LogWarning("No data found for the specified date range");
                    return NotFound(new { message = "No data found for the specified date range" });
                }

                // Generate HTML content for the report
                var htmlContent = GenerateReportHtml(invoicesWithStatus.Cast<dynamic>().ToList(), filter);
                
                // Generate PDF
                _logger.LogInformation("Generating PDF for logistics report...");
                var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(htmlContent);
                _logger.LogInformation($"PDF generated successfully. Size: {pdfBytes.Length / 1024} KB");

                string filename = $"LogisticsReport_{filter.From:yyyyMMdd}_{filter.To:yyyyMMdd}.pdf";

                return File(pdfBytes, "application/pdf", filename);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF report");
                return StatusCode(500, new { message = "Failed to generate PDF report", error = ex.Message });
            }
        }

        private string GenerateReportHtml(List<dynamic> invoicesWithStatus, ReportFilterDto filter)
        {
            var sb = new StringBuilder();
            
            // Build headers based on selected columns
            var columnHeaders = filter.SelectedColumns
                .Where(col => ReportColumns.ColumnHeaders.ContainsKey(col))
                .Select(col => new { Key = col, Header = ReportColumns.ColumnHeaders[col] })
                .ToList();

            // Calculate summary statistics
            var totalInvoices = invoicesWithStatus.Count;
            int totalItems = 0;
            decimal totalValue = 0m;
            decimal totalVAT = 0m;
            decimal totalDiscount = 0m;
            
            foreach (var item in invoicesWithStatus)
            {
                totalItems += item.Invoice.Items.Count;
                totalValue += item.Invoice.Total;
                totalVAT += item.Invoice.TaxAmount;
                totalDiscount += item.Invoice.DiscountAmount;
            }

            sb.Append($@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <style>
        @page {{
            size: A4 landscape;
            margin: 0.5in;
        }}
        
        body {{
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #1f2937;
            background: white;
        }}
        
        .report-header {{
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #8b5cf6;
        }}
        
        .report-title {{
            font-size: 24px;
            font-weight: 700;
            color: #8b5cf6;
            margin-bottom: 8px;
        }}
        
        .report-subtitle {{
            font-size: 12px;
            color: #6b7280;
        }}
        
        .summary-section {{
            display: flex;
            justify-content: space-around;
            margin-bottom: 24px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
        }}
        
        .summary-item {{
            text-align: center;
        }}
        
        .summary-label {{
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 4px;
        }}
        
        .summary-value {{
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
        }}
        
        table {{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 16px;
        }}
        
        thead th {{
            background: #8b5cf6;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 10px;
            border: 1px solid #7c3aed;
        }}
        
        thead th:first-child {{
            border-top-left-radius: 8px;
        }}
        
        thead th:last-child {{
            border-top-right-radius: 8px;
        }}
        
        tbody tr {{
            border-bottom: 1px solid #e5e7eb;
        }}
        
        tbody tr:nth-child(even) {{
            background: rgba(139, 92, 246, 0.04);
        }}
        
        tbody td {{
            padding: 8px;
            font-size: 9px;
            color: #374151;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
        }}
        
        tbody tr:last-child td:first-child {{
            border-bottom-left-radius: 8px;
        }}
        
        tbody tr:last-child td:last-child {{
            border-bottom-right-radius: 8px;
        }}
        
        .totals-row {{
            font-weight: 700;
            background: #fef3c7 !important;
            color: #92400e;
        }}
        
        .text-right {{
            text-align: right;
        }}
        
        .page-footer {{
            margin-top: 24px;
            text-align: center;
            font-size: 9px;
            color: #9ca3af;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
        }}
    </style>
</head>
<body>
    <div class=""report-header"">
        <div class=""report-title"">Logistics Report</div>
        <div class=""report-subtitle"">Period: {filter.From:yyyy-MM-dd} to {filter.To:yyyy-MM-dd}</div>
    </div>
    
    <div class=""summary-section"">
        <div class=""summary-item"">
            <div class=""summary-label"">Total Invoices</div>
            <div class=""summary-value"">{totalInvoices}</div>
        </div>
        <div class=""summary-item"">
            <div class=""summary-label"">Total Items</div>
            <div class=""summary-value"">{totalItems}</div>
        </div>
        <div class=""summary-item"">
            <div class=""summary-label"">Total VAT</div>
            <div class=""summary-value"">€{totalVAT:N2}</div>
        </div>
        <div class=""summary-item"">
            <div class=""summary-label"">Total Discount</div>
            <div class=""summary-value"">€{totalDiscount:N2}</div>
        </div>
        <div class=""summary-item"">
            <div class=""summary-label"">Total Value</div>
            <div class=""summary-value"">€{totalValue:N2}</div>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>");

            // Add column headers
            foreach (var col in columnHeaders)
            {
                sb.Append($@"
                <th>{System.Net.WebUtility.HtmlEncode(col.Header)}</th>");
            }

            sb.Append($@"
            </tr>
        </thead>
        <tbody>");

            // Add data rows - ONE ROW PER INVOICE
            foreach (var invWithStatus in invoicesWithStatus)
            {
                var inv = invWithStatus.Invoice;
                var statusName = invWithStatus.StatusName;
                
                sb.Append(@"
            <tr>");
                foreach (var col in columnHeaders)
                {
                    var cellValue = GetCellValueForHtml(col.Key, inv, null, statusName);
                    sb.Append($@"
                <td>{cellValue}</td>");
                }
                sb.Append(@"
            </tr>");
            }

            sb.Append($@"
        </tbody>
    </table>
    
    <div class=""page-footer"">
        Generated on {DateTime.Now:yyyy-MM-dd HH:mm:ss}
    </div>
</body>
</html>");

            return sb.ToString();
        }

        private string GetCellValueForHtml(string columnKey, dynamic invoice, dynamic item, string statusName)
        {
            #pragma warning disable CS8602 // Dereference of a possibly null reference - using dynamic types
            try
            {
                // Get item count for summary display
                int itemCount = invoice.Items?.Count ?? 0;
                string itemSummary = itemCount == 0 ? "No items" : 
                                     itemCount == 1 ? "1 item" : 
                                     $"{itemCount} items";
                
                // Calculate total quantity across all items
                int totalQuantity = 0;
                if (invoice.Items?.Count > 0)
                {
                    totalQuantity = ((IEnumerable<dynamic>)invoice.Items).Sum(i => (int)i.Quantity);
                }
                
                return columnKey switch
                {
                    // Invoice-level fields
                    ReportColumns.InvoiceNumber => System.Net.WebUtility.HtmlEncode(invoice.InvoiceNumber?.ToString() ?? ""),
                    ReportColumns.Date => invoice.DateOfIssue.ToString("yyyy-MM-dd"),
                    ReportColumns.DueDate => invoice.DueDate.ToString("yyyy-MM-dd"),
                    ReportColumns.Customer => System.Net.WebUtility.HtmlEncode(invoice.BillTo?.ToString() ?? ""),
                    ReportColumns.BillToEmail => System.Net.WebUtility.HtmlEncode(invoice.BillToEmail?.ToString() ?? ""),
                    ReportColumns.BillToAddress => System.Net.WebUtility.HtmlEncode(invoice.BillToAddress?.ToString() ?? ""),
                    ReportColumns.Status => System.Net.WebUtility.HtmlEncode(statusName ?? ""),
                    ReportColumns.DocumentType => System.Net.WebUtility.HtmlEncode(invoice.DocumentType?.DisplayName?.ToString() ?? "Invoice"),
                    ReportColumns.InvoiceNotes => System.Net.WebUtility.HtmlEncode(invoice.Notes?.ToString() ?? ""),
                    
                    // Item-level fields - show count or summary for invoice-level report
                    ReportColumns.ItemTitle => itemSummary,
                    ReportColumns.ItemDescription => "", // Not applicable for invoice-level report
                    ReportColumns.Quantity => totalQuantity.ToString(),
                    ReportColumns.UnitPrice => "", // Not applicable for invoice-level report
                    
                    // Financial fields - always use invoice totals
                    ReportColumns.Subtotal => $"€{(invoice.SubTotal ?? 0):N2}",
                    ReportColumns.VatAmount => $"€{(invoice.TaxAmount ?? 0):N2}",
                    ReportColumns.DiscountAmount => $"€{(invoice.DiscountAmount ?? 0):N2}",
                    ReportColumns.TotalAmount => $"€{(invoice.Total ?? 0):N2}",
                    _ => ""
                };
            }
            catch
            {
                return "";
            }
            #pragma warning restore CS8602
        }
    }
}