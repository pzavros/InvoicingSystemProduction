using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Webpage
{
    public class ContactMessageDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "First name is required")]
        [StringLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required")]
        [StringLength(100, ErrorMessage = "Last name cannot exceed 100 characters")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Subject is required")]
        [StringLength(200, ErrorMessage = "Subject cannot exceed 200 characters")]
        public string Subject { get; set; } = string.Empty;

        [Required(ErrorMessage = "Message is required")]
        [StringLength(2000, ErrorMessage = "Message cannot exceed 2000 characters")]
        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public bool IsReplied { get; set; }
        public DateTime? RepliedAt { get; set; }
        public string? AdminNotes { get; set; }
        public string Status { get; set; } = "New";
        public string? Source { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateContactMessageDto
    {
        [Required(ErrorMessage = "First name is required")]
        [StringLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Last name is required")]
        [StringLength(100, ErrorMessage = "Last name cannot exceed 100 characters")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Subject is required")]
        [StringLength(200, ErrorMessage = "Subject cannot exceed 200 characters")]
        public string Subject { get; set; } = string.Empty;

        [Required(ErrorMessage = "Message is required")]
        [StringLength(2000, ErrorMessage = "Message cannot exceed 2000 characters")]
        public string Message { get; set; } = string.Empty;

        public string? Source { get; set; } = "website";
    }

    public class ContactMessageStatsDto
    {
        public int TotalMessages { get; set; }
        public int NewMessages { get; set; }
        public int InProgressMessages { get; set; }
        public int ResolvedMessages { get; set; }
        public int TodayMessages { get; set; }
        public int WeekMessages { get; set; }
        public int MonthMessages { get; set; }
        public Dictionary<string, int> StatusBreakdown { get; set; } = new();
        public Dictionary<string, int> SourceBreakdown { get; set; } = new();
    }
}
