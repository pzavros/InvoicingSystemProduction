// Services/InvoiceStatusUpdateService.cs
using InvoicingBackend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace InvoicingBackend.Services
{
    /// <summary>
    /// Background service that periodically checks for unpaid invoices that are past their due date
    /// and automatically updates them to "Overdue" status.
    /// </summary>
    public class InvoiceStatusUpdateService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<InvoiceStatusUpdateService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Check every hour

        public InvoiceStatusUpdateService(
            IServiceProvider serviceProvider,
            ILogger<InvoiceStatusUpdateService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Invoice Status Update Service started");

            // Run immediately on startup
            await UpdateOverdueInvoicesAsync(stoppingToken);

            // Then run periodically
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(_checkInterval, stoppingToken);
                    await UpdateOverdueInvoicesAsync(stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Service is stopping
                    _logger.LogInformation("Invoice Status Update Service is stopping");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Invoice Status Update Service");
                    // Continue running despite errors
                }
            }
        }

        private async Task UpdateOverdueInvoicesAsync(CancellationToken cancellationToken)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    
                    var today = DateTime.UtcNow.Date;
                    
                    // Find all invoices that are:
                    // 1. Status is Unpaid (StatusId = 2)
                    // 2. DueDate is in the past
                    // 3. Not deleted (IsDeleted = false)
                    var overdueInvoices = await context.Invoices
                        .Where(i => i.StatusId == 2 && 
                                    i.DueDate.Date < today &&
                                    !i.IsDeleted)
                        .ToListAsync(cancellationToken);

                    if (overdueInvoices.Any())
                    {
                        _logger.LogInformation($"Found {overdueInvoices.Count} invoices to mark as overdue");

                        foreach (var invoice in overdueInvoices)
                        {
                            invoice.StatusId = 5; // Set to Overdue
                            
                            var daysOverdue = (today - invoice.DueDate.Date).Days;
                            _logger.LogInformation(
                                $"Marked invoice {invoice.InvoiceNumber} (ID: {invoice.Id}) as overdue " +
                                $"(Due: {invoice.DueDate:yyyy-MM-dd}, {daysOverdue} days overdue)");
                        }

                        await context.SaveChangesAsync(cancellationToken);
                        _logger.LogInformation($"Successfully updated {overdueInvoices.Count} invoices to Overdue status");
                    }
                    else
                    {
                        _logger.LogDebug("No overdue invoices found");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating overdue invoices");
                throw;
            }
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Invoice Status Update Service stopped");
            return base.StopAsync(cancellationToken);
        }
    }
}
