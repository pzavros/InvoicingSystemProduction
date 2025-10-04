using System.ComponentModel.DataAnnotations;

namespace InvoicingBackend.Models
{
    public enum PaymentStatus
    {
        Pending = 0,
        Succeeded = 1,
        Failed = 2,
        Cancelled = 3,
        Refunded = 4
    }

    public class Payment : BaseEntity
    {
        [Required]
        public int SubscriptionId { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        public string Currency { get; set; } = "EUR";
        
        [Required]
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        
        [Required]
        public DateTime PaymentDate { get; set; }
        
        public DateTime? ProcessedDate { get; set; }
        
        public string? PaymentMethodId { get; set; } // For Stripe
        
        public string? StripePaymentIntentId { get; set; } // For Stripe
        
        public string? FailureReason { get; set; }
        
        public string? Description { get; set; }
        
        // Navigation properties
        public Subscription Subscription { get; set; } = null!;
    }
}
