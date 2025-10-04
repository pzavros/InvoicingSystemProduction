// Interfaces/IReportService.cs
using System.IO;
using System.Threading.Tasks;
using InvoicingBackend.DTOs;

namespace InvoicingBackend.Interfaces
{
    public interface IReportService
    {
        Task<Stream> GenerateLogisticsReportAsync(ReportFilterDto filter);
    }
}