using Backend.DTOs.Webpage;
using Backend.Models.Webpage;

namespace Backend.Interfaces.Webpage
{
    public interface IWaitlistService
    {
        // Create operations
        Task<WaitlistEntryDto> AddToWaitlistAsync(WaitlistEntryCreateDto createDto, string? ipAddress = null, string? userAgent = null);
        
        // Read operations
        Task<WaitlistEntryDto?> GetWaitlistEntryAsync(int id);
        Task<WaitlistEntryDto?> GetWaitlistEntryByEmailAsync(string email);
        Task<IEnumerable<WaitlistEntryDto>> GetAllWaitlistEntriesAsync();
        Task<IEnumerable<WaitlistEntryDto>> GetWaitlistEntriesPaginatedAsync(int page, int pageSize, string? status = null, string? source = null);
        
        // Update operations
        Task<WaitlistEntryDto?> UpdateWaitlistEntryAsync(int id, WaitlistEntryUpdateDto updateDto);
        Task<bool> MarkAsNotifiedAsync(int id);
        Task<bool> MarkAsNotifiedAsync(IEnumerable<int> ids);
        Task<bool> UpdateStatusAsync(int id, string status);
        
        // Delete operations
        Task<bool> RemoveFromWaitlistAsync(int id);
        Task<bool> RemoveFromWaitlistByEmailAsync(string email);
        
        // Analytics operations
        Task<WaitlistStatsDto> GetWaitlistStatsAsync();
        Task<IEnumerable<WaitlistExportDto>> GetWaitlistForExportAsync();
        Task<Dictionary<string, int>> GetSignupsByDateRangeAsync(DateTime startDate, DateTime endDate);
        
        // Utility operations
        Task<bool> EmailExistsAsync(string email);
        Task<int> GetTotalCountAsync();
        Task<int> GetActiveCountAsync();
        Task<int> GetNotifiedCountAsync();
    }
}
