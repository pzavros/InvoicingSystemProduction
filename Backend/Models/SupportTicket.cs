using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.Models
{
    public class SupportTicket
    {
        [Key]
        public int Id { get; set; }
        
        public required string ReferenceNumber { get; set; } // e.g., "ST-20231109-001"
        
        public required string Type { get; set; } // "issue", "bug", "feature", "other"
        
        public required string Subject { get; set; }
        
        public required string Description { get; set; }
        
        public string Status { get; set; } = "Open"; // "Open", "In Progress", "Resolved", "Closed"
        
        public string? Priority { get; set; } = "Medium"; // "Low", "Medium", "High", "Urgent"
        
        public string? AdminNotes { get; set; }
        
        // User information
        public int UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        
        // Timestamps
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedDate { get; set; }
        public DateTime? LastUpdatedDate { get; set; }
        
        // Navigation property
        public virtual User? User { get; set; }
    }
}
