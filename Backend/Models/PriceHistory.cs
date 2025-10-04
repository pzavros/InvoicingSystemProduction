using System.ComponentModel.DataAnnotations.Schema;

namespace InvoicingBackend.Models
{
    public class PriceHistory : BaseEntity
    {
        // Remove duplicate Id since it's now in BaseEntity
        public int ProductId { get; set; }
        public Product Product { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal OldPrice { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal NewPrice { get; set; }
        
        // Remove duplicate date and user tracking since it's now in BaseEntity
        public string? Reason { get; set; }
    }
}
