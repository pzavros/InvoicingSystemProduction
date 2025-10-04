using System;
using System.IO;
using System.Threading.Tasks;
using InvoicingBackend.DTOs;
using InvoicingBackend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InvoicingBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reports;
        public ReportsController(IReportService reports) => _reports = reports;

        [HttpGet("logistics")]
        [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
        public async Task<IActionResult> GetLogistics([FromQuery] ReportFilterDto filter)
        {
            Stream excel = await _reports.GenerateLogisticsReportAsync(filter);

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