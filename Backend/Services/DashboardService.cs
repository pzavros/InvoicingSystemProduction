using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic; // Added for List
using System.Globalization; // Added for CultureInfo

namespace InvoicingBackend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var currentDate = DateTime.UtcNow;
            var currentMonthStart = new DateTime(currentDate.Year, currentDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var last3MonthsStart = currentMonthStart.AddMonths(-3);
            var last6MonthsStart = currentMonthStart.AddMonths(-6);
            var lastYearStart = currentMonthStart.AddYears(-1);

            var invoices = _context.Invoices.Where(i => !i.IsDeleted);

            var stats = new DashboardStatsDto
            {
                TotalAmountCurrentMonth = await invoices
                    .Where(i => i.DateOfIssue >= currentMonthStart && i.DateOfIssue < currentMonthStart.AddMonths(1))
                    .SumAsync(i => i.Total),
                InvoiceCountCurrentMonth = await invoices
                    .CountAsync(i => i.DateOfIssue >= currentMonthStart && i.DateOfIssue < currentMonthStart.AddMonths(1)),

                TotalAmountLast3Months = await invoices
                    .Where(i => i.DateOfIssue >= last3MonthsStart && i.DateOfIssue < currentMonthStart)
                    .SumAsync(i => i.Total),
                InvoiceCountLast3Months = await invoices
                    .CountAsync(i => i.DateOfIssue >= last3MonthsStart && i.DateOfIssue < currentMonthStart),

                TotalAmountLast6Months = await invoices
                    .Where(i => i.DateOfIssue >= last6MonthsStart && i.DateOfIssue < currentMonthStart)
                    .SumAsync(i => i.Total),
                InvoiceCountLast6Months = await invoices
                    .CountAsync(i => i.DateOfIssue >= last6MonthsStart && i.DateOfIssue < currentMonthStart),

                TotalAmountLastYear = await invoices
                    .Where(i => i.DateOfIssue >= lastYearStart && i.DateOfIssue < currentMonthStart)
                    .SumAsync(i => i.Total),
                InvoiceCountLastYear = await invoices
                    .CountAsync(i => i.DateOfIssue >= lastYearStart && i.DateOfIssue < currentMonthStart),

                TotalAmountOverall = await invoices.SumAsync(i => i.Total),
                InvoiceCountOverall = await invoices.CountAsync()
            };

            return stats;
        }

        // User-filtered version for tenant isolation
        public async Task<DashboardStatsDto> GetDashboardStatsAsync(int userId)
        {
            var currentDate = DateTime.UtcNow;
            var currentMonthStart = new DateTime(currentDate.Year, currentDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var last3MonthsStart = currentMonthStart.AddMonths(-3);
            var last6MonthsStart = currentMonthStart.AddMonths(-6);
            var lastYearStart = currentMonthStart.AddYears(-1);

            var invoices = _context.Invoices.Where(i => !i.IsDeleted && i.UserId == userId); // Filter by user

            var stats = new DashboardStatsDto
            {
                TotalAmountCurrentMonth = await invoices
                    .Where(i => i.DateOfIssue >= currentMonthStart && i.DateOfIssue < currentMonthStart.AddMonths(1))
                    .SumAsync(i => i.Total),
                InvoiceCountCurrentMonth = await invoices
                    .CountAsync(i => i.DateOfIssue >= currentMonthStart && i.DateOfIssue < currentMonthStart.AddMonths(1)),

                TotalAmountLast3Months = await invoices
                    .Where(i => i.DateOfIssue >= last3MonthsStart && i.DateOfIssue < currentMonthStart)
                    .SumAsync(i => i.Total),
                InvoiceCountLast3Months = await invoices
                    .CountAsync(i => i.DateOfIssue >= last3MonthsStart && i.DateOfIssue < currentMonthStart),

                TotalAmountLast6Months = await invoices
                    .Where(i => i.DateOfIssue >= last6MonthsStart && i.DateOfIssue < currentMonthStart)
                    .SumAsync(i => i.Total),
                InvoiceCountLast6Months = await invoices
                    .CountAsync(i => i.DateOfIssue >= last6MonthsStart && i.DateOfIssue < currentMonthStart),

                TotalAmountLastYear = await invoices
                    .Where(i => i.DateOfIssue >= lastYearStart && i.DateOfIssue < currentMonthStart)
                    .SumAsync(i => i.Total),
                InvoiceCountLastYear = await invoices
                    .CountAsync(i => i.DateOfIssue >= lastYearStart && i.DateOfIssue < currentMonthStart),

                TotalAmountOverall = await invoices.SumAsync(i => i.Total),
                InvoiceCountOverall = await invoices.CountAsync()
            };

            return stats;
        }

        public async Task<MonthlyDashboardStatsDto> GetDashboardStatsForMonthYearAsync(int month, int year, int userId)
        {
            var monthStart = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var monthEnd = monthStart.AddMonths(1);
            var previousMonthStart = monthStart.AddMonths(-1);

            // Get user's currency preference
            var user = await _context.Users.FindAsync(userId);
            var currencySymbol = user?.Currency switch
            {
                "USD" => "$",
                "GBP" => "£",
                "EUR" => "€",
                "JPY" => "¥",
                _ => "€" // Default to EUR
            };

            // Filter only actual invoices (exclude Proforma ID=3, Quotation ID=4)
            // DocumentTypeId = 1 (Invoice) or 2 (Tax Invoice)
            var invoices = _context.Invoices
                .Where(i => !i.IsDeleted 
                    && i.UserId == userId 
                    && i.DocumentTypeId != 3  // Exclude Proforma
                    && i.DocumentTypeId != 4); // Exclude Quotation

            // Current month stats
            var currentMonthInvoices = await invoices
                .Where(i => i.DateOfIssue >= monthStart && i.DateOfIssue < monthEnd)
                .ToListAsync();

            var totalEarnings = currentMonthInvoices.Sum(i => i.Total);
            var totalTax = currentMonthInvoices.Sum(i => i.TaxAmount);
            var totalRevenue = currentMonthInvoices.Sum(i => i.SubTotal);
            var invoiceCount = currentMonthInvoices.Count;

            // Previous month stats for percentage change
            var previousMonthTotal = await invoices
                .Where(i => i.DateOfIssue >= previousMonthStart && i.DateOfIssue < monthStart)
                .SumAsync(i => i.Total);

            // Calculate percentage change
            decimal percentageChange = 0;
            if (previousMonthTotal > 0)
            {
                percentageChange = ((totalEarnings - previousMonthTotal) / previousMonthTotal) * 100;
            }
            else if (totalEarnings > 0)
            {
                percentageChange = 100; // If previous month was 0 and current has value, it's 100% increase
            }

            var stats = new MonthlyDashboardStatsDto
            {
                TotalEarningsSelectedMonthYear = totalEarnings,
                TotalTaxSelectedMonthYear = totalTax,
                TotalRevenueSelectedMonthYear = totalRevenue,
                InvoiceCountSelectedMonthYear = invoiceCount,
                CurrencySymbol = currencySymbol,
                PercentageChangeEarnings = percentageChange
            };

            return stats;
        }

        public async Task<AnnualBreakdownDto> GetAnnualEarningsBreakdownAsync(int year, int userId)
        {
            var result = new AnnualBreakdownDto();
            
            // Filter only actual invoices (exclude Proforma ID=3, Quotation ID=4)
            var invoicesInYear = await _context.Invoices
                .Where(i => !i.IsDeleted 
                    && i.DateOfIssue.Year == year 
                    && i.UserId == userId
                    && i.DocumentTypeId != 3  // Exclude Proforma
                    && i.DocumentTypeId != 4) // Exclude Quotation
                .ToListAsync();

            for (int month = 1; month <= 12; month++)
            {
                var monthStart = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
                var totalAmount = invoicesInYear
                    .Where(i => i.DateOfIssue.Month == month)
                    .Sum(i => i.Total);

                result.MonthlyStats.Add(new MonthlyDataPointDto
                {
                    Year = year,
                    Month = month,
                    MonthName = monthStart.ToString("MMMM", CultureInfo.InvariantCulture),
                    TotalAmount = totalAmount,
                    InvoiceCount = 0 // This endpoint is for earnings only
                });
            }
            return result;
        }

        public async Task<AnnualBreakdownDto> GetAnnualInvoiceCountBreakdownAsync(int year, int userId)
        {
            var result = new AnnualBreakdownDto();
            
            // Filter only actual invoices (exclude Proforma ID=3, Quotation ID=4)
            var invoicesInYear = await _context.Invoices
                .Where(i => !i.IsDeleted 
                    && i.DateOfIssue.Year == year 
                    && i.UserId == userId
                    && i.DocumentTypeId != 3  // Exclude Proforma
                    && i.DocumentTypeId != 4) // Exclude Quotation
                .ToListAsync();

            for (int month = 1; month <= 12; month++)
            {
                var monthStart = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
                var invoiceCount = invoicesInYear
                    .Count(i => i.DateOfIssue.Month == month);

                result.MonthlyStats.Add(new MonthlyDataPointDto
                {
                    Year = year,
                    Month = month,
                    MonthName = monthStart.ToString("MMMM", CultureInfo.InvariantCulture),
                    TotalAmount = 0, // This endpoint is for counts only
                    InvoiceCount = invoiceCount
                });
            }
            return result;
        }

        public async Task<InvoiceStatusStatsDto> GetInvoiceStatusStatsAsync(int userId)
        {
            // Get user's currency preference
            var user = await _context.Users.FindAsync(userId);
            var currencySymbol = user?.Currency switch
            {
                "USD" => "$",
                "GBP" => "£",
                "EUR" => "€",
                "JPY" => "¥",
                _ => "€"
            };

            var today = DateTime.UtcNow;
            
            // Filter only actual invoices (exclude Proforma & Quotation)
            var invoices = await _context.Invoices
                .Where(i => !i.IsDeleted 
                    && i.UserId == userId
                    && i.DocumentTypeId != 3
                    && i.DocumentTypeId != 4)
                .ToListAsync();

            // Status IDs: 1=Draft, 2=Unpaid, 3=Paid, 4=Deleted, 5=Overdue
            var paidInvoices = invoices.Where(i => i.StatusId == 3).ToList();
            var pendingInvoices = invoices.Where(i => i.StatusId == 2 && i.DueDate >= today).ToList();
            var overdueInvoices = invoices.Where(i => i.StatusId == 5 || (i.StatusId == 2 && i.DueDate < today)).ToList();
            var draftInvoices = invoices.Where(i => i.StatusId == 1).ToList();

            // Overdue aging
            var overdue1to30 = overdueInvoices.Where(i => (today - i.DueDate).Days <= 30).ToList();
            var overdue31to60 = overdueInvoices.Where(i => (today - i.DueDate).Days > 30 && (today - i.DueDate).Days <= 60).ToList();
            var overdue60Plus = overdueInvoices.Where(i => (today - i.DueDate).Days > 60).ToList();

            // Calculate average days to payment for paid invoices
            var paidWithDates = paidInvoices.Where(i => i.DateOfIssue != default).ToList();
            var avgDaysToPayment = paidWithDates.Any()
                ? paidWithDates.Average(i => (i.DateOfIssue.AddDays(30) - i.DateOfIssue).Days) // Simplified calculation
                : 0;

            // Payment success rate
            var totalInvoices = invoices.Count(i => i.StatusId != 1); // Exclude drafts
            var paymentSuccessRate = totalInvoices > 0
                ? (decimal)paidInvoices.Count / totalInvoices * 100
                : 0;

            return new InvoiceStatusStatsDto
            {
                PaidCount = paidInvoices.Count,
                PaidAmount = paidInvoices.Sum(i => i.Total),
                PendingCount = pendingInvoices.Count,
                PendingAmount = pendingInvoices.Sum(i => i.Total),
                OverdueCount = overdueInvoices.Count,
                OverdueAmount = overdueInvoices.Sum(i => i.Total),
                DraftCount = draftInvoices.Count,
                DraftAmount = draftInvoices.Sum(i => i.Total),
                Overdue1to30Days = overdue1to30.Count,
                Overdue1to30Amount = overdue1to30.Sum(i => i.Total),
                Overdue31to60Days = overdue31to60.Count,
                Overdue31to60Amount = overdue31to60.Sum(i => i.Total),
                Overdue60PlusDays = overdue60Plus.Count,
                Overdue60PlusAmount = overdue60Plus.Sum(i => i.Total),
                AverageDaysToPayment = (decimal)avgDaysToPayment,
                PaymentSuccessRate = paymentSuccessRate,
                CurrencySymbol = currencySymbol
            };
        }

        public async Task<ClientPerformanceStatsDto> GetClientPerformanceStatsAsync(int userId, int topCount = 10)
        {
            // Get user's currency preference
            var user = await _context.Users.FindAsync(userId);
            var currencySymbol = user?.Currency switch
            {
                "USD" => "$",
                "GBP" => "£",
                "EUR" => "€",
                "JPY" => "¥",
                _ => "€"
            };

            var currentMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            // Filter only actual invoices (not proforma or quotations)
            var invoices = await _context.Invoices
                .Include(i => i.Client)
                .Where(i => !i.IsDeleted 
                    && i.UserId == userId
                    && i.DocumentTypeId != 3  // Exclude Proforma
                    && i.DocumentTypeId != 4) // Exclude Quotation
                .ToListAsync();

            // Filter to only invoices with clients for the ranking table
            var invoicesWithClients = invoices
                .Where(i => i.ClientId != null)
                .ToList();

            var clients = await _context.Clients
                .Where(c => !c.IsDeleted && c.UserId == userId)
                .ToListAsync();

            // Group by client and calculate metrics
            var clientStats = invoicesWithClients
                .GroupBy(i => new { i.ClientId, i.Client })
                .Select(g => new TopClientDto
                {
                    ClientId = g.Key.ClientId ?? 0,
                    ClientName = g.Key.Client?.Name ?? "Unknown",
                    ClientEmail = g.Key.Client?.Email ?? "",
                    TotalRevenue = g.Sum(i => i.Total),
                    InvoiceCount = g.Count(),
                    AverageInvoiceValue = g.Average(i => i.Total),
                    LastInvoiceDate = g.Max(i => i.DateOfIssue),
                    // Calculate payment time based on DueDate and current date for paid invoices
                    // Note: This is an approximation since we don't track actual payment date
                    AverageDaysToPayment = (decimal)g
                        .Where(i => i.StatusId == 2) // Paid invoices (StatusId 2 = Paid)
                        .Select(i => (i.DueDate - i.DateOfIssue).TotalDays)
                        .DefaultIfEmpty(0)
                        .Average()
                })
                .OrderByDescending(c => c.TotalRevenue)
                .Take(topCount)
                .ToList();

            var activeClients = clients.Count(c => c.IsActive);
            var newClientsThisMonth = clients.Count(c => c.DateEntered >= currentMonthStart);
            var avgRevenuePerClient = clients.Count > 0 ? invoices.Sum(i => i.Total) / clients.Count : 0;
            
            // Calculate overall average payment time from all paid invoices
            var overallAvgPaymentTime = invoices
                .Where(i => i.StatusId == 2) // Paid invoices
                .Select(i => (i.DueDate - i.DateOfIssue).TotalDays)
                .DefaultIfEmpty(0)
                .Average();

            return new ClientPerformanceStatsDto
            {
                TopClientsByRevenue = clientStats,
                TotalClients = clients.Count,
                ActiveClients = activeClients,
                NewClientsThisMonth = newClientsThisMonth,
                AverageRevenuePerClient = avgRevenuePerClient,
                AverageDaysToPayment = (decimal)overallAvgPaymentTime,
                CurrencySymbol = currencySymbol
            };
        }

        public async Task<ProductPerformanceStatsDto> GetProductPerformanceStatsAsync(int userId, int topCount = 10)
        {
            // Get user's currency preference
            var user = await _context.Users.FindAsync(userId);
            var currencySymbol = user?.Currency switch
            {
                "USD" => "$",
                "GBP" => "£",
                "EUR" => "€",
                "JPY" => "¥",
                _ => "€"
            };

            // Get invoice items with product details
            var invoiceItems = await _context.InvoiceItems
                .Include(ii => ii.Invoice)
                .Include(ii => ii.Product!)
                    .ThenInclude(p => p.Category!)
                .Where(ii => !ii.Invoice.IsDeleted 
                    && ii.Invoice.UserId == userId
                    && ii.Invoice.DocumentTypeId != 3
                    && ii.Invoice.DocumentTypeId != 4
                    && ii.ProductId != null)
                .ToListAsync();

            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => !p.IsDeleted && p.UserId == userId)
                .ToListAsync();

            // Top products by revenue
            var topProducts = invoiceItems
                .GroupBy(ii => new { ii.ProductId, ii.Product })
                .Select(g => new TopProductDto
                {
                    ProductId = g.Key.ProductId ?? 0,
                    ProductName = g.Key.Product?.Name ?? "Unknown",
                    TotalRevenue = g.Sum(ii => ii.Quantity * ii.UnitPrice),
                    QuantitySold = g.Sum(ii => ii.Quantity),
                    AveragePrice = g.Average(ii => ii.UnitPrice),
                    IsService = !(g.Key.Product?.TrackInventory ?? true), // Service = not trackable
                    CategoryName = g.Key.Product?.Category?.Name ?? "Uncategorized",
                    StockQuantity = g.Key.Product?.StockQuantity ?? 0
                })
                .OrderByDescending(p => p.TotalRevenue)
                .Take(topCount)
                .ToList();

            // Revenue by category
            var categoryRevenue = invoiceItems
                .Where(ii => ii.Product != null)
                .GroupBy(ii => new { ii.Product!.CategoryId, ii.Product.Category })
                .Select(g => new CategoryRevenueDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Category?.Name ?? "Uncategorized",
                    TotalRevenue = g.Sum(ii => ii.Quantity * ii.UnitPrice),
                    ProductCount = g.Select(ii => ii.ProductId).Distinct().Count(),
                    ItemsSold = g.Sum(ii => ii.Quantity)
                })
                .OrderByDescending(c => c.TotalRevenue)
                .ToList();

            var totalProductRevenue = invoiceItems.Where(ii => ii.Product?.TrackInventory == true).Sum(ii => ii.Quantity * ii.UnitPrice);
            var totalServiceRevenue = invoiceItems.Where(ii => ii.Product?.TrackInventory == false).Sum(ii => ii.Quantity * ii.UnitPrice);
            var lowStockProducts = products.Count(p => p.TrackInventory && p.StockQuantity <= p.MinStockLevel);

            return new ProductPerformanceStatsDto
            {
                TopProductsByRevenue = topProducts,
                RevenueByCategory = categoryRevenue,
                TotalProducts = products.Count,
                ActiveProducts = products.Count(p => p.IsActive),
                LowStockProducts = lowStockProducts,
                TotalProductRevenue = totalProductRevenue,
                TotalServiceRevenue = totalServiceRevenue,
                CurrencySymbol = currencySymbol
            };
        }
    }
}
