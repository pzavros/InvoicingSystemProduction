using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvoicingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reports;
        public ReportsController(IReportService reports) => _reports = reports;

        [HttpGet("logistics")]
        [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
        public async Task<IActionResult> GetLogistics([FromQuery] ReportFilterDto filter)
        {
            // Get the logged-in user's ID from the JWT token
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            // Pass the userId to the report service
            Stream excel = await _reports.GenerateLogisticsReportAsync(filter, userId);

            string filename =
                $"LogisticsReport_{filter.From:yyyyMMdd}_{filter.To:yyyyMMdd}.xlsx";

            return File(
                excel,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename
            );
        }
    }
}