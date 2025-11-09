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
        
        // New dashboard analytics
        Task<InvoiceStatusStatsDto> GetInvoiceStatusStatsAsync(int userId);
        Task<ClientPerformanceStatsDto> GetClientPerformanceStatsAsync(int userId, int topCount = 10);
        Task<ProductPerformanceStatsDto> GetProductPerformanceStatsAsync(int userId, int topCount = 10);
    }
}
