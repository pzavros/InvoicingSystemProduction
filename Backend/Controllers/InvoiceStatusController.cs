// Controllers/InvoiceStatusController.cs
using InvoicingBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace InvoicingBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceStatusController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<InvoiceStatusController> _logger;

        public InvoiceStatusController(
            ApplicationDbContext context,
            ILogger<InvoiceStatusController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Manually trigger the overdue invoice check and update process
        /// </summary>
        [HttpPost("update-overdue")]
        public async Task<IActionResult> UpdateOverdueInvoices()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                
                _logger.LogInformation($"Manual overdue update triggered. Current date: {today:yyyy-MM-dd}");

                // Find all invoices that should be overdue
                var overdueInvoices = await _context.Invoices
                    .Where(i => i.StatusId == 2 && 
                                i.DueDate.Date < today &&
                                !i.IsDeleted)
                    .ToListAsync();

                if (!overdueInvoices.Any())
                {
                    _logger.LogInformation("No invoices found that need to be marked as overdue");
                    return Ok(new 
                    { 
                        message = "No overdue invoices found",
                        count = 0,
                        currentDate = today.ToString("yyyy-MM-dd")
                    });
                }

                _logger.LogInformation($"Found {overdueInvoices.Count} invoices to mark as overdue");

                var updatedInvoices = new List<object>();
                foreach (var invoice in overdueInvoices)
                {
                    var oldStatus = invoice.StatusId;
                    invoice.StatusId = 5; // Set to Overdue
                    
                    var daysOverdue = (today - invoice.DueDate.Date).Days;
                    
                    updatedInvoices.Add(new
                    {
                        invoiceId = invoice.Id,
                        invoiceNumber = invoice.InvoiceNumber,
                        dueDate = invoice.DueDate.ToString("yyyy-MM-dd"),
                        daysOverdue = daysOverdue,
                        oldStatusId = oldStatus,
                        newStatusId = 5
                    });
                    
                    _logger.LogInformation(
                        $"Marked invoice {invoice.InvoiceNumber} (ID: {invoice.Id}) as overdue " +
                        $"(Due: {invoice.DueDate:yyyy-MM-dd}, {daysOverdue} days overdue)");
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Successfully updated {overdueInvoices.Count} invoices to Overdue status");

                return Ok(new 
                { 
                    message = $"Successfully updated {overdueInvoices.Count} invoices to Overdue status",
                    count = overdueInvoices.Count,
                    currentDate = today.ToString("yyyy-MM-dd"),
                    updatedInvoices = updatedInvoices
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating overdue invoices manually");
                return StatusCode(500, new { message = "Error updating overdue invoices", error = ex.Message });
            }
        }

        /// <summary>
        /// Get statistics about invoice statuses including overdue candidates
        /// </summary>
        [HttpGet("status-stats")]
        public async Task<IActionResult> GetStatusStats()
        {
            try
            {
                var today = DateTime.UtcNow.Date;

                // Get all status counts
                var statusCounts = await _context.Invoices
                    .Where(i => !i.IsDeleted)
                    .GroupBy(i => i.StatusId)
                    .Select(g => new { StatusId = g.Key, Count = g.Count() })
                    .ToListAsync();

                // Get status names
                var statuses = await _context.Statuses.ToDictionaryAsync(s => s.StatusId, s => s.Name);

                // Count invoices that should be overdue but aren't yet
                var shouldBeOverdue = await _context.Invoices
                    .Where(i => i.StatusId == 2 && 
                                i.DueDate.Date < today &&
                                !i.IsDeleted)
                    .CountAsync();

                // Get sample of unpaid invoices with dates
                var unpaidInvoices = await _context.Invoices
                    .Where(i => i.StatusId == 2 && !i.IsDeleted)
                    .Select(i => new
                    {
                        invoiceNumber = i.InvoiceNumber,
                        dueDate = i.DueDate.ToString("yyyy-MM-dd"),
                        isPastDue = i.DueDate.Date < today,
                        daysOverdue = i.DueDate.Date < today ? (today - i.DueDate.Date).Days : 0
                    })
                    .OrderBy(i => i.dueDate)
                    .Take(10)
                    .ToListAsync();

                var result = new
                {
                    currentDate = today.ToString("yyyy-MM-dd"),
                    statusBreakdown = statusCounts.Select(sc => new
                    {
                        statusId = sc.StatusId,
                        statusName = sc.StatusId.HasValue && statuses.ContainsKey(sc.StatusId.Value) 
                            ? statuses[sc.StatusId.Value] 
                            : "Unknown",
                        count = sc.Count
                    }),
                    invoicesThatShouldBeOverdue = shouldBeOverdue,
                    sampleUnpaidInvoices = unpaidInvoices
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting status stats");
                return StatusCode(500, new { message = "Error getting status stats", error = ex.Message });
            }
        }
    }
}
