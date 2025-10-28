using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.Models
{
    public class User // Remove inheritance from BaseEntity since User doesn't belong to another User
    {
        [Key]
        public int Id { get; set; }
        public required string Email { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string PasswordHash { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? SubscriptionExpiryDate { get; set; }
        public string? SubscriptionPlan { get; set; } // Basic, Premium, etc.
        public bool IsTrialUser { get; set; } = false;
        public bool IsAdmin { get; set; } = false;
        
        // Freemium subscription tier
        public string SubscriptionTier { get; set; } = "free"; // "free" or "premium"
        public DateTime? LastLoginDate { get; set; }
        
        // User Preferences
        public string? Currency { get; set; } = "USD";
        public string? DateFormat { get; set; } = "MM/DD/YYYY";
        public string? Language { get; set; } = "English";
        public bool EmailNotifications { get; set; } = true;
        public bool DarkMode { get; set; } = false;
        
        // OTP for password change
        public string? PasswordChangeOtp { get; set; }
        public DateTime? PasswordChangeOtpExpiry { get; set; }
        
        // Audit trail for User
        public DateTime DateEntered { get; set; } = DateTime.UtcNow;
        public string? EnteredBy { get; set; }
        public DateTime? DateModified { get; set; }
        public string? ModifiedBy { get; set; }
        
        // Navigation properties for multi-tenant support
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
        public ICollection<Product> Products { get; set; } = new List<Product>();
        public ICollection<SystemSetup> SystemSetups { get; set; } = new List<SystemSetup>();
        public ICollection<InvoiceTemplate> InvoiceTemplates { get; set; } = new List<InvoiceTemplate>();
        public ICollection<Client> Clients { get; set; } = new List<Client>();
        public ICollection<InvoiceQuota> InvoiceQuotas { get; set; } = new List<InvoiceQuota>();
        public Subscription? Subscription { get; set; }
    }
}
