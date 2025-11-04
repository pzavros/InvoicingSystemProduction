using InvoicingBackend.Data;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Services
{
    public class SubscriptionReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<SubscriptionReminderService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(6); // Check every 6 hours

        public SubscriptionReminderService(
            IServiceProvider serviceProvider,
            ILogger<SubscriptionReminderService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Subscription Reminder Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckTrialEndingReminders();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Subscription Reminder Service");
                }

                // Wait before next check
                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("Subscription Reminder Service stopped");
        }

        private async Task CheckTrialEndingReminders()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            var now = DateTime.UtcNow;
            var threeDaysFromNow = now.AddDays(3);
            var fourDaysFromNow = now.AddDays(4); // To ensure we only catch trials ending in 3-4 days

            // Find trials ending in the next 3-4 days that haven't received reminder yet
            var trialsEndingSoon = await context.Subscriptions
                .Include(s => s.User)
                .Where(s => !s.IsDeleted &&
                           s.Status == SubscriptionStatus.Trial &&
                           s.TrialEndDate.HasValue &&
                           s.TrialEndDate.Value >= threeDaysFromNow &&
                           s.TrialEndDate.Value <= fourDaysFromNow &&
                           !s.ReminderSent) // Only if reminder not already sent
                .ToListAsync();

            if (trialsEndingSoon.Any())
            {
                _logger.LogInformation("Found {Count} trials ending soon, sending reminders", trialsEndingSoon.Count);
            }

            foreach (var subscription in trialsEndingSoon)
            {
                if (subscription.User == null) continue;

                try
                {
                    // Skip if trial end date is null (shouldn't happen based on query, but safety check)
                    if (subscription.TrialEndDate == null)
                    {
                        _logger.LogWarning("Subscription {Id} has null TrialEndDate, skipping reminder", subscription.Id);
                        continue;
                    }

                    var monthlyPrice = decimal.Parse(configuration["SUBSCRIPTION_MONTHLY_PRICE"] ?? "13.99");
                    var updatePaymentUrl = "https://e-nvoicing.com/app/subscription";

                    _logger.LogInformation("Sending trial ending reminder to {Email}, trial ends {EndDate}", 
                        subscription.User.Email, subscription.TrialEndDate);

                    var result = await emailService.SendTrialEndingReminderEmailAsync(
                        subscription.User.Email,
                        $"{subscription.User.FirstName} {subscription.User.LastName}",
                        subscription.TrialEndDate.Value,
                        monthlyPrice,
                        updatePaymentUrl
                    );

                    if (result.Success)
                    {
                        // Mark reminder as sent
                        subscription.ReminderSent = true;
                        subscription.MarkAsModified("System");
                        await context.SaveChangesAsync();
                        
                        _logger.LogInformation("Trial ending reminder sent successfully to {Email}", subscription.User.Email);
                    }
                    else
                    {
                        _logger.LogWarning("Failed to send trial ending reminder to {Email}: {Message}", 
                            subscription.User.Email, result.Message);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending trial ending reminder to {Email}", subscription.User?.Email);
                }
            }
        }
    }
}
