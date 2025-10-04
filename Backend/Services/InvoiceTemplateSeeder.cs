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

            var templates = new List<InvoiceTemplate>
            {
                // 1. Modern Professional Template
                new InvoiceTemplate
                {
                    Name = "Modern Professional",
                    Description = "A clean, modern template perfect for professional services, consultancy, and corporate businesses. Features elegant typography and structured layout.",
                    IsSystemTemplate = true,
                    IsActive = false,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System",
                    UserId = null,
                    TemplateData = JsonSerializer.Serialize(new
                    {
                        theme = "modern",
                        primaryColor = "#2563eb",
                        secondaryColor = "#f8fafc",
                        accentColor = "#1e40af",
                        headerStyle = "gradient",
                        logoPosition = "left",
                        companyInfoPosition = "right",
                        showCompanyBackground = true,
                        tableStyle = "minimal",
                        borderStyle = "subtle",
                        fontFamily = "Inter, Arial, sans-serif",
                        headerGradient = "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                        layout = new
                        {
                            headerHeight = "120px",
                            spacing = "large",
                            margins = "24px",
                            borderRadius = "8px"
                        },
                        sections = new
                        {
                            showCompanyLogo = true,
                            showCompanyDetails = true,
                            showBankDetails = true,
                            showNotes = true,
                            showTerms = true,
                            highlightTotals = true
                        },
                        styling = new
                        {
                            headerTextColor = "#ffffff",
                            bodyTextColor = "#374151",
                            labelColor = "#6b7280",
                            totalBackgroundColor = "#f9fafb",
                            tableHeaderBackground = "#f3f4f6"
                        }
                    }, new JsonSerializerOptions { WriteIndented = true })
                },

                // 2. Creative Colorful Template
                new InvoiceTemplate
                {
                    Name = "Creative Colorful",
                    Description = "A vibrant, eye-catching template ideal for creative agencies, designers, and modern startups. Features bold colors and dynamic layouts.",
                    IsSystemTemplate = true,
                    IsActive = false,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System",
                    UserId = null,
                    TemplateData = JsonSerializer.Serialize(new
                    {
                        theme = "creative",
                        primaryColor = "#7c3aed",
                        secondaryColor = "#fbbf24",
                        accentColor = "#10b981",
                        headerStyle = "colorful",
                        logoPosition = "center",
                        companyInfoPosition = "center",
                        showCompanyBackground = true,
                        tableStyle = "colorful",
                        borderStyle = "rounded",
                        fontFamily = "Poppins, Arial, sans-serif",
                        headerGradient = "linear-gradient(135deg, #7c3aed 0%, #f59e0b 50%, #10b981 100%)",
                        layout = new
                        {
                            headerHeight = "140px",
                            spacing = "medium",
                            margins = "20px",
                            borderRadius = "12px"
                        },
                        sections = new
                        {
                            showCompanyLogo = true,
                            showCompanyDetails = true,
                            showBankDetails = true,
                            showNotes = true,
                            showTerms = true,
                            highlightTotals = true
                        },
                        styling = new
                        {
                            headerTextColor = "#ffffff",
                            bodyTextColor = "#1f2937",
                            labelColor = "#7c3aed",
                            totalBackgroundColor = "linear-gradient(45deg, #f3e8ff 0%, #fef3c7 100%)",
                            tableHeaderBackground = "linear-gradient(135deg, #7c3aed 0%, #f59e0b 100%)",
                            tableHeaderTextColor = "#ffffff"
                        },
                        decorative = new
                        {
                            showPatterns = true,
                            cornerAccents = true,
                            colorfulBorders = true
                        }
                    }, new JsonSerializerOptions { WriteIndented = true })
                },

                // 3. Minimalist Clean Template
                new InvoiceTemplate
                {
                    Name = "Minimalist Clean",
                    Description = "An ultra-clean, minimalist template focusing on clarity and simplicity. Perfect for tech companies, freelancers, and modern businesses.",
                    IsSystemTemplate = true,
                    IsActive = false,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System",
                    UserId = null,
                    TemplateData = JsonSerializer.Serialize(new
                    {
                        theme = "minimal",
                        primaryColor = "#000000",
                        secondaryColor = "#ffffff",
                        accentColor = "#6b7280",
                        headerStyle = "clean",
                        logoPosition = "left",
                        companyInfoPosition = "right",
                        showCompanyBackground = false,
                        tableStyle = "clean",
                        borderStyle = "minimal",
                        fontFamily = "system-ui, -apple-system, sans-serif",
                        layout = new
                        {
                            headerHeight = "100px",
                            spacing = "compact",
                            margins = "32px",
                            borderRadius = "0px"
                        },
                        sections = new
                        {
                            showCompanyLogo = true,
                            showCompanyDetails = true,
                            showBankDetails = true,
                            showNotes = true,
                            showTerms = false,
                            highlightTotals = false
                        },
                        styling = new
                        {
                            headerTextColor = "#000000",
                            bodyTextColor = "#000000",
                            labelColor = "#6b7280",
                            totalBackgroundColor = "#f9fafb",
                            tableHeaderBackground = "#ffffff",
                            borderColor = "#e5e7eb",
                            lineStyle = "thin"
                        },
                        typography = new
                        {
                            headerFontSize = "28px",
                            bodyFontSize = "14px",
                            labelFontSize = "12px",
                            fontWeight = "normal",
                            lineHeight = "1.5"
                        }
                    }, new JsonSerializerOptions { WriteIndented = true })
                }
            };

            context.InvoiceTemplates.AddRange(templates);
            await context.SaveChangesAsync();
        }
    }
}
