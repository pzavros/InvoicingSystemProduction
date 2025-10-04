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
        public DateTime? LastLoginDate { get; set; }
        public DateTime DateEntered { get; set; }
        public string? EnteredBy { get; set; }
    }
}
