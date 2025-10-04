using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

namespace InvoicingBackend.Data
{
    public class DesignTimeApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile($"appsettings.{environment}.json", optional: true)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

            if (string.Equals(environment, "Development", StringComparison.OrdinalIgnoreCase))
            {
                optionsBuilder.UseSqlite(connectionString);
            }
            else
            {
                optionsBuilder.UseSqlServer(connectionString);
            }

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}
