using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
using InvoicingBackend.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InvoicingBackend.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<SubscriptionService> _logger;
        private const decimal MONTHLY_PRICE = 20.00m; // €20
        private const int TRIAL_DAYS = 7;

        public SubscriptionService(ApplicationDbContext context, IEmailService emailService, ILogger<SubscriptionService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<SubscriptionDto?> GetUserSubscriptionAsync(int userId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

            if (subscription == null) return null;

            return MapToDto(subscription);
        }

        public async Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(int userId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

            if (subscription == null)
            {
                return new SubscriptionStatusDto
                {
                    IsActive = false,
                    IsTrialActive = false,
                    Status = "No Subscription",
                    MonthlyPrice = MONTHLY_PRICE,
                    RequiresPayment = true
                };
            }

            var now = DateTime.UtcNow;
            
            // Auto-expire trial if expired
            if (subscription.Status == SubscriptionStatus.Trial && 
                subscription.TrialEndDate.HasValue && 
                now >= subscription.TrialEndDate.Value)
            {
                subscription.Status = SubscriptionStatus.Expired;
                subscription.MarkAsModified(userId.ToString());
                
                // Update user tier to free
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.SubscriptionTier = "free";
                }
                
                await _context.SaveChangesAsync();
            }
            
            // Auto-cancel subscriptions marked for cancellation at period end
            if (subscription.CancelAtPeriodEnd && now >= subscription.EndDate)
            {
                subscription.Status = SubscriptionStatus.Cancelled;
                subscription.CancelAtPeriodEnd = false;
                subscription.TrialEndDate = null;
                subscription.MarkAsModified(userId.ToString());
                
                // Update user tier to free
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.SubscriptionTier = "free";
                }
                
                await _context.SaveChangesAsync();
            }
            
            // Auto-expire active subscription if expired (and not marked for cancellation, which is handled above)
            if (subscription.Status == SubscriptionStatus.Active && now >= subscription.EndDate && !subscription.CancelAtPeriodEnd)
            {
                subscription.Status = SubscriptionStatus.Expired;
                subscription.MarkAsModified(userId.ToString());
                
                // Update user tier to free
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.SubscriptionTier = "free";
                }
                
                await _context.SaveChangesAsync();
            }
            
            var isTrialActive = subscription.TrialEndDate.HasValue && now < subscription.TrialEndDate.Value;
            var isActive = subscription.Status == SubscriptionStatus.Active && now < subscription.EndDate;
            var daysUntilExpiry = isTrialActive 
                ? (int)(subscription.TrialEndDate!.Value - now).TotalDays
                : (int)(subscription.EndDate - now).TotalDays;

            return new SubscriptionStatusDto
            {
                IsActive = isActive || isTrialActive,
                IsTrialActive = isTrialActive,
                TrialEndDate = subscription.TrialEndDate,
                NextPaymentDate = subscription.NextPaymentDate,
                DaysUntilExpiry = Math.Max(0, daysUntilExpiry),
                MonthlyPrice = subscription.MonthlyPrice,
                Status = subscription.Status.ToString(),
                RequiresPayment = !isTrialActive && subscription.Status != SubscriptionStatus.Active
            };
        }

        public async Task<SubscriptionDto> CreateTrialSubscriptionAsync(int userId)
        {
            // Check if user already has a subscription
            var existingSubscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

            // Check if user has already used their free trial
            if (existingSubscription?.HasUsedTrial == true)
            {
                throw new InvalidOperationException("You have already used your free trial.");
            }

            if (existingSubscription != null)
            {
                throw new InvalidOperationException("User already has a subscription");
            }

            var now = DateTime.UtcNow;
            var trialEndDate = now.AddDays(TRIAL_DAYS);

            var subscription = new Subscription
            {
                UserId = userId,
                Status = SubscriptionStatus.Trial,
                StartDate = now,
                EndDate = trialEndDate, // Trial period
                TrialEndDate = trialEndDate,
                HasUsedTrial = true, // Mark that trial has been used
                MonthlyPrice = MONTHLY_PRICE,
                NextPaymentDate = trialEndDate,
                DateEntered = now,
                EnteredBy = userId.ToString()
            };

            _context.Subscriptions.Add(subscription);
            
            // Update user tier to premium during trial
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.SubscriptionTier = "premium";
            }
            
            await _context.SaveChangesAsync();

            // Send trial started email
            if (user != null)
            {
                try
                {
                    _logger.LogInformation("Attempting to send trial started email to {Email}", user.Email);
                    var dashboardUrl = "https://e-nvoicing.com/dashboard";
                    var result = await _emailService.SendTrialStartedEmailAsync(
                        user.Email,
                        $"{user.FirstName} {user.LastName}",
                        subscription.StartDate,
                        trialEndDate,
                        dashboardUrl
                    );
                    
                    if (result.Success)
                    {
                        _logger.LogInformation("Trial started email sent successfully to {Email}", user.Email);
                    }
                    else
                    {
                        _logger.LogError("Failed to send trial started email to {Email}: {Message}", user.Email, result.Message);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Exception while sending trial started email to {Email}", user.Email);
                    // Don't fail subscription creation if email fails
                }
            }
            else
            {
                _logger.LogWarning("User not found after creating trial subscription for UserId {UserId}", userId);
            }

            return MapToDto(subscription);
        }

        public async Task<bool> CancelSubscriptionAsync(int userId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

            if (subscription == null) return false;

            var now = DateTime.UtcNow;
            
            // If subscription has time remaining, mark for cancellation at period end
            if (subscription.Status == SubscriptionStatus.Active && subscription.EndDate > now)
            {
                // Keep subscription active until period end
                subscription.CancelAtPeriodEnd = true;
                subscription.CancellationDate = now;
                subscription.NextPaymentDate = null; // Prevent future charges
                subscription.MarkAsModified(userId.ToString());
            }
            else if (subscription.Status == SubscriptionStatus.Trial && subscription.TrialEndDate.HasValue && subscription.TrialEndDate.Value > now)
            {
                // For trial, also mark for cancellation at period end
                subscription.CancelAtPeriodEnd = true;
                subscription.CancellationDate = now;
                subscription.NextPaymentDate = null; // Prevent auto-billing after trial
                subscription.MarkAsModified(userId.ToString());
            }
            else
            {
                // Subscription already expired or no time remaining, cancel immediately
                subscription.Status = SubscriptionStatus.Cancelled;
                subscription.TrialEndDate = null;
                subscription.CancelAtPeriodEnd = false;
                subscription.CancellationDate = now;
                subscription.MarkAsModified(userId.ToString());

                // Downgrade user to free tier immediately
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.SubscriptionTier = "free";
                }
            }

            await _context.SaveChangesAsync();

            // Send cancellation email only if subscription had future time (not already expired)
            // If subscription was already expired, no need to send cancellation email
            var shouldSendEmail = subscription.CancelAtPeriodEnd || subscription.EndDate > now;
            
            if (shouldSendEmail)
            {
                var subscriptionUser = await _context.Users.FindAsync(userId);
                if (subscriptionUser != null)
                {
                    try
                    {
                        _logger.LogInformation("Attempting to send subscription cancelled email to {Email}", subscriptionUser.Email);
                        var accessEndDate = subscription.CancelAtPeriodEnd 
                            ? subscription.EndDate 
                            : DateTime.UtcNow;
                        var feedbackUrl = "https://e-nvoicing.com/feedback";
                        var planName = subscription.Status == SubscriptionStatus.Trial ? "Trial" : "Premium";
                        
                        var result = await _emailService.SendSubscriptionCancelledEmailAsync(
                            subscriptionUser.Email,
                            $"{subscriptionUser.FirstName} {subscriptionUser.LastName}",
                            subscription.CancellationDate ?? DateTime.UtcNow,
                            accessEndDate,
                            planName,
                            feedbackUrl
                        );
                        
                        if (result.Success)
                        {
                            _logger.LogInformation("Subscription cancelled email sent successfully to {Email}", subscriptionUser.Email);
                        }
                        else
                        {
                            _logger.LogError("Failed to send subscription cancelled email to {Email}: {Message}", subscriptionUser.Email, result.Message);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Exception while sending subscription cancelled email to {Email}", subscriptionUser.Email);
                        // Don't fail cancellation if email fails
                    }
                }
                else
                {
                    _logger.LogWarning("User not found when trying to send cancellation email for UserId {UserId}", userId);
                }
            }
            else
            {
                _logger.LogInformation("Skipping cancellation email for UserId {UserId} - subscription already expired", userId);
            }

            return true;
        }

        public async Task<bool> IsUserActiveSubscriberAsync(int userId)
        {
            var status = await GetSubscriptionStatusAsync(userId);
            return status.IsActive;
        }

        public async Task<bool> IsUserInTrialAsync(int userId)
        {
            var status = await GetSubscriptionStatusAsync(userId);
            return status.IsTrialActive;
        }

        public async Task<bool> HasUserTrialExpiredAsync(int userId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

            if (subscription?.TrialEndDate == null) return false;

            return DateTime.UtcNow > subscription.TrialEndDate;
        }

        public async Task<IEnumerable<PaymentDto>> GetUserPaymentsAsync(int userId)
        {
            var payments = await _context.Payments
                .Include(p => p.Subscription)
                .Where(p => p.Subscription.UserId == userId && !p.IsDeleted)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return payments.Select(MapToDto);
        }

        public async Task<PaymentDto> ProcessPaymentAsync(int userId, decimal amount, string? paymentMethodId = null)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

            var now = DateTime.UtcNow;

            // Check if this is a trial payment (€0.00)
            bool isTrial = amount == 0;

            // If no subscription exists (freemium user upgrading or starting trial), create one
            if (subscription == null)
            {
                if (isTrial)
                {
                    // Check if user has already used their free trial
                    var previousSubscription = await _context.Subscriptions
                        .Where(s => s.UserId == userId && s.IsDeleted)
                        .FirstOrDefaultAsync(s => s.HasUsedTrial);
                    
                    if (previousSubscription != null)
                    {
                        throw new InvalidOperationException("You have already used your free trial.");
                    }

                    // Create trial subscription
                    var trialEndDate = now.AddDays(TRIAL_DAYS);
                    subscription = new Subscription
                    {
                        UserId = userId,
                        MonthlyPrice = MONTHLY_PRICE,
                        StartDate = now,
                        EndDate = trialEndDate,
                        NextPaymentDate = trialEndDate,
                        Status = SubscriptionStatus.Trial,
                        TrialEndDate = trialEndDate,
                        HasUsedTrial = true, // Mark trial as used
                        PaymentFailureCount = 0,
                        DateEntered = now,
                        EnteredBy = userId.ToString()
                    };
                }
                else
                {
                    // Create regular premium subscription
                    subscription = new Subscription
                    {
                        UserId = userId,
                        MonthlyPrice = amount,
                        StartDate = now,
                        EndDate = now.AddMonths(1),
                        NextPaymentDate = now.AddMonths(1),
                        Status = SubscriptionStatus.Active,
                        TrialEndDate = null,
                        HasUsedTrial = false, // Direct payment, no trial
                        PaymentFailureCount = 0,
                        DateEntered = now,
                        EnteredBy = userId.ToString()
                    };
                }
                
                _context.Subscriptions.Add(subscription);
                
                // Upgrade user to premium tier
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.SubscriptionTier = "premium";
                    user.IsTrialUser = isTrial; // Set trial flag for trial payments
                }
                
                // Save to get the subscription ID
                await _context.SaveChangesAsync();
            }

            // Create payment record (even for €0.00 to track card authorization)
            var payment = new Payment
            {
                SubscriptionId = subscription.Id,
                Amount = amount,
                Currency = "EUR",
                Status = PaymentStatus.Succeeded,
                PaymentDate = now,
                ProcessedDate = now,
                PaymentMethodId = paymentMethodId,
                Description = isTrial 
                    ? "7-day free trial - Card authorization (€0.00)" 
                    : $"Monthly subscription payment - €{amount}",
                UserId = userId,
                DateEntered = now,
                EnteredBy = userId.ToString()
            };

            _context.Payments.Add(payment);

            // Update subscription only if it's a real payment (not trial)
            if (!isTrial)
            {
                subscription.Status = SubscriptionStatus.Active;
                subscription.LastPaymentDate = now;
                subscription.EndDate = now.AddMonths(1); // Extend by 1 month
                subscription.NextPaymentDate = now.AddMonths(1);
                subscription.PaymentFailureCount = 0;
                subscription.TrialEndDate = null; // Clear trial status when payment is made
                subscription.CancelAtPeriodEnd = false; // Clear cancellation flag
                subscription.CancellationDate = null; // Clear cancellation date
                subscription.MarkAsModified(userId.ToString());

                // Ensure user is upgraded to premium tier
                var currentUser = await _context.Users.FindAsync(userId);
                if (currentUser != null && currentUser.SubscriptionTier != "premium")
                {
                    currentUser.SubscriptionTier = "premium";
                    currentUser.IsTrialUser = false; // Clear trial flag for paid subscriptions
                }
            }

            await _context.SaveChangesAsync();

            // Send email for new premium subscriptions (not trial)
            if (subscription != null && !isTrial && subscription.Status == SubscriptionStatus.Active)
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    try
                    {
                        _logger.LogInformation("Attempting to send premium upgrade email to {Email}", user.Email);
                        var dashboardUrl = "https://e-nvoicing.com/dashboard";
                        var result = await _emailService.SendPremiumUpgradeEmailAsync(
                            user.Email,
                            $"{user.FirstName} {user.LastName}",
                            subscription.StartDate,
                            subscription.NextPaymentDate ?? subscription.EndDate,
                            subscription.MonthlyPrice,
                            dashboardUrl
                        );
                        
                        if (result.Success)
                        {
                            _logger.LogInformation("Premium upgrade email sent successfully to {Email}", user.Email);
                        }
                        else
                        {
                            _logger.LogError("Failed to send premium upgrade email to {Email}: {Message}", user.Email, result.Message);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Exception while sending premium upgrade email to {Email}", user.Email);
                        // Don't fail payment processing if email fails
                    }
                }
            }

            return MapToDto(payment);
        }

        public async Task<bool> ExtendSubscriptionAsync(int userId, int months = 1)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

            if (subscription == null) return false;

            subscription.EndDate = subscription.EndDate.AddMonths(months);
            subscription.NextPaymentDate = subscription.EndDate;
            subscription.MarkAsModified(userId.ToString());

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task ProcessExpiredSubscriptionsAsync()
        {
            var now = DateTime.UtcNow;
            var expiredSubscriptions = await _context.Subscriptions
                .Where(s => s.EndDate < now && 
                           s.Status == SubscriptionStatus.Active && 
                           !s.IsDeleted)
                .ToListAsync();

            foreach (var subscription in expiredSubscriptions)
            {
                subscription.Status = SubscriptionStatus.Expired;
                subscription.MarkAsModified("System");
            }

            if (expiredSubscriptions.Any())
            {
                await _context.SaveChangesAsync();
            }
        }

        public async Task SendPaymentRemindersAsync()
        {
            var now = DateTime.UtcNow;
            var reminderDate = now.AddDays(3); // Send reminder 3 days before payment

            var subscriptionsNeedingReminder = await _context.Subscriptions
                .Where(s => s.NextPaymentDate.HasValue &&
                           s.NextPaymentDate.Value <= reminderDate &&
                           s.Status == SubscriptionStatus.Active &&
                           !s.IsDeleted)
                .ToListAsync();

            // TODO: Implement email reminder logic
            // For now, just log or handle reminders as needed
        }

        // ============= FREEMIUM TIER MANAGEMENT =============

        public async Task<bool> IsPremiumUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            // Admins are always considered premium users
            if (user?.IsAdmin == true) return true;
            return user?.SubscriptionTier == SubscriptionLimits.PREMIUM_TIER;
        }

        public async Task<string> GetUserTierAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            // Admins are always considered premium
            if (user?.IsAdmin == true) return SubscriptionLimits.PREMIUM_TIER;
            return user?.SubscriptionTier ?? SubscriptionLimits.FREE_TIER;
        }

        public async Task<SubscriptionUsageDto> GetUsageStatsAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Clients)
                .Include(u => u.Products)
                .Include(u => u.InvoiceTemplates)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            // Admins are always considered premium
            var isPremium = user.IsAdmin || user.SubscriptionTier == SubscriptionLimits.PREMIUM_TIER;
            
            // Get counts
            var clientsCount = await _context.Clients.CountAsync(c => c.UserId == userId && !c.IsDeleted);
            var categoriesCount = await _context.ProductCategories.CountAsync(pc => pc.UserId == userId && !pc.IsDeleted);
            var productsCount = await _context.Products.CountAsync(p => p.UserId == userId && !p.IsDeleted);
            var templatesCount = await _context.InvoiceTemplates.CountAsync(t => t.UserId == userId && !t.IsDeleted);
            
            // Get current month's invoice quota
            var currentMonth = DateTime.UtcNow.ToString("yyyy-MM");
            var invoicesThisMonth = await GetCurrentMonthQuotaAsync(userId);
            
            // Calculate next reset date (first day of next month)
            var now = DateTime.UtcNow;
            var nextResetDate = new DateTime(now.Year, now.Month, 1).AddMonths(1);
            
            // Determine limits based on tier
            var maxClients = isPremium ? SubscriptionLimits.Premium.MaxClients : SubscriptionLimits.Free.MaxClients;
            var maxCategories = isPremium ? SubscriptionLimits.Premium.MaxCategories : SubscriptionLimits.Free.MaxCategories;
            var maxProducts = isPremium ? SubscriptionLimits.Premium.MaxProducts : SubscriptionLimits.Free.MaxProducts;
            var maxInvoices = isPremium ? SubscriptionLimits.Premium.MaxInvoicesPerMonth : SubscriptionLimits.Free.MaxInvoicesPerMonth;
            var maxTemplates = isPremium ? SubscriptionLimits.Premium.MaxTemplates : SubscriptionLimits.Free.MaxTemplates;
            
            return new SubscriptionUsageDto
            {
                Tier = user.SubscriptionTier,
                IsPremium = isPremium,
                
                ClientsCount = clientsCount,
                CategoriesCount = categoriesCount,
                ProductsCount = productsCount,
                InvoicesThisMonth = invoicesThisMonth,
                TemplatesCount = templatesCount,
                
                MaxClients = maxClients,
                MaxCategories = maxCategories,
                MaxProducts = maxProducts,
                MaxInvoicesPerMonth = maxInvoices,
                MaxTemplates = maxTemplates,
                
                CanCreateClient = isPremium || clientsCount < maxClients,
                CanCreateCategory = isPremium || categoriesCount < maxCategories,
                CanCreateProduct = isPremium || productsCount < maxProducts,
                CanCreateInvoice = isPremium || invoicesThisMonth < maxInvoices,
                CanCreateTemplate = isPremium,
                
                CurrentMonth = currentMonth,
                NextResetDate = nextResetDate
            };
        }

        public async Task<bool> CanCreateClientAsync(int userId)
        {
            var isPremium = await IsPremiumUserAsync(userId);
            if (isPremium) return true;
            
            var count = await _context.Clients.CountAsync(c => c.UserId == userId && !c.IsDeleted);
            return count < SubscriptionLimits.Free.MaxClients;
        }

        public async Task<bool> CanCreateCategoryAsync(int userId)
        {
            var isPremium = await IsPremiumUserAsync(userId);
            if (isPremium) return true;
            
            var count = await _context.ProductCategories.CountAsync(pc => pc.UserId == userId && !pc.IsDeleted);
            return count < SubscriptionLimits.Free.MaxCategories;
        }

        public async Task<bool> CanCreateProductAsync(int userId)
        {
            var isPremium = await IsPremiumUserAsync(userId);
            if (isPremium) return true;
            
            var count = await _context.Products.CountAsync(p => p.UserId == userId && !p.IsDeleted);
            return count < SubscriptionLimits.Free.MaxProducts;
        }

        public async Task<bool> CanCreateInvoiceAsync(int userId)
        {
            var isPremium = await IsPremiumUserAsync(userId);
            if (isPremium) return true;
            
            var invoicesThisMonth = await GetCurrentMonthQuotaAsync(userId);
            return invoicesThisMonth < SubscriptionLimits.Free.MaxInvoicesPerMonth;
        }

        public async Task<bool> CanCreateTemplateAsync(int userId)
        {
            // Templates are premium-only
            return await IsPremiumUserAsync(userId);
        }

        public async Task IncrementInvoiceQuotaAsync(int userId)
        {
            var currentMonth = DateTime.UtcNow.ToString("yyyy-MM");
            
            var quota = await _context.InvoiceQuotas
                .FirstOrDefaultAsync(q => q.UserId == userId && q.Month == currentMonth && !q.IsDeleted);
            
            if (quota == null)
            {
                // Create new quota record for this month
                quota = new InvoiceQuota
                {
                    UserId = userId,
                    Month = currentMonth,
                    InvoicesCreated = 1,
                    DateEntered = DateTime.UtcNow,
                    EnteredBy = userId.ToString()
                };
                _context.InvoiceQuotas.Add(quota);
            }
            else
            {
                // Increment existing quota
                quota.InvoicesCreated++;
                quota.MarkAsModified(userId.ToString());
            }
            
            await _context.SaveChangesAsync();
        }

        public async Task<int> GetCurrentMonthQuotaAsync(int userId)
        {
            var currentMonth = DateTime.UtcNow.ToString("yyyy-MM");
            
            var quota = await _context.InvoiceQuotas
                .FirstOrDefaultAsync(q => q.UserId == userId && q.Month == currentMonth && !q.IsDeleted);
            
            return quota?.InvoicesCreated ?? 0;
        }
        
        // ============= ADMIN OPERATIONS =============
        
        public async Task<bool> GrantPremiumAccessAsync(int userId, int months)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;
            
            // Update user tier to premium and clear trial flag
            user.SubscriptionTier = SubscriptionLimits.PREMIUM_TIER;
            user.IsTrialUser = false; // Clear trial flag
            
            var now = DateTime.UtcNow;
            var endDate = now.AddMonths(months);
            
            // Find or create subscription
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);
            
            if (subscription == null)
            {
                // Create new subscription
                subscription = new Subscription
                {
                    UserId = userId,
                    Status = SubscriptionStatus.Active,
                    StartDate = now,
                    EndDate = endDate,
                    TrialEndDate = null,
                    MonthlyPrice = 0.00m, // Admin granted - no charge
                    LastPaymentDate = now,
                    NextPaymentDate = endDate,
                    DateEntered = now,
                    EnteredBy = "Admin"
                };
                _context.Subscriptions.Add(subscription);
            }
            else
            {
                // Extend existing subscription
                subscription.Status = SubscriptionStatus.Active;
                subscription.EndDate = subscription.EndDate > now 
                    ? subscription.EndDate.AddMonths(months) 
                    : endDate;
                subscription.NextPaymentDate = subscription.EndDate;
                subscription.DateModified = now;
                subscription.ModifiedBy = "Admin";
            }
            
            await _context.SaveChangesAsync();
            return true;
        }
        
        // ============= MAPPING HELPERS =============
        
        private static SubscriptionDto MapToDto(Subscription subscription)
        {
            var now = DateTime.UtcNow;
            var isTrialActive = subscription.TrialEndDate.HasValue && now < subscription.TrialEndDate.Value;
            var isActive = subscription.Status == SubscriptionStatus.Active && now < subscription.EndDate;
            
            var effectiveEndDate = isTrialActive ? subscription.TrialEndDate!.Value : subscription.EndDate;
            var daysUntilExpiry = (int)Math.Ceiling((effectiveEndDate - now).TotalDays);
            var daysRemainingAfterCancellation = 0;
            
            if (subscription.CancelAtPeriodEnd)
            {
                daysRemainingAfterCancellation = (int)Math.Ceiling((effectiveEndDate - now).TotalDays);
            }
            
            return new SubscriptionDto
            {
                Id = subscription.Id,
                UserId = subscription.UserId ?? 0,
                Status = subscription.Status.ToString(),
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                TrialEndDate = subscription.TrialEndDate,
                MonthlyPrice = subscription.MonthlyPrice,
                LastPaymentDate = subscription.LastPaymentDate,
                NextPaymentDate = subscription.NextPaymentDate,
                IsTrialActive = isTrialActive,
                IsActive = isActive || isTrialActive,
                DaysUntilExpiry = daysUntilExpiry > 0 ? daysUntilExpiry : 0,
                CancelAtPeriodEnd = subscription.CancelAtPeriodEnd,
                CancellationDate = subscription.CancellationDate,
                DaysRemainingAfterCancellation = daysRemainingAfterCancellation > 0 ? daysRemainingAfterCancellation : 0
            };
        }
        
        private static PaymentDto MapToDto(Payment payment)
        {
            return new PaymentDto
            {
                Id = payment.Id,
                SubscriptionId = payment.SubscriptionId,
                Amount = payment.Amount,
                Currency = payment.Currency,
                Status = payment.Status.ToString(),
                PaymentDate = payment.PaymentDate,
                ProcessedDate = payment.ProcessedDate,
                FailureReason = payment.FailureReason,
                Description = payment.Description
            };
        }
    }
}
