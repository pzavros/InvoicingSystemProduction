// DTOs/InvoiceItemDto.cs
namespace InvoicingBackend.DTOs
{
    public class InvoiceItemDto
    {
        public int? Id { get; set; }
        public int? ProductId { get; set; } // For linking to product catalog
        public string Title { get; set; }
        public string? Description { get; set; } // Made Description nullable
        public int    Quantity    { get; set; }
        public decimal UnitPrice  { get; set; }
        public decimal? TaxRate { get; set; } // Tax rate per item
        public bool IsTaxable { get; set; } = true;
          // Additional product info for display (read-only)
        public string? ProductName { get; set; }
        public bool? IsCustomItem { get; set; } // true when ProductId is null
    }
}