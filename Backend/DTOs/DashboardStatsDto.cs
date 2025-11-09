namespace InvoicingBackend.DTOs
{
    public class DashboardStatsDto
    {
        public decimal TotalAmountCurrentMonth { get; set; }
        public int InvoiceCountCurrentMonth { get; set; }
        public decimal TotalAmountLast3Months { get; set; }
        public int InvoiceCountLast3Months { get; set; }
        public decimal TotalAmountLast6Months { get; set; }
        public int InvoiceCountLast6Months { get; set; }
        public decimal TotalAmountLastYear { get; set; }
        public int InvoiceCountLastYear { get; set; }
        public decimal TotalAmountOverall { get; set; }
        public int InvoiceCountOverall { get; set; }
    }

    public class MonthlyDashboardStatsDto
    {
        // Total with tax (final invoice amount)
        public decimal TotalEarningsSelectedMonthYear { get; set; }
        
        // Total tax amount collected
        public decimal TotalTaxSelectedMonthYear { get; set; }
        
        // Revenue without tax (subtotal)
        public decimal TotalRevenueSelectedMonthYear { get; set; }
        
        // Invoice count
        public int InvoiceCountSelectedMonthYear { get; set; }
        
        // User's preferred currency
        public string CurrencySymbol { get; set; } = "€";
        
        // Percentage change from previous month
        public decimal PercentageChangeEarnings { get; set; }
        
        // For backwards compatibility (map to TotalEarnings)
        public decimal TotalAmountSelectedMonthYear 
        { 
            get => TotalEarningsSelectedMonthYear; 
            set => TotalEarningsSelectedMonthYear = value; 
        }
    }
}
