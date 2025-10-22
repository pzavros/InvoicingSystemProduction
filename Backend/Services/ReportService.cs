using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Services
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _db;
        public ReportService(ApplicationDbContext db) => _db = db;        public async Task<Stream> GenerateLogisticsReportAsync(ReportFilterDto filter, int userId)
        {
            // Debug: Log the filter parameters
            Console.WriteLine($"DEBUG: Filter From: {filter.From}, To: {filter.To}, UserId: {userId}");
            Console.WriteLine($"DEBUG: Filter StatusIds: [{string.Join(", ", filter.StatusIds)}]");
            
            // Debug: First, let's see how many total invoices we have for this user
            var totalInvoices = await _db.Invoices.CountAsync(i => i.UserId == userId);
            Console.WriteLine($"DEBUG: Total invoices for user {userId}: {totalInvoices}");
            
            // Debug: Count invoices in date range (without status filter)
            var invoicesInDateRange = await _db.Invoices
                .Where(i => i.UserId == userId && i.DateOfIssue.Date >= filter.From.Date && i.DateOfIssue.Date <= filter.To.Date)
                .CountAsync();
            Console.WriteLine($"DEBUG: User {userId} invoices in date range {filter.From:yyyy-MM-dd} to {filter.To:yyyy-MM-dd}: {invoicesInDateRange}");
            
            // Debug: Count invoices by StatusId distribution for this user
            var statusDistribution = await _db.Invoices
                .Where(i => i.UserId == userId)
                .GroupBy(i => i.StatusId)
                .Select(g => new { StatusId = g.Key, Count = g.Count() })
                .ToListAsync();
            Console.WriteLine($"DEBUG: Status distribution for user {userId}:");
            foreach (var status in statusDistribution)
            {
                Console.WriteLine($"  StatusId {status.StatusId ?? -1}: {status.Count} invoices");
            }

            // 1) fetch matching invoices with their items and join with status - FILTERED BY USER
            var invoicesWithStatus = await _db.Invoices
                .Where(i =>
                    i.UserId == userId &&
                    i.DateOfIssue.Date >= filter.From.Date &&
                    i.DateOfIssue.Date <= filter.To.Date &&
                    (i.StatusId == null || filter.StatusIds.Contains(i.StatusId.Value))
                )
                .Include(i => i.Items)
                .GroupJoin(_db.Statuses,
                    invoice => invoice.StatusId,
                    status => status.StatusId,
                    (invoice, statuses) => new { Invoice = invoice, StatusName = statuses.Select(s => s.Name).FirstOrDefault() ?? "No Status" })
                .ToListAsync();
                  Console.WriteLine($"DEBUG: Invoices after filtering: {invoicesWithStatus.Count}");
            Console.WriteLine($"DEBUG: Total items across all invoices: {invoicesWithStatus.Sum(i => i.Invoice.Items.Count)}");
            
            // Debug: Check invoices without items
            var invoicesWithoutItems = invoicesWithStatus.Where(i => i.Invoice.Items.Count == 0).ToList();
            Console.WriteLine($"DEBUG: Invoices WITHOUT items: {invoicesWithoutItems.Count}");
            
            var invoicesWithItems = invoicesWithStatus.Where(i => i.Invoice.Items.Count > 0).ToList();
            Console.WriteLine($"DEBUG: Invoices WITH items: {invoicesWithItems.Count}");
            
            // Debug: Show item distribution
            var itemDistribution = invoicesWithStatus
                .GroupBy(i => i.Invoice.Items.Count)
                .Select(g => new { ItemCount = g.Key, InvoiceCount = g.Count() })
                .OrderBy(x => x.ItemCount)
                .ToList();
            Console.WriteLine("DEBUG: Item count distribution:");
            foreach (var dist in itemDistribution)
            {
                Console.WriteLine($"  {dist.InvoiceCount} invoices have {dist.ItemCount} items");
            }

            // 2) create Excel workbook
            var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("Logistics Export");

            // Build dynamic headers based on selected columns
            var headers = filter.SelectedColumns
                .Where(col => ReportColumns.ColumnHeaders.ContainsKey(col))
                .Select(col => ReportColumns.ColumnHeaders[col])
                .ToArray();

            // Format header row with bold styling
            for (int c = 0; c < headers.Length; c++)
            {
                var headerCell = ws.Cell(1, c + 1);
                headerCell.Value = headers[c];
                headerCell.Style.Font.Bold = true;
                headerCell.Style.Fill.BackgroundColor = XLColor.LightGray;
            }            int row = 2;
            foreach (var invWithStatus in invoicesWithStatus)
            {
                var inv = invWithStatus.Invoice;
                var statusName = invWithStatus.StatusName;
                
                // Calculate invoice-level VAT and discount totals
                decimal invoiceVATTotal = inv.TaxAmount;
                decimal invoiceDiscountTotal = inv.DiscountAmount;
                decimal invoiceTotal = inv.Total;

                // If invoice has no items, create one row with invoice data but empty item fields
                if (inv.Items.Count == 0)
                {
                    // Populate columns dynamically based on selection
                    int col = 1;
                    foreach (var selectedColumn in filter.SelectedColumns)
                    {
                        if (!ReportColumns.ColumnHeaders.ContainsKey(selectedColumn)) continue;
                        
                        // For invoices without items, use null for item-specific fields
                        var cellValue = GetCellValueForInvoiceWithoutItems(selectedColumn, inv, statusName, invoiceDiscountTotal, invoiceTotal);
                        
                        // Set the cell value based on type to avoid casting issues
                        var cell = ws.Cell(row, col);
                        switch (cellValue)
                        {
                            case string strValue:
                                cell.Value = strValue;
                                break;
                            case decimal decValue:
                                cell.Value = decValue;
                                break;
                            case int intValue:
                                cell.Value = intValue;
                                break;
                            case DateTime dateValue:
                                cell.Value = dateValue;
                                break;
                            default:
                                cell.Value = cellValue?.ToString() ?? "";
                                break;
                        }
                        col++;
                    }
                    row++;
                }
                else
                {
                    // Process each item for invoices that have items
                    foreach (var it in inv.Items)
                    {
                        // Calculate item-level values
                        decimal itemTaxRate = it.TaxRate ?? inv.TaxRate;
                        decimal itemSubtotal = it.Quantity * it.UnitPrice;
                        decimal itemVAT = it.IsTaxable ? (itemSubtotal * itemTaxRate / 100) : 0;
                        decimal itemTotal = itemSubtotal + itemVAT;

                        // Populate columns dynamically based on selection
                        int col = 1;
                        foreach (var selectedColumn in filter.SelectedColumns)
                        {
                            if (!ReportColumns.ColumnHeaders.ContainsKey(selectedColumn)) continue;
                            
                            var cellValue = GetCellValue(selectedColumn, inv, it, statusName, itemVAT, invoiceDiscountTotal, itemTotal, itemSubtotal);
                            
                            // Set the cell value based on type to avoid casting issues
                            var cell = ws.Cell(row, col);
                            switch (cellValue)
                            {
                                case string strValue:
                                    cell.Value = strValue;
                                    break;
                                case decimal decValue:
                                    cell.Value = decValue;
                                    break;
                                case int intValue:
                                    cell.Value = intValue;
                                    break;
                                case DateTime dateValue:
                                    cell.Value = dateValue;
                                    break;
                                default:
                                    cell.Value = cellValue?.ToString() ?? "";
                                    break;
                            }
                            col++;
                        }
                        row++;
                    }
                }}

            // Add totals row with dynamic column positioning
            ws.Cell(row, 1).Value = "TOTALS";
            ws.Cell(row, 1).Style.Font.Bold = true;
            
            // Find positions of amount columns and add formulas
            for (int i = 0; i < filter.SelectedColumns.Count; i++)
            {
                var columnKey = filter.SelectedColumns[i];
                int colIndex = i + 1; // Excel columns are 1-based
                
                if (columnKey == ReportColumns.VatAmount || 
                    columnKey == ReportColumns.DiscountAmount || 
                    columnKey == ReportColumns.TotalAmount)
                {
                    // Add sum formula for amount columns
                    string columnLetter = GetExcelColumnLetter(colIndex);
                    ws.Cell(row, colIndex).FormulaA1 = $"=SUM({columnLetter}2:{columnLetter}{row - 1})";
                    ws.Cell(row, colIndex).Style.Font.Bold = true;
                    ws.Cell(row, colIndex).Style.Fill.BackgroundColor = XLColor.LightYellow;
                }
            }

            // Auto-fit columns for better readability
            ws.Columns().AdjustToContents();

            // Add summary section on a separate worksheet
            var summaryWs = wb.Worksheets.Add("Summary");
            
            // Summary headers
            summaryWs.Cell(1, 1).Value = "LOGISTICS EXPORT SUMMARY";
            summaryWs.Cell(1, 1).Style.Font.Bold = true;
            summaryWs.Cell(1, 1).Style.Font.FontSize = 16;
            
            summaryWs.Cell(3, 1).Value = "Export Period:";
            summaryWs.Cell(3, 2).Value = $"{filter.From:yyyy-MM-dd} to {filter.To:yyyy-MM-dd}";
              summaryWs.Cell(4, 1).Value = "Total Invoices:";
            summaryWs.Cell(4, 2).Value = invoicesWithStatus.Count;
            
            summaryWs.Cell(5, 1).Value = "Total Items:";
            summaryWs.Cell(5, 2).Value = invoicesWithStatus.Sum(i => i.Invoice.Items.Count);
            
            summaryWs.Cell(6, 1).Value = "Total Quantity:";
            summaryWs.Cell(6, 2).Value = invoicesWithStatus.SelectMany(i => i.Invoice.Items).Sum(item => item.Quantity);
            
            summaryWs.Cell(7, 1).Value = "Total Value (before VAT):";
            summaryWs.Cell(7, 2).Value = invoicesWithStatus.Sum(i => i.Invoice.SubTotal);
            
            summaryWs.Cell(8, 1).Value = "Total VAT Amount:";
            summaryWs.Cell(8, 2).Value = invoicesWithStatus.Sum(i => i.Invoice.TaxAmount);
            
            summaryWs.Cell(9, 1).Value = "Total Discount Amount:";
            summaryWs.Cell(9, 2).Value = invoicesWithStatus.Sum(i => i.Invoice.DiscountAmount);
            
            summaryWs.Cell(10, 1).Value = "Total Value (including VAT):";
            summaryWs.Cell(10, 2).Value = invoicesWithStatus.Sum(i => i.Invoice.Total);
              // Currency breakdown
            var currencyGroups = invoicesWithStatus.GroupBy(i => i.Invoice.Currency?.Code ?? "EUR").ToList();
            if (currencyGroups.Count > 1)
            {
                summaryWs.Cell(12, 1).Value = "CURRENCY BREAKDOWN:";
                summaryWs.Cell(12, 1).Style.Font.Bold = true;
                
                int currencyRow = 13;
                foreach (var currencyGroup in currencyGroups)
                {
                    summaryWs.Cell(currencyRow, 1).Value = $"{currencyGroup.Key}:";
                    summaryWs.Cell(currencyRow, 2).Value = currencyGroup.Sum(i => i.Invoice.Total);
                    currencyRow++;
                }
            }
              // Customer breakdown (top 10)
            var customerBreakdown = invoicesWithStatus
                .GroupBy(i => i.Invoice.BillTo)
                .Select(g => new { Customer = g.Key, Count = g.Count(), Total = g.Sum(i => i.Invoice.Total) })
                .OrderByDescending(x => x.Total)
                .Take(10)
                .ToList();
                
            if (customerBreakdown.Any())
            {
                int customerStartRow = currencyGroups.Count > 1 ? 13 + currencyGroups.Count + 2 : 12;
                summaryWs.Cell(customerStartRow, 1).Value = "TOP 10 CUSTOMERS BY VALUE:";
                summaryWs.Cell(customerStartRow, 1).Style.Font.Bold = true;
                
                summaryWs.Cell(customerStartRow + 1, 1).Value = "Customer";
                summaryWs.Cell(customerStartRow + 1, 2).Value = "Orders";
                summaryWs.Cell(customerStartRow + 1, 3).Value = "Total Value";
                
                for (int i = 0; i < customerBreakdown.Count; i++)
                {
                    int customerRow = customerStartRow + 2 + i;
                    summaryWs.Cell(customerRow, 1).Value = customerBreakdown[i].Customer;
                    summaryWs.Cell(customerRow, 2).Value = customerBreakdown[i].Count;
                    summaryWs.Cell(customerRow, 3).Value = customerBreakdown[i].Total;
                }
            }
              // Auto-fit summary columns
            summaryWs.Columns().AdjustToContents();
            
            // Set the main data sheet as active
            ws.SetTabActive();

            // 3) return a MemoryStream
            var ms = new MemoryStream();
            wb.SaveAs(ms);            ms.Position = 0;
            return ms;
        }        private object GetCellValue(string columnKey, dynamic invoice, dynamic item, string statusName, 
                                   decimal itemVAT, decimal invoiceDiscountTotal, decimal itemTotal, decimal itemSubtotal)
        {
            return columnKey switch
            {
                ReportColumns.InvoiceNumber => invoice.InvoiceNumber,
                ReportColumns.Date => invoice.DateOfIssue,
                ReportColumns.Customer => invoice.BillTo,
                ReportColumns.ItemTitle => item.Title,
                ReportColumns.Status => statusName,
                ReportColumns.VatAmount => itemVAT,
                ReportColumns.DiscountAmount => invoiceDiscountTotal,
                ReportColumns.TotalAmount => itemTotal,
                ReportColumns.ItemDescription => item.Description ?? "",
                ReportColumns.Quantity => item.Quantity,
                ReportColumns.UnitPrice => item.UnitPrice,
                ReportColumns.Subtotal => itemSubtotal,                ReportColumns.InvoiceNotes => invoice.Notes ?? "",
                ReportColumns.DueDate => invoice.DueDate,
                ReportColumns.BillToEmail => invoice.BillToEmail ?? "",
                ReportColumns.BillToAddress => invoice.BillToAddress ?? "",
                _ => ""
            };
        }

        private object GetCellValueForInvoiceWithoutItems(string columnKey, dynamic invoice, string statusName, 
                                                         decimal invoiceDiscountTotal, decimal invoiceTotal)
        {
            return columnKey switch
            {
                ReportColumns.InvoiceNumber => invoice.InvoiceNumber,
                ReportColumns.Date => invoice.DateOfIssue,
                ReportColumns.Customer => invoice.BillTo,
                ReportColumns.ItemTitle => "[No Items]",
                ReportColumns.Status => statusName,
                ReportColumns.VatAmount => invoice.TaxAmount,
                ReportColumns.DiscountAmount => invoiceDiscountTotal,
                ReportColumns.TotalAmount => invoiceTotal,
                ReportColumns.ItemDescription => "[No Items]",
                ReportColumns.Quantity => 0,
                ReportColumns.UnitPrice => 0.0m,
                ReportColumns.Subtotal => invoice.SubTotal,
                ReportColumns.InvoiceNotes => invoice.Notes ?? "",
                ReportColumns.DueDate => invoice.DueDate,
                ReportColumns.BillToEmail => invoice.BillToEmail ?? "",
                ReportColumns.BillToAddress => invoice.BillToAddress ?? "",
                _ => ""
            };
        }

        private string GetExcelColumnLetter(int columnNumber)
        {
            string columnName = "";
            while (columnNumber > 0)
            {
                int modulo = (columnNumber - 1) % 26;
                columnName = Convert.ToChar(65 + modulo) + columnName;
                columnNumber = (columnNumber - modulo) / 26;
            }
            return columnName;
        }
    }
}
