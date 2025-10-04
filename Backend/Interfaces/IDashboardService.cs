using InvoicingBackend.DTOs;
using System.Threading.Tasks;
using System.Collections.Generic; // Added for List

namespace InvoicingBackend.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync(int userId);
        Task<MonthlyDashboardStatsDto> GetDashboardStatsForMonthYearAsync(int month, int year, int userId);
        Task<AnnualBreakdownDto> GetAnnualEarningsBreakdownAsync(int year, int userId);
        Task<AnnualBreakdownDto> GetAnnualInvoiceCountBreakdownAsync(int year, int userId);
    }
}
