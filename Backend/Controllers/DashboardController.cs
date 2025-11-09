using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using System.Collections.Generic; // Required for ActionResult<AnnualBreakdownDto>

namespace InvoicingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication for all endpoints
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
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

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            try
            {
                var userId = GetCurrentUserId();
                var stats = await _dashboardService.GetDashboardStatsAsync(userId);
                return Ok(stats);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("stats/monthly")] // Changed to avoid conflict and be more descriptive
        public async Task<ActionResult<MonthlyDashboardStatsDto>> GetDashboardStatsForMonthYear([FromQuery] int month, [FromQuery] int year)
        {
            if (month < 1 || month > 12)
            {
                return BadRequest("Month must be between 1 and 12.");
            }
            if (year < 1900 || year > DateTime.UtcNow.Year + 5) // Basic year validation
            {
                return BadRequest("Invalid year provided.");
            }
            
            try
            {
                var userId = GetCurrentUserId();
                var stats = await _dashboardService.GetDashboardStatsForMonthYearAsync(month, year, userId);
                return Ok(stats);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("annual-earnings/{year}")]
        public async Task<ActionResult<AnnualBreakdownDto>> GetAnnualEarningsBreakdown(int year)
        {
            if (year < 1900 || year > DateTime.UtcNow.Year + 5) // Basic year validation
            {
                return BadRequest("Invalid year provided.");
            }
            
            try
            {
                var userId = GetCurrentUserId();
                var breakdown = await _dashboardService.GetAnnualEarningsBreakdownAsync(year, userId);
                return Ok(breakdown);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("annual-invoice-counts/{year}")]
        public async Task<ActionResult<AnnualBreakdownDto>> GetAnnualInvoiceCountBreakdown(int year)
        {
            if (year < 1900 || year > DateTime.UtcNow.Year + 5) // Basic year validation
            {
                return BadRequest("Invalid year provided.");
            }
            
            try
            {
                var userId = GetCurrentUserId();
                var breakdown = await _dashboardService.GetAnnualInvoiceCountBreakdownAsync(year, userId);
                return Ok(breakdown);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("invoice-status")]
        public async Task<ActionResult<InvoiceStatusStatsDto>> GetInvoiceStatusStats()
        {
            try
            {
                var userId = GetCurrentUserId();
                var stats = await _dashboardService.GetInvoiceStatusStatsAsync(userId);
                return Ok(stats);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("client-performance")]
        public async Task<ActionResult<ClientPerformanceStatsDto>> GetClientPerformanceStats([FromQuery] int topCount = 10)
        {
            try
            {
                var userId = GetCurrentUserId();
                var stats = await _dashboardService.GetClientPerformanceStatsAsync(userId, topCount);
                return Ok(stats);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpGet("product-performance")]
        public async Task<ActionResult<ProductPerformanceStatsDto>> GetProductPerformanceStats([FromQuery] int topCount = 10)
        {
            try
            {
                var userId = GetCurrentUserId();
                var stats = await _dashboardService.GetProductPerformanceStatsAsync(userId, topCount);
                return Ok(stats);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
    }
}
