using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
using InvoicingBackend.Utils;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ApplicationDbContext _context;
        private const decimal MONTHLY_PRICE = 20.00m; // €20
        private const int TRIAL_DAYS = 7;

        public SubscriptionService(ApplicationDbContext context)
        {
            _context = context;
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
                MonthlyPrice = MONTHLY_PRICE,
                NextPaymentDate = trialEndDate,
                DateEntered = now,
                EnteredBy = userId.ToString()
            };

            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            return MapToDto(subscription);
        }

        public async Task<bool> CancelSubscriptionAsync(int userId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);

            if (subscription == null) return false;

            subscription.Status = SubscriptionStatus.Cancelled;
            subscription.MarkAsModified(userId.ToString());

            // Downgrade user to free tier
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.SubscriptionTier = "free";
            }

            await _context.SaveChangesAsync();
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

            // If no subscription exists (freemium user upgrading to premium), create one
            if (subscription == null)
            {
                subscription = new Subscription
                {
                    UserId = userId,
                    MonthlyPrice = amount,
                    StartDate = now,
                    EndDate = now.AddMonths(1),
                    NextPaymentDate = now.AddMonths(1),
                    Status = SubscriptionStatus.Active,
                    TrialEndDate = null,
                    PaymentFailureCount = 0,
                    DateEntered = now,
                    EnteredBy = userId.ToString()
                };
                _context.Subscriptions.Add(subscription);
                
                // Upgrade user to premium tier
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.SubscriptionTier = "premium";
                }
                
                // Save to get the subscription ID
                await _context.SaveChangesAsync();
            }

            // For now, we'll simulate successful payment (manual implementation)
            // Later you can integrate with Stripe here
            var payment = new Payment
            {
                SubscriptionId = subscription.Id,
                Amount = amount,
                Currency = "EUR",
                Status = PaymentStatus.Succeeded, // Simulating success for now
                PaymentDate = now,
                ProcessedDate = now,
                PaymentMethodId = paymentMethodId,
                Description = $"Monthly subscription payment - €{amount}",
                UserId = userId,
                DateEntered = now,
                EnteredBy = userId.ToString()
            };

            _context.Payments.Add(payment);

            // Update subscription
            subscription.Status = SubscriptionStatus.Active;
            subscription.LastPaymentDate = now;
            subscription.EndDate = now.AddMonths(1); // Extend by 1 month
            subscription.NextPaymentDate = now.AddMonths(1);
            subscription.PaymentFailureCount = 0;
            subscription.MarkAsModified(userId.ToString());

            await _context.SaveChangesAsync();

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
            return user?.SubscriptionTier == SubscriptionLimits.PREMIUM_TIER;
        }

        public async Task<string> GetUserTierAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
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

            var isPremium = user.SubscriptionTier == SubscriptionLimits.PREMIUM_TIER;
            
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

        private SubscriptionDto MapToDto(Subscription subscription)
        {
            var now = DateTime.UtcNow;
            var isTrialActive = subscription.TrialEndDate.HasValue && now < subscription.TrialEndDate.Value;
            var isActive = subscription.Status == SubscriptionStatus.Active && now < subscription.EndDate;
            var daysUntilExpiry = isTrialActive 
                ? (int)(subscription.TrialEndDate!.Value - now).TotalDays
                : (int)(subscription.EndDate - now).TotalDays;

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
                PaymentFailureCount = subscription.PaymentFailureCount,
                IsTrialActive = isTrialActive,
                DaysUntilExpiry = Math.Max(0, daysUntilExpiry),
                IsActive = isActive || isTrialActive
            };
        }

        private PaymentDto MapToDto(Payment payment)
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
