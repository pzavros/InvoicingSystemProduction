using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.Models
{
    public enum SubscriptionStatus
    {
        Trial = 0,
        Active = 1,
        Expired = 2,
        Cancelled = 3,
        PaymentFailed = 4
    }

    public class Subscription : BaseEntity
    {
        [Required]
        public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Trial;
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public DateTime? TrialEndDate { get; set; }
        
        // Track if user has ever used a trial (to prevent multiple trials)
        public bool HasUsedTrial { get; set; } = false;
        
        [Required]
        public decimal MonthlyPrice { get; set; } = 20.00m; // €20
        
        public DateTime? LastPaymentDate { get; set; }
        
        public DateTime? NextPaymentDate { get; set; }
        
        public string? PaymentMethodId { get; set; } // For Stripe integration later
        
        public string? StripeCustomerId { get; set; } // For Stripe integration later
        
        public string? StripeSubscriptionId { get; set; } // For Stripe integration later
        
        public int PaymentFailureCount { get; set; } = 0;
        
        public DateTime? LastPaymentFailureDate { get; set; }
        
        // Track if subscription is cancelled but still active until period end
        public bool CancelAtPeriodEnd { get; set; } = false;
        
        public DateTime? CancellationDate { get; set; } // When user requested cancellation
        
        // Navigation properties
        public new User User { get; set; } = null!;
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
