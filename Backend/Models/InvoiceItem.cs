// Models/InvoiceItem.cs
using System.ComponentModel.DataAnnotations.Schema;

namespace InvoicingBackend.Models
{    public class InvoiceItem : BaseEntity
    {
        // Remove duplicate Id since it's now in BaseEntity

        public int InvoiceId { get; set; }
        public Invoice Invoice { get; set; }
        
        // Product reference (optional - can be null for custom items)
        public int? ProductId { get; set; }
        public Product? Product { get; set; }
        
        public string Title { get; set; }
        public string? Description { get; set; } // Made Description nullable
        public int    Quantity    { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice  { get; set; }
        
        // Tax settings per item
        [Column(TypeName = "decimal(5,2)")]
        public decimal? TaxRate { get; set; }
        public bool IsTaxable { get; set; } = true;

        [NotMapped]
        public decimal LineTotal  => Quantity * UnitPrice;
    }
}