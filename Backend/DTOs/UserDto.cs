using System;

namespace InvoicingBackend.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public bool IsActive { get; set; }
        public DateTime? SubscriptionExpiryDate { get; set; }
        public string? SubscriptionPlan { get; set; }
        public bool IsTrialUser { get; set; }
        public bool IsAdmin { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public DateTime DateEntered { get; set; }
        public string? EnteredBy { get; set; }
        
                // User preferences
        public string? Currency { get; set; }
        public string? DateFormat { get; set; }
        public string? Language { get; set; }
        public bool EmailNotifications { get; set; }
        public bool DarkMode { get; set; }
    }
}
