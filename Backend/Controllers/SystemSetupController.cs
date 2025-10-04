using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace InvoicingBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SystemSetupController : ControllerBase
    {
        private readonly ISystemSetupService _systemSetupService;

        public SystemSetupController(ISystemSetupService systemSetupService)
        {
            _systemSetupService = systemSetupService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetSystemSetup()
            => Ok(await _systemSetupService.GetSystemSetupAsync(GetCurrentUserId()));


        [HttpPost]
        public async Task<IActionResult> UpsertSystemSetup([FromBody] SystemSetupDto dto)
        {
            if (dto == null) return BadRequest("Invalid data.");
            var userId = GetCurrentUserId();
            var resultDto = await _systemSetupService.UpsertSystemSetupAsync(dto, "SystemAdmin", userId);
            return Ok(resultDto);
        }
    }
}
