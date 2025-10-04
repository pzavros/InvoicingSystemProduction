using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvoicingBackend.Models
{
    public class Invoice : BaseEntity
    {
        // Remove duplicate Id property since it's now in BaseEntity
        public string InvoiceNumber     { get; set; }
        public DateTime DateOfIssue     { get; set; }
        public DateTime DueDate         { get; set; }
        public string BillTo            { get; set; }
        public string BillToEmail       { get; set; }
        public string BillToAddress     { get; set; }
        public string BillFrom          { get; set; }
        public string BillFromEmail     { get; set; }
        public string BillFromAddress   { get; set; }
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
        public Currency Currency        { get; set; }

        public string   CompanyName     { get; set; }
        public string   CompanyNo       { get; set; }
        public string   VatNo           { get; set; }
        public string   TicNo           { get; set; }
        public string   Website         { get; set; }
        public string   CompanyEmail    { get; set; }
        public string   BankName        { get; set; }
        public string   AccountName     { get; set; }
        public string   AccountNo       { get; set; }
        public string   Swift           { get; set; }
        public string   Iban            { get; set; }
        public int? StatusId { get; set; } = 1;

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
