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
            // List of admin users to seed
            var adminUsers = new[]
            {
                new
                {
                    Email = "admin@invoicesystem.com",
                    FirstName = "System",
                    LastName = "Administrator",
                    Password = "Admin123!"
                },
                new
                {
                    Email = "support@e-nvoicing.com",
                    FirstName = "Support",
                    LastName = "Team",
                    Password = "Admin123!"
                }
            };

            foreach (var adminData in adminUsers)
            {
                // Check if this admin user already exists
                var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == adminData.Email);
                if (existingAdmin != null) continue;

                // Create admin user
                var adminUser = new User
                {
                    Email = adminData.Email,
                    FirstName = adminData.FirstName,
                    LastName = adminData.LastName,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminData.Password),
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
            }

            await context.SaveChangesAsync();
        }
    }
}
