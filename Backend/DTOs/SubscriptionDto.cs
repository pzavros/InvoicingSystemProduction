namespace InvoicingBackend.DTOs
{
    public class SubscriptionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? TrialEndDate { get; set; }
        public decimal MonthlyPrice { get; set; }
        public DateTime? LastPaymentDate { get; set; }
        public DateTime? NextPaymentDate { get; set; }
        public int PaymentFailureCount { get; set; }
        public bool IsTrialActive { get; set; }
        public int DaysUntilExpiry { get; set; }
        public bool IsActive { get; set; }
    }

    public class PaymentDto
    {
        public int Id { get; set; }
        public int SubscriptionId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "EUR";
        public string Status { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public DateTime? ProcessedDate { get; set; }
        public string? FailureReason { get; set; }
        public string? Description { get; set; }
    }

    public class CreateSubscriptionDto
    {
        public int UserId { get; set; }
        public string? PaymentMethodId { get; set; } // For future Stripe integration
    }

    public class SubscriptionStatusDto
    {
        public bool IsActive { get; set; }
        public bool IsTrialActive { get; set; }
        public DateTime? TrialEndDate { get; set; }
        public DateTime? NextPaymentDate { get; set; }
        public int DaysUntilExpiry { get; set; }
        public decimal MonthlyPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool RequiresPayment { get; set; }
    }
}
