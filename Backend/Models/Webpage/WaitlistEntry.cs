using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using InvoicingBackend.Models;

namespace Backend.Models.Webpage
{
    [Table("WaitlistEntries")]
    public class WaitlistEntry : BaseEntity
    {
        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(200)]
        public string? Company { get; set; }

        [Required]
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        public bool IsNotified { get; set; } = false;

        public DateTime? NotifiedAt { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "Active"; // Active, Notified, Converted

        [StringLength(500)]
        public string? Notes { get; set; }

        // Optional: Track source of signup
        [StringLength(100)]
        public string? Source { get; set; } // "Homepage", "CTA", "Navbar", etc.

        // Optional: IP Address for analytics (anonymized)
        [StringLength(45)]
        public string? IpAddress { get; set; }

        // Optional: User Agent for analytics
        [StringLength(500)]
        public string? UserAgent { get; set; }
    }
}
