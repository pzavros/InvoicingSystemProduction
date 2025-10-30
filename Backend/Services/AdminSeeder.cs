using InvoicingBackend.Data;
using InvoicingBackend.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace InvoicingBackend.Services
{
    public static class AdminSeeder
    {
        public static async Task SeedAdminUserAsync(ApplicationDbContext context)
        {
            // Single admin user to seed
            var adminEmail = "support@e-nvoicing.com";

            // Check if this admin user already exists
            var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
            if (existingAdmin != null) return;

            // Create admin user
            var adminUser = new User
            {
                Email = adminEmail,
                FirstName = "Support",
                LastName = "Team",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                IsActive = true,
                IsAdmin = true,
                IsTrialUser = false,
                IsEmailVerified = true, // Admin users are pre-verified
                SubscriptionExpiryDate = DateTime.UtcNow.AddYears(10), // Long expiry for admin
                SubscriptionPlan = "Admin",
                EnteredBy = "System",
                DateEntered = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
    }
}
