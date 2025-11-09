namespace InvoicingBackend.DTOs
{
    public class ProductPerformanceStatsDto
    {
        public List<TopProductDto> TopProductsByRevenue { get; set; } = new List<TopProductDto>();
        public List<CategoryRevenueDto> RevenueByCategory { get; set; } = new List<CategoryRevenueDto>();
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int LowStockProducts { get; set; }
        public decimal TotalProductRevenue { get; set; }
        public decimal TotalServiceRevenue { get; set; }
        public string CurrencySymbol { get; set; } = "€";
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public int QuantitySold { get; set; }
        public decimal AveragePrice { get; set; }
        public bool IsService { get; set; }
        public string? CategoryName { get; set; }
        public int StockQuantity { get; set; }
    }

    public class CategoryRevenueDto
    {
        public int? CategoryId { get; set; }
        public string CategoryName { get; set; } = "Uncategorized";
        public decimal TotalRevenue { get; set; }
        public int ProductCount { get; set; }
        public int ItemsSold { get; set; }
    }
}
