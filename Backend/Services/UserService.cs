using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
using InvoicingBackend.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace InvoicingBackend.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly IEmailService _emailService;

        public UserService(ApplicationDbContext context, IOptions<JwtSettings> jwtSettings, IEmailService emailService)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _emailService = emailService;
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.Subscription)
                .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return null;

            return MapToUserDto(user);
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            var user = await _context.Users
                .Include(u => u.Subscription)
                .FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return null;

            return MapToUserDto(user);
        }

        public async Task<AuthResponseDto?> RegisterUserAsync(RegisterDto registerDto)
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return null; // User already exists
            }

            // Validate password confirmation
            if (registerDto.Password != registerDto.ConfirmPassword)
            {
                return null; // Passwords don't match
            }

            // Generate verification token (6-digit code)
            var verificationToken = GenerateRandomCode(6);

            // Create new user (account is locked until verified)
            var user = new User
            {
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PasswordHash = HashPassword(registerDto.Password),
                IsActive = false, // Account locked until verified
                IsEmailVerified = false,
                EmailVerificationToken = verificationToken,
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(48), // 48 hours to verify
                IsTrialUser = true,
                SubscriptionExpiryDate = DateTime.UtcNow.AddDays(30), // 30-day trial
                SubscriptionPlan = "Trial",
                EnteredBy = "System"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send verification email
            var verificationUrl = $"{GetBaseUrl()}/verify-email?code={verificationToken}&email={Uri.EscapeDataString(user.Email)}";
            await _emailService.SendAccountVerificationEmailAsync(
                user.Email,
                $"{user.FirstName} {user.LastName}",
                verificationToken,
                verificationUrl
            );

            // Return response indicating email verification needed
            return new AuthResponseDto
            {
                Token = string.Empty, // No token until verified
                User = MapToUserDto(user),
                ExpiresAt = DateTime.UtcNow,
                Message = "REGISTRATION_SUCCESS" // Flag indicating successful registration, pending verification
            };
        }

        public async Task<AuthResponseDto?> LoginUserAsync(LoginDto loginDto)
        {
            var user = await _context.Users
                .Include(u => u.Subscription)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            
            if (user == null)
            {
                return null; // User not found
            }

            // Verify password
            if (!await VerifyPasswordAsync(loginDto.Password, user.PasswordHash))
            {
                return null; // Invalid password
            }

            // Check if email is verified
            if (!user.IsEmailVerified)
            {
                // Return user data with flag indicating verification needed
                return new AuthResponseDto
                {
                    Token = string.Empty,
                    User = MapToUserDto(user),
                    ExpiresAt = DateTime.UtcNow,
                    Message = "VERIFICATION_REQUIRED" // Special flag for frontend
                };
            }

            // Check if account is active
            if (!user.IsActive)
            {
                return new AuthResponseDto
                {
                    Token = string.Empty,
                    User = MapToUserDto(user),
                    ExpiresAt = DateTime.UtcNow,
                    Message = "ACCOUNT_DEACTIVATED"
                };
            }

            // Update last login date
            user.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate JWT token
            var token = await GenerateJwtTokenAsync(user);

            return new AuthResponseDto
            {
                Token = token,
                User = MapToUserDto(user),
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes)
            };
        }

        public async Task<bool> UpdateUserAsync(int id, UserDto userDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.FirstName = userDto.FirstName;
            user.LastName = userDto.LastName;
            user.IsActive = userDto.IsActive;
            // Subscription fields are now managed via Subscriptions table only

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateUserAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ValidateUserSubscriptionAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsActive) return false;

            // Check subscription via Subscriptions table
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);
            
            if (subscription == null) return false;
            
            var now = DateTime.UtcNow;
            var isTrialActive = subscription.TrialEndDate.HasValue && now < subscription.TrialEndDate.Value;
            var isActive = subscription.Status == SubscriptionStatus.Active && now < subscription.EndDate;
            
            return isTrialActive || isActive || user.IsAdmin;
        }

        public Task<string> GenerateJwtTokenAsync(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.SecretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("subscription_tier", user.SubscriptionTier ?? "free"),
                new Claim("IsAdmin", user.IsAdmin.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return Task.FromResult(tokenHandler.WriteToken(token));
        }

        public async Task<bool> VerifyPasswordAsync(string password, string passwordHash)
        {
            return await Task.FromResult(BCrypt.Net.BCrypt.Verify(password, passwordHash));
        }

        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Include(u => u.Subscription)
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .ToListAsync();

            return users.Select(MapToUserDto);
        }

        public async Task<bool> UpdateAdminStatusAsync(int userId, bool isAdmin)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsAdmin = isAdmin;
            user.DateModified = DateTime.UtcNow;
            user.ModifiedBy = "Admin";

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdatePasswordAsync(int userId, UpdatePasswordDto passwordDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Verify current password
            if (!await VerifyPasswordAsync(passwordDto.CurrentPassword, user.PasswordHash))
            {
                return false;
            }

            // Update with new password
            user.PasswordHash = HashPassword(passwordDto.NewPassword);
            user.DateModified = DateTime.UtcNow;
            user.ModifiedBy = user.Email;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserPreferencesAsync(int userId, UserPreferencesDto preferencesDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Update user preferences
            user.Currency = preferencesDto.Currency ?? user.Currency;
            user.DateFormat = preferencesDto.DateFormat ?? user.DateFormat;
            user.Language = preferencesDto.Language ?? user.Language;
            user.EmailNotifications = preferencesDto.EmailNotifications;
            user.DarkMode = preferencesDto.DarkMode;
            
            user.DateModified = DateTime.UtcNow;
            user.ModifiedBy = user.Email;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RequestPasswordChangeOtpAsync(int userId, RequestPasswordChangeOtpDto requestDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Generate OTP directly without password verification
            user.PasswordChangeOtp = OtpHelper.GenerateOtp();
            user.PasswordChangeOtpExpiry = OtpHelper.GetOtpExpiryTime();
            
            user.DateModified = DateTime.UtcNow;
            user.ModifiedBy = user.Email;

            await _context.SaveChangesAsync();

            // Send OTP email
            try
            {
                var emailResult = await _emailService.SendPasswordChangeOtpEmailAsync(user.Email, user.FirstName, user.PasswordChangeOtp);
                
                if (!emailResult.Success)
                {
                    // Log the error but don't expose email service errors
                    Console.WriteLine($"Failed to send OTP email: {emailResult.Message}");
                    // Clear the OTP since email failed
                    user.PasswordChangeOtp = null;
                    user.PasswordChangeOtpExpiry = null;
                    await _context.SaveChangesAsync();
                    return false;
                }
                
                return true;
            }
            catch (Exception ex)
            {
                // Log the error but don't expose email service errors
                Console.WriteLine($"Failed to send OTP email: {ex.Message}");
                // Clear the OTP since email failed
                user.PasswordChangeOtp = null;
                user.PasswordChangeOtpExpiry = null;
                await _context.SaveChangesAsync();
                return false;
            }
        }

        public async Task<bool> VerifyPasswordChangeOtpAsync(int userId, string otp)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.PasswordChangeOtp)) return false;

            return OtpHelper.ValidateOtp(otp, user.PasswordChangeOtp, user.PasswordChangeOtpExpiry ?? DateTime.MinValue);
        }

        public async Task<bool> ChangePasswordWithOtpAsync(int userId, ChangePasswordWithOtpDto changeDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.PasswordChangeOtp)) return false;

            // Validate OTP
            if (!OtpHelper.ValidateOtp(changeDto.Otp, user.PasswordChangeOtp, user.PasswordChangeOtpExpiry ?? DateTime.MinValue))
                return false;

            // Update password
            user.PasswordHash = HashPassword(changeDto.NewPassword);
            
            // Clear OTP data
            user.PasswordChangeOtp = null;
            user.PasswordChangeOtpExpiry = null;
            
            user.DateModified = DateTime.UtcNow;
            user.ModifiedBy = user.Email;

            await _context.SaveChangesAsync();
            return true;
        }

        // ==================== EMAIL VERIFICATION METHODS ====================

        public async Task<bool> VerifyEmailAsync(string email, string verificationCode)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            
            if (user == null || user.IsEmailVerified)
                return false;

            // Check if verification token matches and hasn't expired
            if (user.EmailVerificationToken != verificationCode)
                return false;

            if (user.EmailVerificationTokenExpiry == null || DateTime.UtcNow > user.EmailVerificationTokenExpiry)
                return false;

            // Verify email and activate account
            user.IsEmailVerified = true;
            user.IsActive = true;
            user.EmailVerificationToken = null;
            user.EmailVerificationTokenExpiry = null;
            user.DateModified = DateTime.UtcNow;
            user.ModifiedBy = "System";

            await _context.SaveChangesAsync();

            // Send welcome email after verification
            var loginUrl = $"{GetBaseUrl()}/login";
            await _emailService.SendWelcomeEmailAsync(
                user.Email,
                $"{user.FirstName} {user.LastName}",
                loginUrl
            );

            return true;
        }

        public async Task<bool> ResendVerificationEmailAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            
            if (user == null || user.IsEmailVerified)
                return false;

            // Generate new verification token
            var verificationToken = GenerateRandomCode(6);
            user.EmailVerificationToken = verificationToken;
            user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(48);

            await _context.SaveChangesAsync();

            // Resend verification email
            var verificationUrl = $"{GetBaseUrl()}/verify-email?code={verificationToken}&email={Uri.EscapeDataString(user.Email)}";
            await _emailService.SendAccountVerificationEmailAsync(
                user.Email,
                $"{user.FirstName} {user.LastName}",
                verificationToken,
                verificationUrl
            );

            return true;
        }

        // ==================== PASSWORD RESET METHODS ====================

        // Forgot Password (for users NOT logged in)
        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            
            if (user == null)
            {
                // Don't reveal if user exists - return success anyway for security
                return true;
            }

            // Generate 6-digit OTP token
            user.PasswordResetToken = new Random().Next(100000, 999999).ToString();
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // 1 hour expiry
            
            await _context.SaveChangesAsync();

            // Send password reset email
            try
            {
                var emailResult = await _emailService.SendPasswordResetEmailAsync(
                    user.Email, 
                    user.FirstName, 
                    user.PasswordResetToken
                );
                
                return emailResult.Success;
            }
            catch (Exception)
            {
                // Clear the token if email failed
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;
                await _context.SaveChangesAsync();
                return false;
            }
        }

        public async Task<bool> ResetPasswordAsync(string email, string resetToken, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            
            if (user == null)
                return false;

            // Validate reset token
            if (string.IsNullOrEmpty(user.PasswordResetToken) || 
                user.PasswordResetToken != resetToken)
                return false;

            // Check if token expired
            if (user.PasswordResetTokenExpiry == null || 
                user.PasswordResetTokenExpiry < DateTime.UtcNow)
                return false;

            // Update password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            
            // Clear reset token
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            
            user.DateModified = DateTime.UtcNow;
            user.ModifiedBy = user.Email;

            await _context.SaveChangesAsync();

            return true;
        }

        // ==================== HELPER METHODS ====================

        private string GenerateRandomCode(int length)
        {
            var random = new Random();
            return random.Next((int)Math.Pow(10, length - 1), (int)Math.Pow(10, length)).ToString();
        }

        private string GetBaseUrl()
        {
            return "https://e-nvoicing.com/app"; // TODO: Move to configuration
        }

        private UserDto MapToUserDto(User user)
        {
            string subscriptionTier = "free";
            string subscriptionStatus = "active";
            DateTime? subscriptionEndDate = null;
            bool isPremium = false;
            bool isInTrial = false;

            if (user.Subscription != null)
            {
                subscriptionStatus = user.Subscription.Status.ToString().ToLower();
                subscriptionEndDate = user.Subscription.EndDate;
                
                if (user.Subscription.Status == SubscriptionStatus.Active)
                {
                    subscriptionTier = "premium";
                    isPremium = true;
                }
                
                if (user.Subscription.TrialEndDate.HasValue && user.Subscription.TrialEndDate.Value > DateTime.UtcNow)
                {
                    isInTrial = true;
                }
            }
            else if (user.SubscriptionTier == "premium")
            {
                subscriptionTier = "premium";
                isPremium = true;
            }
            else if (!string.IsNullOrEmpty(user.SubscriptionTier))
            {
                subscriptionTier = user.SubscriptionTier;
            }
            
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                IsActive = user.IsActive,
                IsAdmin = user.IsAdmin,
                IsEmailVerified = user.IsEmailVerified,
                LastLoginDate = user.LastLoginDate,
                DateEntered = user.DateEntered,
                EnteredBy = user.EnteredBy,
                SubscriptionTier = subscriptionTier,
                SubscriptionStatus = subscriptionStatus,
                SubscriptionEndDate = subscriptionEndDate,
                IsPremium = isPremium,
                IsInTrial = isInTrial,
                Currency = user.Currency,
                DateFormat = user.DateFormat,
                Language = user.Language,
                EmailNotifications = user.EmailNotifications,
                DarkMode = user.DarkMode
            };
        }
    }
}
