using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.Models
{
    public class DocumentType : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Code { get; set; } = string.Empty; // INV, PRO, QUO, TAX
        
        [MaxLength(20)]
        public string NumberPrefix { get; set; } = string.Empty; // INV-, PRO-, QUO-, TAX-
        
        [MaxLength(100)]
        public string DisplayName { get; set; } = string.Empty; // "Tax Invoice", "Proforma Invoice", etc.
        
        // Two-level categorization
        [Required]
        [MaxLength(20)]
        public string Category { get; set; } = "Invoice"; // "Invoice" or "Proforma"
        
        public bool CountsForLogistics { get; set; } = true; // If true, affects inventory and revenue
        
        public bool RequiresTaxInfo { get; set; } = false;
        public bool IsQuotation { get; set; } = false;
        public bool IsProforma { get; set; } = false;
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public ICollection<InvoiceTemplate> Templates { get; set; } = new List<InvoiceTemplate>();
    }
}
