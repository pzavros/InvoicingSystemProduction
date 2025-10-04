// DTOs/InvoiceSummaryDto.cs
namespace InvoicingBackend.DTOs
{
    public class InvoiceSummaryDto
    {
        public int InvoiceCount { get; set; }
        public decimal TotalAmount { get; set; }
    }
}