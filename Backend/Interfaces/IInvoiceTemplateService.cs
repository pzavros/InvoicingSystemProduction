using InvoicingBackend.DTOs;

namespace InvoicingBackend.Interfaces
{
    public interface IInvoiceTemplateService
    {
        Task<IEnumerable<InvoiceTemplateDto>> GetUserTemplatesAsync(int userId);
        Task<InvoiceTemplateDto?> GetTemplateByIdAsync(int templateId, int userId);
        Task<InvoiceTemplateDto?> GetActiveTemplateAsync(int userId);
        Task<InvoiceTemplateDto> CreateTemplateAsync(CreateInvoiceTemplateDto createDto, int userId);
        Task<InvoiceTemplateDto?> UpdateTemplateAsync(int templateId, UpdateInvoiceTemplateDto updateDto, int userId);
        Task<bool> DeleteTemplateAsync(int templateId, int userId);
        Task<bool> SetActiveTemplateAsync(int templateId, int userId);
        Task<IEnumerable<InvoiceTemplateDto>> GetSystemTemplatesAsync();
    }
}
