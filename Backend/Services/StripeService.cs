using Stripe;
using Stripe.Checkout;
using InvoicingBackend.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace InvoicingBackend.Services
{
    public class StripeService : IStripeService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<StripeService> _logger;

        public StripeService(IConfiguration configuration, ILogger<StripeService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            
            // Set Stripe API key - try both config formats
            var stripeSecretKey = _configuration["Stripe:SecretKey"] ?? _configuration["STRIPE_SECRET_KEY"];
            if (string.IsNullOrEmpty(stripeSecretKey) || stripeSecretKey == "your_stripe_secret_key_here")
            {
                _logger.LogWarning("Stripe secret key not configured. Stripe functionality will be disabled.");
            }
            else
            {
                StripeConfiguration.ApiKey = stripeSecretKey;
                _logger.LogInformation("Stripe API key configured successfully");
            }
        }

        private bool IsStripeConfigured()
        {
            var key = _configuration["Stripe:SecretKey"] ?? _configuration["STRIPE_SECRET_KEY"];
            return !string.IsNullOrEmpty(key) && key != "your_stripe_secret_key_here";
        }

        public async Task<Customer> CreateCustomerAsync(string email, string name, Dictionary<string, string>? metadata = null)
        {
            if (!IsStripeConfigured())
            {
                throw new InvalidOperationException("Stripe is not configured. Please add your Stripe API keys to the environment variables.");
            }

            var options = new CustomerCreateOptions
            {
                Email = email,
                Name = name,
                Metadata = metadata ?? new Dictionary<string, string>()
            };

            var service = new CustomerService();
            return await service.CreateAsync(options);
        }

        public async Task<Customer> GetCustomerAsync(string customerId)
        {
            var service = new CustomerService();
            return await service.GetAsync(customerId);
        }

        public async Task<Customer> UpdateCustomerAsync(string customerId, CustomerUpdateOptions options)
        {
            var service = new CustomerService();
            return await service.UpdateAsync(customerId, options);
        }

        public async Task<Stripe.Subscription> CreateSubscriptionAsync(string customerId, string priceId, Dictionary<string, string>? metadata = null)
        {
            var options = new SubscriptionCreateOptions
            {
                Customer = customerId,
                Items = new List<SubscriptionItemOptions>
                {
                    new SubscriptionItemOptions
                    {
                        Price = priceId,
                    },
                },
                PaymentBehavior = "default_incomplete",
                PaymentSettings = new SubscriptionPaymentSettingsOptions
                {
                    SaveDefaultPaymentMethod = "on_subscription"
                },
                Metadata = metadata ?? new Dictionary<string, string>(),
                Expand = new List<string> { "latest_invoice.payment_intent" }
            };

            var service = new Stripe.SubscriptionService();
            return await service.CreateAsync(options);
        }

        public async Task<Stripe.Subscription> GetSubscriptionAsync(string subscriptionId)
        {
            var service = new Stripe.SubscriptionService();
            return await service.GetAsync(subscriptionId);
        }

        public async Task<Stripe.Subscription> UpdateSubscriptionAsync(string subscriptionId, SubscriptionUpdateOptions options)
        {
            var service = new Stripe.SubscriptionService();
            return await service.UpdateAsync(subscriptionId, options);
        }

        public async Task<Stripe.Subscription> CancelSubscriptionAsync(string subscriptionId, bool immediate = false)
        {
            var service = new Stripe.SubscriptionService();
            
            if (immediate)
            {
                return await service.CancelAsync(subscriptionId);
            }
            else
            {
                // Cancel at period end
                var options = new SubscriptionUpdateOptions
                {
                    CancelAtPeriodEnd = true
                };
                return await service.UpdateAsync(subscriptionId, options);
            }
        }

        public async Task<PaymentIntent> CreatePaymentIntentAsync(long amount, string currency, string customerId, Dictionary<string, string>? metadata = null)
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = amount,
                Currency = currency,
                Customer = customerId,
                Metadata = metadata ?? new Dictionary<string, string>(),
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                }
            };

            var service = new PaymentIntentService();
            return await service.CreateAsync(options);
        }

        public async Task<PaymentIntent> GetPaymentIntentAsync(string paymentIntentId)
        {
            var service = new PaymentIntentService();
            return await service.GetAsync(paymentIntentId);
        }

        public async Task<PaymentIntent> ConfirmPaymentIntentAsync(string paymentIntentId)
        {
            var service = new PaymentIntentService();
            return await service.ConfirmAsync(paymentIntentId);
        }

        public async Task<Session> CreateCheckoutSessionAsync(
            string customerId,
            string priceId,
            string successUrl,
            string cancelUrl,
            Dictionary<string, string>? metadata = null,
            int? trialPeriodDays = null)
        {
            var options = new SessionCreateOptions
            {
                Customer = customerId,
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Price = priceId,
                        Quantity = 1,
                    },
                },
                Mode = "subscription",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                Metadata = metadata ?? new Dictionary<string, string>()
            };

            // Add trial period if specified
            if (trialPeriodDays.HasValue && trialPeriodDays.Value > 0)
            {
                options.SubscriptionData = new SessionSubscriptionDataOptions
                {
                    TrialPeriodDays = trialPeriodDays.Value
                };
            }

            var service = new SessionService();
            return await service.CreateAsync(options);
        }

        public async Task<SetupIntent> CreateSetupIntentAsync(string customerId, Dictionary<string, string>? metadata = null)
        {
            var options = new SetupIntentCreateOptions
            {
                Customer = customerId,
                PaymentMethodTypes = new List<string> { "card" },
                Metadata = metadata ?? new Dictionary<string, string>(),
                AutomaticPaymentMethods = new SetupIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                }
            };

            var service = new SetupIntentService();
            return await service.CreateAsync(options);
        }

        public async Task<Invoice> GetUpcomingInvoiceAsync(string customerId)
        {
            var options = new UpcomingInvoiceOptions
            {
                Customer = customerId
            };

            var service = new Stripe.InvoiceService();
            return await service.UpcomingAsync(options);
        }

        public Event ConstructWebhookEvent(string json, string signatureHeader)
        {
            var webhookSecret = _configuration["Stripe:WebhookSecret"] ?? _configuration["STRIPE_WEBHOOK_SECRET"];
            if (string.IsNullOrEmpty(webhookSecret))
            {
                throw new InvalidOperationException("Stripe webhook secret is not configured.");
            }

            try
            {
                // Allow API version mismatch for local development with Stripe CLI
                return EventUtility.ConstructEvent(json, signatureHeader, webhookSecret, throwOnApiVersionMismatch: false);
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Failed to construct Stripe webhook event");
                throw;
            }
        }
    }
}
