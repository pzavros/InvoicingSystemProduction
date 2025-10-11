using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
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

        public UserService(ApplicationDbContext context, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return null;

            return MapToUserDto(user);
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
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

            // Create new user
            var user = new User
            {
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PasswordHash = HashPassword(registerDto.Password),
                IsActive = true,
                IsTrialUser = true,
                SubscriptionExpiryDate = DateTime.UtcNow.AddDays(30), // 30-day trial
                SubscriptionPlan = "Trial",
                EnteredBy = "System"
            };

            _context.Users.Add(user);
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

        public async Task<AuthResponseDto?> LoginUserAsync(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null || !user.IsActive)
            {
                return null; // User not found or inactive
            }

            // Verify password
            if (!await VerifyPasswordAsync(loginDto.Password, user.PasswordHash))
            {
                return null; // Invalid password
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
            user.SubscriptionPlan = userDto.SubscriptionPlan;
            user.SubscriptionExpiryDate = userDto.SubscriptionExpiryDate;

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

            return user.SubscriptionExpiryDate > DateTime.UtcNow;
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
                new Claim("subscription_plan", user.SubscriptionPlan ?? "None"),
                new Claim("is_trial", user.IsTrialUser.ToString()),
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

        private UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                IsActive = user.IsActive,
                SubscriptionExpiryDate = user.SubscriptionExpiryDate,
                SubscriptionPlan = user.SubscriptionPlan,
                IsTrialUser = user.IsTrialUser,
                IsAdmin = user.IsAdmin,
                LastLoginDate = user.LastLoginDate,
                DateEntered = user.DateEntered,
                EnteredBy = user.EnteredBy
            };
        }
    }
}
