using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using InvoicingBackend.Interfaces;
using InvoicingBackend.DTOs;
using System.Security.Claims;

namespace InvoicingBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InvoiceTemplatesController : ControllerBase
    {
        private readonly IInvoiceTemplateService _templateService;

        public InvoiceTemplatesController(IInvoiceTemplateService templateService)
        {
            _templateService = templateService;
        }

        // GET: api/invoicetemplates
        [HttpGet]
        public async Task<IActionResult> GetUserTemplates()
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return Unauthorized();

                var templates = await _templateService.GetUserTemplatesAsync(userId.Value);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching templates.", error = ex.Message });
            }
        }

        // GET: api/invoicetemplates/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTemplate(int id)
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return Unauthorized();

                var template = await _templateService.GetTemplateByIdAsync(id, userId.Value);
                if (template == null)
                    return NotFound(new { message = "Template not found." });

                return Ok(template);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the template.", error = ex.Message });
            }
        }

        // GET: api/invoicetemplates/active
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveTemplate()
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return Unauthorized();

                var template = await _templateService.GetActiveTemplateAsync(userId.Value);
                if (template == null)
                    return NotFound(new { message = "No active template found." });

                return Ok(template);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the active template.", error = ex.Message });
            }
        }

        // POST: api/invoicetemplates
        [HttpPost]
        public async Task<IActionResult> CreateTemplate([FromBody] CreateInvoiceTemplateDto createDto)
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return Unauthorized();

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var template = await _templateService.CreateTemplateAsync(createDto, userId.Value);
                return CreatedAtAction(nameof(GetTemplate), new { id = template.Id }, template);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the template.", error = ex.Message });
            }
        }

        // PUT: api/invoicetemplates/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTemplate(int id, [FromBody] UpdateInvoiceTemplateDto updateDto)
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return Unauthorized();

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var template = await _templateService.UpdateTemplateAsync(id, updateDto, userId.Value);
                if (template == null)
                    return NotFound(new { message = "Template not found or cannot be updated." });

                return Ok(template);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the template.", error = ex.Message });
            }
        }

        // DELETE: api/invoicetemplates/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return Unauthorized();

                var success = await _templateService.DeleteTemplateAsync(id, userId.Value);
                if (!success)
                    return NotFound(new { message = "Template not found or cannot be deleted." });

                return Ok(new { message = "Template deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the template.", error = ex.Message });
            }
        }

        // POST: api/invoicetemplates/{id}/set-active
        [HttpPost("{id}/set-active")]
        public async Task<IActionResult> SetActiveTemplate(int id)
        {
            try
            {
                var userId = GetUserId();
                if (userId == null) return Unauthorized();

                var success = await _templateService.SetActiveTemplateAsync(id, userId.Value);
                if (!success)
                    return NotFound(new { message = "Template not found." });

                return Ok(new { message = "Template set as active successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while setting the template as active.", error = ex.Message });
            }
        }

        // GET: api/invoicetemplates/system
        [HttpGet("system")]
        public async Task<IActionResult> GetSystemTemplates()
        {
            try
            {
                var templates = await _templateService.GetSystemTemplatesAsync();
                return Ok(templates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching system templates.", error = ex.Message });
            }
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}
