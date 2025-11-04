using InvoicingBackend.DTOs;

namespace InvoicingBackend.Interfaces
{
    public interface ISubscriptionService
    {
        // Subscription Management
        Task<SubscriptionDto?> GetUserSubscriptionAsync(int userId);
        Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(int userId);
        Task<SubscriptionDto> CreateTrialSubscriptionAsync(int userId);
        Task<bool> CancelSubscriptionAsync(int userId);
        
        // Subscription Status Checks
        Task<bool> IsUserActiveSubscriberAsync(int userId);
        Task<bool> IsUserInTrialAsync(int userId);
        Task<bool> HasUserTrialExpiredAsync(int userId);
        
        // Payment Management
        Task<IEnumerable<PaymentDto>> GetUserPaymentsAsync(int userId);
        Task<PaymentDto> ProcessPaymentAsync(int userId, decimal amount, string? paymentMethodId = null);
        
        // Stripe Integration
        Task<string> CreateSetupIntentAsync(int userId);
        Task<string> CreateCheckoutSessionAsync(int userId, string successUrl, string cancelUrl, bool isTrial = false);
        Task<string> GetOrCreateStripeCustomerAsync(int userId);
        Task SyncStripeSubscriptionAsync(int userId);
        
        // Subscription Maintenance
        Task ProcessExpiredSubscriptionsAsync(); // Background service
        Task SendPaymentRemindersAsync(); // Background service
        Task<bool> ExtendSubscriptionAsync(int userId, int months = 1);
        
        // Freemium Tier Management
        Task<bool> IsPremiumUserAsync(int userId);
        Task<string> GetUserTierAsync(int userId);
        Task<SubscriptionUsageDto> GetUsageStatsAsync(int userId);
        
        // Limit Checks
        Task<bool> CanCreateClientAsync(int userId);
        Task<bool> CanCreateCategoryAsync(int userId);
        Task<bool> CanCreateProductAsync(int userId);
        Task<bool> CanCreateInvoiceAsync(int userId);
        Task<bool> CanCreateTemplateAsync(int userId);
        
        // Quota Management
        Task IncrementInvoiceQuotaAsync(int userId);
        Task<int> GetCurrentMonthQuotaAsync(int userId);
        
        // Admin Operations
        Task<bool> GrantPremiumAccessAsync(int userId, int months);
    }
}
