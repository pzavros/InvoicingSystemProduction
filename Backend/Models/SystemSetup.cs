// Models/SystemSetup.cs
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvoicingBackend.Models
{
    public class SystemSetup : BaseEntity
    {
        // Remove duplicate Id and UserId since they're now in BaseEntity
        public string? Name { get; set; }
        public string? CompanyNo { get; set; }
        public string? VatNo { get; set; }
        public string? TicNo { get; set; }
        public string? Website { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public byte[]? Logo { get; set; }
        public string? BankName { get; set; }
        public string? AccountName { get; set; }
        public string? AccountNo { get; set; }
        public string? Swift { get; set; }
        public string? Iban { get; set; }
    }
}