using Backend.DTOs.Webpage;
using Backend.Interfaces.Webpage;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Backend.Controllers.Webpage
{
    [ApiController]
    [Route("api/webpage/[controller]")]
    public class WaitlistController : ControllerBase
    {
        private readonly IWaitlistService _waitlistService;
        private readonly ILogger<WaitlistController> _logger;

        public WaitlistController(IWaitlistService waitlistService, ILogger<WaitlistController> logger)
        {
            _waitlistService = waitlistService;
            _logger = logger;
        }

        /// <summary>
        /// Add a new entry to the waitlist
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(WaitlistEntryDto), 201)]
        [ProducesResponseType(typeof(object), 400)]
        [ProducesResponseType(typeof(object), 409)]
        public async Task<ActionResult<WaitlistEntryDto>> AddToWaitlist([FromBody] WaitlistEntryCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = "Invalid input data", errors = ModelState });
                }

                // Get client IP and User Agent for analytics
                var ipAddress = GetClientIpAddress();
                var userAgent = Request.Headers["User-Agent"].ToString();

                var waitlistEntry = await _waitlistService.AddToWaitlistAsync(createDto, ipAddress, userAgent);

                return CreatedAtAction(
                    nameof(GetWaitlistEntry),
                    new { id = waitlistEntry.Id },
                    waitlistEntry
                );
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
            {
                return Conflict(new { message = "Email already exists in waitlist" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to waitlist");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Check if an email exists in the waitlist
        /// </summary>
        [HttpGet("check-email/{email}")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<ActionResult<object>> CheckEmail(string email)
        {
            try
            {
                var exists = await _waitlistService.EmailExistsAsync(email);
                return Ok(new { exists, email });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking email");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get waitlist entry by ID (Admin only)
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(WaitlistEntryDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<WaitlistEntryDto>> GetWaitlistEntry(int id)
        {
            try
            {
                var entry = await _waitlistService.GetWaitlistEntryAsync(id);
                if (entry == null)
                {
                    return NotFound(new { message = "Waitlist entry not found" });
                }

                return Ok(entry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting waitlist entry");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get all waitlist entries with pagination (Admin only)
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<WaitlistEntryDto>), 200)]
        public async Task<ActionResult<IEnumerable<WaitlistEntryDto>>> GetWaitlistEntries(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? status = null,
            [FromQuery] string? source = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 50;

                var entries = await _waitlistService.GetWaitlistEntriesPaginatedAsync(page, pageSize, status, source);
                var totalCount = await _waitlistService.GetTotalCountAsync();

                Response.Headers["X-Total-Count"] = totalCount.ToString();
                Response.Headers["X-Page"] = page.ToString();
                Response.Headers["X-Page-Size"] = pageSize.ToString();

                return Ok(entries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting waitlist entries");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Update waitlist entry (Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(WaitlistEntryDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<WaitlistEntryDto>> UpdateWaitlistEntry(int id, [FromBody] WaitlistEntryUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = "Invalid input data", errors = ModelState });
                }

                var updatedEntry = await _waitlistService.UpdateWaitlistEntryAsync(id, updateDto);
                if (updatedEntry == null)
                {
                    return NotFound(new { message = "Waitlist entry not found" });
                }

                return Ok(updatedEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating waitlist entry");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Mark waitlist entry as notified (Admin only)
        /// </summary>
        [HttpPost("{id}/notify")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> MarkAsNotified(int id)
        {
            try
            {
                var success = await _waitlistService.MarkAsNotifiedAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Waitlist entry not found" });
                }

                return Ok(new { message = "Entry marked as notified successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking entry as notified");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Mark multiple entries as notified (Admin only)
        /// </summary>
        [HttpPost("notify-batch")]
        [ProducesResponseType(200)]
        public async Task<ActionResult> MarkMultipleAsNotified([FromBody] IEnumerable<int> ids)
        {
            try
            {
                var success = await _waitlistService.MarkAsNotifiedAsync(ids);
                if (!success)
                {
                    return BadRequest(new { message = "Failed to update entries" });
                }

                return Ok(new { message = "Entries marked as notified successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking multiple entries as notified");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Delete waitlist entry (Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> DeleteWaitlistEntry(int id)
        {
            try
            {
                var success = await _waitlistService.RemoveFromWaitlistAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Waitlist entry not found" });
                }

                return Ok(new { message = "Waitlist entry deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting waitlist entry");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get waitlist statistics (Admin only)
        /// </summary>
        [HttpGet("stats")]
        [ProducesResponseType(typeof(WaitlistStatsDto), 200)]
        public async Task<ActionResult<WaitlistStatsDto>> GetWaitlistStats()
        {
            try
            {
                var stats = await _waitlistService.GetWaitlistStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting waitlist stats");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Export waitlist data as CSV (Admin only)
        /// </summary>
        [HttpGet("export")]
        [ProducesResponseType(200)]
        public async Task<ActionResult> ExportWaitlist()
        {
            try
            {
                var exportData = await _waitlistService.GetWaitlistForExportAsync();
                
                var csv = GenerateCsv(exportData);
                var bytes = System.Text.Encoding.UTF8.GetBytes(csv);

                return File(bytes, "text/csv", $"waitlist-export-{DateTime.UtcNow:yyyyMMdd-HHmmss}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting waitlist");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get signup analytics by date range (Admin only)
        /// </summary>
        [HttpGet("analytics")]
        [ProducesResponseType(typeof(Dictionary<string, int>), 200)]
        public async Task<ActionResult<Dictionary<string, int>>> GetSignupAnalytics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var start = startDate ?? DateTime.UtcNow.AddDays(-30);
                var end = endDate ?? DateTime.UtcNow;

                var analytics = await _waitlistService.GetSignupsByDateRangeAsync(start, end);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting signup analytics");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private string GetClientIpAddress()
        {
            var forwarded = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwarded))
            {
                return forwarded.Split(',')[0].Trim();
            }

            var realIp = Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
            {
                return realIp;
            }

            return Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        private static string GenerateCsv(IEnumerable<WaitlistExportDto> data)
        {
            var csv = new System.Text.StringBuilder();
            csv.AppendLine("Name,Email,Company,Joined Date,Status,Source,Is Notified");

            foreach (var item in data)
            {
                csv.AppendLine($"\"{item.Name}\",\"{item.Email}\",\"{item.Company}\",\"{item.JoinedDate}\",\"{item.Status}\",\"{item.Source}\",\"{item.IsNotified}\"");
            }

            return csv.ToString();
        }
    }
}
