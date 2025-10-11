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
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;

        public AdminController(IUserService userService)
        {
            _userService = userService;
        }

        // GET: api/admin/users
        [HttpGet("users")]
        [Authorize]
        [AdminAuth]
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
        [Authorize]
        [AdminAuth]
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
    }

    public class UpdateAdminStatusDto
    {
        public bool IsAdmin { get; set; }
    }
}
