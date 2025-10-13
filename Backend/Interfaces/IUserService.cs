using InvoicingBackend.DTOs;
using InvoicingBackend.Models;
using System.Threading.Tasks;

namespace InvoicingBackend.Interfaces
{
    public interface IUserService
    {
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto?> GetUserByEmailAsync(string email);
        Task<AuthResponseDto?> RegisterUserAsync(RegisterDto registerDto);
        Task<AuthResponseDto?> LoginUserAsync(LoginDto loginDto);
        Task<bool> UpdateUserAsync(int id, UserDto userDto);
        Task<bool> DeactivateUserAsync(int id);
        Task<bool> ValidateUserSubscriptionAsync(int userId);
        Task<string> GenerateJwtTokenAsync(User user);
        Task<bool> VerifyPasswordAsync(string password, string passwordHash);
        string HashPassword(string password);
        
        // Password and Preferences methods
        Task<bool> UpdatePasswordAsync(int userId, UpdatePasswordDto passwordDto);
        Task<bool> UpdateUserPreferencesAsync(int userId, UserPreferencesDto preferencesDto);
        
        // OTP methods for password change
        Task<bool> RequestPasswordChangeOtpAsync(int userId, RequestPasswordChangeOtpDto requestDto);
        Task<bool> VerifyPasswordChangeOtpAsync(int userId, string otp);
        Task<bool> ChangePasswordWithOtpAsync(int userId, ChangePasswordWithOtpDto changeDto);
        
        // Admin methods
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<bool> UpdateAdminStatusAsync(int userId, bool isAdmin);
    }
}
