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
        public bool IsAdmin { get; set; }
        public bool IsEmailVerified { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public DateTime DateEntered { get; set; }
        public string? EnteredBy { get; set; }
        
        // Subscription Status (derived from Subscriptions table)
        public string SubscriptionTier { get; set; } = "free"; // "free" or "premium"
        public string SubscriptionStatus { get; set; } = "Free"; // For display: "Free", "Trial", "Premium", "Premium (Granted)", "Admin"
        public DateTime? SubscriptionEndDate { get; set; } // When subscription expires
        public bool IsPremium { get; set; } = false;
        public bool IsInTrial { get; set; } = false;
        
        // User preferences
        public string? Currency { get; set; }
        public string? DateFormat { get; set; }
        public string? Language { get; set; }
        public bool EmailNotifications { get; set; }
        public bool DarkMode { get; set; }
    }
}
