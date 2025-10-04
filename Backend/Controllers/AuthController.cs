using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InvoicingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (registerDto == null)
                return BadRequest(new { message = "Invalid registration data." });

            try
            {
                var result = await _userService.RegisterUserAsync(registerDto);
                if (result == null)
                    return BadRequest(new { message = "User already exists or passwords don't match." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration.", error = ex.Message });
            }
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (loginDto == null)
                return BadRequest(new { message = "Invalid login data." });

            try
            {
                var result = await _userService.LoginUserAsync(loginDto);
                if (result == null)
                    return Unauthorized(new { message = "Invalid email or password." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login.", error = ex.Message });
            }
        }

        // GET: api/auth/profile
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _userService.GetUserByIdAsync(userId);
                
                if (user == null)
                    return NotFound(new { message = "User not found." });

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching profile.", error = ex.Message });
            }
        }

        // PUT: api/auth/profile
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UserDto userDto)
        {
            if (userDto == null)
                return BadRequest(new { message = "Invalid user data." });

            try
            {
                var userId = GetCurrentUserId();
                var result = await _userService.UpdateUserAsync(userId, userDto);
                
                if (!result)
                    return NotFound(new { message = "User not found." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating profile.", error = ex.Message });
            }
        }

        // GET: api/auth/subscription-status
        [HttpGet("subscription-status")]
        [Authorize]
        public async Task<IActionResult> GetSubscriptionStatus()
        {
            try
            {
                var userId = GetCurrentUserId();
                var isActive = await _userService.ValidateUserSubscriptionAsync(userId);
                
                return Ok(new { isActive = isActive });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while checking subscription status.", error = ex.Message });
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
}
