using InvoicingBackend.DTOs;

namespace InvoicingBackend.Interfaces
{
    public interface IClientService
    {
        Task<IEnumerable<ClientDto>> GetAllClientsAsync(int userId);
        Task<ClientDto?> GetClientByIdAsync(int id, int userId);
        Task<ClientDto> CreateClientAsync(CreateClientDto createClientDto, int userId, string createdBy);
        Task<ClientDto?> UpdateClientAsync(UpdateClientDto updateClientDto, int userId, string modifiedBy);
        Task<bool> DeleteClientAsync(int id, int userId, string deletedBy);
        Task<bool> ClientExistsAsync(int id, int userId);
        Task<IEnumerable<ClientDto>> SearchClientsAsync(string searchTerm, int userId);
        Task<ClientDto?> GetClientByEmailAsync(string email, int userId);
    }
}
