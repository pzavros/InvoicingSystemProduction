namespace InvoicingBackend.DTOs
{
    public class InvoiceStatusStatsDto
    {
        public int PaidCount { get; set; }
        public decimal PaidAmount { get; set; }
        
        public int PendingCount { get; set; }
        public decimal PendingAmount { get; set; }
        
        public int OverdueCount { get; set; }
        public decimal OverdueAmount { get; set; }
        
        public int DraftCount { get; set; }
        public decimal DraftAmount { get; set; }
        
        // Overdue aging buckets
        public int Overdue1to30Days { get; set; }
        public decimal Overdue1to30Amount { get; set; }
        
        public int Overdue31to60Days { get; set; }
        public decimal Overdue31to60Amount { get; set; }
        
        public int Overdue60PlusDays { get; set; }
        public decimal Overdue60PlusAmount { get; set; }
        
        // Payment metrics
        public decimal AverageDaysToPayment { get; set; }
        public decimal PaymentSuccessRate { get; set; }
        
        public string CurrencySymbol { get; set; } = "€";
    }
}
