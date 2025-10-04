// Services/SystemSetupService.cs
using InvoicingBackend.Data;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using InvoicingBackend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace InvoicingBackend.Services
{
    public class SystemSetupService : ISystemSetupService
    {
        private readonly ApplicationDbContext _context;

        public SystemSetupService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SystemSetupDto> GetSystemSetupAsync(int userId)
        {
            var dto = await _context.SystemSetups
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .Select(x => new SystemSetupDto {
                    Name        = x.Name,
                    CompanyNo   = x.CompanyNo,
                    VatNo       = x.VatNo,
                    TicNo       = x.TicNo,
                    Website     = x.Website,
                    Email       = x.Email,
                    Logo        = x.Logo,
                    BankName    = x.BankName,
                    AccountName = x.AccountName,
                    AccountNo   = x.AccountNo,
                    Swift       = x.Swift,
                    Iban        = x.Iban,
                    Address = x.Address
                })
                .FirstOrDefaultAsync();

            return dto ?? new SystemSetupDto();
        }

        public async Task<SystemSetupDto> UpsertSystemSetupAsync(SystemSetupDto dto, string enteredBy, int userId)
        {
            var setup = await _context.SystemSetups
                .Where(x => x.UserId == userId)
                .FirstOrDefaultAsync();
                
            if (setup == null)
            {
                setup = new SystemSetup
                {
                    UserId = userId
                };
                _context.SystemSetups.Add(setup);
            }

            // map DTO → entity
            setup.Name        = dto.Name;
            setup.CompanyNo   = dto.CompanyNo;
            setup.VatNo       = dto.VatNo;
            setup.TicNo       = dto.TicNo;
            setup.Website     = dto.Website;
            setup.Email       = dto.Email;
            setup.Logo        = dto.Logo;
            setup.BankName    = dto.BankName;
            setup.AccountName = dto.AccountName;
            setup.AccountNo   = dto.AccountNo;
            setup.Swift       = dto.Swift;
            setup.Iban        = dto.Iban;
            setup.Address = dto.Address;
            setup.EnteredBy   = enteredBy;
            setup.DateEntered = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // map back entity → DTO (or just return dto, since it has the same values)
            return new SystemSetupDto {
                Name        = setup.Name,
                CompanyNo   = setup.CompanyNo,
                VatNo       = setup.VatNo,
                TicNo       = setup.TicNo,
                Website     = setup.Website,
                Email       = setup.Email,
                Logo        = setup.Logo,
                BankName    = setup.BankName,
                AccountName = setup.AccountName,
                AccountNo   = setup.AccountNo,
                Swift       = setup.Swift,
                Iban        = setup.Iban,
                Address = setup.Address
            };
        }
    }
}
 