using InvoicingBackend.Data;
using InvoicingBackend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace InvoicingBackend.Services
{
    public static class InvoiceTemplateSeeder
    {
        public static async Task SeedInvoiceTemplatesAsync(ApplicationDbContext context)
        {
            // Check if system templates already exist
            if (await context.InvoiceTemplates.AnyAsync(t => t.IsSystemTemplate))
            {
                return; // Templates already seeded
            }

            // Get all document types from database (to handle different IDs across environments)
            var documentTypes = await context.DocumentTypes.ToDictionaryAsync(dt => dt.Name, dt => dt.Id);

            // Simple base template configuration - white background, professional blue theme
            var baseTemplateConfig = new
            {
                theme = "simple",
                primaryColor = "#1e40af", // Professional blue
                secondaryColor = "#ffffff",
                accentColor = "#3b82f6", // Lighter blue for accents
                headerStyle = "simple",
                logoPosition = "left",
                companyInfoPosition = "right",
                showCompanyBackground = false,
                tableStyle = "simple",
                borderStyle = "minimal",
                fontFamily = "Arial, sans-serif",
                layout = new
                {
                    headerHeight = "100px",
                    spacing = "normal",
                    margins = "20px",
                    borderRadius = "0px"
                },
                sections = new
                {
                    showCompanyLogo = true,
                    showCompanyDetails = true,
                    showBankDetails = true,
                    showNotes = true,
                    showTerms = false,
                    highlightTotals = false,
                    showAmountDueBox = true,
                    showDisclaimer = false,
                    disclaimerText = ""
                },
                styling = new
                {
                    headerTextColor = "#1e40af", // Professional blue for headers
                    bodyTextColor = "#374151", // Dark gray for body text
                    labelColor = "#6b7280", // Medium gray for labels
                    totalBackgroundColor = "#eff6ff", // Light blue background for totals
                    tableHeaderBackground = "#dbeafe", // Very light blue for table headers
                    borderColor = "#3b82f6", // Blue borders
                    lineStyle = "solid"
                },
                typography = new
                {
                    headerFontSize = "24px",
                    bodyFontSize = "14px",
                    labelFontSize = "12px",
                    fontWeight = "normal",
                    lineHeight = "1.5"
                }
            };

            // Quotation-specific config with disclaimer
            var quotationTemplateConfig = new
            {
                theme = "simple",
                primaryColor = "#1e40af", // Professional blue
                secondaryColor = "#ffffff",
                accentColor = "#3b82f6", // Lighter blue for accents
                headerStyle = "simple",
                logoPosition = "left",
                companyInfoPosition = "right",
                showCompanyBackground = false,
                tableStyle = "simple",
                borderStyle = "minimal",
                fontFamily = "Arial, sans-serif",
                layout = new
                {
                    headerHeight = "100px",
                    spacing = "normal",
                    margins = "20px",
                    borderRadius = "0px"
                },
                sections = new
                {
                    showCompanyLogo = true,
                    showCompanyDetails = true,
                    showBankDetails = true,
                    showNotes = true,
                    showTerms = false,
                    highlightTotals = false,
                    showAmountDueBox = true,
                    showDisclaimer = true,
                    disclaimerText = "Disclaimer: This quotation is provided for informational purposes only and does not constitute a tax invoice. Prices and VAT (if applicable) are indicative and subject to change before confirmation of order."
                },
                styling = new
                {
                    headerTextColor = "#1e40af", // Professional blue for headers
                    bodyTextColor = "#374151", // Dark gray for body text
                    labelColor = "#6b7280", // Medium gray for labels
                    totalBackgroundColor = "#eff6ff", // Light blue background for totals
                    tableHeaderBackground = "#dbeafe", // Very light blue for table headers
                    borderColor = "#3b82f6", // Blue borders
                    lineStyle = "solid"
                },
                typography = new
                {
                    headerFontSize = "24px",
                    bodyFontSize = "14px",
                    labelFontSize = "12px",
                    fontWeight = "normal",
                    lineHeight = "1.5"
                }
            };

            // Proforma-specific config with disclaimer
            var proformaTemplateConfig = new
            {
                theme = "simple",
                primaryColor = "#1e40af", // Professional blue
                secondaryColor = "#ffffff",
                accentColor = "#3b82f6", // Lighter blue for accents
                headerStyle = "simple",
                logoPosition = "left",
                companyInfoPosition = "right",
                showCompanyBackground = false,
                tableStyle = "simple",
                borderStyle = "minimal",
                fontFamily = "Arial, sans-serif",
                layout = new
                {
                    headerHeight = "100px",
                    spacing = "normal",
                    margins = "20px",
                    borderRadius = "0px"
                },
                sections = new
                {
                    showCompanyLogo = true,
                    showCompanyDetails = true,
                    showBankDetails = true,
                    showNotes = true,
                    showTerms = false,
                    highlightTotals = false,
                    showAmountDueBox = true,
                    showDisclaimer = true,
                    disclaimerText = "Disclaimer: This is a proforma invoice issued for prepayment or customs purposes only. It is not a tax invoice and should not be used for accounting or VAT deduction. A final tax invoice will be issued upon payment or completion of the order."
                },
                styling = new
                {
                    headerTextColor = "#1e40af", // Professional blue for headers
                    bodyTextColor = "#374151", // Dark gray for body text
                    labelColor = "#6b7280", // Medium gray for labels
                    totalBackgroundColor = "#eff6ff", // Light blue background for totals
                    tableHeaderBackground = "#dbeafe", // Very light blue for table headers
                    borderColor = "#3b82f6", // Blue borders
                    lineStyle = "solid"
                },
                typography = new
                {
                    headerFontSize = "24px",
                    bodyFontSize = "14px",
                    labelFontSize = "12px",
                    fontWeight = "normal",
                    lineHeight = "1.5"
                }
            };

            var templates = new List<InvoiceTemplate>
            {
                // 1. Standard Invoice Template
                new InvoiceTemplate
                {
                    Name = "Standard Invoice",
                    Description = "Professional template for standard invoices. Clean white background with professional blue accents.",
                    DocumentTypeId = documentTypes["Invoice"],
                    IsSystemTemplate = true,
                    IsActive = true, // Set as default active
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System",
                    UserId = null,
                    TemplateData = JsonSerializer.Serialize(baseTemplateConfig, new JsonSerializerOptions { WriteIndented = true })
                },

                // 2. Tax Invoice Template
                new InvoiceTemplate
                {
                    Name = "Tax Invoice",
                    Description = "Professional template for tax invoices. Clean white background with professional blue accents.",
                    DocumentTypeId = documentTypes["Tax Invoice"],
                    IsSystemTemplate = true,
                    IsActive = true,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System",
                    UserId = null,
                    TemplateData = JsonSerializer.Serialize(baseTemplateConfig, new JsonSerializerOptions { WriteIndented = true })
                },

                // 3. Proforma Invoice Template
                new InvoiceTemplate
                {
                    Name = "Proforma Invoice",
                    Description = "Professional template for proforma invoices. Clean white background with professional blue accents.",
                    DocumentTypeId = documentTypes["Proforma"],
                    IsSystemTemplate = true,
                    IsActive = true,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System",
                    UserId = null,
                    TemplateData = JsonSerializer.Serialize(proformaTemplateConfig, new JsonSerializerOptions { WriteIndented = true })
                },

                // 4. Quotation Template
                new InvoiceTemplate
                {
                    Name = "Quotation",
                    Description = "Professional template for quotations. Clean white background with professional blue accents.",
                    DocumentTypeId = documentTypes["Quotation"],
                    IsSystemTemplate = true,
                    IsActive = true,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System",
                    UserId = null,
                    TemplateData = JsonSerializer.Serialize(quotationTemplateConfig, new JsonSerializerOptions { WriteIndented = true })
                },

                // 5. Cash Invoice Template
                new InvoiceTemplate
                {
                    Name = "Cash Invoice",
                    Description = "Professional template for cash invoices. Clean white background with professional blue accents.",
                    DocumentTypeId = documentTypes["Cash Invoice"],
                    IsSystemTemplate = true,
                    IsActive = true,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System",
                    UserId = null,
                    TemplateData = JsonSerializer.Serialize(new
                    {
                        type = "cash",
                        theme = baseTemplateConfig.theme,
                        primaryColor = baseTemplateConfig.primaryColor,
                        secondaryColor = baseTemplateConfig.secondaryColor,
                        accentColor = baseTemplateConfig.accentColor,
                        headerStyle = baseTemplateConfig.headerStyle,
                        logoPosition = baseTemplateConfig.logoPosition,
                        companyInfoPosition = baseTemplateConfig.companyInfoPosition,
                        showCompanyBackground = baseTemplateConfig.showCompanyBackground,
                        tableStyle = baseTemplateConfig.tableStyle,
                        borderStyle = baseTemplateConfig.borderStyle,
                        fontFamily = baseTemplateConfig.fontFamily,
                        layout = baseTemplateConfig.layout,
                        sections = baseTemplateConfig.sections,
                        styling = baseTemplateConfig.styling,
                        typography = baseTemplateConfig.typography
                    }, new JsonSerializerOptions { WriteIndented = true })
                }
            };

            context.InvoiceTemplates.AddRange(templates);
            await context.SaveChangesAsync();
        }
    }
}