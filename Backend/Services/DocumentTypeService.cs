using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Services
{
    public class DocumentTypeService : IDocumentTypeService
    {
        private readonly ApplicationDbContext _context;

        public DocumentTypeService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DocumentTypeDto>> GetAllDocumentTypesAsync()
        {
            var documentTypes = await _context.DocumentTypes
                .Where(dt => dt.IsActive)
                .OrderBy(dt => dt.Name)
                .ToListAsync();

            return documentTypes.Select(MapToDto);
        }

        public async Task<DocumentTypeDto?> GetDocumentTypeByIdAsync(int id)
        {
            var documentType = await _context.DocumentTypes
                .FirstOrDefaultAsync(dt => dt.Id == id && dt.IsActive);

            return documentType != null ? MapToDto(documentType) : null;
        }

        public async Task<DocumentTypeDto?> GetDocumentTypeByCodeAsync(string code)
        {
            var documentType = await _context.DocumentTypes
                .FirstOrDefaultAsync(dt => dt.Code == code && dt.IsActive);

            return documentType != null ? MapToDto(documentType) : null;
        }

        private static DocumentTypeDto MapToDto(DocumentType documentType)
        {
            return new DocumentTypeDto
            {
                Id = documentType.Id,
                Name = documentType.Name,
                Description = documentType.Description,
                Code = documentType.Code,
                NumberPrefix = documentType.NumberPrefix,
                DisplayName = documentType.DisplayName,
                RequiresTaxInfo = documentType.RequiresTaxInfo,
                IsQuotation = documentType.IsQuotation,
                IsProforma = documentType.IsProforma,
                IsActive = documentType.IsActive
            };
        }
    }
}
