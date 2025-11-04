using Stripe;
using Stripe.Checkout;

namespace InvoicingBackend.Interfaces
{
    public interface IStripeService
    {
        // Customer operations
        Task<Customer> CreateCustomerAsync(string email, string name, Dictionary<string, string>? metadata = null);
        Task<Customer> GetCustomerAsync(string customerId);
        Task<Customer> UpdateCustomerAsync(string customerId, CustomerUpdateOptions options);

        // Subscription operations
        Task<Subscription> CreateSubscriptionAsync(string customerId, string priceId, Dictionary<string, string>? metadata = null);
        Task<Subscription> GetSubscriptionAsync(string subscriptionId);
        Task<Subscription> UpdateSubscriptionAsync(string subscriptionId, SubscriptionUpdateOptions options);
        Task<Subscription> CancelSubscriptionAsync(string subscriptionId, bool immediate = false);

        // Payment operations
        Task<PaymentIntent> CreatePaymentIntentAsync(long amount, string currency, string customerId, Dictionary<string, string>? metadata = null);
        Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId);
        Task<PaymentIntent> ConfirmPaymentIntentAsync(string paymentIntentId);

        // Checkout session
        Task<Session> CreateCheckoutSessionAsync(string customerId, string priceId, string successUrl, string cancelUrl, Dictionary<string, string>? metadata = null, int? trialPeriodDays = null);

        // Setup intent for trial
        Task<SetupIntent> CreateSetupIntentAsync(string customerId, Dictionary<string, string>? metadata = null);

        // Invoice operations
        Task<Invoice> GetUpcomingInvoiceAsync(string customerId);

        // Webhook handling
        Event ConstructWebhookEvent(string json, string signatureHeader);
    }
}
