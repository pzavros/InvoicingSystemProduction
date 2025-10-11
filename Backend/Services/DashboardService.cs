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

            var invoices = _context.Invoices.Where(i => !i.IsDeleted && i.UserId == userId);

            var stats = new MonthlyDashboardStatsDto
            {
                TotalAmountSelectedMonthYear = await invoices
                    .Where(i => i.DateOfIssue >= monthStart && i.DateOfIssue < monthEnd)
                    .SumAsync(i => i.Total),
                InvoiceCountSelectedMonthYear = await invoices
                    .CountAsync(i => i.DateOfIssue >= monthStart && i.DateOfIssue < monthEnd)
            };

            return stats;
        }

        public async Task<AnnualBreakdownDto> GetAnnualEarningsBreakdownAsync(int year, int userId)
        {
            var result = new AnnualBreakdownDto();
            var invoicesInYear = await _context.Invoices
                .Where(i => !i.IsDeleted && i.DateOfIssue.Year == year && i.UserId == userId)
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
            var invoicesInYear = await _context.Invoices
                .Where(i => !i.IsDeleted && i.DateOfIssue.Year == year && i.UserId == userId)
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
    }
}
