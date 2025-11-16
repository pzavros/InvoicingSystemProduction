// Services/InvoiceService.cs
using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Features;
using System.Text.RegularExpressions;

namespace InvoicingBackend.Services
{    public class InvoiceService : IInvoiceService
    {
        private readonly ApplicationDbContext _context;
        private readonly ISystemSetupService _systemSetup;
        private readonly IProductService _productService;

        public InvoiceService(
            ApplicationDbContext context,
            ISystemSetupService  systemSetup,
            IProductService productService)
        {
            _context       = context;
            _systemSetup   = systemSetup;
            _productService = productService;
        }

        public async Task<IEnumerable<InvoiceDto>> GetAllInvoicesAsync(int userId)
        {
            try
            {
                var invoices = await _context.Invoices
                    .Where(i => i.UserId == userId) // Filter by current user
                    // .Where(i => !i.IsDeleted) // Exclude soft-deleted invoices
                    .Include(i => i.Currency)
                    .Include(i => i.Template)
                    .Include(i => i.Items)
                    .ToListAsync();

                var statuses = await _context.Statuses
                    .ToDictionaryAsync(s => s.StatusId, s => s.Name);

                var sys      = await _systemSetup.GetSystemSetupAsync(userId);
                var result = invoices.Select(invoice => new InvoiceDto
                {
                    Id = invoice.Id,
                    InvoiceNumber = invoice.InvoiceNumber,
                    DateOfIssue = invoice.DateOfIssue,
                    DueDate = invoice.DueDate,
                    BillTo = invoice.BillTo,
                    SubTotal = invoice.SubTotal,
                    Total = invoice.Total,
                    CurrencyId = invoice.CurrencyId,
                    Currency = invoice.Currency == null ? null : new CurrencyDto
                    {
                        Id = invoice.Currency.Id,
                        Code = invoice.Currency.Code,
                        Name = invoice.Currency.Name ?? "",
                        Symbol = invoice.Currency.Symbol ?? ""
                    },
                    CompanyName = invoice.CompanyName,
                CompanyNo = invoice.CompanyNo,
                StatusId = invoice.StatusId,
                StatusName = invoice.StatusId.HasValue && statuses.TryGetValue(invoice.StatusId.Value, out var name)
                        ? name                        : "Unknown",
                TemplateId = invoice.TemplateId,
                DocumentTypeId = invoice.DocumentTypeId,
                IsDeleted = invoice.IsDeleted, // Map IsDeleted
                Items = invoice.Items.Select(item => new InvoiceItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                        Title = item.Title,
                        Description = item.Description,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TaxRate = item.TaxRate,
                        IsTaxable = item.IsTaxable,
                        IsCustomItem = item.ProductId == null
                    }).ToList()
                });

                return result;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("An error occurred while retrieving all invoices.", ex);
            }
        }

        public async Task<InvoiceDto> GetInvoiceById(int invoiceId, int userId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .Include(i => i.Currency)
                .Include(i => i.Template)
                .FirstOrDefaultAsync(i => i.Id == invoiceId && i.UserId == userId); // Filter by user

            if (invoice == null)
                throw new KeyNotFoundException("Invoice not found.");

            var statusName = await _context.Statuses
                .Where(s => s.StatusId == invoice.StatusId)
                .Select(s => s.Name)
                .FirstOrDefaultAsync();
            var sys     = await _systemSetup.GetSystemSetupAsync(userId);
            var invoiceDto = new InvoiceDto
            {
                Id = invoice.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                DateOfIssue = invoice.DateOfIssue,
                DueDate = invoice.DueDate,
                BillTo = invoice.BillTo,
                BillToEmail = invoice.BillToEmail,
                BillToAddress = invoice.BillToAddress,
                BillFrom = invoice.BillFrom,
                BillFromEmail = invoice.BillFromEmail,
                BillFromAddress = invoice.BillFromAddress,
                Notes = invoice.Notes,
                SubTotal = invoice.SubTotal,
                TaxRate = invoice.TaxRate,
                TaxAmount = invoice.TaxAmount,
                DiscountRate = invoice.DiscountRate,
                DiscountAmount = invoice.DiscountAmount,
                Total = invoice.Total,
                CurrencyId = invoice.CurrencyId,
                Currency = invoice.Currency == null ? null : new CurrencyDto
                {
                    Id = invoice.Currency.Id,
                    Code = invoice.Currency.Code,
                    Name = invoice.Currency.Name ?? "",
                    Symbol = invoice.Currency.Symbol ?? ""
                },
                CompanyName = invoice.CompanyName,
                CompanyNo = invoice.CompanyNo,
                VatNo = invoice.VatNo,
                TicNo = invoice.TicNo,
                Website = invoice.Website,
                CompanyEmail = invoice.CompanyEmail,
                BankName = invoice.BankName,
                AccountName = invoice.AccountName,
                AccountNo = invoice.AccountNo,
                Swift = invoice.Swift,
                Iban = invoice.Iban,
                Logo  = sys?.Logo != null ? Convert.ToBase64String(sys.Logo) : null,
                StatusId = invoice.StatusId,                StatusName = statusName,
                DocumentTypeId = invoice.DocumentTypeId,
                TemplateId = invoice.TemplateId,
                IsDeleted = invoice.IsDeleted, // Map IsDeleted
                Items = invoice.Items.Select(item => new InvoiceItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    Title = item.Title,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TaxRate = item.TaxRate,
                    IsTaxable = item.IsTaxable,
                    IsCustomItem = item.ProductId == null
                }).ToList()
            };

