using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace InvoicingBackend.Models
{    public class Product : BaseEntity
    {
        // Remove duplicate Id and UserId since they're now in BaseEntity
        public string Name { get; set; }
        public string? Description { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }
        
        public int? CategoryId { get; set; }
        public ProductCategory? Category { get; set; }
        
        // Inventory tracking
        public int StockQuantity { get; set; } = 0;
        public int MinStockLevel { get; set; } = 0;
        public bool TrackInventory { get; set; } = true;
        
        // Tax settings
        [Column(TypeName = "decimal(5,2)")]
        public decimal? TaxRate { get; set; }
        public bool IsTaxable { get; set; } = true;
        
        // Status
        public bool IsActive { get; set; } = true;
        public bool IsService { get; set; } = false; // false for Product, true for Service
        
        // Remove duplicate UserId and User since they're now in BaseEntity
        
        // Price history
        public ICollection<PriceHistory> PriceHistory { get; set; } = new List<PriceHistory>();
        
        // Navigation property for invoice items that use this product
        public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    }
}
