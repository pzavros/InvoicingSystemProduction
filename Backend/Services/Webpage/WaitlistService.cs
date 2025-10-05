using InvoicingBackend.Data;
using Backend.DTOs.Webpage;
using Backend.Interfaces.Webpage;
using Backend.Models.Webpage;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services.Webpage
{
    public class WaitlistService : IWaitlistService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<WaitlistService> _logger;

        public WaitlistService(ApplicationDbContext context, ILogger<WaitlistService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<WaitlistEntryDto> AddToWaitlistAsync(WaitlistEntryCreateDto createDto, string? ipAddress = null, string? userAgent = null)
        {
            try
            {
                // Check if email already exists
                var existingEntry = await _context.WaitlistEntries
                    .FirstOrDefaultAsync(w => w.Email.ToLower() == createDto.Email.ToLower());

                if (existingEntry != null)
                {
                    throw new InvalidOperationException("Email already exists in waitlist");
                }

                var waitlistEntry = new WaitlistEntry
                {
                    Email = createDto.Email.ToLower().Trim(),
                    Name = createDto.Name?.Trim(),
                    Company = createDto.Company?.Trim(),
                    Source = createDto.Source?.Trim(),
                    JoinedAt = DateTime.UtcNow,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    Status = "Active"
                };

                _context.WaitlistEntries.Add(waitlistEntry);
                await _context.SaveChangesAsync();

                _logger.LogInformation("New waitlist entry added: {Email}", createDto.Email);

                return MapToDto(waitlistEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding waitlist entry for email: {Email}", createDto.Email);
                throw;
            }
        }

        public async Task<WaitlistEntryDto?> GetWaitlistEntryAsync(int id)
        {
            var entry = await _context.WaitlistEntries
                .FirstOrDefaultAsync(w => w.Id == id);

            return entry != null ? MapToDto(entry) : null;
        }

        public async Task<WaitlistEntryDto?> GetWaitlistEntryByEmailAsync(string email)
        {
            var entry = await _context.WaitlistEntries
                .FirstOrDefaultAsync(w => w.Email.ToLower() == email.ToLower());

            return entry != null ? MapToDto(entry) : null;
        }

        public async Task<IEnumerable<WaitlistEntryDto>> GetAllWaitlistEntriesAsync()
        {
            var entries = await _context.WaitlistEntries
                .OrderByDescending(w => w.JoinedAt)
                .ToListAsync();

            return entries.Select(MapToDto);
        }

        public async Task<IEnumerable<WaitlistEntryDto>> GetWaitlistEntriesPaginatedAsync(int page, int pageSize, string? status = null, string? source = null)
        {
            var query = _context.WaitlistEntries.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(w => w.Status == status);
            }

            if (!string.IsNullOrEmpty(source))
            {
                query = query.Where(w => w.Source == source);
            }

            var entries = await query
                .OrderByDescending(w => w.JoinedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return entries.Select(MapToDto);
        }

        public async Task<WaitlistEntryDto?> UpdateWaitlistEntryAsync(int id, WaitlistEntryUpdateDto updateDto)
        {
            try
            {
                var entry = await _context.WaitlistEntries.FindAsync(id);
                if (entry == null) return null;

                if (!string.IsNullOrEmpty(updateDto.Name))
                    entry.Name = updateDto.Name.Trim();

                if (!string.IsNullOrEmpty(updateDto.Company))
                    entry.Company = updateDto.Company.Trim();

                if (updateDto.IsNotified.HasValue)
                {
                    entry.IsNotified = updateDto.IsNotified.Value;
                    if (updateDto.IsNotified.Value && !entry.NotifiedAt.HasValue)
                    {
                        entry.NotifiedAt = DateTime.UtcNow;
                    }
                }

                if (!string.IsNullOrEmpty(updateDto.Status))
                    entry.Status = updateDto.Status;

                if (!string.IsNullOrEmpty(updateDto.Notes))
                    entry.Notes = updateDto.Notes;

                entry.MarkAsModified("System");

                await _context.SaveChangesAsync();
                return MapToDto(entry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating waitlist entry: {Id}", id);
                throw;
            }
        }

        public async Task<bool> MarkAsNotifiedAsync(int id)
        {
            try
            {
                var entry = await _context.WaitlistEntries.FindAsync(id);
                if (entry == null) return false;

                entry.IsNotified = true;
                entry.NotifiedAt = DateTime.UtcNow;
                entry.Status = "Notified";
                entry.MarkAsModified("System");

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking waitlist entry as notified: {Id}", id);
                return false;
            }
        }

        public async Task<bool> MarkAsNotifiedAsync(IEnumerable<int> ids)
        {
            try
            {
                var entries = await _context.WaitlistEntries
                    .Where(w => ids.Contains(w.Id))
                    .ToListAsync();

                foreach (var entry in entries)
                {
                    entry.IsNotified = true;
                    entry.NotifiedAt = DateTime.UtcNow;
                    entry.Status = "Notified";
                    entry.MarkAsModified("System");
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking multiple waitlist entries as notified");
                return false;
            }
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            try
            {
                var entry = await _context.WaitlistEntries.FindAsync(id);
                if (entry == null) return false;

                entry.Status = status;
                entry.MarkAsModified("System");

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating waitlist entry status: {Id}", id);
                return false;
            }
        }

        public async Task<bool> RemoveFromWaitlistAsync(int id)
        {
            try
            {
                var entry = await _context.WaitlistEntries.FindAsync(id);
                if (entry == null) return false;

                _context.WaitlistEntries.Remove(entry);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing waitlist entry: {Id}", id);
                return false;
            }
        }

        public async Task<bool> RemoveFromWaitlistByEmailAsync(string email)
        {
            try
            {
                var entry = await _context.WaitlistEntries
                    .FirstOrDefaultAsync(w => w.Email.ToLower() == email.ToLower());

                if (entry == null) return false;

                _context.WaitlistEntries.Remove(entry);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing waitlist entry by email: {Email}", email);
                return false;
            }
        }

        public async Task<WaitlistStatsDto> GetWaitlistStatsAsync()
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var weekAgo = today.AddDays(-7);
            var monthAgo = today.AddMonths(-1);

            var totalEntries = await _context.WaitlistEntries.CountAsync();
            var todayEntries = await _context.WaitlistEntries
                .CountAsync(w => w.JoinedAt.Date == today);
            var weekEntries = await _context.WaitlistEntries
                .CountAsync(w => w.JoinedAt >= weekAgo);
            var monthEntries = await _context.WaitlistEntries
                .CountAsync(w => w.JoinedAt >= monthAgo);
            var notifiedCount = await _context.WaitlistEntries
                .CountAsync(w => w.IsNotified);
            var activeCount = await _context.WaitlistEntries
                .CountAsync(w => w.Status == "Active");

            // Source breakdown
            var sourceBreakdown = await _context.WaitlistEntries
                .Where(w => w.Source != null)
                .GroupBy(w => w.Source)
                .ToDictionaryAsync(g => g.Key!, g => g.Count());

            // Daily signups for the last 30 days
            var thirtyDaysAgo = today.AddDays(-30);
            var dailySignups = await _context.WaitlistEntries
                .Where(w => w.JoinedAt >= thirtyDaysAgo)
                .GroupBy(w => w.JoinedAt.Date)
                .ToDictionaryAsync(g => g.Key.ToString("yyyy-MM-dd"), g => g.Count());

            return new WaitlistStatsDto
            {
                TotalEntries = totalEntries,
                TodayEntries = todayEntries,
                WeekEntries = weekEntries,
                MonthEntries = monthEntries,
                NotifiedCount = notifiedCount,
                ActiveCount = activeCount,
                SourceBreakdown = sourceBreakdown,
                DailySignups = dailySignups
            };
        }

        public async Task<IEnumerable<WaitlistExportDto>> GetWaitlistForExportAsync()
        {
            var entries = await _context.WaitlistEntries
                .OrderByDescending(w => w.JoinedAt)
                .ToListAsync();

            return entries.Select(w => new WaitlistExportDto
            {
                Name = w.Name ?? "N/A",
                Email = w.Email,
                Company = w.Company ?? "N/A",
                JoinedDate = w.JoinedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                Status = w.Status,
                Source = w.Source ?? "N/A",
                IsNotified = w.IsNotified ? "Yes" : "No"
            });
        }

        public async Task<Dictionary<string, int>> GetSignupsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.WaitlistEntries
                .Where(w => w.JoinedAt >= startDate && w.JoinedAt <= endDate)
                .GroupBy(w => w.JoinedAt.Date)
                .ToDictionaryAsync(g => g.Key.ToString("yyyy-MM-dd"), g => g.Count());
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.WaitlistEntries
                .AnyAsync(w => w.Email.ToLower() == email.ToLower());
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _context.WaitlistEntries.CountAsync();
        }

        public async Task<int> GetActiveCountAsync()
        {
            return await _context.WaitlistEntries
                .CountAsync(w => w.Status == "Active");
        }

        public async Task<int> GetNotifiedCountAsync()
        {
            return await _context.WaitlistEntries
                .CountAsync(w => w.IsNotified);
        }

        private static WaitlistEntryDto MapToDto(WaitlistEntry entry)
        {
            return new WaitlistEntryDto
            {
                Id = entry.Id,
                Email = entry.Email,
                Name = entry.Name,
                Company = entry.Company,
                JoinedAt = entry.JoinedAt,
                IsNotified = entry.IsNotified,
                NotifiedAt = entry.NotifiedAt,
                Status = entry.Status,
                Notes = entry.Notes,
                Source = entry.Source,
                CreatedAt = entry.DateEntered,
                UpdatedAt = entry.DateModified ?? entry.DateEntered
            };
        }
    }
}
