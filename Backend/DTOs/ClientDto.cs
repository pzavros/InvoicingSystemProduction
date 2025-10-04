namespace InvoicingBackend.DTOs
{
    public class ClientDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Company { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; }
        public int DefaultPaymentTerms { get; set; }
        public int? PreferredCurrencyId { get; set; }
        public CurrencyDto? PreferredCurrency { get; set; }
        public decimal TotalInvoiceAmount { get; set; }
        public int TotalInvoiceCount { get; set; }
        public DateTime? LastInvoiceDate { get; set; }
        public DateTime DateEntered { get; set; }
        public DateTime? DateModified { get; set; }
    }

    public class CreateClientDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Company { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public int DefaultPaymentTerms { get; set; } = 30;
        public int? PreferredCurrencyId { get; set; }
    }

    public class UpdateClientDto : CreateClientDto
    {
        public int Id { get; set; }
    }
}
