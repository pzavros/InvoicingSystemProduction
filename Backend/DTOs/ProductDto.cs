namespace InvoicingBackend.DTOs
{    public class ProductDto
    {
        public int? Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int StockQuantity { get; set; }
        public int MinStockLevel { get; set; }
        public bool TrackInventory { get; set; }
        public decimal? TaxRate { get; set; }
        public bool IsTaxable { get; set; }
        public bool IsActive { get; set; }
        public bool IsService { get; set; }
        public DateTime? DateEntered { get; set; }
        public string? EnteredBy { get; set; }
        
        // Multi-tenant support
        public int? UserId { get; set; }
    }
      public class ProductCategoryDto
    {
        public int? Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int ProductCount { get; set; } = 0;
    }
    
    public class PriceHistoryDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public decimal OldPrice { get; set; }
        public decimal NewPrice { get; set; }
        public DateTime ChangeDate { get; set; } // Map from DateEntered
        public string? ChangedBy { get; set; } // Map from EnteredBy
        public string? Reason { get; set; }
    }
    
    public class ProductSearchDto
    {
        public string? SearchTerm { get; set; }
        public int? CategoryId { get; set; }
        public bool? IsService { get; set; }
        public bool? IsActive { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }
}
