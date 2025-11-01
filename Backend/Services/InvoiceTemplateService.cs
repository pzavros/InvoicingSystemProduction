using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Services
{
    public class InvoiceTemplateService : IInvoiceTemplateService
    {
        private readonly ApplicationDbContext _context;

        public InvoiceTemplateService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<InvoiceTemplateDto>> GetUserTemplatesAsync(int userId)
        {
            var allTemplates = await _context.InvoiceTemplates
                .Include(t => t.DocumentType)
                .Where(t => t.UserId == userId || t.IsSystemTemplate)
                .OrderByDescending(t => t.IsActive)
                .ThenByDescending(t => t.DateEntered)
                .ToListAsync();

            // Find which document types have active user templates
            var documentTypesWithActiveUserTemplates = allTemplates
                .Where(t => t.UserId == userId && t.IsActive)
                .Select(t => t.DocumentTypeId)
                .Distinct()
                .ToHashSet();

            // Process templates: 
            // - Include all user templates as-is
            // - Include system templates but mark as inactive if there's an active user template for that document type
            var processedTemplates = allTemplates.Select(t =>
            {
                // If it's a user template, return as-is
                if (t.UserId == userId)
                {
                    return t;
                }
                
                // If it's a system template and there's an active user template for this document type,
                // mark the system template as inactive (create a copy for display)
                if (t.IsSystemTemplate && documentTypesWithActiveUserTemplates.Contains(t.DocumentTypeId))
                {
                    return new InvoiceTemplate
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Description = t.Description,
                        TemplateData = t.TemplateData,
                        DocumentTypeId = t.DocumentTypeId,
                        DocumentType = t.DocumentType,
                        IsSystemTemplate = t.IsSystemTemplate,
                        IsActive = false, // Override to inactive
                        PreviewImage = t.PreviewImage,
                        DateEntered = t.DateEntered,
                        UserId = t.UserId,
                        EnteredBy = t.EnteredBy
                    };
                }
                
                // Otherwise return the system template as-is (active by default)
                return t;
            })
            .OrderByDescending(t => t.IsActive)
            .ThenByDescending(t => t.DateEntered)
            .ToList();

            return processedTemplates.Select(MapToDto);
        }

        public async Task<InvoiceTemplateDto?> GetTemplateByIdAsync(int templateId, int userId)
        {
            var template = await _context.InvoiceTemplates
                .Include(t => t.DocumentType)
                .FirstOrDefaultAsync(t => t.Id == templateId && (t.UserId == userId || t.IsSystemTemplate));

            return template != null ? MapToDto(template) : null;
        }

        public async Task<InvoiceTemplateDto?> GetActiveTemplateAsync(int userId)
        {
            // First, try to get user's active template
            var activeTemplate = await _context.InvoiceTemplates
                .Include(t => t.DocumentType)
                .FirstOrDefaultAsync(t => t.UserId == userId && t.IsActive);

            if (activeTemplate != null)
            {
                return MapToDto(activeTemplate);
            }

            // If no user template is active, return the first system template as fallback
            var fallbackTemplate = await _context.InvoiceTemplates
                .Include(t => t.DocumentType)
                .FirstOrDefaultAsync(t => t.IsSystemTemplate);

            return fallbackTemplate != null ? MapToDto(fallbackTemplate) : null;
        }

        public async Task<InvoiceTemplateDto> CreateTemplateAsync(CreateInvoiceTemplateDto createDto, int userId)
        {
            var template = new InvoiceTemplate
            {
                Name = createDto.Name,
                Description = createDto.Description,
                TemplateData = createDto.TemplateData,
                DocumentTypeId = createDto.DocumentTypeId,
                PreviewImage = createDto.PreviewImage,
                UserId = userId,
                IsActive = false,
                IsSystemTemplate = false,
                DateEntered = DateTime.UtcNow,
                EnteredBy = userId.ToString()
            };

            _context.InvoiceTemplates.Add(template);
            await _context.SaveChangesAsync();

            return MapToDto(template);
        }

        public async Task<InvoiceTemplateDto?> UpdateTemplateAsync(int templateId, UpdateInvoiceTemplateDto updateDto, int userId)
        {
            var template = await _context.InvoiceTemplates
                .FirstOrDefaultAsync(t => t.Id == templateId && t.UserId == userId);

            if (template == null || template.IsSystemTemplate)
                return null;

            template.Name = updateDto.Name;
            template.Description = updateDto.Description;
            template.TemplateData = updateDto.TemplateData;
            template.DocumentTypeId = updateDto.DocumentTypeId;
            template.PreviewImage = updateDto.PreviewImage;
            template.DateModified = DateTime.UtcNow;
            template.ModifiedBy = userId.ToString();

            await _context.SaveChangesAsync();
            return MapToDto(template);
        }

        public async Task<bool> DeleteTemplateAsync(int templateId, int userId)
        {
            var template = await _context.InvoiceTemplates
                .FirstOrDefaultAsync(t => t.Id == templateId && t.UserId == userId);

            if (template == null || template.IsSystemTemplate)
                return false;

            _context.InvoiceTemplates.Remove(template);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetActiveTemplateAsync(int templateId, int userId)
        {
            // Get the selected template first to know its document type
            var selectedTemplate = await _context.InvoiceTemplates
                .Include(t => t.DocumentType)
                .FirstOrDefaultAsync(t => t.Id == templateId && (t.UserId == userId || t.IsSystemTemplate));

            if (selectedTemplate == null)
                return false;

            // Deactivate ALL user templates (not system templates) of the same document type
            var userTemplatesToDeactivate = await _context.InvoiceTemplates
                .Where(t => t.UserId == userId && 
                           t.DocumentTypeId == selectedTemplate.DocumentTypeId && 
                           !t.IsSystemTemplate &&
                           t.IsActive)
                .ToListAsync();

            foreach (var template in userTemplatesToDeactivate)
            {
                template.IsActive = false;
            }

            // If it's a system template, create a user copy instead of modifying the original
            if (selectedTemplate.IsSystemTemplate)
            {
                var userCopy = new InvoiceTemplate
                {
                    Name = selectedTemplate.Name,
                    Description = selectedTemplate.Description,
                    TemplateData = selectedTemplate.TemplateData,
                    DocumentTypeId = selectedTemplate.DocumentTypeId,
                    IsActive = true,
                    IsSystemTemplate = false,
                    UserId = userId,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = $"User-{userId}"
                };

                _context.InvoiceTemplates.Add(userCopy);
            }
            else
            {
                // If it's already a user template, just activate it
                selectedTemplate.IsActive = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<InvoiceTemplateDto>> GetSystemTemplatesAsync()
        {
            var systemTemplates = await _context.InvoiceTemplates
                .Include(t => t.DocumentType)
                .Where(t => t.IsSystemTemplate)
                .OrderBy(t => t.Name)
                .ToListAsync();

            return systemTemplates.Select(MapToDto);
        }

        public async Task<InvoiceTemplateDto?> GetActiveTemplateByDocumentTypeAsync(int userId, int? documentTypeId = null)
        {
            Console.WriteLine($"GetActiveTemplateByDocumentTypeAsync called with userId: {userId}, documentTypeId: {documentTypeId}");
            
            // First, try to get user's active template for the specific document type
            var activeTemplate = await _context.InvoiceTemplates
                .Include(t => t.DocumentType)
                .Where(t => t.UserId == userId && t.IsActive && t.DocumentTypeId == documentTypeId)
                .FirstOrDefaultAsync();

            Console.WriteLine($"Found user active template: {activeTemplate?.Name ?? "None"}");

            if (activeTemplate != null)
            {
                return MapToDto(activeTemplate);
            }

            // If no user template is active, fallback to system template for this document type (regardless of IsActive)
            var systemTemplate = await _context.InvoiceTemplates
                .Include(t => t.DocumentType)
                .Where(t => t.IsSystemTemplate && t.DocumentTypeId == documentTypeId)
                .OrderBy(t => t.Name) // Get the first one if multiple exist
                .FirstOrDefaultAsync();

            Console.WriteLine($"Found system template: {systemTemplate?.Name ?? "None"}");

            // If we found a system template, return it even if it's not marked as active
            if (systemTemplate != null)
            {
                return MapToDto(systemTemplate);
            }

            // Last fallback: if no template exists for this document type, get any system template as default
            var fallbackSystemTemplate = await _context.InvoiceTemplates
                .Include(t => t.DocumentType)
                .Where(t => t.IsSystemTemplate)
                .OrderBy(t => t.Name)
                .FirstOrDefaultAsync();

            Console.WriteLine($"Found fallback system template: {fallbackSystemTemplate?.Name ?? "None"}");

            return fallbackSystemTemplate != null ? MapToDto(fallbackSystemTemplate) : null;
        }

        public async Task<IEnumerable<InvoiceTemplateDto>> GetTemplatesByDocumentTypeAsync(int userId, int? documentTypeId = null)
        {
            var templates = await _context.InvoiceTemplates
                .Include(t => t.DocumentType)
                .Where(t => (t.UserId == userId || t.IsSystemTemplate) && t.DocumentTypeId == documentTypeId)
                .OrderBy(t => t.Name)
                .ToListAsync();

            return templates.Select(MapToDto);
        }

        private static InvoiceTemplateDto MapToDto(InvoiceTemplate template)
        {
            return new InvoiceTemplateDto
            {
                Id = template.Id,
                Name = template.Name,
                Description = template.Description,
                TemplateData = template.TemplateData,
                IsActive = template.IsActive,
                IsSystemTemplate = template.IsSystemTemplate,
                DocumentTypeId = template.DocumentTypeId,
                DocumentTypeName = template.DocumentType?.Name,
                PreviewImage = template.PreviewImage,
                DateEntered = template.DateEntered
            };
        }
    }
}
