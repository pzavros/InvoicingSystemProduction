using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.Models
{
    public class InvoiceTemplate : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        // JSON string containing the template data (invoice form fields)
        [Required]
        public string TemplateData { get; set; } = string.Empty;
        
        // Whether this is the active template for the user
        public bool IsActive { get; set; } = false;
        
        // Whether this is a system default template
        public bool IsSystemTemplate { get; set; } = false;
        
        // Document type this template supports (optional - null means all types)
        public int? DocumentTypeId { get; set; }
        public DocumentType? DocumentType { get; set; }
        
        // Preview image/thumbnail (optional)
        public byte[]? PreviewImage { get; set; }
        
        // Navigation property to User (for multi-tenancy)
        public new User? User { get; set; }
    }
}
