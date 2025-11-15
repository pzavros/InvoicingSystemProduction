using System;

namespace InvoicingBackend.DTOs
{
    public class MonthlyDataPointDto
    {
        public int Year { get; set; }
        public int Month { get; set; } // 1-12
        public string MonthName { get; set; } = null!; // e.g., "January"
        public decimal TotalAmount { get; set; }
        public int InvoiceCount { get; set; }
    }
}
