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
        
        // Subscription Maintenance
        Task ProcessExpiredSubscriptionsAsync(); // Background service
        Task SendPaymentRemindersAsync(); // Background service
        Task<bool> ExtendSubscriptionAsync(int userId, int months = 1);
    }
}
