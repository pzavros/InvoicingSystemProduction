using Backend.DTOs.Webpage;

namespace Backend.Interfaces.Webpage
{
    public interface IContactMessageService
    {
        Task<ContactMessageDto> CreateMessageAsync(CreateContactMessageDto createDto);
        Task<IEnumerable<ContactMessageDto>> GetMessagesAsync(int page = 1, int pageSize = 50, string? status = null);
        Task<ContactMessageDto?> GetMessageByIdAsync(int id);
        Task<ContactMessageStatsDto> GetStatsAsync();
        Task<bool> MarkAsReadAsync(int id);
        Task<bool> MarkAsRepliedAsync(int id);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<bool> AddAdminNotesAsync(int id, string notes);
        Task<bool> DeleteMessageAsync(int id);
    }
}
