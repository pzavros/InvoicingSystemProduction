using System;
using System.Collections.Generic;

namespace InvoicingBackend.DTOs
{
    public class InvoiceDto
    {
        public int? Id { get; set; }
        public string? InvoiceNumber { get; set; }
        public DateTime DateOfIssue { get; set; }
        public DateTime DueDate { get; set; }
        public string BillTo { get; set; }
        public string BillToEmail { get; set; }
        public string BillToAddress { get; set; }
        public string BillFrom { get; set; }
        public string BillFromEmail { get; set; }
        public string BillFromAddress { get; set; }
        public string? Notes { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxRate { get; set; } // Added TaxRate
        public decimal TaxAmount { get; set; }
        public decimal DiscountRate { get; set; } // Added DiscountRate
        public decimal DiscountAmount { get; set; }
        public decimal Total { get; set; }
        public int CurrencyId { get; set; }
        public CurrencyDto? Currency { get; set; } // Add this property to include currency details
        public string CompanyName { get; set; }
        public string CompanyNo { get; set; }
        public string VatNo { get; set; }
        public string TicNo { get; set; }
        public string Website { get; set; }
        public string? Logo { get; set; } // Changed from byte[] to string to handle base64 data
        public string CompanyEmail { get; set; }
        public string BankName { get; set; }
        public string AccountName { get; set; }
        public string AccountNo { get; set; }
        public string Swift { get; set; }
        public string Iban { get; set; }
        public int? StatusId { get; set; }
        public string? StatusName { get; set; }
        public int? TemplateId { get; set; }
        public int? ClientId { get; set; } // Link to client from Clients table
        public int DocumentTypeId { get; set; } = 1; // Default to standard invoice
        public bool IsDeleted { get; set; } // Added IsDeleted property
        public IEnumerable<InvoiceItemDto> Items { get; set; } = new List<InvoiceItemDto>();
    }
}
