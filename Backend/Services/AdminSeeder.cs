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
            // Check if any admin user exists
            var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.IsAdmin);
            if (existingAdmin != null) return;

            // Create default admin user
            var adminUser = new User
            {
                Email = "admin@invoicesystem.com",
                FirstName = "System",
                LastName = "Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"), // Default password
                IsActive = true,
                IsAdmin = true,
                IsTrialUser = false,
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
