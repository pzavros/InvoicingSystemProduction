using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.Models
{
    public class Client : BaseEntity
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Company { get; set; }

        [StringLength(20)]
        public string? Phone { get; set; }

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(100)]
        public string? City { get; set; }

        [StringLength(50)]
        public string? State { get; set; }

        [StringLength(20)]
        public string? PostalCode { get; set; }

        [StringLength(100)]
        public string? Country { get; set; }

        [StringLength(100)]
        public string? Website { get; set; }

        [StringLength(50)]
        public string? TaxNumber { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        // Status tracking
        public bool IsActive { get; set; } = true;

        // Payment terms (in days)
        public int DefaultPaymentTerms { get; set; } = 30;

        // Preferred currency
        public int? PreferredCurrencyId { get; set; }
        public Currency? PreferredCurrency { get; set; }

        // Relationships
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

        // Calculated properties
        public decimal TotalInvoiceAmount => Invoices?.Where(i => !i.IsDeleted).Sum(i => i.Total) ?? 0;
        public int TotalInvoiceCount => Invoices?.Count(i => !i.IsDeleted) ?? 0;
        public DateTime? LastInvoiceDate => Invoices?.Where(i => !i.IsDeleted).Max(i => i.DateOfIssue);
    }
}
