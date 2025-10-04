// Interfaces/IInvoiceService.cs
using InvoicingBackend.DTOs;
using InvoicingBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InvoicingBackend.Interfaces
{
    public interface IInvoiceService
    {
        Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync(int userId);
        Task<InvoiceDto> GetInvoiceById(int id, int userId);
        Task<Invoice> CreateInvoiceAsync(InvoiceDto invoiceDto, int userId);
        Task<bool> UpdateInvoiceAsync(int id, InvoiceDto invoiceDto, int userId);
        Task<bool> DeleteInvoiceAsync(int id, int userId);
        Task<IEnumerable<Currency>> GetCurrenciesAsync();
        Task<IEnumerable<StatusDto>> GetAllStatusesAsync();
        Task<bool> UpdateInvoiceStatusAsync(int id, int statusId, int userId);
        Task<bool> UpdateBulkInvoiceStatusAsync(IEnumerable<int> invoiceIds, int statusId, int userId);
    }
}