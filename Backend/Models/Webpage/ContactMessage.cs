using System.ComponentModel.DataAnnotations;
using InvoicingBackend.Models;

namespace Backend.Models.Webpage
{
    public class ContactMessage : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
        public bool IsReplied { get; set; } = false;
        public DateTime? RepliedAt { get; set; }
        public string? AdminNotes { get; set; }
        public string Status { get; set; } = "New"; // New, InProgress, Resolved, Closed
        public string? Source { get; set; } = "website"; // website, api, etc.
    }
}
