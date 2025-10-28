// Controllers/InvoicesController.cs

using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using InvoicingBackend.Models;

namespace InvoicingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication for all endpoints
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;
        private readonly ISubscriptionService _subscriptionService;

        public InvoicesController(IInvoiceService invoiceService, ISubscriptionService subscriptionService)
        {
            _invoiceService = invoiceService;
            _subscriptionService = subscriptionService;
        }

        // Helper method to get current user ID from JWT token
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }

        // GET: api/invoice
        [HttpGet]
        public async Task<IActionResult> GetInvoices()
        {
            try
            {
                var userId = GetCurrentUserId();
                var invoices = await _invoiceService.GetAllInvoicesAsync(userId);
                return Ok(invoices);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    new { message = "An error occurred while fetching the invoices.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoiceById(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var invoice = await _invoiceService.GetInvoiceById(id, userId);
                return Ok(invoice);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Invoice not found." });
            }
        }

        // POST: api/invoice
        [HttpPost]
        public async Task<IActionResult> CreateInvoice([FromBody] InvoiceDto invoiceDto)
        {
            if (invoiceDto == null)
                return BadRequest(new { message = "Invalid invoice data." });

            try
            {
                var userId = GetCurrentUserId();
                
                // Check subscription limit for free tier
                var canCreate = await _subscriptionService.CanCreateInvoiceAsync(userId);
                if (!canCreate)
                {
                    var usage = await _subscriptionService.GetUsageStatsAsync(userId);
                    return StatusCode(403, new 
                    { 
                        message = $"You have reached your monthly invoice limit ({usage.InvoicesThisMonth}/{usage.MaxInvoicesPerMonth}). Upgrade to premium for unlimited invoices.",
                        limitReached = true,
                        resource = "invoices",
                        current = usage.InvoicesThisMonth,
                        max = usage.MaxInvoicesPerMonth,
                        resetDate = usage.NextResetDate
                    });
                }
                
                var created = await _invoiceService.CreateInvoiceAsync(invoiceDto, userId);
                
                // Increment the invoice quota for free tier users
                await _subscriptionService.IncrementInvoiceQuotaAsync(userId);
                
                return CreatedAtAction(nameof(GetInvoiceById), new { id = created.Id }, created);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    new { message = "An error occurred while creating the invoice.", error = ex.Message });
            }
        }

        // PUT: api/invoice/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInvoice(int id, [FromBody] InvoiceDto invoiceDto)
        {
            if (invoiceDto == null)
                return BadRequest(new { message = "Invalid invoice data." });

            try
            {
                var userId = GetCurrentUserId();
                var result = await _invoiceService.UpdateInvoiceAsync(id, invoiceDto, userId);
                if (!result)
                    return NotFound(new { message = "Invoice not found." });

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    new { message = "An error occurred while updating the invoice.", error = ex.Message });
            }
        }

        // DELETE: api/invoice/{id}
        // NOTE: Deleting an invoice does NOT free up the monthly quota for free tier users
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInvoice(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _invoiceService.DeleteInvoiceAsync(id, userId);
                if (!result)
                    return NotFound(new { message = "Invoice not found." });

                // IMPORTANT: We do NOT decrement the invoice quota when deleting
                // This is by design to prevent abuse of the free tier
                
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    new { message = "An error occurred while deleting the invoice.", error = ex.Message });
            }
        }

        // GET: api/invoice/currencies
        [HttpGet("currencies")]
        public async Task<IActionResult> GetCurrencies()
        {
            try
            {
                var currencies = await _invoiceService.GetCurrenciesAsync();
                return Ok(currencies);
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    new { message = "An error occurred while fetching currencies.", error = ex.Message });
            }
        }

        [HttpGet("statuses")]
        public async Task<IActionResult> GetAllStatuses()
        {
            var statuses = await _invoiceService.GetAllStatusesAsync();
            return Ok(statuses);
        }

        // PUT: api/invoice/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateInvoiceStatus(int id, [FromBody] StatusUpdateRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Invalid status data." });
            }

            try
            {
                var userId = GetCurrentUserId();
                var result = await _invoiceService.UpdateInvoiceStatusAsync(id, request.StatusId, userId);
                if (!result)
                {
                    return NotFound(new { message = "Invoice not found." });
                }
                return NoContent(); // Successfully updated
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex) // Catch specific exception for invalid status ID
            {
                return BadRequest(new { message = ex.Message }); // Return bad request if status ID is invalid
            }
            catch (Exception ex)
            {
                // Log the exception details (ex)
                return StatusCode(500, new { message = "An error occurred while updating the invoice status.", error = ex.Message });
            }
        }

        // POST: api/invoices/bulk-status
        [HttpPost("bulk-status")]
        public async Task<IActionResult> UpdateBulkInvoiceStatus([FromBody] BulkStatusUpdateRequest request)
        {
            if (request == null || request.InvoiceIds == null || !request.InvoiceIds.Any())
            {
                return BadRequest(new { message = "Invalid bulk status update request. Invoice IDs are required." });
            }

            try
            {
                var userId = GetCurrentUserId();
                var result = await _invoiceService.UpdateBulkInvoiceStatusAsync(request.InvoiceIds, request.StatusId, userId);

                if (!result)
                {
                    return BadRequest(new { message = "Failed to update status for one or more invoices. Check if IDs and Status ID are valid." });
                }

                return Ok(new { message = $"Successfully updated status for {request.InvoiceIds.Count()} invoices." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating bulk invoice statuses.", error = ex.Message });
            }
        }

        // Add a simple class to represent the request body for status update
        public class StatusUpdateRequest
        {
            public int StatusId { get; set; }
        }

        public class BulkStatusUpdateRequest
        {
            public required IEnumerable<int> InvoiceIds { get; set; }
            public int StatusId { get; set; }
        }
    }
}
