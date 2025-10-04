using System.Collections.Generic;

namespace InvoicingBackend.DTOs
{
    public class AnnualBreakdownDto
    {
        public List<MonthlyDataPointDto> MonthlyStats { get; set; }

        public AnnualBreakdownDto()
        {
            MonthlyStats = new List<MonthlyDataPointDto>();
        }
    }
}
