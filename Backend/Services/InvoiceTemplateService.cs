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
            var templates = await _context.InvoiceTemplates
                .Where(t => t.UserId == userId || t.IsSystemTemplate)
                .OrderByDescending(t => t.IsActive)
                .ThenByDescending(t => t.DateEntered)
                .ToListAsync();

            return templates.Select(MapToDto);
        }

        public async Task<InvoiceTemplateDto?> GetTemplateByIdAsync(int templateId, int userId)
        {
            var template = await _context.InvoiceTemplates
                .FirstOrDefaultAsync(t => t.Id == templateId && (t.UserId == userId || t.IsSystemTemplate));

            return template != null ? MapToDto(template) : null;
        }

        public async Task<InvoiceTemplateDto?> GetActiveTemplateAsync(int userId)
        {
            var activeTemplate = await _context.InvoiceTemplates
                .FirstOrDefaultAsync(t => t.UserId == userId && t.IsActive);

            return activeTemplate != null ? MapToDto(activeTemplate) : null;
        }

        public async Task<InvoiceTemplateDto> CreateTemplateAsync(CreateInvoiceTemplateDto createDto, int userId)
        {
            var template = new InvoiceTemplate
            {
                Name = createDto.Name,
                Description = createDto.Description,
                TemplateData = createDto.TemplateData,
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
            // First, deactivate all user templates
            var userTemplates = await _context.InvoiceTemplates
                .Where(t => t.UserId == userId)
                .ToListAsync();

            foreach (var template in userTemplates)
            {
                template.IsActive = false;
            }

            // Then activate the selected template
            var selectedTemplate = await _context.InvoiceTemplates
                .FirstOrDefaultAsync(t => t.Id == templateId && (t.UserId == userId || t.IsSystemTemplate));

            if (selectedTemplate == null)
                return false;

            // If it's a system template, create a copy for the user
            if (selectedTemplate.IsSystemTemplate)
            {
                var userTemplate = new InvoiceTemplate
                {
                    Name = selectedTemplate.Name + " (Copy)",
                    Description = selectedTemplate.Description,
                    TemplateData = selectedTemplate.TemplateData,
                    PreviewImage = selectedTemplate.PreviewImage,
                    UserId = userId,
                    IsActive = true,
                    IsSystemTemplate = false,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = userId.ToString()
                };

                _context.InvoiceTemplates.Add(userTemplate);
            }
            else
            {
                selectedTemplate.IsActive = true;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<InvoiceTemplateDto>> GetSystemTemplatesAsync()
        {
            var systemTemplates = await _context.InvoiceTemplates
                .Where(t => t.IsSystemTemplate)
                .OrderBy(t => t.Name)
                .ToListAsync();

            return systemTemplates.Select(MapToDto);
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
                PreviewImage = template.PreviewImage,
                DateEntered = template.DateEntered
            };
        }
    }
}
