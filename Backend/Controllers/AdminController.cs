using InvoicingBackend.Attributes;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InvoicingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication for ALL endpoints
    [AdminAuth] // Require admin role for ALL endpoints
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ISubscriptionService _subscriptionService;

        public AdminController(IUserService userService, ISubscriptionService subscriptionService)
        {
            _userService = userService;
            _subscriptionService = subscriptionService;
        }

        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching users.", error = ex.Message });
            }
        }

        // PUT: api/admin/users/{id}/admin-status
        [HttpPut("users/{id}/admin-status")]
        public async Task<IActionResult> UpdateAdminStatus(int id, [FromBody] UpdateAdminStatusDto dto)
        {
            try
            {
                var result = await _userService.UpdateAdminStatusAsync(id, dto.IsAdmin);
                if (!result)
                    return NotFound(new { message = "User not found." });

                return Ok(new { message = "Admin status updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating admin status.", error = ex.Message });
            }
        }

        // POST: api/admin/auth/login
        [AllowAnonymous]
        [HttpPost("auth/login")]
        public async Task<IActionResult> AdminLogin([FromBody] LoginDto loginDto)
        {
            if (loginDto == null)
                return BadRequest(new { message = "Invalid login data." });

            try
            {
                var result = await _userService.LoginUserAsync(loginDto);
                if (result == null)
                    return Unauthorized(new { message = "Invalid email or password." });

                // Check if user is admin
                if (!result.User.IsAdmin)
                    return Forbid("Access denied. Admin privileges required.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during admin login.", error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token.");
            }
            return userId;
        }
        
        // POST: api/admin/users/{id}/grant-premium
        [HttpPost("users/{id}/grant-premium")]
        public async Task<IActionResult> GrantPremiumAccess(int id, [FromBody] GrantPremiumDto dto)
        {
            try
            {
                var result = await _subscriptionService.GrantPremiumAccessAsync(id, dto.Months);
                if (!result)
                    return NotFound(new { message = "User not found." });

                return Ok(new { message = $"Premium access granted for {dto.Months} month(s)." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while granting premium access.", error = ex.Message });
            }
        }
    }

    public class UpdateAdminStatusDto
    {
        public bool IsAdmin { get; set; }
    }
    
    public class GrantPremiumDto
    {
        public int Months { get; set; }
    }
}
