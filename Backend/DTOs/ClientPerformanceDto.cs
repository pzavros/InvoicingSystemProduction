namespace InvoicingBackend.DTOs
{
    public class ClientPerformanceStatsDto
    {
        public List<TopClientDto> TopClientsByRevenue { get; set; } = new List<TopClientDto>();
        public int TotalClients { get; set; }
        public int ActiveClients { get; set; }
        public int NewClientsThisMonth { get; set; }
        public decimal AverageRevenuePerClient { get; set; }
        public decimal AverageDaysToPayment { get; set; }
        public string CurrencySymbol { get; set; } = "€";
    }

    public class TopClientDto
    {
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public int InvoiceCount { get; set; }
        public decimal AverageInvoiceValue { get; set; }
        public DateTime? LastInvoiceDate { get; set; }
        public decimal AverageDaysToPayment { get; set; }
    }
}
