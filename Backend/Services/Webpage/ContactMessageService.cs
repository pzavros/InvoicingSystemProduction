using InvoicingBackend.Data;
using Backend.DTOs.Webpage;
using Backend.Interfaces.Webpage;
using Backend.Models.Webpage;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Webpage
{
    public class ContactMessageService : IContactMessageService
    {
        private readonly ApplicationDbContext _context;

        public ContactMessageService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ContactMessageDto> CreateMessageAsync(CreateContactMessageDto createDto)
        {
            var contactMessage = new ContactMessage
            {
                FirstName = createDto.FirstName.Trim(),
                LastName = createDto.LastName.Trim(),
                Email = createDto.Email.Trim().ToLower(),
                Subject = createDto.Subject.Trim(),
                Message = createDto.Message.Trim(),
                Source = createDto.Source ?? "website",
                Status = "New",
                IsRead = false,
                IsReplied = false
            };

            _context.ContactMessages.Add(contactMessage);
            await _context.SaveChangesAsync();

            return MapToDto(contactMessage);
        }

        public async Task<IEnumerable<ContactMessageDto>> GetMessagesAsync(int page = 1, int pageSize = 50, string? status = null)
        {
            var query = _context.ContactMessages.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(m => m.Status == status);
            }

            var messages = await query
                .OrderByDescending(m => m.DateEntered)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return messages.Select(MapToDto);
        }

        public async Task<ContactMessageDto?> GetMessageByIdAsync(int id)
        {
            var message = await _context.ContactMessages.FindAsync(id);
            return message != null ? MapToDto(message) : null;
        }

        public async Task<ContactMessageStatsDto> GetStatsAsync()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var weekAgo = today.AddDays(-7);
            var monthAgo = today.AddDays(-30);

            var messages = await _context.ContactMessages.ToListAsync();

            var stats = new ContactMessageStatsDto
            {
                TotalMessages = messages.Count,
                NewMessages = messages.Count(m => m.Status == "New"),
                InProgressMessages = messages.Count(m => m.Status == "InProgress"),
                ResolvedMessages = messages.Count(m => m.Status == "Resolved"),
                TodayMessages = messages.Count(m => m.DateEntered.Date == today),
                WeekMessages = messages.Count(m => m.DateEntered >= weekAgo),
                MonthMessages = messages.Count(m => m.DateEntered >= monthAgo)
            };

            // Status breakdown
            stats.StatusBreakdown = messages
                .GroupBy(m => m.Status)
                .ToDictionary(g => g.Key, g => g.Count());

            // Source breakdown
            stats.SourceBreakdown = messages
                .GroupBy(m => m.Source ?? "unknown")
                .ToDictionary(g => g.Key, g => g.Count());

            return stats;
        }

        public async Task<bool> MarkAsReadAsync(int id)
        {
            var message = await _context.ContactMessages.FindAsync(id);
            if (message == null) return false;

            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
            message.MarkAsModified("system");

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MarkAsRepliedAsync(int id)
        {
            var message = await _context.ContactMessages.FindAsync(id);
            if (message == null) return false;

            message.IsReplied = true;
            message.RepliedAt = DateTime.UtcNow;
            message.MarkAsModified("system");

            if (message.Status == "New")
            {
                message.Status = "Resolved";
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            var message = await _context.ContactMessages.FindAsync(id);
            if (message == null) return false;

            message.Status = status;
            message.MarkAsModified("system");

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddAdminNotesAsync(int id, string notes)
        {
            var message = await _context.ContactMessages.FindAsync(id);
            if (message == null) return false;

            message.AdminNotes = notes;
            message.MarkAsModified("system");

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteMessageAsync(int id)
        {
            var message = await _context.ContactMessages.FindAsync(id);
            if (message == null) return false;

            _context.ContactMessages.Remove(message);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ContactMessageDto MapToDto(ContactMessage message)
        {
            return new ContactMessageDto
            {
                Id = message.Id,
                FirstName = message.FirstName,
                LastName = message.LastName,
                Email = message.Email,
                Subject = message.Subject,
                Message = message.Message,
                IsRead = message.IsRead,
                ReadAt = message.ReadAt,
                IsReplied = message.IsReplied,
                RepliedAt = message.RepliedAt,
                AdminNotes = message.AdminNotes,
                Status = message.Status,
                Source = message.Source,
                CreatedAt = message.DateEntered,
                UpdatedAt = message.DateModified ?? message.DateEntered
            };
        }
    }
}
