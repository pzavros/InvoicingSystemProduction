using InvoicingBackend.Data;
using InvoicingBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Services
{
    public static class DocumentTypeSeeder
    {
        public static async Task SeedDocumentTypesAsync(ApplicationDbContext context)
        {
            // Check if document types already exist
            if (await context.DocumentTypes.AnyAsync())
                return;

            var documentTypes = new[]
            {
                new DocumentType
                {
                    Name = "Invoice",
                    Description = "Standard invoice for completed goods or services",
                    Code = "INV",
                    NumberPrefix = "INV-",
                    DisplayName = "Invoice",
                    RequiresTaxInfo = false,
                    IsQuotation = false,
                    IsProforma = false,
                    IsActive = true,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System"
                },
                new DocumentType
                {
                    Name = "Tax Invoice",
                    Description = "Invoice with detailed tax information for business transactions",
                    Code = "TAX",
                    NumberPrefix = "TAX-",
                    DisplayName = "Tax Invoice",
                    RequiresTaxInfo = true,
                    IsQuotation = false,
                    IsProforma = false,
                    IsActive = true,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System"
                },
                new DocumentType
                {
                    Name = "Proforma Invoice",
                    Description = "Preliminary bill sent before work is completed or goods are delivered",
                    Code = "PRO",
                    NumberPrefix = "PRO-",
                    DisplayName = "Proforma Invoice",
                    RequiresTaxInfo = false,
                    IsQuotation = false,
                    IsProforma = true,
                    IsActive = true,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System"
                },
                new DocumentType
                {
                    Name = "Quotation",
                    Description = "Price quote for potential goods or services",
                    Code = "QUO",
                    NumberPrefix = "QUO-",
                    DisplayName = "Quotation",
                    RequiresTaxInfo = false,
                    IsQuotation = true,
                    IsProforma = false,
                    IsActive = true,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System"
                }
            };

            context.DocumentTypes.AddRange(documentTypes);
            await context.SaveChangesAsync();
        }
    }
}
