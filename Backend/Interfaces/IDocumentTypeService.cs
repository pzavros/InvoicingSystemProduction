using InvoicingBackend.DTOs;

namespace InvoicingBackend.Interfaces
{
    public interface IDocumentTypeService
    {
        Task<IEnumerable<DocumentTypeDto>> GetAllDocumentTypesAsync();
        Task<DocumentTypeDto?> GetDocumentTypeByIdAsync(int id);
        Task<DocumentTypeDto?> GetDocumentTypeByCodeAsync(string code);
    }
}
