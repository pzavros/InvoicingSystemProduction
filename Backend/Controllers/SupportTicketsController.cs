using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Models;
using InvoicingBackend.Interfaces;
using System.Security.Claims;

namespace InvoicingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupportTicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public SupportTicketsController(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // Helper to get current user ID
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not authenticated");
            return int.Parse(userIdClaim);
        }

        // GET: api/supporttickets
        // Get all tickets for current user
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SupportTicketDto>>> GetMyTickets()
        {
            try
            {
                var userId = GetCurrentUserId();
                var tickets = await _context.SupportTickets
                    .Where(t => t.UserId == userId)
                    .OrderByDescending(t => t.CreatedDate)
                    .Select(t => new SupportTicketDto
                    {
                        Id = t.Id,
                        ReferenceNumber = t.ReferenceNumber,
                        Type = t.Type,
                        Subject = t.Subject,
                        Description = t.Description,
                        Status = t.Status,
                        Priority = t.Priority,
                        AdminNotes = t.AdminNotes,
                        UserId = t.UserId,
                        UserEmail = t.UserEmail,
                        UserName = t.UserName,
                        CreatedDate = t.CreatedDate,
                        ResolvedDate = t.ResolvedDate,
                        LastUpdatedDate = t.LastUpdatedDate
                    })
                    .ToListAsync();

                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching tickets", error = ex.Message });
            }
        }

        // GET: api/supporttickets/admin
        // Admin only - Get all tickets
        [HttpGet("admin")]
        public async Task<ActionResult<IEnumerable<SupportTicketDto>>> GetAllTickets([FromQuery] string? status = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null || !user.IsAdmin)
                    return Forbid();

                var query = _context.SupportTickets.AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(t => t.Status == status);
                }

                var tickets = await query
                    .OrderByDescending(t => t.CreatedDate)
                    .Select(t => new SupportTicketDto
                    {
                        Id = t.Id,
                        ReferenceNumber = t.ReferenceNumber,
                        Type = t.Type,
                        Subject = t.Subject,
                        Description = t.Description,
                        Status = t.Status,
                        Priority = t.Priority,
                        AdminNotes = t.AdminNotes,
                        UserId = t.UserId,
                        UserEmail = t.UserEmail,
                        UserName = t.UserName,
                        CreatedDate = t.CreatedDate,
                        ResolvedDate = t.ResolvedDate,
                        LastUpdatedDate = t.LastUpdatedDate
                    })
                    .ToListAsync();

                return Ok(tickets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching tickets", error = ex.Message });
            }
        }

        // GET: api/supporttickets/{id}
        // Get single ticket by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<SupportTicketDto>> GetTicket(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);
                
                var ticket = await _context.SupportTickets.FindAsync(id);

                if (ticket == null)
                    return NotFound(new { message = "Ticket not found" });

                // Only allow viewing own tickets unless admin
                if (ticket.UserId != userId && !user!.IsAdmin)
                    return Forbid();

                var ticketDto = new SupportTicketDto
                {
                    Id = ticket.Id,
                    ReferenceNumber = ticket.ReferenceNumber,
                    Type = ticket.Type,
                    Subject = ticket.Subject,
                    Description = ticket.Description,
                    Status = ticket.Status,
                    Priority = ticket.Priority,
                    AdminNotes = ticket.AdminNotes,
                    UserId = ticket.UserId,
                    UserEmail = ticket.UserEmail,
                    UserName = ticket.UserName,
                    CreatedDate = ticket.CreatedDate,
                    ResolvedDate = ticket.ResolvedDate,
                    LastUpdatedDate = ticket.LastUpdatedDate
                };

                return Ok(ticketDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching ticket", error = ex.Message });
            }
        }

        // POST: api/supporttickets
        // Create new ticket
        [HttpPost]
        public async Task<ActionResult<SupportTicketDto>> CreateTicket(CreateSupportTicketDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                    return NotFound(new { message = "User not found" });

                // Generate reference number
                var datePrefix = DateTime.UtcNow.ToString("yyyyMMdd");
                var todayCount = await _context.SupportTickets
                    .Where(t => t.ReferenceNumber.StartsWith($"ST-{datePrefix}"))
                    .CountAsync();
                var referenceNumber = $"ST-{datePrefix}-{(todayCount + 1):D3}";

                var ticket = new SupportTicket
                {
                    ReferenceNumber = referenceNumber,
                    Type = createDto.Type,
                    Subject = createDto.Subject,
                    Description = createDto.Description,
                    Status = "Open",
                    Priority = "Medium",
                    UserId = userId,
                    UserEmail = user.Email,
                    UserName = $"{user.FirstName} {user.LastName}",
                    CreatedDate = DateTime.UtcNow
                };

                _context.SupportTickets.Add(ticket);
                await _context.SaveChangesAsync();

                // Send confirmation email to user
                try
                {
                    await _emailService.SendSupportTicketConfirmationAsync(
                        user.Email,
                        $"{user.FirstName} {user.LastName}",
                        referenceNumber,
                        createDto.Subject,
                        createDto.Type
                    );
                }
                catch (Exception emailEx)
                {
                    Console.WriteLine($"Failed to send confirmation email: {emailEx.Message}");
                    // Don't fail the request if email fails
                }

                var ticketDto = new SupportTicketDto
                {
                    Id = ticket.Id,
                    ReferenceNumber = ticket.ReferenceNumber,
                    Type = ticket.Type,
                    Subject = ticket.Subject,
                    Description = ticket.Description,
                    Status = ticket.Status,
                    Priority = ticket.Priority,
                    AdminNotes = ticket.AdminNotes,
                    UserId = ticket.UserId,
                    UserEmail = ticket.UserEmail,
                    UserName = ticket.UserName,
                    CreatedDate = ticket.CreatedDate,
                    ResolvedDate = ticket.ResolvedDate,
                    LastUpdatedDate = ticket.LastUpdatedDate
                };

                return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticketDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating ticket", error = ex.Message });
            }
        }

        // PUT: api/supporttickets/{id}
        // Admin only - Update ticket
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTicket(int id, UpdateSupportTicketDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null || !user.IsAdmin)
                    return Forbid();

                var ticket = await _context.SupportTickets.FindAsync(id);

                if (ticket == null)
                    return NotFound(new { message = "Ticket not found" });

                if (!string.IsNullOrEmpty(updateDto.Status))
                {
                    ticket.Status = updateDto.Status;
                    if (updateDto.Status == "Resolved" || updateDto.Status == "Closed")
                    {
                        ticket.ResolvedDate = DateTime.UtcNow;
                    }
                }

                if (!string.IsNullOrEmpty(updateDto.Priority))
                    ticket.Priority = updateDto.Priority;

                if (updateDto.AdminNotes != null)
                    ticket.AdminNotes = updateDto.AdminNotes;

                ticket.LastUpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating ticket", error = ex.Message });
            }
        }

        // DELETE: api/supporttickets/{id}
        // Admin only - Delete ticket
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null || !user.IsAdmin)
                    return Forbid();

                var ticket = await _context.SupportTickets.FindAsync(id);

                if (ticket == null)
                    return NotFound(new { message = "Ticket not found" });

                _context.SupportTickets.Remove(ticket);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting ticket", error = ex.Message });
            }
        }
    }
}
