using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.Models
{
    public class InvoiceQuota : BaseEntity
    {
        [Required]
        public string Month { get; set; } = string.Empty; // Format: "YYYY-MM"
        
        [Required]
        public int InvoicesCreated { get; set; } = 0;
        
        // Navigation property
        public new User User { get; set; } = null!;
    }
}
