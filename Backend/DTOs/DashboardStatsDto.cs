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
        public decimal TotalAmountSelectedMonthYear { get; set; }
        public int InvoiceCountSelectedMonthYear { get; set; }
    }
}
