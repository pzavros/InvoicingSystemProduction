// Interfaces/ISystemSetupService.cs
using InvoicingBackend.DTOs;
using System.Threading.Tasks;

namespace InvoicingBackend.Interfaces
{
    public interface ISystemSetupService
    {
        Task<SystemSetupDto> GetSystemSetupAsync(int userId);
        Task<SystemSetupDto> UpsertSystemSetupAsync(SystemSetupDto dto, string enteredBy, int userId);
    }
}