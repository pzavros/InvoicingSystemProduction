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
        
        // Admin methods
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<bool> UpdateAdminStatusAsync(int userId, bool isAdmin);
    }
}
