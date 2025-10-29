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

        // PUT: api/auth/password
        [HttpPut("password")]
        [Authorize]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto passwordDto)
        {
            if (passwordDto == null)
                return BadRequest(new { message = "Invalid password data." });

            try
            {
                var userId = GetCurrentUserId();
                var result = await _userService.UpdatePasswordAsync(userId, passwordDto);
                
                if (!result)
                    return BadRequest(new { message = "Current password is incorrect." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating password.", error = ex.Message });
            }
        }

        // PUT: api/auth/preferences
        [HttpPut("preferences")]
        [Authorize]
        public async Task<IActionResult> UpdatePreferences([FromBody] UserPreferencesDto preferencesDto)
        {
            if (preferencesDto == null)
                return BadRequest(new { message = "Invalid preferences data." });

            try
            {
                var userId = GetCurrentUserId();
                var result = await _userService.UpdateUserPreferencesAsync(userId, preferencesDto);
                
                if (!result)
                    return NotFound(new { message = "User not found." });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating preferences.", error = ex.Message });
            }
        }

        // POST: api/auth/request-password-change-otp
        [HttpPost("request-password-change-otp")]
        [Authorize]
        public async Task<IActionResult> RequestPasswordChangeOtp([FromBody] RequestPasswordChangeOtpDto requestDto)
        {
            if (requestDto == null)
                return BadRequest(new { message = "Invalid request data." });

            try
            {
                var userId = GetCurrentUserId();
                var result = await _userService.RequestPasswordChangeOtpAsync(userId, requestDto);
                
                if (!result)
                    return BadRequest(new { message = "Current password is incorrect or failed to send OTP email." });

                return Ok(new { message = "OTP has been sent to your email address." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while requesting OTP.", error = ex.Message });
            }
        }

        // POST: api/auth/verify-password-change-otp
        [HttpPost("verify-password-change-otp")]
        [Authorize]
        public async Task<IActionResult> VerifyPasswordChangeOtp([FromBody] VerifyPasswordChangeOtpDto verifyDto)
        {
            if (verifyDto == null)
                return BadRequest(new { message = "Invalid verification data." });

            try
            {
                var userId = GetCurrentUserId();
                var result = await _userService.VerifyPasswordChangeOtpAsync(userId, verifyDto.Otp);
                
                if (!result)
                    return BadRequest(new { message = "Invalid or expired OTP." });

                return Ok(new { message = "OTP verified successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while verifying OTP.", error = ex.Message });
            }
        }

        // POST: api/auth/change-password-with-otp
        [HttpPost("change-password-with-otp")]
        [Authorize]
        public async Task<IActionResult> ChangePasswordWithOtp([FromBody] ChangePasswordWithOtpDto changeDto)
        {
            if (changeDto == null)
                return BadRequest(new { message = "Invalid password change data." });

            try
            {
                var userId = GetCurrentUserId();
                var result = await _userService.ChangePasswordWithOtpAsync(userId, changeDto);
                
                if (!result)
                    return BadRequest(new { message = "Invalid or expired OTP." });

                return Ok(new { message = "Password changed successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while changing password.", error = ex.Message });
            }
        }

        // POST: api/auth/verify-email
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyDto)
        {
            if (verifyDto == null)
                return BadRequest(new { message = "Invalid verification data." });

            try
            {
                var result = await _userService.VerifyEmailAsync(verifyDto.Email, verifyDto.VerificationCode);
                
                if (!result)
                    return BadRequest(new { message = "Invalid or expired verification code." });

                return Ok(new { message = "Email verified successfully! You can now log in." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during verification.", error = ex.Message });
            }
        }

        // POST: api/auth/resend-verification
        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto resendDto)
        {
            if (resendDto == null)
                return BadRequest(new { message = "Invalid request data." });

            try
            {
                var result = await _userService.ResendVerificationEmailAsync(resendDto.Email);
                
                if (!result)
                    return BadRequest(new { message = "User not found or already verified." });

                return Ok(new { message = "Verification email sent successfully. Please check your inbox." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while sending verification email.", error = ex.Message });
            }
        }

        // POST: api/auth/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotDto)
        {
            if (forgotDto == null || string.IsNullOrEmpty(forgotDto.Email))
                return BadRequest(new { message = "Email is required." });

            try
            {
                var result = await _userService.ForgotPasswordAsync(forgotDto.Email);
                
                // Always return success to prevent email enumeration
                return Ok(new { message = "If an account exists with this email, a password reset code has been sent." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing your request.", error = ex.Message });
            }
        }

        // POST: api/auth/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetDto)
        {
            if (resetDto == null)
                return BadRequest(new { message = "Invalid reset data." });

            try
            {
                var result = await _userService.ResetPasswordAsync(
                    resetDto.Email, 
                    resetDto.ResetToken, 
                    resetDto.NewPassword
                );
                
                if (!result)
                    return BadRequest(new { message = "Invalid or expired reset token." });

                return Ok(new { message = "Password has been reset successfully. You can now log in with your new password." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while resetting password.", error = ex.Message });
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
