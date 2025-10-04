using InvoicingBackend.Data;
using InvoicingBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace InvoicingBackend.Services
{
    public static class UserSeeder
    {
        public static async Task SeedUsersAsync(ApplicationDbContext context)
        {
            // Check if any users exist
            if (await context.Users.AnyAsync())
            {
                return; // Users already exist
            }

            var now = DateTime.UtcNow;

            // Create admin user
            var adminUser = new User
            {
                Email = "admin@invoicing.com",
                FirstName = "Admin",
                LastName = "User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                IsActive = true,
                IsTrialUser = false,
                SubscriptionPlan = "Premium",
                SubscriptionExpiryDate = now.AddYears(1),
                EnteredBy = "System"
            };

            // Create demo user
            var demoUser = new User
            {
                Email = "demo@invoicing.com",
                FirstName = "Demo",
                LastName = "User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo123!"),
                IsActive = true,
                IsTrialUser = true,
                SubscriptionPlan = "Trial",
                SubscriptionExpiryDate = now.AddDays(30),
                EnteredBy = "System"
            };

            context.Users.AddRange(adminUser, demoUser);
            await context.SaveChangesAsync();

            // Create subscription records for the users
            var adminSubscription = new Subscription
            {
                UserId = adminUser.Id,
                Status = SubscriptionStatus.Active,
                StartDate = now,
                EndDate = now.AddYears(1),
                TrialEndDate = null, // Admin doesn't have trial
                MonthlyPrice = 20.00m,
                LastPaymentDate = now,
                NextPaymentDate = now.AddMonths(1),
                DateEntered = now,
                EnteredBy = "System"
            };

            var demoSubscription = new Subscription
            {
                UserId = demoUser.Id,
                Status = SubscriptionStatus.Trial,
                StartDate = now,
                EndDate = now.AddDays(30), // 30-day trial
                TrialEndDate = now.AddDays(30),
                MonthlyPrice = 20.00m,
                NextPaymentDate = now.AddDays(30),
                DateEntered = now,
                EnteredBy = "System"
            };

            context.Subscriptions.AddRange(adminSubscription, demoSubscription);
            await context.SaveChangesAsync();

            Console.WriteLine("✅ Demo users created:");
            Console.WriteLine("   Admin: admin@invoicing.com / Admin123!");
            Console.WriteLine("   Demo:  demo@invoicing.com / Demo123!");
        }
    }
}
