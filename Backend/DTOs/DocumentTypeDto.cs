namespace InvoicingBackend.DTOs
{
    public class DocumentTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string NumberPrefix { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Category { get; set; } = "Invoice"; // "Invoice" or "Proforma"
        public bool CountsForLogistics { get; set; } = true;
        public bool RequiresTaxInfo { get; set; } = false;
        public bool IsQuotation { get; set; } = false;
        public bool IsProforma { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }
}
