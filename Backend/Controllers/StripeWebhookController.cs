using Microsoft.AspNetCore.Mvc;
using Stripe;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StripeWebhookController : ControllerBase
    {
        private readonly IStripeService _stripeService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<StripeWebhookController> _logger;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public StripeWebhookController(
            IStripeService stripeService,
            ApplicationDbContext context,
            ILogger<StripeWebhookController> logger,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _stripeService = stripeService;
            _context = context;
            _logger = logger;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> HandleWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            try
            {
                var stripeSignature = Request.Headers["Stripe-Signature"];
                var stripeEvent = _stripeService.ConstructWebhookEvent(json, stripeSignature!);

                _logger.LogInformation("Processing Stripe webhook: {EventType}", stripeEvent.Type);

                // Handle the event
                switch (stripeEvent.Type)
                {
                    case "checkout.session.completed":
                        await HandleCheckoutSessionCompleted(stripeEvent);
                        break;

                    case "customer.subscription.created":
                        await HandleSubscriptionCreated(stripeEvent);
                        break;

                    case "customer.subscription.updated":
                        await HandleSubscriptionUpdated(stripeEvent);
                        break;

                    case "customer.subscription.deleted":
                        await HandleSubscriptionDeleted(stripeEvent);
                        break;

                    case "invoice.payment_succeeded":
                        await HandleInvoicePaymentSucceeded(stripeEvent);
                        break;

                    case "invoice.payment_failed":
                        await HandleInvoicePaymentFailed(stripeEvent);
                        break;

                    case "setup_intent.succeeded":
                        await HandleSetupIntentSucceeded(stripeEvent);
                        break;

                    default:
                        _logger.LogInformation("Unhandled event type: {EventType}", stripeEvent.Type);
                        break;
                }

                return Ok();
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe webhook error");
                return BadRequest();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook");
                return StatusCode(500);
            }
        }

        private async Task HandleCheckoutSessionCompleted(Event stripeEvent)
        {
            var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
            if (session == null) return;

            _logger.LogInformation("Checkout session completed: {SessionId} for customer {CustomerId}, metadata: {@Metadata}", 
                session.Id, session.CustomerId, session.Metadata);

            // Get user ID from metadata
            if (!session.Metadata.TryGetValue("user_id", out var userIdStr) || 
                !int.TryParse(userIdStr, out var userId))
            {
                var metadataKeys = session.Metadata != null ? string.Join(", ", session.Metadata.Keys) : "none";
                _logger.LogWarning("No user_id found in checkout session metadata. Metadata keys: {Keys}", metadataKeys);
                return;
            }

            // Check if it's a trial
            var isTrial = session.Metadata.TryGetValue("is_trial", out var isTrialStr) && 
                          bool.TryParse(isTrialStr, out var trial) && trial;

            _logger.LogInformation("Processing checkout for user {UserId}, isTrial: {IsTrial}, customerId: {CustomerId}, subscriptionId: {SubscriptionId}", 
                userId, isTrial, session.CustomerId, session.SubscriptionId);

            // Get the actual Stripe subscription to get correct dates
            Stripe.Subscription? stripeSubscription = null;
            if (!string.IsNullOrEmpty(session.SubscriptionId))
            {
                try
                {
                    stripeSubscription = await _stripeService.GetSubscriptionAsync(session.SubscriptionId);
                    _logger.LogInformation("Retrieved Stripe subscription: CurrentPeriodEnd={End}, TrialEnd={TrialEnd}, Status={Status}", 
                        stripeSubscription.CurrentPeriodEnd, stripeSubscription.TrialEnd, stripeSubscription.Status);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to retrieve Stripe subscription {SubscriptionId}", session.SubscriptionId);
                }
            }

            // Get or create subscription record
            var dbSubscription = await _context.Subscriptions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

            if (dbSubscription == null)
            {
                // Create new subscription
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogError("User not found: {UserId}", userId);
                    return;
                }

                dbSubscription = new Models.Subscription
                {
                    UserId = userId,
                    User = user,
                    StripeCustomerId = session.CustomerId,
                    StripeSubscriptionId = session.SubscriptionId,
                    Status = Models.SubscriptionStatus.Active,
                    StartDate = DateTime.UtcNow,
                    MonthlyPrice = isTrial ? 0 : GetMonthlyPrice(),
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "Stripe"
                };

                // Use Stripe subscription dates if available
                if (stripeSubscription != null)
                {
                    dbSubscription.EndDate = stripeSubscription.CurrentPeriodEnd;
                    dbSubscription.NextPaymentDate = stripeSubscription.CurrentPeriodEnd;
                    
                    if (stripeSubscription.TrialEnd.HasValue && stripeSubscription.TrialEnd.Value > DateTime.UtcNow)
                    {
                        dbSubscription.TrialEndDate = stripeSubscription.TrialEnd;
                        dbSubscription.HasUsedTrial = true;
                        dbSubscription.MonthlyPrice = 0;
                    }
                }
                else
                {
                    // Fallback to manual calculation if Stripe subscription not available
                    if (isTrial)
                    {
                        dbSubscription.TrialEndDate = DateTime.UtcNow.AddDays(7);
                        dbSubscription.EndDate = DateTime.UtcNow.AddDays(7);
                        dbSubscription.HasUsedTrial = true;
                    }
                    else
                    {
                        dbSubscription.EndDate = DateTime.UtcNow.AddMonths(1);
                        dbSubscription.NextPaymentDate = DateTime.UtcNow.AddMonths(1);
                    }
                }

                _context.Subscriptions.Add(dbSubscription);
            }
            else
            {
                // Update existing subscription
                dbSubscription.StripeCustomerId = session.CustomerId;
                dbSubscription.StripeSubscriptionId = session.SubscriptionId;
                dbSubscription.Status = Models.SubscriptionStatus.Active;
                dbSubscription.StartDate = DateTime.UtcNow;

                // Use Stripe subscription dates if available
                if (stripeSubscription != null)
                {
                    dbSubscription.EndDate = stripeSubscription.CurrentPeriodEnd;
                    dbSubscription.NextPaymentDate = stripeSubscription.CurrentPeriodEnd;
                    
                    if (stripeSubscription.TrialEnd.HasValue && stripeSubscription.TrialEnd.Value > DateTime.UtcNow)
                    {
                        dbSubscription.TrialEndDate = stripeSubscription.TrialEnd;
                        dbSubscription.HasUsedTrial = true;
                        dbSubscription.MonthlyPrice = 0;
                    }
                    else
                    {
                        dbSubscription.MonthlyPrice = GetMonthlyPrice();
                    }
                }
                else
                {
                    // Fallback to manual calculation
                    if (isTrial)
                    {
                        dbSubscription.TrialEndDate = DateTime.UtcNow.AddDays(7);
                        dbSubscription.EndDate = DateTime.UtcNow.AddDays(7);
                        dbSubscription.MonthlyPrice = 0;
                        dbSubscription.HasUsedTrial = true;
                    }
                    else
                    {
                        dbSubscription.EndDate = DateTime.UtcNow.AddMonths(1);
                        dbSubscription.NextPaymentDate = DateTime.UtcNow.AddMonths(1);
                        dbSubscription.MonthlyPrice = GetMonthlyPrice();
                    }
                }

                dbSubscription.MarkAsModified("Stripe");
            }

            // Upgrade user to premium - ensure User is loaded and tracked
            var userToUpdate = dbSubscription.User ?? await _context.Users.FindAsync(userId);
            if (userToUpdate != null)
            {
                userToUpdate.SubscriptionTier = "premium";
                userToUpdate.IsTrialUser = isTrial; // Set trial flag appropriately
                _context.Entry(userToUpdate).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                _logger.LogInformation("User {UserId} upgraded to premium tier (isTrial: {IsTrial})", userId, isTrial);
            }
            else
            {
                _logger.LogError("Could not find user {UserId} to update subscription tier", userId);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription successfully created/updated for user {UserId}, tier={Tier}", 
                userId, userToUpdate?.SubscriptionTier ?? "unknown");

            // Send welcome email
            if (userToUpdate != null)
            {
                try
                {
                    if (isTrial)
                    {
                        // Send trial started email
                        var trialEndDate = dbSubscription.TrialEndDate ?? DateTime.UtcNow.AddDays(7);
                        await _emailService.SendTrialStartedEmailAsync(
                            userToUpdate.Email,
                            $"{userToUpdate.FirstName} {userToUpdate.LastName}",
                            DateTime.UtcNow,
                            trialEndDate,
                            "https://e-nvoicing.com/app/dashboard"
                        );
                        _logger.LogInformation("Trial started email sent to {Email}", userToUpdate.Email);
                    }
                    else
                    {
                        // Send premium upgrade email
                        await _emailService.SendPremiumUpgradeEmailAsync(
                            userToUpdate.Email,
                            $"{userToUpdate.FirstName} {userToUpdate.LastName}",
                            DateTime.UtcNow,
                            dbSubscription.NextPaymentDate ?? DateTime.UtcNow.AddMonths(1),
                            GetMonthlyPrice(),
                            "https://e-nvoicing.com/app/dashboard"
                        );
                        _logger.LogInformation("Premium upgrade email sent to {Email}", userToUpdate.Email);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send welcome email for user {UserId}", userId);
                }
            }
        }

        private async Task HandleSubscriptionCreated(Event stripeEvent)
        {
            var subscription = stripeEvent.Data.Object as Stripe.Subscription;
            if (subscription == null) return;

            _logger.LogInformation("Subscription created: {SubscriptionId} for customer {CustomerId}", 
                subscription.Id, subscription.CustomerId);

            // Update our database
            var dbSubscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.StripeCustomerId == subscription.CustomerId && !s.IsDeleted);

            if (dbSubscription != null)
            {
                dbSubscription.StripeSubscriptionId = subscription.Id;
                dbSubscription.Status = Models.SubscriptionStatus.Active;
                dbSubscription.StartDate = DateTime.UtcNow;
                dbSubscription.EndDate = subscription.CurrentPeriodEnd;
                dbSubscription.NextPaymentDate = subscription.CurrentPeriodEnd;
                dbSubscription.MarkAsModified("Stripe");
                
                await _context.SaveChangesAsync();
            }
        }

        private async Task HandleSubscriptionUpdated(Event stripeEvent)
        {
            var subscription = stripeEvent.Data.Object as Stripe.Subscription;
            if (subscription == null) return;

            _logger.LogInformation("Subscription updated: {SubscriptionId}", subscription.Id);

            var dbSubscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.StripeSubscriptionId == subscription.Id && !s.IsDeleted);

            if (dbSubscription != null)
            {
                // Update status based on Stripe subscription status
                dbSubscription.Status = subscription.Status switch
                {
                    "active" => Models.SubscriptionStatus.Active,
                    "canceled" => Models.SubscriptionStatus.Cancelled,
                    "past_due" => Models.SubscriptionStatus.PaymentFailed,
                    _ => dbSubscription.Status
                };
                
                dbSubscription.EndDate = subscription.CurrentPeriodEnd;
                dbSubscription.NextPaymentDate = subscription.CurrentPeriodEnd;
                dbSubscription.CancelAtPeriodEnd = subscription.CancelAtPeriodEnd;
                dbSubscription.MarkAsModified("Stripe");
                
                await _context.SaveChangesAsync();
            }
        }

        private async Task HandleSubscriptionDeleted(Event stripeEvent)
        {
            var subscription = stripeEvent.Data.Object as Stripe.Subscription;
            if (subscription == null) return;

            _logger.LogInformation("Subscription deleted: {SubscriptionId}", subscription.Id);

            var dbSubscription = await _context.Subscriptions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StripeSubscriptionId == subscription.Id && !s.IsDeleted);

            if (dbSubscription != null)
            {
                dbSubscription.Status = Models.SubscriptionStatus.Cancelled;
                dbSubscription.CancellationDate = DateTime.UtcNow;
                dbSubscription.MarkAsModified("Stripe");
                
                // Downgrade user to free tier
                if (dbSubscription.User != null)
                {
                    dbSubscription.User.SubscriptionTier = "free";
                }
                
                await _context.SaveChangesAsync();
            }
        }

        private async Task HandleInvoicePaymentSucceeded(Event stripeEvent)
        {
            var invoice = stripeEvent.Data.Object as Invoice;
            if (invoice == null) return;

            _logger.LogInformation("Invoice payment succeeded: {InvoiceId} for customer {CustomerId}", 
                invoice.Id, invoice.CustomerId);

            var dbSubscription = await _context.Subscriptions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StripeCustomerId == invoice.CustomerId && !s.IsDeleted);

            if (dbSubscription != null)
            {
                // Record payment
                var payment = new Models.Payment
                {
                    SubscriptionId = dbSubscription.Id,
                    Amount = invoice.AmountPaid / 100m, // Convert from cents
                    Currency = invoice.Currency.ToUpper(),
                    Status = Models.PaymentStatus.Succeeded,
                    PaymentDate = DateTime.UtcNow,
                    ProcessedDate = DateTime.UtcNow,
                    StripePaymentIntentId = invoice.PaymentIntentId,
                    Description = $"Monthly subscription payment - Invoice {invoice.Number}",
                    UserId = dbSubscription.UserId,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "Stripe"
                };

                _context.Payments.Add(payment);

                // Update subscription
                dbSubscription.LastPaymentDate = DateTime.UtcNow;
                dbSubscription.PaymentFailureCount = 0;
                dbSubscription.LastPaymentFailureDate = null;
                dbSubscription.Status = Models.SubscriptionStatus.Active;
                
                // Fetch the Stripe subscription to get the next payment date
                if (!string.IsNullOrEmpty(dbSubscription.StripeSubscriptionId))
                {
                    try
                    {
                        var stripeSubscription = await _stripeService.GetSubscriptionAsync(dbSubscription.StripeSubscriptionId);
                        if (stripeSubscription != null)
                        {
                            dbSubscription.NextPaymentDate = stripeSubscription.CurrentPeriodEnd;
                            _logger.LogInformation("Updated NextPaymentDate to {NextPaymentDate} from Stripe subscription", 
                                dbSubscription.NextPaymentDate);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Could not fetch Stripe subscription to update NextPaymentDate, using fallback");
                        dbSubscription.NextPaymentDate = DateTime.UtcNow.AddMonths(1);
                    }
                }
                else
                {
                    dbSubscription.NextPaymentDate = DateTime.UtcNow.AddMonths(1);
                }
                
                dbSubscription.MarkAsModified("Stripe");

                // Ensure user is premium - explicitly mark as modified
                var userToUpdate = dbSubscription.User ?? await _context.Users.FindAsync(dbSubscription.UserId);
                if (userToUpdate != null)
                {
                    userToUpdate.SubscriptionTier = "premium";
                    userToUpdate.IsTrialUser = false; // Clear trial flag on successful payment
                    _context.Entry(userToUpdate).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                    _logger.LogInformation("User {UserId} confirmed as premium tier after payment", dbSubscription.UserId);
                }

                await _context.SaveChangesAsync();

                // Send payment confirmation email
                if (dbSubscription.User != null)
                {
                    try
                    {
                        _logger.LogInformation("Sending payment success email to {Email}, amount €{Amount}", 
                            dbSubscription.User.Email, invoice.AmountPaid / 100m);
                        
                        // Use Stripe's hosted invoice URL if available, otherwise subscription page
                        var invoiceUrl = invoice.HostedInvoiceUrl ?? "https://e-nvoicing.com/app/subscription";
                        
                        // Ensure we have a valid next payment date
                        var nextBillingDate = dbSubscription.NextPaymentDate ?? DateTime.UtcNow.AddMonths(1);
                        _logger.LogInformation("NextPaymentDate for email: {NextPaymentDate}", nextBillingDate);
                        
                        await _emailService.SendPaymentSuccessEmailAsync(
                            dbSubscription.User.Email,
                            $"{dbSubscription.User.FirstName} {dbSubscription.User.LastName}",
                            invoice.AmountPaid / 100m,
                            invoice.Currency.ToUpper(),
                            DateTime.UtcNow,
                            nextBillingDate,
                            invoiceUrl
                        );
                        _logger.LogInformation("Payment success email sent successfully");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send payment confirmation email");
                    }
                }
            }
        }

        private async Task HandleInvoicePaymentFailed(Event stripeEvent)
        {
            var invoice = stripeEvent.Data.Object as Invoice;
            if (invoice == null) return;

            _logger.LogWarning("Invoice payment failed: {InvoiceId} for customer {CustomerId}", 
                invoice.Id, invoice.CustomerId);

            var dbSubscription = await _context.Subscriptions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StripeCustomerId == invoice.CustomerId && !s.IsDeleted);

            if (dbSubscription != null)
            {
                // Record failed payment
                var payment = new Models.Payment
                {
                    SubscriptionId = dbSubscription.Id,
                    Amount = invoice.AmountDue / 100m,
                    Currency = invoice.Currency.ToUpper(),
                    Status = Models.PaymentStatus.Failed,
                    PaymentDate = DateTime.UtcNow,
                    FailureReason = "Payment failed",
                    Description = $"Failed payment attempt - Invoice {invoice.Number}",
                    UserId = dbSubscription.UserId,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = "Stripe"
                };

                _context.Payments.Add(payment);

                // Update subscription
                dbSubscription.PaymentFailureCount++;
                dbSubscription.LastPaymentFailureDate = DateTime.UtcNow;
                dbSubscription.Status = Models.SubscriptionStatus.PaymentFailed;
                dbSubscription.MarkAsModified("Stripe");

                await _context.SaveChangesAsync();

                // Send payment failure notification
                if (dbSubscription.User != null)
                {
                    try
                    {
                        _logger.LogWarning("Sending payment failure email to {Email}, amount €{Amount}", 
                            dbSubscription.User.Email, invoice.AmountDue / 100m);
                        
                        var updatePaymentUrl = "https://e-nvoicing.com/app/subscription"; // Link to update payment method
                        await _emailService.SendPaymentFailedEmailAsync(
                            dbSubscription.User.Email,
                            $"{dbSubscription.User.FirstName} {dbSubscription.User.LastName}",
                            invoice.AmountDue / 100m,
                            invoice.Currency,
                            invoice.PaymentIntent?.LastPaymentError?.Message ?? "Payment declined by your bank",
                            updatePaymentUrl
                        );
                        _logger.LogInformation("Payment failure email sent successfully");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send payment failure email");
                    }
                }
            }
        }

        private Task HandleSetupIntentSucceeded(Event stripeEvent)
        {
            var setupIntent = stripeEvent.Data.Object as SetupIntent;
            if (setupIntent == null) return Task.CompletedTask;

            _logger.LogInformation("Setup intent succeeded: {SetupIntentId} for customer {CustomerId}", 
                setupIntent.Id, setupIntent.CustomerId);

            // This is triggered when a trial user adds their payment method
            // The subscription will be created separately
            return Task.CompletedTask;
        }

        private decimal GetMonthlyPrice()
        {
            var priceString = _configuration["SUBSCRIPTION_MONTHLY_PRICE"] ?? "13.99";
            return decimal.Parse(priceString);
        }
    }
}
