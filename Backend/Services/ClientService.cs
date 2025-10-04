using Microsoft.EntityFrameworkCore;
using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;

namespace InvoicingBackend.Services
{
    public class ClientService : IClientService
    {
        private readonly ApplicationDbContext _context;

        public ClientService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ClientDto>> GetAllClientsAsync(int userId)
        {
            var clients = await _context.Clients
                .Include(c => c.PreferredCurrency)
                .Include(c => c.Invoices.Where(i => !i.IsDeleted))
                .Where(c => c.UserId == userId && !c.IsDeleted)
                .OrderByDescending(c => c.DateEntered)
                .ToListAsync();

            return clients.Select(MapToDto).ToList();
        }

        public async Task<ClientDto?> GetClientByIdAsync(int id, int userId)
        {
            var client = await _context.Clients
                .Include(c => c.PreferredCurrency)
                .Include(c => c.Invoices.Where(i => !i.IsDeleted))
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId && !c.IsDeleted);

            return client != null ? MapToDto(client) : null;
        }

        public async Task<ClientDto> CreateClientAsync(CreateClientDto createClientDto, int userId, string createdBy)
        {
            var client = new Client
            {
                Name = createClientDto.Name.Trim(),
                Email = createClientDto.Email.Trim().ToLower(),
                Company = createClientDto.Company?.Trim(),
                Phone = createClientDto.Phone?.Trim(),
                Address = createClientDto.Address?.Trim(),
                City = createClientDto.City?.Trim(),
                State = createClientDto.State?.Trim(),
                PostalCode = createClientDto.PostalCode?.Trim(),
                Country = createClientDto.Country?.Trim(),
                Website = createClientDto.Website?.Trim(),
                TaxNumber = createClientDto.TaxNumber?.Trim(),
                Notes = createClientDto.Notes?.Trim(),
                IsActive = createClientDto.IsActive,
                DefaultPaymentTerms = createClientDto.DefaultPaymentTerms,
                PreferredCurrencyId = createClientDto.PreferredCurrencyId,
                UserId = userId,
                EnteredBy = createdBy,
                DateEntered = DateTime.UtcNow
            };

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            return await GetClientByIdAsync(client.Id, userId) ?? throw new InvalidOperationException("Failed to retrieve created client");
        }

        public async Task<ClientDto?> UpdateClientAsync(UpdateClientDto updateClientDto, int userId, string modifiedBy)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == updateClientDto.Id && c.UserId == userId && !c.IsDeleted);

            if (client == null) return null;

            client.Name = updateClientDto.Name.Trim();
            client.Email = updateClientDto.Email.Trim().ToLower();
            client.Company = updateClientDto.Company?.Trim();
            client.Phone = updateClientDto.Phone?.Trim();
            client.Address = updateClientDto.Address?.Trim();
            client.City = updateClientDto.City?.Trim();
            client.State = updateClientDto.State?.Trim();
            client.PostalCode = updateClientDto.PostalCode?.Trim();
            client.Country = updateClientDto.Country?.Trim();
            client.Website = updateClientDto.Website?.Trim();
            client.TaxNumber = updateClientDto.TaxNumber?.Trim();
            client.Notes = updateClientDto.Notes?.Trim();
            client.IsActive = updateClientDto.IsActive;
            client.DefaultPaymentTerms = updateClientDto.DefaultPaymentTerms;
            client.PreferredCurrencyId = updateClientDto.PreferredCurrencyId;
            client.MarkAsModified(modifiedBy);

            await _context.SaveChangesAsync();
            return await GetClientByIdAsync(client.Id, userId);
        }

        public async Task<bool> DeleteClientAsync(int id, int userId, string deletedBy)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId && !c.IsDeleted);

            if (client == null) return false;

            client.SoftDelete(deletedBy);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClientExistsAsync(int id, int userId)
        {
            return await _context.Clients
                .AnyAsync(c => c.Id == id && c.UserId == userId && !c.IsDeleted);
        }

        public async Task<IEnumerable<ClientDto>> SearchClientsAsync(string searchTerm, int userId)
        {
            var term = searchTerm.ToLower().Trim();

            var clients = await _context.Clients
                .Include(c => c.PreferredCurrency)
                .Include(c => c.Invoices.Where(i => !i.IsDeleted))
                .Where(c => c.UserId == userId && !c.IsDeleted &&
                    (c.Name.ToLower().Contains(term) ||
                     c.Email.ToLower().Contains(term) ||
                     (c.Company != null && c.Company.ToLower().Contains(term)) ||
                     (c.Phone != null && c.Phone.Contains(term))))
                .OrderByDescending(c => c.DateEntered)
                .ToListAsync();

            return clients.Select(MapToDto).ToList();
        }

        public async Task<ClientDto?> GetClientByEmailAsync(string email, int userId)
        {
            var client = await _context.Clients
                .Include(c => c.PreferredCurrency)
                .Include(c => c.Invoices.Where(i => !i.IsDeleted))
                .FirstOrDefaultAsync(c => c.Email.ToLower() == email.ToLower() && c.UserId == userId && !c.IsDeleted);

            return client != null ? MapToDto(client) : null;
        }

        private static ClientDto MapToDto(Client client)
        {
            return new ClientDto
            {
                Id = client.Id,
                Name = client.Name,
                Email = client.Email,
                Company = client.Company,
                Phone = client.Phone,
                Address = client.Address,
                City = client.City,
                State = client.State,
                PostalCode = client.PostalCode,
                Country = client.Country,
                Website = client.Website,
                TaxNumber = client.TaxNumber,
                Notes = client.Notes,
                IsActive = client.IsActive,
                DefaultPaymentTerms = client.DefaultPaymentTerms,
                PreferredCurrencyId = client.PreferredCurrencyId,
                PreferredCurrency = client.PreferredCurrency != null ? new CurrencyDto
                {
                    Id = client.PreferredCurrency.Id,
                    Name = client.PreferredCurrency.Name ?? string.Empty,
                    Code = client.PreferredCurrency.Code ?? string.Empty,
                    Symbol = client.PreferredCurrency.Symbol ?? string.Empty
                } : null,
                TotalInvoiceAmount = client.TotalInvoiceAmount,
                TotalInvoiceCount = client.TotalInvoiceCount,
                LastInvoiceDate = client.LastInvoiceDate,
                DateEntered = client.DateEntered,
                DateModified = client.DateModified
            };
        }
    }
}
