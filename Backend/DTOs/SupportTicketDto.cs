namespace InvoicingBackend.DTOs
{
    public class SupportTicketDto
    {
        public int Id { get; set; }
        public required string ReferenceNumber { get; set; }
        public required string Type { get; set; }
        public required string Subject { get; set; }
        public required string Description { get; set; }
        public string Status { get; set; } = "Open";
        public string? Priority { get; set; }
        public string? AdminNotes { get; set; }
        public int UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public DateTime? LastUpdatedDate { get; set; }
    }

    public class CreateSupportTicketDto
    {
        public required string Type { get; set; }
        public required string Subject { get; set; }
        public required string Description { get; set; }
    }

    public class UpdateSupportTicketDto
    {
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public string? AdminNotes { get; set; }
    }
}
