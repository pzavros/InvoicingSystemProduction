namespace InvoicingBackend.DTOs
{
    public class InvoiceTemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TemplateData { get; set; } = string.Empty;
        public bool IsActive { get; set; } = false;
        public bool IsSystemTemplate { get; set; } = false;
        public int? DocumentTypeId { get; set; }
        public string? DocumentTypeName { get; set; }
        public byte[]? PreviewImage { get; set; }
        public DateTime DateEntered { get; set; }
    }

    public class CreateInvoiceTemplateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TemplateData { get; set; } = string.Empty;
        public int? DocumentTypeId { get; set; }
        public byte[]? PreviewImage { get; set; }
    }

    public class UpdateInvoiceTemplateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TemplateData { get; set; } = string.Empty;
        public int? DocumentTypeId { get; set; }
        public byte[]? PreviewImage { get; set; }
    }

    public class SetActiveTemplateDto
    {
        public int TemplateId { get; set; }
    }
}
