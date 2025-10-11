using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvoicingBackend.Models
{
    public class Invoice : BaseEntity
    {
        // Remove duplicate Id property since it's now in BaseEntity
        [Required]
        public string InvoiceNumber     { get; set; } = string.Empty;
        public DateTime DateOfIssue     { get; set; }
        public DateTime DueDate         { get; set; }
        [Required]
        public string BillTo            { get; set; } = string.Empty;
        [Required]
        public string BillToEmail       { get; set; } = string.Empty;
        [Required]
        public string BillToAddress     { get; set; } = string.Empty;
        [Required]
        public string BillFrom          { get; set; } = string.Empty;
        [Required]
        public string BillFromEmail     { get; set; } = string.Empty;
        [Required]
        public string BillFromAddress   { get; set; } = string.Empty;
        public string? Notes            { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal         { get; set; }
        
        [Column(TypeName = "decimal(5,2)")] // Store percentage like 10.00
        public decimal TaxRate          { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount        { get; set; }
        
        [Column(TypeName = "decimal(5,2)")] // Store percentage like 5.00
        public decimal DiscountRate     { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount   { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Total            { get; set; }

        public int      CurrencyId      { get; set; }
        public Currency? Currency        { get; set; }

        public string   CompanyName     { get; set; } = string.Empty;
        public string   CompanyNo       { get; set; } = string.Empty;
        public string   VatNo           { get; set; } = string.Empty;
        public string   TicNo           { get; set; } = string.Empty;
        public string   Website         { get; set; } = string.Empty;
        public string   CompanyEmail    { get; set; } = string.Empty;
        public string   BankName        { get; set; } = string.Empty;
        public string   AccountName     { get; set; } = string.Empty;
        public string   AccountNo       { get; set; } = string.Empty;
        public string   Swift           { get; set; } = string.Empty;
        public string   Iban            { get; set; } = string.Empty;
        public int? StatusId { get; set; } = 1;

        // Document type (Invoice, Proforma, Quotation, Tax Invoice)
        public int DocumentTypeId { get; set; } = 1; // Default to standard invoice
        public DocumentType? DocumentType { get; set; }

        // Optional link to the template used when the invoice was created
        public int? TemplateId { get; set; }
        public InvoiceTemplate? Template { get; set; }

        // Optional link to client 
        public int? ClientId { get; set; }
        public Client? Client { get; set; }

        // Remove duplicate IsDeleted, UserId, and User since they're now in BaseEntity
        
        public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    }
}
