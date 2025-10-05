using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Webpage
{
    public class WaitlistEntryCreateDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string Email { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string? Name { get; set; }

        [StringLength(200, ErrorMessage = "Company name cannot exceed 200 characters")]
        public string? Company { get; set; }

        [StringLength(100, ErrorMessage = "Source cannot exceed 100 characters")]
        public string? Source { get; set; }
    }

    public class WaitlistEntryDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Company { get; set; }
        public DateTime JoinedAt { get; set; }
        public bool IsNotified { get; set; }
        public DateTime? NotifiedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? Source { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class WaitlistEntryUpdateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(200)]
        public string? Company { get; set; }

        public bool? IsNotified { get; set; }

        [StringLength(50)]
        public string? Status { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }

    public class WaitlistStatsDto
    {
        public int TotalEntries { get; set; }
        public int TodayEntries { get; set; }
        public int WeekEntries { get; set; }
        public int MonthEntries { get; set; }
        public int NotifiedCount { get; set; }
        public int ActiveCount { get; set; }
        public Dictionary<string, int> SourceBreakdown { get; set; } = new();
        public Dictionary<string, int> DailySignups { get; set; } = new();
    }

    public class WaitlistExportDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string JoinedDate { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string IsNotified { get; set; } = string.Empty;
    }
}