            return invoiceDto;
        }

        private async Task<string> GenerateNextInvoiceNumberAsync(int userId)
        {
            var lastInvoice = await _context.Invoices
                .Where(i => i.UserId == userId && !i.IsDeleted)
                .OrderByDescending(i => i.Id)
                .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (lastInvoice != null && 
                !string.IsNullOrWhiteSpace(lastInvoice.InvoiceNumber) &&
                lastInvoice.InvoiceNumber.StartsWith("INV-") &&
                int.TryParse(lastInvoice.InvoiceNumber.Substring(4), out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }

            return $"INV-{nextNumber.ToString("D4")}";
        }

        public async Task<Invoice> CreateInvoiceAsync(InvoiceDto dto, int userId)
        {
            // Always generate the next invoice number for this user
            var nextInvoiceNumber = await GenerateNextInvoiceNumberAsync(userId);

            var invoice = new Invoice
            {
                InvoiceNumber = nextInvoiceNumber,
                DateOfIssue = dto.DateOfIssue.Kind == DateTimeKind.Utc ? dto.DateOfIssue : DateTime.SpecifyKind(dto.DateOfIssue, DateTimeKind.Utc),
                DueDate = dto.DueDate.Kind == DateTimeKind.Utc ? dto.DueDate : DateTime.SpecifyKind(dto.DueDate, DateTimeKind.Utc),
                BillTo = dto.BillTo,
                BillToEmail = dto.BillToEmail,
                BillToAddress = dto.BillToAddress,
                BillFrom = dto.BillFrom,
                BillFromEmail = dto.BillFromEmail,
                BillFromAddress = dto.BillFromAddress,
                Notes = dto.Notes,
                SubTotal = dto.SubTotal,
                TaxRate = dto.TaxRate, // Map TaxRate from DTO
                TaxAmount = dto.TaxAmount,
                DiscountRate = dto.DiscountRate, // Map DiscountRate from DTO
                DiscountAmount = dto.DiscountAmount,
                Total = dto.Total,
                CurrencyId = dto.CurrencyId,
                CompanyName = dto.CompanyName,
                CompanyNo = dto.CompanyNo,
                VatNo = dto.VatNo,
                TicNo = dto.TicNo,
                Website = dto.Website,
                CompanyEmail = dto.CompanyEmail,
                BankName = dto.BankName,
                AccountName = dto.AccountName,
                AccountNo = dto.AccountNo,
                Swift = dto.Swift,
                Iban = dto.Iban,
                EnteredBy = $"User{userId}",
                DateEntered = DateTime.UtcNow,
                StatusId = dto.StatusId,
                DocumentTypeId = dto.DocumentTypeId, // Add document type
                ClientId = dto.ClientId, // Link to client if provided
                UserId = userId // Set the user ownership
            };

            var resolvedTemplateId = await ValidateTemplateAsync(dto.TemplateId, userId);
            if (resolvedTemplateId.HasValue)
            {
                invoice.TemplateId = resolvedTemplateId.Value;
            }
            else
            {
                invoice.TemplateId = await GetActiveTemplateIdForUserAsync(userId);
            }

            foreach (var itemDto in dto.Items ?? Enumerable.Empty<InvoiceItemDto>())
            {
                invoice.Items.Add(new InvoiceItem
                {
                    ProductId = itemDto.ProductId,
                    Title = itemDto.Title,
                    Description = itemDto.Description,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    TaxRate = itemDto.TaxRate,
                    IsTaxable = itemDto.IsTaxable,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System",
                    UserId = userId,
                    DateModified = null,
                    DateDeleted = null,
                    ModifiedBy = null,
                    DeletedBy = null
                });
            }

            // Process stock deduction for products before saving
            await ProcessStockDeductionAsync(dto.Items ?? Enumerable.Empty<InvoiceItemDto>(), $"User{userId}");

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return invoice;
        }

        public async Task<bool> UpdateInvoiceAsync(int id, InvoiceDto dto, int userId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted && i.UserId == userId); // Filter by user
            if (invoice == null) return false;

            var resolvedTemplateId = await ValidateTemplateAsync(dto.TemplateId, userId);
            if (resolvedTemplateId.HasValue)
            {
                invoice.TemplateId = resolvedTemplateId.Value;
            }

            // Don't update InvoiceNumber - it should remain unchanged after creation
            // invoice.InvoiceNumber = dto.InvoiceNumber;
            invoice.DateOfIssue = dto.DateOfIssue.Kind == DateTimeKind.Utc ? dto.DateOfIssue : DateTime.SpecifyKind(dto.DateOfIssue, DateTimeKind.Utc);
            invoice.DueDate = dto.DueDate.Kind == DateTimeKind.Utc ? dto.DueDate : DateTime.SpecifyKind(dto.DueDate, DateTimeKind.Utc);
            invoice.BillTo = dto.BillTo;
            invoice.BillToEmail = dto.BillToEmail;
            invoice.BillToAddress = dto.BillToAddress;
            invoice.BillFrom = dto.BillFrom;
            invoice.BillFromEmail = dto.BillFromEmail;
            invoice.BillFromAddress = dto.BillFromAddress;
            invoice.Notes = dto.Notes;
            invoice.SubTotal = dto.SubTotal;
            invoice.TaxRate = dto.TaxRate; // Map TaxRate from DTO
            invoice.TaxAmount = dto.TaxAmount;
            invoice.DiscountRate = dto.DiscountRate; // Map DiscountRate from DTO
            invoice.DiscountAmount = dto.DiscountAmount;
            invoice.Total = dto.Total;
            invoice.CurrencyId = dto.CurrencyId;
            invoice.CompanyName = dto.CompanyName;
            invoice.CompanyNo = dto.CompanyNo;
            invoice.VatNo = dto.VatNo;
            invoice.TicNo = dto.TicNo;
            invoice.Website = dto.Website;
            invoice.CompanyEmail = dto.CompanyEmail;
            invoice.BankName = dto.BankName;
            invoice.AccountName = dto.AccountName;
            invoice.AccountNo = dto.AccountNo;
            invoice.Swift = dto.Swift;
            invoice.Iban = dto.Iban;
            invoice.DocumentTypeId = dto.DocumentTypeId; // Add document type update
            invoice.ClientId = dto.ClientId; // Update client link if provided
            
            // Store original items for stock restoration
            var originalItems = invoice.Items.ToList();
            
            // Restore stock for original items before updating
            await ProcessStockRestorationAsync(originalItems, "SystemAdmin");
            
            _context.InvoiceItems.RemoveRange(invoice.Items);
            invoice.Items.Clear();
            foreach (var itemDto in dto.Items ?? Enumerable.Empty<InvoiceItemDto>())
            {
                var newItem = new InvoiceItem
                {
                    ProductId = itemDto.ProductId,
                    Title = itemDto.Title,
                    Description = itemDto.Description,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    TaxRate = itemDto.TaxRate,
                    IsTaxable = itemDto.IsTaxable,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "System",
                    UserId = userId,
                    DateModified = null,
                    DateDeleted = null,
                    ModifiedBy = null,
                    DeletedBy = null
                };
                invoice.Items.Add(newItem);
            }

            // Process stock deduction for new items
            await ProcessStockDeductionAsync(dto.Items ?? Enumerable.Empty<InvoiceItemDto>(), "SystemAdmin");

            await _context.SaveChangesAsync();
            return true;
        }        public async Task<bool> DeleteInvoiceAsync(int id, int userId)
        {
            var inv = await _context.Invoices
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId); // Filter by user

            if (inv == null) return false;

            // Restore stock for all items before deleting
            await ProcessStockRestorationAsync(inv.Items, $"User{userId}");

            inv.IsDeleted = true;
            inv.StatusId = 4; // Set StatusId to 4 for "Deleted"
            _context.Invoices.Update(inv);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Currency>> GetCurrenciesAsync()
        {
            try
            {
                var currencies = await _context.Currencies.ToListAsync();
                return currencies;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("An error occurred while retrieving currencies.", ex);
            }
        }

        public async Task<IEnumerable<StatusDto>> GetAllStatusesAsync()
        {
            var statuses = await _context.Statuses
                                     .Where(s => s.StatusId != 4) // Exclude "Deleted" status
                                     .ToListAsync();
            return statuses.Select(s => new StatusDto
            {
                StatusId = s.StatusId,
                Name = s.Name
            });
        }

        public async Task<bool> UpdateInvoiceStatusAsync(int id, int statusId, int userId)
        {
            var invoice = await _context.Invoices
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId); // Filter by user
            if (invoice == null)
            {
                return false; // Invoice not found
            }

            // Optional: Validate if statusId exists in the Statuses table
            var statusExists = await _context.Statuses.AnyAsync(s => s.StatusId == statusId);
            if (!statusExists)
            {
                // Handle invalid status ID, perhaps throw an exception or return false
                // For now, let's assume valid status IDs are passed
                throw new KeyNotFoundException($"Status with ID {statusId} not found.");
            }

            invoice.StatusId = statusId;
            // Synchronize IsDeleted flag with the "Deleted" status (StatusId = 4)
            invoice.IsDeleted = (statusId == 4); 

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<int?> ValidateTemplateAsync(int? templateId, int userId)
        {
            if (!templateId.HasValue)
            {
                return null;
            }

            var templateExists = await _context.InvoiceTemplates
                .AnyAsync(t => t.Id == templateId.Value && (t.UserId == userId || t.IsSystemTemplate));

            if (!templateExists)
            {
                throw new KeyNotFoundException("Selected invoice template was not found for this user.");
            }

            return templateId.Value;
        }

        private async Task<int?> GetActiveTemplateIdForUserAsync(int userId)
        {
            return await _context.InvoiceTemplates
                .Where(t => t.UserId == userId && t.IsActive)
                .Select(t => (int?)t.Id)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateBulkInvoiceStatusAsync(IEnumerable<int> invoiceIds, int statusId, int userId)
        {
            if (invoiceIds == null || !invoiceIds.Any())
            {
                return false; // Or throw an ArgumentException
            }

            var statusExists = await _context.Statuses.AnyAsync(s => s.StatusId == statusId);
            if (!statusExists)
            {
                // Optionally handle invalid status ID error more explicitly
                return false; // Or throw an ArgumentException
            }

            var invoicesToUpdate = await _context.Invoices
                                               .Where(inv => invoiceIds.Contains(inv.Id) && inv.UserId == userId) // Filter by user
                                               .ToListAsync();

            if (!invoicesToUpdate.Any())
            {
                return false; // No invoices found for the given IDs
            }

            foreach (var invoice in invoicesToUpdate)
            {
                invoice.StatusId = statusId;
                invoice.IsDeleted = (statusId == 4); // Synchronize IsDeleted flag
                _context.Entry(invoice).State = EntityState.Modified;
            }

            try
            {
                // Consider transaction for atomicity if needed, though SaveChangesAsync often handles this
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException ex)
            {
                // Log the exception details
                Console.WriteLine($"Error updating bulk invoice statuses: {ex.Message}"); 
                // Consider more specific error handling or re-throwing
                return false;
            }
        }

        // Private method to handle stock deduction for invoice items
        private async Task ProcessStockDeductionAsync(IEnumerable<InvoiceItemDto> items, string updatedBy)
        {
            foreach (var item in items.Where(i => i.ProductId.HasValue))
            {
                if (!item.ProductId.HasValue) continue;
                
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.Id == item.ProductId.Value && p.TrackInventory);
                
                if (product != null)
                {                    // Check if there's enough stock
                    if (product.StockQuantity >= item.Quantity)
                    {
                        // Deduct the quantity from stock
                        product.StockQuantity -= item.Quantity;
                        _context.Products.Update(product);
                    }
                    else
                    {
                        // Optional: Log warning or throw exception for insufficient stock
                        // For now, we'll allow the operation but could add validation here
                        Console.WriteLine($"Warning: Insufficient stock for product {product.Name}. Available: {product.StockQuantity}, Requested: {item.Quantity}");
                        
                        // Deduct whatever stock is available (could set to 0 or keep as negative)
                        product.StockQuantity = Math.Max(0, product.StockQuantity - item.Quantity);
                        _context.Products.Update(product);
                    }
                }
            }
        }

        // Private method to handle stock restoration for invoice items (for updates/deletions)
        private async Task ProcessStockRestorationAsync(IEnumerable<InvoiceItem> items, string updatedBy)
        {
            foreach (var item in items.Where(i => i.ProductId.HasValue))
            {
                if (!item.ProductId.HasValue) continue;
                
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.Id == item.ProductId.Value && p.TrackInventory);
                  if (product != null)
                {
                    // Restore the quantity to stock
                    product.StockQuantity += item.Quantity;
                    _context.Products.Update(product);
                }
            }
        }
    }
}
